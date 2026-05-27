# Backyard Restoration — Database Schema Reference

> Source: backyard_restoration_business_idea.md (v2)
> Status: Reference only — not yet implemented
> When ready to build: use Cloudflare D1, PlanetScale, or equivalent

---

## Library & Manufacturing Tables

### parts.master

| Column | Type | Notes |
|---|---|---|
| part_id | uuid | PK |
| name | text | |
| application | text | Year/make/model (joins to vehicle table if built) |
| scan_source | jsonb | `{ contributor_id, scan_date, scanner_used }` |
| cad_file_ref | text | R2 path to master CAD |
| stl_preview_ref | text | R2 path to lightweight STL preview |
| fitment_status | enum | `verified` \| `scan_verified` \| `reference` |
| safety_class | enum | `cosmetic` \| `functional` \| `critical_excluded` |
| created_at | timestamp | |

### parts.variants

| Column | Type | Notes |
|---|---|---|
| variant_id | uuid | PK |
| part_id | uuid | FK → parts.master |
| tier | enum | `oem` \| `improved` \| `custom` \| `fitment_check` |
| material | text | e.g., 6061-T6, 304SS, mild_steel, brass_C260 |
| process_route_id | uuid | FK → parts.process_routes |
| finish_options | text[] | Array of available finishes |
| base_price | decimal | |
| lead_time_days | int | |
| manufacturing_package_id | uuid | FK → parts.manufacturing_packages |
| active | boolean | |

### parts.process_routes

| Column | Type | Notes |
|---|---|---|
| route_id | uuid | PK |
| steps | jsonb | Array of: `laser_cut`, `brake_form`, `mill`, `lathe`, `weld`, `finish`, `outsource` |
| machine_assignments | jsonb | |
| setup_time_min | int | |
| run_time_per_unit_min | int | |

### parts.manufacturing_packages

| Column | Type | Notes |
|---|---|---|
| package_id | uuid | PK |
| variant_id | uuid | FK → parts.variants |
| package_version | text | Semver — e.g., v1.2.3 |
| released_at | timestamp | |
| released_by | uuid | FK → staff |
| approved_for_production | boolean | |
| notes | text | |

**Version control convention:**
```
v1.0.0 — first article approved, ready for production
v1.1.0 — switched to faster endmill, updated tool list + G-code
v1.1.1 — tightened a tolerance per customer feedback
v2.0.0 — material change, requires re-validation
```

### parts.mfg_artifacts

| Column | Type | Notes |
|---|---|---|
| artifact_id | uuid | PK |
| package_id | uuid | FK → parts.manufacturing_packages |
| artifact_type | enum | `cad_native` \| `step` \| `stl` \| `gcode` \| `tool_list` \| `setup_sheet` \| `fixture_cad` \| `inspection_plan` \| `first_article_report` |
| machine_target | text | e.g., haas_vf2, tormach_1100, trumpf_3030, amada_brake |
| file_ref | text | R2 path |
| checksum | text | SHA256 — detects drift |
| created_at | timestamp | |

### parts.tooling_requirements

| Column | Type | Notes |
|---|---|---|
| tooling_id | uuid | PK |
| package_id | uuid | FK → parts.manufacturing_packages |
| tool_type | enum | `endmill` \| `drill` \| `tap` \| `brake_die` \| `laser_nozzle` \| `fixture` |
| spec | text | e.g., "1/4 inch 3-flute carbide, AlTiN coated" |
| vendor_pn | text | e.g., Maritool MT-EM-3F-250 |
| tool_offset_number | int | For tool table preload |
| consumable | boolean | Track wear life |
| notes | text | |

### parts.fitment_proofs

| Column | Type | Notes |
|---|---|---|
| proof_id | uuid | PK |
| part_id | uuid | FK → parts.master |
| customer_id | uuid | FK → customers |
| photo_refs | text[] | Array of R2 paths |
| vehicle_vin | text | Optional |
| confirmed_by | uuid | FK → staff |
| verified_at | timestamp | |

### parts.contributors

| Column | Type | Notes |
|---|---|---|
| contributor_id | uuid | PK |
| donor_name | text | |
| discount_rate (default at-cost pricing)
| lifetime_contributions | decimal | |
| tax_w9_on_file | boolean | |
| public_credit_name | text | Displayed on part page |

---

## Order & Production Tables

### orders.line_items

