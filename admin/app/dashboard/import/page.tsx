import ImportPanel from '../../../components/ImportPanel';

export default function ImportPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Import Data</h1>
      <p className="text-gray-400 mb-8 max-w-2xl">
        Upload an Excel file to bulk import entries. The system will validate your data
        before inserting it into the database. Make sure your columns match the required format.
      </p>
      
      <ImportPanel />
    </div>
  );
}
