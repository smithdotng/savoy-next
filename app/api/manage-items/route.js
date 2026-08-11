import { NextResponse } from 'next/server';
import { getMenuCollection } from '@/lib/mongodb';
import { isValidCategory } from '@/lib/categories';

// Auth is enforced by middleware.js for this path.
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');

  if (!category || !isValidCategory(category)) {
    return NextResponse.json({ error: 'Invalid category' }, { status: 400 });
  }

  try {
    const collection = await getMenuCollection();
    const items = await collection
      .find({ category })
      .project({ item: 1, price: 1, imageUrl: 1 })
      .sort({ item: 1 })
      .toArray();

    // _id is a MongoDB ObjectId - stringify it so it serializes cleanly to JSON.
    const serialized = items.map((item) => ({ ...item, _id: item._id.toString() }));

    return NextResponse.json({ items: serialized });
  } catch (error) {
    console.error('Error fetching items for management:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
