import { readFile } from "node:fs/promises";
import path from "node:path";

import { GoogleGenAI } from "@google/genai";

import type { WikiAnswerSource, WikiAskResponse } from "@/lib/types";

const DEFAULT_MODEL = "gemini-2.5-flash";
const COMPACT_INDEX_PATH = path.join(process.cwd(), "data", "api-compact", "index.json");
const TEMPLATE_PATH = path.join(
  process.cwd(),
  "data",
  "api-compact",
  "shared",
  "templates.json"
);
const MAX_CANDIDATES = 6;
const MAX_CONTEXT_ENDPOINTS = 3;

const SYSTEM_PROMPT = [
  "You are ArifMind, the ArifPay API assistant.",
  "Use only the compact API endpoint context provided below.",
  "Do not invent endpoints, fields, or behavior beyond that context.",
  "If the answer is not in the context, say you do not have it.",
  "Do not include any links or URLs in the response.",
  "Respond with helpful, step-by-step guidance and include code snippets.",
  "If you include bash commands, format them in fenced ```bash code blocks.",
].join("\n");

type CompactIndexItem = {
  id: string;
  title: string;
  method: string;
  path: string;
  provider: string;
  flow: string;
  endpointFile: string;
  bodyKeys: string[];
  templateId: string | null;
  tags: string[];
};

type CompactIndex = {
  version: number;
  endpointCount: number;
  templateCount: number;
  items: CompactIndexItem[];
};

type EndpointBody = {
  templateId?: string | null;
  required?: string[];
  aliases?: Record<string, string[]>;
  example?: unknown;
};

type CompactEndpoint = {
  id: string;
  title: string;
  method: string;
  path: string;
  provider: string;
  flow: string;
  headers: string[];
  body: EndpointBody | null;
  tags: string[];
};

type CompactTemplate = {
  id: string;
  method: string;
  path: string;
  required: string[];
  aliases: Record<string, string[]>;
  example: unknown;
};

type TemplateFile = {
  version: number;
  items: CompactTemplate[];
};

type ScoredCandidate = CompactIndexItem & { score: number };

let cachedIndex: CompactIndex | null = null;
let cachedTemplateMap: Map<string, CompactTemplate> | null = null;
const endpointCache = new Map<string, CompactEndpoint>();

