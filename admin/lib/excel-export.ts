import * as xlsx from 'xlsx';
import { format } from 'date-fns';
import { Entry } from '@shared/types';
import { formatCurrency, formatDisplayDate } from '@shared/validation';

export function exportEntriesToExcel(entries: Entry[]) {
  // Define columns based on requirements
  const header = [
    'Date',
    'Name',
    'Product',
    'Quantity',
    'Price',
    'Discount (%)',
    'Subtotal',
    'Discount Amount',
    'Final Amount',
    'Created At',
    'Created By',
  ];

  let totalQty = 0;
  let totalSubtotal = 0;
  let totalDiscount = 0;
  let totalFinal = 0;

  const data = entries.map((entry) => {
    totalQty += entry.quantity;
    totalSubtotal += entry.subtotal;
    totalDiscount += entry.discount_amount;
    totalFinal += entry.final_amount;

    return [
      entry.entry_date,
      entry.name,
      entry.product,
      entry.quantity,
      entry.price,
      entry.discount_percent,
      entry.subtotal,
      entry.discount_amount,
      entry.final_amount,
      entry.created_at ? formatDisplayDate(entry.created_at) : '',
      entry.created_by || '',
    ];
  });

  // Create workbook and worksheet
  const wb = xlsx.utils.book_new();
  
  // Data Sheet
  const wsData = [header, ...data];
  const ws = xlsx.utils.aoa_to_sheet(wsData);

  // Styling and features
  // 1. Autofit columns (approximate)
  const colWidths = [
    { wch: 12 }, // Date
    { wch: 25 }, // Name
    { wch: 20 }, // Product
    { wch: 10 }, // Quantity
    { wch: 12 }, // Price
    { wch: 12 }, // Discount %
    { wch: 15 }, // Subtotal
    { wch: 15 }, // Discount Amount
    { wch: 15 }, // Final Amount
    { wch: 20 }, // Created At
    { wch: 25 }, // Created By
  ];
  ws['!cols'] = colWidths;

  // 2. Freeze header
  ws['!freeze'] = { xSplit: 0, ySplit: 1, topLeftCell: 'A2', activePane: 'bottomLeft', state: 'frozen' };

  // 3. Autofilter
  ws['!autofilter'] = { ref: `A1:K${data.length + 1}` };

  xlsx.utils.book_append_sheet(wb, ws, 'Entries');

  // Summary Sheet
  const summaryData = [
    ['Metric', 'Value'],
    ['Total Entries', entries.length],
    ['Total Quantity', totalQty],
    ['Total Subtotal', totalSubtotal],
    ['Total Discount', totalDiscount],
    ['Total Final Amount', totalFinal],
  ];
  const wsSummary = xlsx.utils.aoa_to_sheet(summaryData);
  wsSummary['!cols'] = [{ wch: 20 }, { wch: 15 }];
  xlsx.utils.book_append_sheet(wb, wsSummary, 'Summary');

  // Generate filename
  const filename = `entry_book_${format(new Date(), 'yyyy-MM-dd')}.xlsx`;
  
  // Save file
  xlsx.writeFile(wb, filename);
}
