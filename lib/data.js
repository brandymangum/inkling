/* Customer Health — data layer (flat-file driven)
   =====================================================================
   The app reads two CSV flat files at runtime so the data is swappable
   WITHOUT touching code:
     data/accounts.csv          one row per account (the CRM "CS Customer Report" shape)
     data/monthly_metrics.csv   one row per account per month (the analytics tool time-series shape)

   ENGINEERING: replace those two CSVs with exports from the CRM + the
   metrics warehouse (or repoint `loadFromFiles()` at an API that returns the
   same shape) and the dashboard becomes live. Column schemas are in
   data/README.md. Everything else on screen is DERIVED from these two files
   (status, deltas, DEAR score, headline) — see deriveAll() below.

   If the CSVs can't be fetched (e.g. opened from file:// with no server),
   the app falls back to the EMBEDDED_ACCOUNTS snapshot so it still runs.
   Loaded as a plain <script> — attaches HEALTH to window, then async-loads files. */
(function () {
  // ---- helpers ----
  const sum = (a) => a.reduce((x, y) => x + y, 0);
  const avg = (a) => a.length ? Math.round(sum(a) / a.length) : 0;
  const firstNonZero = (s) => { for (const v of s) if (v > 0) return v; return 0; };
  function momPct(s) { const p = s[s.length - 2], c = s[s.length - 1]; if (p === 0) return c > 0 ? null : 0; return ((c - p) / p) * 100; }
  function cumPct(s) { const b = firstNonZero(s), c = s[s.length - 1]; if (b === 0) return 0; return ((c - b) / b) * 100; }
  function cum3High(s) { const last3 = s.slice(-3); const hi = Math.max(...last3); return hi ? ((s[s.length - 1] - hi) / hi) * 100 : 0; }
  function fmtPct(p) { if (p === null) return 'New'; if (Math.round(p) === 0) return '0%'; const r = Math.round(p); return (r > 0 ? '+' : '') + r + '%'; }
  function fmtArr(n) { return '$' + (n / 1000).toFixed(0) + 'K'; }
  function fmtMoney(n) { if (n >= 1000000) return '$' + (n / 1000000).toFixed(2) + 'M'; return '$' + Math.round(n / 1000) + 'K'; }
  function fmtUSD0(n) { return '$' + Math.round(n).toLocaleString('en-US'); }
  function fmtUSDc(n) { return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
  function fmtAgo(d) { if (!d) return null; const t = new Date('2026-06-11'); const days = Math.round((t - new Date(d)) / 86400000); if (days <= 0) return 'today'; if (days === 1) return 'yesterday'; if (days < 14) return days + 'd ago'; if (days < 60) return Math.round(days / 7) + 'w ago'; return Math.round(days / 30) + 'mo ago'; }
  function daysUntil(d) { return Math.round((new Date(d) - new Date('2026-06-11')) / 86400000); }
  function fmtRenewal(d) { return new Date(d).toLocaleString('en-US', { month: 'short', year: 'numeric', timeZone: 'UTC' }); }
  function renewalQuarter(d) { const dt = new Date(d); return { key: dt.getUTCFullYear() + '-Q' + (Math.floor(dt.getUTCMonth() / 3) + 1), label: 'Q' + (Math.floor(dt.getUTCMonth() / 3) + 1) + ' ' + dt.getUTCFullYear() }; }
  function monthLabel(key) { const p = key.split('-'); return new Date(Date.UTC(+p[0], +p[1] - 1, 1)).toLocaleString('en-US', { month: 'short', timeZone: 'UTC' }); }

  const STATUS = {
    stall:      { label: 'Stalled',    color: '#A9493F', bg: '#F5E5E2', dot: '#A9493F', rank: 0 },
    risk:       { label: 'At Risk',    color: '#A9493F', bg: '#F5E5E2', dot: '#A9493F', rank: 1 },
    watch:      { label: 'Watch',      color: '#96762F', bg: '#F2EBD8', dot: '#B08A38', rank: 2 },
    upsell:     { label: 'Upsell',     color: '#7D5878', bg: '#EFE7EE', dot: '#7D5878', rank: 3 },
    healthy:    { label: 'Healthy',    color: '#5F7D5A', bg: '#E8EFE4', dot: '#5F7D5A', rank: 4 },
    onboarding: { label: 'Onboarding', color: '#85816F', bg: '#ECE9E1', dot: '#85816F', rank: 5 },
    nodata:     { label: 'No data',    color: '#85816F', bg: '#ECE9E1', dot: '#A09A8C', rank: 6 },
  };
  function trendColor(s) { return ({ stall: '#A9493F', risk: '#A9493F', watch: '#96762F', upsell: '#7D5878', healthy: '#A09A8C', onboarding: '#85816F', nodata: '#D8D3C7' })[s] || '#A09A8C'; }

  const HEADLINE = {
    stall: 'Zero logins across all five months — stall trigger.',
    risk: 'Login activity crossed the 30% decline trigger.',
    watch: 'Down 25%+ since January — approaching the decline threshold.',
    upsell: 'Login volume up 30%+ month over month — expansion signal.',
    onboarding: 'In deployment — auto-green until ~90 days post go-live.',
    nodata: 'No usage data reaching the warehouse yet — flagged for the data team.',
    healthy: '',
  };

  function deriveStatus(c, th) {
    const decline = (th && th.decline) || 30, watch = (th && th.watch) || 25;
    if (c.impl) return 'onboarding';
    if (c.nd) return 'nodata';
    const v = c.verif, l = c.logins || [];
    const vAll0 = v.every((x) => x === 0);
    const vm = momPct(v), cumJ = cumPct(v), c3 = cum3High(v);
    const lActive = l.some((x) => x > 0);
    const lm = lActive ? momPct(l) : null, l3 = lActive ? cum3High(l) : 0;
    if (vAll0) return 'stall';
    if ((vm !== null && vm <= -decline) || c3 <= -decline) return 'risk';
    if ((lm !== null && lm <= -decline) || l3 <= -decline) return 'risk';
    if (cumJ <= -watch || (lm !== null && lm <= -watch)) return 'watch';
    if (vm !== null && vm >= decline) return 'upsell';
    return 'healthy';
  }
  function computeHeadline(c, th) {
    const watch = (th && th.watch) || 25, decline = (th && th.decline) || 30;
    if (c.note && (c.impl || c.nd)) return c.note;
    if (c.impl) return HEADLINE.onboarding;
    if (c.nd) return HEADLINE.nodata;
    const vm = c.verifMom, lm = c.loginMom;
    const vDown = vm !== null && vm <= -watch, vUp = vm !== null && vm >= decline;
    const lDown = lm !== null && lm <= -watch, lUp = lm !== null && lm >= decline;
    const vAll0 = c.verif.every((x) => x === 0);
    if (vAll0 && lDown) return 'Logins stalled at zero and active users falling — the account has gone dark on both signals.';
    if (vAll0) return 'Zero logins across the window — stall trigger.';
    if (c.status === 'upsell') return `Login volume up ${decline}%+ month over month — expansion signal.`;
    if (vDown && lDown) return `Both signals down — logins ${fmtPct(vm)} and active users ${fmtPct(lm)} MoM. Disengaging across the board.`;
    if (vDown && !lDown) return `Logins down ${fmtPct(vm)} MoM while active users hold steady — the same people are logging in less often.`;
    if (lDown && !vDown) return `Active users down ${fmtPct(lm)} MoM while login volume holds — fewer people engaging; possible champion or seat drop-off.`;
    if (c.verifCum <= -watch) return `Down ${fmtPct(c.verifCum)} since the start of the window — a slow slide approaching the decline threshold.`;
    return HEADLINE[c.status] || '';
  }

  // ---- contract (order-form shape) ----
  const SKUS = ['Core Platform', 'User Management', 'Analytics', 'Automation', 'Integrations', 'Priority Support'];
  const DATA_SOURCES = ['SSO / SAML', 'SCIM directory', 'CRM sync', 'Data warehouse', 'Billing', 'Email / SMTP', 'Webhooks', 'REST API', 'Audit log'];
  function buildContract(c) {
    const provC = c.providers.contracted, appPerUnit = 200;
    const appAnnual = c.software || provC * appPerUnit;
    const skusFee = Math.round(appAnnual * 0.8094), dataFee = appAnnual - skusFee;
    const svcAnnual = (c.cvo || 0) + (c.monitoring || 0);
    const packets = Math.max(0, Math.round((c.cvo || 0) / 113));
    return {
      oneTime: [{ label: 'Implementation', amount: 7500 }], oneTimeTotal: 7500,
      application: { certification: 'Enterprise Plan', group: 'Tier 1', allotment: provC, allotmentUnit: 'Seat(s)', perUnit: appPerUnit, annual: appAnnual, skus: SKUS, skusFee, dataSources: DATA_SOURCES, dataFee },
      services: { name: 'Managed Services', allotment: packets, allotmentUnit: 'Project(s)', perUnit: 113, overages: 136, annual: svcAnnual, note: 'Includes all connectors needed for the integration.' },
      annualCommitment: c.arr,
    };
  }

  // ---- contract utilization (logins real; rest sample) ----
  function buildUtil(c) {
    const provC = c.providers.contracted, provA = c.providers.current;
    const lines = [];
    lines.push({ key: 'providers', label: 'Seats', used: provA, entitled: provC, unit: 'seats', sample: true });
    const verifLast = c.verif[c.verif.length - 1];
    const verifEnt = Math.max(20, Math.round(provC * 2 / 4));
    lines.push({ key: 'verif', label: 'Logins', used: verifLast, entitled: verifEnt, unit: '/mo', real: !c.nd && !c.impl });
    const cvoEnt = c.cvo ? Math.max(5, Math.round(c.cvo / 113)) : 0;
    if (cvoEnt > 0) lines.push({ key: 'cvo', label: 'Managed services', used: Math.round(cvoEnt * ({ Green: 0.6, Yellow: 0.35, Red: 0.15 }[c.sfHealth] || 0.35)), entitled: cvoEnt, unit: 'projects', sample: true });
    const monEnt = c.monitoring ? Math.max(10, Math.round(c.monitoring / 60)) : 0;
    if (monEnt > 0) lines.push({ key: 'mon', label: 'Analytics', used: Math.round(monEnt * ({ Green: 0.72, Yellow: 0.45, Red: 0.2 }[c.sfHealth] || 0.45)), entitled: monEnt, unit: 'reports', sample: true });
    lines.forEach((l) => { l.pct = l.entitled ? Math.round((l.used / l.entitled) * 100) : 0; });
    const capped = lines.map((l) => Math.min(100, l.pct));
    return { lines, overallPct: avg(capped), activeLines: lines.filter((l) => l.pct >= 40).length, totalLines: lines.length, verifPct: Math.min(140, lines.find((l) => l.key === 'verif').pct) };
  }

  // ---- DEAR health scorecard ----
  function mstat(e, m) { const r = m ? e / m : 0; return r >= 0.75 ? 'green' : r >= 0.4 ? 'yellow' : 'red'; }
  function healthBand(s) {
    if (s >= 80) return { label: 'Strong', color: '#5F7D5A', bg: '#E8EFE4', track: '#5F7D5A' };
    if (s >= 60) return { label: 'Stable', color: '#55534C', bg: '#ECE9E1', track: '#85816F' };
    if (s >= 40) return { label: 'At risk', color: '#96762F', bg: '#F2EBD8', track: '#96762F' };
    return { label: 'Critical', color: '#A9493F', bg: '#F5E5E2', track: '#A9493F' };
  }
  function buildHealth(c) {
    if (c.impl) return { onboarding: true, band: { label: 'Onboarding', color: '#85816F', bg: '#ECE9E1', track: '#85816F' }, note: 'In deployment — auto-green until ~90 days post go-live, per the program maturity rule.' };
    if (c.nd) return { nodata: true, band: { label: 'No usage data', color: '#85816F', bg: '#ECE9E1', track: '#A09A8C' }, note: 'No usage or active-user data is reaching the warehouse for this account yet — the Adoption and ROI portions of the score can’t be calculated until the data source is confirmed.' };

    const v = c.verif, lastL = c.logins[c.logins.length - 1], u = c.util;
    const M = (label, earned, max, note, sample) => ({ label, earned, max, note, sample, status: mstat(earned, max) });

    const live = c.verifTotal > 0;
    const D = [
      M('Onboarded & live', live ? 10 : 4, 10, live ? 'Producing usage in production' : 'Live but not yet producing activity'),
      M('Time to first value', live ? 5 : 0, 5, live ? 'Activated and in use' : 'No activity recorded yet'),
    ];
    let le = lastL === 0 ? 0 : c.loginMom === null ? 7 : c.loginMom >= 0 ? 10 : c.loginMom >= -15 ? 7 : c.loginMom >= -30 ? 4 : 2;
    const touch = c.outreach.state === 'completed' ? (c.touchDays <= 30 ? 8 : c.touchDays <= 60 ? 6 : 4) : c.outreach.state === 'pending' ? 5 : 2;
    const tk = c.tickets, tkScore = tk === 0 ? 2 : tk <= 6 ? 3 : tk <= 12 ? 2 : 1;
    const E = [
      M('Active users', le, 10, lastL === 0 ? 'No active users this month' : `${lastL} active users · ${fmtPct(c.loginMom)} MoM`, true),
      M('CS responsiveness', touch, 8, c.outreach.state === 'completed' ? `Last touch ${fmtAgo(c.outreach.date)}` : c.outreach.state === 'pending' ? `Outreach pending · ${c.outreach.owner}` : 'No outreach logged', true),
      M('Executive sponsor', c.execSponsor ? 4 : 0, 4, c.execSponsor ? `${c.execSponsor.name}` : 'No sponsor identified', true),
      M('Support tickets', tkScore, 3, `${tk} open in the help desk`, true),
    ];
    let ut = !live ? 0 : c.verifMom === null ? 10 : c.verifMom >= 30 ? 15 : c.verifMom >= 0 ? 12 : c.verifMom >= -15 ? 8 : c.verifMom >= -30 ? 4 : 1;
    const breadth = Math.round((u.activeLines / u.totalLines) * 12);
    let base = c.verifCum >= 0 ? 8 : c.verifCum >= -10 ? 6 : c.verifCum >= -25 ? 4 : c.verifCum >= -50 ? 2 : 0;
    const A = [
      M('Usage trend (logins)', ut, 15, `${fmtPct(c.verifMom)} MoM`),
      M('Contract-utilization breadth', breadth, 12, `${u.activeLines} of ${u.totalLines} contract areas in active use`, true),
      M('Trend vs baseline', base, 8, `${fmtPct(c.verifCum)} since January`),
    ];
    const vp = u.verifPct, value = vp >= 70 ? 10 : vp >= 40 ? 7 : vp >= 20 ? 4 : 2;
    const op = u.overallPct, spend = op >= 70 ? 8 : op >= 45 ? 6 : op >= 25 ? 4 : 2;
    const d = c.renewalDays, ren = d > 180 ? 7 : d >= 90 ? 6 : d >= 45 ? 4 : 2;
    const R = [
      M('Value realized (logins)', value, 10, `${vp}% of login allotment used`, true),
      M('Contract utilization vs spend', spend, 8, `${op}% of contract actively used`, true),
      M('Renewal runway', ren, 7, `${d} days to renewal`),
    ];
    const cat = (key, letter, name, desc, metrics) => { const earned = sum(metrics.map((m) => m.earned)), max = sum(metrics.map((m) => m.max)); return { key, letter, name, desc, metrics, earned, max, status: mstat(earned, max) }; };
    const categories = [
      cat('D', 'D', 'Deployment', 'Setup & integration during onboarding', D),
      cat('E', 'E', 'Engagement', 'Interactions with CS, support & sponsor', E),
      cat('A', 'A', 'Adoption', 'How much of the platform they actually use', A),
      cat('R', 'R', 'ROI', 'Business value realized vs what they pay for', R),
    ];
    const score = sum(categories.map((x) => x.earned));
    return { score, categories, band: healthBand(score), framework: 'DEAR' };
  }

  // ---- fallback relationship maps (used when a CSV column is blank) ----
  const SPONSORS = {
    silverlinemedia: { name: 'Maya Iyer', title: 'VP, Operations' }, harborviewgroup: { name: 'Lauren Diaz', title: 'Director of Operations' },
    foundryworks: { name: 'Sam Okafor', title: 'Head of Platform' }, granitepeakgroup: { name: 'Jordan Reyes', title: 'COO' },
    lakesidegroup: { name: 'Morgan Cho', title: 'VP, Product' }, parkwaysystems: { name: 'Marcus Webb', title: 'VP, Operations' },
    everlinesystems: { name: 'Dana Whitfield', title: 'VP, Operations' }, westbrookgroup: { name: 'Nicole Tran', title: 'Operations Manager' },
  };
  const LASTTOUCH = {
    everlinesystems: { by: 'Riley', channel: 'email', date: '2026-06-06', summary: 'Renewal check-in — awaiting reply' },
    granitepeakgroup: { by: 'Casey B.', channel: 'call', date: '2026-05-30', summary: 'Discussed slower Q2 workflow' },
    parkwaysystems: { by: 'Riley', channel: 'email', date: '2026-06-03', summary: 'Usage check-in' },
    foundryworks: { by: 'Casey B.', channel: 'email', date: '2026-04-30', summary: 'Quarterly recap' },
    silverlinemedia: { by: 'Riley', channel: 'call', date: '2026-05-22', summary: 'Volume surge follow-up' },
  };
  const PENDING_TASK = { keystoneretail: { owner: 'Riley' }, redwoodanalytics: { owner: 'Casey B.' } };
  const TICKETS = { everlinesystems: 7, keystoneretail: 11, redwoodanalytics: 9, halcyonlabs: 14, copperlineretail: 0, parkwaysystems: 5, granitepeakgroup: 4, silverlinemedia: 3, harborviewgroup: 2, foundryworks: 2, lakesidegroup: 3, novafieldsco: 2 };
  const CSM_BY_ID = {
    everlinesystems: 'Riley', parkwaysystems: 'Riley', silverlinemedia: 'Riley', keystoneretail: 'Riley', fairviewgroup: 'Riley', junctiondigital: 'Riley', monarchmedia: 'Riley',
    granitepeakgroup: 'Casey Brooks', foundryworks: 'Casey Brooks', redwoodanalytics: 'Casey Brooks', novafieldsco: 'Casey Brooks', westbrookgroup: 'Casey Brooks',
    harborviewgroup: 'Priya Shah', lakesidegroup: 'Priya Shah', halcyonlabs: 'Priya Shah', unionsquareco: 'Priya Shah',
  };

  // ---- EMBEDDED snapshot (offline fallback only; the CSVs are the real source) ----
  const EMBEDDED_ACCOUNTS = [
    { id: 'northgatesystems', name: 'Northgate Systems', platform: 'OEM', accountStatus: 'Implementing', sfHealth: '—', arr: 30000, software: 20547, monitoring: 9453, cvo: 0, licensing: 0, won: '2026-03-26', start: '2026-06-01', end: '2027-05-31', renewal: '2027-05-31', segment: 'SaaS / Software', impl: true, verif: null },
    { id: 'silverlinemedia', name: "Silverline Media", platform: 'OEM', accountStatus: 'Launched', sfHealth: 'Green', arr: 47353, software: 38842, monitoring: 8511, cvo: 0, licensing: 0, won: '2025-05-30', start: '2025-05-30', end: '2027-05-29', renewal: '2027-05-29', segment: 'Financial Services', verif: [807, 1251, 708, 600, 950] },
    { id: 'ridgelinesoftware', name: 'Ridgeline Software', platform: 'Web App', accountStatus: 'Launched', sfHealth: 'Yellow', arr: 21534, software: 18000, monitoring: 3534, cvo: 0, licensing: 0, won: '2023-04-21', start: '2026-04-21', end: '2029-04-20', renewal: '2029-04-20', segment: 'Manufacturing', nd: true, verif: null },
    { id: 'vantagelogistics', name: 'Vantage Logistics', platform: 'ISV', accountStatus: 'Implementing', sfHealth: 'Yellow', arr: 46121, software: 40120, monitoring: 6001, cvo: 0, licensing: 0, won: '2025-06-30', start: '2025-06-30', end: '2028-06-29', renewal: '2028-06-29', segment: 'Professional Services', impl: true, verif: null },
    { id: 'corewave', name: 'Corewave', platform: 'OEM', accountStatus: 'Implementing', sfHealth: 'Yellow', arr: 30000, software: 15365, monitoring: 14635, cvo: 0, licensing: 0, won: '2026-01-26', start: '2026-01-26', end: '2029-01-25', renewal: '2029-01-26', segment: 'Retail & E-commerce', impl: true, verif: null },
    { id: 'harborviewgroup', name: 'Harborview Group', platform: 'OEM', accountStatus: 'Launched', sfHealth: 'Green', arr: 34534, software: 29291, monitoring: 5243, cvo: 0, licensing: 0, won: '2025-03-16', start: '2025-03-16', end: '2029-03-15', renewal: '2029-03-15', segment: 'Financial Services', verif: [114, 116, 128, 128, 152] },
    { id: 'copperlineretail', name: 'Copperline Retail', platform: 'OEM', accountStatus: 'Launched', sfHealth: 'Yellow', arr: 33785, software: 26931, monitoring: 6854, cvo: 0, licensing: 0, won: '2024-07-29', start: '2024-07-29', end: '2027-07-28', renewal: '2027-07-28', segment: 'Financial Services', verif: [0, 0, 0, 0, 0], loginsManual: [8, 6, 3, 1, 0] },
    { id: 'everlinesystems', name: 'Everline Systems', platform: 'OEM', accountStatus: 'Launched', sfHealth: 'Yellow', arr: 39304, software: 20359, monitoring: 18945, cvo: 0, licensing: 0, won: '2025-02-20', start: '2025-02-20', end: '2027-02-19', renewal: '2027-02-19', segment: 'SaaS / Software', verif: [2940, 2220, 1730, 1920, 2410] },
    { id: 'deltaridgeco', name: 'Delta Ridge Co', platform: 'Web App', accountStatus: 'Launched', sfHealth: 'Yellow', arr: 20000, software: 10000, monitoring: 10000, cvo: 0, licensing: 0, won: '2024-03-27', start: '2026-03-27', end: '2028-03-26', renewal: '2028-03-26', segment: 'Hospitality & Travel', nd: true, verif: null },
    { id: 'foundryworks', name: 'Foundry Works', platform: 'OEM', accountStatus: 'Launched', sfHealth: 'Green', arr: 39965, software: 34857, monitoring: 5108, cvo: 0, licensing: 0, won: '2025-01-01', start: '2025-01-01', end: '2027-12-31', renewal: '2027-12-31', segment: 'Media & Entertainment', verif: [559, 461, 567, 585, 592] },
    { id: 'granitepeakgroup', name: 'Granite Peak Group', platform: 'OEM', accountStatus: 'Launched', sfHealth: 'Green', arr: 41080, software: 32870, monitoring: 8210, cvo: 0, licensing: 0, won: '2025-03-26', start: '2025-03-26', end: '2028-03-25', renewal: '2028-03-25', segment: 'Media & Entertainment', verif: [95, 88, 76, 70, 70] },
    { id: 'halcyonlabs', name: 'Halcyon Labs', platform: 'API', accountStatus: 'Launched', sfHealth: 'Red', arr: 30234, software: 8283, monitoring: 21951, cvo: 0, licensing: 0, won: '2025-01-31', start: '2025-01-30', end: '2027-01-29', renewal: '2027-01-29', segment: 'SaaS / Software', verif: [880, 760, 540, 360, 250], loginsManual: [12, 11, 12, 11, 12] },
    { id: 'junctiondigital', name: 'Junction Digital', platform: 'OEM', accountStatus: 'Implementing', sfHealth: 'Green', arr: 42378, software: 24940, monitoring: 7238, cvo: 10200, licensing: 0, won: '2026-03-31', start: '2026-03-31', end: '2028-03-31', renewal: '2028-03-31', segment: 'Media & Entertainment', impl: true, verif: null },
    { id: 'keystoneretail', name: 'Keystone Retail', platform: 'OEM', accountStatus: 'Launched', sfHealth: 'Red', arr: 30000, software: 26956, monitoring: 3044, cvo: 0, licensing: 0, won: '2024-07-09', start: '2024-07-09', end: '2027-07-08', renewal: '2027-07-08', segment: 'Logistics & Supply Chain', verif: [65, 61, 62, 66, 74], loginsManual: [17, 13, 9, 5, 3] },
    { id: 'lakesidegroup', name: 'Lakeside Group', platform: 'OEM', accountStatus: 'Launched', sfHealth: 'Green', arr: 39390, software: 19964, monitoring: 3306, cvo: 0, licensing: 16120, won: '2021-11-10', start: '2025-11-09', end: '2026-11-08', renewal: '2026-11-08', segment: 'Retail & E-commerce', verif: [294, 256, 291, 318, 283] },
    { id: 'monarchmedia', name: 'Monarch Media', platform: 'OEM', accountStatus: 'Implementing', sfHealth: 'Green', arr: 40308, software: 22755, monitoring: 17553, cvo: 0, licensing: 0, won: '2026-03-04', start: '2026-03-04', end: '2028-03-04', renewal: '2028-03-04', segment: 'SaaS / Software', impl: true, verif: null },
    { id: 'novafieldsco', name: 'Nova Fields Co', platform: 'OEM', accountStatus: 'Launched', sfHealth: 'Green', arr: 25000, software: 22186, monitoring: 2814, cvo: 0, licensing: 0, won: '2025-03-03', start: '2025-02-28', end: '2028-02-27', renewal: '2028-02-27', segment: 'Media & Entertainment', verif: [244, 213, 210, 254, 226] },
    { id: 'oakmontsolutions', name: 'Oakmont Solutions', platform: 'Web App', accountStatus: 'Launched', sfHealth: 'Green', arr: 26343, software: 15711, monitoring: 10632, cvo: 0, licensing: 0, won: '2021-09-30', start: '2025-09-30', end: '2026-09-29', renewal: '2026-09-29', segment: 'Media & Entertainment', nd: true, verif: null },
    { id: 'parkwaysystems', name: 'Parkway Systems', platform: 'OEM', accountStatus: 'Launched', sfHealth: 'Green', arr: 34364, software: 28651, monitoring: 5713, cvo: 0, licensing: 0, won: '2025-03-31', start: '2025-03-31', end: '2028-03-30', renewal: '2028-03-30', segment: 'Retail & E-commerce', verif: [249, 184, 192, 183, 178] },
    { id: 'quillbrookco', name: 'Quillbrook Co', platform: 'API', accountStatus: 'Implementing', sfHealth: 'Yellow', arr: 30000, software: 8394, monitoring: 21606, cvo: 0, licensing: 0, won: '2026-01-29', start: '2026-01-29', end: '2028-01-28', renewal: '2028-01-28', segment: 'Manufacturing', impl: true, verif: null },
    { id: 'redwoodanalytics', name: 'Redwood Analytics', platform: 'OEM', accountStatus: 'Launched', sfHealth: 'Red', arr: 30000, software: 25497, monitoring: 4503, cvo: 0, licensing: 0, won: '2024-11-19', start: '2024-11-19', end: '2027-11-18', renewal: '2027-11-18', segment: 'Financial Services', verif: [359, 306, 362, 338, 373] },
    { id: 'solsticelabs', name: 'Solstice Labs', platform: 'Web App', accountStatus: 'Launched', sfHealth: 'Green', arr: 36948, software: 18345, monitoring: 18603, cvo: 0, licensing: 0, won: '2020-08-17', start: '2026-09-29', end: '2026-09-29', renewal: '2026-09-29', segment: 'Retail & E-commerce', nd: true, verif: null },
    { id: 'timbercreekgroup', name: 'Timber Creek Group', platform: 'API', accountStatus: 'Launched', sfHealth: 'Green', arr: 18000, software: 12000, monitoring: 6000, cvo: 0, licensing: 0, won: '2022-07-27', start: '2026-07-26', end: '2026-07-26', renewal: '2026-07-26', segment: 'Media & Entertainment', nd: true, verif: null },
    { id: 'unionsquareco', name: 'Union Square Co', platform: 'OEM', accountStatus: 'Launched', sfHealth: 'Yellow', arr: 43015, software: 36525, monitoring: 6490, cvo: 0, licensing: 0, won: '2024-07-31', start: '2024-07-30', end: '2027-07-29', renewal: '2027-07-29', segment: 'Logistics & Supply Chain', nd: true, verif: null },
    { id: 'vertexretail', name: 'Vertex Retail', platform: 'OEM', accountStatus: 'Implementing', sfHealth: 'Green', arr: 44751, software: 30484, monitoring: 4067, cvo: 10200, licensing: 0, won: '2026-04-30', start: '2026-04-30', end: '2028-04-29', renewal: '2028-04-29', segment: 'Financial Services', impl: true, verif: null, note: 'No usage data in the warehouse — flagged with the data team.' },
    { id: 'westbrookgroup', name: 'Westbrook Group', platform: 'OEM', accountStatus: 'Launched', sfHealth: 'Green', arr: 46634, software: 23130, monitoring: 7347, cvo: 0, licensing: 16157, won: '2024-10-07', start: '2024-10-17', end: '2026-10-16', renewal: '2026-10-16', segment: 'Media & Entertainment', nd: true, verif: null },
    { id: 'driftwoodco', name: 'Driftwood Co', platform: 'OEM', accountStatus: 'Launched', sfHealth: 'Yellow', arr: 41204, software: 33414, monitoring: 7790, cvo: 0, licensing: 0, won: '2025-01-30', start: '2025-01-30', end: '2027-01-29', renewal: '2027-01-29', segment: 'Financial Services', nd: true, verif: null },
    { id: 'fairviewgroup', name: 'Fairview Group', platform: 'OEM', accountStatus: 'Implementing', sfHealth: 'Green', arr: 30000, software: 26022, monitoring: 3978, cvo: 0, licensing: 0, won: '2025-12-18', start: '2025-12-18', end: '2028-12-17', renewal: '2028-12-17', segment: 'Logistics & Supply Chain', impl: true, verif: null },
  ];

  // synthetic volume for launched accounts with no usage feed yet (sample, badged)
  function genMock(c) {
    const base = Math.max(40, Math.round((c.software || c.arr) / 120));
    const seed = c.id.charCodeAt(0) + c.id.length;
    const jit = (i) => 1 + (((seed * (i + 3)) % 17) - 8) / 100;
    let shape;
    if (c.sfHealth === 'Red') shape = [1, 0.82, 0.6, 0.42, 0.34];
    else if (c.sfHealth === 'Yellow') shape = [1, 0.95, 0.88, 0.81, 0.74];
    else shape = [0.8, 0.86, 0.92, 0.98, 1.05];
    return shape.map((s, i) => Math.max(1, Math.round(base * s * jit(i))));
  }

  // ---- module-level live state ----
  let customers = [];
  let MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May'];
  const SEGMENT = { label: 'All customers', totalAccounts: 0, csmCoverage: 0, windowLabel: 'Jan–May 2026' };
  function tierOf(arr) { return arr >= 150000 ? 'Enterprise' : arr >= 50000 ? 'Mid-Market' : 'Scaled'; }

  // The single derivation pipeline — runs on embedded OR CSV-loaded accounts.
  // Manually logged outreach (Leadership "Mark outreach done") — stored in
  // localStorage as { [accountId]: { date: 'YYYY-MM-DD', by, note } }. Applied
  // after deriveAll/applyThresholds so a fresher logged date overrides the
  // sheet-derived lastTouch, and an older one (aged past 30/60/90d) lets the
  // account re-enter Needs Attention naturally via touchDays.
  function getOutreachLog() {
    try { return JSON.parse(localStorage.getItem('cc_outreach_log')) || {}; } catch (e) { return {}; }
  }
  function setOutreachLog(log) {
    try { (window.Sync ? window.Sync.set : (k,v) => localStorage.setItem(k, JSON.stringify(v)))('cc_outreach_log', log); } catch (e) {}
  }
  function logOutreach(accountId, date, by, note) {
    const log = getOutreachLog();
    log[accountId] = { date, by: by || 'Leadership', note: note || '' };
    setOutreachLog(log);
    applyOutreachOverrides();
  }
  // Manually flagged "Watch" accounts (account detail toggle) — stored in
  // localStorage as { [accountId]: { reason, by, date } }. Additive only: if
  // the computed status is healthy/upsell, bump it to 'watch' for display and
  // prepend the reason to the headline. Doesn't downgrade stall/risk/watch
  // accounts that are already flagged by the real triggers.
  function getWatchOverrides() {
    try { return JSON.parse(localStorage.getItem('cc_watch_overrides')) || {}; } catch (e) { return {}; }
  }
  function setWatchOverrides(overrides) {
    try { (window.Sync ? window.Sync.set : (k,v) => localStorage.setItem(k, JSON.stringify(v)))('cc_watch_overrides', overrides); } catch (e) {}
  }
  function setManualWatch(accountId, reason, by) {
    const overrides = getWatchOverrides();
    overrides[accountId] = { reason: reason || '', by: by || 'Leadership', date: new Date('2026-06-11').toISOString().slice(0, 10) };
    setWatchOverrides(overrides);
    applyWatchOverrides();
  }
  function clearManualWatch(accountId) {
    const overrides = getWatchOverrides();
    delete overrides[accountId];
    setWatchOverrides(overrides);
    applyWatchOverrides();
  }
  function applyWatchOverrides() {
    const overrides = getWatchOverrides();
    customers.forEach((c) => {
      c.manualWatch = overrides[c.id] || null;
      if (c.manualWatch && (c.status === 'healthy' || c.status === 'upsell')) {
        c.status = 'watch';
        const reasonText = c.manualWatch.reason ? `Flagged for watch: ${c.manualWatch.reason}` : 'Manually flagged for watch.';
        if (!c.headline || !c.headline.startsWith(reasonText)) {
          c.headline = c.headline ? `${reasonText} ${c.headline}` : reasonText;
        }
      }
    });
  }

  // Snooze — "Snooze 30d" on account detail. Stored in localStorage as
  // { [accountId]: untilTimestamp }. Sets c.snoozedUntil so the Needs
  // Attention list can filter it out until the snooze expires (it doesn't
  // change status — the account is still flagged, just hidden from the
  // active worklist for a bit).
  function getSnoozes() {
    try { return JSON.parse(localStorage.getItem('cc_snooze')) || {}; } catch (e) { return {}; }
  }
  function setSnoozes(v) {
    try { (window.Sync ? window.Sync.set : (k,v) => localStorage.setItem(k, JSON.stringify(v)))('cc_snooze', v); } catch (e) {}
  }
  function snoozeAccount(accountId, days) {
    const snoozes = getSnoozes();
    snoozes[accountId] = Date.now() + (days || 30) * 86400000;
    setSnoozes(snoozes);
    applySnoozes();
  }
  function clearSnooze(accountId) {
    const snoozes = getSnoozes();
    delete snoozes[accountId];
    setSnoozes(snoozes);
    applySnoozes();
  }
  function applySnoozes() {
    const snoozes = getSnoozes();
    const now = Date.now();
    customers.forEach((c) => {
      const until = snoozes[c.id];
      c.snoozedUntil = (until && until > now) ? until : null;
    });
  }

  function applyOutreachOverrides() {
    const log = getOutreachLog();
    const now = new Date('2026-06-11');
    customers.forEach((c) => {
      const logged = log[c.id];
      if (!logged) return;
      const loggedDate = new Date(logged.date);
      const existingDate = c.lastTouch ? new Date(c.lastTouch.date) : null;
      if (!existingDate || loggedDate > existingDate) {
        c.lastTouch = { by: logged.by, channel: 'manual', date: logged.date, summary: logged.note || 'Outreach logged via Leadership Overview.' };
        c.touchDays = Math.round((now - loggedDate) / 86400000);
        const pending = c.pendingTask || PENDING_TASK[c.id];
        if (pending) c.outreach = { state: 'pending', owner: pending.owner };
        else c.outreach = { state: 'completed', owner: logged.by, date: logged.date };
      }
    });
  }

  function deriveAll(list, th) {
    list.forEach((c) => {
      c.impl = !!c.impl; c.nd = !!c.nd;
      if ((c.nd || (!c.impl)) && !c.verif) { if (c.nd) { c.verif = genMock(c); c.mockVolume = true; c.nd = false; } }
      if (!c.verif) c.verif = [0, 0, 0, 0, 0];
      c.logins = c.loginsManual ? c.loginsManual : (c.nd || c.impl) ? [0, 0, 0, 0, 0] : c.verif.map((x) => Math.max(x > 0 ? 2 : 0, Math.round(x / 22)));
      c.loginMom = momPct(c.logins); c.loginCum = cumPct(c.logins);
      c.verifMom = momPct(c.verif); c.verifCum = cumPct(c.verif);
      c.verifTotal = sum(c.verif);
      c.status = deriveStatus(c, th);
      c.headline = computeHeadline(c, th);
      c.renewalDays = daysUntil(c.renewal);
      c.renewalQuarter = renewalQuarter(c.renewal);
      c.csm = c.csm || CSM_BY_ID[c.id] || 'Unassigned';
      c.sfdcUrl = c.sfdcUrl || '#';
      const provC = Math.max(20, Math.round((c.software || c.arr) / 250));
      const utilByHealth = { Green: 0.78, Yellow: 0.55, Red: 0.32, '—': 0.25 }[c.sfHealth] || 0.5;
      const provA = c.impl ? Math.round(provC * 0.2) : c.nd ? Math.round(provC * 0.5) : Math.round(provC * utilByHealth);
      c.providers = { current: provA, contracted: provC };
      c.utilization = provC ? Math.round((provA / provC) * 100) : 0;
    c.tier = tierOf(c.arr);
      // tickets: from monthly series if present, else fallback map / sfHealth default
      if (c.ticketSeries && c.ticketSeries.length) {
        c.tickets = c.ticketSeries[c.ticketSeries.length - 1];
        c.ticketsPrev = c.ticketSeries.length > 1 ? c.ticketSeries[c.ticketSeries.length - 2] : c.tickets;
      } else {
        c.tickets = TICKETS[c.id] != null ? TICKETS[c.id] : ({ Green: 2, Yellow: 5, Red: 9, '—': 1 }[c.sfHealth] || 3);
        c.ticketsPrev = Math.max(0, c.tickets + (c.status === 'risk' || c.status === 'stall' ? -3 : 1));
      }
      c.execSponsor = c.execSponsor || SPONSORS[c.id] || null;
      c.lastTouch = c.lastTouch || LASTTOUCH[c.id] || null;
      c.touchDays = c.lastTouch ? Math.round((new Date('2026-06-11') - new Date(c.lastTouch.date)) / 86400000) : null;
      const pending = c.pendingTask || PENDING_TASK[c.id];
      if (pending) c.outreach = { state: 'pending', owner: pending.owner };
      else if (c.lastTouch) c.outreach = { state: 'completed', owner: c.lastTouch.by, date: c.lastTouch.date };
      else c.outreach = { state: (c.status === 'healthy' || c.impl || c.nd) ? 'none' : 'needed' };
      c.contract = buildContract(c);
      c.util = buildUtil(c);
      c.health = buildHealth(c);
    });
  }

  // Re-derive status/headline/outreach against live thresholds (Tweaks panel).
  // Status-transition tracking — compares each account's status to the last
  // time applyThresholds ran (persisted in localStorage) so the app can fire
  // Slack pings on meaningful transitions:
  //  - healthy/upsell/watch -> stall/risk  => newly "Needs attention"
  //  - stall/risk -> healthy/watch/upsell  => a "Save"
  // Returns the transitions found on THIS call; also updates the snapshot.
  const NEEDS_ATTENTION_STATUSES = ['stall', 'risk'];
  function getStatusSnapshot() {
    try { return JSON.parse(localStorage.getItem('cc_status_snapshot')) || {}; } catch (e) { return {}; }
  }
  function setStatusSnapshot(snap) {
    try { (window.Sync ? window.Sync.set : (k,v) => localStorage.setItem(k, JSON.stringify(v)))('cc_status_snapshot', snap); } catch (e) {}
  }
  function detectTransitions() {
    const snap = getStatusSnapshot();
    const newAttention = [];
    const saves = [];
    customers.forEach((c) => {
      const prev = snap[c.id];
      const curr = c.status;
      if (prev && prev !== curr) {
        const prevFlagged = NEEDS_ATTENTION_STATUSES.includes(prev);
        const currFlagged = NEEDS_ATTENTION_STATUSES.includes(curr);
        if (!prevFlagged && currFlagged) newAttention.push({ ...c, _prevStatus: prev });
        else if (prevFlagged && !currFlagged) saves.push({ ...c, _prevStatus: prev });
      }
      snap[c.id] = curr;
    });
    setStatusSnapshot(snap);
    return { newAttention, saves };
  }
  // Clears the snapshot for one or all accounts — lets Trigger Settings
  // simulate a "first run" so a Test Ping fires the transition again.
  function resetStatusSnapshot(accountId) {
    if (!accountId) { setStatusSnapshot({}); return; }
    const snap = getStatusSnapshot();
    delete snap[accountId];
    setStatusSnapshot(snap);
  }

  function applyThresholds(th) {
    const t = { decline: (th && th.declinePct) || 30, watch: (th && th.watchPct) || 25 };
    customers.forEach((c) => {
      c.status = deriveStatus(c, t);
      c.headline = computeHeadline(c, t);
      const pending = c.pendingTask || PENDING_TASK[c.id];
      if (!c.lastTouch && !pending) c.outreach = { state: (c.status === 'healthy' || c.impl || c.nd) ? 'none' : 'needed' };
    });
    applyOutreachOverrides();
    applyWatchOverrides();
    applySnoozes();
  }

  function publish(source) {
    SEGMENT.totalAccounts = customers.length;
    SEGMENT.windowLabel = MONTHS.length ? `${MONTHS[0]}–${MONTHS[MONTHS.length - 1]} 2026` : '';
    applyOutreachOverrides();
    applyWatchOverrides();
    applySnoozes();
    window.HEALTH = {
      MONTHS, SEGMENT, customers, STATUS, applyThresholds, loadFromFiles, dataSource: source,
      logOutreach, getOutreachLog, setManualWatch, clearManualWatch, detectTransitions, resetStatusSnapshot,
      snoozeAccount, clearSnooze,
      momPct, cumPct, fmtPct, fmtArr, fmtMoney, fmtUSD0, fmtUSDc, fmtAgo, fmtRenewal, renewalQuarter, daysUntil, trendColor, sum, avg, healthBand,
    };
  }

  // =====================================================================
  // LIVE DATA SOURCES
  // Point these at published a data feed (File → Share → Publish to web →
  // pick the tab → Comma-separated values (.csv)). The app fetches them on
  // load; editing the sheet + refreshing the dashboard updates everything.
  // Leave blank to use the bundled data/*.csv instead. Either way, if a fetch
  // fails the loader falls back to the local CSV, then to the embedded snapshot.
  // =====================================================================
  const SHEET_ACCOUNTS_URL = '';
  // Second published sheet — account export that INCLUDES the "Customer Health" (Green/Yellow/Red)
  // column the first one lacks. Used to enrich each account's SF Health, joined by account name.
  const SHEET_HEALTH_URL = '';
  // No real usage TIME-SERIES yet — month-by-month metrics come from the bundled file (sample).
  // When you have a the analytics tool export with columns [Account Name, Month, Verifications, Logins],
  // publish it as CSV and paste its URL here:
  const SHEET_METRICS_URL = '';

  // ---- CSV parsing ----
  function parseRows(text) {
    const rows = []; let row = [], field = '', q = false;
    for (let i = 0; i < text.length; i++) {
      const ch = text[i];
      if (q) {
        if (ch === '"') { if (text[i + 1] === '"') { field += '"'; i++; } else q = false; }
        else field += ch;
      } else {
        if (ch === '"') q = true;
        else if (ch === ',') { row.push(field); field = ''; }
        else if (ch === '\n') { row.push(field); rows.push(row); row = []; field = ''; }
        else if (ch === '\r') { /* skip */ }
        else field += ch;
      }
    }
    if (field.length || row.length) { row.push(field); rows.push(row); }
    return rows;
  }
  function parseCSV(text) {
    const rows = parseRows(text);
    if (!rows.length) return [];
    const head = rows[0].map((h) => h.trim());
    return rows.slice(1).filter((r) => r.length && r.some((c) => c !== '')).map((r) => {
      const o = {}; head.forEach((h, i) => { o[h] = (r[i] !== undefined ? r[i] : '').trim(); }); return o;
    });
  }
  const _num = (v) => { const n = parseFloat(String(v == null ? '' : v).replace(/[^0-9.\-]/g, '')); return isNaN(n) ? 0 : n; };
  const _dec = (s) => (s || '').replace(/&amp;/g, '&').trim();
  function slugify(name) { return (name || '').toLowerCase().replace(/[^a-z0-9]+/g, '').slice(0, 24); }
  function sheetIso(s) { if (!s) return ''; s = String(s).trim(); if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10); const m = s.split('/'); if (m.length === 3) { return `${m[2]}-${('0' + m[0]).slice(-2)}-${('0' + m[1]).slice(-2)}`; } return s; }
  function findHeader(rows, mustHave) { for (let i = 0; i < rows.length; i++) { const low = rows[i].map((c) => c.trim().toLowerCase()); if (mustHave.every((h) => low.includes(h))) return i; } return -1; }
  function colIndex(headerRow, names) { const low = headerRow.map((c) => c.trim().toLowerCase()); for (const n of names) { const i = low.indexOf(n); if (i >= 0) return i; } return -1; }

  // the CRM "Customer Account Details" sheet → account objects (under-$50K OEM segment only)
  function buildAccountsFromSheet(text) {
    const rows = parseRows(text);
    const hi = findHeader(rows, ['account name', 'arr', 'platform']);
    if (hi < 0) return [];
    const H = rows[hi];
    const ix = {
      name: colIndex(H, ['account name']), csm: colIndex(H, ['csm']), arr: colIndex(H, ['arr']),
      cvo: colIndex(H, ['cvo services arr', 'cvo arr']), lic: colIndex(H, ['licensing arr']), enr: colIndex(H, ['enrollment arr']),
      platform: colIndex(H, ['platform']), renewal: colIndex(H, ['account renewal date', 'renewal date']),
      status: colIndex(H, ['account status', 'status']), seg: colIndex(H, ['industry segment group']), seg2: colIndex(H, ['industry segment']),
    };
    if (ix.name < 0) return [];
    const out = [];
    for (let r = hi + 1; r < rows.length; r++) {
      const row = rows[r]; if (!row || !row[ix.name] || !row[ix.name].trim()) continue;
      const name = _dec(row[ix.name]); const platform = (row[ix.platform] || '').trim(); const arr = _num(row[ix.arr]); const status = (row[ix.status] || '').trim();
      if (status !== 'Launched' && status !== 'Implementing') continue; // active accounts only — whole book, all tiers
      const cvo = ix.cvo >= 0 ? _num(row[ix.cvo]) : 0, lic = ix.lic >= 0 ? _num(row[ix.lic]) : 0, enr = ix.enr >= 0 ? _num(row[ix.enr]) : 0;
      out.push({
        id: slugify(name), name, platform, accountStatus: status, sfHealth: '—',
        arr: Math.round(arr), software: Math.max(0, Math.round(arr - cvo - lic - enr)), monitoring: 0, cvo, licensing: lic,
        won: '', start: '', end: '', renewal: ix.renewal >= 0 ? sheetIso(row[ix.renewal]) : '',
        segment: (ix.seg >= 0 ? _dec(row[ix.seg]) : '') || (ix.seg2 >= 0 ? _dec(row[ix.seg2]) : ''),
        csm: ix.csm >= 0 ? (row[ix.csm] || '').trim() : '',
        impl: status === 'Implementing',
      });
    }
    return out;
  }

  // Flexible usage/metrics sheet → metric rows. Matches accounts by slug, so an
  // "Account Name" column or an "account_id" column both work.
  function buildMetricsFromSheet(text) {
    const rows = parseRows(text);
    const hi = findHeader(rows, ['month']);
    if (hi < 0) return [];
    const H = rows[hi];
    const ix = {
      acct: colIndex(H, ['account_id', 'account id', 'account', 'account name', 'name']),
      month: colIndex(H, ['month', 'period']),
      verif: colIndex(H, ['verifications', 'verification volume', 'verification_volume', 'verifs']),
      logins: colIndex(H, ['logins', 'unique logins', 'unique_users', 'active users', 'logins_unique']),
      tickets: colIndex(H, ['open_tickets', 'open tickets', 'tickets', 'support tickets']),
    };
    if (ix.acct < 0 || ix.month < 0) return [];
    const out = [];
    for (let r = hi + 1; r < rows.length; r++) {
      const row = rows[r]; if (!row || !row[ix.acct] || !row[ix.acct].trim()) continue;
      const raw = row[ix.acct].trim();
      const id = (/^[a-z0-9]+$/.test(raw) && raw.length <= 24) ? raw : slugify(raw);
      out.push({ account_id: id, month: (row[ix.month] || '').trim(),
        verifications: ix.verif >= 0 ? _num(row[ix.verif]) : 0,
        logins: ix.logins >= 0 ? _num(row[ix.logins]) : 0,
        open_tickets: ix.tickets >= 0 ? _num(row[ix.tickets]) : 0 });
    }
    return out;
  }

  // Account-health export (has a "Customer Health" column) → { slug: 'Green'|'Yellow'|'Red' }
  function buildHealthMapFromSheet(text) {
    const rows = parseRows(text);
    const hi = findHeader(rows, ['account name', 'customer health']);
    if (hi < 0) return {};
    const H = rows[hi];
    const ni = colIndex(H, ['account name']), ci = colIndex(H, ['customer health', 'health']);
    if (ni < 0 || ci < 0) return {};
    const map = {};
    for (let r = hi + 1; r < rows.length; r++) {
      const row = rows[r]; if (!row || !row[ni] || !row[ni].trim()) continue;
      const h = (row[ci] || '').trim();
      if (h) map[slugify(_dec(row[ni]))] = h;
    }
    return map;
  }

  // local data/accounts.csv → account objects (same shape as the sheet adapter)
  function buildAccountsFromCSV(text) {
    return parseCSV(text).map((r) => {
      const o = {
        id: r.id, name: r.name, platform: r.platform, accountStatus: r.account_status, sfHealth: r.sf_health || '—',
        arr: _num(r.arr), software: _num(r.software), monitoring: _num(r.monitoring), cvo: _num(r.cvo), licensing: _num(r.licensing),
        won: r.won_date, start: r.contract_start, end: r.contract_end, renewal: r.renewal_date, segment: r.segment,
        impl: (r.account_status || '').toLowerCase() === 'implementing',
      };
      if (r.csm) o.csm = r.csm;
      if (r.exec_sponsor_name) o.execSponsor = { name: r.exec_sponsor_name, title: r.exec_sponsor_title || '' };
      if (r.last_touch_by) o.lastTouch = { by: r.last_touch_by, channel: r.last_touch_channel || 'email', date: r.last_touch_date, summary: r.last_touch_summary || '' };
      if (r.pending_task_owner) o.pendingTask = { owner: r.pending_task_owner };
      if (r.note) o.note = r.note;
      return o;
    });
  }

  // join account objects + metric rows → derived-ready list + month axis
  function assembleAccounts(accountObjs, metricRows) {
    const byAcct = {};
    (metricRows || []).forEach((r) => { const id = r.account_id; if (!id) return; (byAcct[id] = byAcct[id] || []).push(r); });
    Object.values(byAcct).forEach((arr) => arr.sort((a, b) => (a.month < b.month ? -1 : a.month > b.month ? 1 : 0)));
    const monthSet = {}; (metricRows || []).forEach((r) => { if (r.month) monthSet[r.month] = true; });
    const monthKeys = Object.keys(monthSet).sort();
    const months = monthKeys.length ? monthKeys.map(monthLabel) : ['Jan', 'Feb', 'Mar', 'Apr', 'May'];
    const list = accountObjs.map((o) => {
      const m = byAcct[o.id] || [];
      const impl = !!o.impl;
      const verif = m.length ? monthKeys.map((k) => { const row = m.find((x) => x.month === k); return row ? _num(row.verifications) : 0; }) : null;
      const logins = m.length ? monthKeys.map((k) => { const row = m.find((x) => x.month === k); return row ? _num(row.logins) : 0; }) : null;
      const tickets = m.length ? monthKeys.map((k) => { const row = m.find((x) => x.month === k); return row ? _num(row.open_tickets) : 0; }) : null;
      const a = Object.assign({}, o, { impl, nd: !impl && m.length === 0, verif });
      if (logins) a.loginsManual = logins;
      if (tickets) a.ticketSeries = tickets;
      return a;
    });
    return { list, months };
  }

  async function fetchText(url) { const r = await fetch(url, { cache: 'no-store' }); if (!r.ok) throw new Error('http ' + r.status); return r.text(); }

  // ---- async loader: live sheets → local CSVs → embedded ----
  async function loadFromFiles() {
    const parts = [];
    let accounts = null, metricRows = null;
    // ACCOUNTS
    if (SHEET_ACCOUNTS_URL) { try { const a = buildAccountsFromSheet(await fetchText(SHEET_ACCOUNTS_URL)); if (a.length) { accounts = a; parts.push('accounts: live sheet'); } } catch (e) { /* fall through */ } }
    if (!accounts) { try { accounts = buildAccountsFromCSV(await fetchText('data/accounts.csv')); parts.push('accounts: file'); } catch (e) { /* fall through */ } }
    if (!accounts || !accounts.length) { document.dispatchEvent(new CustomEvent('health:loaded', { detail: { source: 'embedded' } })); return false; }
    // ENRICH: real Customer Health (Green/Yellow/Red) from the health export, joined by account name
    if (SHEET_HEALTH_URL) { try { const hm = buildHealthMapFromSheet(await fetchText(SHEET_HEALTH_URL)); let n = 0; accounts.forEach((a) => { if (hm[a.id]) { a.sfHealth = hm[a.id]; n++; } }); if (n) parts.push('health: live sheet'); } catch (e) { /* ignore */ } }
    // METRICS
    if (SHEET_METRICS_URL) { try { const m = buildMetricsFromSheet(await fetchText(SHEET_METRICS_URL)); if (m.length) { metricRows = m; parts.push('metrics: live sheet'); } } catch (e) { /* fall through */ } }
    if (!metricRows) { try { metricRows = parseCSV(await fetchText('data/monthly_metrics.csv')); parts.push('metrics: file'); } catch (e) { metricRows = []; } }
    const built = assembleAccounts(accounts, metricRows);
    customers = built.list; MONTHS = built.months;
    deriveAll(customers);
    publish(parts.join(' · ') || 'flat files');
    document.dispatchEvent(new CustomEvent('health:loaded', { detail: { source: 'loaded', count: customers.length } }));
    return true;
  }

  // ---- initial synchronous build from embedded snapshot (so HEALTH always exists) ----
  customers = EMBEDDED_ACCOUNTS.map((o) => Object.assign({}, o));
  deriveAll(customers);
  publish('embedded (fallback)');
})();
