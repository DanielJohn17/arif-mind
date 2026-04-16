import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const ROOT_DIR = process.cwd();
const INPUT_PATH = path.join(ROOT_DIR, "data", "api.json");
const OUTPUT_DIR = path.join(ROOT_DIR, "data", "api-compact");
const ENDPOINTS_DIR = path.join(OUTPUT_DIR, "endpoints");
const SHARED_DIR = path.join(OUTPUT_DIR, "shared");

const KEY_ALIASES = {
  sessionid: "sessionId",
  sessionId: "sessionId",
  SessionId: "sessionId",
  Sessionid: "sessionId",
  phonenumber: "phoneNumber",
  phoneNumber: "phoneNumber",
  Phonenumber: "phoneNumber",
  otp: "otp",
  OTP: "otp",
};

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function normalizeUrlPath(rawUrl = "") {
  const trimmed = rawUrl.trim();

  if (!trimmed) {
    return "";
  }

  let result = trimmed.replace(/^BASE_URL/i, "").trim();
  result = result.replace(/^https?:\/\/[^/]+/i, "");

  if (!result.startsWith("/")) {
    result = `/${result}`;
  }

  return result.replace(/\/+/g, "/").trim();
}

function sanitizeJsonLike(raw) {
  return raw
    .replace(/\r\n/g, "\n")
    .replace(/\n\s*\/\/.*$/gm, "")
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/,(\s*[}\]])/g, "$1");
}

function extractBodyKeys(raw = "") {
  const keys = [];
  const seen = new Set();

  for (const match of raw.matchAll(/"([^"\\]+)"\s*:/g)) {
    const key = match[1]?.trim();
    if (!key || seen.has(key)) {
      continue;
    }

    seen.add(key);
    keys.push(key);
  }

  return keys;
}

function toCanonicalKey(key) {
  return KEY_ALIASES[key] ?? KEY_ALIASES[key.toLowerCase()] ?? key;
}

function buildAliases(keys) {
  const grouped = new Map();

  for (const key of keys) {
    const canonical = toCanonicalKey(key);
    if (!grouped.has(canonical)) {
      grouped.set(canonical, new Set());
    }

    if (canonical !== key) {
      grouped.get(canonical).add(key);
    }
  }

  const aliases = {};
  for (const [canonical, values] of grouped.entries()) {
    if (values.size > 0) {
      aliases[canonical] = Array.from(values);
    }
  }

  return aliases;
}

function inferValue(key) {
  const lower = key.toLowerCase();

  if (lower.includes("url")) return "https://example.com";
  if (lower.includes("email")) return "user@example.com";
  if (lower.includes("phone")) return "251900000000";
  if (lower.includes("otp")) return "123456";
  if (lower.includes("nonce")) return "random-nonce";
  if (lower.includes("date") || lower.includes("time")) return "2026-01-01T00:00:00Z";
  if (lower.includes("amount") || lower.includes("price") || lower.includes("quantity")) return 1;
  if (lower.includes("paymentmethods")) return ["METHOD"];
  if (lower.includes("beneficiaries")) {
    return [
      {
        accountNumber: "0000000000000",
        bank: "AWINETAA",
        amount: 1,
      },
    ];
  }
  if (lower.includes("items")) {
    return [
      {
        name: "Product",
        quantity: 1,
        price: 1,
      },
    ];
  }
  if (lower.includes("lang")) return "EN";
  if (lower.includes("currency")) return "ETB";
  if (lower.includes("accountnumber")) return "0000000000000";
  if (lower.includes("shortcode")) return "CBE";

  return "value";
}

function buildBodyExample(raw, keys) {
  if (!raw.trim() || keys.length === 0) {
    return null;
  }

  const cleaned = sanitizeJsonLike(raw);
  let parsed = null;

  try {
    parsed = JSON.parse(cleaned);
  } catch {
    parsed = null;
  }

  const example = {};
  for (const originalKey of keys) {
    const canonicalKey = toCanonicalKey(originalKey);
    const sourceValue = parsed && Object.prototype.hasOwnProperty.call(parsed, originalKey)
      ? parsed[originalKey]
      : parsed && Object.prototype.hasOwnProperty.call(parsed, canonicalKey)
        ? parsed[canonicalKey]
        : inferValue(canonicalKey);

    example[canonicalKey] = sourceValue;
  }

  return example;
}

function extractProvider(pathTrail, name) {
  const tokens = [...pathTrail, name]
    .join(" ")
    .toLowerCase();
  const known = [
    "awash",
    "amole",
    "hellocash",
    "binget",
    "yaya",
    "telebirr",
    "mpesa",
    "cbe",
    "kacha",
    "zamzam",
  ];

  for (const provider of known) {
    if (tokens.includes(provider)) {
      return provider;
    }
  }

  return "general";
}

function extractFlow(pathTrail) {
  const joined = pathTrail.join(" ").toLowerCase();
  if (joined.includes("b2c")) return "b2c";
  if (joined.includes("b2b")) return "b2b";
  if (joined.includes("direct payment")) return "c2b_direct";
  if (joined.includes("c2b")) return "c2b";
  return "general";
}

function collectTags(pathTrail, endpointName, method, pathValue, bodyKeys) {
  const tags = new Set();
  const bag = `${pathTrail.join(" ")} ${endpointName} ${method} ${pathValue}`.toLowerCase();

  for (const word of bag.split(/[^a-z0-9]+/g)) {
    if (!word || word.length < 3) continue;
    if (["create", "copy", "new", "request"].includes(word)) continue;
    tags.add(word);
  }

  for (const key of bodyKeys) {
    tags.add(key.toLowerCase());
  }

  return Array.from(tags).slice(0, 20);
}

