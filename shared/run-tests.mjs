// ============================================
// Entry Book - Validation Test Suite
// Uses Node 22 native TypeScript support
// ============================================

import assert from 'node:assert';
import {
  validateEntryForm,
  hasErrors,
  calculateAmounts,
  roundCurrency,
  parseFormToPayload,
  validateImportRow,
  formatCurrency,
  formatDisplayDate,
  getTodayISO
} from './validation/index.ts';

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`  ✓ ${name}`);
    passed++;
  } catch (err) {
    console.error(`  ✗ ${name}: ${err.message}`);
    failed++;
  }
}

console.log('Running Entry Book Shared Validation Tests...\n');

// 1. calculateAmounts
console.log('calculateAmounts:');
test('basic calculation (5 * 100 with 10% discount = 450)', () => {
  const r = calculateAmounts(5, 100, 10);
  assert.strictEqual(r.subtotal, 500);
  assert.strictEqual(r.discount_amount, 50);
  assert.strictEqual(r.final_amount, 450);
});

test('zero discount', () => {
  const r = calculateAmounts(5, 100, 0);
  assert.strictEqual(r.subtotal, 500);
  assert.strictEqual(r.discount_amount, 0);
  assert.strictEqual(r.final_amount, 500);
});

test('100% discount', () => {
  const r = calculateAmounts(5, 100, 100);
  assert.strictEqual(r.subtotal, 500);
  assert.strictEqual(r.discount_amount, 500);
  assert.strictEqual(r.final_amount, 0);
});

test('large numbers', () => {
  const r = calculateAmounts(1000, 50000, 15);
  assert.strictEqual(r.subtotal, 50000000);
  assert.strictEqual(r.discount_amount, 7500000);
  assert.strictEqual(r.final_amount, 42500000);
});

test('decimal prices with rounding', () => {
  const r = calculateAmounts(3, 99.99, 5);
  assert.strictEqual(r.subtotal, 299.97);
  assert.strictEqual(r.discount_amount, 15.00);
  assert.strictEqual(r.final_amount, 284.97);
});

// 2. roundCurrency
console.log('\nroundCurrency:');
test('rounds 10.555 to 10.56', () => {
  assert.strictEqual(roundCurrency(10.555), 10.56);
});

test('rounds 10.554 to 10.55', () => {
  assert.strictEqual(roundCurrency(10.554), 10.55);
});

test('handles 0', () => {
  assert.strictEqual(roundCurrency(0), 0);
});

test('fixes JS float precision (0.1 + 0.2 -> 0.3)', () => {
  assert.strictEqual(roundCurrency(0.1 + 0.2), 0.3);
});

// 3. validateEntryForm
console.log('\nvalidateEntryForm:');
const validForm = {
  name: 'Mithu',
  entry_date: '2026-10-07',
  product: 'Widget A',
  quantity: '5',
  price: '100',
  discount_percent: '10',
};

test('valid form has no errors', () => {
  const errs = validateEntryForm(validForm);
  assert.strictEqual(hasErrors(errs), false);
});

test('missing name produces error', () => {
  const errs = validateEntryForm({ ...validForm, name: '' });
  assert.strictEqual(errs.name, 'Name is required');
});

test('whitespace-only name produces error', () => {
  const errs = validateEntryForm({ ...validForm, name: '   ' });
  assert.strictEqual(errs.name, 'Name is required');
});

test('missing product produces error', () => {
  const errs = validateEntryForm({ ...validForm, product: '' });
  assert.strictEqual(errs.product, 'Product is required');
});

test('missing quantity produces error', () => {
  const errs = validateEntryForm({ ...validForm, quantity: '' });
  assert.strictEqual(errs.quantity, 'Quantity is required');
});

test('zero quantity produces error', () => {
  const errs = validateEntryForm({ ...validForm, quantity: '0' });
  assert.strictEqual(errs.quantity, 'Quantity must be greater than 0');
});

test('negative quantity produces error', () => {
  const errs = validateEntryForm({ ...validForm, quantity: '-3' });
  assert.strictEqual(errs.quantity, 'Quantity must be greater than 0');
});

test('non-integer quantity produces error', () => {
  const errs = validateEntryForm({ ...validForm, quantity: '2.5' });
  assert.strictEqual(errs.quantity, 'Quantity must be a whole number');
});

