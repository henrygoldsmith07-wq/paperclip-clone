import Sidebar from "@/components/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="ml-60 flex min-h-screen flex-1 flex-col">
        {children}
      </main>
    </div>
  );
}
