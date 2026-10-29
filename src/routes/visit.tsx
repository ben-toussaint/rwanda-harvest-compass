import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Results } from "@/components/Results";
import { CROPS, DISTRICTS, provinceOf } from "@/lib/geo";
import { toHectares, findCohort, type AreaUnit } from "@/lib/engine";
import { uid, useStore } from "@/lib/store";
import { useT } from "@/lib/i18n";
import { toast } from "sonner";

interface Search { district?: string; area?: number; unit?: AreaUnit; target?: number; crop?: string; farmer?: string; upi?: string }

export const Route = createFileRoute("/visit")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    district: s.district ? String(s.district) : undefined,
    area: s.area ? Number(s.area) : undefined,
    unit: (["ha", "are", "m2"].includes(String(s.unit)) ? s.unit : undefined) as AreaUnit | undefined,
    target: s.target ? Number(s.target) : undefined,
    crop: s.crop ? String(s.crop) : undefined,
    farmer: s.farmer ? String(s.farmer) : undefined,
    upi: s.upi ? String(s.upi) : undefined,
  }),
  head: () => ({
    meta: [
      { title: "New farmer visit – Ubutaka Insights" },
      { name: "description", content: "Enter location, land, crop and target to see expected yield ranges, RwaSIS soil advice and market prices." },
      { property: "og:title", content: "New farmer visit – Ubutaka Insights" },
      { property: "og:description", content: "Evidence-based yield ranges and target check for maize in Rwanda." },
    ],
  }),
  component: Visit,
});

function Visit() {
  const s = Route.useSearch();
  const nav = useNavigate({ from: "/visit" });
  const { farmers, plots, update } = useStore();
  const { t } = useT();
  const [district, setDistrict] = useState(s.district ?? "");
  const [upi, setUpi] = useState(s.upi ?? "");
  const [area, setArea] = useState(String(s.area ?? 0.5));
  const [unit, setUnit] = useState<AreaUnit>(s.unit ?? "ha");
  const [crop, setCrop] = useState(s.crop ?? "maize");
  const [target, setTarget] = useState(String(s.target ?? ""));
  const [farmer, setFarmer] = useState(s.farmer ?? "");
  const ready = s.district && s.area && s.target;
  const areaHa = ready ? toHectares(s.area!, s.unit ?? "ha") : 0;

  const run = () => {
    if (!district || !Number(area) || !Number(target)) return toast.error("Please fill location, area and target.");
    nav({ search: { district, area: Number(area), unit, target: Number(target), crop, farmer: farmer || undefined, upi: upi || undefined } });
  };
  const sample = () => {
    setDistrict("Musanze"); setArea("1"); setUnit("ha"); setTarget("5"); setCrop("maize");
    nav({ search: { district: "Musanze", area: 1, unit: "ha", target: 5, crop: "maize" } });
  };
  const save = () => {
    const prov = provinceOf(s.district!);
    const c = findCohort(plots, { crop: s.crop ?? "maize", district: s.district!, province: prov });
    const f = farmers.find((x) => x.id === s.farmer);
    update((db) => ({ ...db, evaluations: [{ id: uid(), farmerId: f?.id, farmerName: f?.name, district: s.district!, province: prov, crop: s.crop ?? "maize", areaHa, targetTHa: s.target!, season: "2026A", expectedP25: c?.stats.p25, expectedP75: c?.stats.p75, createdAt: new Date().toISOString() }, ...db.evaluations] }));
    toast.success("Saved. Record the harvest later under Harvest results.");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h1 className="font-display text-3xl font-semibold">{t("nav_visit")}</h1>
        <Button variant="secondary" onClick={sample}>{t("try_sample")}</Button>
      </div>
      <div className="grid gap-4 rounded-lg border border-border bg-card p-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-1"><Label>Farmer (optional)</Label>
          <select className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm" value={farmer} onChange={(e) => { setFarmer(e.target.value); const f = farmers.find((x) => x.id === e.target.value); if (f) setDistrict(f.district); }}>
            <option value="">Self / not recorded</option>{farmers.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
          </select></div>
        <div className="space-y-1"><Label>1 · Location (district)</Label>
          <select className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm" value={district} onChange={(e) => setDistrict(e.target.value)}>
            <option value="">Choose district</option>
            {Object.entries(DISTRICTS).map(([p, ds]) => <optgroup key={p} label={p}>{ds.map((d) => <option key={d}>{d}</option>)}</optgroup>)}
          </select></div>
        <div className="space-y-1"><Label>UPI (land parcel, optional)</Label><Input value={upi} onChange={(e) => setUpi(e.target.value)} placeholder="e.g. 4/03/01/02/1234" /></div>
        <div className="space-y-1"><Label>2 · Land area</Label>
          <div className="flex gap-2"><Input type="number" min="0" step="0.01" value={area} onChange={(e) => setArea(e.target.value)} />
            <select className="h-9 rounded-md border border-input bg-background px-2 text-sm" value={unit} onChange={(e) => setUnit(e.target.value as AreaUnit)}>
              <option value="ha">ha</option><option value="are">are</option><option value="m2">m²</option></select></div></div>
        <div className="space-y-1 sm:col-span-2"><Label>3 · Crop</Label>
          <div className="flex flex-wrap gap-2">{CROPS.map((c) => (
            <button key={c.id} disabled={!c.available} onClick={() => setCrop(c.id)}
              className={`rounded-full border px-3 py-1 text-sm ${crop === c.id ? "border-primary bg-primary text-primary-foreground" : "border-border"} disabled:opacity-50`}>
              {c.label}{!c.available && " · Coming soon"}</button>))}</div></div>
        <div className="space-y-1"><Label>4 · Target yield (t/ha)</Label><Input type="number" min="0" step="0.1" value={target} onChange={(e) => setTarget(e.target.value)} /></div>
        <div className="flex items-end"><Button className="w-full" onClick={run}>See evidence</Button></div>
      </div>

      {ready && (
        <>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-display text-2xl font-semibold">Results · {s.district}, {areaHa} ha, maize</h2>
            <Button variant="outline" onClick={save}>Save visit for harvest follow-up</Button>
          </div>
          <Results district={s.district!} province={provinceOf(s.district!)} crop={s.crop ?? "maize"} areaHa={areaHa} target={s.target!} upi={s.upi} />
        </>
      )}
    </div>
  );
}
