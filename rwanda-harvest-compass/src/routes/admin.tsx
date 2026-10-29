import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useStore } from "@/lib/store";
import { provinceOf } from "@/lib/geo";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Data import – Ubutaka Insights" },
      { name: "description", content: "Upload NISR survey, market and RwaSIS data: map columns, validate, preview and publish to replace demo data." },
      { property: "og:title", content: "Data import – Ubutaka Insights" },
      { property: "og:description", content: "Admin import pipeline for official datasets." },
    ],
  }),
  component: Admin,
});

type Kind = "plots" | "aggregates" | "market" | "soil";
const B = ["fertilizer", "improved_seed", "pesticide", "irrigation", "agroforestry"];
const FIELDS: Record<Kind, { label: string; required: string[]; optional: string[]; num: string[] }> = {
  plots: { label: "NISR SAS plot records", required: ["crop", "season", "district", "plot_area_ha", "yield_t_ha"], optional: B, num: ["plot_area_ha", "yield_t_ha"] },
  aggregates: { label: "NISR published district table (lower confidence)", required: ["crop", "season", "district", "yield_t_ha", "n"], optional: [], num: ["yield_t_ha", "n"] },
  market: { label: "NISR market prices", required: ["crop", "district", "selling_place", "price_rwf_kg"], optional: ["quantity_kg"], num: ["price_rwf_kg", "quantity_kg"] },
  soil: { label: "RwaSIS soil records (manual entry)", required: ["district", "rwasis_recommendation"], optional: ["upi", "sector", "ph", "organic_carbon_pct", "texture"], num: ["ph", "organic_carbon_pct"] },
};
const truthy = (v: unknown) => ["1", "yes", "true", "y", "oui", "yego"].includes(String(v).trim().toLowerCase());

