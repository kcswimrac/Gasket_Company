# Backyard Restoration — Operations & Business Plan

> Version: 1.0
> Status: Planning
> Operator: Solo (hiring planned)
> Facility: Backyard shop

---

## 1. Business Overview

Backyard Restoration operates two product lines from one facility, sharing equipment, materials, and operational systems.

### Product Line 1: Custom Gaskets

Cut-to-order replacement gaskets from customer-supplied DXF files or photos. Materials: paper, cork, rubber, fiber, neoprene. Target lead time: 1–2 business days. Direct e-commerce — customer uploads, gets instant quote, pays, we cut and ship.

### Product Line 2: Reproduction Parts (On-Demand Fabrication)

Hard-to-find restoration parts fabricated from a library of 3D-scanned originals. Segments: classic automotive, vintage tractors, marine/outboard, motorcycles, industrial machinery. Target lead time: 5–10 business days. Direct e-commerce — customer selects part/tier from catalog, pays, we fabricate and ship.

### Shared Infrastructure

Both product lines share:
- The same facility and operator
- The same quality and traceability systems
- The same shipping workflow
- The same e-commerce platform and order management
- Overlapping equipment (water jet, CNC, 3D printers)

The gasket line is the **cash flow engine** — high volume, fast turns, simple operations. The parts line is the **IP engine** — lower volume, higher margin, compounding library value.

---

## 2. Equipment & Facility

### Day-One Equipment

| Equipment | Primary Use | Gaskets | Parts |
|---|---|---|---|
| CO2 laser cutter | Gasket cutting — paper, cork, rubber, fiber, neoprene | Primary | Backup (thin sheet) |
| Water jet | Metal/thick material cutting, gasket overflow | Secondary | Primary (plate stock) |
| CNC mill / lathe | Machining billet parts, fixtures | — | Primary |
| 3D scanner | Scanning donor parts for library | — | Primary |
| 3D printers (FDM) | Test-fit mockups, forming aids, fixtures | — | Primary |
| Calipers / micrometers | Dimensional inspection | Both | Both |

### Facility Layout Zones

Design the shop in distinct zones to minimize wasted motion. Even in a backyard shop, zone discipline matters.

```
┌─────────────────────────────────────────────────┐
│                  BACKYARD SHOP                  │
│                                                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────────┐  │
│  │ INBOUND  │  │ MATERIAL │  │   CUTTING    │  │
│  │ Station  │  │  RACK    │  │  CO2 Laser   │  │
│  │          │  │          │  │  Water Jet   │  │
│  └──────────┘  └──────────┘  └──────────────┘  │
│                                                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────────┐  │
│  │   CNC    │  │ 3D PRINT │  │  INSPECTION  │  │
│  │ Mill /   │  │ + SCAN   │  │  + PACKING   │  │
│  │ Lathe    │  │ Station  │  │              │  │
│  └──────────┘  └──────────┘  └──────────────┘  │
│                                                 │
│  ┌──────────────────────────────────────────┐   │
│  │           OUTBOUND / SHIPPING            │   │
│  └──────────────────────────────────────────┘   │
└─────────────────────────────────────────────────┘
```

**Flow direction:** Inbound → Material → Cutting/Machining → Inspection → Packing → Outbound. No backtracking.

### 5S Standards (from day one)

| S | Application |
|---|---|
| **Sort** | Only tools and materials needed at each station. Nothing else. |
| **Set in Order** | Every tool has a shadow board location. Material rack labeled by type/thickness. |
| **Shine** | End-of-day cleanup. Laser bed cleared. CNC chips removed. Bench wiped. |
| **Standardize** | Same setup every morning. Same shutdown every evening. Documented. |
| **Sustain** | Weekly 15-minute audit. Photo log. Fix drift immediately. |

---

## 3. Order Flow — End to End

### 3A. Gasket Order Flow

