import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { ObjectId } from 'mongodb';
import { getMenuCollection } from '@/lib/mongodb';

// Auth is enforced by middleware.js for this path.
export async function POST(request) {
  const body = await request.json().catch(() => null);
  const id = body?.id;

  if (!id || !ObjectId.isValid(id)) {
    return NextResponse.json({ error: 'Invalid item id' }, { status: 400 });
  }

  try {
    const collection = await getMenuCollection();
    const itemDoc = await collection.findOne({ _id: new ObjectId(id) });

    if (!itemDoc) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    await collection.deleteOne({ _id: new ObjectId(id) });

    if (itemDoc.imageUrl) {
      const imagePath = path.join(process.cwd(), 'public', itemDoc.imageUrl);
      fs.unlink(imagePath).catch((err) => console.error('Error deleting image file:', err));
    }

    return NextResponse.json({ message: 'Menu item deleted successfully' });
  } catch (error) {
    console.error('Error deleting menu item:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
