import type { GasketGeometry } from "@/lib/dxf/types";
import type { MaterialId, ThicknessId, QuoteResult } from "./types";
import {
  MATERIALS,
  THICKNESSES,
  HANDLING_FEE,
  RUSH_FEE,
  RUSH_SURCHARGE_RATE,
  COMPLEXITY_FREE_HOLES,
  COMPLEXITY_PER_HOLE,
  VOLUME_DISCOUNTS,
  MIN_UNIT_PRICE,
} from "./materials";

/**
 * Calculate a quote from extracted DXF geometry and user-selected options.
 *
 * Formula:
 *   unitPrice = material_cost + cutting_cost + complexity_charge
 *   subtotal  = unitPrice * quantity * (1 - volumeDiscount)
 *   total     = subtotal + handlingFee + rushFee
 */
export function calculateQuote(
  geometry: GasketGeometry,
  material: MaterialId,
  thickness: ThicknessId,
  quantity: number,
  rush: boolean
): QuoteResult {
  const mat = MATERIALS[material];
  const thick = THICKNESSES[thickness];

  if (!mat) throw new Error(`Unknown material: ${material}`);
  if (!thick) throw new Error(`Unknown thickness: ${thickness}`);
  if (quantity < 1) throw new Error("Quantity must be at least 1");

  // 1. Material cost = net area * rate * thickness multiplier
  const materialCost = geometry.totalArea * mat.baseCostPerSqIn * thick.multiplier;

  // 2. Cutting cost = total cut length * per-inch rate
  const cuttingCost = geometry.totalCutLength * mat.cuttingCostPerLinIn;

  // 3. Complexity charge = extra holes beyond free threshold
  const extraHoles = Math.max(0, geometry.holeCount - COMPLEXITY_FREE_HOLES);
  const complexityCharge = extraHoles * COMPLEXITY_PER_HOLE;

  // Unit price with floor
  const rawUnitPrice = materialCost + cuttingCost + complexityCharge;
  const unitPrice = Math.max(rawUnitPrice, MIN_UNIT_PRICE);

  // Volume discount
  const volumeDiscount =
    VOLUME_DISCOUNTS.find((tier) => quantity >= tier.minQty)?.discount ?? 0;

  // Subtotal
  const subtotal = unitPrice * quantity * (1 - volumeDiscount);

  // Rush fee
  const rushFee = rush ? RUSH_FEE + subtotal * RUSH_SURCHARGE_RATE : 0;

  // Grand total
  const total = subtotal + HANDLING_FEE + rushFee;

  // Lead time
  const leadTime = rush ? "Same day" : "1–2 business days";

  return {
    unitPrice: round(unitPrice),
    quantity,
    volumeDiscount,
    subtotal: round(subtotal),
    rushFee: round(rushFee),
    total: round(total),
    breakdown: {
      materialCost: round(materialCost),
      cuttingCost: round(cuttingCost),
      handlingFee: HANDLING_FEE,
      complexityCharge: round(complexityCharge),
    },
    geometry: {
      totalArea: round(geometry.totalArea),
      totalCutLength: round(geometry.totalCutLength),
      boundingBox: {
        width: round(geometry.boundingBox.width),
        height: round(geometry.boundingBox.height),
      },
      holeCount: geometry.holeCount,
    },
    leadTime,
    material: mat.label,
    thickness: thick.label,
  };
}

function round(n: number): number {
  return Math.round(n * 100) / 100;
}
