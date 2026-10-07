import Sidebar from '../../components/Sidebar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden bg-dark-bg">
      <Sidebar />
      <main className="flex-1 overflow-y-auto focus:outline-none">
        <div className="py-6 px-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
