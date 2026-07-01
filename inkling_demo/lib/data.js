/* Customer Health — data layer (flat-file driven)
   =====================================================================
   The app reads two CSV flat files at runtime so the data is swappable
   WITHOUT touching code:
     data/accounts.csv          one row per account (Salesforce "CS Customer Report" shape)
     data/monthly_metrics.csv   one row per account per month (the analytics warehouse time-series shape)

   ENGINEERING: replace those two CSVs with exports from Salesforce + the
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
    stall:      { label: 'Stalled',    color: '#EB5757', bg: '#FBD7D7', dot: '#EB5757', rank: 0 },
    risk:       { label: 'At Risk',    color: '#EB5757', bg: '#FBD7D7', dot: '#EB5757', rank: 1 },
    watch:      { label: 'Watch',      color: '#D97A22', bg: '#FFE8D3', dot: '#FF9A3C', rank: 2 },
    upsell:     { label: 'Upsell',     color: '#3A2B98', bg: '#D8D1FF', dot: '#503BD4', rank: 3 },
    healthy:    { label: 'Healthy',    color: '#00827B', bg: '#D9F4ED', dot: '#35BC98', rank: 4 },
    onboarding: { label: 'Onboarding', color: '#0A42C4', bg: '#E7EFFC', dot: '#0D54F5', rank: 5 },
    nodata:     { label: 'No data',    color: '#585C64', bg: '#E8EAEF', dot: '#A4A8AF', rank: 6 },
  };
  function trendColor(s) { return ({ stall: '#EB5757', risk: '#EB5757', watch: '#D97A22', upsell: '#503BD4', healthy: '#A4A8AF', onboarding: '#0D54F5', nodata: '#C6C9CE' })[s] || '#A4A8AF'; }

  const HEADLINE = {
    stall: 'Zero usage activity across all five months — stall trigger.',
    risk: 'MAU volume crossed the 30% decline trigger.',
    watch: 'Down 25%+ since January — approaching the decline threshold.',
    upsell: 'MAU volume up 30%+ month over month — expansion signal.',
    onboarding: 'In deployment — auto-green until ~90 days post go-live.',
    nodata: 'No usage data reaching the analytics warehouse yet — flagged for the data team.',
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
    if (vAll0 && lDown) return 'Active Users stalled at zero and logins falling — the account has gone dark on both signals.';
    if (vAll0) return 'Zero usage activity across the window — stall trigger.';
    if (c.status === 'upsell') return `MAU volume up ${decline}%+ month over month — expansion signal.`;
    if (vDown && lDown) return `Both signals down — MAUs ${fmtPct(vm)} and logins ${fmtPct(lm)} MoM. Disengaging across the board.`;
    if (vDown && !lDown) return `Active Users down ${fmtPct(vm)} MoM while logins hold steady — they’re still logging in but running fewer checks.`;
    if (lDown && !vDown) return `Logins down ${fmtPct(lm)} MoM while MAU volume holds — fewer users engaging; possible champion or seat drop-off.`;
    if (c.verifCum <= -watch) return `Down ${fmtPct(c.verifCum)} since the start of the window — a slow slide approaching the decline threshold.`;
    return HEADLINE[c.status] || '';
  }

  // ---- contract (order-form shape) ----
  const SKUS = ['Core Platform', 'User Onboarding', 'Monitoring', 'Premium Analytics', 'Premium Workflows', 'Premium API'];
  const DATA_SOURCES = ['Core records', 'Identity graph', 'Enrichment API', 'Registry: Regional', 'Registry: Federal', 'Watchlists', 'Opt-out registry', 'Directory data', 'Archive feed'];
  function buildContract(c) {
    const provC = c.providers.contracted, appPerUnit = 200;
    const appAnnual = c.software || provC * appPerUnit;
    const skusFee = Math.round(appAnnual * 0.8094), dataFee = appAnnual - skusFee;
    const svcAnnual = (c.cvo || 0) + (c.monitoring || 0);
    const packets = Math.max(0, Math.round((c.cvo || 0) / 113));
    return {
      oneTime: [{ label: 'Implementation', amount: 7500 }], oneTimeTotal: 7500,
      application: { usage: 'Premium Services', group: 'Group 1', allotment: provC, allotmentUnit: 'Seat(s)', perUnit: appPerUnit, annual: appAnnual, skus: SKUS, skusFee, dataSources: DATA_SOURCES, dataFee },
      services: { name: 'Premium Services', allotment: packets, allotmentUnit: 'Module(s)', perUnit: 113, overages: 136, annual: svcAnnual, note: 'Includes all required sources needed for module delivery.' },
      annualCommitment: c.arr,
    };
  }

  // ---- contract utilization (MAU data real; rest sample) ----
  function buildUtil(c) {
    const provC = c.providers.contracted, provA = c.providers.current;
    const lines = [];
    lines.push({ key: 'providers', label: 'User onboarding', used: provA, entitled: provC, unit: 'seats', sample: true });
    const verifLast = c.verif[c.verif.length - 1];
    const verifEnt = Math.max(20, Math.round(provC * 2 / 4));
    lines.push({ key: 'verif', label: 'Active Users', used: verifLast, entitled: verifEnt, unit: '/mo', real: !c.nd && !c.impl });
    const cvoEnt = c.cvo ? Math.max(5, Math.round(c.cvo / 113)) : 0;
    if (cvoEnt > 0) lines.push({ key: 'cvo', label: 'Premium services', used: Math.round(cvoEnt * ({ Green: 0.6, Yellow: 0.35, Red: 0.15 }[c.sfHealth] || 0.35)), entitled: cvoEnt, unit: 'modules', sample: true });
    const monEnt = c.monitoring ? Math.max(10, Math.round(c.monitoring / 60)) : 0;
    if (monEnt > 0) lines.push({ key: 'mon', label: 'Monitoring', used: Math.round(monEnt * ({ Green: 0.72, Yellow: 0.45, Red: 0.2 }[c.sfHealth] || 0.45)), entitled: monEnt, unit: 'monitors', sample: true });
    lines.forEach((l) => { l.pct = l.entitled ? Math.round((l.used / l.entitled) * 100) : 0; });
    const capped = lines.map((l) => Math.min(100, l.pct));
    return { lines, overallPct: avg(capped), activeLines: lines.filter((l) => l.pct >= 40).length, totalLines: lines.length, verifPct: Math.min(140, lines.find((l) => l.key === 'verif').pct) };
  }

  // ---- DEAR health scorecard ----
  function mstat(e, m) { const r = m ? e / m : 0; return r >= 0.75 ? 'green' : r >= 0.4 ? 'yellow' : 'red'; }
  function healthBand(s) {
    if (s >= 80) return { label: 'Strong', color: '#00827B', bg: '#D9F4ED', track: '#35BC98' };
    if (s >= 60) return { label: 'Stable', color: '#585C64', bg: '#E8EAEF', track: '#585C64' };
    if (s >= 40) return { label: 'At risk', color: '#D97A22', bg: '#FFE8D3', track: '#FF9A3C' };
    return { label: 'Critical', color: '#EB5757', bg: '#FBD7D7', track: '#EB5757' };
  }
  function buildHealth(c) {
    if (c.impl) return { onboarding: true, band: { label: 'Onboarding', color: '#0A42C4', bg: '#E7EFFC', track: '#0D54F5' }, note: 'In deployment — auto-green until ~90 days post go-live, per the program maturity rule.' };
    if (c.nd) return { nodata: true, band: { label: 'No usage data', color: '#585C64', bg: '#E8EAEF', track: '#A4A8AF' }, note: 'No usage or login data is reaching the analytics warehouse for this account yet — DEAR Adoption & ROI can\u2019t be scored until the data source is confirmed.' };

    const v = c.verif, lastL = c.logins[c.logins.length - 1], u = c.util;
    const M = (label, earned, max, note, sample) => ({ label, earned, max, note, sample, status: mstat(earned, max) });

    const live = c.verifTotal > 0;
    const D = [
      M('Onboarded & live', live ? 10 : 4, 10, live ? 'Producing active usage in production' : 'Live but not yet producing activity'),
      M('Time to first value', live ? 5 : 0, 5, live ? 'Activated and compliance' : 'No activity recorded yet'),
    ];
    let le = lastL === 0 ? 0 : c.loginMom === null ? 7 : c.loginMom >= 0 ? 10 : c.loginMom >= -15 ? 7 : c.loginMom >= -30 ? 4 : 2;
    const touch = c.outreach.state === 'completed' ? (c.touchDays <= 30 ? 8 : c.touchDays <= 60 ? 6 : 4) : c.outreach.state === 'pending' ? 5 : 2;
    const tk = c.tickets, tkScore = tk === 0 ? 2 : tk <= 6 ? 3 : tk <= 12 ? 2 : 1;
    const E = [
      M('Login activity', le, 10, lastL === 0 ? 'No logins this month' : `${lastL} users · ${fmtPct(c.loginMom)} MoM`, true),
      M('CS responsiveness', touch, 8, c.outreach.state === 'completed' ? `Last touch ${fmtAgo(c.outreach.date)}` : c.outreach.state === 'pending' ? `Outreach pending · ${c.outreach.owner}` : 'No outreach logged', true),
      M('Executive sponsor', c.execSponsor ? 4 : 0, 4, c.execSponsor ? `${c.execSponsor.name}` : 'No sponsor identified', true),
      M('Support tickets', tkScore, 3, `${tk} open in the support desk`, true),
    ];
    let ut = !live ? 0 : c.verifMom === null ? 10 : c.verifMom >= 30 ? 15 : c.verifMom >= 0 ? 12 : c.verifMom >= -15 ? 8 : c.verifMom >= -30 ? 4 : 1;
    const breadth = Math.round((u.activeLines / u.totalLines) * 12);
    let base = c.verifCum >= 0 ? 8 : c.verifCum >= -10 ? 6 : c.verifCum >= -25 ? 4 : c.verifCum >= -50 ? 2 : 0;
    const A = [
      M('MAU trend', ut, 15, `${fmtPct(c.verifMom)} MoM`),
      M('Contract-utilization breadth', breadth, 12, `${u.activeLines} of ${u.totalLines} contract areas in active use`, true),
      M('Trend vs baseline', base, 8, `${fmtPct(c.verifCum)} since January`),
    ];
    const vp = u.verifPct, value = vp >= 70 ? 10 : vp >= 40 ? 7 : vp >= 20 ? 4 : 2;
    const op = u.overallPct, spend = op >= 70 ? 8 : op >= 45 ? 6 : op >= 25 ? 4 : 2;
    const d = c.renewalDays, ren = d > 180 ? 7 : d >= 90 ? 6 : d >= 45 ? 4 : 2;
    const R = [
      M('Value realized (MAUs)', value, 10, `${vp}% of usage allotment used`, true),
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
    silverlinetech: { name: 'Dr. Maya Iyer', title: 'VP, Operations' }, stonebridgenetworks: { name: 'Lauren Diaz', title: 'Director of Operations' },
    fairviewcloud: { name: 'Sam Okafor', title: 'Head of Compliance' }, westgatedynamics: { name: 'Jordan Reyes', title: 'COO' },
    aurorabaysystems: { name: 'Erin Cho', title: 'Chief Medical Officer' }, junipersoftware: { name: 'Marcus Webb', title: 'VP, Network' },
    riverstonedigital: { name: 'Dana Whitfield', title: 'VP, Operations' }, rowandynamics: { name: 'Nicole Tran', title: 'Practice Manager' },
  };
  const LASTTOUCH = {
    riverstonedigital: { by: 'Alex', channel: 'email', date: '2026-06-06', summary: 'Renewal check-in — awaiting reply' },
    westgatedynamics: { by: 'Sam W.', channel: 'call', date: '2026-05-30', summary: 'Discussed slower Q2 workflow' },
    junipersoftware: { by: 'Alex', channel: 'email', date: '2026-06-03', summary: 'Usage check-in' },
    fairviewcloud: { by: 'Sam W.', channel: 'email', date: '2026-04-30', summary: 'Quarterly recap' },
    silverlinetech: { by: 'Alex', channel: 'call', date: '2026-05-22', summary: 'Volume surge follow-up' },
  };
  const PENDING_TASK = { cascadedataco: { owner: 'Alex' }, meridiantechnologies: { owner: 'Sam W.' } };
  const TICKETS = { riverstonedigital: 6, cascadedataco: 9, meridiantechnologies: 8, zephyrplatform: 13, ironvaletechnologies: 1, junipersoftware: 4, westgatedynamics: 2, silverlinetech: 2, stonebridgenetworks: 4, fairviewcloud: 4, aurorabaysystems: 5, foxgloveanalytics: 1 };
  const CSM_BY_ID = {
    riverstonedigital: 'Alex', junipersoftware: 'Alex', silverlinetech: 'Alex', cascadedataco: 'Alex', umbersystems: 'Alex', pinnaclegroup: 'Alex', baysidecollective: 'Alex',
    westgatedynamics: 'Sam Whitaker', fairviewcloud: 'Sam Whitaker', meridiantechnologies: 'Sam Whitaker', foxgloveanalytics: 'Sam Whitaker', rowandynamics: 'Sam Whitaker',
    stonebridgenetworks: 'Chris Doyle', aurorabaysystems: 'Chris Doyle', zephyrplatform: 'Chris Doyle', ospreyinteractive: 'Chris Doyle',
  };

  // ---- EMBEDDED snapshot (offline fallback only; the CSVs are the real source) ----
  const EMBEDDED_ACCOUNTS = [
    { id: 'northwindsystems', name: 'Northwind Systems', platform: 'OEM', accountStatus: 'Implementing', sfHealth: '—', arr: 25840, software: 17700, monitoring: 8140, cvo: 0, licensing: 0, won: '2026-02-21', start: '2026-04-29', end: '2027-04-28', renewal: '2027-04-28', segment: 'Productivity SaaS', impl: true, verif: null },
    { id: 'silverlinetech', name: "Silverline Tech", platform: 'OEM', accountStatus: 'Launched', sfHealth: 'Green', arr: 45930, software: 37670, monitoring: 8260, cvo: 0, licensing: 0, won: '2025-05-27', start: '2025-05-27', end: '2027-05-26', renewal: '2027-05-26', segment: 'Enterprise IT', verif: [1107, 1716, 971, 823, 1303] },
    { id: 'violetskysolutions', name: 'Violet Sky Solutions', platform: 'Web App', accountStatus: 'Launched', sfHealth: 'Yellow', arr: 20850, software: 17430, monitoring: 3420, cvo: 0, licensing: 0, won: '2023-07-02', start: '2026-07-02', end: '2029-07-01', renewal: '2029-07-01', segment: 'EdTech', nd: true, verif: null },
    { id: 'wavecreststudio', name: 'Wavecrest Studio', platform: 'ISV', accountStatus: 'Implementing', sfHealth: 'Yellow', arr: 40330, software: 35080, monitoring: 5250, cvo: 0, licensing: 0, won: '2025-04-20', start: '2025-04-20', end: '2028-04-19', renewal: '2028-04-19', segment: 'HR Tech', impl: true, verif: null },
    { id: 'brightpathsoftware', name: 'Brightpath Software', platform: 'OEM', accountStatus: 'Implementing', sfHealth: 'Yellow', arr: 24250, software: 12420, monitoring: 11830, cvo: 0, licensing: 0, won: '2025-12-20', start: '2025-12-20', end: '2028-12-19', renewal: '2028-12-20', segment: 'MarTech', impl: true, verif: null },
    { id: 'stonebridgenetworks', name: 'Stonebridge Networks', platform: 'OEM', accountStatus: 'Launched', sfHealth: 'Green', arr: 31880, software: 27040, monitoring: 4840, cvo: 0, licensing: 0, won: '2025-03-06', start: '2025-03-06', end: '2029-03-05', renewal: '2029-03-05', segment: 'E-commerce', verif: [163, 166, 184, 184, 218] },
    { id: 'ironvaletechnologies', name: 'Ironvale Technologies', platform: 'OEM', accountStatus: 'Launched', sfHealth: 'Yellow', arr: 38330, software: 30550, monitoring: 7780, cvo: 0, licensing: 0, won: '2024-05-30', start: '2024-05-30', end: '2027-05-29', renewal: '2027-05-29', segment: 'E-commerce', verif: [0, 0, 0, 0, 0], loginsManual: [7, 7, 2, 1, 0] },
    { id: 'riverstonedigital', name: 'Riverstone Digital', platform: 'OEM', accountStatus: 'Launched', sfHealth: 'Yellow', arr: 33450, software: 17330, monitoring: 16120, cvo: 0, licensing: 0, won: '2025-03-09', start: '2025-03-09', end: '2027-03-08', renewal: '2027-03-08', segment: 'Productivity SaaS', verif: [3889, 2937, 2289, 2540, 3188] },
    { id: 'yellowbricklabs', name: 'Yellowbrick Labs', platform: 'Web App', accountStatus: 'Launched', sfHealth: 'Yellow', arr: 15760, software: 7880, monitoring: 7880, cvo: 0, licensing: 0, won: '2024-01-16', start: '2026-01-15', end: '2028-01-15', renewal: '2028-01-15', segment: 'Retail Tech', nd: true, verif: null },
    { id: 'fairviewcloud', name: 'Fairview Cloud', platform: 'OEM', accountStatus: 'Launched', sfHealth: 'Green', arr: 53520, software: 46680, monitoring: 6840, cvo: 0, licensing: 0, won: '2024-12-02', start: '2024-12-02', end: '2027-12-01', renewal: '2027-12-01', segment: 'Fintech', verif: [419, 345, 425, 438, 443] },
    { id: 'westgatedynamics', name: 'Westgate Dynamics', platform: 'OEM', accountStatus: 'Launched', sfHealth: 'Green', arr: 37890, software: 30320, monitoring: 7570, cvo: 0, licensing: 0, won: '2025-01-16', start: '2025-01-16', end: '2028-01-16', renewal: '2028-01-16', segment: 'Fintech', verif: [66, 61, 53, 48, 48] },
    { id: 'zephyrplatform', name: 'Zephyr Platform', platform: 'API', accountStatus: 'Launched', sfHealth: 'Red', arr: 25010, software: 6850, monitoring: 18160, cvo: 0, licensing: 0, won: '2024-12-01', start: '2024-11-30', end: '2026-11-29', renewal: '2026-11-29', segment: 'Productivity SaaS', verif: [1000, 864, 614, 409, 284], loginsManual: [12, 11, 11, 10, 13] },
    { id: 'pinnaclegroup', name: 'Pinnacle Group', platform: 'OEM', accountStatus: 'Implementing', sfHealth: 'Green', arr: 30300, software: 17830, monitoring: 5180, cvo: 7290, licensing: 0, won: '2026-05-21', start: '2026-05-21', end: '2028-05-21', renewal: '2028-05-21', segment: 'Fintech', impl: true, verif: null },
    { id: 'cascadedataco', name: 'Cascade Data Co', platform: 'OEM', accountStatus: 'Launched', sfHealth: 'Red', arr: 25840, software: 23220, monitoring: 2620, cvo: 0, licensing: 0, won: '2024-05-16', start: '2024-05-16', end: '2027-05-15', renewal: '2027-05-15', segment: 'Logistics Tech', verif: [87, 82, 83, 88, 99], loginsManual: [16, 12, 9, 6, 3] },
    { id: 'aurorabaysystems', name: 'RDS Bay Systems', platform: 'OEM', accountStatus: 'Launched', sfHealth: 'Green', arr: 48100, software: 24380, monitoring: 4040, cvo: 0, licensing: 19680, won: '2022-01-12', start: '2026-01-11', end: '2027-01-10', renewal: '2027-01-10', segment: 'MarTech', verif: [291, 254, 288, 315, 280] },
    { id: 'baysidecollective', name: 'Bayside Collective', platform: 'OEM', accountStatus: 'Implementing', sfHealth: 'Green', arr: 28620, software: 16160, monitoring: 12460, cvo: 0, licensing: 0, won: '2026-04-16', start: '2026-04-16', end: '2028-04-16', renewal: '2028-04-16', segment: 'Productivity SaaS', impl: true, verif: null },
    { id: 'foxgloveanalytics', name: 'Foxglove Analytics', platform: 'OEM', accountStatus: 'Launched', sfHealth: 'Green', arr: 19930, software: 17690, monitoring: 2240, cvo: 0, licensing: 0, won: '2025-01-03', start: '2024-12-31', end: '2027-12-30', renewal: '2027-12-30', segment: 'Fintech', verif: [221, 193, 191, 231, 205] },
    { id: 'aldercollective', name: 'Alder Collective', platform: 'Web App', accountStatus: 'Launched', sfHealth: 'Green', arr: 31720, software: 18920, monitoring: 12800, cvo: 0, licensing: 0, won: '2021-08-13', start: '2025-08-13', end: '2026-08-12', renewal: '2026-08-12', segment: 'Fintech', nd: true, verif: null },
    { id: 'junipersoftware', name: 'Juniper Software', platform: 'OEM', accountStatus: 'Launched', sfHealth: 'Green', arr: 41020, software: 34200, monitoring: 6820, cvo: 0, licensing: 0, won: '2025-04-30', start: '2025-04-30', end: '2028-04-29', renewal: '2028-04-29', segment: 'MarTech', verif: [358, 265, 276, 263, 256] },
    { id: 'basaltanalytics', name: 'Basalt Analytics', platform: 'API', accountStatus: 'Implementing', sfHealth: 'Yellow', arr: 36740, software: 10280, monitoring: 26460, cvo: 0, licensing: 0, won: '2026-03-30', start: '2026-03-30', end: '2028-03-28', renewal: '2028-03-28', segment: 'EdTech', impl: true, verif: null },
    { id: 'meridiantechnologies', name: 'Meridian Technologies', platform: 'OEM', accountStatus: 'Launched', sfHealth: 'Red', arr: 38820, software: 32990, monitoring: 5830, cvo: 0, licensing: 0, won: '2024-11-05', start: '2024-11-05', end: '2027-11-04', renewal: '2027-11-04', segment: 'E-commerce', verif: [354, 301, 356, 333, 367] },
    { id: 'Cinder Works', name: 'Cinder Works', platform: 'Web App', accountStatus: 'Launched', sfHealth: 'Green', arr: 35260, software: 17510, monitoring: 17750, cvo: 0, licensing: 0, won: '2020-09-28', start: '2026-11-10', end: '2026-11-10', renewal: '2026-11-10', segment: 'MarTech', nd: true, verif: null },
    { id: 'dovetailtech', name: 'Dovetail Tech', platform: 'API', accountStatus: 'Launched', sfHealth: 'Green', arr: 17770, software: 11850, monitoring: 5920, cvo: 0, licensing: 0, won: '2022-09-05', start: '2026-09-04', end: '2026-09-04', renewal: '2026-09-04', segment: 'Fintech', nd: true, verif: null },
    { id: 'ospreyinteractive', name: 'Osprey Interactive', platform: 'OEM', accountStatus: 'Launched', sfHealth: 'Yellow', arr: 50240, software: 42660, monitoring: 7580, cvo: 0, licensing: 0, won: '2024-10-02', start: '2024-10-01', end: '2027-09-30', renewal: '2027-09-30', segment: 'Logistics Tech', nd: true, verif: null },
    { id: 'quillcloud', name: 'Quill Cloud', platform: 'OEM', accountStatus: 'Implementing', sfHealth: 'Green', arr: 52820, software: 35980, monitoring: 4800, cvo: 12040, licensing: 0, won: '2026-04-25', start: '2026-04-25', end: '2028-04-24', renewal: '2028-04-24', segment: 'E-commerce', impl: true, verif: null, note: 'No data in the analytics warehouse — flagged with the data team.' },
    { id: 'rowandynamics', name: 'Rowan Dynamics', platform: 'OEM', accountStatus: 'Launched', sfHealth: 'Green', arr: 55620, software: 27590, monitoring: 8760, cvo: 0, licensing: 19270, won: '2024-10-29', start: '2024-11-08', end: '2026-11-07', renewal: '2026-11-07', segment: 'Fintech', nd: true, verif: null },
    { id: 'tidewaterdataco', name: 'Tidewater Data Co', platform: 'OEM', accountStatus: 'Launched', sfHealth: 'Yellow', arr: 37340, software: 30280, monitoring: 7060, cvo: 0, licensing: 0, won: '2025-03-08', start: '2025-03-08', end: '2027-03-07', renewal: '2027-03-07', segment: 'Enterprise IT', nd: true, verif: null },
    { id: 'umbersystems', name: 'Umber Systems', platform: 'OEM', accountStatus: 'Implementing', sfHealth: 'Green', arr: 25500, software: 22120, monitoring: 3380, cvo: 0, licensing: 0, won: '2025-11-15', start: '2025-11-15', end: '2028-11-14', renewal: '2028-11-14', segment: 'Logistics Tech', impl: true, verif: null },
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
      c.sfdcUrl = c.sfdcUrl || ('https://example.lightning.force.com/lightning/r/Account/' + c.id + '/view');
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
  function applyThresholds(th) {
    const t = { decline: (th && th.declinePct) || 30, watch: (th && th.watchPct) || 25 };
    customers.forEach((c) => {
      c.status = deriveStatus(c, t);
      c.headline = computeHeadline(c, t);
      const pending = c.pendingTask || PENDING_TASK[c.id];
      if (!c.lastTouch && !pending) c.outreach = { state: (c.status === 'healthy' || c.impl || c.nd) ? 'none' : 'needed' };
    });
  }

  function publish(source) {
    SEGMENT.totalAccounts = customers.length;
    SEGMENT.windowLabel = MONTHS.length ? `${MONTHS[0]}–${MONTHS[MONTHS.length - 1]} 2026` : '';
    window.HEALTH = {
      MONTHS, SEGMENT, customers, STATUS, applyThresholds, loadFromFiles, dataSource: source,
      momPct, cumPct, fmtPct, fmtArr, fmtMoney, fmtUSD0, fmtUSDc, fmtAgo, fmtRenewal, renewalQuarter, daysUntil, trendColor, sum, avg, healthBand,
    };
  }

  // =====================================================================
  // LIVE DATA SOURCES
  // Point these at published Google Sheets (File → Share → Publish to web →
  // pick the tab → Comma-separated values (.csv)). The app fetches them on
  // load; editing the sheet + refreshing the dashboard updates everything.
  // Leave blank to use the bundled data/*.csv instead. Either way, if a fetch
  // fails the loader falls back to the local CSV, then to the embedded snapshot.
  // =====================================================================
  const SHEET_ACCOUNTS_URL = ''; // paste a published-CSV URL to go live
  // Second published sheet — account export that INCLUDES the "Customer Health" (Green/Yellow/Red)
  // column the first one lacks. Used to enrich each account's SF Health, joined by account name.
  const SHEET_HEALTH_URL = ''; // paste a published-CSV URL to go live
  // No real usage TIME-SERIES yet — month-by-month metrics come from the bundled file (sample).
  // When you have a the analytics warehouse export with columns [Account Name, Month, Active Users, Logins],
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

  // Salesforce "Customer Account Details" sheet → account objects (under-$50K OEM segment only)
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
      verif: colIndex(H, ['active_users', 'MAU volume', 'usage_volume', 'verifs']),
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
        active_users: ix.verif >= 0 ? _num(row[ix.verif]) : 0,
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
      const verif = m.length ? monthKeys.map((k) => { const row = m.find((x) => x.month === k); return row ? _num(row.active_users) : 0; }) : null;
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
