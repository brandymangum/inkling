# Inkling — customer health dashboard (demo build)

A single-page customer-health dashboard for a scaled CS motion: it surfaces
account-health signals in one view, ranks accounts that need attention, and
lets a CSM drill into any account for trend detail, a weighted health
scorecard, contract utilization, and a recommended playbook.

Concept, design & solution architecture by **Brandy Mangum**; built with the help of AI tooling.

**All data in this build is fictional.** Company names, people, ARR, contracts,
and usage figures are generated for demo purposes.

## Run it locally
The app reads its data from two CSV flat files, so it needs to be served over
HTTP (any static server works):

```bash
python3 -m http.server 8000
# then open http://localhost:8000/
```

(or `npx serve`, or VS Code Live Server.) Opened with no server it still runs —
it falls back to an embedded snapshot baked into `lib/data.js`.

## What's inside
- **Customer Health** — KPI tiles, a ranked "needs attention" worklist, and a
  sortable all-accounts table. Status is derived from MAU/login trends
  (30% MoM decline = At Risk, stall detection, cumulative-slide catch,
  +30% = Upsell signal).
- **Account detail** — slide-over with a weighted DEAR health scorecard,
  trend charts, contract utilization, and the recommended playbook.
- **Accounts** — system-of-record roster view.
- **Playbooks** — the trigger & response library with outreach templates.
- **Build Plan / Triggers & Thresholds** — the POC-planning views used to
  align data/eng teams on how to productionize.
- **Alert settings** — Slack/email/CRM-task fan-out config with live preview.

## Data contract
`data/accounts.csv` + `data/monthly_metrics.csv` are the entire data contract —
swap them (or point `loadFromFiles()` in `lib/data.js` at an API with the same
shape) and the dashboard is live. Schemas are in `data/README.md`.
