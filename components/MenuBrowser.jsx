'use client';

import { useState } from 'react';

export default function MenuBrowser({ categories, menuData }) {
  const [activeCategory, setActiveCategory] = useState(categories[0]?.id);

  return (
    <>
      <div className="menu-categories">
        {categories.map((category) => (
          <button
            key={category.id}
            type="button"
            className={`category-btn ${activeCategory === category.id ? 'active' : ''}`}
            onClick={() => setActiveCategory(category.id)}
          >
            {category.name}
          </button>
        ))}
      </div>

      <div>
        {categories.map((category) => {
          if (category.id !== activeCategory) return null;
          const items = menuData[category.id]?.items || [];

          return (
            <div className="menu-section" key={category.id}>
              <h2 className="section-title">{category.name}</h2>
              <div className="menu-items">
                {items.length > 0 ? (
                  items.map((item, index) => (
                    <div className="menu-item" key={`${item.item}-${index}`}>
                      {item.imageUrl ? (
                        <img className="item-thumbnail" src={item.imageUrl} alt={item.item} />
                      ) : null}
                      <div className="item-header">
                        <div className="item-name">{item.item}</div>
                        <div className="item-price">&#8358;{item.price}</div>
                      </div>
                      <div className="item-description">{item.description}</div>
                    </div>
                  ))
                ) : (
                  <p style={{ gridColumn: '1 / -1', textAlign: 'center' }}>
                    No items available in this category at the moment.
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
