import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { getReservationsCollection } from '@/lib/mongodb';
import { sendMail } from '@/lib/mailer';

const RESERVATIONS_EMAIL = 'reservations@savoysummerset.com';
const PHONE_DISPLAY = '+234 (0) 201-295-4999';
const ADDRESS = '43 Isaac John St, Ikeja GRA';

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// Auth is enforced by proxy.js for this path.
export async function POST(request) {
  const body = await request.json().catch(() => null);
  const id = body?.id;

  if (!id || !ObjectId.isValid(id)) {
    return NextResponse.json({ error: 'Invalid reservation id' }, { status: 400 });
  }

  let reservation;
  try {
    const collection = await getReservationsCollection();
    reservation = await collection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: { status: 'confirmed', confirmedAt: new Date() } },
      { returnDocument: 'after' }
    );

    if (!reservation) {
      return NextResponse.json({ error: 'Reservation not found' }, { status: 404 });
    }
  } catch (error) {
    console.error('Error confirming reservation:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }

  const { name, email, date, time, guests } = reservation;

  const subject = `Your reservation at Savoy Summerset is confirmed - ${date} at ${time}`;
  const text = [
    `Dear ${name},`,
    '',
    'Good news - your table reservation at Savoy Summerset has been confirmed.',
    '',
    `Date: ${date}`,
    `Time: ${time}`,
    `Guests: ${guests || 'Not specified'}`,
    '',
    `We look forward to welcoming you at ${ADDRESS}.`,
    '',
    `If you need to change or cancel your booking, please call us on ${PHONE_DISPLAY}`,
    'or reply to this email.',
    '',
    'Warm regards,',
    'Savoy Summerset Hotel'
  ].join('\n');

  const html = `
    <div style="font-family: Arial, Helvetica, sans-serif; color: #232323; line-height: 1.6;">
      <h2 style="color: #232323; text-transform: uppercase; letter-spacing: 1px;">Reservation Confirmed</h2>
      <p>Dear ${escapeHtml(name)},</p>
      <p>Good news &mdash; your table reservation at <strong>Savoy Summerset</strong> has been confirmed.</p>
      <table cellpadding="8" cellspacing="0" border="0" style="border: 1px solid #e1bd85; border-radius: 6px;">
        <tr><td><strong>Date</strong></td><td>${escapeHtml(date)}</td></tr>
        <tr><td><strong>Time</strong></td><td>${escapeHtml(time)}</td></tr>
        <tr><td><strong>Guests</strong></td><td>${escapeHtml(guests || 'Not specified')}</td></tr>
      </table>
      <p>We look forward to welcoming you at ${escapeHtml(ADDRESS)}.</p>
      <p style="font-size: 0.9em; color: #555;">
        Need to change or cancel your booking? Call us on ${escapeHtml(PHONE_DISPLAY)} or simply reply to this email.
      </p>
      <p style="margin-top: 24px;">Warm regards,<br /><strong>Savoy Summerset Hotel</strong></p>
    </div>
  `;

  // Best-effort: the reservation is already confirmed in the database, so an
  // email failure (e.g. SMTP not configured) shouldn't undo that. Report it
  // back so the dashboard can warn the admin to follow up manually.
  try {
    await sendMail({
      to: email,
      subject,
      text,
      html,
      replyTo: RESERVATIONS_EMAIL
    });
  } catch (error) {
    console.error('Error sending confirmation email:', error);
    return NextResponse.json({
      message: 'Reservation confirmed, but the confirmation email could not be sent.',
      emailSent: false
    });
  }

  return NextResponse.json({ message: 'Reservation confirmed', emailSent: true });
}
