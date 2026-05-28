# Backyard Restorations → AutoQuote — Dependency Audit

> **Type:** Read-only, evidence-based audit. No integration code was changed.
> **Repo / branch:** `kcswimrac/Gasket_Company` @ `claude/admiring-goodall-wUDVa`
> **Code state audited:** rebased onto `origin/main` commit `b453a3e`
> *("refactor: Unified quote/estimate endpoint with shared helpers")*
> **Date:** 2026-05-28
>
> Every claim below is grounded in a `path:line` reference or a quoted config
> value. Where something is assumed rather than implemented, it is labeled
> **ASSUMED**. Status tags: **IMPLEMENTED / PARTIAL / SHIM / MOCKED / PLANNED /
> IMPLIED / DEAD**.

---

## 0. Executive Summary

Backyard Restorations (a Next.js 15 / Drizzle / Neon-Postgres storefront)
integrates with AutoQuote as an **outbound HTTP client only**. It calls three
`/bridge/*` endpoints on a single base URL with a single bearer token, polls for
a price, caches the result in Postgres, and renders it in the catalog/cart UI.
There is **no inbound surface** (no webhooks, no callbacks), **no tenant config**,
and **no shared database**. The coupling is therefore narrow but real.

**The five things that matter most for extraction:**

1. **Two pricing engines exist for the same gasket materials.** Restorations
   runs a **local** gasket engine (`src/lib/pricing/engine.ts`,
   paper/cork/rubber/fiber/neoprene) reached via `POST /api/quote`. AutoQuote's
   catalog now *also* carries `GASKET_*` materials under a LASER process. The
   repo contains a **direct internal contradiction**: one doc says gaskets stay
   local "AutoQuote's LASER process is metal-only"
   (`docs/database-schema-reference.md:172`), while another doc is an
   **AutoQuote gasket rate card** already whitelisting all five `GASKET_*` codes
   (`docs/autoquote-rate-card-values.md:1,143-156`). This is the single
   highest-risk area. **Recommendation: keep gasket pricing local short-term,
   with a written authority rule; do not route gaskets to AutoQuote until a
   reconciliation/tolerance contract exists.** (See §"Critical: Duplicate Logic".)

2. **Deployment is hard-coupled to a Tailscale tailnet host over plain HTTP.**
   `.env.example:5` = `AUTOQUOTE_BASE_URL=http://forge-mac-mini.<your-tailnet>.ts.net`.
   The base URL itself is env-driven (good, no hardcoded fallback in code), but
   the *only* example assumes the MIL Mac mini on a tailnet, unencrypted. Moving
   AutoQuote to a new repo + new host + public HTTPS URL changes this value and
   the network reachability model.

3. **Polling out-paces the documented rate limit, with no backoff.** Each quote
   = 1 `POST` + up to ~30 `GET` polls (2 s interval, 60 s deadline —
   `client.ts:155-156,169-176`). The `/bridge` limiter is ~10 req/min **per
   route**. Any quote that isn't terminal within ~18–20 s will exceed the GET
   limit; there is **no 429 handling and no retry/backoff** anywhere, so it
   degrades silently to base price.

4. **The bridge token is manually provisioned with no rotation story.**
   `.env.example:6` = `AUTOQUOTE_BRIDGE_TOKEN=<token-from-operator-via-secure-channel>`.
   No rotation, expiry, or refresh logic exists in code or docs.

5. **The canonical scopes are over-granted vs. what's exercised.** The token was
   granted `read:digest, read:needs-review, read:rate-card, write:requests` +
   policy `QUOTE_REQUESTED:AUTO_EXECUTE` as `restorations-agent`. **None of these
   scope strings appear anywhere in the codebase** (token is opaque to the
   client). By endpoint usage, Restorations only exercises **read:rate-card**
   (`GET /bridge/materials`), **write:requests** (`POST /bridge/quote-from-file`),
   and quote reads (`GET /bridge/quote/{id}`). `read:digest` and
   `read:needs-review` are **not exercised** — a migration cleanup item.

**Current functional dependency:** Catalog price display and cart-add live
pricing depend on AutoQuote (with graceful base-price fallback). **Checkout does
not call AutoQuote** — it is a stub (`checkout/page.tsx:24-38`) that submits no
order and takes no payment; it only renders price snapshots captured at
cart-add time.

---

## 1. Current Integration — Every Reference

### 1.1 Client module — `src/lib/autoquote/client.ts` — **IMPLEMENTED & LIVE**

