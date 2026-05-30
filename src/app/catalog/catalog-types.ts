export const SEGMENTS = [
  { id: "tractor", label: "Vintage Tractors" },
  { id: "marine", label: "Marine & Outboard" },
  { id: "automotive", label: "Classic Automotive" },
  { id: "motorcycle", label: "Vintage Motorcycle" },
  { id: "industrial", label: "Industrial & Machinery" },
];

export const FITMENT_COLORS: Record<string, string> = {
  verified: "bg-emerald-500/8 text-emerald-400 border-emerald-500/15",
  scan_verified: "bg-gold-500/8 text-gold-400 border-gold-500/15",
  reference: "bg-copper-500/8 text-copper-400 border-copper-500/15",
};
export const FITMENT_LABELS: Record<string, string> = {
  verified: "Verified Fit",
  scan_verified: "Scan Verified",
  reference: "Reference",
};

// Short tier labels (tabs, pills) and full labels (tier selector, pricing header)
export const TIER_LABELS: Record<string, string> = {
  fitment_check: "3D Fit",
  oem: "OEM",
  improved: "Improved",
  custom: "Custom",
};
export const TIER_LABELS_FULL: Record<string, string> = {
  fitment_check: "3D Test-Fit",
  oem: "OEM Spec",
  improved: "Improved",
  custom: "Custom",
};
export const TIER_CHIP_COLORS: Record<string, string> = {
  fitment_check: "bg-blue-500/80",
  oem: "bg-charcoal-600/90",
  improved: "bg-purple-500/80",
  custom: "bg-amber-500/80",
};

// Chip for a photo's source type (donor / mockup / finished / CAD render)
export function fileChip(fileType: string, fileName: string): { label: string; color: string } {
  if (fileName.startsWith("preview_")) return { label: "CAD Render", color: "bg-blue-500/80" };
  if (fileType === "photo_donor") return { label: "Original Part", color: "bg-gold-500/80" };
  if (fileType === "photo_mockup") return { label: "3D Print Mockup", color: "bg-copper-500/80" };
  return { label: "Finished Part", color: "bg-emerald-500/80" };
}

// Chip for a photo's assigned tier, or null for untiered (cover) photos
export function tierChip(tier: string | null): { label: string; color: string } | null {
  if (!tier || !TIER_CHIP_COLORS[tier]) return null;
  return { label: TIER_LABELS[tier], color: TIER_CHIP_COLORS[tier] };
}

// Pick the photos to show for the active tier: tier-specific, else untiered, else all
export function getPhotosForTier<T extends { tier: string | null }>(allPhotos: T[], tier: string | null): T[] {
  const tierPhotos = tier ? allPhotos.filter((f) => f.tier === tier) : [];
  if (tierPhotos.length > 0) return tierPhotos;
  const defaultPhotos = allPhotos.filter((f) => !f.tier);
  return defaultPhotos.length > 0 ? defaultPhotos : allPhotos;
}

export type PriceStatus = "firm" | "estimate" | "stale" | "needs_review" | "unavailable";

export interface Variant {
  id: string;
  tier: string;
  material: string;
  process: string;
  base_price: string | null;
  lead_time_days: number | null;
  available: boolean;
  resolvedPrice: string | null;
  pricingStatus: PriceStatus;
  quotable?: boolean;
  stock_quantity: number;
  made_to_order: boolean;
}

export interface CatalogPart {
  id: string;
  name: string;
  segment: string;
  make: string | null;
  model: string | null;
  year_start: number | null;
  year_end: number | null;
  application: string;
  description: string | null;
  fitment_status: string;
  contributor_name: string | null;
  cad_file_url: string | null;
  hasStepFile: boolean;
  estimate: {
    price: string;
    material: string | null;
    isStale: boolean;
    quotedAt: string | null;
  } | null;
  customQuotes: Array<{
    material: string;
    unitPrice: string;
    leadTimeDays: number | null;
    quotedAt: string;
  }>;
  variants: Variant[];
  files: Array<{
    id: string;
    file_type: string;
    file_name: string;
    file_url: string;
    thumbnail_url: string | null;
    is_step_file: boolean;
    show_in_catalog: boolean;
    tier: string | null;
  }>;
}

// Mirrors QuoteResult from @/lib/autoquote/client — keep in sync
export interface CartQuote {
  variantId: string | null;
  quoteId: string | null;
  unitPrice: string | null;
  totalPrice: string | null;
  leadTimeDays: number | null;
  priceStatus: PriceStatus;
  source: string;
  message?: string;
}
