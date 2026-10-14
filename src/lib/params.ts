import * as z from "zod/mini";
import { skuByCode } from "@/content/skus";
import { isISODate } from "@/lib/time/journey";

/**
 * The QR on the pack opens /start?sku=WF-SOL-60&reg=2026-10-01&batch=B2291.
 * Only these three values are read. None of them is personal data.
 */
const startParams = z.object({
  sku: z.string().check(z.minLength(1), z.maxLength(32), z.refine((s) => skuByCode(s) !== undefined, "Unknown pack code")),
  reg: z.string().check(z.refine(isISODate, "Bad date")),
  batch: z.optional(z.string().check(z.maxLength(32), z.regex(/^[A-Za-z0-9-]*$/))),
});

export type StartParams = z.infer<typeof startParams>;

export type ParsedStart = { kind: "none" } | { kind: "ok"; params: StartParams } | { kind: "bad" };

export function parseStartParams(search: URLSearchParams): ParsedStart {
  const sku = search.get("sku");
  const reg = search.get("reg");
  if (!sku && !reg) return { kind: "none" };
  const parsed = startParams.safeParse({ sku: (sku ?? "").trim(), reg: (reg ?? "").trim(), batch: search.get("batch")?.trim() || undefined });
  if (!parsed.success) return { kind: "bad" };
  return { kind: "ok", params: { ...parsed.data, sku: parsed.data.sku.toUpperCase() } };
}