> **Changed by the recent refactor.** Before `b453a3e` this module was a fully
> implemented but *entirely unused* facade (nothing imported it; routes inlined
> their own `fetch`). As of `b453a3e` it is the **shared integration module**.

Importers (`grep "from \"@/lib/autoquote\""`):
- `src/app/api/catalog/route.ts:3` → `isCachedPriceStale`, `type PriceStatus`
- `src/app/api/cart/quote/route.ts:3-10` → `validateCachedQuote`, `quoteAndWait`,
  `fetchBlob`, `findCadUrl`, `buildQuoteResult`, `type QuoteResult`

Exports and live status (usages counted *outside* `client.ts`):

| Export | Lines | Used externally? | Notes |
|---|---|---|---|
| `getConfig()` | 8-19 | internal | reads env, strips trailing slash, throws if unset |
| `headers()` | 21-26 | internal | `Authorization: Bearer ${token}` |
| `getMaterials()` | 28-41 | **0 — DEAD** | admin route inlines its own fetch instead |
| `submitQuote()` | 43-81 | 0 (internal) | reached via `quoteAndWait` |
| `getQuote()` | 83-96 | 0 (internal) | reached via `quoteAndWait`/`validateCachedQuote` |
| `validateCachedQuote()` | 105-126 | **2 — LIVE** | now used by quote route |
| `PRICE_CACHE_TTL_MS` | 129 | 0 (internal) | 30 days; default arg of `isCachedPriceStale` |
| `isCachedPriceStale()` | 132-138 | **3 — LIVE** | now used by catalog route |
| `quoteAndWait()` | 144-182 | **3 — LIVE** | submit + poll loop |
| `fetchBlob()` | 187-200 | **3 — LIVE** | NEW helper (blob fetch w/ auth retry) |
| `findCadUrl()` | 203-215 | **3 — LIVE** | NEW helper (CAD lookup) |
| `PriceStatus` type | 218-223 | **5 — LIVE** | NEW: `firm｜estimate｜stale｜needs_review｜unavailable` |
| `QuoteResult` iface | 226-235 | **9 — LIVE** | NEW client-facing shape |
| `extractPrice()` | 238-244 | 0 (internal) | reached via `buildQuoteResult` |
| `quoteStatus()` | 247-252 | 0 (internal) | reached via `buildQuoteResult` |
| `buildQuoteResult()` | 255-285 | **3 — LIVE** | NEW result builder |

### 1.2 Routes / server code that touch AutoQuote

| File | Role | Status |
|---|---|---|
| `src/app/api/cart/quote/route.ts` | **Unified** pricing endpoint (variant *and* part-level). Submits, polls, caches, returns `QuoteResult`. | **IMPLEMENTED** |
| `src/app/api/cart/estimate/route.ts` | **Thin back-compat shim**: server-to-server `fetch` to `/api/cart/quote` (`:14`), remaps `{quote}`→`{estimate}` (`:26-36`). | **SHIM** |
| `src/app/api/catalog/route.ts` | Reads DB cached prices; computes `pricingStatus`/`resolvedPrice` via `isCachedPriceStale` (`:119,157`). Does **not** call the bridge. | **IMPLEMENTED** |
| `src/app/api/admin/autoquote/route.ts` | Health check / material list. Inlines `GET /bridge/materials` (`:20`). | **IMPLEMENTED** |

### 1.3 DB models — `src/lib/db/schema.ts` — **IMPLEMENTED**
- `parts`: `last_estimate_price` (`:90`), `last_estimate_at` (`:91`),
  `last_estimate_material` (`:92`).
- `part_variants`: `autoquote_material_code` (`:111`), `autoquote_process`
  (`:112`), `last_quoted_price` (`:113`), `last_quoted_at` (`:114`),
  `last_quote_id` (`:115`), `last_quote_expires_at` (`:116`), `available`
  (`:117`, default `false`).
- `order_line_items`: `autoquote_quote_id` (`:206`).
- `autoquote_cache` table (`:213-231`) — full schema in §2.4.
- `quote_status` pgEnum (`:54-62`) — **lowercase** values
  (`draft, pending, offered, needs_review, accepted, rejected, expired`).

### 1.4 UI components

