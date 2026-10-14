import { describe, expect, it } from "vitest";
import { parseStartParams } from "@/lib/params";

const parse = (q: string) => parseStartParams(new URLSearchParams(q));

describe("QR start parameters", () => {
  it("reads a valid pack code", () => {
    expect(parse("sku=wf-sol-60&reg=2026-10-01&batch=B2291")).toEqual({
      kind: "ok",
      params: { sku: "WF-SOL-60", reg: "2026-10-01", batch: "B2291" },
    });
  });
  it("treats no parameters as manual setup", () => {
    expect(parse("")).toEqual({ kind: "none" });
  });
  it("rejects unknown codes, impossible dates and odd batch ids", () => {
    expect(parse("sku=REAL-SKU-1&reg=2026-10-01").kind).toBe("bad");
    expect(parse("sku=WF-SOL-60&reg=2026-02-30").kind).toBe("bad");
    expect(parse("sku=WF-SOL-60&reg=2026-10-01&batch=<script>").kind).toBe("bad");
  });
  it("ignores anything else in the URL", () => {
    const r = parse("sku=WF-GUM-30&reg=2026-10-01&name=Someone&phone=999");
    expect(r).toEqual({ kind: "ok", params: { sku: "WF-GUM-30", reg: "2026-10-01" } });
  });
});
