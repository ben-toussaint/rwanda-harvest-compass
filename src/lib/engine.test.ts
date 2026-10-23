import { describe, it, expect } from "vitest";
import { toHectares, confidenceLabel, classifyTarget, grossRevenue, findCohort, priceRange, findSoil, type PlotRecord, type MarketRecord } from "./engine";

const plot = (district: string, province: string, y: number): PlotRecord => ({
  crop: "maize", season: "2024A", province, district, plot_area_ha: 0.5, yield_t_ha: y,
  fertilizer: false, improved_seed: false, pesticide: false, irrigation: false, agroforestry: false, source: "test",
});

describe("engine rules", () => {
  it("converts are and m² to hectares", () => {
    expect(toHectares(50, "are")).toBe(0.5);
    expect(toHectares(5000, "m2")).toBe(0.5);
  });
  it("labels confidence by sample size", () => {
    expect(confidenceLabel(150)).toBe("High");
    expect(confidenceLabel(30)).toBe("Medium");
    expect(confidenceLabel(12)).toBe("Low");
    expect(confidenceLabel(9)).toBeNull();
  });
  it("district aggregates are always Low confidence", () => {
    expect(confidenceLabel(500, true)).toBe("Low");
  });
  it("classifies targets against observed range", () => {
    const s = { p75: 3, p90: 4, max: 5 };
    expect(classifyTarget(2.5, s)).toBe("within");
    expect(classifyTarget(3.4, s)).toBe("above_average");
    expect(classifyTarget(4.5, s)).toBe("near_ceiling");
    expect(classifyTarget(6, s)).toBe("outside");
  });
  it("widens cohort to province when district n < 10", () => {
    const rows = [...Array(5)].map(() => plot("Musanze", "Northern", 2)).concat([...Array(10)].map(() => plot("Burera", "Northern", 3)));
    expect(findCohort(rows, { crop: "maize", district: "Musanze", province: "Northern" })?.stats.level).toBe("province");
  });
  it("returns no cohort when nothing comparable exists", () => {
    expect(findCohort([], { crop: "maize", district: "Musanze", province: "Northern" })).toBeNull();
  });
  it("price falls back district → province → national", () => {
    const m = (d: string, p: string): MarketRecord => ({ crop: "maize", province: p, district: d, selling_place: "Market", price_rwf_kg: 400, source: "t" });
    const rows = [...Array(6)].map(() => m("Huye", "Southern"));
    expect(priceRange(rows, { crop: "maize", district: "Musanze", province: "Northern" })?.level).toBe("national");
  });
  it("gross revenue = production × price", () => {
    const g = grossRevenue(1, { p25: 2, p75: 3 }, { p25: 300, p75: 400 });
    expect(g.revenueRwf.low).toBe(600000);
    expect(g.revenueRwf.high).toBe(1200000);
  });
  it("uses iSDAsoil only when RwaSIS has no record and fallback is on", () => {
    const isda = { district: "Musanze", source: "iSDAsoil" };
    expect(findSoil([isda], { district: "Musanze" })).toBeNull();
    expect(findSoil([isda], { district: "Musanze" }, true)?.source).toBe("iSDAsoil");
  });
});
