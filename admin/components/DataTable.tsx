import { Entry } from '@shared/types';
import { formatCurrency, formatDisplayDate } from '@shared/validation';
import { PencilSquareIcon, TrashIcon, EyeIcon } from '@heroicons/react/24/outline';

interface DataTableProps {
  data: Entry[];
  loading: boolean;
  onView?: (entry: Entry) => void;
  onEdit?: (entry: Entry) => void;
  onDelete?: (entry: Entry) => void;
  page?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
}

export default function DataTable({
  data,
  loading,
  onView,
  onEdit,
  onDelete,
  page = 1,
  totalPages = 1,
  onPageChange
}: DataTableProps) {
  if (loading) {
    return (
      <div className="w-full bg-dark-card rounded-lg border border-dark-border p-4">
        <div className="animate-pulse flex flex-col space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 bg-dark-input rounded w-full"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="w-full bg-dark-card rounded-lg border border-dark-border p-8 text-center text-gray-400">
        No entries found matching your criteria.
      </div>
    );
  }

  return (
    <div className="w-full bg-dark-card rounded-lg border border-dark-border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-dark-input border-b border-dark-border text-gray-300 text-sm uppercase tracking-wider">
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3 text-right">Qty</th>
              <th className="px-4 py-3 text-right">Final Amt</th>
              <th className="px-4 py-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-dark-border">
            {data.map((entry) => (
              <tr key={entry.id} className="hover:bg-dark-input/50 transition-colors text-gray-200">
                <td className="px-4 py-3 whitespace-nowrap">{formatDisplayDate(entry.entry_date)}</td>
                <td className="px-4 py-3 whitespace-nowrap font-medium">{entry.name}</td>
                <td className="px-4 py-3 whitespace-nowrap">{entry.product}</td>
                <td className="px-4 py-3 whitespace-nowrap text-right">{entry.quantity}</td>
                <td className="px-4 py-3 whitespace-nowrap text-right text-primary font-medium">
                  {formatCurrency(entry.final_amount)}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-center">
                  <div className="flex justify-center space-x-2">
                    {onView && (
                      <button onClick={() => onView(entry)} className="p-1 text-gray-400 hover:text-white" title="View">
                        <EyeIcon className="h-5 w-5" />
                      </button>
                    )}
                    {onEdit && (
                      <button onClick={() => onEdit(entry)} className="p-1 text-blue-400 hover:text-blue-300" title="Edit">
                        <PencilSquareIcon className="h-5 w-5" />
                      </button>
                    )}
                    {onDelete && (
                      <button onClick={() => onDelete(entry)} className="p-1 text-red-400 hover:text-red-300" title="Delete">
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && onPageChange && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-dark-border bg-dark-input">
          <div className="text-sm text-gray-400">
            Page <span className="font-medium text-white">{page}</span> of <span className="font-medium text-white">{totalPages}</span>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => onPageChange(page - 1)}
              disabled={page === 1}
              className="px-3 py-1 bg-dark-card border border-dark-border rounded text-sm disabled:opacity-50 hover:bg-dark-bg transition-colors"
            >
              Previous
            </button>
            <button
              onClick={() => onPageChange(page + 1)}
              disabled={page === totalPages}
              className="px-3 py-1 bg-dark-card border border-dark-border rounded text-sm disabled:opacity-50 hover:bg-dark-bg transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
