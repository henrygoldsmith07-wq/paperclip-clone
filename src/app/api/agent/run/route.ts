import { NextRequest, NextResponse } from "next/server";

type Body = {
  provider: "openai" | "anthropic";
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
    if (body.provider !== "openai" && body.provider !== "anthropic") {
      return NextResponse.json({ error: "Unsupported provider" }, { status: 400 });
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

    if (body.provider === "openai") {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${body.apiKey.trim()}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: body.model,
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
          data?.error?.message || data?.error || res.statusText || "OpenAI error";
        return NextResponse.json(
          { error: String(msg) },
          { status: res.status }
        );
      }

      const output =
        data?.choices?.[0]?.message?.content?.trim() || "(empty response)";
      const usage = data?.usage
        ? {
            inputTokens: data.usage.prompt_tokens as number,
            outputTokens: data.usage.completion_tokens as number,
          }
        : undefined;

      return NextResponse.json({ output, usage, provider: "openai" });
    }

    // Anthropic
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": body.apiKey.trim(),
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: body.model,
        max_tokens: 600,
        temperature: 0.4,
        system,
        messages: [{ role: "user", content: user }],
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      const msg =
        data?.error?.message || data?.error || res.statusText || "Anthropic error";
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
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
