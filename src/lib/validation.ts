import { z } from "zod";

export const MATERIAL_IDS = [
  "paper",
  "cork",
  "rubber",
  "fiber",
  "neoprene",
] as const;

export const THICKNESS_IDS = [
  "1/32",
  "1/16",
  "3/32",
  "1/8",
  "3/16",
  "1/4",
] as const;

export const quoteParamsSchema = z.object({
  material: z.enum(MATERIAL_IDS),
  thickness: z.enum(THICKNESS_IDS),
  quantity: z.coerce.number().int().min(1).max(10000),
  rush: z
    .union([z.boolean(), z.string()])
    .transform((v) => v === true || v === "true"),
});

export type QuoteParams = z.infer<typeof quoteParamsSchema>;

/** Max DXF file size: 5MB */
export const MAX_DXF_SIZE = 5 * 1024 * 1024;
