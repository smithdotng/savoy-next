import { NextResponse } from 'next/server';
import { getMenuCollection } from '@/lib/mongodb';
import { isValidCategory } from '@/lib/categories';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');
  const item = searchParams.get('item');

  if (!category || !item || !isValidCategory(category)) {
    return NextResponse.json({ error: 'Invalid category or item' }, { status: 400 });
  }

  try {
    const collection = await getMenuCollection();
    const priceDoc = await collection.findOne({ category, item }, { projection: { price: 1, _id: 0 } });
    return NextResponse.json({ price: priceDoc ? priceDoc.price : '' });
  } catch (error) {
    console.error('Error fetching price:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
