import { useMemo } from "react";
import { Bar, BarChart, CartesianGrid, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AlertTriangle, Info } from "lucide-react";
import { associatedFactors, classifyTarget, findCohort, findSoil, grossRevenue, priceRange, scenarios, type TargetClass } from "@/lib/engine";
import { useStore } from "@/lib/store";
import { useT } from "@/lib/i18n";
import { Empty, SourceTag } from "./AppShell";

const f1 = (n: number) => n.toFixed(1);
const rwf = (n: number) => Math.round(n).toLocaleString("en-US");
const PRACTICE_LABEL: Record<string, string> = {
  fertilizer: "Used fertilizer", improved_seed: "Used improved seed", pesticide: "Used pesticide", irrigation: "Irrigated", agroforestry: "Agroforestry on plot",
};
const CLASS: Record<TargetClass, { label: string; tone: string; note: string }> = {
  within: { label: "Within expected range", tone: "bg-primary text-primary-foreground", note: "Comparable plots commonly reach this level." },
  above_average: { label: "Above average", tone: "bg-accent text-accent-foreground", note: "Higher than most comparable plots, but reached by a good share of them." },
  near_ceiling: { label: "Near the observed ceiling", tone: "bg-warning text-warning-foreground", note: "Only the best comparable plots reached this level." },
  outside: { label: "Outside the observed range", tone: "bg-destructive text-destructive-foreground", note: "No comparable plot reached this target. It looks unrealistic for comparable conditions." },
};

