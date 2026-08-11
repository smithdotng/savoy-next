'use client';

import { useEffect, useState } from 'react';

function formatSubmittedAt(iso) {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleString();
  } catch (err) {
    return iso;
  }
}

export default function ReservationsList() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [confirmingId, setConfirmingId] = useState(null);
  const [notice, setNotice] = useState(null);

  async function loadReservations() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/reservations');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error loading reservations');
      setReservations(data.reservations || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadReservations();
  }, []);

  async function handleConfirm(id, guestEmail) {
    setConfirmingId(id);
    setNotice(null);
    try {
      const res = await fetch('/api/confirm-reservation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error confirming reservation');
      setReservations((prev) =>
        prev.map((r) => (r._id === id ? { ...r, status: 'confirmed', confirmedAt: new Date().toISOString() } : r))
      );
      setNotice(
        data.emailSent
          ? { type: 'success', text: `Reservation confirmed. A confirmation email was sent to ${guestEmail}.` }
          : {
              type: 'warning',
              text: `Reservation confirmed, but the confirmation email to ${guestEmail} could not be sent. Please contact the guest directly.`
            }
      );
    } catch (err) {
      setNotice({ type: 'danger', text: err.message });
    } finally {
      setConfirmingId(null);
    }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this reservation? This cannot be undone.')) return;

    setDeletingId(id);
    try {
      const res = await fetch('/api/delete-reservation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error deleting reservation');
      setReservations((prev) => prev.filter((r) => r._id !== id));
    } catch (err) {
      alert(err.message);
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="admin-section">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <h3 style={{ marginBottom: 0 }}>Reservations</h3>
        <button type="button" className="admin-btn" style={{ padding: '8px 14px', fontSize: 14 }} onClick={loadReservations} disabled={loading}>
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {error ? <div className="admin-alert danger">{error}</div> : null}

      {notice ? <div className={`admin-alert ${notice.type}`}>{notice.text}</div> : null}

      {!loading && reservations.length === 0 && !error ? (
        <p style={{ color: '#666' }}>No reservation requests yet.</p>
      ) : null}

      {reservations.map((r) => {
        const isConfirmed = r.status === 'confirmed';
        return (
          <div className="admin-item-row" key={r._id} style={{ alignItems: 'flex-start', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', gap: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <strong>{r.name}</strong>
                <span
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    padding: '3px 10px',
                    borderRadius: 20,
                    color: isConfirmed ? '#1e7e34' : '#8a6d3b',
                    backgroundColor: isConfirmed ? '#e6f4ea' : '#fcf8e3'
                  }}
                >
                  {isConfirmed ? 'Confirmed' : 'Pending'}
                </span>
              </div>
              <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                {!isConfirmed ? (
                  <button
                    type="button"
                    className="admin-btn secondary"
                    onClick={() => handleConfirm(r._id, r.email)}
                    disabled={confirmingId === r._id}
                  >
                    {confirmingId === r._id ? 'Confirming...' : 'Confirm'}
                  </button>
                ) : null}
                <button
                  type="button"
                  className="admin-btn danger"
                  onClick={() => handleDelete(r._id)}
                  disabled={deletingId === r._id}
                >
                  {deletingId === r._id ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
            <div style={{ fontSize: '0.9rem', color: '#444' }}>
              <div>
                <i className="fa fa-calendar" /> {r.date} at {r.time} &nbsp;·&nbsp; <i className="fa fa-users" /> {r.guests || 'Not specified'} guest(s)
              </div>
              <div>
                <i className="fa fa-phone" /> {r.phone} &nbsp;·&nbsp; <i className="fa fa-envelope" /> {r.email}
              </div>
              {r.message ? (
                <div style={{ marginTop: 4 }}>
                  <i className="fa fa-comment" /> {r.message}
                </div>
              ) : null}
              <div style={{ marginTop: 4, color: '#999', fontSize: '0.8rem' }}>
                Submitted {formatSubmittedAt(r.createdAt)}
                {isConfirmed && r.confirmedAt ? <> &nbsp;·&nbsp; Confirmed {formatSubmittedAt(r.confirmedAt)}</> : null}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
