# Data files — schema & how to make this live

The dashboard reads these two CSVs **at runtime** (`lib/data.js` → `loadFromFiles()`).
Replace them with exports from your real systems — or repoint `loadFromFiles()` at an
API that returns the same shape — and the app is live. Everything on screen
(status, MoM deltas, cumulative trend, health score, headlines, utilization) is
**derived** from these two files; you don't edit code to change the data.

> If the files can't be fetched (e.g. opening `index.html` straight from disk with
> no server), the app falls back to an embedded snapshot baked into `lib/data.js`.
> Serve over HTTP (see the repo README) to load the CSVs.

---

## `accounts.csv` — one row per account
Mirrors a CRM account export.

| column | required | example | notes |
|---|---|---|---|
| `id` | yes | `cust01` | stable unique key; joins to `monthly_metrics.account_id` |
| `name` | yes | `Lorem Ipsum` | display name |
| `platform` | yes | `Growth` | plan tier — Growth / Enterprise / Starter / Scale |
| `account_status` | yes | `Launched` | `Launched` or `Implementing`. **Implementing → shown as Onboarding (auto-green)** and excluded from decline alerts |
| `sf_health` | no | `Yellow` | the CRM's own health rating: `Green` / `Yellow` / `Red` / `—`. Shown next to our computed Signal |
| `arr` | yes | `39304` | annual recurring revenue, USD |
| `software` | no | `20359` | ARR component — core platform |
| `monitoring` | no | `18945` | ARR component — analytics |
| `cvo` | no | `0` | ARR component — managed services |
| `licensing` | no | `0` | ARR component — add-ons |
| `won_date` | no | `2025-02-20` | ISO date |
| `contract_start` | no | `2025-02-20` | ISO date |
| `contract_end` | no | `2027-02-19` | ISO date |
| `renewal_date` | yes | `2027-02-19` | ISO date; drives renewal runway + quarter filter |
| `segment` | no | `SaaS / Software` | vertical |
| `csm` | no | `Riley` | assigned CSM; blank → "Unassigned" |
| `exec_sponsor_name` | no | `Dana Whitfield` | blank → no sponsor (counts toward the health score) |
| `exec_sponsor_title` | no | `VP, Operations` | |
| `last_touch_by` | no | `Riley` | most recent logged outreach — who |
| `last_touch_channel` | no | `email` | `email` / `call` / `task` |
| `last_touch_date` | no | `2026-06-06` | ISO date |
| `last_touch_summary` | no | `Renewal check-in` | short note |
| `pending_task_owner` | no | `Riley` | if set, account shows "Outreach pending · {owner}" |
| `note` | no | `No usage data yet` | optional override headline for Onboarding/No-data accounts |

> The `software` / `monitoring` / `cvo` / `licensing` columns are just generic ARR
> line-items — rename them freely; the UI labels them Core Platform / Analytics /
> Managed Services / Add-ons.

## `monthly_metrics.csv` — one row per account per month
Mirrors a product-analytics time-series export. Add more months and the charts extend automatically.

| column | required | example | notes |
|---|---|---|---|
| `account_id` | yes | `cust01` | joins to `accounts.id` |
| `month` | yes | `2026-03` | `YYYY-MM`; rows are sorted by this to form the trend |
| `verifications` | yes | `1730` | primary usage signal — **shown as "Logins" in the UI** |
| `logins` | yes | `88` | secondary signal — **shown as "Active users (MAU)" in the UI** |
| `open_tickets` | no | `7` | open help-desk tickets that month; last month = current, prior = "vs last month" |

> The metric column names are legacy internal names; the dashboard displays them
> as **Logins** (primary) and **Active users / MAU** (secondary). Rename the
> columns if you also update the readers in `lib/data.js`.

**Status rules derived from this data** (thresholds configurable in the Tweaks panel / `TWEAK_DEFAULTS`):
- A launched account with **no metric rows** → **No data** (flagged for the data team).
- Primary usage stalled at zero → **Stalled**.
- Usage or active users down ≥20% MoM (or vs the 3-month high) → **At Risk**.
- A softer cumulative slide (≥25%) → **Watch**.
- Usage up ≥20% MoM → **Upsell**.

---

## What's still sample (flag for the team)
The prototype currently fills these from sample values; wire them to real sources and they become live:
- **`logins` / active users** — needs the login/auth event source (the product DB or an analytics store — open question for eng).
- **`open_tickets`** — needs the help desk.
- **Contract entitlements** (seat / usage / services / analytics allotments) used by the utilization bars — currently estimated from ARR; replace with real order-form entitlements.
- **`exec_sponsor_*`, `last_touch_*`, `pending_task_owner`, `csm`** — come from the CRM once ownership/activity sync is wired.

The health-score **weights** (in `lib/data.js` → `buildHealth`) are illustrative.
