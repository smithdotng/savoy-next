import { NextResponse } from 'next/server';
import { getMenuCollection } from '@/lib/mongodb';
import { isValidCategory } from '@/lib/categories';

// Auth is enforced by middleware.js for this path.
export async function POST(request) {
  const body = await request.json().catch(() => null);
  const { category, item, price } = body || {};

  if (!category || !isValidCategory(category)) {
    return NextResponse.json({ error: 'Invalid category' }, { status: 400 });
  }
  if (!item || typeof item !== 'string' || item.trim() === '') {
    return NextResponse.json({ error: 'Invalid item' }, { status: 400 });
  }
  if (!price || isNaN(price) || Number(price) <= 0) {
    return NextResponse.json({ error: 'Invalid price' }, { status: 400 });
  }

  try {
    const collection = await getMenuCollection();
    await collection.updateOne(
      { category, item },
      { $set: { price: String(price), updatedAt: new Date() } },
      { upsert: true }
    );
    return NextResponse.json({ message: 'Price updated successfully' });
  } catch (error) {
    console.error('Error updating price:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
