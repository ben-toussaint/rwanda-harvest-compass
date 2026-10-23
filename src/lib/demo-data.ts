// DEMO DATA — synthetic, for interface demonstration only. NOT official NISR or RwaSIS statistics.
// Replaced automatically once real datasets are published through the admin import.
import type { MarketRecord, PlotRecord, SoilProfile } from "./engine";
import { provinceOf } from "./geo";

const DEMO_SRC = "DEMO synthetic data (not NISR)";

function rng(seed: number) {
  return () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };
}

const DEMO_DISTRICTS: [string, number, number][] = [
  // district, base yield factor, plots
  ["Musanze", 1.25, 140],
  ["Nyabihu", 1.1, 60],
  ["Gicumbi", 0.95, 45],
  ["Nyagatare", 1.05, 120],
  ["Kayonza", 0.9, 70],
  ["Huye", 0.85, 40],
  ["Rubavu", 1.15, 35],
  ["Bugesera", 0.75, 25],
];

export function demoPlots(): PlotRecord[] {
  const r = rng(42);
  const out: PlotRecord[] = [];
  for (const [district, f, n] of DEMO_DISTRICTS) {
    for (let i = 0; i < n; i++) {
      const fert = r() < 0.45, seed = r() < 0.5, pest = r() < 0.3, irr = r() < 0.08, agro = r() < 0.35;
      let y = 1.1 * f + (fert ? 0.9 : 0) + (seed ? 0.7 : 0) + (pest ? 0.25 : 0) + (irr ? 0.6 : 0) + (agro ? 0.1 : 0);
      y *= 0.55 + r() * 0.9;
      out.push({
        crop: "maize", season: r() < 0.6 ? "2024A" : "2025B", province: provinceOf(district), district,
        plot_area_ha: Math.round((0.05 + r() * 0.9) * 100) / 100, yield_t_ha: Math.round(y * 100) / 100,
        fertilizer: fert, improved_seed: seed, pesticide: pest, irrigation: irr, agroforestry: agro,
        source: DEMO_SRC, is_demo: true,
      });
    }
  }
  return out;
}

export function demoMarket(): MarketRecord[] {
  const r = rng(7);
  const out: MarketRecord[] = [];
  const places = ["Local market", "Cooperative", "Trader at farm gate"];
  for (const [district] of DEMO_DISTRICTS.slice(0, 6)) {
    for (let i = 0; i < 18; i++) {
      const place = places[i % 3];
      const base = place === "Cooperative" ? 390 : place === "Local market" ? 360 : 310;
      out.push({
        crop: "maize", province: provinceOf(district), district, selling_place: place,
        price_rwf_kg: Math.round(base * (0.85 + r() * 0.3)), quantity_kg: Math.round(50 + r() * 400),
        source: DEMO_SRC, is_demo: true,
      });
    }
  }
  return out;
}

export function demoSoil(): SoilProfile[] {
  return [
    {
      district: "Musanze", sector: "Muhoza", ph: 5.6, organic_carbon_pct: 2.9, texture: "Clay loam (volcanic)",
      suitability: { maize: "Suitable (demo)", irish_potato: "Highly suitable (demo)" },
      rwasis_recommendation:
        "DEMO placeholder — no real RwaSIS recommendation loaded. The official RwaSIS fertilizer/lime recommendation for this location will appear here word for word once RwaSIS access is confirmed or it is entered manually.",
      source: "RwaSIS", is_demo: true,
    },
  ];
}