| File | What it renders | Status |
|---|---|---|
| `src/app/catalog/CatalogPage.tsx` | `PartCard` + `PartModal`. Shows `variant.resolvedPrice`/`pricingStatus`/`quotable` and `part.estimate`. "Get Price"/"Get Estimate"/"Get Live Price" → `POST /api/cart/quote` (`:144,517`). "Live price from AutoQuote • Cached/Fresh" badge gated on `priceStatus === "firm"` (`:443-447`). | **IMPLEMENTED** |
| `src/app/admin/page.tsx` | `AutoQuotePanel` — "Test Connection" → `GET /api/admin/autoquote`; lists materials (`:277,293,302`). | **IMPLEMENTED** |
| `src/app/admin/parts/page.tsx` | Variant manager. `loadMaterials()` populates a **dynamic `<select>`** from the bridge (`:183-197,299-302`); free-text `<input>` fallback only when disconnected (`:303-305`, placeholder `"e.g., AL_6061"`). Shows `last_quoted_price` (`:269`). | **IMPLEMENTED** |
| `src/app/checkout/page.tsx` | Order summary from cart snapshots. **No AutoQuote call. Payment + order submission are stubs** (`:24-38,148-157`). | **PARTIAL / STUB** |
| `src/lib/cart.tsx` | Client-side localStorage cart; `updateQuantity` recomputes total locally **without re-quoting** (`:70-76`). | **IMPLEMENTED** |

### 1.5 Docs / config / plans

| File | Reference | Status |
|---|---|---|
| `.env.example:4-6` | `AUTOQUOTE_BASE_URL`, `AUTOQUOTE_BRIDGE_TOKEN` | config |
| `docs/database-schema-reference.md:151-172` | "AutoQuote Material Code Map (contract locked)"; **gasket-stays-local rule (`:172`)**; header says "Reference only — not yet implemented"; "current site uses hardcoded mock data in `src/lib/restoration/catalog.ts`" (`:266`) | DOC (partly stale) |
| `docs/autoquote-rate-card-values.md:1,6-156` | **AutoQuote gasket rate card**; whitelists all five `GASKET_*` + metals + `BRASS_C260` (`:143-156`) | DOC / PLANNED |
| `docs/operations-business-plan.md:206` | "Automate: …, auto-quote on website" | PLANNED / aspirational |

### 1.6 Which user workflows depend on AutoQuote today

| Workflow | Depends on AutoQuote? | Evidence | Status |
|---|---|---|---|
| **Catalog price display** | Indirectly — shows DB-cached `last_quoted_price`/`last_estimate_price`, else `base_price`; 30-day staleness + expiry (`catalog/route.ts:116-159`). No live bridge call on render. | `catalog/route.ts` | **IMPLEMENTED** |
| **Cart-add live pricing** | Yes — on-demand `POST /api/cart/quote` → submit + poll (`CatalogPage.tsx:144,517` → `cart/quote/route.ts`). Falls back to base price if unconfigured/unreachable. | `cart/quote/route.ts` | **IMPLEMENTED** |
| **Checkout** | No direct call; relies on cart-time snapshots. Order submit/payment are stubs. | `checkout/page.tsx:24-38` | **PARTIAL / STUB** |
| **Gasket quoting** (`/api/quote`, `/api/photo-to-dxf`) | **No** — local engine only. | `api/quote/route.ts:82-88` | **IMPLEMENTED (separate)** |
| **Admin bridge test / variant material picker** | Yes — `GET /bridge/materials`. | `admin/autoquote/route.ts:20` | **IMPLEMENTED** |

---

## 2. Data Flow Map

### 2.1 Outbound calls (the entire boundary)

All three are inlined in routes or reached via `client.ts`. Auth on every call:
`Authorization: Bearer ${AUTOQUOTE_BRIDGE_TOKEN}`.

**(a) `GET /bridge/materials`** — `client.ts:31`, `admin/autoquote/route.ts:20`
- Request: headers only.
- Response consumed → `MaterialsResponse` (`types.ts:7-11`): `updated_at`,
  `rate_card_version`, `materials[]` where each material =
  `{ code, display_name, processes[] }` (`types.ts:1-5`).
- Used to populate the admin variant material dropdown and a health badge.

**(b) `POST /bridge/quote-from-file`** — `client.ts:69`, via `quoteAndWait`
- Multipart form (`client.ts:55-61`): `file` (Blob), `material` (string),
  `quantity` (string), optional `process`, optional `thickness_mm`.
  Optional header `Idempotency-Key` (`:63-67`).
- **Note:** `thickness_mm` and `Idempotency-Key` are plumbed in `client.ts` but
  the callers **never pass them** (`cart/quote/route.ts:126-132,191-196` omit
  `thicknessMm`/`idempotencyKey`). So in practice only
  `file, material, quantity[, process]` cross the wire.
