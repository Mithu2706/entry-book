import * as xlsx from 'xlsx';
import { ImportPreviewRow, EntryCreatePayload } from '@shared/types';
import { validateImportRow } from '@shared/validation';
import { createClient } from './supabase-client';

export async function parseExcelFile(file: File): Promise<ImportPreviewRow[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = xlsx.read(data, { type: 'array', cellDates: true });
        
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        const json = (xlsx.utils.sheet_to_json(worksheet, { defval: '' })) as Record<string, unknown>[];
        
        const preview: ImportPreviewRow[] = json.map((row, index) => {
          const rowNumber = index + 2; // +1 for 0-index, +1 for header
          const { data: parsedData, errors } = validateImportRow(row, rowNumber);
          
          return {
            row_number: rowNumber,
            data: parsedData,
            errors: errors.map(e => `${e.field}: ${e.message}`),
            is_valid: errors.length === 0
          };
        });
        
        resolve(preview);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = (error) => reject(error);
    reader.readAsArrayBuffer(file);
  });
}

export async function importValidRows(rows: ImportPreviewRow[]) {
  const validRows = rows.filter(r => r.is_valid && Object.keys(r.data).length > 0);
  
  if (validRows.length === 0) {
    return { imported: 0, error: 'No valid rows to import' };
  }

  const supabase = createClient();
  
  const payload = validRows.map(row => ({
    ...row.data,
    created_by: 'system-import', // Ideally replace with actual user ID if available
  }));

  const { data, error } = await supabase
    .from('entries')
    .insert(payload)
    .select();

  if (error) {
    console.error('Import error:', error);
    return { imported: 0, error: error.message };
  }

  return { imported: data?.length || 0 };
}
