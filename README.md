# Inkling — Customer Health

**A concept Customer Success tool.** Inkling watches a whole book of accounts, ranks the ones that need attention, and explains *why* in plain language, so a CSM can act on a quiet account before it becomes a lost renewal.

> Concept project. All company names and data in this repo are illustrative sample data, not real customers. In production the same views would connect to a CRM plus a product-analytics pipeline.

---

## What it does
The core idea: an account's real health is what its usage is *doing*, not the stage it sits in on a CRM. Inkling reads a monthly usage time-series per account and derives a status:

- **At risk** — usage or active users down sharply month-over-month (or off a recent high).
- **Watch** — a softer, sustained cumulative slide.
- **Healthy** — on track.
- **Upsell** — usage climbing fast enough to warrant an expansion conversation.
- **Onboarding** — newly launched, not yet judged on usage.

Every flagged account gets a one-line, plain-English headline describing which signal fired, so the list reads like a colleague's briefing rather than a spreadsheet.

## Run it locally
The app reads its data from two CSV files, so it needs to be served over HTTP (a `fetch()` of a local file fails under `file://`). Any static server works:

```bash
# from the repo root
python3 -m http.server 8000
# then open http://localhost:8000/  (or http://localhost:8000/index.html)
```

(or `npx serve`, or VS Code Live Server, or GitHub Pages). If opened with no server it still runs, falling back to an embedded snapshot baked into `lib/data.js`.

## The data (swap it and it's live)
The two files under `data/` are the entire data contract, edit them, not the code:
- `data/accounts.csv` — one row per account.
- `data/monthly_metrics.csv` — one row per account per month.

Full column schemas and the status-derivation rules are in **`data/README.md`**. Everything on screen (status, month-over-month deltas, cumulative trend, health scorecard, headlines, utilization) is **derived** from those two files at runtime by `lib/data.js`. Replace the CSVs with real exports, or repoint `loadFromFiles()` at an API returning the same shape, and the dashboard is live.

## Views
- **Customer Health** (`lib/dashboard.jsx`) — the daily worklist: KPI strip, a ranked "needs attention" list with sparklines and headlines, and a sortable all-accounts table.
- **Account detail** (`lib/detail.jsx`) — a slide-over with a health scorecard, the reasons an account is flagged, usage charts, contract utilization, and a recommended outreach playbook.
- **Accounts** (`lib/accounts.jsx`) — the full roster, showing the CRM's own health rating next to Inkling's computed signal (the divergence is the point).
- **Playbooks** (`lib/playbooks.jsx`) — a trigger-and-response library with outreach templates.
- **Triggers & Thresholds** (`lib/triggers.jsx`) — the rules behind the statuses.
- **Build Plan** (`lib/buildplan.jsx`) — a feasibility sketch of how the signals would be sourced and wired in production.

## Tech
A working prototype, not production code: React 18 via CDN with an in-browser Babel transform, components shared through `window.*` globals, inline styles, and `localStorage` for state. It reads swappable CSV flat files at runtime. To productionize you would add a real build step, move to module imports, and swap the sample data for a live pipeline.

## Design
- **Palette:** greige "ink on paper", canvas `#F0EFEC`, surfaces `#FFFFFF`, ink `#141414`, a single coral accent `#C75A2E`. Status colors are muted earth tones (at risk `#A9493F`, watch `#96762F`, healthy `#5F7D5A`, upsell `#7D5878`, onboarding `#85816F`).
- **Type:** Hanken Grotesk.
- Tokens live in `lib/ds.css` (CSS custom properties) and are mirrored in the `V` object in `lib/components.jsx`.

---

*Concept, design and solution architecture by Brandy Mangum. Built with the help of AI tooling.*
