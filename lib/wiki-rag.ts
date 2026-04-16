import { GoogleGenAI } from "@google/genai";

import apiCollection from "@/data/api.json";
import type { WikiAnswerSource, WikiAskResponse } from "@/lib/types";

const DEFAULT_MODEL = "gemini-2.5-flash";

const SYSTEM_PROMPT = [
  "You are ArifMind, the ArifPay API assistant.",
  "Use only the API collection provided in the context.",
  "Do not invent endpoints, fields, or behavior beyond that collection.",
  "If the answer is not in the collection, say you do not have it.",
  "Do not include any links or URLs in the response.",
  "Respond with helpful, step-by-step guidance and include code snippets.",
  "If you include bash commands, format them in fenced ```bash code blocks so they look like terminal output and remain easy to copy.",
].join("\n");

type ApiHeader = { key?: string; value?: string };
type ApiUrl = { raw?: string; protocol?: string; host?: string[]; path?: string[] };
type ApiRequest = {
  method?: string;
  header?: ApiHeader[];
  body?: { mode?: string; raw?: string };
  url?: ApiUrl;
};
type ApiItem = { name?: string; item?: ApiItem[]; request?: ApiRequest };

type ApiEndpoint = {
  id: string;
  name: string;
  method: string;
  url: string;
  displayUrl: string;
  headers: ApiHeader[];
  bodyRaw: string;
  path: string[];
  score: number;
};

