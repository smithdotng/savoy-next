import { NextResponse } from 'next/server';
import { sendMail } from '@/lib/mailer';

const RESERVATIONS_EMAIL = 'reservations@savoysummerset.com';

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

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
    return NextResponse.json(
      { error: 'Could not send the reservation request. Please try calling the restaurant instead.' },
      { status: 502 }
    );
  }

  return NextResponse.json({ message: 'Reservation request sent successfully' });
}
