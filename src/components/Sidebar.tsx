"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: "📊" },
  { href: "/dashboard/agents", label: "Agents", icon: "🤖" },
  { href: "/dashboard/goals", label: "Goals", icon: "🎯" },
  { href: "/dashboard/tasks", label: "Tasks", icon: "✅" },
  { href: "/dashboard/org", label: "Org Chart", icon: "🏢" },
  { href: "/dashboard/settings", label: "Settings", icon: "⚙️" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed left-4 top-4 z-50 flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-card text-lg lg:hidden"
        aria-label="Open menu"
      >
        ☰
      </button>

      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        className={`fixed left-0 top-0 z-50 flex h-screen w-60 flex-col border-r border-border bg-sidebar transition-transform duration-200 lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-14 items-center gap-2 border-b border-border px-5">
          <span className="text-xl">📎</span>
          <span className="font-semibold tracking-tight">Paperclip</span>
        </div>

        <nav className="flex-1 space-y-0.5 p-3">
          {navItems.map((item) => {
            const active =
              item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  active
                    ? "bg-accent/15 text-accent"
                    : "text-muted hover:bg-card-hover hover:text-foreground"
                }`}
              >
                <span className="text-base">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-border p-4 text-[11px] text-muted">
          Press <kbd className="rounded bg-zinc-800 px-1">S</kbd> to simulate
        </div>
      </aside>
    </>
  );
}
