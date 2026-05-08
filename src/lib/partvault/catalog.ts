export type PartCategory =
  | "brackets"
  | "trim"
  | "engine"
  | "interior"
  | "electrical"
  | "hardware";

export type PartStatus = "available" | "coming_soon";

export interface CatalogPart {
  id: string;
  name: string;
  category: PartCategory;
  status: PartStatus;
  description: string;
  compatibleWith: string;
  material: string;
  priceRange: string;
  leadTime: string;
  dimensions: string;
}

export const CATEGORIES: { id: PartCategory; label: string; icon: string }[] = [
  { id: "brackets", label: "Brackets & Mounts", icon: "bracket" },
  { id: "trim", label: "Trim & Cosmetic", icon: "trim" },
  { id: "engine", label: "Engine & Drivetrain", icon: "engine" },
  { id: "interior", label: "Interior", icon: "interior" },
  { id: "electrical", label: "Electrical", icon: "electrical" },
  { id: "hardware", label: "Hardware & Fasteners", icon: "hardware" },
];

export const CATALOG: CatalogPart[] = [
  {
    id: "pv-001",
    name: "Alternator Mounting Bracket",
    category: "brackets",
    status: "available",
    description:
      "Upper alternator adjustment bracket. 3D-scanned from NOS original. Precision-fabricated to exact OEM spec with correct bolt pattern and pivot slot.",
    compatibleWith: "1967–1969 Chevrolet Camaro, Nova (Small Block)",
    material: "6061 Aluminum",
    priceRange: "$85–$120",
    leadTime: "5–7 business days",
    dimensions: '6.2" × 1.8" × 0.375"',
  },
  {
    id: "pv-002",
    name: "Dash Bezel Insert — Radio Delete",
    category: "trim",
    status: "available",
    description:
      "Reproduction radio delete plate for factory dash opening. Scanned from original piece with correct curvature and snap-fit tabs.",
    compatibleWith: "1970–1972 Chevrolet Chevelle, El Camino",
    material: "ABS (chrome-plated finish available)",
    priceRange: "$45–$65",
    leadTime: "7–10 business days",
    dimensions: '7.5" × 2.25" × 0.5"',
  },
  {
    id: "pv-003",
    name: "Carburetor Linkage Bell Crank",
    category: "engine",
    status: "available",
    description:
      "Throttle linkage pivot arm. Reverse-engineered from worn original with corrected pivot bore geometry. Includes bushing.",
    compatibleWith: "1965–1967 Ford Mustang (289 4V)",
    material: "4140 Steel, zinc-plated",
    priceRange: "$55–$75",
    leadTime: "5–7 business days",
    dimensions: '4.1" × 2.3" × 0.25"',
  },
  {
    id: "pv-004",
    name: "Window Crank Handle",
    category: "interior",
    status: "available",
    description:
      "Manual window regulator handle. 3D-scanned from mint original with correct knurl pattern and spline fitment.",
    compatibleWith: "1968–1972 GM A-Body (Chevelle, GTO, Cutlass, Skylark)",
    material: "Zinc die-cast, chrome finish",
    priceRange: "$35–$50",
    leadTime: "7–10 business days",
    dimensions: '4.5" × 1.2" × 0.9"',
  },
  {
    id: "pv-005",
    name: "Starter Motor Shim Kit",
    category: "hardware",
    status: "available",
    description:
      "Precision-machined starter alignment shims in three thicknesses. Fits all GM small/big block starters with standard bolt pattern.",
    compatibleWith: "GM Small Block / Big Block (universal)",
    material: "1018 Steel",
    priceRange: "$18–$28",
    leadTime: "3–5 business days",
    dimensions: '3.0" OD × 2.5" ID',
  },
  {
    id: "pv-006",
    name: "Headlight Bucket Adjuster Ring",
    category: "electrical",
    status: "available",
    description:
      "Headlight retaining ring and adjustment mechanism. Scanned from rust-free donor, reproduced with correct spring tension tabs.",
    compatibleWith: "1960–1966 Chevrolet C10 Pickup",
    material: "Stainless steel",
    priceRange: "$40–$55",
    leadTime: "5–7 business days",
    dimensions: '7.0" OD × 5.75" ID',
  },
  {
    id: "pv-007",
    name: "Exhaust Manifold Heat Riser Valve",
    category: "engine",
    status: "coming_soon",
    description:
      "Exhaust crossover heat riser with thermostatic spring and butterfly valve. Currently being scanned and validated.",
    compatibleWith: "1955–1962 Chevrolet Small Block",
    material: "Cast iron",
    priceRange: "$90–$130",
    leadTime: "TBD",
    dimensions: '5.8" × 3.2" × 2.5"',
  },
  {
    id: "pv-008",
    name: "Glove Box Door Hinge Set",
    category: "interior",
    status: "available",
    description:
      "Left and right glove box lid hinges. Scanned from NOS pair. Includes correct pivot pins and spring detent.",
    compatibleWith: "1969–1970 Ford Mustang",
    material: "Zinc die-cast",
    priceRange: "$30–$45",
    leadTime: "5–7 business days",
    dimensions: '2.8" × 0.6" × 0.4" (each)',
  },
  {
    id: "pv-009",
    name: "Transmission Crossmember Bushing",
    category: "brackets",
    status: "available",
    description:
      "Transmission mount insulator bushing. 3D-modeled from original with OEM durometer polyurethane for improved durability.",
    compatibleWith: "1964–1967 Pontiac GTO (Muncie 4-speed)",
    material: "Polyurethane (75A durometer)",
    priceRange: "$22–$35",
    leadTime: "5–7 business days",
    dimensions: '3.5" × 2.0" × 1.75"',
  },
  {
    id: "pv-010",
    name: "Hood Latch Release Cable Bracket",
    category: "brackets",
    status: "coming_soon",
    description:
      "Firewall-mounted cable guide bracket for hood release. Being reverse-engineered from corroded original — improved corrosion resistance.",
    compatibleWith: "1971–1973 Plymouth Barracuda",
    material: "Stainless steel",
    priceRange: "$28–$40",
    leadTime: "TBD",
    dimensions: '2.2" × 1.5" × 0.8"',
  },
  {
    id: "pv-011",
    name: "Voltage Regulator Mounting Plate",
    category: "electrical",
    status: "available",
    description:
      "Inner fender mounting plate for external voltage regulator. Includes correct ground strap tab and drain holes.",
    compatibleWith: "1966–1969 Dodge Charger",
    material: "14-gauge steel, E-coat finish",
    priceRange: "$32–$48",
    leadTime: "5–7 business days",
    dimensions: '4.5" × 3.2" × 0.075"',
  },
  {
    id: "pv-012",
    name: "Wiper Pivot Bezel Nut — Special Flange",
    category: "hardware",
    status: "available",
    description:
      "Chromed flange nut for windshield wiper pivot shaft. Scanned from NOS with correct thread pitch and knurl.",
    compatibleWith: "1963–1965 Chevrolet Corvette",
    material: "Brass, chrome-plated",
    priceRange: "$15–$22",
    leadTime: "3–5 business days",
    dimensions: '1.1" OD × 0.5" tall',
  },
];