```
Customer → Website → Upload DXF/Photo → Instant Quote → Payment
    ↓
ORDER ENTERS QUEUE
    ↓
[1] REVIEW (2 min)
    - Verify DXF geometry or confirm photo trace
    - Check material availability
    - Flag any issues → contact customer if needed
    ↓
[2] NEST & SETUP (5 min)
    - Nest part on sheet stock (maximize yield)
    - Load material into CO2 laser
    - Load cut file
    ↓
[3] CUT (varies — typically 2–15 min)
    - CO2 laser cuts gasket from sheet
    - Operator monitors first few seconds, then can prep next job
    ↓
[4] INSPECT (2 min)
    - Visual: clean edges, no tears, complete cut-through
    - Dimensional: spot-check 2–3 critical dims with calipers
    - Compare against DXF on screen
    ↓
[5] PACK & LABEL (3 min)
    - Flat pack in rigid mailer or box
    - Packing slip with order number, material, thickness
    - Shipping label (pre-printed from order system)
    ↓
[6] OUTBOUND
    - Stage for daily drop-off
    - Carrier scan at drop-off = tracking active
```

**Target cycle time (touch time): 15–25 minutes per gasket order**
**Target lead time: same-day cut, next-day ship (standard) / same-day ship (rush)**

### 3B. Reproduction Part Order Flow

```
Customer → Website → Browse Catalog → Select Part + Tier → Payment
    ↓
ORDER ENTERS QUEUE
    ↓
[1] PULL MANUFACTURING PACKAGE (2 min)
    - Retrieve the versioned package for this part + tier
    - Confirm material stock on hand
    - If material needed: order immediately, flag lead time
    ↓
[2] SETUP (10–30 min depending on process)
    - Pull tooling per tooling list
    - Load G-code / cut file per package
    - Set up workholding per setup sheet
    - First-time parts: follow setup sheet exactly
    - Repeat parts: verify against last production record
    ↓
[3] FABRICATE (varies — 15 min to several hours)
    - Run per G-code / process route
    - Multi-step parts: follow routing sequence
      (e.g., laser cut → brake form → weld → deburr)
    - Log start time, machine, operator
    ↓
[4] INSPECT (5–15 min)
    - Dimensional check per inspection plan
    - 3D scan compare against master STL baseline
    - Log inspection results
    - First article: full dimensional report
    - Production: sampling per inspection plan frequency
    ↓
[5] FINISH (if required)
    - Deburr, bead blast, brush finish
    - Outsource if needed: plating, anodize, powder coat
    - Track outsource lead time separately
    ↓
[6] PACK & LABEL (5 min)
    - Wrap part appropriately (foam, bubble, corrugated)
    - Include: packing slip, Certificate of Authenticity
    - Include: material traceability (lot number)
    - Include: contributor credit card (if applicable)
    ↓
[7] OUTBOUND
    - Stage for daily drop-off
```

**Target cycle time: varies by part complexity (30 min – 4 hours touch time)**
**Target lead time: 5–7 business days standard / 3–5 days rush**

---

## 4. Lean Value Stream Maps

### 4A. Gasket Value Stream

```
ORDER IN ──→ REVIEW ──→ NEST ──→ CUT ──→ INSPECT ──→ PACK ──→ SHIP
              2 min      5 min   2-15    2 min       3 min    daily
                                  min                         drop
              
Total touch time:  14–27 min
Wait time target:  < 4 hours (order to start cutting)
Lead time target:  < 24 hours (order to carrier scan)
```

**Waste identification (Lean 8 wastes):**

