import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { useStore } from "@/lib/store";
import { useT, type Lang } from "@/lib/i18n";
import { Sprout } from "lucide-react";

const NAV = [
  { to: "/visit", k: "nav_visit" },
  { to: "/farmers", k: "nav_farmers" },
  { to: "/planner", k: "nav_planner" },
  { to: "/feedback", k: "nav_feedback" },
  { to: "/admin", k: "nav_admin" },
  { to: "/methodology", k: "nav_method" },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const { anyDemo } = useStore();
  const { t, lang, setLang } = useT();
  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      {anyDemo && (
        <div role="status" className="bg-warning px-4 py-1.5 text-center text-xs font-semibold text-warning-foreground">
          {t("demo_banner")}
        </div>
      )}
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3">
          <Link to="/" className="flex items-center gap-2 font-display text-lg font-semibold text-primary">
            <Sprout className="h-5 w-5" /> Ubutaka Insights
          </Link>
          <nav className="flex flex-1 flex-wrap gap-1 text-sm">
            {NAV.map((n, i) => (
              <Link key={n.to} to={n.to}
                className={i === 0 ? "rounded-md bg-primary px-3 py-1.5 font-medium text-primary-foreground" : "rounded-md px-3 py-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"}
                activeProps={i === 0 ? {} : { className: "bg-muted text-foreground" }}>
                {t(n.k)}
              </Link>
            ))}
          </nav>
          <select aria-label="Language" value={lang} onChange={(e) => setLang(e.target.value as Lang)}
            className="rounded-md border border-input bg-background px-2 py-1 text-sm">
            <option value="en">English</option><option value="rw">Kinyarwanda</option><option value="fr">Français</option>
          </select>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
      <footer className="mx-auto max-w-6xl px-4 pb-8 text-xs text-muted-foreground">
        Decision support only. Figures are estimates from comparable observations; they show association, not causation, and are never guarantees. Fertilizer and lime advice comes only from RwaSIS.
      </footer>
    </div>
  );
}

export function SourceTag({ n, confidence, source, level }: { n?: number; confidence?: string | null; source: string; level?: string }) {
  return (
    <p className="mt-2 flex flex-wrap gap-x-3 text-xs text-muted-foreground">
      {n !== undefined && <span>n = {n}</span>}
      {confidence && <span>Confidence: <b className="text-foreground">{confidence}</b></span>}
      {level && <span>Cohort: {level}</span>}
      <span>Source: {source}</span>
    </p>
  );
}

export function Empty({ children }: { children: ReactNode }) {
  return <div className="rounded-md border border-dashed border-border p-4 text-sm text-muted-foreground">{children}</div>;
}
