import { NextResponse } from 'next/server';
import { sendMail } from '@/lib/mailer';
import { getReservationsCollection } from '@/lib/mongodb';
import { getSession } from '@/lib/session';

const RESERVATIONS_EMAIL = 'reservations@savoysummerset.com';

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// Public: customers submit reservation requests here. No auth required.
export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch (err) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const { name, phone, email, date, time, guests, message } = body || {};

  if (!name || !phone || !email || !date || !time) {
    return NextResponse.json(
      { error: 'Name, phone, email, date, and time are required' },
      { status: 400 }
    );
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(email)) {
    return NextResponse.json({ error: 'Please provide a valid email address' }, { status: 400 });
  }

  const reservation = {
    name,
    phone,
    email,
    date,
    time,
    guests: guests || null,
    message: message || '',
    status: 'pending',
    createdAt: new Date()
  };

  // Save first so the reservation shows up in the admin dashboard even if
  // the notification email below fails to send (e.g. SMTP not configured).
  try {
    const collection = await getReservationsCollection();
    await collection.insertOne(reservation);
  } catch (error) {
    console.error('Error saving reservation:', error);
    return NextResponse.json(
      { error: 'Could not save your reservation. Please try calling the restaurant instead.' },
      { status: 500 }
    );
  }

  const subject = `New Reservation Request - ${name} (${date} ${time})`;
  const text = [
    'A new reservation request was submitted from the Savoy Summerset menu app.',
    '',
    `Name: ${name}`,
    `Phone: ${phone}`,
    `Email: ${email}`,
    `Date: ${date}`,
    `Time: ${time}`,
    `Guests: ${guests || 'Not specified'}`,
    `Special requests: ${message || 'None'}`
  ].join('\n');

  const html = `
    <h2>New Reservation Request</h2>
    <p>Submitted from the Savoy Summerset menu app.</p>
    <table cellpadding="6" cellspacing="0" border="0">
      <tr><td><strong>Name</strong></td><td>${escapeHtml(name)}</td></tr>
      <tr><td><strong>Phone</strong></td><td>${escapeHtml(phone)}</td></tr>
      <tr><td><strong>Email</strong></td><td>${escapeHtml(email)}</td></tr>
      <tr><td><strong>Date</strong></td><td>${escapeHtml(date)}</td></tr>
      <tr><td><strong>Time</strong></td><td>${escapeHtml(time)}</td></tr>
      <tr><td><strong>Guests</strong></td><td>${escapeHtml(guests || 'Not specified')}</td></tr>
      <tr><td><strong>Special requests</strong></td><td>${escapeHtml(message || 'None')}</td></tr>
    </table>
  `;

  // Best-effort: the reservation is already saved and visible in the admin
  // dashboard, so an email failure shouldn't fail the whole request.
  try {
    await sendMail({
      to: RESERVATIONS_EMAIL,
      subject,
      text,
      html,
      replyTo: email
    });
  } catch (error) {
    console.error('Error sending reservation email:', error);
  }

  return NextResponse.json({ message: 'Reservation request sent successfully' });
}

// Admin-only: list reservations for the dashboard. Not covered by
// proxy.js (which is path-prefix based and would otherwise also lock down
// the public POST above), so the auth check happens here instead.
export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const collection = await getReservationsCollection();
    const reservations = await collection.find({}).sort({ createdAt: -1 }).limit(200).toArray();
    const serialized = reservations.map((r) => ({
      ...r,
      _id: r._id.toString(),
      status: r.status || 'pending',
      createdAt: r.createdAt ? r.createdAt.toISOString() : null,
      confirmedAt: r.confirmedAt ? r.confirmedAt.toISOString() : null
    }));

    return NextResponse.json({ reservations: serialized });
  } catch (error) {
    console.error('Error fetching reservations:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