function getRequiredEnv(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

const genAI = new GoogleGenAI({ apiKey: getRequiredEnv("GEMINI_API_KEY") });
const modelName = process.env.GEMINI_WIKI_MODEL || DEFAULT_MODEL;

let cachedEndpoints: ApiEndpoint[] | null = null;

function normalizeText(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function tokenize(value: string) {
  return normalizeText(value)
    .split(" ")
    .filter((token) => token.length > 2);
}

function buildUrl(url?: ApiUrl) {
  if (!url) {
    return "";
  }

  if (url.raw) {
    return url.raw;
  }

  const protocol = url.protocol ? `${url.protocol}://` : "";
  const host = url.host?.join(".") ?? "";
  const path = url.path?.join("/") ?? "";
  const slash = host && path ? "/" : "";

  return `${protocol}${host}${slash}${path}`;
}

function buildDisplayUrl(url?: ApiUrl) {
  if (!url) {
    return "";
  }

  const raw = url.raw || "";

  if (raw) {
    if (raw.includes("BASE_URL")) {
      return raw.replace(/^BASE_URL/, "").trim() || raw;
    }

    const withoutProtocol = raw.split("://")[1];
    if (withoutProtocol) {
      const slashIndex = withoutProtocol.indexOf("/");
      return slashIndex >= 0 ? withoutProtocol.slice(slashIndex) : raw;
    }

    return raw;
  }

  if (url.path && url.path.length > 0) {
    return `/${url.path.join("/")}`;
  }

  return "";
}

function flattenItems(items: ApiItem[], trail: string[] = []) {
  const endpoints: ApiEndpoint[] = [];

  for (const item of items) {
    const name = item.name || "Untitled";
    const nextTrail = [...trail, name];

    if (item.item && item.item.length > 0) {
      endpoints.push(...flattenItems(item.item, nextTrail));
      continue;
    }

    if (!item.request) {
      continue;
    }

    const url = buildUrl(item.request.url);
    const displayUrl = buildDisplayUrl(item.request.url);
    const bodyRaw = item.request.body?.raw?.replace(/\r\n/g, "\n") ?? "";
    const method = item.request.method || "";

    endpoints.push({
      id: `${endpoints.length + 1}`,
      name,
      method,
      url,
      displayUrl,
      headers: item.request.header ?? [],
      bodyRaw,
      path: trail,
      score: 0,
    });
  }

  return endpoints;
}

function getEndpoints() {
  if (cachedEndpoints) {
    return cachedEndpoints;
  }

  const rootItems = (apiCollection as { item?: ApiItem[] }).item ?? [];
  cachedEndpoints = flattenItems(rootItems);
  return cachedEndpoints;
}

function scoreEndpoint(question: string, endpoint: ApiEndpoint) {
  const tokens = tokenize(question);

  if (tokens.length === 0) {
    return 0;
  }

  const haystack = normalizeText(
    [
      endpoint.name,
      endpoint.method,
      endpoint.url,
      endpoint.path.join(" "),
      endpoint.bodyRaw,
    ].join(" ")
  );

  return tokens.reduce((score, token) => {
    return score + (haystack.includes(token) ? 1 : 0);
  }, 0);
}

function buildSourceList(endpoints: ApiEndpoint[], maxScore: number): WikiAnswerSource[] {
  return endpoints.map((endpoint, index) => ({
    id: `${index + 1}`,
    title: endpoint.path.length ? `${endpoint.path.join(" > ")} > ${endpoint.name}` : endpoint.name,
    sourceUrl: "",
    folderPath: "data/api.json",
    score: maxScore ? endpoint.score / maxScore : undefined,
  }));
}

function formatEndpointSnippet(endpoint: ApiEndpoint) {
  const headerLines = endpoint.headers
    .filter((header) => header.key && header.value)
    .map((header) => `${header.key}: ${header.value}`);

  const lines = [
    `${endpoint.method} ${endpoint.displayUrl || endpoint.url}`,
    headerLines.length ? `Headers: ${headerLines.join(", ")}` : "Headers: (none)",
  ];

  if (endpoint.bodyRaw.trim()) {
    lines.push("Body:");
    lines.push("```json");
    lines.push(endpoint.bodyRaw.trim());
    lines.push("```");
  }

  return lines.join("\n");
}

function buildFallbackAnswer(question: string, endpoints: ApiEndpoint[]) {
  const header = `Question: ${question}`;
  const intro =
    "Here are the closest matching endpoints from the API collection (data/api.json):";
  const snippets = endpoints.map((endpoint) => formatEndpointSnippet(endpoint));

  return [header, "", intro, "", ...snippets].join("\n");
}

function ensureCodeSnippet(answer: string, endpoints: ApiEndpoint[]) {
  const fenced = answer.includes("```");
  const sanitized = answer
    .replace(/\bhttp:\/\/\S+/gi, "[link removed]")
    .replace(/\bhttps:\/\/\S+/gi, "[link removed]")
    .replace(/\bBASE_URL\b/gi, "[BASE_URL]");

  if (fenced) {
    return sanitized.replace(/```(\s*)bash/gi, "```bash");
  }

  const primary = endpoints[0];
  const snippet = primary ? formatEndpointSnippet(primary) : "";

  return [sanitized.trim(), "", "Example request:", snippet].filter(Boolean).join("\n");
}

function buildPrompt(question: string, endpoints: ApiEndpoint[]) {
  const context = endpoints
    .map((endpoint) => {
      const pathLabel = endpoint.path.length ? endpoint.path.join(" > ") : "Root";
      return [
        `Name: ${endpoint.name}`,
        `Path: ${pathLabel}`,
        `Method: ${endpoint.method}`,
        `URL: ${endpoint.url}`,
        endpoint.headers.length
          ? `Headers: ${endpoint.headers
              .filter((header) => header.key && header.value)
              .map((header) => `${header.key}: ${header.value}`)
              .join(", ")}`
          : "Headers: (none)",
        endpoint.bodyRaw.trim() ? `Body: ${endpoint.bodyRaw.trim()}` : "Body: (none)",
      ].join("\n");
    })
    .join("\n\n---\n\n");

  return [
    SYSTEM_PROMPT,
    "",
    "API Collection Context:",
    context,
    "",
    `Question: ${question}`,
    "Answer:",
  ].join("\n");
}

function buildNoMatchAnswer(question: string) {
  const rootItems = (apiCollection as { item?: ApiItem[] }).item ?? [];
  const suggestions = rootItems
    .map((item) => item.name)
    .filter(Boolean)
    .slice(0, 6)
    .join(", ");

  return [
    `I could not find that in data/api.json for: ${question}`,
    suggestions ? `Try asking about: ${suggestions}.` : "Try asking about a specific payment method.",
  ].join("\n");
}

async function generateApiAnswer(question: string): Promise<WikiAskResponse> {
  const endpoints = getEndpoints();
  const scored = endpoints
    .map((endpoint) => ({
      ...endpoint,
      score: scoreEndpoint(question, endpoint),
    }))
    .filter((endpoint) => endpoint.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 6);

  if (scored.length === 0) {
    return { answer: buildNoMatchAnswer(question), sources: [] };
  }

  const maxScore = scored[0]?.score ?? 0;
  const sources = buildSourceList(scored, maxScore);
  const prompt = buildPrompt(question, scored);

  const result = await genAI.models.generateContent({
    model: modelName,
    contents: prompt,
  });

  const answer = (result as { text?: string }).text ?? "";

  return {
    answer: answer.trim()
      ? ensureCodeSnippet(answer.trim(), scored)
      : buildFallbackAnswer(question, scored),
    sources,
  };
}

export async function searchWikiKnowledgeBase(question: string) {
  const { sources } = await generateApiAnswer(question);
  return sources;
}

export async function answerWikiQuestion(question: string): Promise<WikiAskResponse> {
  return generateApiAnswer(question);
}
