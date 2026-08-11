import { NextResponse } from 'next/server';
import { getMenuCollection } from '@/lib/mongodb';
import { isValidCategory } from '@/lib/categories';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');

  if (!category || !isValidCategory(category)) {
    return NextResponse.json({ error: 'Invalid category' }, { status: 400 });
  }

  try {
    const collection = await getMenuCollection();
    const items = await collection.find({ category }).project({ item: 1, _id: 0 }).toArray();
    return NextResponse.json({ items });
  } catch (error) {
    console.error('Error fetching items:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
