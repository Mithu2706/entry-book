import {
  validateEntryForm,
  calculateAmounts,
  parseFormToPayload,
  validateImportRow,
  roundCurrency,
  formatCurrency,
  getTodayISO
} from '../validation';

describe('Shared Validation', () => {
  describe('calculateAmounts', () => {
    it('calculates correct amounts for basic input', () => {
      const result = calculateAmounts(5, 100, 10);
      expect(result.subtotal).toBe(500);
      expect(result.discount_amount).toBe(50);
      expect(result.final_amount).toBe(450);
    });

    it('handles zero discount', () => {
      const result = calculateAmounts(5, 100, 0);
      expect(result.subtotal).toBe(500);
      expect(result.discount_amount).toBe(0);
      expect(result.final_amount).toBe(500);
    });

    it('handles 100% discount', () => {
      const result = calculateAmounts(5, 100, 100);
      expect(result.subtotal).toBe(500);
      expect(result.discount_amount).toBe(500);
      expect(result.final_amount).toBe(0);
    });

    it('handles large numbers', () => {
      const result = calculateAmounts(1000, 50000, 15);
      expect(result.subtotal).toBe(50000000);
      expect(result.discount_amount).toBe(7500000);
      expect(result.final_amount).toBe(42500000);
    });

    it('handles decimal prices', () => {
      const result = calculateAmounts(3, 99.99, 5);
      expect(result.subtotal).toBe(299.97);
      expect(result.discount_amount).toBe(15);
      expect(result.final_amount).toBe(284.97);
    });
  });

  describe('validateEntryForm', () => {
    const validForm = {
      name: 'John Doe',
      entry_date: '2023-10-01',
      product: 'Apples',
      quantity: '10',
      price: '50.5',
      discount_percent: '5'
    };

    it('returns no errors for valid form', () => {
      const errors = validateEntryForm(validForm);
      expect(Object.keys(errors).length).toBe(0);
    });

    it('fails on missing name', () => {
      const errors = validateEntryForm({ ...validForm, name: '' });
      expect(errors.name).toBe('Name is required');
    });

    it('fails on missing product', () => {
      const errors = validateEntryForm({ ...validForm, product: '   ' });
      expect(errors.product).toBe('Product is required');
    });

    it('fails on missing quantity', () => {
      const errors = validateEntryForm({ ...validForm, quantity: '' });
      expect(errors.quantity).toBe('Quantity is required');
    });

    it('fails on quantity <= 0', () => {
      const errors = validateEntryForm({ ...validForm, quantity: '0' });
      expect(errors.quantity).toBe('Quantity must be greater than 0');
      
      const errorsNegative = validateEntryForm({ ...validForm, quantity: '-5' });
      expect(errorsNegative.quantity).toBe('Quantity must be greater than 0');
    });

    it('fails on negative price', () => {
      const errors = validateEntryForm({ ...validForm, price: '-10' });
      expect(errors.price).toBe('Price cannot be negative');
    });

    it('fails on discount > 100', () => {
      const errors = validateEntryForm({ ...validForm, discount_percent: '101' });
      expect(errors.discount_percent).toBe('Discount cannot exceed 100%');
    });

    it('fails on discount < 0', () => {
      const errors = validateEntryForm({ ...validForm, discount_percent: '-1' });
      expect(errors.discount_percent).toBe('Discount cannot be negative');
    });

    it('fails on invalid date', () => {
      const errors = validateEntryForm({ ...validForm, entry_date: 'not-a-date' });
      expect(errors.entry_date).toBe('Invalid date format');
      
      const errorsInvalid = validateEntryForm({ ...validForm, entry_date: '2023-13-45' });
      expect(errorsInvalid.entry_date).toBe('Invalid date');
    });

    it('fails on non-numeric quantity', () => {
      const errors = validateEntryForm({ ...validForm, quantity: 'abc' });
      expect(errors.quantity).toBe('Quantity must be a valid number');
    });

    it('fails on non-numeric price', () => {
      const errors = validateEntryForm({ ...validForm, price: 'free' });
      expect(errors.price).toBe('Price must be a valid number');
    });
  });

  describe('parseFormToPayload', () => {
    it('correctly parses and calculates', () => {
      const form = {
        name: ' John Doe ',
        entry_date: '2023-10-01',
        product: ' Apples ',
        quantity: '10',
        price: '50.5',
        discount_percent: '5'
      };
      
      const result = parseFormToPayload(form);
      expect(result.name).toBe('John Doe'); // Trims whitespace
      expect(result.product).toBe('Apples'); // Trims whitespace
      expect(result.quantity).toBe(10);
      expect(result.price).toBe(50.5);
      expect(result.discount_percent).toBe(5);
      expect(result.subtotal).toBe(505);
      expect(result.discount_amount).toBe(25.25);
      expect(result.final_amount).toBe(479.75);
    });
  });

  describe('validateImportRow', () => {
    it('validates a valid row successfully', () => {
      const row = {
        Name: 'Jane Smith',
        Date: '2023-10-15',
        Product: 'Oranges',
        Quantity: '20',
        Price: '30',
        Discount: '10'
      };
      
      const result = validateImportRow(row, 1);
      expect(result.errors.length).toBe(0);
      expect(result.data.name).toBe('Jane Smith');
      expect(result.data.subtotal).toBe(600);
      expect(result.data.final_amount).toBe(540);
    });

    it('detects missing required fields', () => {
      const row = {};
      const result = validateImportRow(row, 2);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors.some(e => e.field === 'Name')).toBe(true);
      expect(result.errors.some(e => e.field === 'Date')).toBe(true);
      expect(result.errors.some(e => e.field === 'Product')).toBe(true);
      expect(result.errors.some(e => e.field === 'Quantity')).toBe(true);
      expect(result.errors.some(e => e.field === 'Price')).toBe(true);
    });

    it('fails on invalid quantity', () => {
      const row = {
        Name: 'Test',
        Date: '2023-01-01',
        Product: 'Test',
        Quantity: '-5',
        Price: '10'
      };
      const result = validateImportRow(row, 3);
      expect(result.errors.some(e => e.field === 'Quantity')).toBe(true);
    });

    it('fails on invalid price', () => {
      const row = {
        Name: 'Test',
        Date: '2023-01-01',
        Product: 'Test',
        Quantity: '5',
        Price: 'abc'
      };
      const result = validateImportRow(row, 4);
      expect(result.errors.some(e => e.field === 'Price')).toBe(true);
    });

    it('fails on invalid discount range', () => {
      const row = {
        Name: 'Test',
        Date: '2023-01-01',
        Product: 'Test',
        Quantity: '5',
        Price: '10',
        Discount: '150'
      };
      const result = validateImportRow(row, 5);
      expect(result.errors.some(e => e.field === 'Discount')).toBe(true);
    });
  });

  describe('roundCurrency', () => {
    it('rounds to 2 decimal places', () => {
      expect(roundCurrency(10.555)).toBe(10.56);
      expect(roundCurrency(10.554)).toBe(10.55);
    });

    it('handles edge cases', () => {
      expect(roundCurrency(0)).toBe(0);
      expect(roundCurrency(0.1 + 0.2)).toBe(0.3); // JS float precision issue
    });
  });

  describe('formatCurrency', () => {
    it('formats with ₹ symbol and 2 decimal places', () => {
      expect(formatCurrency(1234.5)).toMatch(/^₹.*1,234\.50$/); // Use regex to handle potential locale spaces
      expect(formatCurrency(0)).toMatch(/^₹.*0\.00$/);
    });
  });

  describe('getTodayISO', () => {
    it('returns YYYY-MM-DD format', () => {
      const result = getTodayISO();
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });
});
