import Sidebar from "@/components/Sidebar";
import KeyboardShortcuts from "@/components/KeyboardShortcuts";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex min-h-screen flex-1 flex-col lg:ml-60">
        {children}
      </main>
      <KeyboardShortcuts />
    </div>
  );
}