- Response → `QuoteSubmitResponse` (`types.ts:13-19`): `quote_id`,
  `bridge_request_id`, `shop_id`, `status: "pending"`, `quote_url`. **Only
  `quote_id` is read**; `bridge_request_id`, `shop_id`, `quote_url` (here) are
  ignored.

**(c) `GET /bridge/quote/{quote_id}`** — `client.ts:86`
- Polled every 2 s up to 60 s (`client.ts:155-156`) until a terminal status, or
  used once for cheap cache validation (`validateCachedQuote`).
- Response → `QuoteResponse` (`types.ts:37-51`). Field consumption in §2.3.

### 2.2 Identifiers
- `quote_id` — primary cross-boundary id; stored as
  `part_variants.last_quote_id`, `autoquote_cache.quote_id`,
  `order_line_items.autoquote_quote_id`.
- `bridge_request_id`, `shop_id` — defined in the type, **never read**.
- `part_family_id` — **does not exist** anywhere in this codebase
  (searched). If AutoQuote uses one, Restorations is unaware of it.

### 2.3 `QuoteResponse` field consumption (`types.ts:37-51`)

| Field | Read? | Persisted? | Evidence |
|---|---|---|---|
| `id` | ✅ | ✅ `last_quote_id`, `autoquote_cache.quote_id` | `cart/quote:147,156` |
| `status` | ✅ | ✅ `autoquote_cache.quote_status` (lowercased) | `client.ts:113,172`; `cart/quote:156` |
| `buyable` | ✅ | ✅ `autoquote_cache.buyable` | `client.ts:114,250`; `cart/quote:156` |
| `unit_price_usd` | ✅ | ✅ `last_quoted_price`, `autoquote_cache.unit_price` | `client.ts:241`; `cart/quote:145,156` |
| `total_price_usd` | ✅ | ✅ `autoquote_cache.total_price` | `client.ts:241,267`; `cart/quote:156` |
| `lead_time_days` | ✅ | ✅ `autoquote_cache.lead_time_days` | `client.ts:268`; `cart/quote:156` |
| `confidence` | partial | ✅ `autoquote_cache.confidence` | `cart/quote:156` — stored, **not shown in UI** |
| `expires_at` | ✅ | ✅ `last_quote_expires_at`, `autoquote_cache.expires_at` | `client.ts:117-119`; `cart/quote:148,156` |
| `dfm_issues` | ❌ (stored only) | ✅ `autoquote_cache.dfm_issues` (jsonb) | `cart/quote:156` — never rendered |
| `cost_breakdown` | ❌ (stored only) | ✅ jsonb | `cart/quote:156` — never rendered |
| `routing` | ❌ (stored only) | ✅ jsonb | `cart/quote:156` — never rendered |
| `quote_url` | ❌ (stored only) | ✅ `autoquote_cache.quote_url` | `cart/quote:156` — never surfaced to customer |
| `behavior_gate` | ❌ | ❌ | **defined in type (`types.ts:40`), never read or stored** |

### 2.4 Cache schema & TTL — `autoquote_cache` is **WRITE-ONLY**

`autoquote_cache` (`schema.ts:213-231`): `id, variant_id (FK part_variants),
quote_id (NOT NULL), quote_status (enum NOT NULL), unit_price, total_price,
lead_time_days, confidence numeric(3,2), buyable, dfm_issues jsonb,
cost_breakdown jsonb, routing jsonb, material_code, quantity, expires_at,
quote_url, created_at`. **No unique index on `quote_id`; no index on
`variant_id`.**

- **INSERT** only at `cart/quote/route.ts:155`.
- **DELETE** on cleanup at `admin/variants/route.ts:64`,
  `admin/parts/route.ts:180`.
- **No `SELECT` anywhere** → the table is an append-only audit log, **not a
  functional cache**. It is never read back to serve a price.

The functional "cache" is two-tier and lives elsewhere:
1. **Cheap re-validation** (`cart/quote:82-101`): if `variant.last_quote_id`
   exists, `validateCachedQuote` does a **live `GET /bridge/quote/{id}`**
   (`client.ts:111`) and accepts it only if `status==="OFFERED" && buyable &&
   not expired`. So even a "cache hit" calls the bridge.
