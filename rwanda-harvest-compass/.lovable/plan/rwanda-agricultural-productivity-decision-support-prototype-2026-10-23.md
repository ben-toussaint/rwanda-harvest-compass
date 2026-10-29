# Rwanda Agricultural Productivity Decision Support – Prototype Plan

Decision-support layer over RwaSIS (soil + fertilizer/lime, Level 1, never overridden), NISR SAS (plot-level production and practices) and NISR market data. Answers: "Given this land, crop, target and market, what does the evidence suggest?" It never prescribes doses of its own and never promises yields.

## Global rules (enforced in every screen)

- No invented numbers: missing data = empty state.
- Fertilizer/lime advice only from RwaSIS, shown verbatim with its source.
- Every figure shows range, sample size (n), confidence label and source.
- Wording: "expected", "estimated", "associated with", "comparable observations". Never "guaranteed" / "will produce".
- "Demo data – not official statistics" banner on every screen while any demo dataset is active.

## Users and roles

- Advisor (primary): extension officers, Twigire Muhinzi promoters, sector agronomists, cooperative managers. Manages many farmer profiles and plots, runs evaluations for them.
- Planner: district/national aggregate dashboard.
- Farmer (secondary): self-service on smartphone.
- Admin: data import and publishing.
- Roles stored in a separate roles table, checked on the server.

## Screens (priority order)

1. End-to-end maize flow (mobile-first "New farmer visit" for advisors; same flow for farmers):
   location (province/district/sector or UPI) → land (area in ha, are or m²; default ~0.5 ha) → crop (Maize; others "Coming soon") → target (t/ha or total kg) → results.
   Results dashboard:
   - Expected yield range (p25–p75, median) from comparable observations, with n, confidence, source.
   - Empirical attainable yield = p90 of comparable observed yields, labelled OBSERVED, not agronomic potential.
   - Target classification: within expected range / above average / near observed ceiling / outside observed range (warning: looks unrealistic for comparable conditions).
   - Gap to target.
   - Practices associated with higher yields (fertilizer use, improved seed, pesticide, irrigation, agroforestry) – association, not causation; Liebig note.
   - Scenarios (L3): cohort ranges for practice combinations.
   - RwaSIS soil info and fertilizer/lime recommendation (L1), with source label per soil record.
   - Market: observed price p25–p75 by selling place, fallback district → province → national; gross revenue = estimated production × price, labelled "gross revenue, not profit".
   - One-click sample: Musanze, 1 ha maize, 5 t/ha target.
2. Planner dashboard: district comparison of yields, practice adoption, gaps, with n and confidence.
3. Feedback loop: record harvest vs target per plot/season; Measure → Compare → Gap → Recommend → Implement → Measure again.
4. Admin import: CSV/XLSX upload → column mapping → validation report → preview → publish. Datasets: SAS plot records, cohort statistics, model coefficients (trained offline in Python), market prices, manual RwaSIS records. Publishing real data replaces demo data and removes the banner.
5. Methodology page: cohorts, ranges, confidence labels, data sources, prediction vs causation, roadmap.
6. Short pitch (landing page).

## Confidence labels

- High: plot-level cohort n ≥ 100. Medium: 30–99. Low: 10–29. Below 10: widen cohort (sector → district → province → national) or empty state.
- District-aggregate fallback (published tables only) is always labelled Low, with a UI note.

## Data sources as adapters (interfaces, optional ones off by default)

- RwaSIS adapter + manual-entry fallback (access being confirmed).
- iSDAsoil: fallback soil source only when RwaSIS has no record (licence to be verified by owner). Off.
- CHIRPS rainfall, Meteo Rwanda bulletins: optional yield-model features. Off.
- Every soil profile stores its source; UI labels it.

## Crop-agnostic design

All tables, calculations and screens keyed by crop; Irish potato (Musanze/Nyabihu) added later by importing data only.

## Languages

English, Kinyarwanda, French, plain language. Kinyarwanda/French strings marked for native-speaker review.

## Demo data

Clearly flagged demo rows for maize (a few districts incl. Musanze), market prices and one RwaSIS-style record, all tagged is_demo. Not derived from or presented as NISR figures.

## Out of scope now (roadmap section)

Water-limited potential yield (Yw); QUEFTS / nutrient-balance cross-check (after validated pH, OC, P, K); Irish potato; SMS/USSD channel; cooperative group reports; fertilizer-cost viability check; price forecasting; Python service.

## Technical details

- Lovable Cloud for accounts, roles (separate roles table + has_role check), farmers, plots, evaluations, harvest results, datasets, cohort stats, market prices, soil profiles (with source column), import jobs.
- Cohort lookup and percentile maths in server functions; tests for confidence thresholds, target classification, price fallback and gross revenue.
- XLSX/CSV parsing in the browser for preview; publish via server function with validation.
- Build order: Cloud + schema + demo seed → maize flow + sample → planner → feedback → admin import → methodology/pitch → translations.
