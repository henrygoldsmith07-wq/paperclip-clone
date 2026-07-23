/** Model catalog + provider routing for agent runs */

export type LlmProvider =
  | "openai"
  | "anthropic"
  | "google"
  | "xai"
  | "deepseek"
  | "groq"
  | "openrouter"
  | "unsupported";

export type ModelTier = "flagship" | "balanced" | "fast" | "free";

export interface ModelOption {
  id: string;
  label: string;
  provider: LlmProvider;
  /** Actual API model id sent to the provider */
  apiModel: string;
  tier: ModelTier;
  /** Shown in optgroup */
  group: string;
}

/** Curated top commercial + free models (2026) */
export const MODEL_CATALOG: ModelOption[] = [
  // —— Anthropic ——
  {
    id: "claude-opus-4",
    label: "Claude Opus 4",
    provider: "anthropic",
    apiModel: "claude-opus-4-20250514",
    tier: "flagship",
    group: "Anthropic",
  },
  {
    id: "claude-sonnet-4",
    label: "Claude Sonnet 4",
    provider: "anthropic",
    apiModel: "claude-sonnet-4-20250514",
    tier: "balanced",
    group: "Anthropic",
  },
  {
    id: "claude-haiku-3.5",
    label: "Claude 3.5 Haiku",
    provider: "anthropic",
    apiModel: "claude-3-5-haiku-20241022",
    tier: "fast",
    group: "Anthropic",
  },

  // —— OpenAI ——
  {
    id: "gpt-4.1",
    label: "GPT-4.1",
    provider: "openai",
    apiModel: "gpt-4.1",
    tier: "flagship",
    group: "OpenAI",
  },
  {
    id: "gpt-4.1-mini",
    label: "GPT-4.1 Mini",
    provider: "openai",
    apiModel: "gpt-4.1-mini",
    tier: "balanced",
    group: "OpenAI",
  },
  {
    id: "gpt-4.1-nano",
    label: "GPT-4.1 Nano",
    provider: "openai",
    apiModel: "gpt-4.1-nano",
    tier: "fast",
    group: "OpenAI",
  },
  {
    id: "gpt-4o",
    label: "GPT-4o",
    provider: "openai",
    apiModel: "gpt-4o",
    tier: "balanced",
    group: "OpenAI",
  },
  {
    id: "gpt-4o-mini",
    label: "GPT-4o Mini",
    provider: "openai",
    apiModel: "gpt-4o-mini",
    tier: "fast",
    group: "OpenAI",
  },
  {
    id: "o3-mini",
    label: "o3-mini",
    provider: "openai",
    apiModel: "o3-mini",
    tier: "flagship",
    group: "OpenAI",
  },
  {
    id: "o4-mini",
    label: "o4-mini",
    provider: "openai",
    apiModel: "o4-mini",
    tier: "balanced",
    group: "OpenAI",
  },

  // —— Google ——
  {
    id: "gemini-2.5-pro",
    label: "Gemini 2.5 Pro",
    provider: "google",
    apiModel: "gemini-2.5-pro",
    tier: "flagship",
    group: "Google",
  },
  {
    id: "gemini-2.5-flash",
    label: "Gemini 2.5 Flash",
    provider: "google",
    apiModel: "gemini-2.5-flash",
    tier: "balanced",
    group: "Google",
  },
  {
    id: "gemini-2.0-flash",
    label: "Gemini 2.0 Flash",
    provider: "google",
    apiModel: "gemini-2.0-flash",
    tier: "fast",
    group: "Google",
  },
  {
    id: "gemini-2.0-flash-lite",
    label: "Gemini 2.0 Flash-Lite",
    provider: "google",
    apiModel: "gemini-2.0-flash-lite",
    tier: "free",
    group: "Google (free tier friendly)",
  },

  // —— xAI ——
  {
    id: "grok-3",
    label: "Grok 3",
    provider: "xai",
    apiModel: "grok-3",
    tier: "flagship",
    group: "xAI",
  },
  {
    id: "grok-3-mini",
    label: "Grok 3 Mini",
    provider: "xai",
    apiModel: "grok-3-mini",
    tier: "balanced",
    group: "xAI",
  },
  {
    id: "grok-2",
    label: "Grok 2",
    provider: "xai",
    apiModel: "grok-2-latest",
    tier: "balanced",
    group: "xAI",
  },

  // —— DeepSeek ——
  {
    id: "deepseek-chat",
    label: "DeepSeek Chat (V3)",
    provider: "deepseek",
    apiModel: "deepseek-chat",
    tier: "balanced",
    group: "DeepSeek",
  },
  {
    id: "deepseek-reasoner",
    label: "DeepSeek Reasoner (R1)",
    provider: "deepseek",
    apiModel: "deepseek-reasoner",
    tier: "flagship",
    group: "DeepSeek",
  },

  // —— Groq (fast free-tier friendly) ——
  {
    id: "groq-llama-3.3-70b",
    label: "Llama 3.3 70B (Groq)",
    provider: "groq",
    apiModel: "llama-3.3-70b-versatile",
    tier: "free",
    group: "Free / open (via Groq)",
  },
  {
    id: "groq-llama-3.1-8b",
    label: "Llama 3.1 8B (Groq)",
    provider: "groq",
    apiModel: "llama-3.1-8b-instant",
    tier: "free",
    group: "Free / open (via Groq)",
  },
  {
    id: "groq-gemma2-9b",
    label: "Gemma 2 9B (Groq)",
    provider: "groq",
    apiModel: "gemma2-9b-it",
    tier: "free",
    group: "Free / open (via Groq)",
  },
  {
    id: "groq-qwen-qwq-32b",
    label: "Qwen QwQ 32B (Groq)",
    provider: "groq",
    apiModel: "qwen-qwq-32b",
    tier: "free",
    group: "Free / open (via Groq)",
  },

  // —— OpenRouter free / open ——
  {
    id: "or-llama-3.3-70b-free",
    label: "Llama 3.3 70B (OpenRouter free)",
    provider: "openrouter",
    apiModel: "meta-llama/llama-3.3-70b-instruct:free",
    tier: "free",
    group: "Free / open (via OpenRouter)",
  },
  {
    id: "or-deepseek-r1-free",
    label: "DeepSeek R1 (OpenRouter free)",
    provider: "openrouter",
    apiModel: "deepseek/deepseek-r1:free",
    tier: "free",
    group: "Free / open (via OpenRouter)",
  },
  {
    id: "or-gemma-3-27b-free",
    label: "Gemma 3 27B (OpenRouter free)",
    provider: "openrouter",
    apiModel: "google/gemma-3-27b-it:free",
    tier: "free",
    group: "Free / open (via OpenRouter)",
  },
  {
    id: "or-mistral-small-free",
    label: "Mistral Small (OpenRouter free)",
    provider: "openrouter",
    apiModel: "mistralai/mistral-small-3.1-24b-instruct:free",
    tier: "free",
    group: "Free / open (via OpenRouter)",
  },
  {
    id: "or-qwen3-free",
    label: "Qwen3 32B (OpenRouter free)",
    provider: "openrouter",
    apiModel: "qwen/qwen3-32b:free",
    tier: "free",
    group: "Free / open (via OpenRouter)",
  },
  {
    id: "or-gemini-flash-free",
    label: "Gemini 2.0 Flash (OpenRouter free)",
    provider: "openrouter",
    apiModel: "google/gemini-2.0-flash-exp:free",
    tier: "free",
    group: "Free / open (via OpenRouter)",
  },
];

