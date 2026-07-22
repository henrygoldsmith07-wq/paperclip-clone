"use client";

import { useState, useEffect, useRef } from "react";
import Header from "@/components/Header";
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
      <div className="flex flex-1 items-center justify-center p-12 text-muted">
        Loading settings…
      </div>
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
        importState(data);
        toast("State imported successfully", "success");
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
          <h2 className="text-sm font-semibold text-foreground mb-4">
            Company Identity
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-muted mb-1.5">
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
              <label className="block text-xs font-medium text-muted mb-1.5">
                Mission Statement
              </label>
              <textarea
                value={mission}
                onChange={(e) => setMission(e.target.value)}
                rows={4}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-accent resize-y"
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
                <span className="text-sm text-success animate-fade-in">
                  Saved ✓
                </span>
              )}
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-border bg-card p-6">
          <h2 className="text-sm font-semibold text-foreground mb-2">
            Live Simulation
          </h2>
          <p className="text-xs text-muted mb-4">
            Automatically advance agent activity every 4 seconds. Great for demos.
          </p>
          <label className="flex items-center gap-3 cursor-pointer">
            <div className="relative">
              <input
                type="checkbox"
                checked={autoSimulate}
                onChange={(e) => setAutoSimulate(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-10 h-5 bg-zinc-700 rounded-full peer-checked:bg-accent transition-colors" />
              <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-5" />
            </div>
            <span className="text-sm">
              {autoSimulate ? "Auto-simulate ON" : "Auto-simulate OFF"}
            </span>
          </label>
          <p className="mt-3 text-[11px] text-muted">
            You can also press{" "}
            <kbd className="rounded bg-zinc-800 px-1.5 py-0.5 font-mono">S</kbd>{" "}
            anytime to trigger one tick, or use the Simulate button in the header.
          </p>
        </section>

        <section className="rounded-xl border border-border bg-card p-6">
          <h2 className="text-sm font-semibold text-foreground mb-2">
            Export / Import
          </h2>
          <p className="text-xs text-muted mb-4">
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
          <h2 className="text-sm font-semibold text-foreground mb-2">
            Activity Log
          </h2>
          <p className="text-xs text-muted mb-4">
            Clear the live activity feed without resetting agents, goals, or tasks.
          </p>
          <button
            onClick={() => {
              clearActivities();
              toast("Activity log cleared", "info");
            }}
            className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted hover:bg-card-hover hover:text-foreground"
          >
            Clear Activity Log
          </button>
        </section>

        <section className="rounded-xl border border-border bg-card p-6">
          <h2 className="text-sm font-semibold text-foreground mb-2">
            Demo Controls
          </h2>
          <p className="text-xs text-muted mb-4">
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
          <h2 className="text-sm font-semibold text-foreground mb-3">
            Keyboard Shortcuts
          </h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted">Simulate Tick</span>
              <kbd className="rounded bg-zinc-800 px-2 py-0.5 text-xs font-mono">
                S
              </kbd>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Go to Dashboard</span>
              <kbd className="rounded bg-zinc-800 px-2 py-0.5 text-xs font-mono">
                G then D
              </kbd>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Go to Agents</span>
              <kbd className="rounded bg-zinc-800 px-2 py-0.5 text-xs font-mono">
                G then A
              </kbd>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Go to Tasks</span>
              <kbd className="rounded bg-zinc-800 px-2 py-0.5 text-xs font-mono">
                G then T
              </kbd>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Go to Org Chart</span>
              <kbd className="rounded bg-zinc-800 px-2 py-0.5 text-xs font-mono">
                G then O
              </kbd>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Go to Goals</span>
              <kbd className="rounded bg-zinc-800 px-2 py-0.5 text-xs font-mono">
                G then G
              </kbd>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Go to Settings</span>
              <kbd className="rounded bg-zinc-800 px-2 py-0.5 text-xs font-mono">
                G then S
              </kbd>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
