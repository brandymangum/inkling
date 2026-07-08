# Handoff: Digital CS — Customer Health Dashboard

## Overview
An internal Customer Success tool for our **under-$50K OEM segment** (~28 launched accounts that currently have no assigned CSM and receive no proactive engagement). It surfaces account-health signals in one view, ranks accounts that need attention, and lets a CSM drill into any account to see the trend detail, a DEAR health scorecard, contract utilization, the recommended playbook, and to log an outreach task. It also includes internal POC-planning views (Build Plan, Triggers & Thresholds, Playbook library) used to align the data/eng teams.

The goal it serves: catch customers quietly disengaging (login or login volume dropping ≥30% month-over-month, or a slow cumulative slide) **before** it becomes a renewal risk, and surface expansion (upsell) signals.

## Run it locally
The app reads its data from two CSV flat files, so it needs to be served over HTTP (a `fetch()` of a local file fails under `file://`). Any static server works:

```bash
# from the repo root
python3 -m http.server 8000
# then open http://localhost:8000/  (or http://localhost:8000/index.html)
```

(or `npx serve`, or VS Code Live Server, or push to GitHub Pages). If opened with no server it still runs — it falls back to an embedded snapshot baked into `lib/data.js`, shown as "Embedded data" in the sidebar. When the CSVs load, the sidebar shows "Flat files · swap to go live."

## Swap in real data (the "living app" path)
The two files under `data/` are the entire data contract — **edit them, not the code**:
- `data/accounts.csv` — one row per account (CRM "CS Customer Report" shape).
- `data/monthly_metrics.csv` — one row per account per month (Analytics time-series shape: logins, logins, open_tickets).

Full column schemas + the status-derivation rules are in **`data/README.md`**. Replace those CSVs with real exports (or repoint `loadFromFiles()` in `lib/data.js` at an API that returns the same shape) and the dashboard is live — every status, delta, trend, DEAR score, and headline is **derived** from those two files at runtime.

## About the Design Files
The files in this bundle are **design references created in HTML/React-via-Babel** — a working prototype that demonstrates the intended look, layout, data model, and behavior. It now reads its data from **swappable CSV flat files** (see *Run it locally* / *Swap in real data* above), but it still uses CDN React + an in-page Babel transform (fine for a prototype, not for production) and persists a few things to `localStorage`. **It is not production code to ship directly.**

The task for Claude Code is to **recreate these designs inside our real codebase**, using its established framework, component library, data layer, and auth — OR, if building standalone, to pick an appropriate stack (the prototype is plain React, so a Vite + React + TypeScript app maps over almost 1:1). Swap the sample data for the real pipeline (see *Data Sources*), and replace the Feather-substitute icons with our real icon set.

## Fidelity
**High-fidelity (hifi).** Final colors, typography, spacing, component styling, and interactions are all intentional and follow the Vela Design System. Recreate the UI faithfully using the codebase's existing component library where equivalents exist (buttons, pills, tables, modals, toggles), matching the tokens in `lib/ds.css`. Where the codebase already has a primitive (e.g. a Button or Badge), prefer it over re-implementing the prototype's version.

---

## Tech in the prototype (and what to replace)
| Prototype uses | Replace with in production |
|---|---|
| React 18 via CDN + in-browser Babel (`type="text/babel"`) | Real build step (Vite/Next) + TS; components compiled ahead of time |
| Global `window.*` exports to share components across `<script>` files | Normal ES module imports |
| `window.HEALTH` object built from CSV flat files in `lib/data.js` | API calls to the `health_metrics` data source (see Build Plan) — repoint `loadFromFiles()` |
| Inline `style={{}}` objects | The codebase's styling solution (CSS modules / styled / Tailwind), driven by the `--*` tokens in `ds.css` |
| Feather-derived inline SVG icons (`Icon` in `components.jsx`) | our real icon components |
| `localStorage` for CSM overrides, alert settings, tweak state | Real persistence (CRM field / service / user prefs) |
| SF Pro Display via system-font fallback | Same — SF Pro Display is the brand font |

---

## Screens / Views
The app is a left-nav shell (`lib/app.jsx`) with five primary views plus a right-hand slide-over detail and two modals.

