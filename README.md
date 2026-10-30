# TerraTech (Ubutaka Insights)

**A data-driven decision support system for agricultural productivity in Rwanda.**

Live prototype: https://terratec.netlify.app/

> **Status:** hackathon prototype, maize only. The live site currently shows a "Demo data – not official statistics" banner until real NISR and RwaSIS data are imported (see [Data](#data)).

---

## 1. What is this?

Advisory in Rwanda still relies largely on blanket regional recommendations. The information an advisor needs is scattered: soil advice in one place, farm survey results in another, market prices somewhere else.

TerraTech puts them side by side. For a given **district, farm size and target yield**, it shows:

- what soil and fertilizer advice RwaSIS gives for that land,
- what comparable farms actually harvested (expected range and attainable yield),
- which practices are associated with higher yields,
- what maize sells for, and the gross revenue that implies.

It is built first for **extension officers**, Twigire Muhinzi farmer promoters, sector agronomists and cooperative managers. Planners get district comparisons, and farmers can use it on their own phone.

The working loop it supports:

**Measure → Compare → Identify gap → Recommend → Implement → Measure again**

---

## 2. Principles (what the system will and will not do)

1. **No invented numbers.** Fertilizer and lime recommendations come only from RwaSIS, shown verbatim. The system never overrides or makes up a dose.
2. **Association, not causation.** Practice insights describe what comparable farms did, not what will happen on your farm.
3. **Always ranges, never single promises.** Every estimate shows a range, the sample size (n), a confidence label and the source.
4. **Revenue, not profit.** Market output is gross revenue. Costs are not modelled.
5. **Honest about demo data.** A persistent banner appears whenever demo data is in use.

---

## 3. How it works

The app is organised in three evidence levels that are never mixed together.

| Level | Source | What it shows |
|---|---|---|
| **Level 1** | RwaSIS | Soil, crop suitability, fertilizer and lime recommendations, verbatim |
| **Level 2** | NISR survey observations | Expected range for comparable plots, observed attainable yield, practices associated with higher yields |
| **Level 3** | Scenarios and market prices | Ranges for practice combinations, price ranges by selling place, gross revenue |

### The farmer-visit flow

The visit wizard follows eight steps:

1. **Land** (district, plot size)
2. **Soil**
3. **Crop**
4. **Conditions**
5. **Inputs** (fertilizer, seed, pesticide, irrigation, agroforestry)
6. **Expected productivity**
7. **Target**
8. **Market**

A one-click sample scenario is available: *Musanze, 1 ha maize, 5 t/ha target*.

### The decision engine (Level 2)

The engine works directly from raw plot records and computes statistics on the fly. You do not need to precompute anything.

**Cohort selection.** It looks for comparable plots in the same **district** first. If there are too few, it widens to the **province**, then to the **nation**.

**Statistics per cohort**
- **Expected range:** 25th to 75th percentile (p25 to p75) of yield
- **Attainable yield:** 90th percentile (p90) of observed yield. This is an empirical ceiling among real farms, not a theoretical potential yield
- **Gap analysis:** distance between the target and the expected range / attainable yield, with a feasibility classification

**Confidence labels** (by number of plots, n)

| Label | Sample size |
|---|---|
| High | n ≥ 100 |
| Medium | 30 to 99 |
| Low | 10 to 29 |
| Widened | n < 10, so the cohort is widened to a larger area |

**Associated practices** are shown as non-causal associations, with a note that yield is limited by the scarcest nutrient (Liebig's law of the minimum).

### Market (Level 3)

Raw market records are aggregated into price statistics. Overall price needs n ≥ 5 records, and price by selling place needs n ≥ 3. Gross revenue = expected yield × area × price range.

---

## 4. Pages

| Route | Purpose |
|---|---|
| `/` | Landing page and sample scenario |
| `/visit` | New farmer visit (advisor-first intake wizard) |
| `/farmers` | My farmers |
| `/planner` | Planner dashboard with district comparisons |
| `/feedback` | Harvest results, to close the measure → compare loop |
| `/admin` | Data import (CSV or XLSX) |
| `/methodology` | Methods, sources, limitations |

The interface is available in **English, Kinyarwanda and French** (translation coverage is partial).

---

## 5. Data

### Sources

- **RwaSIS**: soil and fertilizer recommendations (Level 1). Currently a clearly labelled demo placeholder in the prototype.
- **NISR microdata**: Agricultural Household Survey 2024 (AHS 2024), from the NISR microdata portal (https://microdata.statistics.gov.rw). Used for empirical yields and practices (Level 2).
- **Market prices**: observed prices by district and selling place (Level 3).

### Import formats (`/admin`)

District names must match the official list of Rwanda's 30 districts. Boolean columns accept `1/0`, `yes/no`, `true/false`, `y/n`, `oui/non`, `yego/oya`.

**1. Plots** (main file)

```
crop,season,district,plot_area_ha,yield_t_ha,fertilizer,improved_seed,pesticide,irrigation,agroforestry
maize,2024A,Musanze,0.4,2.1,1,1,0,0,1
```

- `fertilizer` means **inorganic** fertilizer only. Organic fertilizer is used by about 94% of households and would hide any signal.
- Province is derived automatically from the district.

**2. Aggregates** (district-level fallback)

```
crop,season,district,yield_t_ha,n
```

**3. Market**

```
crop,district,selling_place,price_rwf_kg,quantity_kg
```

**4. Soil** (verbatim RwaSIS text only)

```
district,sector,upi,ph,organic_carbon_pct,texture,rwasis_recommendation
```

### Where imported data is stored

The prototype has **no backend and no accounts**. Data imported through `/admin` is saved in the **browser's localStorage**, which means:

- it exists only on the device and browser where it was imported,
- other visitors opening the public link see the demo data,
- very large datasets can exceed browser storage limits.

Moving to a shared backend (see [Roadmap](#8-roadmap)) removes this limit.

### Data protection and licensing

NISR microdata is used under the portal's terms of use. Raw survey files (`.dta`) must **never** be committed to this repository or uploaded to any hosted tool. Only aggregated, non-identifying outputs are displayed. Check the NISR terms before publishing any processed plot-level file publicly.

---

## 6. Data preparation (AHS 2024 to CSV)

Cleaning is done **offline on the developer's machine** with Python and pandas.

1. **Find variables.** A small script lists column names and labels in the relevant AHS 2024 files:
   - Section 0 (identifiers, district, weights)
   - Section 2 (land tenure and plots, if needed)
   - Section 3_4 (crops grown and production, the main file)
   - Section 7 (agricultural inputs and practices)
2. **Clean and transform.**
   - keep maize rows only,
   - join district and practice variables to crop rows by household ID,
   - convert area and quantity to hectares and kilograms,
   - compute `yield_t_ha = production_kg / 1000 / area_ha`,
   - remove implausible yields (above 15 t/ha),
   - standardise district names and build season codes (for example `2024A`),
   - export `plots.csv` and `market.csv` in the import formats above.
3. **Sanity-check** the output against published benchmarks before importing.
4. **Import** the two files through `/admin`.

---

## 7. Limitations

- **Maize only** in this prototype.
- **Demo data** is shown until real data is imported.
- **Unweighted percentiles.** Survey weights are not applied in the current engine.
- **Practice flags may be household-level**, not plot-level, in the source survey. If so, associations are approximate.
- **Empirical ceiling, not potential yield.** The p90 figure reflects what real farms achieved, not the biophysical maximum.
- **Association only.** No causal claims are made.
- **No cost model.** Revenue is gross.
- **Browser-only storage**, no multi-user sync.
- Translation coverage is partial.
- Figures from different surveys (for example AHS 2024 and the Seasonal Agricultural Survey) use different methods and should not be mixed or compared directly. Cite each separately.

---

## 8. Roadmap

- Shared backend (for example Supabase) with accounts and roles for advisors and planners
- Potato and other crops (the schema is already crop-agnostic)
- Optional fallback soil data (for example iSDAsoil) and rainfall data (for example CHIRPS) where RwaSIS coverage is missing
- A nutrient-balance module (for example QUEFTS) as a later add-on
- Full Kinyarwanda and French coverage
- Survey-weighted statistics and a hold-out validation report (district-cohort median vs national median, error and band coverage)

---

## 9. Tech stack

- **React + TypeScript + Vite**
- **Tailwind CSS + shadcn/ui**
- Client-side state with `localStorage` (no backend in this version)
- Built with Lovable, deployed on Netlify, source synced to GitHub

---

## 10. Run it locally

Requires Node.js (18 or newer).

```bash
git clone <your-repo-url>
cd <repo-folder>
npm install
npm run dev
```

The app opens on `http://localhost:5173` (or the port shown in the terminal).

To build for deployment:

```bash
npm run build
```

The `dist/` folder can be hosted on Netlify, Vercel or any static host, since there is no server component.

**Recommended `.gitignore` additions:**

```
*.dta
*.csv
```

(Remove `*.csv` only for files you have confirmed are safe to publish.)

---

## 11. Disclaimer

Decision support only. Figures are estimates from comparable observations. They show association, not causation, and are never guarantees. Fertilizer and lime advice comes only from RwaSIS.

---

## 12. Credits

- **Author:** Ben (BenTou)
- **Data:** National Institute of Statistics of Rwanda (NISR), RwaSIS
- Built for a hackathon on data-driven agricultural productivity in Rwanda.