export function getModelOption(id: string): ModelOption | undefined {
  return MODEL_CATALOG.find((m) => m.id === id);
}

export function resolveProvider(model: string): LlmProvider {
  const opt = getModelOption(model);
  if (opt) return opt.provider;

  const m = model.toLowerCase();
  if (m.includes("claude")) return "anthropic";
  if (m.includes("gpt") || m.startsWith("o1") || m.startsWith("o3") || m.startsWith("o4"))
    return "openai";
  if (m.includes("gemini")) return "google";
  if (m.includes("grok")) return "xai";
  if (m.includes("deepseek")) return "deepseek";
  if (m.includes("groq") || m.includes("llama-3")) return "groq";
  if (m.includes("openrouter") || m.includes(":free")) return "openrouter";
  return "unsupported";
}

export function resolveApiModel(model: string): string {
  const opt = getModelOption(model);
  if (opt) return opt.apiModel;
  return model;
}

export function modelsByGroup(): { group: string; models: ModelOption[] }[] {
  const map = new Map<string, ModelOption[]>();
  for (const m of MODEL_CATALOG) {
    const list = map.get(m.group) || [];
    list.push(m);
    map.set(m.group, list);
  }
  return Array.from(map.entries()).map(([group, models]) => ({ group, models }));
}

export interface ApiKeys {
  openai?: string;
  anthropic?: string;
  google?: string;
  xai?: string;
  deepseek?: string;
  groq?: string;
  openrouter?: string;
}