### 1. Customer Health (default) — `lib/dashboard.jsx`
- **Purpose:** the CSM's daily worklist. See the whole segment, see who needs attention, drill in.
- **Layout:** left sidebar nav (248px) + main content. Main = sticky header (breadcrumb, title, filter row, action buttons) over a scrolling body.
- **Header filter row:** segment pill, **date-range** dropdown (bounded to the available data window), **CSM** filter dropdown, **Renews** (by quarter) filter dropdown, "last synced" text. Action buttons: **Configure Alerts** (opens alert modal), **Export**.
- **KPI strip:** 5 tiles — *In view* (count), *Stalled*, *At Risk*, *Watch*, *Upsell*. The four status tiles are **clickable** to filter the table (toggle on/off; active tile gets a colored outline). Each shows count + ARR exposure.
- **"Needs attention" worklist:** ranked cards for every flagged, non-overridden account. Each card: a 4px status spine, status pill, account name + segment + CSM tag, two sparkline blocks side-by-side (**Logins · MoM** and **Active users · MoM**, each with a colored delta), ARR + renewal, a Review button, and a one-line plain-language headline describing which signal(s) fired. Shows a note when accounts are hidden by a CSM override.
- **All accounts table:** sortable columns — Account, CSM, Status, ARR, Logins (sparkline+Δ), Active users (sparkline+Δ), Since {firstMonth} (cumulative Δ), Outreach status, Renewal, chevron. Search box + status filter segmented control above it. Rows hover-highlight and open the detail slide-over on click. Overridden rows show an "Override" chip instead of the status pill.

### 2. Customer detail slide-over — `lib/detail.jsx`
Opens from any row/card. 620px right-hand panel over a scrim; Esc or scrim closes it.
- **Header:** status pill + DEAR score chip + segment, account name, **CSM tag + CRM deep-link**, then a stat row (ARR, Renewal, CRM Health, Open tickets, Platform).
- **Tabs:** *Health signals* and *Contract*.
- **Health signals tab:**
  - **DEAR health scorecard** — overall 0–100 gauge + band (Strong/Stable/At risk/Critical), then four weighted category blocks (**D**eployment, **E**ngagement, **A**doption, **R**OI), each with metric rows scored green/yellow/red. Onboarding and no-data accounts show a special state instead of a score. Sample-sourced metrics get a `*`.
  - **Outreach** block — current outreach status, last-touch record, "logged in CRM."
  - **Why this is flagged** — bullet reasons with the actual numbers.
  - **Logins** chart (with baseline marker) + **Active users** chart.
  - **Contract utilization** — per-line bars (provider intake, logins, Managed Services, monitoring): used vs entitled %.
  - **Open support tickets** (Help desk) count + trend.
  - **Recommended playbook** card — code, name, SLA, philosophy, the suggested outreach email (expandable), call-guidance / escalation notes.
- **Contract tab:** order-form breakdown — one-time fees; Application (Managed Services) with every **SKU** and **data source** itemized as its own chip; Services (Managed Services); Annual Commitment reconciling to ARR.
- **Footer:** **CSM override** toggle ("Mark OK / No action needed" — persisted, removes account from worklist + counts) and **Create CSM task in CRM** primary action + Snooze.

### 3. Playbooks — `lib/playbooks.jsx` (data in `lib/playbooks.js`)
Trigger & response library. Left rail lists all 8 triggers (tagged Confirmed / Proposed / Back-pocket) with their playbooks; detail pane shows what-it-is, when-to-use, philosophy, response cadence/SLA, verbatim outreach email templates (warm / direct / first-touch), call guidance, escalation.

