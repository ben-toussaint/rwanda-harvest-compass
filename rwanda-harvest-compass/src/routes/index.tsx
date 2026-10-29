import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { useT } from "@/lib/i18n";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Ubutaka Insights – Data-driven maize decisions for Rwanda" },
      { name: "description", content: "Decision support combining RwaSIS soil advice, NISR survey evidence and market prices for extension officers, planners and farmers." },
      { property: "og:title", content: "Ubutaka Insights – Data-driven maize decisions for Rwanda" },
      { property: "og:description", content: "Land → Soil → Crop → Target → Market, with honest ranges and confidence labels." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Index,
});

const CHAIN = ["Land", "Soil", "Crop", "Conditions", "Inputs", "Expected productivity", "Target", "Market"];

function Index() {
  const { t } = useT();
  return (
    <div className="space-y-12">
      <section className="grid gap-8 py-6 md:grid-cols-[1.4fr_1fr] md:items-center">
        <div className="space-y-5">
          <p className="text-sm font-semibold uppercase tracking-widest text-soil">Agricultural productivity · Rwanda</p>
          <h1 className="font-display text-4xl font-semibold leading-tight md:text-5xl">Given this land, this crop and this target — what does the evidence suggest?</h1>
          <p className="max-w-xl text-lg text-muted-foreground">
            Advisory in Rwanda still relies largely on blanket regional recommendations. Ubutaka Insights puts RwaSIS location-specific soil advice next to what comparable farms actually harvested and what maize actually sells for — so extension officers can set realistic targets with farmers.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button asChild size="lg"><Link to="/visit" search={{ district: "Musanze", area: 1, unit: "ha", target: 5, crop: "maize" }}>{t("try_sample")}</Link></Button>
            <Button asChild size="lg" variant="outline"><Link to="/visit">{t("nav_visit")}</Link></Button>
          </div>
        </div>
        <ol className="space-y-1.5 rounded-lg border border-border bg-card p-5">
          {CHAIN.map((c, i) => (
            <li key={c} className="flex items-center gap-3 text-sm"><span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">{i + 1}</span>{c}</li>
          ))}
        </ol>
      </section>
      <section className="grid gap-4 md:grid-cols-3">
        {[
          ["Level 1 · RwaSIS", "Soil, crop suitability and fertilizer/lime recommendations, shown verbatim. We never override or invent doses."],
          ["Level 2 · Comparable observations", "NISR Seasonal Agricultural Survey plots like yours: expected range, observed attainable yield and practices associated with higher yields."],
          ["Level 3 · Scenarios & market", "Ranges for practice combinations, observed price ranges by selling place and gross revenue (not profit)."],
        ].map(([h, b]) => (
          <div key={h} className="rounded-lg border border-border bg-card p-5"><h2 className="font-display text-lg font-semibold">{h}</h2><p className="mt-2 text-sm text-muted-foreground">{b}</p></div>
        ))}
      </section>
      <section className="rounded-lg bg-primary p-6 text-primary-foreground">
        <h2 className="font-display text-2xl font-semibold">Measure → Compare → Identify gap → Recommend → Implement → Measure again</h2>
        <p className="mt-2 max-w-2xl text-sm opacity-90">Built for extension officers, Twigire Muhinzi farmer promoters, sector agronomists and cooperative managers first; planners get district comparisons; farmers can use it on their own phone.</p>
      </section>
    </div>
  );
}