function Admin() {
  const { update, demo, settings } = useStore();
  const [kind, setKind] = useState<Kind>("plots");
  const [source, setSource] = useState("");
  const [rows, setRows] = useState<Record<string, unknown>[]>([]);
  const [cols, setCols] = useState<string[]>([]);
  const [map, setMap] = useState<Record<string, string>>({});
  const spec = FIELDS[kind];
  const fields = [...spec.required, ...spec.optional];

  const onFile = async (file: File) => {
    let data: Record<string, unknown>[] = [];
    if (file.name.endsWith(".csv")) data = Papa.parse<Record<string, unknown>>(await file.text(), { header: true, skipEmptyLines: true }).data;
    else { const wb = XLSX.read(await file.arrayBuffer()); data = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]); }
    const c = Object.keys(data[0] ?? {});
    setRows(data); setCols(c);
    setMap(Object.fromEntries(fields.map((f) => [f, c.find((x) => x.toLowerCase().replace(/\s+/g, "_") === f) ?? ""])));
  };

  const report = useMemo(() => {
    const errors: string[] = []; let valid = 0;
    const missing = spec.required.filter((f) => !map[f]);
    if (missing.length) return { errors: [`Map required columns: ${missing.join(", ")}`], valid: 0 };
    rows.forEach((r, i) => {
      const e: string[] = [];
      spec.required.forEach((f) => { if (r[map[f]] === undefined || r[map[f]] === "") e.push(`${f} empty`); });
      spec.num.forEach((f) => { if (map[f] && r[map[f]] !== undefined && r[map[f]] !== "" && isNaN(Number(r[map[f]]))) e.push(`${f} not a number`); });
      if (map.district && !provinceOf(String(r[map.district]))) e.push(`unknown district "${r[map.district]}"`);
      if (e.length) { if (errors.length < 20) errors.push(`Row ${i + 2}: ${e.join("; ")}`); } else valid++;
    });
    return { errors, valid };
  }, [rows, map, kind]);

  const publish = () => {
    if (!source) return toast.error("Enter the data source name (e.g. NISR SAS 2024 Season A).");
    const get = (r: Record<string, unknown>, f: string) => (map[f] ? r[map[f]] : undefined);
    const ok = rows.filter((r) => spec.required.every((f) => get(r, f) !== undefined && get(r, f) !== "") && provinceOf(String(get(r, "district"))));
    const base = (r: Record<string, unknown>) => ({ district: String(get(r, "district")), province: provinceOf(String(get(r, "district"))), source });
    update((db) => {
      if (kind === "plots" || kind === "aggregates") {
        const recs = ok.map((r) => ({
          ...base(r), crop: String(get(r, "crop")).toLowerCase(), season: String(get(r, "season")),
          plot_area_ha: Number(get(r, "plot_area_ha") ?? 0), yield_t_ha: Number(get(r, "yield_t_ha")),
          fertilizer: truthy(get(r, "fertilizer")), improved_seed: truthy(get(r, "improved_seed")), pesticide: truthy(get(r, "pesticide")),
          irrigation: truthy(get(r, "irrigation")), agroforestry: truthy(get(r, "agroforestry")),
          ...(kind === "aggregates" ? { is_aggregate: true, n_override: Number(get(r, "n")) } : {}),
        }));
        return { ...db, plots: [...(db.plots ?? []), ...recs] };
      }
      if (kind === "market") return { ...db, market: [...(db.market ?? []), ...ok.map((r) => ({ ...base(r), crop: String(get(r, "crop")).toLowerCase(), selling_place: String(get(r, "selling_place")), price_rwf_kg: Number(get(r, "price_rwf_kg")), quantity_kg: get(r, "quantity_kg") ? Number(get(r, "quantity_kg")) : undefined }))] };
      return { ...db, soil: [...(db.soil ?? []), ...ok.map((r) => ({ district: String(get(r, "district")), upi: get(r, "upi") ? String(get(r, "upi")) : undefined, sector: get(r, "sector") ? String(get(r, "sector")) : undefined, ph: get(r, "ph") ? Number(get(r, "ph")) : undefined, organic_carbon_pct: get(r, "organic_carbon_pct") ? Number(get(r, "organic_carbon_pct")) : undefined, texture: get(r, "texture") ? String(get(r, "texture")) : undefined, rwasis_recommendation: String(get(r, "rwasis_recommendation")), source: "Manual entry (RwaSIS)" }))] };
    });
    toast.success(`Published ${ok.length} rows. Demo data for this dataset is now replaced.`);
    setRows([]); setCols([]);
  };

  const setS = (k: keyof typeof settings, v: boolean) => update((db) => ({ ...db, settings: { ...db.settings, [k]: v } }));

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-semibold">Data import</h1>
      <p className="text-sm text-muted-foreground">Currently using demo data for: {Object.entries(demo).filter(([, v]) => v).map(([k]) => k).join(", ") || "none"}. Model training happens offline; upload resulting tables here.</p>
      <section className="space-y-4 rounded-lg border border-border bg-card p-4">
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="space-y-1"><Label>1 · Dataset</Label>
            <select className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm" value={kind} onChange={(e) => { setKind(e.target.value as Kind); setRows([]); setCols([]); }}>
              {Object.entries(FIELDS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}</select></div>
          <div className="space-y-1"><Label>Source label</Label><Input value={source} onChange={(e) => setSource(e.target.value)} placeholder="NISR SAS 2024 Season A" /></div>
          <div className="space-y-1"><Label>2 · File (CSV or XLSX)</Label><Input type="file" accept=".csv,.xlsx,.xls" onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])} /></div>
        </div>
        {cols.length > 0 && (<>
          <div><h2 className="mb-2 text-sm font-semibold">3 · Column mapping</h2>
            <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-5">{fields.map((f) => (
              <label key={f} className="text-xs">{f}{spec.required.includes(f) && " *"}
                <select className="mt-1 h-8 w-full rounded-md border border-input bg-background px-1 text-sm" value={map[f] ?? ""} onChange={(e) => setMap({ ...map, [f]: e.target.value })}>
                  <option value="">—</option>{cols.map((c) => <option key={c}>{c}</option>)}</select></label>))}</div></div>
          <div><h2 className="mb-1 text-sm font-semibold">4 · Validation report</h2>
            <p className="text-sm">{report.valid} of {rows.length} rows valid.</p>
            {report.errors.length > 0 && <ul className="mt-1 max-h-40 overflow-auto text-xs text-destructive">{report.errors.map((e) => <li key={e}>{e}</li>)}</ul>}</div>
          <div><h2 className="mb-1 text-sm font-semibold">5 · Preview</h2>
            <div className="overflow-x-auto"><table className="text-xs"><thead><tr>{fields.filter((f) => map[f]).map((f) => <th key={f} className="p-1 text-left">{f}</th>)}</tr></thead>
              <tbody>{rows.slice(0, 5).map((r, i) => <tr key={i}>{fields.filter((f) => map[f]).map((f) => <td key={f} className="border-t border-border p-1">{String(r[map[f]] ?? "")}</td>)}</tr>)}</tbody></table></div></div>
          <Button disabled={!report.valid} onClick={publish}>6 · Publish {report.valid} valid rows</Button>
        </>)}
      </section>
      <section className="space-y-3 rounded-lg border border-border bg-card p-4">
        <h2 className="text-sm font-semibold">Optional data adapters (off by default)</h2>
        {([["isdaFallback", "iSDAsoil 30 m soil maps — fallback only when RwaSIS has no record (licence to be verified)"], ["chirps", "CHIRPS rainfall — environmental feature (not yet connected)"], ["meteoRwanda", "Meteo Rwanda seasonal bulletins (not yet connected)"]] as const).map(([k, l]) => (
          <div key={k} className="flex items-center gap-3"><Switch checked={settings[k]} onCheckedChange={(v) => setS(k, v)} id={k} /><Label htmlFor={k} className="font-normal">{l}</Label></div>))}
        <p className="text-xs text-muted-foreground">RwaSIS live connection: pending access confirmation. Use the manual RwaSIS entry dataset above meanwhile.</p>
      </section>
      <Button variant="outline" onClick={() => update((db) => ({ ...db, plots: undefined, market: undefined, soil: undefined }))}>Remove imports and return to demo data</Button>
    </div>
  );
}
