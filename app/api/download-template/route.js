import { NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import { categories } from '@/lib/categories';

export async function GET() {
  try {
    const workbook = XLSX.utils.book_new();

    const sampleData = [
      {
        category: 'breakfast',
        item: 'Continental Breakfast',
        price: 5000,
        _note: 'Category must be one of: ' + categories.map((c) => c.id).join(', ')
      },
      {
        category: 'cb',
        item: 'Grilled Chicken',
        price: 7500,
        _note: 'Price should be in numbers only'
      }
    ];

    const worksheet = XLSX.utils.json_to_sheet(sampleData);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Prices');

    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Disposition': 'attachment; filename="menu_prices_template.xlsx"',
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      }
    });
  } catch (error) {
    console.error('Error generating template:', error);
    return NextResponse.json({ error: 'Error generating template' }, { status: 500 });
  }
}
