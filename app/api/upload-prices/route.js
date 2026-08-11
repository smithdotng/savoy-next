import { NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import { getMenuCollection } from '@/lib/mongodb';
import { isValidCategory } from '@/lib/categories';

const ALLOWED_TYPES = [
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-excel'
];

// Auth is enforced by middleware.js for this path.
export async function POST(request) {
  let formData;
  try {
    formData = await request.formData();
  } catch (err) {
    return NextResponse.json({ error: 'Invalid form data' }, { status: 400 });
  }

  const file = formData.get('spreadsheet');

  if (!file || typeof file === 'string') {
    return NextResponse.json(
      { error: 'No file uploaded or invalid file type', acceptedTypes: ['.xlsx', '.xls'] },
      { status: 400 }
    );
  }

  if (file.type && !ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: 'No file uploaded or invalid file type', acceptedTypes: ['.xlsx', '.xls'] },
      { status: 400 }
    );
  }

  let workbook;
  try {
    const arrayBuffer = await file.arrayBuffer();
    workbook = XLSX.read(Buffer.from(arrayBuffer), { type: 'buffer' });
  } catch (error) {
    return NextResponse.json({ error: 'Invalid Excel file' }, { status: 400 });
  }

  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(worksheet);

  const updates = [];
  const errors = [];

  try {
    const collection = await getMenuCollection();

    for (const row of data) {
      if (!row.category || !row.item || !row.price) {
        errors.push({ row, error: 'Missing required fields (category, item, or price)' });
        continue;
      }

      if (!isValidCategory(row.category)) {
        errors.push({ row, error: `Invalid category: ${row.category}` });
        continue;
      }

      if (isNaN(row.price) || Number(row.price) <= 0) {
        errors.push({ row, error: `Invalid price: ${row.price}` });
        continue;
      }

      try {
        const result = await collection.updateOne(
          { category: row.category, item: row.item },
          { $set: { price: String(row.price), updatedAt: new Date() } },
          { upsert: true }
        );
        updates.push({ category: row.category, item: row.item, price: row.price, result });
      } catch (error) {
        errors.push({ row, error: error.message });
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Prices updated successfully',
      stats: {
        totalRows: data.length,
        successfulUpdates: updates.length,
        failedUpdates: errors.length
      },
      results: updates,
      errors
    });
  } catch (error) {
    console.error('Error processing spreadsheet:', error);
    return NextResponse.json(
      {
        error: 'Error processing spreadsheet',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}
