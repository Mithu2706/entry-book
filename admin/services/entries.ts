import { createClient } from '../lib/supabase-client';
import { EntryFilters, PaginatedResponse, Entry, DashboardStats, EntryCreatePayload } from '@shared/types';

export const entriesService = {
  async getEntries(filters: EntryFilters = {}): Promise<PaginatedResponse<Entry>> {
    const supabase = createClient();
    let query = supabase.from('entries').select('*', { count: 'exact' });

    if (filters.search) {
      query = query.or(`name.ilike.%${filters.search}%,product.ilike.%${filters.search}%`);
    }
    if (filters.name) {
      query = query.ilike('name', `%${filters.name}%`);
    }
    if (filters.product) {
      query = query.eq('product', filters.product);
    }
    if (filters.date_from) {
      query = query.gte('entry_date', filters.date_from);
    }
    if (filters.date_to) {
      query = query.lte('entry_date', filters.date_to);
    }

    const sortBy = filters.sort_by || 'created_at';
    const sortOrder = filters.sort_order === 'asc' ? true : false;
    query = query.order(sortBy, { ascending: sortOrder });

    const page = filters.page || 1;
    const pageSize = filters.page_size || 50;
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    query = query.range(from, to);

    const { data, error, count } = await query;
    if (error) throw error;

    return {
      data: data as Entry[],
      total: count || 0,
      page,
      page_size: pageSize,
      total_pages: Math.ceil((count || 0) / pageSize),
    };
  },

  async getEntry(id: string): Promise<Entry> {
    const supabase = createClient();
    const { data, error } = await supabase.from('entries').select('*').eq('id', id).single();
    if (error) throw error;
    return data as Entry;
  },

  async updateEntry(id: string, updateData: Partial<EntryCreatePayload>): Promise<Entry> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('entries')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data as Entry;
  },

  async deleteEntry(id: string): Promise<void> {
    const supabase = createClient();
    const { error } = await supabase.from('entries').delete().eq('id', id);
    if (error) throw error;
  },

  async getDashboardStats(): Promise<DashboardStats> {
    const supabase = createClient();
    
    // Quick approach: get all items to aggregate. 
    // In production with large data, use RPC/database functions for aggregations.
    const { data: allEntries, error: err1 } = await supabase.from('entries').select('*');
    if (err1) throw err1;

    const todayStr = new Date().toISOString().split('T')[0];
    
    let todayEntries = 0;
    let totalSales = 0;
    let totalDiscount = 0;
    const products = new Set<string>();

    allEntries.forEach((entry: any) => {
      if (entry.entry_date === todayStr) todayEntries++;
      totalSales += entry.final_amount || 0;
      totalDiscount += entry.discount_amount || 0;
      if (entry.product) products.add(entry.product);
    });

    return {
      total_entries: allEntries.length,
      today_entries: todayEntries,
      total_sales: totalSales,
      total_discount: totalDiscount,
      unique_products: products.size,
    };
  },

  async getProducts(): Promise<string[]> {
    const supabase = createClient();
    const { data, error } = await supabase.from('entries').select('product');
    if (error) throw error;
    
    const products = new Set<string>();
    data.forEach(d => { if(d.product) products.add(d.product); });
    return Array.from(products).sort();
  }
};