const KEYS_STORAGE = "paperclip-api-keys-v2";

export function loadApiKeys(): ApiKeys {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(KEYS_STORAGE);
    if (!raw) {
      // migrate v1 if present
      const v1 = localStorage.getItem("paperclip-api-keys-v1");
      if (v1) {
        const parsed = JSON.parse(v1) as ApiKeys;
        return {
          openai: parsed.openai,
          anthropic: parsed.anthropic,
        };
      }
      return {};
    }
    const parsed = JSON.parse(raw) as ApiKeys;
    return {
      openai: typeof parsed.openai === "string" ? parsed.openai : undefined,
      anthropic: typeof parsed.anthropic === "string" ? parsed.anthropic : undefined,
      google: typeof parsed.google === "string" ? parsed.google : undefined,
      xai: typeof parsed.xai === "string" ? parsed.xai : undefined,
      deepseek: typeof parsed.deepseek === "string" ? parsed.deepseek : undefined,
      groq: typeof parsed.groq === "string" ? parsed.groq : undefined,
      openrouter:
        typeof parsed.openrouter === "string" ? parsed.openrouter : undefined,
    };
  } catch {
    return {};
  }
}

export function saveApiKeys(keys: ApiKeys) {
  if (typeof window === "undefined") return;
  localStorage.setItem(
    KEYS_STORAGE,
    JSON.stringify({
      openai: keys.openai?.trim() || undefined,
      anthropic: keys.anthropic?.trim() || undefined,
      google: keys.google?.trim() || undefined,
      xai: keys.xai?.trim() || undefined,
      deepseek: keys.deepseek?.trim() || undefined,
      groq: keys.groq?.trim() || undefined,
      openrouter: keys.openrouter?.trim() || undefined,
    })
  );
}

export function keyForProvider(
  keys: ApiKeys,
  provider: LlmProvider
): string | undefined {
  switch (provider) {
    case "openai":
      return keys.openai;
    case "anthropic":
      return keys.anthropic;
    case "google":
      return keys.google;
    case "xai":
      return keys.xai;
    case "deepseek":
      return keys.deepseek;
    case "groq":
      return keys.groq;
    case "openrouter":
      return keys.openrouter;
    default:
      return undefined;
  }
}

export function providerLabel(provider: LlmProvider): string {
  switch (provider) {
    case "openai":
      return "OpenAI";
    case "anthropic":
      return "Anthropic";
    case "google":
      return "Google AI";
    case "xai":
      return "xAI";
    case "deepseek":
      return "DeepSeek";
    case "groq":
      return "Groq";
    case "openrouter":
      return "OpenRouter";
    default:
      return "Unknown";
  }
}
