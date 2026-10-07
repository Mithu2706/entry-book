'use client';

import { useState } from 'react';
import { parseExcelFile, importValidRows } from '../lib/excel-import';
import { ImportPreviewRow } from '@shared/types';
import { ArrowUpTrayIcon, DocumentTextIcon } from '@heroicons/react/24/outline';

export default function ImportPanel() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<ImportPreviewRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<{ imported?: number; error?: string } | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    
    setFile(selected);
    setLoading(true);
    setResult(null);
    
    try {
      const data = await parseExcelFile(selected);
      setPreview(data);
    } catch (error) {
      console.error(error);
      alert('Failed to parse Excel file');
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async () => {
    if (preview.length === 0) return;
    
    setImporting(true);
    try {
      const res = await importValidRows(preview);
      setResult(res);
      if (!res.error) {
        setPreview([]);
        setFile(null);
      }
    } catch (error: any) {
      setResult({ error: error.message });
    } finally {
      setImporting(false);
    }
  };

  const validCount = preview.filter(r => r.is_valid).length;
  const invalidCount = preview.length - validCount;

  return (
    <div className="bg-dark-card border border-dark-border rounded-lg p-6">
      <h2 className="text-xl font-bold text-white mb-6 flex items-center">
        <ArrowUpTrayIcon className="h-6 w-6 mr-2 text-primary" />
        Import Entries from Excel
      </h2>

      {!file && (
        <div className="border-2 border-dashed border-dark-border rounded-lg p-12 text-center hover:border-primary transition-colors cursor-pointer relative">
          <input
            type="file"
            accept=".xlsx, .xls"
            onChange={handleFileChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-gray-300 font-medium">Click or drag Excel file to upload</p>
          <p className="text-sm text-gray-500 mt-2">Supports .xlsx and .xls formats</p>
        </div>
      )}

      {loading && (
        <div className="text-center py-8 text-primary">Parsing file...</div>
      )}

      {result && (
        <div className={`mb-6 p-4 rounded border ${result.error ? 'bg-red-500/10 text-red-400 border-red-500/50' : 'bg-primary/10 text-primary border-primary/50'}`}>
          {result.error ? `Import Error: ${result.error}` : `Successfully imported ${result.imported} entries!`}
        </div>
      )}

      {file && !loading && preview.length > 0 && (
        <div>
          <div className="flex justify-between items-center mb-4 p-4 bg-dark-input rounded-lg border border-dark-border">
            <div>
              <p className="text-white font-medium">{file.name}</p>
              <div className="flex space-x-4 mt-1 text-sm">
                <span className="text-primary">{validCount} Valid rows</span>
                <span className="text-red-400">{invalidCount} Invalid rows</span>
              </div>
            </div>
            <div className="space-x-3">
              <button
                onClick={() => { setFile(null); setPreview([]); }}
                className="px-4 py-2 bg-transparent text-gray-300 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleImport}
                disabled={importing || validCount === 0}
                className="px-4 py-2 bg-primary hover:bg-teal-400 text-dark-bg font-bold rounded transition-colors disabled:opacity-50"
              >
                {importing ? 'Importing...' : `Import ${validCount} Entries`}
              </button>
            </div>
          </div>

          <div className="overflow-x-auto border border-dark-border rounded-lg max-h-[500px] overflow-y-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead className="bg-dark-input sticky top-0">
                <tr className="border-b border-dark-border text-gray-300">
                  <th className="px-4 py-3">Row</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Product</th>
                  <th className="px-4 py-3">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-border">
                {preview.map((row, i) => (
                  <tr key={i} className={row.is_valid ? 'text-gray-300' : 'bg-red-900/10 text-gray-400'}>
                    <td className="px-4 py-3">{row.row_number}</td>
                    <td className="px-4 py-3">
                      {row.is_valid ? (
                        <span className="text-primary">Valid</span>
                      ) : (
                        <span className="text-red-400">Error</span>
                      )}
                    </td>
                    <td className="px-4 py-3">{row.data.entry_date || '-'}</td>
                    <td className="px-4 py-3">{row.data.name || '-'}</td>
                    <td className="px-4 py-3">{row.data.product || '-'}</td>
                    <td className="px-4 py-3">
                      {!row.is_valid && (
                        <ul className="list-disc pl-4 text-red-400 text-xs">
                          {row.errors.map((e, idx) => <li key={idx}>{e}</li>)}
                        </ul>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
