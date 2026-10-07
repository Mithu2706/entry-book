import { EntryFilters } from '@shared/types';
import { useState } from 'react';

interface FilterBarProps {
  products: string[];
  filters: EntryFilters;
  onFilterChange: (filters: EntryFilters) => void;
}

export default function FilterBar({ products, filters, onFilterChange }: FilterBarProps) {
  const [localFilters, setLocalFilters] = useState<EntryFilters>(filters);

  const handleChange = (key: keyof EntryFilters, value: any) => {
    const updated = { ...localFilters, [key]: value };
    setLocalFilters(updated);
  };

  const applyFilters = () => {
    onFilterChange({ ...localFilters, page: 1 });
  };

  const clearFilters = () => {
    const cleared = { page: 1, page_size: filters.page_size };
    setLocalFilters(cleared);
    onFilterChange(cleared);
  };

  return (
    <div className="bg-dark-card border border-dark-border rounded-lg p-4 mb-6 flex flex-wrap gap-4 items-end">
      <div className="flex-1 min-w-[200px]">
        <label className="block text-xs font-medium text-gray-400 mb-1">Search</label>
        <input
          type="text"
          value={localFilters.search || ''}
          onChange={(e) => handleChange('search', e.target.value)}
          placeholder="Name or product..."
          className="w-full bg-dark-input border border-dark-border rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-primary"
        />
      </div>
      
      <div>
        <label className="block text-xs font-medium text-gray-400 mb-1">From Date</label>
        <input
          type="date"
          value={localFilters.date_from || ''}
          onChange={(e) => handleChange('date_from', e.target.value)}
          className="w-full bg-dark-input border border-dark-border rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-primary"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-400 mb-1">To Date</label>
        <input
          type="date"
          value={localFilters.date_to || ''}
          onChange={(e) => handleChange('date_to', e.target.value)}
          className="w-full bg-dark-input border border-dark-border rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-primary"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-400 mb-1">Product</label>
        <select
          value={localFilters.product || ''}
          onChange={(e) => handleChange('product', e.target.value)}
          className="w-full bg-dark-input border border-dark-border rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-primary"
        >
          <option value="">All Products</option>
          {products.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
      </div>

      <div className="flex space-x-2">
        <button
          onClick={applyFilters}
          className="bg-primary hover:bg-teal-400 text-dark-bg font-medium py-2 px-4 rounded text-sm transition-colors"
        >
          Filter
        </button>
        <button
          onClick={clearFilters}
          className="bg-dark-input border border-dark-border hover:bg-gray-800 text-gray-300 font-medium py-2 px-4 rounded text-sm transition-colors"
        >
          Clear
        </button>
      </div>
    </div>
  );
}
