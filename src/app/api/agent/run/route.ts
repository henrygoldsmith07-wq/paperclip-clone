import { NextRequest, NextResponse } from "next/server";

type Provider =
  | "openai"
  | "anthropic"
  | "google"
  | "xai"
  | "deepseek"
  | "groq"
  | "openrouter";

type Body = {
  provider: Provider;
  apiKey: string;
  model: string;
  agentName: string;
  agentRole: string;
  skills?: string[];
  companyName?: string;
  companyMission?: string;
  taskTitle: string;
  taskDescription?: string;
  taskPriority?: string;
};

const SUPPORTED: Provider[] = [
  "openai",
  "anthropic",
  "google",
  "xai",
  "deepseek",
  "groq",
  "openrouter",
];

async function openaiCompatible(
  url: string,
  apiKey: string,
  model: string,
  system: string,
  user: string,
  extraHeaders?: Record<string, string>
) {
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      ...extraHeaders,
    },
    body: JSON.stringify({
      model,
      temperature: 0.4,
      max_tokens: 600,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    }),
  });
  const data = await res.json();
  if (!res.ok) {
    const msg =
      data?.error?.message || data?.error || res.statusText || "API error";
    return { error: String(msg), status: res.status };
  }
  const output =
    data?.choices?.[0]?.message?.content?.trim() || "(empty response)";
  const usage = data?.usage
    ? {
        inputTokens: data.usage.prompt_tokens as number,
        outputTokens: data.usage.completion_tokens as number,
      }
    : undefined;
  return { output, usage };
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Body;

    if (!body?.apiKey?.trim()) {
      return NextResponse.json(
        { error: "Missing API key for this provider" },
        { status: 400 }
      );
    }
    if (!body.taskTitle?.trim()) {
      return NextResponse.json({ error: "Missing task title" }, { status: 400 });
    }
    if (!SUPPORTED.includes(body.provider)) {
      return NextResponse.json(
        { error: `Unsupported provider: ${body.provider}` },
        { status: 400 }
      );
    }

    const system = [
      `You are ${body.agentName}, a ${body.agentRole} agent in the company "${body.companyName || "the company"}".`,
      body.companyMission ? `Company mission: ${body.companyMission}` : "",
      body.skills?.length ? `Your skills: ${body.skills.join(", ")}.` : "",
      "Complete the assigned task. Be concrete and actionable.",
      "Respond with:",
      "1) A short summary of what you did (2–4 sentences)",
      "2) A bullet list of deliverables or next steps",
      "Keep the total response under 250 words.",
    ]
      .filter(Boolean)
      .join("\n");

    const user = [
      `Task: ${body.taskTitle}`,
      body.taskDescription ? `Description: ${body.taskDescription}` : "",
      body.taskPriority ? `Priority: ${body.taskPriority}` : "",
    ]
      .filter(Boolean)
      .join("\n");

    const key = body.apiKey.trim();
    const model = body.model;

    // —— Anthropic ——
    if (body.provider === "anthropic") {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "x-api-key": key,
          "anthropic-version": "2023-06-01",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          max_tokens: 600,
          temperature: 0.4,
          system,
          messages: [{ role: "user", content: user }],
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        const msg =
          data?.error?.message ||
          data?.error ||
          res.statusText ||
          "Anthropic error";
        return NextResponse.json({ error: String(msg) }, { status: res.status });
      }
      const textBlock = Array.isArray(data?.content)
        ? data.content.find((c: { type?: string }) => c.type === "text")
        : null;
      const output =
        (textBlock?.text as string | undefined)?.trim() || "(empty response)";
      const usage = data?.usage
        ? {
            inputTokens: data.usage.input_tokens as number,
            outputTokens: data.usage.output_tokens as number,
          }
        : undefined;
      return NextResponse.json({ output, usage, provider: "anthropic" });
    }

    // —— Google Gemini ——
    if (body.provider === "google") {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(key)}`;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: system }] },
          contents: [{ role: "user", parts: [{ text: user }] }],
          generationConfig: { temperature: 0.4, maxOutputTokens: 600 },
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        const msg =
          data?.error?.message || data?.error || res.statusText || "Google error";
        return NextResponse.json({ error: String(msg) }, { status: res.status });
      }
      const parts = data?.candidates?.[0]?.content?.parts;
      const output =
        Array.isArray(parts)
          ? parts
              .map((p: { text?: string }) => p.text || "")
              .join("")
              .trim() || "(empty response)"
          : "(empty response)";
      const usage = data?.usageMetadata
        ? {
            inputTokens: data.usageMetadata.promptTokenCount as number,
            outputTokens: data.usageMetadata.candidatesTokenCount as number,
          }
        : undefined;
      return NextResponse.json({ output, usage, provider: "google" });
    }

    // —— OpenAI-compatible providers ——
    const endpoints: Record<
      Exclude<Provider, "anthropic" | "google">,
      { url: string; headers?: Record<string, string> }
    > = {
      openai: { url: "https://api.openai.com/v1/chat/completions" },
      xai: { url: "https://api.x.ai/v1/chat/completions" },
      deepseek: { url: "https://api.deepseek.com/chat/completions" },
      groq: { url: "https://api.groq.com/openai/v1/chat/completions" },
      openrouter: {
        url: "https://openrouter.ai/api/v1/chat/completions",
        headers: {
          "HTTP-Referer": "https://paperclip-clone.vercel.app",
          "X-Title": "Paperclip Clone",
        },
      },
    };

    const ep = endpoints[body.provider as keyof typeof endpoints];
    if (!ep) {
      return NextResponse.json({ error: "Unknown provider" }, { status: 400 });
    }

    const result = await openaiCompatible(
      ep.url,
      key,
      model,
      system,
      user,
      ep.headers
    );
    if ("error" in result && result.error) {
      return NextResponse.json(
        { error: result.error },
        { status: result.status || 500 }
      );
    }
    return NextResponse.json({
      output: result.output,
      usage: result.usage,
      provider: body.provider,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