2. **Catalog display** (`catalog/route.ts:116-159`): reads stored
   `last_quoted_price` and treats it fresh only if
   `!isCachedPriceStale(last_quoted_at)` (30-day TTL via `PRICE_CACHE_TTL_MS`,
   `client.ts:129,132-138`) **and** not past `last_quote_expires_at`; otherwise
   falls back to `base_price` → part `last_estimate_price`. This is the only
   path that serves a price **without** calling the bridge.

**Status states** (`QuoteStatus`, `types.ts:21-27`, **UPPERCASE**):
`DRAFT, OFFERED, ACCEPTED, REJECTED, NEEDS_REVIEW, EXPIRED`. Terminal set in
`quoteAndWait` (`client.ts:161-167`) includes all but `DRAFT`. **buyable
semantics:** a price is "firm" only when `status==="OFFERED" && buyable`
(`client.ts:250`); any other terminal state with a price is surfaced as a
`needs_review` estimate (`client.ts:251,270-271`).
**Casing mismatch (latent bug risk):** the API returns UPPERCASE; the DB enum
and the insert store **lowercase** via `quote.status.toLowerCase()`
(`cart/quote:156`). Comparisons against the *live* response use UPPERCASE — they
work today only because nothing reads the lowercased cache back.

### 2.5 End-to-end sequence (variant "Get Price")
```
CatalogPage "Get Price" (variantId, qty)
  → POST /api/cart/quote
      ├─ if !AUTOQUOTE_* configured → base_price, priceStatus "estimate"
      ├─ if last_quote_id → validateCachedQuote → GET /bridge/quote/{id}
      │     └─ OFFERED & buyable & !expired → return "autoquote_cached" (firm)
      ├─ findCadUrl (parts.cad_file_url → part_files)         [no CAD → base_price]
      ├─ no autoquote_material_code → base_price
      └─ fetchBlob → quoteAndWait:
            POST /bridge/quote-from-file  → quote_id
            loop GET /bridge/quote/{id} every 2s ≤60s until terminal
            buildQuoteResult → priceStatus firm | needs_review | unavailable
            UPDATE part_variants.last_quoted_*   (if price)
            INSERT autoquote_cache               (always, write-only)
  → client stores snapshot in localStorage cart (no re-quote on qty change)
  → checkout renders snapshot; submits nothing (stub)
```

---

## 3. Functional Dependency

**Relied upon (must stay stable through extraction):**
- Three endpoint contracts: `GET /bridge/materials`,
  `POST /bridge/quote-from-file` (multipart `file,material,quantity[,process]`),
  `GET /bridge/quote/{id}`.
- Bearer-token auth on a single base URL.
- `QuoteResponse` field names/shapes actually consumed (§2.3) and the **string**
  type of `unit_price_usd`/`total_price_usd` (code does `parseFloat`, treats
  `"0"`/`"0.00"` as "no price" — `client.ts:242`).
- Status vocabulary (the 6 UPPERCASE states) and `buyable`.
- Material **codes verbatim** (e.g., `AL_6061`, `SS_304`) — stored in
  `part_variants.autoquote_material_code` and sent as the `material` field.

**Missing-but-assumed in the roadmap (not implemented):**
- AutoQuote pricing for **gaskets** (`GASKET_*` LASER) — the rate-card doc
  assumes it; no code routes to it. **ASSUMED/PLANNED.**
- Surfacing `dfm_issues`, `confidence`, `cost_breakdown`, `routing`, `quote_url`
  to users — stored but never rendered. **IMPLIED.**
- Any quote-acceptance / order-submission handshake (`ACCEPTED` is a terminal
  status but no flow produces it; checkout is a stub). **PLANNED.**
- Idempotency on submit and `thickness_mm` for sheet parts — plumbed in
  `client.ts` but never passed. **IMPLIED.**

---

## 4. Coupling & Migration Risk

