import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Empty } from "@/components/AppShell";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/feedback")({
  head: () => ({
    meta: [
      { title: "Harvest results – Ubutaka Insights" },
      { name: "description", content: "Record harvests against targets and expected ranges to close the measure-compare-improve loop." },
      { property: "og:title", content: "Harvest results – Ubutaka Insights" },
      { property: "og:description", content: "Feedback loop: actual harvest vs target and expected range." },
    ],
  }),
  component: Feedback,
});

function Feedback() {
  const { evaluations, update } = useStore();
  const [kg, setKg] = useState<Record<string, string>>({});
  const record = (id: string) => {
    const v = Number(kg[id]); if (!v) return;
    update((db) => ({ ...db, evaluations: db.evaluations.map((e) => (e.id === id ? { ...e, harvestKg: v } : e)) }));
  };
  if (!evaluations.length) return (
    <div className="space-y-4"><h1 className="font-display text-3xl font-semibold">Harvest results</h1>
      <Empty>No saved visits yet. Run an evaluation and press "Save visit for harvest follow-up". <Link to="/visit" className="underline">Start a visit</Link></Empty></div>
  );
  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-semibold">Harvest results</h1>
      <p className="text-sm text-muted-foreground">Measure → Compare → Identify gap → Recommend → Implement → Measure again.</p>
      <ul className="space-y-3">
        {evaluations.map((e) => {
          const actual = e.harvestKg !== undefined ? e.harvestKg / 1000 / e.areaHa : undefined;
          const band = actual === undefined || e.expectedP25 === undefined ? null
            : actual < e.expectedP25 ? "Below the expected range" : actual > e.expectedP75! ? "Above the expected range" : "Within the expected range";
          return (
            <li key={e.id} className="rounded-lg border border-border bg-card p-4">
              <div className="flex flex-wrap justify-between gap-2">
                <p className="font-medium">{e.farmerName ?? "Self"} · {e.district} · {e.areaHa} ha {e.crop} · season {e.season}</p>
                <p className="text-sm text-muted-foreground">Target {e.targetTHa} t/ha{e.expectedP25 !== undefined ? ` · expected ${e.expectedP25.toFixed(1)}–${e.expectedP75!.toFixed(1)} t/ha` : ""}</p>
              </div>
              {actual === undefined ? (
                <div className="mt-3 flex gap-2"><Input className="max-w-40" type="number" placeholder="Harvest (kg)" value={kg[e.id] ?? ""} onChange={(x) => setKg({ ...kg, [e.id]: x.target.value })} /><Button onClick={() => record(e.id)}>Record harvest</Button></div>
              ) : (
                <p className="mt-2 text-sm">Harvest {e.harvestKg} kg = <b>{actual.toFixed(2)} t/ha</b> · gap to target {(actual - e.targetTHa).toFixed(2)} t/ha{band ? ` · ${band}` : ""}</p>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
