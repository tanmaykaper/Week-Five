import type { ProductId } from "@/lib/storage/schema";

/**
 * Fictional pack codes for the challenge. Not real Man Matters SKUs, and no strengths:
 * the app never shows anything that reads as a dose. Days of supply are plausible
 * round numbers used only for the reorder runway.
 */
export interface Sku {
  code: string;
  name: string;
  products: ProductId[];
  daysOfSupply: number;
}

export const SKUS: Sku[] = [
  { code: "WF-SOL-60", name: "Regrowth solution, 60 ml", products: ["solution"], daysOfSupply: 30 },
  { code: "WF-SOL-90", name: "Regrowth solution, 90 ml", products: ["solution"], daysOfSupply: 45 },
  { code: "WF-FOAM-60", name: "Regrowth foam, 60 g", products: ["foam"], daysOfSupply: 30 },
  { code: "WF-GUM-30", name: "Hair gummies, 30 pack", products: ["gummies"], daysOfSupply: 30 },
  { code: "WF-KIT-01", name: "Starter kit: solution, gummies and shampoo", products: ["solution", "gummies", "shampoo"], daysOfSupply: 30 },
];

export const skuByCode = (code: string) => SKUS.find((s) => s.code === code.toUpperCase());
