import { NextResponse } from "next/server";

const API_KEY = process.env.OPENROUTER_API_KEY;
const MODEL_CANDIDATES = [
  process.env.OPENROUTER_MODEL || "openai/gpt-4o",
  process.env.OPENROUTER_FALLBACK_MODEL || "openai/gpt-4o-mini",
];
const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

function buildRequestBody(query: string, model: string) {
  return {
    model,
    messages: [
      {
        role: "user",
        content: `Answer this query concisely: ${query}`,
      },
    ],
    session_id: "snehil-portfolio-terminal",
    max_tokens: 250,
    temperature: 0.2,
  };
}

function getContentFromResponse(data: unknown): string | undefined {
  if (!data || typeof data !== "object") return undefined;
  const body = data as Record<string, unknown>;

  const choices = body.choices;
  if (Array.isArray(choices) && choices.length > 0) {
    const firstChoice = choices[0];
    if (firstChoice && typeof firstChoice === "object") {
      const choiceBody = firstChoice as Record<string, unknown>;
      const message = choiceBody.message;
      if (message && typeof message === "object") {
        const messageBody = message as Record<string, unknown>;
        const content = messageBody.content;
        if (typeof content === "string") return content;
      }
      const text = choiceBody.text;
      if (typeof text === "string") return text;
    }
  }

  const output = body.output;
  if (typeof output === "string") return output;
  if (Array.isArray(output) && output.length > 0) {
    const firstOutput = output[0];
    if (firstOutput && typeof firstOutput === "object") {
      const firstOutputBody = firstOutput as Record<string, unknown>;
      const content = firstOutputBody.content;
      if (typeof content === "string") return content;
    }
  }

  return undefined;
}

export async function POST(request: Request) {
  if (!API_KEY) {
    return NextResponse.json(
      { error: "OpenRouter API key is not configured. Set OPENROUTER_API_KEY." },
      { status: 500 }
    );
  }

  const body = await request.json();
  const query = typeof body?.query === "string" ? body.query.trim() : "";

  if (!query) {
    return NextResponse.json(
      { error: "Missing search query. Use the format: snhl search \"search content\"." },
      { status: 400 }
    );
  }

  let lastError: string | null = null;
  let result: string | null = null;

  for (const model of MODEL_CANDIDATES) {
    const payload = buildRequestBody(query, model);

    try {
      const response = await fetch(OPENROUTER_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${API_KEY}`,
        },
        body: JSON.stringify(payload),
      });

      const text = await response.text();
      if (!text) {
        lastError = `Empty response from ${model}`;
        continue;
      }

      let data: unknown;
      try {
        data = JSON.parse(text);
      } catch {
        lastError = `Invalid JSON response from ${model}: ${text}`;
        continue;
      }

      const responseData = data as Record<string, unknown>;
      const errorBody = responseData.error as { message?: string } | undefined;

      if (!response.ok) {
        lastError =
          errorBody?.message ||
          `HTTP ${response.status} ${response.statusText} from ${model}`;
        continue;
      }

      result =
        getContentFromResponse(responseData) ||
        (typeof responseData.output === "string" ? responseData.output : undefined) ||
        JSON.stringify(responseData);
      break;
    } catch (error) {
      lastError = `OpenRouter search failed: ${error instanceof Error ? error.message : String(error)}`;
      continue;
    }
  }

  if (!result) {
    return NextResponse.json(
      { error: lastError || "OpenRouter search failed without a response." },
      { status: 500 }
    );
  }

  return NextResponse.json({ result });
}
