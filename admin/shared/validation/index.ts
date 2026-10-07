// ============================================
// Entry Book - Shared Validation
// ============================================

import type { EntryFormData, EntryCreatePayload, ImportError } from '../types';

/** Validation error map */
export type ValidationErrors = Partial<Record<keyof EntryFormData, string>>;

/**
 * Validate entry form data
 * Returns an object with field-level error messages, or empty object if valid
 */
export function validateEntryForm(data: EntryFormData): ValidationErrors {
  const errors: ValidationErrors = {};

  // Name
  const name = (data.name || '').trim();
  if (!name) {
    errors.name = 'Name is required';
  } else if (name.length > 200) {
    errors.name = 'Name must be 200 characters or less';
  }

  // Date
  if (!data.entry_date) {
    errors.entry_date = 'Date is required';
  } else {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(data.entry_date)) {
      errors.entry_date = 'Invalid date format';
    } else {
      const parsed = new Date(data.entry_date);
      if (isNaN(parsed.getTime())) {
        errors.entry_date = 'Invalid date';
      }
    }
  }

  // Product
  const product = (data.product || '').trim();
  if (!product) {
    errors.product = 'Product is required';
  } else if (product.length > 200) {
    errors.product = 'Product must be 200 characters or less';
  }

  // Quantity
  const quantity = parseFloat(data.quantity);
  if (!data.quantity || data.quantity.trim() === '') {
    errors.quantity = 'Quantity is required';
  } else if (isNaN(quantity) || !isFinite(quantity)) {
    errors.quantity = 'Quantity must be a valid number';
  } else if (quantity <= 0) {
    errors.quantity = 'Quantity must be greater than 0';
  } else if (!Number.isInteger(quantity)) {
    errors.quantity = 'Quantity must be a whole number';
  }

  // Price
  const price = parseFloat(data.price);
  if (!data.price || data.price.trim() === '') {
    errors.price = 'Price is required';
  } else if (isNaN(price) || !isFinite(price)) {
    errors.price = 'Price must be a valid number';
  } else if (price < 0) {
    errors.price = 'Price cannot be negative';
  }

  // Discount
  const discount = parseFloat(data.discount_percent || '0');
  if (data.discount_percent && data.discount_percent.trim() !== '') {
    if (isNaN(discount) || !isFinite(discount)) {
      errors.discount_percent = 'Discount must be a valid number';
    } else if (discount < 0) {
      errors.discount_percent = 'Discount cannot be negative';
    } else if (discount > 100) {
      errors.discount_percent = 'Discount cannot exceed 100%';
    }
  }

  return errors;
}

/**
 * Check if validation result has any errors
 */
export function hasErrors(errors: ValidationErrors): boolean {
  return Object.keys(errors).length > 0;
}

/**
 * Calculate monetary values from form inputs
 */
export function calculateAmounts(
  quantity: number,
  price: number,
  discountPercent: number
): { subtotal: number; discount_amount: number; final_amount: number } {
  const subtotal = roundCurrency(quantity * price);
  const discount_amount = roundCurrency(subtotal * discountPercent / 100);
  const final_amount = roundCurrency(subtotal - discount_amount);

  return { subtotal, discount_amount, final_amount };
}

/**
 * Round to 2 decimal places for currency
 */
export function roundCurrency(value: number): number {
  return Math.round(value * 100) / 100;
}

/**
 * Parse form data into a submission payload with calculated amounts
 */
export function parseFormToPayload(data: EntryFormData): EntryCreatePayload {
  const quantity = parseInt(data.quantity, 10);
  const price = parseFloat(data.price);
  const discountPercent = parseFloat(data.discount_percent || '0');

  const { subtotal, discount_amount, final_amount } = calculateAmounts(
    quantity,
    price,
    discountPercent
  );

  return {
    name: data.name.trim(),
    entry_date: data.entry_date,
    product: data.product.trim(),
    quantity,
    price: roundCurrency(price),
    discount_percent: roundCurrency(discountPercent),
    subtotal,
    discount_amount,
    final_amount,
  };
}

/**
 * Validate a row from Excel import
 */
