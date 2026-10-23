// Browser-local store for this prototype. Published imports replace demo datasets.
import { useEffect, useState, useCallback } from "react";
import type { MarketRecord, PlotRecord, SoilProfile } from "./engine";
import { demoMarket, demoPlots, demoSoil } from "./demo-data";

export interface Settings { isdaFallback: boolean; chirps: boolean; meteoRwanda: boolean }
export interface Farmer { id: string; name: string; phone?: string; district: string; sector?: string; createdAt: string }
export interface Evaluation {
  id: string; farmerId?: string; farmerName?: string; district: string; province: string; crop: string;
  areaHa: number; targetTHa: number; season: string; expectedP25?: number; expectedP75?: number;
  harvestKg?: number; createdAt: string;
}

interface DB {
  plots?: PlotRecord[]; market?: MarketRecord[]; soil?: SoilProfile[];
  farmers: Farmer[]; evaluations: Evaluation[]; settings: Settings;
}
const KEY = "dss.v1";
const empty: DB = { farmers: [], evaluations: [], settings: { isdaFallback: false, chirps: false, meteoRwanda: false } };

function read(): DB {
  try { return { ...empty, ...JSON.parse(localStorage.getItem(KEY) || "{}") }; } catch { return empty; }
}
const listeners = new Set<() => void>();
export function write(fn: (db: DB) => DB) {
  localStorage.setItem(KEY, JSON.stringify(fn(read())));
  listeners.forEach((l) => l());
}

const DEMO = { plots: demoPlots(), market: demoMarket(), soil: demoSoil() };

export function useStore() {
  const [db, setDb] = useState<DB>(empty);
  useEffect(() => {
    const l = () => setDb(read());
    l(); listeners.add(l);
    return () => { listeners.delete(l); };
  }, []);
  const plots = db.plots ?? DEMO.plots;
  const market = db.market ?? DEMO.market;
  const soil = db.soil ?? DEMO.soil;
  return {
    ...db, plots, market, soil,
    demo: { plots: !db.plots, market: !db.market, soil: !db.soil },
    anyDemo: !db.plots || !db.market || !db.soil,
    update: useCallback(write, []),
  };
}
export const uid = () => Math.random().toString(36).slice(2, 10);
