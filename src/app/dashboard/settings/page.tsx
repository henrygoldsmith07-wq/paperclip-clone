"use client";

import { useState, useEffect, useRef } from "react";
import Header from "@/components/Header";
import { Skeleton } from "@/components/Skeleton";
import { useApp } from "@/context/AppContext";
import { useToast } from "@/components/Toast";
import { loadApiKeys, saveApiKeys, type ApiKeys } from "@/lib/llm";

const KEY_FIELDS: {
  key: keyof ApiKeys;
  label: string;
  hint: string;
  placeholder: string;
}[] = [
  {
    key: "openai",
    label: "OpenAI",
    hint: "GPT-4.1, GPT-4o, o3/o4",
    placeholder: "sk-…",
  },
  {
    key: "anthropic",
    label: "Anthropic",
    hint: "Claude Opus / Sonnet / Haiku",
    placeholder: "sk-ant-…",
  },
  {
    key: "google",
    label: "Google AI",
    hint: "Gemini 2.5 / 2.0 (free tier available)",
    placeholder: "AIza…",
  },
  {
    key: "xai",
    label: "xAI",
    hint: "Grok 3 / Grok 2",
    placeholder: "xai-…",
  },
  {
    key: "deepseek",
    label: "DeepSeek",
    hint: "DeepSeek Chat / Reasoner",
    placeholder: "sk-…",
  },
  {
    key: "groq",
    label: "Groq",
    hint: "Llama / Gemma / Qwen — free tier",
    placeholder: "gsk_…",
  },
  {
    key: "openrouter",
    label: "OpenRouter",
    hint: "Many free open models",
    placeholder: "sk-or-…",
  },
];

export default function SettingsPage() {
  const {
    company,
    updateCompany,
    clearCompany,
    loadSampleData,
    processWork,
    exportState,
    importState,
    clearActivities,
    resetBudgets,
    isHydrated,
    isProcessing,
  } = useApp();
  const { toast } = useToast();
  const [name, setName] = useState(company.name);
  const [mission, setMission] = useState(company.mission);
  const [saved, setSaved] = useState(false);
  const [autoProcess, setAutoProcess] = useState(false);
  const [keys, setKeys] = useState<ApiKeys>({});
  const [keysSaved, setKeysSaved] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setName(company.name);
    setMission(company.mission);
  }, [company.name, company.mission]);

  useEffect(() => {
    setKeys(loadApiKeys());
  }, []);

  useEffect(() => {
    if (autoProcess) {
      intervalRef.current = setInterval(() => {
        void processWork();
      }, 12000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [autoProcess, processWork]);

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

  const handleSaveKeys = () => {
    saveApiKeys(keys);
    setKeysSaved(true);
    toast("API keys saved on this device", "success");
    setTimeout(() => setKeysSaved(false), 2000);
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
    toast("State exported (API keys are not included)", "success");
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
      <Header title="Settings" subtitle="API keys, company, workspace" />
      <div className="flex-1 space-y-8 p-6 pt-16 lg:pt-6 max-w-2xl">
        <section className="rounded-xl border border-accent/30 bg-card p-6">
          <h2 className="mb-1 text-sm font-semibold text-foreground">
            API Keys
          </h2>
          <p className="mb-4 text-xs text-muted">
            Add keys for the models you want to use. Free options:{" "}
            <strong>Groq</strong>, <strong>OpenRouter</strong>, and Google’s free
            Gemini tier. Keys stay in your browser only.
          </p>

          <div className="space-y-3">
            {KEY_FIELDS.map((field) => (
              <div key={field.key}>
                <label className="mb-1.5 block text-xs font-medium text-muted">
                  {field.label}{" "}
                  <span className="text-muted/70">({field.hint})</span>
                </label>
                <input
                  type="password"
                  autoComplete="off"
                  value={keys[field.key] || ""}
                  onChange={(e) =>
                    setKeys((prev) => ({
                      ...prev,
                      [field.key]: e.target.value,
                    }))
                  }
                  placeholder={field.placeholder}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 font-mono text-sm outline-none focus:border-accent"
                />
              </div>
            ))}
            <div className="flex items-center gap-3 pt-1">
              <button
                onClick={handleSaveKeys}
                className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover"
              >
                Save API Keys
              </button>
              {keysSaved && (
                <span className="animate-fade-in text-sm text-success">
                  Saved ✓
                </span>
              )}
            </div>
            <p className="text-[11px] text-muted">
              Tip: start free with a Groq or OpenRouter key, hire an agent on a
              free model, assign a task, press{" "}
              <kbd className="rounded bg-zinc-800 px-1.5 py-0.5 font-mono">W</kbd>.
            </p>
          </div>
        </section>

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
            Work Queue
          </h2>
          <p className="mb-4 text-xs text-muted">
            Auto-run assigned agents every 12 seconds.{" "}
            {isProcessing ? "Agent currently running…" : ""}
          </p>
          <label className="flex cursor-pointer items-center gap-3">
            <div className="relative">
              <input
                type="checkbox"
                checked={autoProcess}
                onChange={(e) => setAutoProcess(e.target.checked)}
                className="peer sr-only"
              />
              <div className="h-5 w-10 rounded-full bg-zinc-700 transition-colors peer-checked:bg-accent" />
              <div className="absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white transition-transform peer-checked:translate-x-5" />
            </div>
            <span className="text-sm">
              {autoProcess ? "Auto-process ON" : "Auto-process OFF"}
            </span>
          </label>
        </section>

        <section className="rounded-xl border border-border bg-card p-6">
          <h2 className="mb-2 text-sm font-semibold text-foreground">
            Export / Import
          </h2>
          <p className="mb-4 text-xs text-muted">
            Company state only — API keys are never exported.
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
            Workspace
          </h2>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => {
                loadSampleData();
                toast("Sample company loaded", "info");
              }}
              className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-card-hover"
            >
              Load Sample Data
            </button>
            <button
              onClick={() => {
                if (
                  confirm(
                    "Clear the entire company? All agents, goals, tasks and activity will be deleted."
                  )
                ) {
                  setAutoProcess(false);
                  clearCompany();
                  toast("Company cleared", "warning");
                }
              }}
              className="rounded-lg border border-danger/40 bg-danger/10 px-4 py-2 text-sm font-medium text-danger hover:bg-danger/20"
            >
              Clear Company
            </button>
          </div>
        </section>
      </div>
    </>
  );
}