test('non-numeric quantity produces error', () => {
  const errs = validateEntryForm({ ...validForm, quantity: 'abc' });
  assert.strictEqual(errs.quantity, 'Quantity must be a valid number');
});

test('missing price produces error', () => {
  const errs = validateEntryForm({ ...validForm, price: '' });
  assert.strictEqual(errs.price, 'Price is required');
});

test('negative price produces error', () => {
  const errs = validateEntryForm({ ...validForm, price: '-50' });
  assert.strictEqual(errs.price, 'Price cannot be negative');
});

test('discount > 100 produces error', () => {
  const errs = validateEntryForm({ ...validForm, discount_percent: '105' });
  assert.strictEqual(errs.discount_percent, 'Discount cannot exceed 100%');
});

test('discount < 0 produces error', () => {
  const errs = validateEntryForm({ ...validForm, discount_percent: '-5' });
  assert.strictEqual(errs.discount_percent, 'Discount cannot be negative');
});

test('invalid date format produces error', () => {
  const errs = validateEntryForm({ ...validForm, entry_date: '07-10-2026' });
  assert.strictEqual(errs.entry_date, 'Invalid date format');
});

// 4. parseFormToPayload
console.log('\nparseFormToPayload:');
test('correctly parses and calculates all values', () => {
  const payload = parseFormToPayload({
    name: '  Mithu  ',
    entry_date: '2026-10-07',
    product: '  Widget A  ',
    quantity: '5',
    price: '100',
    discount_percent: '10',
  });
  assert.strictEqual(payload.name, 'Mithu');
  assert.strictEqual(payload.product, 'Widget A');
  assert.strictEqual(payload.quantity, 5);
  assert.strictEqual(payload.price, 100);
  assert.strictEqual(payload.discount_percent, 10);
  assert.strictEqual(payload.subtotal, 500);
  assert.strictEqual(payload.discount_amount, 50);
  assert.strictEqual(payload.final_amount, 450);
});

// 5. validateImportRow
console.log('\nvalidateImportRow:');
test('valid import row produces correct payload', () => {
  const { data, errors } = validateImportRow({
    Name: 'Mithu',
    Date: '2026-10-07',
    Product: 'Widget A',
    Quantity: 5,
    Price: 100,
    'Discount (%)': 10,
  }, 1);
  assert.strictEqual(errors.length, 0);
  assert.strictEqual(data.name, 'Mithu');
  assert.strictEqual(data.final_amount, 450);
});

test('import row with invalid quantity reports error', () => {
  const { errors } = validateImportRow({
    Name: 'Mithu',
    Date: '2026-10-07',
    Product: 'Widget A',
    Quantity: -1,
    Price: 100,
  }, 5);
  assert.ok(errors.some(e => e.field === 'Quantity'));
});

test('import row with missing product reports error', () => {
  const { errors } = validateImportRow({
    Name: 'Mithu',
    Date: '2026-10-07',
    Quantity: 5,
    Price: 100,
  }, 10);
  assert.ok(errors.some(e => e.field === 'Product'));
});

test('import row with missing date reports error', () => {
  const { errors } = validateImportRow({
    Name: 'Mithu',
    Product: 'Widget A',
    Quantity: 5,
    Price: 100,
  }, 11);
  assert.ok(errors.some(e => e.field === 'Date'));
});

// 6. formatCurrency
console.log('\nformatCurrency:');
test('formats currency with rupee symbol', () => {
  const formatted = formatCurrency(450);
  assert.ok(formatted.startsWith('₹'));
  assert.ok(formatted.includes('450.00'));
});

// 7. formatDisplayDate
console.log('\nformatDisplayDate:');
test('formats ISO date for display', () => {
  const formatted = formatDisplayDate('2026-10-07');
  assert.ok(formatted.includes('2026'));
  assert.ok(formatted.includes('10') || formatted.includes('07'));
});

// 8. getTodayISO
console.log('\ngetTodayISO:');
test('returns YYYY-MM-DD format', () => {
  const today = getTodayISO();
  assert.ok(/^\d{4}-\d{2}-\d{2}$/.test(today));
});

console.log(`\n========================================`);
console.log(`Results: ${passed} passed, ${failed} failed`);
console.log(`========================================`);

if (failed > 0) {
  process.exit(1);
}
