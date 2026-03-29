import type { MaterialId, ThicknessId } from "./types";

export interface MaterialConfig {
  id: MaterialId;
  label: string;
  /** Cost per square inch at reference thickness (1/16") */
  baseCostPerSqIn: number;
  /** Cutting cost per linear inch */
  cuttingCostPerLinIn: number;
}

export interface ThicknessConfig {
  id: ThicknessId;
  label: string;
  /** Multiplier applied to baseCostPerSqIn */
  multiplier: number;
}

export const MATERIALS: Record<MaterialId, MaterialConfig> = {
  paper: {
    id: "paper",
    label: "Paper Gasket",
    baseCostPerSqIn: 0.08,
    cuttingCostPerLinIn: 0.12,
  },
  cork: {
    id: "cork",
    label: "Cork",
    baseCostPerSqIn: 0.14,
    cuttingCostPerLinIn: 0.15,
  },
  rubber: {
    id: "rubber",
    label: "Rubber",
    baseCostPerSqIn: 0.11,
    cuttingCostPerLinIn: 0.14,
  },
  fiber: {
    id: "fiber",
    label: "Fiber",
    baseCostPerSqIn: 0.10,
    cuttingCostPerLinIn: 0.13,
  },
  neoprene: {
    id: "neoprene",
    label: "Neoprene",
    baseCostPerSqIn: 0.18,
    cuttingCostPerLinIn: 0.18,
  },
};

export const THICKNESSES: Record<ThicknessId, ThicknessConfig> = {
  "1/32": { id: "1/32", label: '1/32"', multiplier: 0.8 },
  "1/16": { id: "1/16", label: '1/16"', multiplier: 1.0 },
  "3/32": { id: "3/32", label: '3/32"', multiplier: 1.15 },
  "1/8": { id: "1/8", label: '1/8"', multiplier: 1.3 },
  "3/16": { id: "3/16", label: '3/16"', multiplier: 1.6 },
  "1/4": { id: "1/4", label: '1/4"', multiplier: 2.0 },
};

/** Flat per-order handling fee */
export const HANDLING_FEE = 5.0;

/** Rush order flat fee */
export const RUSH_FEE = 25.0;

/** Rush surcharge as percentage of subtotal */
export const RUSH_SURCHARGE_RATE = 0.2;

/** Per-hole complexity charge (above 2 holes free) */
export const COMPLEXITY_FREE_HOLES = 2;
export const COMPLEXITY_PER_HOLE = 0.75;

/** Volume discount tiers — checked in order, first match wins */
export const VOLUME_DISCOUNTS: Array<{ minQty: number; discount: number }> = [
  { minQty: 100, discount: 0.2 },
  { minQty: 50, discount: 0.15 },
  { minQty: 25, discount: 0.1 },
  { minQty: 10, discount: 0.05 },
  { minQty: 1, discount: 0.0 },
];

/** Minimum unit price floor */
export const MIN_UNIT_PRICE = 3.0;
