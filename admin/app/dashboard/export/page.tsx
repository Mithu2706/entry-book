import ExportPanel from '../../../components/ExportPanel';

export default function ExportPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Export Data</h1>
      <p className="text-gray-400 mb-8 max-w-2xl">
        Download your entries data as an Excel file. You can choose to export all records
        or filter by a specific date range.
      </p>
      
      <ExportPanel />
    </div>
  );
}
