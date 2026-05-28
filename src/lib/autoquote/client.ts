import type {
  MaterialsResponse,
  QuoteSubmitResponse,
  QuoteResponse,
} from "./types";
import type { NeonQueryFunction } from "@neondatabase/serverless";

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

/* ─── Shared helpers used by API routes ─── */

/** Fetch a file from Vercel Blob private storage, retrying auth strategies */
export async function fetchBlob(url: string): Promise<Blob> {
  const blobToken = process.env.BLOB_READ_WRITE_TOKEN;
  let res = await fetch(url, {
    headers: blobToken ? { Authorization: `Bearer ${blobToken}` } : {},
  });
  if (!res.ok && blobToken) {
    res = await fetch(`${url}?token=${blobToken}`);
  }
  if (!res.ok) {
    res = await fetch(url);
  }
  if (!res.ok) throw new Error("Failed to fetch file from blob storage");
  return res.blob();
}

/** Look up the CAD (STEP) file URL for a part — parts.cad_file_url, then part_files */
export async function findCadUrl(
  sql: NeonQueryFunction<false, false>,
  partId: string,
  directUrl: string | null
): Promise<string | null> {
  if (directUrl) return directUrl;
  const rows = await sql`
    SELECT file_url FROM part_files
    WHERE part_id = ${partId} AND (is_step_file = true OR file_type = 'cad_step')
    ORDER BY uploaded_at DESC LIMIT 1
  `;
  return rows.length > 0 ? (rows[0].file_url as string) : null;
}

/** Price status values — a unified enum for catalog + quote APIs */
export type PriceStatus =
  | "firm"
  | "estimate"
  | "stale"
  | "needs_review"
  | "unavailable";

/** Standard quote result shape returned to the client */
export interface QuoteResult {
  variantId: string | null;
  quoteId: string | null;
  unitPrice: string | null;
  totalPrice: string | null;
  leadTimeDays: number | null;
  priceStatus: PriceStatus;
  source: string;
  message?: string;
}

/** Extract price from a terminal AutoQuote response */
export function extractPrice(
  quote: QuoteResponse
): { price: string; hasPrice: true } | { price: null; hasPrice: false } {
  const p = quote.unit_price_usd || quote.total_price_usd;
  if (p && p !== "0" && p !== "0.00") return { price: p, hasPrice: true };
  return { price: null, hasPrice: false };
}

/** Determine PriceStatus from an AutoQuote terminal response */
export function quoteStatus(quote: QuoteResponse): PriceStatus {
  const { hasPrice } = extractPrice(quote);
  if (!hasPrice) return "unavailable";
  if (quote.status === "OFFERED" && quote.buyable) return "firm";
  return "needs_review";
}

/** Build a QuoteResult from a terminal AutoQuote response + fallback info */
export function buildQuoteResult(
  quote: QuoteResponse,
  opts: { variantId: string | null; quantity: number; fallbackPrice: string | null; fallbackLeadDays: number | null }
): QuoteResult {
  const { price, hasPrice } = extractPrice(quote);
  const status = quoteStatus(quote);

  if (hasPrice) {
    return {
      variantId: opts.variantId,
      quoteId: quote.id,
      unitPrice: price,
      totalPrice: quote.total_price_usd || (parseFloat(price!) * opts.quantity).toFixed(2),
      leadTimeDays: quote.lead_time_days,
      priceStatus: status,
      source: status === "firm" ? "autoquote_live" : "autoquote_review",
      message: status === "needs_review" ? "Estimate — final price confirmed after review." : undefined,
    };
  }

  return {
    variantId: opts.variantId,
    quoteId: null,
    unitPrice: opts.fallbackPrice,
    totalPrice: opts.fallbackPrice ? (parseFloat(opts.fallbackPrice) * opts.quantity).toFixed(2) : null,
    leadTimeDays: opts.fallbackLeadDays,
    priceStatus: "unavailable",
    source: quote.status.toLowerCase(),
    message: `This part needs manual review (${quote.status}). We'll follow up within 24 hours.`,
  };
}
