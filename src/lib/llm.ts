/** Map UI model ids → real provider + API model name */

export type LlmProvider = "openai" | "anthropic" | "unsupported";

export function resolveProvider(model: string): LlmProvider {
  const m = model.toLowerCase();
  if (m.includes("claude")) return "anthropic";
  if (m.includes("gpt") || m.includes("o1") || m.includes("o3")) return "openai";
  if (m.includes("gemini")) return "unsupported";
  if (m.includes("local") || m.includes("llama")) return "unsupported";
  return "unsupported";
}

/** Map friendly labels to current API model ids */
export function resolveApiModel(model: string): string {
  const map: Record<string, string> = {
    "claude-opus-4": "claude-opus-4-20250514",
    "claude-sonnet-4": "claude-sonnet-4-20250514",
    "gpt-4.1": "gpt-4.1",
    "gpt-4.1-mini": "gpt-4.1-mini",
    "gemini-2.5-pro": "gemini-2.5-pro",
    "local-llama": "local-llama",
  };
  return map[model] || model;
}

export interface ApiKeys {
  openai?: string;
  anthropic?: string;
}

const KEYS_STORAGE = "paperclip-api-keys-v1";

export function loadApiKeys(): ApiKeys {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(KEYS_STORAGE);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as ApiKeys;
    return {
      openai: typeof parsed.openai === "string" ? parsed.openai : undefined,
      anthropic:
        typeof parsed.anthropic === "string" ? parsed.anthropic : undefined,
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
    })
  );
}

export function keyForProvider(
  keys: ApiKeys,
  provider: LlmProvider
): string | undefined {
  if (provider === "openai") return keys.openai;
  if (provider === "anthropic") return keys.anthropic;
  return undefined;
}
