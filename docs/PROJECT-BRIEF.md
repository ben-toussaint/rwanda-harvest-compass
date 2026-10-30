# Rwanda Harvest Compass

Thanks for the review. Below is what the project is, my answers to your three questions, and the changes I want you to apply to the plan and the build. At the end, tell me briefly what you changed.
# 1. WHAT THE PROJECT IS
"Data-Driven Agricultural Productivity Decision Support System for Rwanda" is a competition prototype.
It is a decision-support layer. It does NOT invent fertilizer prescriptions and it does NOT promise yields. It integrates three existing sources:
1. RwaSIS (Rwanda Soil Information System, RAB): soil, crop suitability, and fertilizer/lime recommendations, searchable by UPI or location. It is the ONLY source of fertilizer/lime advice (Level 1). We never override it.
2. NISR Seasonal Agricultural Survey (SAS): plot-level production and agricultural-practice records (crop, season, district, plot area, yield, fertilizer use, improved seed, pesticide, irrigation, agroforestry), covering all 30 districts.
3. Market information from NISR: selling price per kg, selling place, quantity sold.
The question it answers: "Given this land, this crop, this target and the market, what does the evidence suggest I should do to improve the chance of reaching that target?"
Chain: Land → Soil → Crop → Conditions → Inputs → Expected productivity → Target → Market.
Loop: Measure → Compare → Identify gap → Recommend → Implement → Measure again.
# 2. CORRECTIONS TO YOUR REVIEW
1. "Target → inputs" fallacy: agreed, and the design already avoids it.
   - The system never says "apply X kg and you will get Y".
   - It estimates an expected yield RANGE from comparable observations, shows the gap to the target, and lists practices ASSOCIATED with higher yields. It never implies causation.
   - Reframe the UI around "attainable yield":
     • Show "Empirical attainable yield" = the p90 of comparable observed yields, labelled as OBSERVED, not agronomic potential.
     • Classify the target as: within expected range / above average / near the observed ceiling / outside the observed range. For the last case, warn that the target looks unrealistic for comparable conditions.
   - Do NOT compute water-limited potential yield (Yw) in the MVP. Put it on the roadmap and mention Liebig's law of the minimum (no single input guarantees yield).
2. NISR resolution: published SAS reports are aggregates, but SAS microdata is plot/household-level for production and practices, and that is what the yield model uses.
   - NISR contains no soil chemistry and we never use it for that. Soil comes from RwaSIS.
   - Add confidence labels based on sample size. If only district-level published tables are available, fall back to district aggregates with LOWER confidence and say so in the UI.
3. Extra data sources: good idea. Add them as optional adapters behind interfaces, off by default, with no fabricated data:
   - iSDAsoil (open 30 m soil maps for Africa) as a FALLBACK soil source only when RwaSIS has no record for the location. I will verify licence/access.
   - CHIRPS rainfall and Meteo Rwanda seasonal bulletins as optional environmental features for the yield model.
   - Every soil_profiles record must store its source, and the UI must label it.
4. "1982 soil data" claim: this is NOT part of this project, so ignore it. Our problem statement is that advisory still relies largely on blanket regional recommendations, and RwaSIS was built to move toward location-specific advice.
5. QUEFTS: good suggestion for a later phase.
   - Keep the three recommendation levels: L1 = RwaSIS verbatim, L2 = comparable-observation insights, L3 = scenarios.
   - Add a "QUEFTS / nutrient-balance module" to the roadmap as an optional agronomic cross-check, only once validated soil inputs (pH, organic carbon, P, K) exist. Do NOT build it now.
6. Scope: agreed.
   - MVP = maize only.
   - Keep every table, function and screen crop-agnostic so Irish potato (Musanze/Nyabihu) can be added as the second crop by importing data, with no code change.
   - Show other crops as "Coming soon".
7. Market: agreed.
   - MVP shows the observed price range (p25–p75 by selling place, falling back district → province → national) and gross revenue = estimated production × price, labelled "gross revenue, not profit".
   - No price forecasting.
   - Optional fertilizer-cost viability check is phase 2. Do not build it now.
# 3. ANSWERS TO YOUR QUESTIONS
## Q1. Who is the direct user?
- PRIMARY: extension officers, Twigire Muhinzi farmer promoters, sector agronomists and cooperative managers who advise groups of farmers, plus agricultural planners (district/national) using the aggregate dashboard.
- SECONDARY: individual farmers with a smartphone.
Changes to make:
- Add an "advisor" role alongside farmer, planner and admin. Advisors can create and manage multiple farmer profiles and plots and run evaluations on their behalf.
- Add a fast mobile "new farmer visit" flow, and make the advisor flow primary in the navigation.
- Keep the farmer self-service flow.
- Design for typical smallholder plots of about 0.5 ha: support small areas and are / m² input.
- Use plain-language wording in English, Kinyarwanda and French.
- Roadmap only (phase 2): SMS/USSD channel and cooperative-level group reports.
## Q2. What data do I have?
I am still obtaining the NISR SAS microdata, so for now I only have published NISR tables and reports. Please:
- Build the full import pipeline: CSV/XLSX upload, column mapping, validation report, preview, publish.
- Seed clearly flagged DEMO data now, and show a "Demo data – not official statistics" banner on every screen until real imports replace it.
- Model training happens OFFLINE in Python on my side. Cohort statistics and model coefficients are loaded through the admin import. Do NOT build a Python service.
- RwaSIS access is still being confirmed. Keep the RwaSIS adapter behind an interface with a manual-entry fallback.
## Q3. What is the primary deliverable?
A working, demo-able, responsive web prototype, plus a short pitch and a methodology page. The analytical notebook is a separate artifact on my side.
Priorities, in order:
1. One polished end-to-end maize flow: location → land → crop → target → results dashboard (expected range, gap, empirical attainable yield, associated factors, scenarios, RwaSIS soil info, market, gross revenue).
2. Planner dashboard with district comparisons.
3. Feedback loop (harvest results vs target).
4. Admin data import.
Also include:
- A one-click sample scenario (Musanze, 1 ha maize, 5 t target) so judges can see the full flow in under a minute.
- A methodology page explaining cohorts, ranges, confidence labels, data sources, and the prediction-vs-causation limit, with a roadmap section (Yw potential yield, QUEFTS, potato, SMS/USSD, fertilizer-cost viability).
# 4. RULES THAT STILL APPLY EVERYWHERE
- Never fabricate numbers. If data is missing, show an empty state.
- Never produce our own fertilizer/lime doses; only show RwaSIS recommendations, with their source.
- Always show ranges, sample size (n), confidence label and data source.
- Use wording like "expected", "estimated", "associated with", "comparable observations"; never "guaranteed" or "will produce".
# 5. WHAT I NEED BACK
Apply these changes to the existing plan and build, then give me a short list of what you changed and anything you could not do.

