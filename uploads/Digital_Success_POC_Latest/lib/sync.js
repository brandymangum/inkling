// Customer Health — shared sync layer
// =====================================================================
// Mirrors a defined set of localStorage keys to a small Google Apps
// Script backend (see apps-script/Code.gs) so state shared across the
// team — outreach logs, ping history, watch overrides, snoozes,
// Customer Log entries, the activity feed — isn't siloed per-browser.
//
// Design: localStorage is the cache (instant reads, works offline).
// On load, Sync.init() pulls everything from the backend and merges it
// into localStorage (remote wins on conflict — last writer wins overall,
// no merge logic, fine for this team's scale). Every write goes through
// Sync.set(), which updates localStorage immediately AND posts to the
// backend in the background. If the backend is unreachable, the app
// keeps working entirely on localStorage — sync is additive, not a
// hard dependency.
//
// SYNC_BASE_URL is the shared backend web app /exec URL (see apps-script/Code.gs
// SETUP). Leave blank to run on localStorage only (no sync) — useful for
// local testing before the shared backend is deployed.

const SYNC_BASE_URL = ''; // e.g. 'https://script.google.com/macros/s/AKfycb.../exec'

// Keys that sync across devices/browsers. Each maps a "short" sync key
// (sent to the backend) to the existing localStorage key (unchanged, so
// no other file needs to know sync exists).
const SYNC_KEYS = {
  outreach_log: 'cc_outreach_log',
  overrides: 'cc_overrides',
  thresholds: 'cc_thresholds',
  snooze: 'cc_snooze',
  status_snapshot: 'cc_status_snapshot',
  watch_overrides: 'cc_watch_overrides',
  account_pinged: 'cc_account_pinged',
  csm_pinged: 'cc_csm_pinged',
  acct_notes: 'cc_acct_notes',
  team_notes: 'cc_team_notes',
  activity_log: 'cc_activity_log',
  buildplan_milestones: 'cc_buildplan_milestones',
  csm_checkins: 'cc_csm_checkins',
  wins: 'cc_wins',
  dismissed_calls: 'cc_dismissed_calls',
};
// Explicitly NOT synced — personal device preferences:
//   cc_role, cc_theme, cc_alert_settings, cc_puzzle, cc_auto_done, cc_tasks_v2

function syncLGet(k, d) { try { var v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; } catch (e) { return d; } }
function syncLSet(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }

let _syncEnabled = !!SYNC_BASE_URL;
let _lastSyncAt = null;
let _lastSyncError = null;

// Pull everything from the backend on load and merge into localStorage.
// Remote data wins (last writer overall, across all devices). Called once
// from app.jsx on mount.
async function syncInit() {
  if (!_syncEnabled) return { ok: false, reason: 'not configured' };
  try {
    const resp = await fetch(SYNC_BASE_URL);
    const json = await resp.json();
    if (!json.ok) throw new Error(json.error || 'sync init failed');
    Object.entries(SYNC_KEYS).forEach(([shortKey, lsKey]) => {
      const remote = json.data[shortKey];
      if (remote && remote.value != null) {
        syncLSet(lsKey, remote.value);
      }
    });
    _lastSyncAt = Date.now();
    _lastSyncError = null;
    return { ok: true };
  } catch (e) {
    _lastSyncError = e.message || String(e);
    return { ok: false, error: _lastSyncError };
  }
}

// Write a value to localStorage immediately, then push to the backend in
// the background (fire-and-forget — failures don't block the UI, but are
// tracked via syncStatus() so a small indicator can show "sync issue").
function syncSet(lsKey, value) {
  syncLSet(lsKey, value);
  if (!_syncEnabled) return;
  const shortKey = Object.keys(SYNC_KEYS).find((k) => SYNC_KEYS[k] === lsKey);
  if (!shortKey) return; // not a synced key
  fetch(SYNC_BASE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' }, // avoids CORS preflight on shared backend
    body: JSON.stringify({ key: shortKey, value }),
  }).then((resp) => resp.json()).then((json) => {
    if (json.ok) { _lastSyncAt = Date.now(); _lastSyncError = null; }
    else { _lastSyncError = json.error || 'sync write failed'; }
  }).catch((e) => { _lastSyncError = e.message || String(e); });
}

function syncStatus() {
  return { enabled: _syncEnabled, lastSyncAt: _lastSyncAt, lastError: _lastSyncError };
}

// Append an entry to the shared activity log (capped to the most recent
// 200 entries so the payload stays small). Entry shape:
//   { ts, who, action, account, detail }
function logActivity(entry) {
  const log = syncLGet('cc_activity_log', []);
  log.unshift({ ts: Date.now(), ...entry });
  const trimmed = log.slice(0, 200);
  syncSet('cc_activity_log', trimmed);
}

window.Sync = { init: syncInit, get: syncLGet, set: syncSet, status: syncStatus, logActivity, KEYS: SYNC_KEYS };