### 4. Accounts — `lib/accounts.jsx`
System-of-record roster of all 28 accounts: summary KPIs (total ARR, launched vs implementing, SF-health split, CSM coverage), then a sortable table with Platform, Account Status (Launched/Implementing), **CRM Health** (CRM's own rating) shown next to **Signal** (what our triggers compute) — the divergence between the two is the whole point — ARR with a composition bar, and renewal. Rows open the same detail slide-over.

### 5. Build Plan — `lib/buildplan.jsx`
The "how we'd build this" feasibility view for the data/eng review: data-needed table (signal → source → system → readiness), the recommended architecture diagram (the product DB + CRM → a nightly rollup → `health_metrics` → threshold Lambda → SQS fan-out → CRM task / Slack+Email / dashboard), three build options (Claude intelligence layer / Lambda+SQS+CRM / CRM-native), compliance guardrails, open questions, and a timeline.

### 6. Triggers & Thresholds — `lib/triggers.jsx`
Documents the two core triggers (Login Activity, Login Activity) with the 30% MoM rules, the cumulative-decline addendum, the onboarding/maturity exclusion, data sources, and the threshold-validation findings.

### Modals
- **Alert settings** — `lib/alerts.jsx`. Opened by "Configure Alerts." Channel toggles (Slack / Email / CRM task), which statuses notify, cadence (Smart / Instant / Daily digest), routing (assigned CSM / shared channel), a live Slack-message preview, and a compliance note. Persisted to `localStorage`.
- **Tweaks panel** — `lib/tweaks-panel.jsx`. A prototype-only control panel (live decline/growth threshold, cumulative-slide threshold, table density, hide-sample-badges). **This is a prototyping affordance, not a product feature** — you can drop it from the production build, though the *threshold* controls are a good hint at what should become real admin settings.

---

## Interactions & Behavior
- **Row/card click** → opens detail slide-over. **Esc / scrim** closes.
- **KPI tiles** → toggle a status filter on the table.
- **Filters** (CSM, renewal-quarter, date-range, status segmented control, search) all narrow the scoped set; KPI counts + worklist + table all respect the active scope.
- **Sortable table headers** → click to sort, click again to flip direction.
- **CSM override toggle** → marks an account "no action needed"; it drops out of the worklist and the alert counts and shows an "Override" chip; persisted.
- **Create CSM task** → optimistic success state ("Task created in CRM"); in production this writes a task to CRM.
- **Alert settings save** → persists, shows "Saved", closes.
- **Transitions:** slide-over uses a ~180ms ease-out slide-in; keep motion minimal (120–180ms), no bounces, per the design system.

## State Management
Prototype keeps this in React state + `localStorage`. In production, map to:
- **Scope/filter state** (date range, CSM, renewal quarter, status filter, search) — local UI state / URL params.
- **Selected account** — route param ideally (`/health/:accountId`) so detail is linkable.
- **CSM overrides** (`cc_overrides`) — needs a real backing store (CRM field or a service), because it affects what the whole team sees.
- **Alert settings** (`cc_alert_settings`) — user/team preference store.
- **Tweak/threshold values** (`om_tweaks_*`) — prototype-only; the threshold values should become real configurable settings owned by CS ops.
- **Account data** — fetched from the `health_metrics` source; everything else (status, deltas, DEAR score, headline) is **derived** from it. See `lib/data.js` for the exact derivation logic (`deriveStatus`, `computeHeadline`, `buildHealth` for DEAR, `buildUtil`, `buildContract`).

## Data Sources (the flat-file contract)
`data/accounts.csv` + `data/monthly_metrics.csv` are the data contract — see **`data/README.md`** for full column schemas and the status-derivation rules. `lib/data.js` fetches + parses them at runtime (`loadFromFiles()`), then derives everything else. To go live, replace the CSVs with real exports or repoint `loadFromFiles()` at an API returning the same shape.
- **Real in prototype** (transcribed from exports, *not* live): the 28-account roster, ARR + ARR breakdown (software/monitoring/Managed Services/licensing), contract dates, renewal, platform, segment, account status, and CRM's Green/Yellow/Red health — all from the CRM **"CS Customer Report (AAD)"**. Monthly login volumes from a Analytics pull.
- **Sample / generated** (clearly badged in the UI with an orange "Sample data" badge — see `SampleBadge`): login series, support-ticket counts (→ **Help desk**), contract entitlements, executive sponsors, last-touch/outreach records, CSM assignments, and the DEAR scoring weights. These become real once the pipeline + Help desk + CRM ownership are wired.
- The **DEAR scorecard model** (categories, metrics, weights, green/yellow/red thresholds) is a **strawman** — confirm the weights with CS leadership before treating as canonical.

## Design Tokens
All tokens are defined in **`lib/ds.css`** (the Vela Design System stylesheet) as CSS custom properties — use these, don't hardcode. Key values (also mirrored in the `V` object in `lib/components.jsx`):

**Colors**
- Neutrals: black `#1D1D21`, grey-dark `#585C64` (primary body text), grey-med `#A4A8AF`, grey-light `#C6C9CE`, grey-xlight `#E8EAEF`, page canvas `#F6F7FA`, raised `#FFFFFF`, hover `#FAFBFD`.
- Brand: green `#35BC98` (primary CTA / logo), green hover `#2EB18E`, green deep `#00827B`, green light `#D9F4ED`.
- Accents: purple `#503BD4` / light `#D8D1FF` / dark `#3A2B98`; blue (links) `#0D54F5` / bg `#E7EFFC` / dark `#0A42C4`; teal deep `#04303E` (logo wordmark).
- Status: red `#EB5757` / light `#FBD7D7`; orange `#FF9A3C` / dark `#D97A22` / light `#FFE8D3`; yellow `#F6EA2F`.
- Status semantics used: Stalled & At Risk = red, Watch = orange, Upsell = purple, Healthy = green, Onboarding = blue, No-data = grey.

**Typography:** SF Pro Display (fallback `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, …`). Body 14px, labels 12px, captions 10–11px, headings 17/22/26px. Terse line-heights (paragraph 20px; headings ~1). Title Case for UI labels/buttons; sentence case for descriptions; ALL CAPS only for tiny table/section headers.

**Spacing:** 4-point grid — 4, 8, 12, 16, 20, 24, 32, 40, 48, 64.

**Radii:** 4px default (buttons, inputs, cards, citations), 8px (cards/agent bubbles/toasts/modals), 64px (pills/badges). Sharp, not soft.

**Shadows:** `--shadow-1` = `1px 2px 3px 0 #E9E9E9` (tight offset on primary buttons/cards); `--shadow-2`/`--shadow-3` for raised cards / modals. No blur, glass, or neumorphism.

**Borders:** 1px solid `#C6C9CE` (default) or `#E8EAEF` (subtle dividers).

**Animation:** 120–180ms ease-out fades, no bounce. **No gradients, no emoji** (use the icon set).

## Assets
- **Icons:** the prototype uses Feather-derived inline SVGs (the `Icon` component + `iconPaths` map in `lib/components.jsx`) as a **substitute** for our real icon set — swap in the real icons in production.
- **Logo:** the Vela mark is hand-drawn inline SVG in `VelaMark` (`components.jsx`); use the real brand asset.
- **No photography** — the UI is data/typography only.
- **Fonts:** SF Pro Display (Apple-licensed; system-font fallback in the prototype).

## Files
Serve the repo over HTTP and open `index.html` (or `Customer Health Dashboard.html` — identical). It wires the scripts in dependency order and loads the CSVs.
- `data/accounts.csv`, `data/monthly_metrics.csv` — **the swappable data** (schema in `data/README.md`).
- `lib/data.js` — **CSV loader + data model + all derivations** (start here; embedded fallback snapshot lives at the bottom).
- `playbooks.js` — playbook/trigger library content.
- `components.jsx` — shared primitives: `V` (token object), `Icon`, `VelaMark`, `Button`, `StatusPill`, `Chip`, `Delta`, `LastTouch`, `OutreachStatus`, `SampleBadge`, `FilterMenu`, `SfdcLink`, override context, density helper.
- `charts.jsx` — `Sparkline`, `TrendChart`, `UtilBar` (dependency-free SVG).
- `dashboard.jsx` — Customer Health view, worklist, table, KPI tiles, filters.
- `detail.jsx` — customer detail slide-over, DEAR scorecard, contract tab.
- `accounts.jsx` — Accounts roster view.
- `playbooks.jsx` — Playbooks view.
- `triggers.jsx` — Triggers & Thresholds view.
- `buildplan.jsx` — Build Plan / architecture view.
- `alerts.jsx` — Alert settings modal.
- `tweaks-panel.jsx` — prototype-only tweak panel (can be dropped in production).
- `app.jsx` — nav shell + top-level state (loaded last).
- `ds.css` — **Vela Design System tokens** (colors, type, spacing, radii, shadows).

## Notes for the implementer
- Match the Vela Design System exactly; prefer the codebase's existing components over the prototype's hand-rolled ones.
- Treat `lib/data.js` as the contract: build the API/`health_metrics` source to supply the **real** fields, compute the **derived** fields server- or client-side as shown, and remove the `SampleBadge` markers as each sample field becomes real.
- Honor the compliance posture shown in Build Plan / Alert settings: **alerts and dashboard summaries carry commercial account data only — no sensitive customer data**; record-level detail stays behind CRM/app auth.