| # | Risk | Evidence | Severity |
|---|---|---|---|
| R1 | **Tailnet + HTTP base URL.** Only example host is `forge-mac-mini.<tailnet>.ts.net` over `http://`. App server must be on the tailnet to resolve it. New host/HTTPS URL breaks reachability assumptions. | `.env.example:5` | **High** |
| R2 | **Polling exceeds rate limit, no backoff/429 handling.** ≤30 GET/min/quote vs ~10/min limit; `getQuote` throws on non-OK → silent fallback to base price. POST also limited (10/min) — a few concurrent "Get Price" clicks exhaust it. | `client.ts:155-156,90-95,169-176` | **High** |
| R3 | **Token lifecycle undefined.** Manual "operator via secure channel"; no rotation/expiry/refresh in code or docs. Owner of rotation unknown. | `.env.example:6` | **High** |
| R4 | **Material-code contract is implicit & partly hardcoded.** Codes must match AutoQuote verbatim; `AL_6061` is hardcoded as a default in two routes (see §"Material Codes"). A rename on the AutoQuote side silently breaks quoting. | `cart/quote:177`, `cart/estimate:32` | **Med-High** |
| R5 | **No inbound contract.** No webhook/callback; long quotes that exceed 60 s are lost (timeout → base price). Async/`NEEDS_REVIEW` resolution has no delivery path. | `client.ts:178-181` | **Med** |
| R6 | **Path prefix `/bridge/*` hardcoded** at every call site. If the standalone service re-namespaces (e.g., `/v1/quotes`), all call sites change. | `client.ts:31,69,86`; `admin/autoquote:20` | **Med** |
| R7 | **`getMaterials` dead + admin route inlines fetch.** Two implementations of the same call drift apart; the "canonical" client function isn't the source of truth for the admin path. | `admin/autoquote:20` vs `client.ts:28` | **Low-Med** |
| R8 | **Write-only `autoquote_cache`, unindexed.** Grows unbounded, never read; `dfm_issues/cost_breakdown/routing/quote_url` are dead storage. | `schema.ts:213-231` | **Low** |
| R9 | **Status casing mismatch** (UPPERCASE API vs lowercase DB enum). Latent bug if the cache table ever becomes read. | `cart/quote:156` vs `types.ts:21-27` | **Low** |

**What literally breaks when AutoQuote moves to a new repo + host + base URL:**
- *Nothing in code needs editing for the URL itself* — it's read from
  `AUTOQUOTE_BASE_URL` (no hardcoded fallback). Operators set the new value.
- **Breaks** if: the tailnet is no longer reachable from the app host (R1);
  the path prefix changes from `/bridge/*` (R6); the token format/issuer changes
  without re-provisioning (R3); response field names/casing/`status` vocabulary
  change (§3); or the public host enforces stricter rate limits (R2).

---

## 5. CRITICAL — Duplicate / Parallel Quoting Logic (Gaskets)

### 5.1 Where the local gasket engine lives & what it computes
- `src/lib/pricing/engine.ts:23-93` — `calculateQuote(geometry, material,
  thickness, quantity, rush)`:
  `materialCost = totalArea × baseCostPerSqIn × thicknessMult` (`:38`);
  `cuttingCost = totalCutLength × cuttingCostPerLinIn` (`:41`);
  `complexityCharge = max(0, holeCount−2) × 0.75` (`:44-45`);
  `unitPrice = max(sum, MIN_UNIT_PRICE=$3.00)` (`:48-49`);
  volume discounts 5–20% (`materials.ts:75-81`); `+$5 handling`, optional rush
  `$25 + 20%` (`:62,65-68`).
- Rates (`src/lib/pricing/materials.ts:19-59`): `paper/cork/rubber/fiber/
  neoprene`, six thicknesses `1/32"–1/4"`.
- Material IDs are a **closed TS/Zod enum** `"paper"|"cork"|"rubber"|"fiber"|
  "neoprene"` (`pricing/types.ts:1`, `validation.ts` `MATERIAL_IDS`) — fully
  dynamic, **no `GASKET_*` codes**, no AutoQuote coupling.
- Entry points: `POST /api/quote` (DXF, `api/quote/route.ts:82-88`) and
  `POST /api/photo-to-dxf` (photo→DXF→`calculateQuote`). Public gasket UI:
  `src/app/gaskets/page.tsx` + `src/components/QuoteBuilder.tsx`.

### 5.2 Where the boundary is decided
There is **no runtime router** between the engines. Separation is **by endpoint /
product line**, not by material logic:
- Gaskets → `/api/quote` (local) — geometry-priced from an uploaded DXF.
- Catalog parts → `/api/cart/quote` (AutoQuote) — gated on
  `variant.autoquote_material_code` being set (`cart/quote:113-120`); if unset →
  `base_price`. Gasket catalog variants would simply have no
  `autoquote_material_code`, so they never reach the bridge today.

### 5.3 Is any product priced by BOTH? Which wins?
- **Today: no.** A given request hits exactly one engine determined by which
  endpoint the UI calls. No code sends the same item to both.
