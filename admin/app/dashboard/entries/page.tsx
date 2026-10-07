'use client';

import { useState, useEffect, useCallback } from 'react';
import FilterBar from '../../../components/FilterBar';
import DataTable from '../../../components/DataTable';
import EntryModal from '../../../components/EntryModal';
import { entriesService } from '../../../services/entries';
import { Entry, EntryFilters } from '@shared/types';

export default function EntriesPage() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<string[]>([]);
  const [filters, setFilters] = useState<EntryFilters>({ page: 1, page_size: 15 });
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  
  const [selectedEntry, setSelectedEntry] = useState<Entry | null>(null);
  const [modalMode, setModalMode] = useState<'view' | 'edit'>('view');

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [entriesData, productsList] = await Promise.all([
        entriesService.getEntries(filters),
        entriesService.getProducts()
      ]);
      setEntries(entriesData.data);
      setTotal(entriesData.total);
      setTotalPages(entriesData.total_pages);
      setProducts(productsList);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleFilterChange = (newFilters: EntryFilters) => {
    setFilters({ ...filters, ...newFilters });
  };

  const handlePageChange = (page: number) => {
    setFilters({ ...filters, page });
  };

  const handleDelete = async (entry: Entry) => {
    if (window.confirm(`Are you sure you want to delete entry for ${entry.name}?`)) {
      try {
        await entriesService.deleteEntry(entry.id);
        loadData();
      } catch (error) {
        alert('Failed to delete entry');
      }
    }
  };

  const handleView = (entry: Entry) => {
    setSelectedEntry(entry);
    setModalMode('view');
  };

  const handleEdit = (entry: Entry) => {
    setSelectedEntry(entry);
    setModalMode('edit');
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">All Entries</h1>
        <span className="text-sm text-gray-400">Total: {total}</span>
      </div>

      <FilterBar products={products} filters={filters} onFilterChange={handleFilterChange} />

      <DataTable 
        data={entries} 
        loading={loading} 
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
        page={filters.page}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />

      {selectedEntry && (
        <EntryModal 
          entry={selectedEntry} 
          mode={modalMode} 
          onClose={() => setSelectedEntry(null)}
          onUpdate={loadData}
        />
      )}
    </div>
  );
}
