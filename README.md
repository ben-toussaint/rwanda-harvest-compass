# Ubutaka Insights

**Data-Driven Agricultural Productivity Decision Support System for Rwanda** — a working, demo-able web prototype for extension officers, farmer promoters, cooperative managers, agricultural planners and farmers.

It answers one question:

> Given this land, this crop, this target and this market — what does the evidence suggest I should do to improve the chance of reaching that target?

It is a **decision-support layer, not a prescription engine**. It never invents fertilizer or lime doses, never promises a yield, and never hides the sample size or the source behind a number.

*(The repository and published URL are also referred to as **Rwanda Harvest Compass**; the name shown in the app header is **Ubutaka Insights**.)*

---

## Contents

1. [What the system is](#1-what-the-system-is)
2. [What the system does](#2-what-the-system-does)
3. [Who it is for](#3-who-it-is-for)
4. [User guide](#4-user-guide)
5. [How the numbers are produced](#5-how-the-numbers-are-produced)
6. [Data import formats](#6-data-import-formats)
7. [Rules the system always follows](#7-rules-the-system-always-follows)
8. [Current state and limitations](#8-current-state-and-limitations)
9. [Roadmap](#9-roadmap)
10. [Running the prototype locally](#10-running-the-prototype-locally)
11. [Glossary](#11-glossary)

---

## 1. What the system is

Advisory in Rwanda still relies largely on blanket regional recommendations. Ubutaka Insights puts location-specific soil advice next to what comparable farms actually harvested and what the crop actually sells for — so an advisor and a farmer can agree on a realistic target and on what is associated with reaching it.

The system does not generate its own agronomy. It integrates three existing sources and presents them together:

| Source | What it provides | How the system uses it |
| --- | --- | --- |
| **RwaSIS** (Rwanda Soil Information System, RAB) | Soil properties, crop suitability, fertilizer/lime recommendations by UPI or location | **Level 1 — the only source of fertilizer/lime advice.** Shown word for word, with its source. Never overridden, never recalculated. |
| **NISR Seasonal Agricultural Survey (SAS)** | Plot-level production and practice records: crop, season, district, plot area, yield, fertilizer use, improved seed, pesticide, irrigation, agroforestry — across all 30 districts | **Levels 2 and 3** — expected yield ranges, observed attainable yield, practice associations and scenarios. NISR has no soil chemistry and is never used for it. |
| **NISR market information** | Selling price per kg, selling place, quantity sold | Observed price ranges and gross revenue. No price forecasting. |

Optional environmental and soil sources sit behind switches that are **off by default**, and none of them is allowed to produce fertilizer advice:

- **iSDAsoil** (30 m soil maps) — fallback soil source *only* when RwaSIS has no record for the location.
- **CHIRPS** rainfall and **Meteo Rwanda** seasonal bulletins — optional environmental features.

The reasoning chain it follows:

```text
Land → Soil → Crop → Conditions → Inputs → Expected productivity → Target → Market
```

And the loop it is designed to close over seasons:

```text
Measure → Compare → Identify gap → Recommend → Implement → Measure again
```

---

## 2. What the system does

For one plot, in one screen, it produces:

| Output | Meaning |
| --- | --- |
| **Expected yield range** | The middle half (p25–p75) of comparable observed yields — what usually happens on land like this. |
| **Empirical attainable yield** | The 90th percentile of comparable observations: what the best 10% of comparable plots were *observed* to reach. Labelled OBSERVED — it is **not** an agronomic potential. |
| **Target classification** | Whether the farmer's target is *within expected range*, *above average*, *near the observed ceiling*, or *outside the observed range* (with a warning). |
| **Gap to median** | Target minus the median of comparable observations, in t/ha. |
| **Practices associated with higher yields** (Level 2) | Median yield of comparable plots with vs without each practice — association, not causation. |
| **Scenarios** (Level 3) | Observed ranges for four practice combinations, so the advisor can discuss what is affordable. |
| **Soil and fertilizer/lime** (Level 1) | The RwaSIS record for the parcel or area, quoted verbatim, with its source. |
| **Market and gross revenue** | Observed price range by selling place, estimated production on the plot's area, and gross revenue — labelled *not profit*. |

Every figure carries its **sample size (n)**, a **confidence label** (High / Medium / Low) and its **data source**. When the evidence is too thin, the system shows an empty state instead of a number.

---

## 3. Who it is for

**Primary — advisors.** Extension officers, Twigire Muhinzi farmer promoters, sector agronomists and cooperative managers who advise groups of farmers. The advisor flow is first in the navigation: keep a list of farmers, run a fast visit for each, save it, and return at harvest.

**Planners.** District and national agricultural planners who compare districts and adoption rates on the aggregate dashboard.

**Secondary — farmers.** An individual farmer with a smartphone can use the same visit screen on their own.

The screens are built for typical smallholder plots of about **0.5 ha**, accept areas in **hectares, ares or m²**, and switch between **English, Kinyarwanda and French**.

---

## 4. User guide

### 4.0 Before you start

- **Demo banner.** A yellow banner across the top reads *"Demo data – not official statistics"* while any dataset is still synthetic. It disappears for a dataset once you publish a real file for it in **Data import**.
- **Language.** The selector at the top right switches English / Kinyarwanda / Français. Menus, the banner and the key result labels are translated; detailed explanatory text is still mostly English.
- **One-click sample.** The button *"Try the sample: Musanze, 1 ha maize, 5 t/ha"* (on the landing page and above the visit form) runs the whole flow instantly — useful for a demo.

### 4.1 New farmer visit — `/visit` (the main screen)

1. **Farmer (optional).** Pick a saved farmer from *My farmers*, or leave it as "Self / not recorded". Choosing a farmer fills in their district.
2. **Location (district).** Choose one of the 30 districts (grouped by province).
3. **UPI (optional).** The land parcel identifier, e.g. `4/03/01/02/1234`, so the soil record can be matched to the exact parcel.
4. **Land area.** Type the area and pick the unit: **ha**, **are** or **m²**. Small plots work — 50 ares or 5 000 m² both become 0.5 ha.
5. **Crop.** **Maize** is live. Irish potato, beans and cassava are shown as *Coming soon*.
6. **Target yield (t/ha).** What the farmer hopes to reach.
7. Press **See evidence**. The results dashboard appears below the form.

### 4.2 Reading the results dashboard

| Card | How to read it out loud to a farmer |
| --- | --- |
| **Expected yield range** | "On land like this, comparable plots most often got between X and Y t/ha." Median and n are shown; the cohort tier (district / province / national) is shown when the estimate had to widen. |
| **Empirical attainable yield** | "The best 10% of comparable plots were observed at about Z t/ha." This is an observation, not a promise or a potential. |
| **Your target** | The target, its classification badge, and the gap to the median. **Outside the observed range** means no comparable plot reached it — the screen suggests a lower target for these conditions. |
| **Chart: where your target sits** | Bars for p25, median, p75 and p90 with a dashed line at the target — the visual version of the same comparison. |
| **Level 2 · Practices associated with higher yields** | For each practice: median yield with vs without, and both sample sizes. Read as *association only* — farmers who use a practice may also differ in soil, rain, labour or skill. The note on the card recalls Liebig's law of the minimum: no single input guarantees yield. |
| **Level 3 · Scenarios from comparable observations** | Four combinations (no fertilizer/local seed, fertilizer only, improved seed only, both) with the observed range for each, or "Not enough data". |
| **Level 1 · Soil and fertilizer/lime (RwaSIS)** | pH, organic carbon, texture, crop suitability and the RwaSIS recommendation quoted in a blockquote, with the record's source. If no record exists: an empty state telling the advisor to have it entered from RwaSIS. |
| **Market and gross revenue** | Observed price p25–p75 overall and per selling place, estimated production on this plot's area, and a gross revenue range — always labelled *gross revenue, not profit* (no input or labour costs deducted, no price forecast). |

Two notes can appear above the cards: one when only published district tables are available (lower confidence), and one when the estimate had to use province or national observations because the district had too few.

### 4.3 Save the visit for follow-up

Press **Save visit for harvest follow-up** above the results. This stores the plot, the target and the expected range so the harvest can be recorded later.

### 4.4 My farmers — `/farmers`

For advisors managing several farmers. Add a farmer with name, phone, district and sector; the list shows each farmer's district and how many evaluations exist, with a **New visit** button that opens the visit form pre-filled for that farmer.

### 4.5 Planner — `/planner`

The aggregate dashboard for maize. A stacked chart shows each district's median yield plus its gap to the observed p90, and a table lists district, n, confidence, p25–p75, median, p90, fertilizer use % and improved seed %. Districts with fewer than 10 observations are hidden. Differences between districts are descriptive — they do not by themselves explain causes.

### 4.6 Harvest results — `/feedback`

The closing of the loop. For each saved visit, enter the harvested **kg**. The screen converts it to t/ha for that plot's area, shows the gap to target, and says whether the harvest fell **below, within or above the expected range** that was shown at the visit.

### 4.7 Data import — `/admin`

The pipeline that replaces demo data with real files. Six numbered steps:

1. **Dataset** — choose one: *NISR SAS plot records*, *NISR published district table (lower confidence)*, *NISR market prices*, or *RwaSIS soil records (manual entry)*.
2. **File** — select a **.csv** or **.xlsx/.xls**.
3. **Column mapping** — match your file's headers to the system's fields. Identically-named headers are matched automatically; required fields are marked `*`.
4. **Validation report** — how many rows are valid, with up to 20 listed errors (empty required cell, value not a number, unknown district name).
5. **Preview** — the first five mapped rows.
6. **Publish** — enters the valid rows and, for that dataset, replaces the demo data (the banner then stops counting that dataset). A **Source label** such as `NISR SAS 2024 Season A` is required so every figure can cite it.

Below the pipeline: the optional adapters (iSDAsoil, CHIRPS, Meteo Rwanda), all off by default, and a note that live RwaSIS access is still pending — meanwhile use the *RwaSIS soil records (manual entry)* dataset. A **Remove imports and return to demo data** button clears uploaded rows.

### 4.8 Methodology — `/methodology`

The transparent version of sections 5–7 below: data sources, cohorts, ranges, confidence labels, the prediction-vs-causation limit, and the roadmap. Use it in a pitch when a judge asks "where does this number come from?".

### 4.9 A 60-second demo run-through

1. Landing page → **Try the sample: Musanze, 1 ha maize, 5 t/ha**.
2. Point at **Expected yield range** (1.6–2.6 t/ha, median 2.0, n = 140, High confidence) and **Empirical attainable yield** (3.2 t/ha, observed top 10%).
3. Point at **Your target: 5.0 t/ha → Outside the observed range** and the warning — the honesty that makes the rest credible.
4. Scroll to **Level 2**: fertilizer 2.5 vs 1.8 t/ha, improved seed 2.3 vs 1.8 — and say *associated, not caused*.
5. **Level 3**: fertilizer + improved seed plots observed at 2.2–3.9 t/ha.
6. **Level 1**: the RwaSIS card with its source — doses come only from RwaSIS, never from this app.
7. **Market**: 335–357 RWF/kg observed → about 0.53–0.93 million RWF gross revenue on 1 ha, "not profit".
8. Open **Methodology** to close with the limits and the roadmap.

---

## 5. How the numbers are produced

All arithmetic lives in [`src/lib/engine.ts`](src/lib/engine.ts) as pure functions over the records passed in. Nothing is generated: every output is either computed from the data or `null` (an empty state).

**1. Find the comparable cohort.** Same crop, same district. If fewer than **10** observations exist there, widen to the **province**, then to the **whole country**, and say which tier was used. If still fewer than 10, show nothing.

**2. Summarise the observed yields** of that cohort:

| Statistic | Definition | Shown as |
| --- | --- | --- |
| p25 – p75 | 25th to 75th percentile (the middle half) | Expected yield range |
| p50 | Median | Median |
| p90 | 90th percentile | Empirical attainable yield (OBSERVED) |
| max | Highest observation | Used for the ceiling classification |

**3. Classify the target** against those statistics:

| Classification | Rule |
| --- | --- |
| Within expected range | target ≤ p75 |
| Above average | target < 0.9 × p90 |
| Near the observed ceiling | target ≤ max |
| Outside the observed range | target > max → warning |

**4. Compare practices (Level 2).** For each practice, the median yield of cohort plots with it versus without it. A practice is reported only when **both groups have at least 10 plots**, and never from published aggregate tables. Results are sorted by size of difference and presented as association.

**5. Build scenarios (Level 3).** Four filters on the same cohort — no fertilizer & local seed, fertilizer only, improved seed only, fertilizer & improved seed — each reported with its own n, confidence and cohort tier, or "Not enough data".

**6. Price and revenue.** Prices fall back **selling place → district → province → national**, needing at least **5** observations at a tier; per-place ranges need at least **3**. Then:

```text
production kg  = yield (p25…p75) × area ha × 1000
gross revenue  = production kg × price (p25…p75)     → labelled "gross revenue, not profit"
```

**7. Soil lookup order.** RwaSIS by **UPI** → RwaSIS by **district** → iSDAsoil by district **only if** the fallback switch is on. iSDAsoil never supplies fertilizer advice.

**Confidence labels**

| Label | Condition |
| --- | --- |
| High | n ≥ 100 plot observations |
| Medium | n = 30–99 |
| Low | n = 10–29, **or** any estimate based on published district aggregates |
| *(no estimate)* | n < 10 → empty state |

**Worked example (demo data, Musanze, 1 ha maize, 5 t/ha target)** — the numbers a judge sees in the one-click sample:

```text
cohort          140 plot observations, district tier, High confidence
expected range  1.6 – 2.6 t/ha   median 2.0   attainable (p90) 3.2   max 4.8
target 5.0      Outside the observed range · gap to median +3.0 t/ha
associations    fertilizer 2.5 vs 1.8 (n 59/81) · improved seed 2.3 vs 1.8 (n 64/76)
                pesticide 2.2 vs 1.9 (n 43/97) · agroforestry 2.2 vs 1.9 (n 50/90)
                irrigation: not reported (too few irrigated plots)
scenarios       none 1.3–1.9 (n 43) · fertilizer only 1.8–2.7 (n 33)
                improved seed only 1.6–2.6 (n 38) · both 2.2–3.9 (n 26)
market          335–357 RWF/kg (district, n 18) · cooperative 347–395 · farm gate 273–336
gross revenue   1 595–2 595 kg → 534 700–925 100 RWF (not profit)
```

These values come from the synthetic demo dataset, not from NISR — the banner says so on every screen.

---

## 6. Data import formats

Column names below are the *system fields* you map your headers to; your own headers can be anything. Practice flags accept `1`, `yes`, `true`, `y`, `oui`, `yego` as "yes".

| Dataset | Required | Optional |
| --- | --- | --- |
| **NISR SAS plot records** | `crop`, `season`, `district`, `plot_area_ha`, `yield_t_ha` | `fertilizer`, `improved_seed`, `pesticide`, `irrigation`, `agroforestry` |
| **NISR published district table** (lower confidence) | `crop`, `season`, `district`, `yield_t_ha`, `n` | — |
| **NISR market prices** | `crop`, `district`, `selling_place`, `price_rwf_kg` | `quantity_kg` |
| **RwaSIS soil records (manual entry)** | `district`, `rwasis_recommendation` | `upi`, `sector`, `ph`, `organic_carbon_pct`, `texture` |

Rules applied at validation and publish time:

- `district` must match one of Rwanda's 30 official district names (the province is derived from it).
- Numeric fields (`plot_area_ha`, `yield_t_ha`, `n`, `price_rwf_kg`, `quantity_kg`, `ph`, `organic_carbon_pct`) must be numbers.
- Crop names are lower-cased; a published district table is stored as an aggregate with its `n`, which forces **Low** confidence.
- A **source label** is mandatory so every figure can cite it; publishing appends the valid rows and clears the demo flag for that dataset.

Model training happens offline (a Python notebook outside this app). Cohort statistics and model coefficients are loaded through this same import — there is no model service to run here.

---

## 7. Rules the system always follows

- **Never fabricate numbers.** Missing data → an empty state, never a placeholder figure.
- **Never produce our own fertilizer or lime doses.** Only RwaSIS recommendations, quoted with their source.
- **Always show ranges, sample size (n), confidence label and data source.**
- **Say "expected", "estimated", "associated with", "comparable observations"** — never "guaranteed" or "will produce".
- **Label demo data** on every screen until real imports replace it.
- **Keep every table, function and screen crop-agnostic**, so a new crop is a data import, not a code change.

---

## 8. Current state and limitations

| Area | State |
| --- | --- |
| **Data** | Synthetic **demo** data only (535 plot records over 8 districts, 108 market records over 6 districts, 1 soil record for Musanze), all flagged `is_demo` and sourced "DEMO synthetic data (not NISR)". Real NISR SAS, market and RwaSIS files still need importing. |
| **RwaSIS** | No live connection — access is being confirmed. Soil comes from demo records or manual entry through the import screen. |
| **Accounts and roles** | None. There is no sign-in; advisor, planner and admin are screen roles, not enforced permissions. Data is stored **in this browser only** (`localStorage`, key `dss.v1`), so records are not shared between devices or users. Shared multi-user accounts need a backend step. |
| **Crops** | Maize only; potato, beans and cassava are marked "Coming soon" and are data-import work, not code work. |
| **Languages** | English is complete. Kinyarwanda and French cover menus, the banner and key result labels, and both still need native-speaker review. |
| **Environmental data** | iSDAsoil, CHIRPS and Meteo Rwanda are switches only — not connected; off by default. |
| **Models** | Trained offline by the project owner; the app consumes the resulting tables. |

---

## 9. Roadmap

1. **Water-limited potential yield (Yw)** as an agronomic reference, alongside the empirical attainable yield.
2. **QUEFTS / nutrient-balance cross-check** — only once validated soil pH, organic carbon, P and K exist.
3. **Irish potato** (Musanze, Nyabihu) as the second crop — by importing data, with no code change.
4. **SMS/USSD channel** and **cooperative-level group reports**.
5. **Fertilizer-cost viability check** (input costs vs gross revenue).
6. **Accounts and roles** (advisor / planner / farmer / admin) with shared data.
7. **Price forecasting** — deliberately out of the MVP, which shows observed ranges only.

---

## 10. Running the prototype locally

Requires Node.js (or Bun). From the repository root:

```sh
npm install        # or: bun install
npm run dev        # starts the dev server, opens on port 8080
npm test           # vitest: engine rule tests + routing test
npm run build      # production build
npm run preview    # serve the built app
npm run lint       # eslint
```

| Script | What it does |
| --- | --- |
| `dev` / `build` / `preview` | Run, build and serve the app |
| `test` / `test:watch` | Run the test suite (10 tests: cohort widening, confidence labels, target classification, price fallback, gross revenue, soil lookup, area units) |
| `lint` / `format` | Check and fix code style |

**Stack:** TanStack Start (React 19 + Vite), Tailwind CSS v4, shadcn/ui, Recharts, Papa Parse + SheetJS for imports, Vitest for tests.

**Layout:**

```text
src/
  lib/engine.ts        the evidence engine: cohorts, ranges, classification,
                       practice associations, scenarios, prices, revenue, soil lookup
  lib/engine.test.ts   tests for the engine rules
  lib/geo.ts           the 30 districts by province, and the crop list
  lib/demo-data.ts     synthetic demo records, all flagged is_demo
  lib/store.ts         browser-local storage of imports, farmers and saved visits
  lib/i18n.tsx         English / Kinyarwanda / French strings
  components/          the app shell (nav, demo banner, source tags) and the results dashboard
  routes/              one file per screen: /, /visit, /farmers, /planner, /feedback, /admin, /methodology
docs/PROJECT-BRIEF.md  the project owner's original brief and rules
```

To reset everything to the demo state, clear the site's local storage in the browser (or use **Remove imports and return to demo data** in `/admin`).

---

## 11. Glossary

| Term | Meaning here |
| --- | --- |
| **Cohort / comparable observations** | Past survey plots with the same crop in the same district (or province / country when the district has too few). |
| **Expected yield range** | p25–p75 of the cohort — the middle half of what was actually harvested. |
| **Empirical attainable yield** | p90 of the cohort — the observed top 10%. Not an agronomic potential. |
| **Target classification** | Within expected range / above average / near the observed ceiling / outside the observed range. |
| **Practice association** | Median yield with vs without a practice — an association, never a measured effect. |
| **Confidence** | High (n ≥ 100), Medium (30–99), Low (10–29 or published aggregates), none below 10. |
| **Gross revenue** | Estimated production × observed price, with no costs deducted — not profit. |
| **Liebig's law of the minimum** | Yield is capped by the most limiting factor, so no single input guarantees a result. |

---

## Built with Lovable

This project was built with [Lovable](https://lovable.dev) and continues to be developed there.

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.
