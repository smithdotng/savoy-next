import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { getMenuCollection } from '@/lib/mongodb';
import { isValidCategory } from '@/lib/categories';

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const IMAGE_DIR = path.join(process.cwd(), 'public', 'images', 'menu');

// Auth is enforced by middleware.js for this path.
export async function POST(request) {
  let formData;
  try {
    formData = await request.formData();
  } catch (err) {
    return NextResponse.json({ error: 'Invalid form data' }, { status: 400 });
  }

  const category = formData.get('category');
  const item = formData.get('item');
  const price = formData.get('price');
  const thumbnail = formData.get('thumbnail');

  if (!category || !isValidCategory(category)) {
    return NextResponse.json({ error: 'Invalid category' }, { status: 400 });
  }
  if (!item || typeof item !== 'string' || item.trim() === '') {
    return NextResponse.json({ error: 'Invalid item name' }, { status: 400 });
  }
  if (!price || isNaN(price) || Number(price) <= 0) {
    return NextResponse.json({ error: 'Invalid price' }, { status: 400 });
  }

  let imageUrl;

  if (thumbnail && typeof thumbnail !== 'string' && thumbnail.size > 0) {
    if (!ALLOWED_IMAGE_TYPES.includes(thumbnail.type)) {
      return NextResponse.json(
        { error: 'Only image files (jpeg, png, webp, gif) are allowed!' },
        { status: 400 }
      );
    }
    if (thumbnail.size > MAX_IMAGE_SIZE) {
      return NextResponse.json({ error: 'Thumbnail must be 5MB or smaller' }, { status: 400 });
    }

    try {
      await fs.mkdir(IMAGE_DIR, { recursive: true });
      const ext = path.extname(thumbnail.name) || '';
      const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
      const arrayBuffer = await thumbnail.arrayBuffer();
      await fs.writeFile(path.join(IMAGE_DIR, filename), Buffer.from(arrayBuffer));
      imageUrl = `/images/menu/${filename}`;
    } catch (error) {
      console.error('Error saving thumbnail:', error);
      return NextResponse.json({ error: 'Could not save thumbnail image' }, { status: 500 });
    }
  }

  try {
    const collection = await getMenuCollection();

    const update = {
      $set: {
        price: String(price),
        updatedAt: new Date()
      },
      $setOnInsert: {
        category,
        item: item.trim(),
        createdAt: new Date()
      }
    };

    if (imageUrl) {
      update.$set.imageUrl = imageUrl;
    }

    const result = await collection.updateOne({ category, item: item.trim() }, update, { upsert: true });

    return NextResponse.json({
      message: result.upsertedCount > 0 ? 'Menu item added successfully' : 'Menu item updated successfully',
      result
    });
  } catch (error) {
    console.error('Error adding menu item:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
