'use client';

import { useState } from 'react';
import ReservationForm from './ReservationForm';

const PHONE_DISPLAY = '+234 (0) 201-295-4999';
const PHONE_TEL = '+2342012954999';

export default function ReservationPanel() {
  const [open, setOpen] = useState(false);

  return (
    <section className="reservation-section">
      <div className="container reservation-toggle-wrap">
        <button
          type="button"
          className={`category-btn reservation-toggle ${open ? 'active' : ''}`}
          onClick={() => setOpen((prev) => !prev)}
          aria-expanded={open}
          aria-controls="reservation-panel-body"
        >
          <span>
            <i className="fa fa-calendar" /> Make a Reservation
          </span>
          <i className={`fa ${open ? 'fa-chevron-up' : 'fa-chevron-down'}`} />
        </button>

        {open ? (
          <div className="reservation-inner" id="reservation-panel-body">
            <div className="reservation-call">
              <h2>Prefer to Talk?</h2>
              <p>Call us directly and our team will book your table right away.</p>
              <a className="call-btn" href={`tel:${PHONE_TEL}`}>
                <i className="fa fa-phone" /> Call {PHONE_DISPLAY}
              </a>
            </div>

            <div className="reservation-form-wrap">
              <h2>Make a Reservation</h2>
              <ReservationForm />
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
