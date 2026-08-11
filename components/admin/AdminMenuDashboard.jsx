'use client';

import { useRef } from 'react';
import PriceUpdateForm from './PriceUpdateForm';
import AddItemForm from './AddItemForm';
import SpreadsheetUpload from './SpreadsheetUpload';
import ManageItems from './ManageItems';

export default function AdminMenuDashboard({ categories }) {
  const manageItemsRef = useRef(null);

  return (
    <>
      <h1>Update Menu</h1>
      <PriceUpdateForm categories={categories} />

      <AddItemForm categories={categories} onItemAdded={(category) => manageItemsRef.current?.refresh(category)} />

      <SpreadsheetUpload onUploaded={() => manageItemsRef.current?.refresh()} />

      <ManageItems categories={categories} ref={manageItemsRef} />
    </>
  );
}
