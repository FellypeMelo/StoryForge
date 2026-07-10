/**
 * Extracts and parses the first complete JSON value (object or array) embedded in
 * free-form LLM output. Real models routinely wrap JSON in prose, markdown fences,
 * or trailing commentary; a bare JSON.parse throws on all of those. This walks the
 * text to the first balanced `{...}` or `[...]`, respecting strings and escapes.
 */
export function extractJson<T = unknown>(text: string): T {
  const start = findFirstJsonStart(text);
  if (start === -1) {
    throw new Error(`Nenhum JSON encontrado na resposta: ${text.slice(0, 80)}`);
  }

  const slice = extractBalanced(text, start);
  return JSON.parse(slice) as T;
}

// Earliest `{` or `[` that begins a JSON value (whichever comes first).
function findFirstJsonStart(text: string): number {
  const obj = text.indexOf("{");
  const arr = text.indexOf("[");
  if (obj === -1) return arr;
  if (arr === -1) return obj;
  return Math.min(obj, arr);
}

/**
 * Coerces an LLM field to a single string. Real models return strings where the
 * schema asked for strings, but also arrays ("critique": ["...","..."]), numbers,
 * or objects. This normalizes all of those to text instead of crashing on `.trim`.
 */
export function asText(value: unknown, joiner = " "): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value.map((v) => asText(v)).filter(Boolean).join(joiner);
  if (typeof value === "object") return Object.values(value).map((v) => asText(v)).join(joiner);
  return String(value);
}

/** Coerces an LLM field to a string[]: passes arrays through, wraps a lone string. */
export function asTextArray(value: unknown): string[] {
  if (Array.isArray(value)) return value.map((v) => asText(v)).filter(Boolean);
  const single = asText(value);
  return single ? [single] : [];
}

function extractBalanced(text: string, start: number): string {
  const open = text[start];
  const close = open === "{" ? "}" : "]";
  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let i = start; i < text.length; i++) {
    const ch = text[i];

    if (escaped) {
      escaped = false;
      continue;
    }
    if (ch === "\\") {
      escaped = true;
      continue;
    }
    if (ch === '"') {
      inString = !inString;
      continue;
    }
    if (inString) continue;

    if (ch === open) depth++;
    else if (ch === close) {
      depth--;
      if (depth === 0) return text.slice(start, i + 1);
    }
  }

  throw new Error("JSON incompleto ou não balanceado na resposta do modelo");
}
