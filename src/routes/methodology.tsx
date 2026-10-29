import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/methodology")({
  head: () => ({
    meta: [
      { title: "Methodology – Ubutaka Insights" },
      { name: "description", content: "How cohorts, yield ranges, confidence labels and data sources work, the limits of prediction vs causation, and the roadmap." },
      { property: "og:title", content: "Methodology – Ubutaka Insights" },
      { property: "og:description", content: "Cohorts, ranges, confidence labels, data sources and roadmap." },
    ],
  }),
  component: Methodology,
});

const S = ({ h, children }: { h: string; children: React.ReactNode }) => (
  <section className="space-y-2"><h2 className="font-display text-xl font-semibold">{h}</h2><div className="space-y-2 text-sm leading-relaxed text-muted-foreground">{children}</div></section>
);

function Methodology() {
  return (
    <article className="mx-auto max-w-3xl space-y-8">
      <h1 className="font-display text-3xl font-semibold">Methodology</h1>
      <S h="Data sources">
        <p><b>RwaSIS (RAB)</b> — soil properties, crop suitability and fertilizer/lime recommendations by UPI or location. It is the only source of fertilizer/lime advice (Level 1); we show it word for word and never override it. Every soil record stores and displays its source.</p>
        <p><b>NISR Seasonal Agricultural Survey</b> — plot-level production and practice records (crop, season, district, area, yield, fertilizer, improved seed, pesticide, irrigation, agroforestry) across all 30 districts. NISR has no soil chemistry and is never used for it. When only published district tables are available, they are used as a fallback with lower confidence.</p>
        <p><b>NISR market information</b> — selling price per kg, selling place and quantity sold.</p>
        <p><b>Optional, off by default:</b> iSDAsoil (soil fallback only when RwaSIS has no record), CHIRPS rainfall, Meteo Rwanda bulletins.</p>
      </S>
      <S h="Comparable observations (cohorts)">
        <p>For a request we select plots with the same crop in the same district. If fewer than 10 exist, we widen to the province, then the whole country, and say so on screen. If still fewer than 10, we show nothing.</p>
      </S>
      <S h="Ranges">
        <p><b>Expected range</b> = 25th–75th percentile of comparable yields (the middle half). <b>Empirical attainable yield</b> = 90th percentile: what the best 10% of comparable plots were observed to reach — not an agronomic potential.</p>
        <p>Targets are classed as within the expected range (≤ p75), above average (below 90% of p90), near the observed ceiling (up to the highest observation) or outside the observed range.</p>
        <p>Market: observed price p25–p75 by selling place (district → province → national). Gross revenue = estimated production × price range — not profit.</p>
      </S>
      <S h="Confidence labels">
        <p>High: n ≥ 100 plot observations. Medium: 30–99. Low: 10–29, or any estimate based on published district aggregates. Below 10: no estimate.</p>
      </S>
      <S h="Prediction is not causation">
        <p>Practices "associated with higher yields" compare comparable plots with and without a practice. Farmers who use a practice may also differ in soil, rainfall, labour or skill, so the difference is not a guaranteed effect. Following Liebig's law of the minimum, no single input guarantees yield; the most limiting factor sets the ceiling.</p>
        <p>Model training is done offline; resulting cohort statistics are loaded through the admin import.</p>
      </S>
      <S h="Roadmap">
        <ul className="list-disc pl-5">
          <li>Water-limited potential yield (Yw) as an agronomic reference.</li>
          <li>QUEFTS / nutrient-balance cross-check, once validated soil pH, organic carbon, P and K exist.</li>
          <li>Irish potato (Musanze, Nyabihu) as second crop — data import only, no code change.</li>
          <li>SMS/USSD channel and cooperative-level group reports.</li>
          <li>Fertilizer-cost viability check.</li>
        </ul>
      </S>
    </article>
  );
}
