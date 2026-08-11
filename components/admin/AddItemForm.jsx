'use client';

import { useRef, useState } from 'react';

export default function AddItemForm({ categories, onItemAdded }) {
  const formRef = useRef(null);
  const [status, setStatus] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setStatus(null);

    const formData = new FormData(formRef.current);

    try {
      const res = await fetch('/api/add-item', { method: 'POST', body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error adding item');

      setStatus({ type: 'success', message: data.message });
      formRef.current.reset();
      if (onItemAdded) onItemAdded(formData.get('category'));
    } catch (err) {
      setStatus({ type: 'danger', message: err.message });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="admin-section">
      <h3>Add New Menu Item</h3>
      <form className="admin-form" ref={formRef} onSubmit={handleSubmit}>
        <div>
          <label>Category</label>
          <select className="admin-input" name="category" required>
            <option value="">Select a category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label>Item Name</label>
          <input className="admin-input" type="text" name="item" placeholder="e.g., Jollof Rice" required />
        </div>
        <div>
          <label>Price</label>
          <input className="admin-input" type="number" name="price" min="1" step="1" placeholder="e.g., 5000" required />
        </div>
        <div>
          <label>Thumbnail Picture (optional)</label>
          <input className="admin-input" type="file" name="thumbnail" accept="image/*" />
        </div>
        {status ? <div className={`admin-alert ${status.type}`}>{status.message}</div> : null}
        <button className="admin-btn secondary" type="submit" disabled={submitting}>
          {submitting ? 'Adding...' : 'Add Item'}
        </button>
      </form>
    </div>
  );
}
