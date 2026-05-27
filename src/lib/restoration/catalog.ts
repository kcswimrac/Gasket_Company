export type Segment = "tractor" | "marine" | "automotive" | "motorcycle" | "industrial";
export type FitmentStatus = "verified" | "scan_verified" | "reference";
export type Tier = "oem" | "improved" | "custom" | "fitment_check";

export interface TierOption {
  tier: Tier;
  material: string;
  process: string;
  price: string;
  available: boolean;
}

export interface Contributor {
  name: string;
  location: string;
}

export interface CatalogEntry {
  id: string;
  name: string;
  segment: Segment;
  application: string;
  fitment: FitmentStatus;
  description: string;
  dimensions: string;
  tiers: TierOption[];
  leadTime: string;
  contributor?: Contributor;
  scanDate?: string;
}

export interface BountyEntry {
  id: string;
  partName: string;
  application: string;
  segment: Segment;
  requestedBy: number;
  bounty: string;
  status: "seeking_donor" | "scanning" | "modeling";
}

export const SEGMENTS: { id: Segment; label: string }[] = [
  { id: "tractor", label: "Vintage Tractors" },
  { id: "marine", label: "Marine & Outboard" },
  { id: "automotive", label: "Classic Automotive" },
  { id: "motorcycle", label: "Vintage Motorcycle" },
  { id: "industrial", label: "Industrial & Machinery" },
];

export const FITMENT_BADGES: Record<FitmentStatus, { label: string; color: string; description: string }> = {
  verified: {
    label: "Verified Fit",
    color: "emerald",
    description: "Produced, test-fitted on actual vehicle, photo proof on file",
  },
  scan_verified: {
    label: "Scan Verified",
    color: "gold",
    description: "CAD matches donor scan within tolerance, dimensionally validated",
  },
  reference: {
    label: "Reference Model",
    color: "copper",
    description: "Built from photos or community CAD — fitment not yet physically verified",
  },
};