- **But the same physical shape can be priced two different ways** if it exists
  both as a gasket DXF upload (local) and as a catalog part with an
  `autoquote_material_code` (AutoQuote). There is **no reconciliation** and **no
  authority rule in code** — only the doc assertion that gaskets stay local
  (`docs/database-schema-reference.md:172`), which is contradicted by the
  AutoQuote gasket rate card (`docs/autoquote-rate-card-values.md`).

### 5.4 Can the two diverge? What does the customer/operator see?
**Yes, materially.** The local engine has a **$3.00 floor** and gasket-specific
area/cut/hole formula; AutoQuote's LASER gasket pricing is a different rate card
entirely. For the same part they will rarely agree. Today the customer simply
sees whichever endpoint the page called — there is **no badge, warning, or
tie-break** distinguishing "local gasket price" from "AutoQuote price," and no
operator-facing divergence alert.

### 5.5 Recommendation — **Run both, with a documented authority rule (keep gaskets local short-term)**
- **Keep the local gasket engine authoritative for gaskets short-term.** It is
  deterministic, instant, offline-resilient, and already powers the public
  gasket flow. Routing gaskets to a remote service would add the rate-limit,
  latency, and availability risks in §4 to a currently-robust path.
- **Codify the rule** (today it lives only in a doc that another doc
  contradicts): one explicit config/flag that says "GASKET_* → local engine,"
  not an accident of which endpoint is wired.
- **Do not enable AutoQuote gasket pricing until** there is (a) a reconciliation
  test proving the two engines agree within a defined tolerance, and (b) a
  single source of truth for the rate card. Resolve the
  `database-schema-reference.md:172` ↔ `autoquote-rate-card-values.md`
  contradiction before any migration.
- **Long-term ownership:** if AutoQuote becomes the org-wide pricing authority,
  migrate gasket *rates* into AutoQuote but keep a local *fallback* engine for
  availability — with AutoQuote as the documented winner when both return.

---

## 6. Future Integration Contract (post-separation)

**APIs Restorations needs from standalone AutoQuote (stable):**
- `GET /materials` (rate-card/whitelist + version), `POST /quote-from-file`
  (multipart), `GET /quote/{id}` — same shapes as today, **versioned** path
  (`/v1/...`) so a re-namespace doesn't break clients (addresses R6).
- A documented, versioned `QuoteResponse` (field names, `status` vocabulary,
  string-typed prices) and an OpenAPI/JSON schema published by AutoQuote.

**Events/webhooks (new, to remove polling — R2/R5):**
- A `quote.priced` / `quote.needs_review` webhook (or SSE) so Restorations can
  stop polling and can resolve quotes that exceed 60 s asynchronously.

**Auth / tenant config (new):**
- A per-tenant API credential with **least-privilege scopes actually used**
  (`read:rate-card`, `write:requests`, quote read) and a **rotation mechanism**
  (R3). Drop `read:digest`/`read:needs-review` unless a feature starts using
  them. A `shop_id`/tenant id should be explicit in config rather than implied.

**UI embeds:** none required today (Restorations renders its own UI). A hosted
`quote_url` already exists in responses if a "view full quote" link is ever
surfaced.

**Who should own what after separation:**

| Data / Logic | Owner | Rationale |
|---|---|---|
| Material rate cards & DFM rules | **AutoQuote** | Manufacturing domain; already the system of record. |
| Quote computation for **metals/plastics** | **AutoQuote** | Needs CAD/DFM analysis Restorations can't do. |
| **Gasket** rate logic | **Restorations (local) short-term** → AutoQuote long-term with local fallback | See §5.5. |
| Catalog, parts, variants, material→code mapping | **Restorations** | Product catalog is Restorations' domain. |
| Quote *caching/snapshotting*, cart, checkout/orders | **Restorations** | Customer-facing state. |
| `quote_id` lifecycle & status truth | **AutoQuote** | It owns the quote. |

---

## 7. Open Questions
1. **Gasket authority:** Is the intent to migrate gaskets into AutoQuote
   (rate-card doc) or keep them local (schema-reference doc:172)? These
   contradict; which wins?
2. **Token rotation:** Who rotates `AUTOQUOTE_BRIDGE_TOKEN`, how often, and via
   what channel? Is there an expiry?
3. **Rate limits on the new host:** Will ~10 req/min/route persist? If so,
   polling must change to webhooks or longer intervals + backoff.
4. **Network model:** Will the standalone service be reachable over public
   HTTPS, or remain tailnet-only? Does the app server move too?
