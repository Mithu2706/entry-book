import { Entry, EntryFormData } from '@shared/types';
import { validateEntryForm, parseFormToPayload, formatCurrency, hasErrors } from '@shared/validation';
import { useState, useEffect } from 'react';
import { entriesService } from '../services/entries';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface EntryModalProps {
  entry: Entry;
  mode: 'view' | 'edit';
  onClose: () => void;
  onUpdate: () => void;
}

export default function EntryModal({ entry, mode, onClose, onUpdate }: EntryModalProps) {
  const [formData, setFormData] = useState<EntryFormData>({
    name: entry.name,
    entry_date: entry.entry_date,
    product: entry.product,
    quantity: String(entry.quantity),
    price: String(entry.price),
    discount_percent: String(entry.discount_percent),
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const handleChange = (field: keyof EntryFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'view') return;

    const validationErrs = validateEntryForm(formData);
    if (hasErrors(validationErrs)) {
      setErrors(validationErrs as Record<string, string>);
      return;
    }

    setLoading(true);
    try {
      const payload = parseFormToPayload(formData);
      await entriesService.updateEntry(entry.id, payload);
      onUpdate();
      onClose();
    } catch (err: any) {
      alert(err.message || 'Failed to update entry');
    } finally {
      setLoading(false);
    }
  };

  const isView = mode === 'view';

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-dark-card border border-dark-border rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-dark-border">
          <h2 className="text-xl font-bold text-white">
            {isView ? 'View Entry' : 'Edit Entry'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Name</label>
              <input
                type="text"
                disabled={isView}
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className="w-full bg-dark-input border border-dark-border rounded px-3 py-2 text-white disabled:opacity-70"
              />
              {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">Date</label>
              <input
                type="date"
                disabled={isView}
                value={formData.entry_date}
                onChange={(e) => handleChange('entry_date', e.target.value)}
                className="w-full bg-dark-input border border-dark-border rounded px-3 py-2 text-white disabled:opacity-70"
              />
              {errors.entry_date && <p className="text-red-400 text-xs mt-1">{errors.entry_date}</p>}
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">Product</label>
              <input
                type="text"
                disabled={isView}
                value={formData.product}
                onChange={(e) => handleChange('product', e.target.value)}
                className="w-full bg-dark-input border border-dark-border rounded px-3 py-2 text-white disabled:opacity-70"
              />
              {errors.product && <p className="text-red-400 text-xs mt-1">{errors.product}</p>}
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">Quantity</label>
              <input
                type="number"
                disabled={isView}
                value={formData.quantity}
                onChange={(e) => handleChange('quantity', e.target.value)}
                className="w-full bg-dark-input border border-dark-border rounded px-3 py-2 text-white disabled:opacity-70"
              />
              {errors.quantity && <p className="text-red-400 text-xs mt-1">{errors.quantity}</p>}
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">Price</label>
              <input
                type="number"
                disabled={isView}
                value={formData.price}
                onChange={(e) => handleChange('price', e.target.value)}
                className="w-full bg-dark-input border border-dark-border rounded px-3 py-2 text-white disabled:opacity-70"
              />
              {errors.price && <p className="text-red-400 text-xs mt-1">{errors.price}</p>}
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">Discount (%)</label>
              <input
                type="number"
                disabled={isView}
                value={formData.discount_percent}
                onChange={(e) => handleChange('discount_percent', e.target.value)}
                className="w-full bg-dark-input border border-dark-border rounded px-3 py-2 text-white disabled:opacity-70"
              />
              {errors.discount_percent && <p className="text-red-400 text-xs mt-1">{errors.discount_percent}</p>}
            </div>
          </div>

          {isView && (
            <div className="bg-dark-input rounded p-4 grid grid-cols-2 gap-4 border border-dark-border">
              <div>
                <p className="text-sm text-gray-400">Subtotal</p>
                <p className="font-medium text-white">{formatCurrency(entry.subtotal)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Discount Amount</p>
                <p className="font-medium text-white">{formatCurrency(entry.discount_amount)}</p>
              </div>
              <div className="col-span-2 pt-2 border-t border-dark-border mt-2">
                <p className="text-sm text-gray-400">Final Amount</p>
                <p className="text-xl font-bold text-primary">{formatCurrency(entry.final_amount)}</p>
              </div>
            </div>
          )}

          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-dark-input border border-dark-border text-white rounded hover:bg-gray-800 transition-colors"
            >
              {isView ? 'Close' : 'Cancel'}
            </button>
            {!isView && (
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-primary text-dark-bg font-medium rounded hover:bg-teal-400 transition-colors disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