| Waste | Risk | Mitigation |
|---|---|---|
| Waiting | Orders sitting in queue while doing parts work | Batch gasket cutting: process all queued gaskets in one session, 2x daily |
| Motion | Walking between computer, laser, packing | Keep nesting/review computer adjacent to laser |
| Overprocessing | Inspecting every dimension on simple gaskets | Standard: visual + 2-3 spot dims. Full check only on first-of-kind |
| Defects | Bad cut, wrong material, wrong thickness | Pre-cut checklist: verify material, thickness, file loaded |
| Inventory | Too much sheet stock tying up cash | Stock only top 5 materials in top 3 thicknesses. Reorder at 2-week supply |
| Transport | Moving parts around the shop unnecessarily | One-piece flow: cut → inspect → pack at adjacent stations |
| Overproduction | Cutting extras "just in case" | Cut exactly what's ordered. Remnants go back to rack, not in the trash |
| Unused talent | Solo operator doing everything | Automate: nesting software, pre-printed labels, auto-quote on website |

### 4B. Reproduction Parts Value Stream

```
ORDER IN ──→ PULL PKG ──→ SETUP ──→ FABRICATE ──→ INSPECT ──→ FINISH ──→ PACK ──→ SHIP
              2 min       10-30     15 min–4hr    5-15 min    varies     5 min    daily
                           min                                                    drop
              
Total touch time:  37 min – 5+ hours
Wait time target:  < 24 hours (order to start fabrication)
Lead time target:  5–7 business days (includes outsource finishing)
```

**Key lean principle: the manufacturing package eliminates setup variability.**

Every part has a deterministic setup: tooling list, G-code file, setup sheet, workholding spec. A new operator (or future apprentice) opens the README, pulls the listed tools, loads the G-code, and runs the part. No tribal knowledge. No guessing.

---

## 5. Standard Work Procedures

### 5A. Daily Operating Rhythm

```
MORNING (first 30 min):
  □ Check order queue — count new gasket orders + part orders
  □ Print packing slips and shipping labels for today's shipments
  □ Pull materials for today's gasket batch
  □ Verify CO2 laser is clean, focused, ready
  □ Check CNC status if parts jobs are queued

GASKET BATCH 1 (next 1–2 hours):
  □ Process all queued gasket orders as a batch
  □ Nest multiple gaskets on same sheet where possible (reduce material waste)
  □ Cut → inspect → pack each order in sequence
  □ Stage packed orders at outbound

PARTS WORK (middle of day):
  □ Work queued part orders by priority (rush first, then FIFO)
  □ Follow manufacturing package for each job
  □ Log production records as you go

GASKET BATCH 2 (if new orders arrived):
  □ Same as batch 1 — process anything that came in since morning

SHIPPING (last 30 min):
  □ Final check: all staged orders have labels, slips, contents match
  □ Load vehicle
  □ Drop off at carrier
  □ Mark all orders as shipped in system

SHUTDOWN (15 min):
  □ Clean laser bed and lens
  □ Clear CNC chips
  □ Return tools to shadow board
  □ Wipe down inspection station
  □ Update production log / order status
```

### 5B. Pre-Cut Checklist (Gaskets)

Run through before every laser cut:

```
□ Correct DXF file loaded (verify filename matches order)
□ Material matches order (paper / cork / rubber / fiber / neoprene)
□ Thickness matches order (verify with calipers on sheet stock)
□ Sheet positioned correctly on laser bed
□ Laser focus height set for material thickness
□ Cut parameters loaded (speed, power, frequency for this material)
□ Test cut on scrap corner if new material or new settings
□ Fire extinguisher accessible
```

### 5C. Pre-Fabrication Checklist (Parts)

Run through before starting any fabrication job:

```
□ Manufacturing package pulled — correct version confirmed
□ Tooling list: all tools pulled and verified
□ G-code file loaded — checksum matches package
□ Workholding set up per setup sheet
□ Material verified: correct alloy, correct dimensions
□ Material lot number recorded for traceability
□ First article? → Full inspection plan required after cut
□ Production run? → Sampling frequency noted
```

---

## 6. Quality System

### 6A. Inspection Gates

