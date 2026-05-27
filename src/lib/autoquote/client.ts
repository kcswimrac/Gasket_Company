import type {
  MaterialsResponse,
  QuoteSubmitResponse,
  QuoteResponse,
} from "./types";

function getConfig() {
  const baseUrl = process.env.AUTOQUOTE_BASE_URL;
  const token = process.env.AUTOQUOTE_BRIDGE_TOKEN;

  if (!baseUrl || !token) {
    throw new Error(
      "AUTOQUOTE_BASE_URL and AUTOQUOTE_BRIDGE_TOKEN must be set in .env.local"
    );
  }

  return { baseUrl: baseUrl.replace(/\/$/, ""), token };
}

function headers(): HeadersInit {
  const { token } = getConfig();
  return {
    Authorization: `Bearer ${token}`,
  };
}

/** GET /bridge/materials — list available materials for quoting */
export async function getMaterials(): Promise<MaterialsResponse> {
  const { baseUrl } = getConfig();
  const res = await fetch(`${baseUrl}/bridge/materials`, {
    headers: headers(),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(`AutoQuote materials error ${res.status}: ${body.detail}`);
  }

  return res.json();
}

/** POST /bridge/quote-from-file — submit CAD file for pricing */
export async function submitQuote(params: {
  file: Blob;
  fileName: string;
  material: string;
  quantity: number;
  process?: string;
  thicknessMm?: number;
  idempotencyKey?: string;
}): Promise<QuoteSubmitResponse> {
  const { baseUrl } = getConfig();

  const formData = new FormData();
  formData.append("file", params.file, params.fileName);
  formData.append("material", params.material);
  formData.append("quantity", String(params.quantity));
  if (params.process) formData.append("process", params.process);
  if (params.thicknessMm)
    formData.append("thickness_mm", String(params.thicknessMm));

  const hdrs: HeadersInit = { ...headers() };
  if (params.idempotencyKey) {
    (hdrs as Record<string, string>)["Idempotency-Key"] =
      params.idempotencyKey;
  }

  const res = await fetch(`${baseUrl}/bridge/quote-from-file`, {
    method: "POST",
    headers: hdrs,
    body: formData,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(`AutoQuote submit error ${res.status}: ${body.detail}`);
  }

  return res.json();
}

/** GET /bridge/quote/{id} — poll for quote result */
export async function getQuote(quoteId: string): Promise<QuoteResponse> {
  const { baseUrl } = getConfig();
  const res = await fetch(`${baseUrl}/bridge/quote/${quoteId}`, {
    headers: headers(),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(`AutoQuote poll error ${res.status}: ${body.detail}`);
  }

  return res.json();
}

/**
 * Check if a cached quote is still valid.
 * Cheaper than re-quoting — GET is not rate-limited like POST.
 *
 * Returns the quote if still OFFERED and not expired with matching
 * material/quantity, or null if a fresh quote is needed.
 */
export async function validateCachedQuote(
  cachedQuoteId: string,
  expectedMaterial: string,
  expectedQuantity: number
): Promise<QuoteResponse | null> {
  try {
    const quote = await getQuote(cachedQuoteId);

    if (quote.status !== "OFFERED") return null;
    if (!quote.buyable) return null;

    // Check expiry
    if (quote.expires_at) {
      const expiresAt = new Date(quote.expires_at);
      if (expiresAt <= new Date()) return null;
    }

    return quote;
  } catch {
    return null;
  }
}

/** Default staleness threshold for cached prices (30 days) */
export const PRICE_CACHE_TTL_MS = 30 * 24 * 60 * 60 * 1000;

/** Check if a cached price timestamp is stale */
export function isCachedPriceStale(
  lastQuotedAt: Date | null,
  ttlMs: number = PRICE_CACHE_TTL_MS
): boolean {
  if (!lastQuotedAt) return true;
  return Date.now() - lastQuotedAt.getTime() > ttlMs;
}

/**
 * Submit a file and poll until priced or failed.
 * Returns the final quote response.
 */
export async function quoteAndWait(params: {
  file: Blob;
  fileName: string;
  material: string;
  quantity: number;
  process?: string;
  thicknessMm?: number;
  idempotencyKey?: string;
  maxWaitMs?: number;
  pollIntervalMs?: number;
}): Promise<QuoteResponse> {
  const maxWait = params.maxWaitMs ?? 60_000;
  const pollInterval = params.pollIntervalMs ?? 2_000;

  const { quote_id } = await submitQuote(params);

  const deadline = Date.now() + maxWait;
  const terminalStatuses = new Set([
    "OFFERED",
    "REJECTED",
    "NEEDS_REVIEW",
    "EXPIRED",
    "ACCEPTED",
  ]);

  while (Date.now() < deadline) {
    const quote = await getQuote(quote_id);

    if (terminalStatuses.has(quote.status)) {
      return quote;
    }

    await new Promise((r) => setTimeout(r, pollInterval));
  }

  throw new Error(
    `AutoQuote timeout: quote ${quote_id} still DRAFT after ${maxWait}ms`
  );
}