export const CATALOG: CatalogEntry[] = [
  // ── TRACTOR ──
  {
    id: "br-001",
    name: "Instrument Panel",
    segment: "tractor",
    application: "1939–1952 Ford 8N / 9N / 2N",
    fitment: "verified",
    description: "Full dash instrument panel with correct gauge cutouts, ignition switch hole, and choke control slot. Scanned from rust-free NOS original.",
    dimensions: '16.5" × 6.2" × 2.1"',
    tiers: [
      { tier: "oem", material: "18-gauge mild steel", process: "Laser-cut + brake-formed, black phosphate", price: "$89", available: true },
      { tier: "improved", material: "16-gauge 304 stainless", process: "Laser-cut + brake-formed, brushed finish", price: "$139", available: true },
      { tier: "custom", material: "Customer spec", process: "Quoted", price: "Quoted", available: true },
    ],
    leadTime: "5–7 business days",
    contributor: { name: "Dave M.", location: "Tulare, CA" },
    scanDate: "2025-11-14",
  },
  {
    id: "br-002",
    name: "Battery Tray",
    segment: "tractor",
    application: "1939–1953 Farmall H / M",
    fitment: "scan_verified",
    description: "Under-hood battery mounting tray with drain holes and correct bolt pattern. Reverse-engineered from corroded original with reinforced corners.",
    dimensions: '10.5" × 7.2" × 3.0"',
    tiers: [
      { tier: "fitment_check", material: "PLA 3D print", process: "FDM 3D printed for test-fit only", price: "$15", available: true },
      { tier: "oem", material: "16-gauge mild steel", process: "Laser + brake + weld, black oxide", price: "$75", available: true },
      { tier: "improved", material: "14-gauge 304 stainless", process: "Laser + brake + TIG weld, passivated", price: "$125", available: true },
      { tier: "custom", material: "Customer spec", process: "Quoted", price: "Quoted", available: true },
    ],
    leadTime: "5–7 business days",
    contributor: { name: "Jim & Sons Tractor", location: "Modesto, CA" },
    scanDate: "2025-12-03",
  },
  {
    id: "br-003",
    name: "Air Pre-Cleaner Cap",
    segment: "tractor",
    application: "1947–1954 Ford 8N",
    fitment: "verified",
    description: "Mushroom-style air pre-cleaner cap. Spun from original scan with correct press-fit diameter and rain shield profile.",
    dimensions: '4.5" OD × 3.2" tall',
    tiers: [
      { tier: "oem", material: "20-gauge mild steel", process: "Spun, zinc-plated", price: "$45", available: true },
      { tier: "improved", material: "18-gauge 304 stainless", process: "Spun, brushed", price: "$72", available: true },
      { tier: "custom", material: "Customer spec", process: "Quoted", price: "Quoted", available: false },
    ],
    leadTime: "7–10 business days",
    contributor: { name: "Yesterday's Tractors Community", location: "OR" },
    scanDate: "2026-01-19",
  },
  {
    id: "br-004",
    name: "PTO Shield Bracket",
    segment: "tractor",
    application: "1953–1964 Ford NAA / 600 / 800 Series",
    fitment: "reference",
    description: "Rear PTO guard mounting bracket. Currently being modeled from donor photographs and community-provided measurements.",
    dimensions: '6.0" × 2.8" × 0.188"',
    tiers: [
      { tier: "fitment_check", material: "PLA 3D print", process: "FDM 3D printed for test-fit only", price: "$12", available: true },
      { tier: "oem", material: "3/16\" mild steel", process: "Laser + brake, black phosphate", price: "$38", available: false },
      { tier: "improved", material: "3/16\" 304 stainless", process: "Laser + brake, passivated", price: "$58", available: false },
      { tier: "custom", material: "Customer spec", process: "Quoted", price: "Quoted", available: false },
    ],
    leadTime: "TBD — scanning in progress",
  },

  // ── MARINE ──
  {
    id: "br-010",
    name: "Cowl Latch Keeper",
    segment: "marine",
    application: "1955–1965 Mercury Kiekhaefer Mark 25 / 55 / 75",
    fitment: "verified",
    description: "Engine cowl latch receiver. Salt-corrosion failure is universal on these. Scanned from NOS, reproduced in marine-grade stainless for permanent fix.",
    dimensions: '1.8" × 0.9" × 0.5"',
    tiers: [
      { tier: "oem", material: "Zinc die-cast", process: "Investment cast, chrome-plated", price: "$42", available: true },
      { tier: "improved", material: "316 stainless steel", process: "CNC machined, passivated", price: "$68", available: true },
      { tier: "custom", material: "Customer spec", process: "Quoted", price: "Quoted", available: true },
    ],
    leadTime: "5–7 business days",
    contributor: { name: "T-Mike's Vintage Outboards", location: "FL" },
    scanDate: "2025-10-08",
  },
  {
    id: "br-011",
    name: "Throttle Linkage Pivot Bracket",
    segment: "marine",
    application: "1958–1968 Johnson / Evinrude 35–75 HP",
    fitment: "scan_verified",
    description: "Remote control cable pivot bracket. Mounts to engine block. Includes correct pivot bushing bore and cable retention slot.",
    dimensions: '3.2" × 1.5" × 0.75"',
    tiers: [
      { tier: "oem", material: "Aluminum 356 cast", process: "Sand cast + machined", price: "$55", available: true },
      { tier: "improved", material: "6061-T6 aluminum", process: "CNC machined from billet", price: "$85", available: true },
      { tier: "custom", material: "Customer spec", process: "Quoted", price: "Quoted", available: true },
    ],
    leadTime: "7–10 business days",
    contributor: { name: "Gordy's Lakefront Marine", location: "WI" },
    scanDate: "2026-02-11",
  },
  {
    id: "br-012",
    name: "Lower Unit Mount Plate",
    segment: "marine",
    application: "1960–1972 OMC Stringer Sterndrive",
    fitment: "reference",
    description: "Transom-side mounting plate for OMC Stringer lower unit. Being reverse-engineered from a corroded original with improved drain provisions.",
    dimensions: '8.5" × 6.0" × 0.375"',
    tiers: [
      { tier: "fitment_check", material: "PLA 3D print", process: "FDM 3D printed for test-fit only", price: "$18", available: true },
      { tier: "oem", material: "Cast aluminum", process: "Sand cast + machined", price: "$120", available: false },
      { tier: "improved", material: "6061-T6 aluminum", process: "CNC machined, hard anodized", price: "$185", available: false },
      { tier: "custom", material: "Customer spec", process: "Quoted", price: "Quoted", available: false },
    ],
    leadTime: "TBD — scanning in progress",
  },

  // ── AUTOMOTIVE ──
  {
    id: "br-020",
    name: "Battery Hold-Down Bracket",
    segment: "automotive",
    application: "1970–1978 Datsun 240Z / 260Z / 280Z",
    fitment: "verified",
    description: "J-bolt style battery clamp bracket. Simple stamping, but universally rusted out on Z cars. Scanned from NOS, available in OEM or stainless.",
    dimensions: '8.0" × 1.2" × 0.5"',
    tiers: [
      { tier: "oem", material: "16-gauge mild steel", process: "Laser + brake, zinc-plated", price: "$28", available: true },
      { tier: "improved", material: "14-gauge 304 stainless", process: "Laser + brake, brushed", price: "$48", available: true },
      { tier: "custom", material: "Customer spec", process: "Quoted", price: "Quoted", available: true },
    ],
    leadTime: "3–5 business days",
    contributor: { name: "NorCal Z Club", location: "Sacramento, CA" },
    scanDate: "2025-09-22",
  },
  {
    id: "br-021",
    name: "Hood Prop Rod Bracket",
    segment: "automotive",
    application: "1968–1979 VW Bus (Type 2)",
    fitment: "verified",
    description: "Front body-mounted bracket for hood prop rod. Trivial part, infinite demand — every Bus needs one and they all break.",
    dimensions: '2.5" × 1.0" × 0.75"',
    tiers: [
      { tier: "oem", material: "14-gauge mild steel", process: "Laser + brake, zinc-plated", price: "$18", available: true },
      { tier: "improved", material: "12-gauge 304 stainless", process: "Laser + brake, passivated", price: "$32", available: true },
      { tier: "custom", material: "Customer spec", process: "Quoted", price: "Quoted", available: true },
    ],
    leadTime: "3–5 business days",
    contributor: { name: "TheSamba Community", location: "OR" },
    scanDate: "2025-11-02",
  },
  {
    id: "br-022",
    name: "Alternator Mounting Bracket",
    segment: "automotive",
    application: "1967–1969 Chevrolet Camaro / Nova (Small Block 327/350)",
    fitment: "scan_verified",
    description: "Upper alternator adjustment bracket with correct pivot slot and bolt pattern. 3D-scanned from NOS original.",
    dimensions: '6.2" × 1.8" × 0.375"',
    tiers: [
      { tier: "oem", material: "Cast iron", process: "Investment cast", price: "$85", available: true },
      { tier: "improved", material: "6061-T6 aluminum", process: "CNC machined from billet", price: "$120", available: true },
      { tier: "custom", material: "Customer spec", process: "Quoted", price: "Quoted", available: true },
    ],
    leadTime: "5–7 business days",
    contributor: { name: "Mike R.", location: "Manteca, CA" },
    scanDate: "2026-01-05",
  },
  {
    id: "br-023",
    name: "Glove Box Door Hinge Set",
    segment: "automotive",
    application: "1969–1970 Ford Mustang",
    fitment: "verified",
    description: "Left and right glove box lid hinges. Scanned from NOS pair. Includes correct pivot pins and spring detent. Sold as a set.",
    dimensions: '2.8" × 0.6" × 0.4" each',
    tiers: [
      { tier: "oem", material: "Zinc die-cast", process: "Investment cast, zinc-plated", price: "$45", available: true },
      { tier: "improved", material: "17-4 PH stainless", process: "CNC machined + passivated", price: "$78", available: true },
      { tier: "custom", material: "Customer spec", process: "Quoted", price: "Quoted", available: false },
    ],
    leadTime: "5–7 business days",
    contributor: { name: "Classic Mustang Club NorCal", location: "CA" },
    scanDate: "2025-12-17",
  },

  // ── MOTORCYCLE ──
  {
    id: "br-030",
    name: "Side Cover Mounting Tab",
    segment: "motorcycle",
    application: "1969–1978 Honda CB750 (K-series)",
    fitment: "scan_verified",
    description: "Frame-welded mounting tab for right-side battery cover. Breaks off from fatigue and corrosion. Weld-on replacement tab with correct angle and slot.",
    dimensions: '1.5" × 0.8" × 0.125"',
    tiers: [
      { tier: "oem", material: "Mild steel", process: "Laser-cut, formed", price: "$15", available: true },
      { tier: "improved", material: "304 stainless", process: "Laser-cut, formed", price: "$28", available: true },
      { tier: "custom", material: "Customer spec", process: "Quoted", price: "Quoted", available: true },
    ],
    leadTime: "3–5 business days",
    contributor: { name: "VJMC Member", location: "Portland, OR" },
    scanDate: "2026-02-28",
  },
  {
    id: "br-031",
    name: "Ignition Points Cover",
    segment: "motorcycle",
    application: "1968–1975 Yamaha XS650",
    fitment: "reference",
    description: "Left-side crankcase ignition points access cover. Frequently cracked from overtightening. Being modeled from a chipped original.",
    dimensions: '3.8" OD × 0.35" thick',
    tiers: [
      { tier: "fitment_check", material: "PLA 3D print", process: "FDM 3D printed for test-fit only", price: "$10", available: true },
      { tier: "oem", material: "Aluminum 356 cast", process: "Sand cast + machined", price: "$55", available: false },
      { tier: "improved", material: "6061-T6 billet", process: "CNC machined, anodized", price: "$85", available: false },
      { tier: "custom", material: "Customer spec", process: "Quoted", price: "Quoted", available: false },
    ],
    leadTime: "TBD — modeling in progress",
  },

  // ── INDUSTRIAL ──
  {
    id: "br-040",
    name: "Cross-Slide Gib",
    segment: "industrial",
    application: "South Bend 9\" Model A / C Workshop Lathe",
    fitment: "scan_verified",
    description: "Tapered gib strip for cross-slide dovetail. Original gibs wear and can't be sourced. Ground to correct taper from scan data.",
    dimensions: '5.5" × 0.375" × 0.125" (tapered)',
    tiers: [
      { tier: "oem", material: "Cast iron", process: "Surface ground to taper", price: "$45", available: true },
      { tier: "improved", material: "O1 tool steel, hardened", process: "Ground + hardened to Rc 58-60", price: "$72", available: true },
      { tier: "custom", material: "Customer spec", process: "Quoted", price: "Quoted", available: true },
    ],
    leadTime: "5–7 business days",
    contributor: { name: "Vintage Machinery Forum", location: "PA" },
    scanDate: "2026-01-22",
  },
];

