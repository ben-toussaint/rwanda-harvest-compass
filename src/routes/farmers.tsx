import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Empty } from "@/components/AppShell";
import { DISTRICTS } from "@/lib/geo";
import { uid, useStore } from "@/lib/store";

export const Route = createFileRoute("/farmers")({
  head: () => ({
    meta: [
      { title: "My farmers – Ubutaka Insights" },
      { name: "description", content: "Advisors manage the farmers and plots they support and start evaluations on their behalf." },
      { property: "og:title", content: "My farmers – Ubutaka Insights" },
      { property: "og:description", content: "Farmer profiles for extension officers and cooperative managers." },
    ],
  }),
  component: Farmers,
});

function Farmers() {
  const { farmers, evaluations, update } = useStore();
  const [name, setName] = useState(""); const [phone, setPhone] = useState(""); const [district, setDistrict] = useState(""); const [sector, setSector] = useState("");
  const add = () => {
    if (!name || !district) return;
    update((db) => ({ ...db, farmers: [{ id: uid(), name, phone, district, sector, createdAt: new Date().toISOString() }, ...db.farmers] }));
    setName(""); setPhone(""); setSector("");
  };
  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-semibold">My farmers</h1>
      <div className="grid gap-3 rounded-lg border border-border bg-card p-4 sm:grid-cols-5">
        <div className="space-y-1"><Label>Name</Label><Input value={name} onChange={(e) => setName(e.target.value)} /></div>
        <div className="space-y-1"><Label>Phone</Label><Input value={phone} onChange={(e) => setPhone(e.target.value)} /></div>
        <div className="space-y-1"><Label>District</Label>
          <select className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm" value={district} onChange={(e) => setDistrict(e.target.value)}>
            <option value="">Choose</option>{Object.values(DISTRICTS).flat().sort().map((d) => <option key={d}>{d}</option>)}</select></div>
        <div className="space-y-1"><Label>Sector</Label><Input value={sector} onChange={(e) => setSector(e.target.value)} /></div>
        <div className="flex items-end"><Button className="w-full" onClick={add}>Add farmer</Button></div>
      </div>
      {farmers.length === 0 ? <Empty>No farmers yet. Add the farmers you advise to run evaluations for them.</Empty> : (
        <ul className="divide-y divide-border rounded-lg border border-border bg-card">
          {farmers.map((f) => (
            <li key={f.id} className="flex flex-wrap items-center justify-between gap-2 p-3">
              <div><p className="font-medium">{f.name}</p><p className="text-xs text-muted-foreground">{f.district}{f.sector ? `, ${f.sector}` : ""} · {evaluations.filter((e) => e.farmerId === f.id).length} evaluations</p></div>
              <Button asChild size="sm"><Link to="/visit" search={{ farmer: f.id, district: undefined }}>New visit</Link></Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
