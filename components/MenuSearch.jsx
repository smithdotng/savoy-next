'use client';

import { useEffect, useRef, useState } from 'react';

export default function MenuSearch({ categories }) {
  const [term, setTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [results, setResults] = useState([]);
  const debounceRef = useRef(null);
  const wrapRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapRef.current && !wrapRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function handleChange(event) {
    const value = event.target.value;
    setTerm(value);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (value.trim().length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search-items?term=${encodeURIComponent(value)}`);
        const data = await res.json();
        setSuggestions(data.items || []);
        setShowSuggestions(true);
      } catch (err) {
        setSuggestions([]);
      }
    }, 250);
  }

  function categoryName(id) {
    return categories.find((c) => c.id === id)?.name || id;
  }

  function selectItem(item) {
    setResults((prev) => [item, ...prev]);
    setTerm('');
    setSuggestions([]);
    setShowSuggestions(false);
  }

  return (
    <div className="search-container">
      <h2 className="search-title">Find Menu Items</h2>
      <div className="search-input-wrap" ref={wrapRef}>
        <input
          type="text"
          className="search-input"
          placeholder="Search by item name..."
          autoComplete="off"
          value={term}
          onChange={handleChange}
          onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
        />
        {showSuggestions && suggestions.length > 0 ? (
          <ul className="search-suggestions">
            {suggestions.map((item, index) => (
              <li key={`${item.item}-${index}`} onClick={() => selectItem(item)}>
                <span>{item.item}</span>
                <small>{categoryName(item.category)}</small>
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      {results.length > 0 ? (
        <div className="search-results">
          <table className="search-results-table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Category</th>
                <th>Price</th>
              </tr>
            </thead>
            <tbody>
              {results.map((item, index) => (
                <tr key={`${item.item}-${index}`}>
                  <td>{item.item}</td>
                  <td className="search-category">{categoryName(item.category)}</td>
                  <td className="search-price">&#8358;{item.price}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  );
}