export const BOUNTY_BOARD: BountyEntry[] = [
  { id: "bnt-001", partName: "Steering Wheel Center Cap", application: "1955–1957 Ford Thunderbird", segment: "automotive", requestedBy: 14, bounty: "Part at cost + credit", status: "seeking_donor" },
  { id: "bnt-002", partName: "Fuel Tank Sediment Bowl Bracket", application: "1939–1947 Ford 2N / 9N", segment: "tractor", requestedBy: 23, bounty: "Part at cost + credit", status: "seeking_donor" },
  { id: "bnt-003", partName: "Coil Mounting Bracket", application: "1958–1962 Mercury Mark 75 / 78", segment: "marine", requestedBy: 8, bounty: "Part at cost + credit", status: "seeking_donor" },
  { id: "bnt-004", partName: "Rear Footpeg Mount Bracket", application: "1965–1970 Honda CB450 Black Bomber", segment: "motorcycle", requestedBy: 11, bounty: "Part at cost + credit", status: "scanning" },
  { id: "bnt-005", partName: "Compound Rest Lock Nut", application: "Hardinge HLV-H Toolroom Lathe", segment: "industrial", requestedBy: 6, bounty: "Part at cost + credit", status: "modeling" },
  { id: "bnt-006", partName: "Headlight Bucket Retaining Ring", application: "1960–1966 Chevrolet C10 Pickup", segment: "automotive", requestedBy: 19, bounty: "Part at cost + credit", status: "seeking_donor" },
];
