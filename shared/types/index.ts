// ============================================
// Entry Book - Shared Types
// ============================================

/** Database entry record */
export interface Entry {
  id: string;
  name: string;
  entry_date: string; // ISO date string YYYY-MM-DD
  product: string;
  quantity: number;
  price: number;
  discount_percent: number;
  subtotal: number;
  discount_amount: number;
  final_amount: number;
  created_at: string;
  created_by: string | null;
  updated_at: string | null;
}

/** Form data for creating/editing an entry */
export interface EntryFormData {
  name: string;
  entry_date: string;
  product: string;
  quantity: string; // string from form input, parsed to number
  price: string;
  discount_percent: string;
}

/** Parsed numeric form data ready for submission */
export interface EntryCreatePayload {
  name: string;
  entry_date: string;
  product: string;
  quantity: number;
  price: number;
  discount_percent: number;
  subtotal: number;
  discount_amount: number;
  final_amount: number;
}

/** User profile with role */
export interface UserProfile {
  id: string;
  email: string;
  role: 'user' | 'admin';
  full_name: string | null;
  created_at: string;
}

/** Filter parameters for querying entries */
export interface EntryFilters {
  search?: string;
  product?: string;
  name?: string;
  date_from?: string;
  date_to?: string;
  sort_by?: 'entry_date' | 'created_at' | 'name' | 'product' | 'final_amount';
  sort_order?: 'asc' | 'desc';
  page?: number;
  page_size?: number;
}

/** Paginated response */
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

/** Dashboard statistics */
export interface DashboardStats {
  total_entries: number;
  today_entries: number;
  total_sales: number;
  total_discount: number;
  unique_products: number;
}

/** Excel import result */
export interface ImportResult {
  imported: number;
  skipped: number;
  errors: ImportError[];
}

/** Excel import error detail */
export interface ImportError {
  row: number;
  field: string;
  message: string;
}

/** Excel import preview row */
export interface ImportPreviewRow {
  row_number: number;
  data: Partial<EntryCreatePayload>;
  errors: string[];
  is_valid: boolean;
}

/** Sync status for offline support */
export type SyncStatus = 'synced' | 'pending' | 'error';

/** Local entry with sync metadata */
export interface LocalEntry extends EntryCreatePayload {
  local_id: string;
  sync_status: SyncStatus;
  sync_error?: string;
  created_at_local: string;
}

/** Export options */
export interface ExportOptions {
  date_from?: string;
  date_to?: string;
  export_type: 'all' | 'filtered' | 'date_range';
  filters?: EntryFilters;
}
