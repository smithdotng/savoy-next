import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { getReservationsCollection } from '@/lib/mongodb';

// Auth is enforced by proxy.js for this path.
export async function POST(request) {
  const body = await request.json().catch(() => null);
  const id = body?.id;

  if (!id || !ObjectId.isValid(id)) {
    return NextResponse.json({ error: 'Invalid reservation id' }, { status: 400 });
  }

  try {
    const collection = await getReservationsCollection();
    const result = await collection.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Reservation not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Reservation deleted successfully' });
  } catch (error) {
    console.error('Error deleting reservation:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
