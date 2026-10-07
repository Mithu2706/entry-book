'use client';

import { useEffect, useState } from 'react';
import StatsCard from '../../components/StatsCard';
import DataTable from '../../components/DataTable';
import { entriesService } from '../../services/entries';
import { DashboardStats, Entry } from '@shared/types';
import { 
  DocumentTextIcon, 
  CurrencyRupeeIcon, 
  TagIcon, 
  CalendarDaysIcon 
} from '@heroicons/react/24/outline';
import { formatCurrency } from '@shared/validation';

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentEntries, setRecentEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [statsData, entriesData] = await Promise.all([
          entriesService.getDashboardStats(),
          entriesService.getEntries({ page: 1, page_size: 5, sort_by: 'created_at', sort_order: 'desc' })
        ]);
        setStats(statsData);
        setRecentEntries(entriesData.data);
      } catch (error) {
        console.error("Failed to load dashboard data", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-8">Dashboard Overview</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="Total Sales"
          value={stats ? formatCurrency(stats.total_sales) : '...'}
          icon={<CurrencyRupeeIcon className="h-6 w-6" />}
        />
        <StatsCard
          title="Today's Entries"
          value={stats ? stats.today_entries : '...'}
          icon={<CalendarDaysIcon className="h-6 w-6" />}
        />
        <StatsCard
          title="Total Entries"
          value={stats ? stats.total_entries : '...'}
          icon={<DocumentTextIcon className="h-6 w-6" />}
        />
        <StatsCard
          title="Unique Products"
          value={stats ? stats.unique_products : '...'}
          icon={<TagIcon className="h-6 w-6" />}
        />
      </div>

      <div className="bg-dark-card border border-dark-border rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">Recent Entries</h2>
          <a href="/dashboard/entries" className="text-primary hover:text-teal-400 text-sm font-medium">
            View All →
          </a>
        </div>
        <DataTable data={recentEntries} loading={loading} />
      </div>
    </div>
  );
}
