'use client';

import { useRef, useState } from 'react';

export default function SpreadsheetUpload({ onUploaded }) {
  const formRef = useRef(null);
  const [result, setResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setResult(null);

    const formData = new FormData(formRef.current);

    try {
      const res = await fetch('/api/upload-prices', { method: 'POST', body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error uploading file');

      setResult({ ok: true, data });
      formRef.current.reset();
      if (onUploaded) onUploaded();
    } catch (err) {
      setResult({ ok: false, message: err.message });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="admin-section">
      <h3>Bulk Update via Spreadsheet</h3>
      <form className="admin-form" ref={formRef} onSubmit={handleSubmit}>
        <div>
          <label>Upload Excel File</label>
          <input className="admin-input" type="file" name="spreadsheet" accept=".xlsx,.xls" required />
          <small style={{ display: 'block', marginTop: 5, color: '#666' }}>
            File must be in Excel format (.xlsx, .xls) with columns: category, item, price
          </small>
        </div>
        <button className="admin-btn secondary" type="submit" disabled={submitting}>
          {submitting ? 'Processing...' : 'Upload & Update'}
        </button>
      </form>

      {result?.ok ? (
        <>
          <div className="admin-alert success">
            <strong>Processed {result.data.stats.totalRows} rows</strong>
            <br />
            Successfully updated: {result.data.stats.successfulUpdates}
            <br />
            Failed updates: {result.data.stats.failedUpdates}
          </div>
          {result.data.errors.length > 0 ? (
            <div className="admin-alert warning">
              <strong>Errors:</strong>
              <ul>
                {result.data.errors.map((err, index) => (
                  <li key={index}>
                    {err.error} in row: {JSON.stringify(err.row)}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </>
      ) : null}

      {result && !result.ok ? <div className="admin-alert danger">{result.message}</div> : null}

      <div style={{ marginTop: 15, textAlign: 'center' }}>
        <a className="admin-btn" style={{ background: '#17a2b8', display: 'inline-block', textDecoration: 'none' }} href="/api/download-template">
          Download Template
        </a>
      </div>
    </div>
  );
}