| Gate | Gaskets | Parts |
|---|---|---|
| **Incoming material** | Visual: no tears, correct thickness, verify label | Visual + dimensional: correct alloy, dims within stock tolerance |
| **In-process** | Monitor cut: clean edges, no flare-ups | Per routing: check after each operation (cut, form, machine) |
| **Final inspection** | Visual + 2-3 caliper spot dims | Full inspection per plan: dimensional, surface, 3D scan compare |
| **Pre-ship** | Verify order contents match slip | Verify order contents, include COA and material cert |

### 6B. Gasket Inspection Standard

**Every gasket, every time:**
1. Visual: complete cut-through on all features (no tabs, no partial cuts)
2. Visual: clean edges (no charring, no melting, no tearing)
3. Visual: correct material (color/texture matches order)
4. Dimensional: measure OD (or largest dimension) — must be within ±1/32" of DXF
5. Dimensional: measure one bore/hole — must be within ±1/32"
6. If photo-sourced: compare cut gasket against confirmation drawing sent to customer

**Reject criteria:**
- Any partial cut-through
- Charring deeper than edge (into sealing surface)
- Any dimension off by more than ±1/16"
- Wrong material or thickness

**Reject disposition:** Scrap. Recut. Do not ship marginal parts.

### 6C. Parts Inspection Standard

**First article (new part or new package version):**
- Full dimensional inspection per inspection plan
- 3D scan compare against master STL
- Deviation map: flag anything > 0.010" from nominal
- Document results in first article report
- Retain first article as reference sample

**Production (repeat parts):**
- Dimensional spot check: 3 critical dimensions per inspection plan
- 3D scan compare if scanner is available for this run
- Visual: surface finish, deburr quality, no tool marks in visible areas
- Every 5th part on a batch run gets full dimensional check

**Reject criteria:**
- Any critical dimension out of tolerance per drawing
- Scan compare shows > 0.015" deviation on functional surfaces
- Surface defects on visible/cosmetic surfaces
- Wrong material (verify with material cert against order)

### 6D. First Article Protocol

Every new part added to the catalog must go through first article validation:

```
1. Fabricate one unit from the manufacturing package
2. Full dimensional inspection (every dimension on drawing)
3. 3D scan and compare to master STL
4. Generate deviation report
5. If pass: mark fitment_status = "scan_verified"
6. If deviations found: revise CAD/G-code, repeat from step 1
7. If customer test-fit confirms: upgrade to fitment_status = "verified"
8. Archive first article report in manufacturing package
```

---

## 7. Material Management

### 7A. Gasket Sheet Stock

**Stock on hand — top materials × top thicknesses:**

| Material | Thicknesses to Stock | Reorder Point | Order Qty |
|---|---|---|---|
| Paper gasket | 1/32", 1/16", 1/8" | 2 sheets remaining | 10 sheets |
| Cork | 1/16", 1/8" | 2 sheets remaining | 5 sheets |
| Rubber | 1/16", 1/8" | 2 sheets remaining | 5 sheets |
| Fiber | 1/16", 1/8" | 1 sheet remaining | 5 sheets |
| Neoprene | 1/16", 1/8" | 2 sheets remaining | 5 sheets |

**Sheet size standard:** Stock 24" × 24" or 12" × 12" sheets depending on supplier. Track yield per sheet.

