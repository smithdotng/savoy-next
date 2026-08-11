'use client';

import { forwardRef, useImperativeHandle, useState } from 'react';

const ManageItems = forwardRef(function ManageItems({ categories }, ref) {
  const [category, setCategory] = useState('');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState(null);

  async function loadItems(cat) {
    if (!cat) {
      setItems([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/manage-items?category=${encodeURIComponent(cat)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error loading items');
      setItems(data.items || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useImperativeHandle(ref, () => ({
    refresh: (cat) => loadItems(cat || category)
  }));

  function handleCategoryChange(event) {
    const value = event.target.value;
    setCategory(value);
    loadItems(value);
  }

  async function handleDelete(id) {
    if (!confirm('Are you sure you want to delete this item? This cannot be undone.')) return;

    setDeletingId(id);
    try {
      const res = await fetch('/api/delete-item', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error deleting item');
      loadItems(category);
    } catch (err) {
      alert(err.message);
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="admin-section">
      <h3>Manage Menu Items</h3>
      <div>
        <label>Select Category</label>
        <select className="admin-input" value={category} onChange={handleCategoryChange}>
          <option value="">Select a category</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      {loading ? <p style={{ color: '#666', marginTop: 10 }}>Loading...</p> : null}
      {error ? <div className="admin-alert danger">{error}</div> : null}

      {!loading && category && items.length === 0 ? (
        <p style={{ color: '#666', marginTop: 10 }}>No items in this category yet.</p>
      ) : null}

      {items.map((item) => (
        <div className="admin-item-row" key={item._id}>
          <div className="info">
            {item.imageUrl ? <img src={item.imageUrl} alt={item.item} /> : null}
            <div>
              <strong>{item.item}</strong>
              <br />
              <span style={{ color: '#28a745' }}>&#8358;{item.price}</span>
            </div>
          </div>
          <button
            type="button"
            className="admin-btn danger"
            onClick={() => handleDelete(item._id)}
            disabled={deletingId === item._id}
          >
            {deletingId === item._id ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      ))}
    </div>
  );
});

export default ManageItems;
