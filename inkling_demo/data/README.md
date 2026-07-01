# Data files — schema & how to make this live

The dashboard reads these two CSVs **at runtime** (`lib/data.js` → `loadFromFiles()`).
Replace them with exports from your real systems — or repoint `loadFromFiles()` at an
API that returns the same shape — and the app is live. Everything on screen
(status, MoM deltas, cumulative trend, DEAR score, headlines, utilization) is
**derived** from these two files; you don't edit code to change the data.

> If the files can't be fetched (e.g. opening `index.html` straight from disk with
> no server), the app falls back to an embedded snapshot baked into `lib/data.js`.
> Serve over HTTP (see the repo README) to load the CSVs.

---

## `accounts.csv` — one row per account
Mirrors the Salesforce **"CS Customer Report"** export.

| column | required | example | notes |
|---|---|---|---|
| `id` | yes | `riverstonedigital` | stable unique key; joins to `monthly_metrics.account_id` |
| `name` | yes | `Riverstone Digital` | display name |
| `platform` | yes | `OEM` | OEM / API / Web App / ISV |
| `account_status` | yes | `Launched` | `Launched` or `Implementing`. **Implementing → shown as Onboarding (auto-green)** and excluded from decline alerts |
| `sf_health` | no | `Yellow` | Salesforce's own rating: `Green` / `Yellow` / `Red` / `—`. Shown next to our computed Signal |
| `arr` | yes | `39304` | annual recurring revenue, USD |
| `software` | no | `20359` | ARR component — software/active_users |
| `monitoring` | no | `18945` | ARR component — monitoring |
| `cvo` | no | `0` | ARR component — premium services |
| `licensing` | no | `0` | ARR component — licensing |
| `won_date` | no | `2025-02-20` | ISO date |
| `contract_start` | no | `2025-02-20` | ISO date |
| `contract_end` | no | `2027-02-19` | ISO date |
| `renewal_date` | yes | `2027-02-19` | ISO date; drives renewal runway + quarter filter |
| `segment` | no | `Productivity SaaS` | vertical |
| `csm` | no | `Alex` | assigned CSM; blank → "Unassigned" |
| `exec_sponsor_name` | no | `Dana Whitfield` | blank → no sponsor (costs DEAR points) |
| `exec_sponsor_title` | no | `VP, Operations` | |
| `last_touch_by` | no | `Alex` | most recent logged outreach — who |
| `last_touch_channel` | no | `email` | `email` / `call` / `task` |
| `last_touch_date` | no | `2026-06-06` | ISO date |
| `last_touch_summary` | no | `Renewal check-in` | short note |
| `pending_task_owner` | no | `Alex` | if set, account shows "Outreach pending · {owner}" |
| `note` | no | `No data in the analytics warehouse yet` | optional override headline for Onboarding/No-data accounts |

## `monthly_metrics.csv` — one row per account per month
Mirrors the the analytics warehouse time-series export. Add more months and the charts extend automatically.

| column | required | example | notes |
|---|---|---|---|
| `account_id` | yes | `riverstonedigital` | joins to `accounts.id` |
| `month` | yes | `2026-03` | `YYYY-MM`; rows are sorted by this to form the trend |
| `active_users` | yes | `1730` | completed active users that month (primary signal) |
| `logins` | yes | `88` | unique users who logged in that month (secondary signal) |
| `open_tickets` | no | `7` | open the support desk tickets that month; last month = current, prior = "vs last month" |

**Status rules derived from this data** (thresholds configurable in the Tweaks panel / `TWEAK_DEFAULTS`):
- A launched account with **no metric rows** → **No data** (flagged for the data team).
- Active Users stalled at zero → **Stalled**.
- Active Users or logins down ≥30% MoM (or vs the 3-month high) → **At Risk**.
- A softer cumulative slide (≥25%) → **Watch**.
- Active Users up ≥30% MoM → **Upsell**.

---

## What's still sample (flag for the team)
The prototype currently fills these from sample values; wire them to real sources and they become live:
- **`logins`** — needs the login/auth event source (RDS or analytics store — open question for eng).
- **`open_tickets`** — needs the support desk.
- **Contract entitlements** (seat/usage/premium/monitoring allotments) used by the utilization bars — currently estimated from ARR; replace with real order-form entitlements.
- **`exec_sponsor_*`, `last_touch_*`, `pending_task_owner`, `csm`** — come from Salesforce once ownership/activity sync is wired.

The DEAR scorecard **weights** (in `lib/data.js` → `buildHealth`) are a strawman — confirm with CS leadership.