**Uncommon thicknesses (3/32", 3/16", 1/4"):** Order per job. Add 1-2 day material lead time to customer quote.

### 7B. Metal & Part Stock

**Do not stock metal for parts fabrication.** Order per job or small batch.

Exception: if a specific part sells consistently (e.g., 5+ orders/month), pre-buy a small batch of raw material at volume pricing.

**Lot tracking:** Every piece of material gets a lot tag when received:
```
LOT-2026-001
Material: 6061-T6 Aluminum
Dims: 12" × 12" × 0.375"
Supplier: Online Metals
PO: PO-2026-0042
Received: 2026-01-15
Mill cert: on file (scan attached)
```

The lot number follows the part through production and appears on the COA.

### 7C. Inventory Audit

**Weekly (5 min):** Walk the material rack. Check stock levels against reorder points. Place orders for anything at or below reorder point.

**Monthly (30 min):** Count all sheet stock. Compare to system count. Investigate discrepancies > 1 sheet. Track yield (sheets consumed vs. gaskets shipped).

---

## 8. Shipping & Fulfillment

### 8A. Packing Standards

**Gaskets:**
- Single gasket: flat in rigid cardboard mailer with cardboard backer
- Multiple gaskets: stacked with wax paper separators, in box
- Include: packing slip (order #, material, thickness, qty)
- No tissue paper, no excessive packaging — clean and flat

**Parts:**
- Wrap in bubble/foam
- Box with adequate void fill
- Include: packing slip, Certificate of Authenticity, material traceability info
- Include: contributor credit card (if applicable)
- Fragile/heavy parts: double-box

### 8B. Carrier Strategy

- **Primary:** UPS Ground (daily drop-off at local UPS Store or access point)
- **Rush / next-day:** UPS Next Day Air or FedEx Overnight
- **Heavy parts (> 10 lbs):** FedEx Ground (better heavy-item rates)

### 8C. Daily Shipping Cadence

```
Cutoff: Orders completed by 3:00 PM → ship same day
Drop-off: 4:00–4:30 PM daily
Exception: Rush orders → can do a second drop-off or schedule pickup
```

### 8D. Shipping Metrics

Track weekly:
- Orders shipped on time (target: 98%)
- Average time from order to carrier scan
- Shipping cost as % of revenue
- Damage/return rate (target: < 1%)

---

## 9. Metrics & KPIs

### Primary KPIs (track daily/weekly)

| Metric | Target | Measurement |
|---|---|---|
| **Gasket lead time** | < 24 hours (order to ship) | Timestamp: order placed → carrier scan |
| **Parts lead time** | < 7 business days | Timestamp: order placed → carrier scan |
| **First-pass yield — gaskets** | > 97% | Parts shipped / parts cut (recuts = fail) |
| **First-pass yield — parts** | > 92% | Parts shipped / parts started |
| **On-time delivery** | > 98% | Orders shipped by promised date / total orders |
| **Orders per day** | Track trend | Count |
| **Revenue per day** | Track trend | Sum |
| **Material yield — gaskets** | > 75% | Area of gaskets cut / area of sheet consumed |

### Secondary KPIs (track monthly)

| Metric | Target | Measurement |
|---|---|---|
| **Setup time — CNC** | Trending down | Average minutes from job start to first chip |
| **Quote-to-order rate** | > 40% | Quotes generated / orders placed |
| **Customer repeat rate** | > 25% | Customers with 2+ orders / total customers |
| **Library growth** | 5+ parts/month | New catalog entries per month |
| **Contributor acquisition** | 3+ donors/month | New contributor submissions |
| **Cost of quality** | < 3% of revenue | Recuts + scrapped material + rework time |

### How to Track (Day One — Keep It Simple)

Don't build a dashboard before you have data. Start with:
1. **Spreadsheet** — one row per order, columns for timestamps, pass/fail, material used
2. **End-of-week review** — 15 minutes every Friday. Calculate KPIs. Note what broke.
3. **Graduate to Factory OS** — when volume justifies it, move tracking into the production system

---

## 10. Scaling Triggers

### When to Hire (First Operator / Apprentice)

| Trigger | Signal |
|---|---|
| You're consistently working > 10 hours/day | Capacity problem, not demand problem |
| Gasket queue regularly exceeds 12 orders by noon | Cutting is the bottleneck — need a second person on the laser |
| Parts backlog exceeds 2 weeks | Fabrication can't keep up with orders |
| Quality metrics dipping (yield < 93%) | Fatigue. You're rushing. |
| Revenue supports $20/hr part-time wage + 30% burden | Usually around $8-12k/month revenue |

**First hire profile:** Someone who can run the CO2 laser, pack orders, and do basic gasket inspection. You keep CNC work, scanning, and customer communication.

### When to Add Equipment

| Trigger | Equipment |
|---|---|
| Gasket volume > 20 orders/day regularly | Second CO2 laser or larger-bed laser |
| Parts volume requires simultaneous mill + lathe work | Second CNC machine |
| 3D scan backlog > 10 donors waiting | Dedicated scan station (not shared workspace) |
| Outsource finishing costs > $1k/month | In-house bead blast cabinet, possibly powder coat oven |

### When to Move to Bigger Space

| Trigger | Signal |
|---|---|
| Can't fit another machine without blocking flow | Physical space is the constraint |
| Noise/hours are a problem for neighbors | Zoning or community friction |
| Inventory storage overflows current space | Material + finished goods need room |
| Hired 2+ people and the shop feels cramped | Safety and efficiency both degrade |

---

## 11. Financial Guardrails

### Pricing Floors

**Gaskets:** Minimum order value of $15 (even tiny gaskets). Below that, handling and shipping costs erode margin.

**Parts:** Minimum order value of $25. Below that, setup time makes it unprofitable.

### Margin Targets

| Product | Target Gross Margin | Notes |
|---|---|---|
| Gaskets | 60–70% | Low material cost, fast cycle time, labor is main cost |
| Parts — OEM tier | 35–45% | Higher material and setup costs |
| Parts — Improved tier | 45–55% | Premium material justifies premium price |
| 3D test-fit mockups | 70%+ | PLA is cheap, print time is the cost |

### Cash Flow Rule

**Collect payment before fabrication starts.** No Net-30 until a shop account has 3+ paid orders and passes a credit check. Gaskets are always prepaid. This is non-negotiable for a solo operation.

### Monthly Financial Review

```
□ Total revenue — gaskets vs. parts split
□ Material cost — track as % of revenue (target: gaskets < 15%, parts < 30%)
□ Shipping cost — track as % of revenue (target: < 8%)
□ Labor hours — are you above or below target hourly rate?
□ Recut/rework cost — track separately
□ Equipment maintenance — log and budget
□ Is the business covering your target monthly income? If not, what's the gap?
```

---

## 12. Risk Registry

| Risk | Impact | Likelihood | Mitigation |
|---|---|---|---|
| Laser fire | High | Low | Fire extinguisher at machine. Never leave running unattended. Non-flammable surroundings. |
| Bad part ships | Medium | Medium | Pre-ship inspection gate. Reject criteria documented. Don't ship marginal. |
| Customer dispute | Low | Medium | Always send confirmation drawing before cutting. Document everything. Easy returns. |
| Equipment down | High | Medium | Identify backup shops. Water jet as laser backup for gaskets. |
| Material supply disruption | Medium | Low | 2-week stock on top materials. Multiple suppliers identified. |
| Neighbor complaints | Medium | Medium | Limit operating hours. Noise insulation on compressor. Be a good neighbor. |
| Scope creep (taking on work you can't do) | Medium | High | Define what you DON'T do. No castings, no plating, no safety-critical parts. Refer out. |
| Burnout (solo operator) | High | High | Enforce shutdown time. Track hours. Hire before breaking. |

---

## 13. What We Don't Do (Defined Scope)

Saying no is as important as saying yes. These are out of scope:

- **Safety-critical parts** — brakes, steering components, suspension structure, pressure vessels
- **Castings and forgings** — outsource these when needed
- **Plating, anodizing, powder coat** — outsource to specialists
- **Engine internals** — pistons, rods, cranks, cams
- **Electrical components** — wiring, switches, sensors, motors
- **Upholstery, rubber molding, glass** — different trades entirely
- **Engineering or certification** — we reproduce geometry, not engineering analysis

If a customer asks for something outside scope: "We don't do that, but here's who does." Being clear about boundaries builds trust.

---

*This is a living document. Update it as operations evolve. The first version is always wrong — the discipline is in revising it.*
