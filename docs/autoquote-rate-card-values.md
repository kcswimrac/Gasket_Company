# AutoQuote Rate Card — Gasket Materials + BRASS_C260
# Values marked with ~ are estimates — operator should calibrate from real cut data

## Gasket Materials (LASER process on CO2 laser)

### GASKET_PAPER
```yaml
GASKET_PAPER:
  name: "Paper Gasket Sheet"
  density_g_mm3: 0.00075          # ~0.75 g/cm³ — compressed fiber paper
  price_usd_per_g: 0.003          # ~cheap — bulk sheet stock
  processes: [LASER]
  plate_thicknesses_mm: [0.4, 0.8, 1.6, 2.4, 3.2, 6.4]   # 1/64" through 1/4"
  laser_feedrate_mm_per_min_at_3mm: 18000   # ~very fast — paper cuts easily
  laser_max_thickness_mm: 6.4               # 1/4" max
  laser_assist_gas_usd_per_min: 0.0         # air assist only
  laser_reflective: false
  min_feature_mm: 0.5                       # ~CO2 kerf on paper
  finishing_fraction: 0.0
```

### GASKET_CORK
```yaml
GASKET_CORK:
  name: "Cork Gasket Sheet"
  density_g_mm3: 0.00045          # ~0.45 g/cm³ — cork composite is light
  price_usd_per_g: 0.008          # ~more expensive than paper
  processes: [LASER]
  plate_thicknesses_mm: [0.8, 1.6, 2.4, 3.2, 4.8, 6.4]
  laser_feedrate_mm_per_min_at_3mm: 12000   # ~slightly slower, cork chars
  laser_max_thickness_mm: 6.4
  laser_assist_gas_usd_per_min: 0.0
  laser_reflective: false
  min_feature_mm: 0.8                       # ~cork tears below this
  finishing_fraction: 0.0
```

### GASKET_RUBBER
```yaml
GASKET_RUBBER:
  name: "Rubber Gasket Sheet"
  density_g_mm3: 0.0012           # ~1.2 g/cm³ — SBR/NBR rubber
  price_usd_per_g: 0.006          # ~mid-range
  processes: [LASER]
  plate_thicknesses_mm: [0.8, 1.6, 2.4, 3.2, 4.8, 6.4]
  laser_feedrate_mm_per_min_at_3mm: 10000   # ~rubber absorbs more energy
  laser_max_thickness_mm: 6.4
  laser_assist_gas_usd_per_min: 0.0
  laser_reflective: false
  min_feature_mm: 0.8
  finishing_fraction: 0.0
```

### GASKET_FIBER
```yaml
GASKET_FIBER:
  name: "Fiber Gasket Sheet"
  density_g_mm3: 0.0015           # ~1.5 g/cm³ — compressed aramid/cellulose
  price_usd_per_g: 0.007          # ~mid-range, denser than paper
  processes: [LASER]
  plate_thicknesses_mm: [0.8, 1.6, 2.4, 3.2, 4.8, 6.4]
  laser_feedrate_mm_per_min_at_3mm: 9000    # ~slower — fiber is denser
  laser_max_thickness_mm: 6.4
  laser_assist_gas_usd_per_min: 0.0
  laser_reflective: false
  min_feature_mm: 0.6
  finishing_fraction: 0.0
```

### GASKET_NEOPRENE
```yaml
GASKET_NEOPRENE:
  name: "Neoprene Gasket Sheet"
  density_g_mm3: 0.0013           # ~1.3 g/cm³ — closed-cell neoprene
  price_usd_per_g: 0.010          # ~most expensive gasket material
  processes: [LASER]
  plate_thicknesses_mm: [0.8, 1.6, 2.4, 3.2, 4.8, 6.4]
  laser_feedrate_mm_per_min_at_3mm: 8000    # ~slowest gasket material — melts, doesn't burn
  laser_max_thickness_mm: 6.4
  laser_assist_gas_usd_per_min: 0.0
  laser_reflective: false
  min_feature_mm: 1.0                       # ~neoprene is rubbery, small features distort
  finishing_fraction: 0.0
```

### Tool wear (all gasket materials)
```yaml
tool_wear_usd_per_min:
  GASKET_PAPER: 0.0
  GASKET_CORK: 0.0
  GASKET_RUBBER: 0.0
  GASKET_FIBER: 0.0
  GASKET_NEOPRENE: 0.0
```

---

## BRASS_C260 (operator to verify)

```yaml
BRASS_C260:
  name: "Brass C260 (Cartridge Brass 70Cu/30Zn)"
  density_g_mm3: 0.00853          # standard for 70/30 brass
  price_usd_per_g: 0.012          # ~estimate — operator verify from supplier
  standard_ref: "C26000"
  cte_per_K: 19.9e-6
  elastic_modulus_GPa: 110
  processes: [CNC_3AXIS, LASER]
  plate_thicknesses_mm: [1.6, 3.2, 6.4, 9.5, 12.7]   # ~common stock
  mrr_mm3_per_min:
    CNC_3AXIS_ROUGH: 8000         # ~slower than C360 (harder alloy)
    CNC_3AXIS_FINISH: 3000        # ~estimate
  drill_feed_mm_per_min: 600      # ~estimate — C260 work-hardens
  finishing_fraction: 0.15
  laser_feedrate_mm_per_min_at_3mm: 2500    # ~slow for brass on CO2
  laser_max_thickness_mm: 6.0
  laser_assist_gas_usd_per_min: 0.40        # N2 required
  laser_reflective: true                     # DFM will warn

tool_wear_usd_per_min:
  BRASS_C260: 0.05
  BRASS_360: 0.05                            # adding C360 too while here
```

---

## Process additions (operator confirms)

```yaml
STEEL_1018:
  processes: [CNC_3AXIS, WATERJET, LASER, SHEET_METAL]   # add SHEET_METAL

SS_304:
  processes: [CNC_3AXIS, WATERJET, LASER, SHEET_METAL]   # add SHEET_METAL
```

---

## Auto-quote whitelist (expand to all 14)

```yaml
auto_quote_materials:
  - AL_6061
  - STEEL_1018
  - STEEL_4140
  - SS_304
  - SS_316
  - BRASS_360
  - BRASS_C260
  - PLA
  - PETG
  - GASKET_PAPER
  - GASKET_CORK
  - GASKET_RUBBER
  - GASKET_FIBER
  - GASKET_NEOPRENE
```

---

## Notes

- All gasket feedrates are estimates for a ~60W CO2 laser. Real values depend on actual wattage, focus, and air pressure. Operator should run test cuts and update.
- Gasket thicknesses listed in mm but mapped from imperial standard: 1/32"=0.8, 1/16"=1.6, 3/32"=2.4, 1/8"=3.2, 3/16"=4.8, 1/4"=6.4
- BRASS_C260 MRR and drill feed are conservative estimates. C260 work-hardens more than C360 — real shop data should replace these.
- All values marked ~ should be calibrated from actual production data.
