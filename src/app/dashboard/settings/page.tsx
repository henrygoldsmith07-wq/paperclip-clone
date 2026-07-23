"use client";

import { useState, useEffect, useRef } from "react";
import Header from "@/components/Header";
import { Skeleton } from "@/components/Skeleton";
import { useApp } from "@/context/AppContext";
import { useToast } from "@/components/Toast";

export default function SettingsPage() {
  const {
    company,
    updateCompany,
    resetData,
    simulateTick,
    exportState,
    importState,
    clearActivities,
    resetBudgets,
    isHydrated,
  } = useApp();
  const { toast } = useToast();
  const [name, setName] = useState(company.name);
  const [mission, setMission] = useState(company.mission);
  const [saved, setSaved] = useState(false);
  const [autoSimulate, setAutoSimulate] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setName(company.name);
    setMission(company.mission);
  }, [company.name, company.mission]);

  useEffect(() => {
    if (autoSimulate) {
      intervalRef.current = setInterval(() => {
        simulateTick();
      }, 4000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [autoSimulate, simulateTick]);

  if (!isHydrated) {
    return (
      <>
        <Header title="Settings" subtitle="Loading…" />
        <div className="flex-1 space-y-6 p-6 pt-16 lg:pt-6 max-w-2xl">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-40 rounded-xl" />
          ))}
        </div>
      </>
    );
  }

  const handleSave = () => {
    updateCompany({
      name: name.trim() || company.name,
      mission: mission.trim() || company.mission,
    });
    setSaved(true);
    toast("Company settings saved", "success");
    setTimeout(() => setSaved(false), 2000);
  };

  const handleExport = () => {
    const data = exportState();
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `paperclip-${company.name.replace(/\s+/g, "-").toLowerCase()}-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast("State exported", "success");
  };

  const handleImport = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(String(reader.result));
        const ok = importState(data);
        if (ok) {
          toast("State imported successfully", "success");
        } else {
          toast("Invalid company state structure", "warning");
        }
      } catch {
        toast("Invalid JSON file", "warning");
      }
    };
    reader.readAsText(file);
  };

  return (
    <>
      <Header title="Settings" subtitle="Company identity and demo controls" />
      <div className="flex-1 space-y-8 p-6 pt-16 lg:pt-6 max-w-2xl">
        <section className="rounded-xl border border-border bg-card p-6">
          <h2 className="mb-4 text-sm font-semibold text-foreground">
            Company Identity
          </h2>

          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted">
                Company Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-accent"
                placeholder="Acme AI Corp"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted">
                Mission Statement
              </label>
              <textarea
                value={mission}
                onChange={(e) => setMission(e.target.value)}
                rows={4}
                className="w-full resize-y rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-accent"
                placeholder="What is your company trying to achieve?"
              />
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleSave}
                className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover"
              >
                Save Changes
              </button>
              {saved && (
                <span className="animate-fade-in text-sm text-success">
                  Saved ✓
                </span>
              )}
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-border bg-card p-6">
          <h2 className="mb-2 text-sm font-semibold text-foreground">
            Live Simulation
          </h2>
          <p className="mb-4 text-xs text-muted">
            Automatically advance agent activity every 4 seconds. Great for demos.
          </p>
          <label className="flex cursor-pointer items-center gap-3">
            <div className="relative">
              <input
                type="checkbox"
                checked={autoSimulate}
                onChange={(e) => setAutoSimulate(e.target.checked)}
                className="peer sr-only"
              />
              <div className="h-5 w-10 rounded-full bg-zinc-700 transition-colors peer-checked:bg-accent" />
              <div className="absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white transition-transform peer-checked:translate-x-5" />
            </div>
            <span className="text-sm">
              {autoSimulate ? "Auto-simulate ON" : "Auto-simulate OFF"}
            </span>
          </label>
          <p className="mt-3 text-[11px] text-muted">
            Press{" "}
            <kbd className="rounded bg-zinc-800 px-1.5 py-0.5 font-mono">S</kbd>{" "}
            or use the Simulate button in the header for a single tick.
          </p>
        </section>

        <section className="rounded-xl border border-border bg-card p-6">
          <h2 className="mb-2 text-sm font-semibold text-foreground">
            Export / Import
          </h2>
          <p className="mb-4 text-xs text-muted">
            Save your full company state as JSON, or restore from a previous export.
          </p>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleExport}
              className="rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium hover:bg-card-hover"
            >
              ↓ Export JSON
            </button>
            <button
              onClick={() => fileRef.current?.click()}
              className="rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium hover:bg-card-hover"
            >
              ↑ Import JSON
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="application/json,.json"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleImport(file);
                e.target.value = "";
              }}
            />
          </div>
        </section>

        <section className="rounded-xl border border-border bg-card p-6">
          <h2 className="mb-2 text-sm font-semibold text-foreground">
            Budgets & Activity
          </h2>
          <p className="mb-4 text-xs text-muted">
            Reset spend counters or clear the activity feed without wiping the whole company.
          </p>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => {
                resetBudgets();
                toast("All budgets reset to $0", "success");
              }}
              className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted hover:bg-card-hover hover:text-foreground"
            >
              Reset Budgets
            </button>
            <button
              onClick={() => {
                clearActivities();
                toast("Activity log cleared", "info");
              }}
              className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted hover:bg-card-hover hover:text-foreground"
            >
              Clear Activity Log
            </button>
          </div>
        </section>

        <section className="rounded-xl border border-border bg-card p-6">
          <h2 className="mb-2 text-sm font-semibold text-foreground">
            Demo Controls
          </h2>
          <p className="mb-4 text-xs text-muted">
            Reset all agents, tasks, goals and activity back to the original seed data.
          </p>
          <button
            onClick={() => {
              if (
                confirm(
                  "Reset the entire company to the original demo state? This cannot be undone."
                )
              ) {
                setAutoSimulate(false);
                resetData();
                toast("Demo data reset", "warning");
              }
            }}
            className="rounded-lg border border-danger/40 bg-danger/10 px-4 py-2 text-sm font-medium text-danger hover:bg-danger/20"
          >
            Reset Demo Data
          </button>
        </section>

        <section className="rounded-xl border border-border bg-card p-6">
          <h2 className="mb-3 text-sm font-semibold text-foreground">
            Keyboard Shortcuts
          </h2>
          <div className="space-y-2 text-sm">
            {[
              ["Simulate Tick", "S"],
              ["Go to Dashboard", "G then D"],
              ["Go to Agents", "G then A"],
              ["Go to Tasks", "G then T"],
              ["Go to Org Chart", "G then O"],
              ["Go to Goals", "G then G"],
              ["Go to Settings", "G then S"],
            ].map(([label, keys]) => (
              <div key={label} className="flex justify-between">
                <span className="text-muted">{label}</span>
                <kbd className="rounded bg-zinc-800 px-2 py-0.5 font-mono text-xs">
                  {keys}
                </kbd>
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
