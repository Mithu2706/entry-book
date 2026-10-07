'use client';

import { useState } from 'react';
import { entriesService } from '../services/entries';
import { exportEntriesToExcel } from '../lib/excel-export';
import { ArrowDownTrayIcon } from '@heroicons/react/24/outline';

export default function ExportPanel() {
  const [exportType, setExportType] = useState<'all' | 'date_range'>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleExport = async () => {
    setLoading(true);
    setMessage('');
    
    try {
      const filters = exportType === 'date_range' 
        ? { date_from: dateFrom, date_to: dateTo, page_size: 10000 }
        : { page_size: 10000 };
        
      const response = await entriesService.getEntries(filters);
      
      if (response.data.length === 0) {
        setMessage('No data found to export for the given criteria.');
      } else {
        exportEntriesToExcel(response.data);
        setMessage(`Successfully exported ${response.data.length} entries.`);
      }
    } catch (error: any) {
      setMessage(`Export failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-dark-card border border-dark-border rounded-lg p-6 max-w-2xl">
      <h2 className="text-xl font-bold text-white mb-6 flex items-center">
        <ArrowDownTrayIcon className="h-6 w-6 mr-2 text-primary" />
        Export Entries to Excel
      </h2>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Export Scope</label>
          <div className="flex space-x-4">
            <label className="flex items-center space-x-2 text-gray-300">
              <input
                type="radio"
                checked={exportType === 'all'}
                onChange={() => setExportType('all')}
                className="text-primary bg-dark-input border-dark-border"
              />
              <span>All Entries</span>
            </label>
            <label className="flex items-center space-x-2 text-gray-300">
              <input
                type="radio"
                checked={exportType === 'date_range'}
                onChange={() => setExportType('date_range')}
                className="text-primary bg-dark-input border-dark-border"
              />
              <span>Date Range</span>
            </label>
          </div>
        </div>

        {exportType === 'date_range' && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">From Date</label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-full bg-dark-input border border-dark-border rounded px-3 py-2 text-white focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">To Date</label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-full bg-dark-input border border-dark-border rounded px-3 py-2 text-white focus:outline-none focus:border-primary"
              />
            </div>
          </div>
        )}

        <button
          onClick={handleExport}
          disabled={loading || (exportType === 'date_range' && (!dateFrom || !dateTo))}
          className="w-full bg-primary hover:bg-teal-400 text-dark-bg font-bold py-3 px-4 rounded transition-colors disabled:opacity-50 flex items-center justify-center"
        >
          {loading ? 'Preparing Export...' : 'Download Excel File'}
        </button>

        {message && (
          <div className={`p-4 rounded text-sm ${message.includes('failed') || message.includes('No data') ? 'bg-red-500/10 text-red-400 border border-red-500/50' : 'bg-primary/10 text-primary border border-primary/50'}`}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
}
