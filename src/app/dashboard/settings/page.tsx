"use client";

import { useState, useEffect } from "react";
import Header from "@/components/Header";
import { useApp } from "@/context/AppContext";

export default function SettingsPage() {
  const { company, updateCompany, resetData, isHydrated } = useApp();
  const [name, setName] = useState(company.name);
  const [mission, setMission] = useState(company.mission);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setName(company.name);
    setMission(company.mission);
  }, [company.name, company.mission]);

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
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <>
      <Header
        title="Settings"
        subtitle="Company identity and demo controls"
      />
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
            Demo Controls
          </h2>
          <p className="text-xs text-muted mb-4">
            Reset all agents, tasks, goals and activity back to the original
            seed data.
          </p>
          <button
            onClick={() => {
              if (
                confirm(
                  "Reset the entire company to the original demo state? This cannot be undone."
                )
              ) {
                resetData();
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
              <kbd className="rounded bg-zinc-800 px-2 py-0.5 text-xs font-mono">S</kbd>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Go to Dashboard</span>
              <kbd className="rounded bg-zinc-800 px-2 py-0.5 text-xs font-mono">G then D</kbd>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Go to Agents</span>
              <kbd className="rounded bg-zinc-800 px-2 py-0.5 text-xs font-mono">G then A</kbd>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Go to Tasks</span>
              <kbd className="rounded bg-zinc-800 px-2 py-0.5 text-xs font-mono">G then T</kbd>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Go to Settings</span>
              <kbd className="rounded bg-zinc-800 px-2 py-0.5 text-xs font-mono">G then S</kbd>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
