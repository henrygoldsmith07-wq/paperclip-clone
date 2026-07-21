"use client";

import Sidebar from "@/components/Sidebar";
import { MenuProvider, useMenu } from "@/context/MenuContext";

function DashboardShell({ children }: { children: React.ReactNode }) {
  const { isOpen, close } = useMenu();

  return (
    <div className="flex min-h-screen">
      <Sidebar isOpen={isOpen} onClose={close} />
      <main className="flex min-h-screen flex-1 flex-col lg:ml-60">
        {children}
      </main>
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <MenuProvider>
      <DashboardShell>{children}</DashboardShell>
    </MenuProvider>
  );
}
