'use client';

import { useState } from 'react';

const initialState = {
  name: '',
  phone: '',
  email: '',
  date: '',
  time: '',
  guests: '2',
  message: ''
};

export default function ReservationForm() {
  const [form, setForm] = useState(initialState);
  const [status, setStatus] = useState(null); // { type: 'success' | 'error', message }
  const [submitting, setSubmitting] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setStatus(null);

    try {
      const res = await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Something went wrong sending your request.');
      }

      setStatus({ type: 'success', message: "Reservation request sent! We'll confirm with you shortly." });
      setForm(initialState);
    } catch (err) {
      setStatus({ type: 'error', message: err.message || 'Could not send your request. Please try calling us instead.' });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="reservation-form" onSubmit={handleSubmit}>
      <div>
        <label htmlFor="res-name">Full Name</label>
        <input id="res-name" name="name" type="text" value={form.name} onChange={handleChange} required />
      </div>
      <div>
        <label htmlFor="res-phone">Phone Number</label>
        <input id="res-phone" name="phone" type="tel" value={form.phone} onChange={handleChange} required />
      </div>
      <div className="full-width">
        <label htmlFor="res-email">Email Address</label>
        <input id="res-email" name="email" type="email" value={form.email} onChange={handleChange} required />
      </div>
      <div>
        <label htmlFor="res-date">Date</label>
        <input id="res-date" name="date" type="date" value={form.date} onChange={handleChange} required />
      </div>
      <div>
        <label htmlFor="res-time">Time</label>
        <input id="res-time" name="time" type="time" value={form.time} onChange={handleChange} required />
      </div>
      <div className="full-width">
        <label htmlFor="res-guests">Number of Guests</label>
        <select id="res-guests" name="guests" value={form.guests} onChange={handleChange}>
          {Array.from({ length: 12 }, (_, i) => i + 1).map((n) => (
            <option key={n} value={n}>
              {n} {n === 1 ? 'Guest' : 'Guests'}
            </option>
          ))}
        </select>
      </div>
      <div className="full-width">
        <label htmlFor="res-message">Special Requests (optional)</label>
        <textarea id="res-message" name="message" value={form.message} onChange={handleChange} />
      </div>

      {status ? <div className={`reservation-status ${status.type}`}>{status.message}</div> : null}

      <button type="submit" className="reservation-submit" disabled={submitting}>
        {submitting ? 'Sending...' : 'Request Reservation'}
      </button>
    </form>
  );
}
