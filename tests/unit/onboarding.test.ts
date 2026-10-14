import { describe, expect, it } from "vitest";
import { canContinue, defaultTimes, draftFromPack, finishPlan, setupInProgress, startDateProblem, startPicks } from "@/lib/onboarding";
import { appStateSchema, emptyState } from "@/lib/storage/schema";

const now = new Date(2026, 9, 14, 21, 0);

describe("start date", () => {
  it("accepts today, the past year and the next two months", () => {
    expect(startDateProblem("2026-10-14", now)).toBeNull();
    expect(startDateProblem("2025-10-20", now)).toBeNull();
    expect(startDateProblem("2026-12-10", now)).toBeNull();
  });

  it("says what is wrong otherwise", () => {
    expect(startDateProblem(undefined, now)).toBe("Pick a day.");
    expect(startDateProblem("2026-02-31", now)).toMatch(/date we can read/);
    expect(startDateProblem("2024-01-01", now)).toMatch(/more than a year ago/);
    expect(startDateProblem("2027-03-01", now)).toMatch(/two months away/);
  });

  it("offers the pack's purchase day as a quick pick when it differs", () => {
    expect(startPicks(now, "2026-10-10").map((p) => p.label)).toEqual(["Today", "Yesterday", "A week ago", "The day I bought it"]);
    expect(startPicks(now, "2026-10-14").map((p) => p.label)).toEqual(["Today", "Yesterday", "A week ago"]);
    expect(startPicks(now).at(-1)?.value).toBe("2026-10-07");
  });
});

describe("moving on", () => {
  it("needs a product, a channel and a valid date; everything else can be skipped", () => {
    expect(canContinue("products", {}, now)).toBe(false);
    expect(canContinue("products", { products: ["foam"] }, now)).toBe(true);
    expect(canContinue("channel", {}, now)).toBe(false);
    expect(canContinue("start", { startDate: "2026-10-14" }, now)).toBe(true);
    expect(canContinue("start", {}, now)).toBe(false);
    expect(canContinue("name", {}, now)).toBe(true);
    expect(canContinue("letter", {}, now)).toBe(true);
  });
});

describe("a pack scan", () => {
  it("pre-ticks the pack's products without overwriting answers", () => {
    const fresh = draftFromPack({}, { sku: "WF-KIT-01", reg: "2026-10-10" }, now);
    expect(fresh.products).toEqual(["solution", "gummies", "shampoo"]);
    expect(fresh.pack?.sku).toBe("WF-KIT-01");
    const kept = draftFromPack({ products: ["foam"] }, { sku: "WF-KIT-01", reg: "2026-10-10" }, now);
    expect(kept.products).toEqual(["foam"]);
  });
});

describe("finishing", () => {
  it("builds a valid plan from the answers, with times from the age band", () => {
    const state = emptyState();
    state.onboarding.draft = {
      nickname: "  Arjun ",
      ageBand: "35-44",
      cityId: "chennai",
      products: ["solution"],
      channel: "quick-commerce",
      startDate: "2026-10-07",
      worries: ["crown"],
      letter: "Give it till April.",
    };
    const done = finishPlan(state, now);
    expect(appStateSchema.safeParse(done).success).toBe(true);
    expect(done.profile).toMatchObject({ nickname: "Arjun", cityId: "chennai", channel: "quick-commerce", startDate: "2026-10-07" });
    expect(done.routine).toMatchObject(defaultTimes("35-44"));
    expect(done.letter?.text).toBe("Give it till April.");
    expect(done.onboarding.completedAt).toBeDefined();
    expect(setupInProgress(done)).toBe(false);
  });

  it("an empty note is no letter, and a blank name stays blank (greetings say you)", () => {
    const state = emptyState();
    state.onboarding.draft = { products: ["foam"], channel: "assessment", startDate: "2026-10-14", letter: "   " };
    const done = finishPlan(state, now);
    expect(done.letter).toBeNull();
    expect(done.profile?.nickname).toBe("");
  });

  it("knows when setup was left halfway", () => {
    const state = emptyState();
    expect(setupInProgress(state)).toBe(false);
    state.onboarding.step = 3;
    expect(setupInProgress(state)).toBe(true);
  });
});