function walkItems(items, trail = []) {
  const endpoints = [];

  for (const item of items) {
    const name = (item?.name ?? "Untitled").trim() || "Untitled";
    const nestedItems = Array.isArray(item?.item) ? item.item : null;

    if (nestedItems && nestedItems.length > 0) {
      endpoints.push(...walkItems(nestedItems, [...trail, name]));
      continue;
    }

    if (!item?.request) {
      continue;
    }

    const method = (item.request.method ?? "").trim().toUpperCase();
    const pathValue = normalizeUrlPath(item.request?.url?.raw ?? "");
    const rawBody = (item.request?.body?.raw ?? "").replace(/\r\n/g, "\n").trim();
    const keys = extractBodyKeys(rawBody);
    const canonicalKeys = Array.from(new Set(keys.map((key) => toCanonicalKey(key))));
    const aliases = buildAliases(keys);
    const example = buildBodyExample(rawBody, keys);
    const headers = (Array.isArray(item.request?.header) ? item.request.header : [])
      .map((entry) => (entry?.key ?? "").trim())
      .filter(Boolean);
    const titleTrail = [...trail, name];
    const provider = extractProvider(trail, name);
    const flow = extractFlow(trail);
    const idParts = [flow, provider, method.toLowerCase(), pathValue, name]
      .filter(Boolean)
      .map((part) => slugify(part));

    endpoints.push({
      id: idParts.join("."),
      name,
      title: titleTrail.join(" > "),
      trail,
      method,
      path: pathValue,
      headers: Array.from(new Set(headers)),
      bodyKeys: canonicalKeys,
      bodyAliases: aliases,
      bodyExample: example,
      provider,
      flow,
      tags: collectTags(trail, name, method, pathValue, canonicalKeys),
    });
  }

  return endpoints;
}

function compactBodySignature(endpoint) {
  if (endpoint.bodyKeys.length === 0) {
    return "";
  }

  return [endpoint.method, endpoint.path, endpoint.bodyKeys.join("|")].join("::");
}

async function main() {
  const raw = await readFile(INPUT_PATH, "utf8");
  const parsed = JSON.parse(raw);
  const endpoints = walkItems(Array.isArray(parsed.item) ? parsed.item : []);

  const signatureCount = new Map();
  for (const endpoint of endpoints) {
    const signature = compactBodySignature(endpoint);
    if (!signature) continue;
    signatureCount.set(signature, (signatureCount.get(signature) ?? 0) + 1);
  }

  const templates = [];
  const templateBySignature = new Map();

  for (const endpoint of endpoints) {
    const signature = compactBodySignature(endpoint);
    if (!signature || (signatureCount.get(signature) ?? 0) < 2) {
      continue;
    }

    if (!templateBySignature.has(signature)) {
      const templateId = `tpl-${String(templates.length + 1).padStart(2, "0")}`;
      templateBySignature.set(signature, templateId);
      templates.push({
        id: templateId,
        method: endpoint.method,
        path: endpoint.path,
        required: endpoint.bodyKeys,
        aliases: endpoint.bodyAliases,
        example: endpoint.bodyExample,
      });
    }
  }

  await mkdir(ENDPOINTS_DIR, { recursive: true });
  await mkdir(SHARED_DIR, { recursive: true });

  const index = [];
  for (const endpoint of endpoints) {
    const signature = compactBodySignature(endpoint);
    const templateId = templateBySignature.get(signature) ?? null;
    const fileName = `${endpoint.id}.json`;
    const endpointPath = path.join(ENDPOINTS_DIR, fileName);

    const endpointDoc = {
      id: endpoint.id,
      title: endpoint.title,
      method: endpoint.method,
      path: endpoint.path,
      provider: endpoint.provider,
      flow: endpoint.flow,
      headers: endpoint.headers,
      body:
        endpoint.bodyKeys.length === 0
          ? null
          : {
              templateId,
              required: templateId ? undefined : endpoint.bodyKeys,
              aliases: Object.keys(endpoint.bodyAliases).length > 0 ? endpoint.bodyAliases : undefined,
              example: templateId ? undefined : endpoint.bodyExample,
            },
      tags: endpoint.tags,
    };

    await writeFile(endpointPath, `${JSON.stringify(endpointDoc, null, 2)}\n`, "utf8");

    index.push({
      id: endpoint.id,
      title: endpoint.title,
      method: endpoint.method,
      path: endpoint.path,
      provider: endpoint.provider,
      flow: endpoint.flow,
      endpointFile: `data/api-compact/endpoints/${fileName}`,
      bodyKeys: endpoint.bodyKeys,
      templateId,
      tags: endpoint.tags,
    });
  }

  const glossary = {
    canonicalKeys: {
      sessionId: ["SessionId", "Sessionid", "sessionid"],
      phoneNumber: ["Phonenumber", "phonenumber"],
      otp: ["OTP"],
    },
    notes: [
      "Prefer canonical keys in prompts and examples to reduce ambiguity.",
      "Preserve provider specific casing only when exact request examples are required.",
    ],
  };

  await writeFile(
    path.join(OUTPUT_DIR, "index.json"),
    `${JSON.stringify(
      {
        version: 1,
        generatedAt: new Date().toISOString(),
        endpointCount: index.length,
        templateCount: templates.length,
        items: index,
      },
      null,
      2
    )}\n`,
    "utf8"
  );

  await writeFile(
    path.join(SHARED_DIR, "templates.json"),
    `${JSON.stringify({ version: 1, items: templates }, null, 2)}\n`,
    "utf8"
  );

  await writeFile(
    path.join(SHARED_DIR, "glossary.json"),
    `${JSON.stringify(glossary, null, 2)}\n`,
    "utf8"
  );

  console.log(`Generated compact API artifacts: ${index.length} endpoints, ${templates.length} templates.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
