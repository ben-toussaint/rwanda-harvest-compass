import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Empty, SourceTag } from "@/components/AppShell";
import { confidenceLabel, percentile } from "@/lib/engine";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/planner")({
  head: () => ({
    meta: [
      { title: "Planner dashboard – Ubutaka Insights" },
      { name: "description", content: "Compare maize yields, practice adoption and yield gaps across Rwandan districts, with sample sizes and confidence." },
      { property: "og:title", content: "Planner dashboard – Ubutaka Insights" },
      { property: "og:description", content: "District comparisons of maize productivity for planners." },
    ],
  }),
  component: Planner,
});

function Planner() {
  const { plots } = useStore();
  const rows = useMemo(() => {
    const ds = [...new Set(plots.filter((p) => p.crop === "maize").map((p) => p.district))];
    return ds.map((d) => {
      const r = plots.filter((p) => p.crop === "maize" && p.district === d);
      const y = r.map((x) => x.yield_t_ha);
      const pct = (k: "fertilizer" | "improved_seed") => Math.round((100 * r.filter((x) => x[k]).length) / r.length);
      const median = percentile(y, 0.5)!; const p90 = percentile(y, 0.9)!;
      return { district: d, n: r.length, conf: confidenceLabel(r.length, r.every((x) => x.is_aggregate)), median, p25: percentile(y, 0.25)!, p75: percentile(y, 0.75)!, p90, gap: p90 - median, fert: pct("fertilizer"), seed: pct("improved_seed") };
    }).filter((x) => x.conf).sort((a, b) => b.median - a.median);
  }, [plots]);
  const src = [...new Set(plots.map((p) => p.source))].join(", ");
  if (!rows.length) return <Empty>No district data with enough observations.</Empty>;
  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-semibold">Planner dashboard · maize</h1>
      <section className="rounded-lg border border-border bg-card p-4">
        <h2 className="mb-2 text-sm font-semibold">Median yield and observed gap to p90 (t/ha)</h2>
        <div className="h-72"><ResponsiveContainer width="100%" height="100%">
          <BarChart data={rows}><CartesianGrid strokeDasharray="3 3" stroke="var(--border)" /><XAxis dataKey="district" /><YAxis />
            <Tooltip formatter={(v: number) => v.toFixed(2)} />
            <Bar dataKey="median" stackId="a" fill="var(--primary)" name="Median" /><Bar dataKey="gap" stackId="a" fill="var(--accent)" name="Gap to p90" />
          </BarChart></ResponsiveContainer></div>
        <SourceTag source={src} />
      </section>
      <div className="overflow-x-auto rounded-lg border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-muted text-left text-xs uppercase text-muted-foreground"><tr>{["District", "n", "Confidence", "p25–p75", "Median", "p90 (observed)", "Fertilizer use", "Improved seed"].map((h) => <th key={h} className="p-2">{h}</th>)}</tr></thead>
          <tbody>{rows.map((r) => (
            <tr key={r.district} className="border-t border-border"><td className="p-2 font-medium">{r.district}</td><td className="p-2">{r.n}</td><td className="p-2">{r.conf}</td>
              <td className="p-2">{r.p25.toFixed(1)}–{r.p75.toFixed(1)}</td><td className="p-2">{r.median.toFixed(1)}</td><td className="p-2">{r.p90.toFixed(1)}</td><td className="p-2">{r.fert}%</td><td className="p-2">{r.seed}%</td></tr>))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-muted-foreground">Districts with fewer than 10 observations are hidden. Differences between districts are descriptive and do not by themselves explain causes.</p>
    </div>
  );
}
