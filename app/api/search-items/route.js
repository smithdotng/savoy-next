import { NextResponse } from 'next/server';
import { getMenuCollection } from '@/lib/mongodb';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const term = searchParams.get('term');

  if (!term || term.length < 2) {
    return NextResponse.json({ items: [] });
  }

  try {
    const collection = await getMenuCollection();
    const regex = new RegExp(term, 'i');
    const items = await collection
      .find({ item: regex })
      .project({ category: 1, item: 1, price: 1, imageUrl: 1, _id: 0 })
      .limit(20)
      .toArray();

    return NextResponse.json({ items });
  } catch (error) {
    console.error('Error searching items:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
