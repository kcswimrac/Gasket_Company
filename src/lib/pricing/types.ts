export type MaterialId = "paper" | "cork" | "rubber" | "fiber" | "neoprene";

export type ThicknessId = "1/32" | "1/16" | "3/32" | "1/8" | "3/16" | "1/4";

export interface QuoteBreakdown {
  materialCost: number;
  cuttingCost: number;
  handlingFee: number;
  complexityCharge: number;
}

export interface QuoteResult {
  unitPrice: number;
  quantity: number;
  volumeDiscount: number;
  subtotal: number;
  rushFee: number;
  total: number;
  breakdown: QuoteBreakdown;
  geometry: {
    totalArea: number;
    totalCutLength: number;
    boundingBox: { width: number; height: number };
    holeCount: number;
  };
  leadTime: string;
  material: string;
  thickness: string;
}