function getRequiredEnv(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

const genAI = new GoogleGenAI({ apiKey: getRequiredEnv("GEMINI_API_KEY") });
const modelName = process.env.GEMINI_WIKI_MODEL || DEFAULT_MODEL;

async function readJsonFile<T>(filePath: string): Promise<T> {
  const raw = await readFile(filePath, "utf8");
  return JSON.parse(raw) as T;
}

function normalizeText(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function tokenize(value: string) {
  return normalizeText(value)
    .split(" ")
    .filter((token) => token.length > 2);
}

async function getCompactIndex() {
  if (cachedIndex) {
    return cachedIndex;
  }

  cachedIndex = await readJsonFile<CompactIndex>(COMPACT_INDEX_PATH);
  return cachedIndex;
}

async function getTemplateMap() {
  if (cachedTemplateMap) {
    return cachedTemplateMap;
  }

  const file = await readJsonFile<TemplateFile>(TEMPLATE_PATH);
  cachedTemplateMap = new Map(file.items.map((template) => [template.id, template]));
  return cachedTemplateMap;
}

async function getEndpoint(item: CompactIndexItem) {
  const fullPath = path.join(process.cwd(), item.endpointFile);

  if (endpointCache.has(fullPath)) {
    return endpointCache.get(fullPath)!;
  }

  const endpoint = await readJsonFile<CompactEndpoint>(fullPath);
  endpointCache.set(fullPath, endpoint);
  return endpoint;
}

function scoreCandidate(question: string, item: CompactIndexItem) {
  const tokens = tokenize(question);

  if (tokens.length === 0) {
    return 0;
  }

  const haystack = normalizeText(
    [
      item.title,
      item.method,
      item.path,
      item.provider,
      item.flow,
      item.tags.join(" "),
      item.bodyKeys.join(" "),
    ].join(" ")
  );

  return tokens.reduce((score, token) => score + (haystack.includes(token) ? 1 : 0), 0);
}

function buildSourceList(candidates: ScoredCandidate[], maxScore: number): WikiAnswerSource[] {
  return candidates.map((candidate, index) => ({
    id: `${index + 1}`,
    title: candidate.title,
    sourceUrl: "",
    folderPath: candidate.endpointFile,
    score: maxScore > 0 ? candidate.score / maxScore : undefined,
  }));
}

function formatJson(value: unknown) {
  return JSON.stringify(value, null, 2);
}

function formatEndpointSnippet(endpoint: CompactEndpoint, template?: CompactTemplate | null) {
  const lines = [`${endpoint.method} ${endpoint.path || "(missing path)"}`];

  if (endpoint.headers.length > 0) {
    lines.push(`Headers: ${endpoint.headers.join(", ")}`);
  } else {
    lines.push("Headers: (none)");
  }

  const body = endpoint.body;
  if (!body) {
    lines.push("Body: (none)");
    return lines.join("\n");
  }

  const required = body.required ?? template?.required ?? [];
  lines.push(required.length > 0 ? `Required fields: ${required.join(", ")}` : "Required fields: (none)");

  const aliases = body.aliases ?? template?.aliases ?? {};
  const aliasPairs = Object.entries(aliases)
    .filter(([, values]) => values.length > 0)
    .map(([canonical, values]) => `${canonical}: ${values.join(" | ")}`);

  if (aliasPairs.length > 0) {
    lines.push(`Aliases: ${aliasPairs.join(", ")}`);
  }

  const example = body.example ?? template?.example;
  if (example) {
    lines.push("Body example:");
    lines.push("```json");
    lines.push(formatJson(example));
    lines.push("```");
  }

  return lines.join("\n");
}

function buildPrompt(
  question: string,
  contexts: Array<{ endpoint: CompactEndpoint; template: CompactTemplate | null }>
) {
  const context = contexts
    .map(({ endpoint, template }) => {
      const sectionLines = [
        `Title: ${endpoint.title}`,
        `Provider: ${endpoint.provider}`,
        `Flow: ${endpoint.flow}`,
        formatEndpointSnippet(endpoint, template),
      ];

      if (template) {
        sectionLines.push(`Shared Template ID: ${template.id}`);
      }

      return sectionLines.join("\n");
    })
    .join("\n\n---\n\n");

  return [
    SYSTEM_PROMPT,
    "",
    "API Compact Context:",
    context,
    "",
    `Question: ${question}`,
    "Answer:",
  ].join("\n");
}

function sanitizeAnswer(answer: string) {
  return answer
    .replace(/\bhttp:\/\/\S+/gi, "[link removed]")
    .replace(/\bhttps:\/\/\S+/gi, "[link removed]")
    .replace(/\bBASE_URL\b/gi, "[BASE_URL]");
}

function ensureCodeSnippet(
  answer: string,
  contexts: Array<{ endpoint: CompactEndpoint; template: CompactTemplate | null }>
) {
  const sanitized = sanitizeAnswer(answer).trim();

  if (sanitized.includes("```")) {
    return sanitized.replace(/```(\s*)bash/gi, "```bash");
  }

  const primary = contexts[0];
  const snippet = primary
    ? formatEndpointSnippet(primary.endpoint, primary.template)
    : "No endpoint context available.";

  return [sanitized, "", "Example request:", snippet].join("\n");
}

function buildNoMatchAnswer(question: string, index: CompactIndex) {
  const providers = Array.from(new Set(index.items.map((item) => item.provider))).slice(0, 8);

  return [
    `I could not find that in data/api-compact/index.json for: ${question}`,
    providers.length > 0
      ? `Try asking about one of these providers: ${providers.join(", ")}.`
      : "Try asking about a specific payment method or transfer flow.",
  ].join("\n");
}

function buildFallbackAnswer(
  question: string,
  contexts: Array<{ endpoint: CompactEndpoint; template: CompactTemplate | null }>
) {
  const snippets = contexts.map(({ endpoint, template }) => formatEndpointSnippet(endpoint, template));

  return [
    `Question: ${question}`,
    "",
    "Here are the closest matching endpoints from data/api-compact:",
    "",
    ...snippets,
  ].join("\n");
}

async function generateApiAnswer(question: string): Promise<WikiAskResponse> {
  const index = await getCompactIndex();
  const templateMap = await getTemplateMap();

  const candidates = index.items
    .map((item) => ({ ...item, score: scoreCandidate(question, item) }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, MAX_CANDIDATES);

  if (candidates.length === 0) {
    return { answer: buildNoMatchAnswer(question, index), sources: [] };
  }

  const contexts = await Promise.all(
    candidates.slice(0, MAX_CONTEXT_ENDPOINTS).map(async (candidate) => {
      const endpoint = await getEndpoint(candidate);
      const templateId = endpoint.body?.templateId ?? candidate.templateId;
      const template = templateId ? templateMap.get(templateId) ?? null : null;

      return { endpoint, template };
    })
  );

  const prompt = buildPrompt(question, contexts);
  const result = await genAI.models.generateContent({ model: modelName, contents: prompt });
  const generatedText = (result as { text?: string }).text ?? "";
  const maxScore = candidates[0]?.score ?? 0;

  return {
    answer: generatedText.trim()
      ? ensureCodeSnippet(generatedText, contexts)
      : buildFallbackAnswer(question, contexts),
    sources: buildSourceList(candidates, maxScore),
  };
}

export async function searchWikiKnowledgeBase(question: string) {
  const { sources } = await generateApiAnswer(question);
  return sources;
}

export async function answerWikiQuestion(question: string): Promise<WikiAskResponse> {
  const result = await generateApiAnswer(question);
  return { ...result, question };
}