| Column | Type | Notes |
|---|---|---|
| order_id | uuid | FK → orders |
| variant_id | uuid | FK → parts.variants |
| quantity | int | |
| batch_id | uuid | Nullable — filled when batched with other orders |
| manufacturing_status | enum | `queued` \| `in_progress` \| `qc` \| `shipped` |
| qc_scan_result_ref | text | R2 path to scan comparison result |

### orders.production_records

| Column | Type | Notes |
|---|---|---|
| record_id | uuid | PK |
| line_item_id | uuid | FK → orders.line_items |
| package_version | text | Which version of the artifact bundle made this |
| machine_id | text | Which physical machine ran it |
| operator_id | uuid | FK → staff |
| tool_serials | text[] | Which actual tools, for wear tracking |
| material_lot | text | Which heat / mill cert |
| started_at | timestamp | |
| completed_at | timestamp | |
| inspection_result | uuid | FK → inspection records |
| gcode_checksum | text | Proves the right file ran |

---

## Verified Fit Badge System

| Badge | Meaning | Trigger |
|---|---|---|
| 🟢 Verified Fit | Produced, test-fitted on actual vehicle, photo proof on file | Internal QC + customer install confirmation |
| 🟡 Scan Verified | CAD matches donor scan within tolerance, no physical test-fit | After scan + first article production |
| 🟠 Reference Model | Built from photos, measurements, or community CAD. Fitment not guaranteed. | Pre-validation state |

Customers can opt into fitment confirmation: $10-20 credit for sending back install photos. Crowdsourced QC.

---

## Product Tier Strategy

| Tier | Material Match | Process | Price | Customer |
|---|---|---|---|---|
| **3D Test-Fit** | PLA 3D print | FDM printed | Low ($10-20) | Fitment verification before committing |
| **OEM Spec** | Same as original | Same process where feasible | Baseline | Concours, originality-focused |
| **Improved** | Upgraded material | Better process, same fitment | +30-60% | Daily-driver restorers |
| **Custom** | Customer chooses | Modified per request | Variable | Hot rod, modified, race builds |

---

## Manufacturing Package Directory Structure

Example: Ford 8N instrument panel, Improved tier (16ga stainless):

```
manufacturing_package_id: pkg_8N_dash_improved_v1.2.0
├── cad/
│   ├── 8N_dash_v1.2.0.f3d         (Fusion native)
│   ├── 8N_dash_v1.2.0.step
│   ├── 8N_dash_v1.2.0.stl
│   └── 8N_dash_drawing_v1.2.0.pdf
├── routing/
│   ├── 01_laser_trumpf_3030.nc    (cut profile)
│   ├── 01_laser_setup.pdf
│   ├── 02_brake_amada_hfe50.json  (bend sequence + angles)
│   ├── 02_brake_setup.pdf
│   ├── 03_weld_fixture.step
│   └── 03_weld_notes.md
├── tooling/
│   ├── tooling_list.json
│   ├── brake_dies_required.pdf
│   └── consumables.json
├── inspection/
│   ├── inspection_plan.json
│   ├── first_article_report.pdf
│   └── scan_baseline.stl
└── README.md                       (overview, gotchas, history)
```

---

## Pricing Formula

```
unit_price = (machine_hours × hourly_rate)
           + setup_cost
           + material_cost
           + finishing_cost
           + margin (target 35-45%)
```

Batch discount when 5+ orders queue for the same part.

---

## Contributor Acquisition Paths

1. **Contributor program** — Owner sends original (broken is fine). Gets free reproduction + replacement at cost + named credit.
2. **Curated acquisition** — Source donor parts from junkyards, swap meets, eBay, club connections.
3. **CAD upload** — Third parties upload existing CAD. First-order discount. Flagged as Reference Model until physically verified.

---

## Target Segments

- Classic automotive (~$36B global)
- Vintage tractors (Ford N-series, Farmall, JD, Massey, AC)
- Vintage outboards and inboard marine (Mercury, OMC, Chris-Craft)
- Vintage motorcycles (British, Japanese, Italian)
- Antique machinery (Bridgeport, South Bend, Hardinge)
- Military vehicle restoration
- Pinball, arcade, and slot machine restoration
- Vintage aircraft (Experimental, antique GA)
- Stationary engines / hit-and-miss

---

*This document is a reference for future database implementation. The current site uses hardcoded mock data in `src/lib/restoration/catalog.ts`.*