export function Results({ district, province, crop, areaHa, target, upi }: { district: string; province: string; crop: string; areaHa: number; target: number; upi?: string }) {
  const { plots, market, soil, settings } = useStore();
  const { t } = useT();
  const q = { crop, district, province };
  const cohort = useMemo(() => findCohort(plots, q), [plots, district, crop]);
  const factors = useMemo(() => (cohort ? associatedFactors(cohort.rows) : []), [cohort]);
  const scen = useMemo(() => scenarios(plots, q), [plots, district, crop]);
  const price = useMemo(() => priceRange(market, q), [market, district, crop]);
  const soilP = findSoil(soil, { upi, district }, settings.isdaFallback);

  if (!cohort) return <Empty>No comparable observations for {crop} in {district}, {province} or nationally. Nothing can be estimated until data is imported.</Empty>;
  const s = cohort.stats;
  const cls = classifyTarget(target, s);
  const gap = target - s.median;
  const rev = price ? grossRevenue(areaHa, s, price.overall) : null;
  const src = s.sources.join(", ");

  return (
    <div className="space-y-5">
      {s.isAggregate && <p className="rounded-md bg-muted p-3 text-sm"><Info className="mr-1 inline h-4 w-4" />Only district-level published tables are available here, so confidence is lower.</p>}
      {s.level !== "district" && <p className="rounded-md bg-muted p-3 text-sm"><Info className="mr-1 inline h-4 w-4" />Too few comparable plots in {district}; the estimate uses {s.level} observations.</p>}

      <div className="grid gap-4 md:grid-cols-3">
        <Card title={t("expected")}>
          <p className="font-display text-3xl font-semibold">{f1(s.p25)}–{f1(s.p75)} <span className="text-base font-normal">t/ha</span></p>
          <p className="text-sm text-muted-foreground">Median {f1(s.median)} t/ha · middle half of comparable observations</p>
          <SourceTag n={s.n} confidence={s.confidence} level={s.level} source={src} />
        </Card>
        <Card title={t("attainable")}>
          <p className="font-display text-3xl font-semibold">{f1(s.p90)} <span className="text-base font-normal">t/ha</span></p>
          <p className="text-sm text-muted-foreground">OBSERVED top 10% of comparable plots (p90). Not an agronomic potential.</p>
          <SourceTag n={s.n} confidence={s.confidence} source={src} />
        </Card>
        <Card title="Your target">
          <p className="font-display text-3xl font-semibold">{f1(target)} <span className="text-base font-normal">t/ha</span></p>
          <span className={`mt-1 inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${CLASS[cls].tone}`}>{CLASS[cls].label}</span>
          <p className="mt-1 text-sm text-muted-foreground">{CLASS[cls].note} Gap to median: {gap >= 0 ? "+" : ""}{f1(gap)} t/ha.</p>
          {cls === "outside" && <p className="mt-2 flex gap-1 text-sm font-medium text-destructive"><AlertTriangle className="h-4 w-4 shrink-0" />Consider a lower target for these conditions.</p>}
        </Card>
      </div>

      <Card title="Where your target sits among comparable observations">
        <div className="h-48">
          <ResponsiveContainer>
            <BarChart data={[{ k: "p25", v: s.p25 }, { k: "median", v: s.median }, { k: "p75", v: s.p75 }, { k: "p90", v: s.p90 }]}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="k" /><YAxis unit=" t" /><Tooltip formatter={(v: number) => `${f1(v)} t/ha`} />
              <Bar dataKey="v" fill="var(--primary)" radius={[4, 4, 0, 0]} />
              <ReferenceLine y={target} stroke="var(--soil)" strokeDasharray="6 3" label={{ value: "target", fill: "var(--soil)", position: "insideTopRight" }} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card title="Level 2 · Practices associated with higher yields">
          {factors.length ? (
            <ul className="space-y-2 text-sm">
              {factors.map((x) => (
                <li key={x.practice} className="flex justify-between gap-2 border-b border-border pb-1.5">
                  <span>{PRACTICE_LABEL[x.practice]}</span>
                  <span className="text-right">median {f1(x.withMedian)} vs {f1(x.withoutMedian)} t/ha <span className="text-xs text-muted-foreground">(n {x.nWith}/{x.nWithout})</span></span>
                </li>
              ))}
            </ul>
          ) : <Empty>Not enough plot-level observations to compare practices.</Empty>}
          <p className="mt-3 text-xs text-muted-foreground">Association, not causation: farmers who use a practice may differ in other ways. No single input guarantees yield — the most limiting factor sets the ceiling (Liebig's law of the minimum).</p>
        </Card>
        <Card title="Level 3 · Scenarios from comparable observations">
          <ul className="space-y-2 text-sm">
            {scen.map((x) => (
              <li key={x.label} className="flex justify-between gap-2 border-b border-border pb-1.5">
                <span>{x.label}</span>
                {x.stats ? <span>{f1(x.stats.p25)}–{f1(x.stats.p75)} t/ha <span className="text-xs text-muted-foreground">n {x.stats.n} · {x.stats.confidence} · {x.stats.level}</span></span>
                  : <span className="text-muted-foreground">Not enough data</span>}
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card title="Level 1 · Soil and fertilizer/lime (RwaSIS)">
          {soilP ? (
            <div className="space-y-2 text-sm">
              <dl className="grid grid-cols-2 gap-1">
                {soilP.ph !== undefined && (<><dt className="text-muted-foreground">pH</dt><dd>{soilP.ph}</dd></>)}
                {soilP.organic_carbon_pct !== undefined && (<><dt className="text-muted-foreground">Organic carbon</dt><dd>{soilP.organic_carbon_pct}%</dd></>)}
                {soilP.texture && (<><dt className="text-muted-foreground">Texture</dt><dd>{soilP.texture}</dd></>)}
                {soilP.suitability?.[crop] && (<><dt className="text-muted-foreground">Crop suitability</dt><dd>{soilP.suitability[crop]}</dd></>)}
              </dl>
              <blockquote className="border-l-4 border-soil bg-muted p-3">{soilP.rwasis_recommendation ?? "No recommendation on record."}</blockquote>
              <p className="text-xs text-muted-foreground">Source: <b>{soilP.source}</b>{soilP.is_demo ? " (demo record)" : ""}{soilP.source === "iSDAsoil" ? " — fallback soil map; no fertilizer advice is given from it." : ""}. Shown as published; this app never calculates doses.</p>
            </div>
          ) : <Empty>No RwaSIS record for this location. Ask an admin to enter it manually from RwaSIS.</Empty>}
        </Card>
        <Card title="Market and gross revenue">
          {price && rev ? (
            <div className="space-y-2 text-sm">
              <p>Observed price: <b>{rwf(price.overall.p25)}–{rwf(price.overall.p75)} RWF/kg</b></p>
              <ul className="text-xs text-muted-foreground">{price.byPlace.map((b) => <li key={b.place}>{b.place}: {rwf(b.p25)}–{rwf(b.p75)} RWF/kg (n {b.n})</li>)}</ul>
              <p>Estimated production on {areaHa} ha: {rwf(rev.productionKg.low)}–{rwf(rev.productionKg.high)} kg</p>
              <p className="font-display text-2xl font-semibold">{rwf(rev.revenueRwf.low)}–{rwf(rev.revenueRwf.high)} RWF</p>
              <p className="text-xs font-semibold uppercase text-muted-foreground">Gross revenue, not profit — input and labour costs not deducted. No price forecast.</p>
              <SourceTag n={price.n} level={price.level} source={price.sources.join(", ")} />
            </div>
          ) : <Empty>No market price observations available for this crop.</Empty>}
        </Card>
      </div>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-lg border border-border bg-card p-4 shadow-sm">
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{title}</h3>
      {children}
    </section>
  );
}