export function validateImportRow(
  row: Record<string, unknown>,
  rowNumber: number
): { data: Partial<EntryCreatePayload>; errors: ImportError[] } {
  const errors: ImportError[] = [];

  const name = String(row['Name'] || row['name'] || '').trim();
  if (!name) {
    errors.push({ row: rowNumber, field: 'Name', message: 'Name is required' });
  }

  const dateRaw = row['Date'] || row['date'] || row['entry_date'];
  let entry_date = '';
  if (!dateRaw) {
    errors.push({ row: rowNumber, field: 'Date', message: 'Date is required' });
  } else {
    const parsed = parseDateValue(dateRaw);
    if (!parsed) {
      errors.push({ row: rowNumber, field: 'Date', message: 'Invalid date format' });
    } else {
      entry_date = parsed;
    }
  }

  const product = String(row['Product'] || row['product'] || '').trim();
  if (!product) {
    errors.push({ row: rowNumber, field: 'Product', message: 'Product is required' });
  }

  const quantityRaw = row['Quantity'] || row['quantity'];
  const quantity = Number(quantityRaw);
  if (quantityRaw === undefined || quantityRaw === null || quantityRaw === '') {
    errors.push({ row: rowNumber, field: 'Quantity', message: 'Quantity is required' });
  } else if (isNaN(quantity) || !isFinite(quantity)) {
    errors.push({ row: rowNumber, field: 'Quantity', message: 'Quantity must be a valid number' });
  } else if (quantity <= 0) {
    errors.push({ row: rowNumber, field: 'Quantity', message: 'Quantity must be greater than 0' });
  }

  const priceRaw = row['Price'] || row['price'];
  const price = Number(priceRaw);
  if (priceRaw === undefined || priceRaw === null || priceRaw === '') {
    errors.push({ row: rowNumber, field: 'Price', message: 'Price is required' });
  } else if (isNaN(price) || !isFinite(price)) {
    errors.push({ row: rowNumber, field: 'Price', message: 'Price must be a valid number' });
  } else if (price < 0) {
    errors.push({ row: rowNumber, field: 'Price', message: 'Price cannot be negative' });
  }

  const discountRaw = row['Discount (%)'] || row['discount_percent'] || row['Discount'] || 0;
  const discount_percent = Number(discountRaw);
  if (isNaN(discount_percent) || !isFinite(discount_percent)) {
    errors.push({ row: rowNumber, field: 'Discount', message: 'Discount must be a valid number' });
  } else if (discount_percent < 0 || discount_percent > 100) {
    errors.push({ row: rowNumber, field: 'Discount', message: 'Discount must be between 0 and 100' });
  }

  let data: Partial<EntryCreatePayload> = {};
  if (errors.length === 0) {
    const amounts = calculateAmounts(quantity, price, discount_percent);
    data = {
      name,
      entry_date,
      product,
      quantity,
      price: roundCurrency(price),
      discount_percent: roundCurrency(discount_percent),
      ...amounts,
    };
  }

  return { data, errors };
}

/**
 * Parse various date formats from Excel into YYYY-MM-DD
 */
function parseDateValue(value: unknown): string | null {
  if (!value) return null;

  // If it's already a Date object (Excel serial dates get parsed by xlsx)
  if (value instanceof Date) {
    if (isNaN(value.getTime())) return null;
    return formatDate(value);
  }

  const str = String(value).trim();

  // YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
    const d = new Date(str);
    return isNaN(d.getTime()) ? null : str;
  }

  // DD/MM/YYYY or DD-MM-YYYY
  const dmyMatch = str.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
  if (dmyMatch) {
    const [, day, month, year] = dmyMatch;
    const d = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    return isNaN(d.getTime()) ? null : formatDate(d);
  }

  // MM/DD/YYYY
  const mdyMatch = str.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
  if (mdyMatch) {
    // Already handled by DMY above - ambiguous, treat as DMY by default
    return null;
  }

  // Excel serial number
  const num = Number(str);
  if (!isNaN(num) && num > 0 && num < 100000) {
    // Excel date serial number (days since 1899-12-30)
    const excelEpoch = new Date(1899, 11, 30);
    const d = new Date(excelEpoch.getTime() + num * 86400000);
    return isNaN(d.getTime()) ? null : formatDate(d);
  }

  // Try generic parse
  const generic = new Date(str);
  return isNaN(generic.getTime()) ? null : formatDate(generic);
}

function formatDate(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Format a number as Indian Rupee currency string
 */
export function formatCurrency(amount: number): string {
  return `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/**
 * Format a date string for display
 */
export function formatDisplayDate(dateStr: string): string {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

/**
 * Get today's date as YYYY-MM-DD
 */
export function getTodayISO(): string {
  return formatDate(new Date());
}