5. **`part_family_id` / `shop_id`:** Does AutoQuote expect these on submit?
   Restorations sends neither today.
6. **Async/NEEDS_REVIEW resolution:** How should a quote that finalizes after
   the 60 s deadline be delivered back (email, webhook, re-poll)?
7. **Scope cleanup:** Confirm `read:digest` and `read:needs-review` can be
   revoked (unused in code).

---

## 8. Action Items (prioritized)

### Critical (do before/at extraction)
- **C1. Resolve the gasket authority contradiction** (`database-schema-reference.md:172`
  vs `autoquote-rate-card-values.md`) and write one explicit routing rule.
  Keep gaskets local until reconciled (§5.5).
- **C2. Replace polling with webhooks or add 429-aware backoff** to fit the
  ~10 req/min/route limit (R2) — otherwise quoting degrades on the new host.
- **C3. Define token provisioning + rotation** ownership and mechanism (R3).
- **C4. Pin a versioned API contract** (path prefix, `QuoteResponse` schema,
  status vocabulary, string-price semantics) with AutoQuote before the move
  (R6, §3).
- **C5. Confirm network reachability** (public HTTPS vs tailnet) for the new
  host and update `AUTOQUOTE_BASE_URL` guidance (R1).

### Important
- **I1. Remove hardcoded `AL_6061` defaults** (`cart/quote:177`,
  `cart/estimate:32`); make the default explicit/config-driven (R4).
- **I2. Right-size scopes** — drop unused `read:digest`, `read:needs-review`
  (§0, Open Q7).
- **I3. Unify the materials call** — have the admin route use
  `getMaterials()` (or delete it) to remove drift (R7).
- **I4. Fix status casing** (UPPERCASE↔lowercase) or document it; add a unique
  index on `autoquote_cache.quote_id` if the table is ever read (R8/R9).
- **I5. Decide on dead response fields** — either surface or stop storing
  `dfm_issues`, `confidence`, `cost_breakdown`, `routing`, `quote_url`,
  `behavior_gate` (§2.3).

### Later
- **L1. Pass `thickness_mm` / `Idempotency-Key`** through to submit (plumbed,
  unused) (§2.1b).
- **L2. Add an operator divergence alert** if local vs AutoQuote gasket prices
  differ once both are enabled (§5.4).
- **L3. Surface a "view full quote" link** via `quote_url`; prune/retain
  `autoquote_cache` with a retention policy (R8).
- **L4. Finish checkout** (real order persistence + Stripe) so cart-time
  AutoQuote snapshots become real orders (`checkout/page.tsx:24-38`).

---

### Appendix A — Files referenced
```
src/lib/autoquote/client.ts            src/app/api/cart/quote/route.ts
src/lib/autoquote/types.ts             src/app/api/cart/estimate/route.ts
src/lib/db/schema.ts                   src/app/api/catalog/route.ts
src/lib/pricing/engine.ts              src/app/api/admin/autoquote/route.ts
src/lib/pricing/materials.ts           src/app/api/quote/route.ts
src/lib/pricing/types.ts               src/app/api/photo-to-dxf/route.ts
src/lib/validation.ts                  src/app/catalog/CatalogPage.tsx
src/lib/cart.tsx                       src/app/checkout/page.tsx
src/lib/restoration/catalog.ts         src/app/admin/parts/page.tsx
.env.example                           src/app/admin/page.tsx
docs/database-schema-reference.md      docs/autoquote-rate-card-values.md
docs/operations-business-plan.md
```

### Appendix B — Material-code "hardcoded" verification
The picker IS dynamic where it counts (admin variant manager loads codes from
`GET /bridge/materials`, `admin/parts/page.tsx:183-197,299-302`). But the claim
of **zero hardcoded codes is false**:
- **App logic:** `cart/quote/route.ts:177` and `cart/estimate/route.ts:32` —
  `material || "AL_6061"` default.
- **UI:** `admin/parts/page.tsx:304` — placeholder `"e.g., AL_6061"` in the
  free-text fallback input.
- **Docs / catalog copy:** `docs/database-schema-reference.md:157-164` (code
  map), `docs/autoquote-rate-card-values.md:6-156` (full rate card incl. all
  `GASKET_*` + `BRASS_C260`). `src/lib/restoration/catalog.ts:96,131,183,288`
  use `"PLA 3D print"` display strings (label, not the `PLA` code).
- **Tests / fixtures / seed:** none exist in the repo (no test/spec/seed files
  found), so no hardcoded codes there.
```
```
