'use client';

import { useEffect, useState } from 'react';

export default function PriceUpdateForm({ categories }) {
  const [category, setCategory] = useState('');
  const [items, setItems] = useState([]);
  const [item, setItem] = useState('');
  const [price, setPrice] = useState('');
  const [status, setStatus] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!category) {
      setItems([]);
      return;
    }
    fetch(`/api/items?category=${encodeURIComponent(category)}`)
      .then((res) => res.json())
      .then((data) => setItems(data.items || []))
      .catch(() => setItems([]));
  }, [category]);

  async function handleItemBlur() {
    if (!category || !item) return;
    const exists = items.some((i) => i.item.toLowerCase() === item.toLowerCase());
    if (!exists) return;

    try {
      const res = await fetch(`/api/price?category=${encodeURIComponent(category)}&item=${encodeURIComponent(item)}`);
      const data = await res.json();
      if (data.price) setPrice(data.price);
    } catch (err) {
      // Non-fatal - just skip the price auto-fill.
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setStatus(null);

    try {
      const res = await fetch('/api/process-prices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category, item, price })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error updating price');

      setStatus({ type: 'success', message: data.message });
      setItem('');
      setPrice('');
    } catch (err) {
      setStatus({ type: 'danger', message: err.message });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="admin-form" onSubmit={handleSubmit}>
      <div>
        <select className="admin-input" value={category} onChange={(e) => setCategory(e.target.value)} required>
          <option value="">Select a category</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <input
          className="admin-input"
          type="text"
          placeholder="Item name"
          list="existing-items"
          value={item}
          onChange={(e) => setItem(e.target.value)}
          onBlur={handleItemBlur}
          disabled={!category}
          required
        />
        <datalist id="existing-items">
          {items.map((i) => (
            <option key={i.item} value={i.item} />
          ))}
        </datalist>
      </div>
      <div>
        <input
          className="admin-input"
          type="number"
          min="1"
          step="1"
          placeholder="Price (e.g., 5000)"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          required
        />
      </div>
      {status ? <div className={`admin-alert ${status.type}`}>{status.message}</div> : null}
      <button className="admin-btn" type="submit" disabled={submitting}>
        {submitting ? 'Updating...' : 'Update Price'}
      </button>
    </form>
  );
}
