// Customer Health — dashboard overview
// Loaded as <script type="text/babel" src="lib/dashboard.jsx">

function Kpi({ value, label, sub, tone = 'neutral', icon, active, onClick }) {
  const tones = {
    neutral: { fg: V.black, accent: V.greyDark, bg: '#fff' },
    red: { fg: V.red, accent: V.red, bg: '#fff' },
    orange: { fg: V.orangeDark, accent: V.orange, bg: '#fff' },
    purple: { fg: V.purpleDark, accent: V.purple, bg: '#fff' },
  };
  const t = tones[tone] || tones.neutral;
  const [hover, setHover] = React.useState(false);
  const clickable = !!onClick;
  return (
    <div onClick={onClick} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} style={{
      flex: 1, minWidth: 0, background: t.bg,
      border: active ? `1.5px solid ${t.accent}` : `1px solid ${V.greyXLight}`,
      borderRadius: 8, padding: '16px 18px', boxShadow: (hover && clickable) ? V.shadow3 : V.shadow2,
      display: 'flex', flexDirection: 'column', gap: 6, cursor: clickable ? 'pointer' : 'default',
      transition: 'box-shadow 120ms ease', position: 'relative',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
        <Icon name={icon} size={15} color={t.accent} strokeWidth={2} />
        <span style={{ fontSize: 12, fontWeight: 600, color: V.greyDark, letterSpacing: '0.01em' }}>{label}</span>
        {clickable && <Icon name="filter" size={11} color={active ? t.accent : V.greyLight} style={{ marginLeft: 'auto' }} />}
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
        <span style={{ fontSize: 30, fontWeight: 700, color: t.fg, lineHeight: 1, letterSpacing: '-0.02em' }}>{value}</span>
        {sub && <span style={{ fontSize: 12, color: V.greyMed, fontWeight: 500 }}>{sub}</span>}
      </div>
    </div>
  );
}

function CsmTag({ csm }) {
  const unassigned = csm === 'Unassigned';
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 600, color: unassigned ? V.greyMed : V.purpleDark, background: unassigned ? V.greyXLight : V.purpleLight, padding: '2px 8px', borderRadius: 64, whiteSpace: 'nowrap' }}>
      <Icon name="users" size={10} color={unassigned ? V.greyMed : V.purpleDark} />{csm === 'Unassigned' ? 'Unassigned' : csm.split(' ')[0]}
    </span>
  );
}

const RANGE_PRESETS = [
  { label: 'Jan – May 2026', s: 0, e: 4 },
  { label: 'Feb – May 2026', s: 1, e: 4 },
  { label: 'Mar – May 2026', s: 2, e: 4 },
  { label: 'Apr – May 2026', s: 3, e: 4 },
];
function sliceVals(c, range) {
  const H = window.HEALTH;
  const v = c.verif.slice(range[0], range[1] + 1), l = c.logins.slice(range[0], range[1] + 1);
  return { v, l, vMom: v.length >= 2 ? H.momPct(v) : null, lMom: l.length >= 2 ? H.momPct(l) : null, vCum: H.cumPct(v) };
}
function DateRangeMenu({ idx, setIdx }) {
  const [open, setOpen] = React.useState(false);
  return (
    <div style={{ position: 'relative' }}>
      <button onClick={() => setOpen((o) => !o)} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, height: 26, padding: '0 10px', borderRadius: 4, border: `1px solid ${V.greyLight}`, background: '#fff', fontSize: 12.5, fontWeight: 500, color: V.black, cursor: 'pointer', fontFamily: V.font }}>
        <Icon name="calendar" size={13} color={V.greyDark} />{RANGE_PRESETS[idx].label}<Icon name="chevronDown" size={12} color={V.greyDark} />
      </button>
      {open && (
        <div style={{ position: 'absolute', top: 32, left: 0, zIndex: 20, background: '#fff', border: `1px solid ${V.greyLight}`, borderRadius: 6, boxShadow: V.shadow3, overflow: 'hidden', minWidth: 168 }}>
          {RANGE_PRESETS.map((p, i) => (
            <div key={i} onClick={() => { setIdx(i); setOpen(false); }} style={{ padding: '8px 12px', fontSize: 13, cursor: 'pointer', background: i === idx ? V.greyBg : '#fff', color: i === idx ? V.black : V.greyDark, fontWeight: i === idx ? 600 : 400 }}>{p.label}</div>
          ))}
        </div>
      )}
    </div>
  );
}

function WorklistItem({ c, onSelect, range }) {
  const H = window.HEALTH;
  const [hover, setHover] = React.useState(false);
  const dens = densityOf(useTweakCtx().density);
  const sv = sliceVals(c, range);
  const s = H.STATUS[c.status];
  const near = c.renewalDays <= 45;
  const mobile = useMobile();
  return (
    <div
      onClick={() => onSelect(c)}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{
        display: 'flex', alignItems: 'stretch', gap: 0, cursor: 'pointer',
        background: hover ? V.greyBgLight : '#fff',
        border: `1px solid ${V.greyXLight}`, borderRadius: 8, overflow: 'hidden',
        boxShadow: hover ? V.shadow2 : 'none', transition: 'box-shadow 120ms ease',
      }}>
      <div style={{ width: 4, background: s.dot, flexShrink: 0 }} />
      <div style={{ flex: 1, minWidth: 0, padding: dens.wlPad }}>
        {/* row 1: identity + metrics */}
        <div style={{ display: 'flex', alignItems: 'center', gap: mobile ? 10 : 14, minWidth: 0, flexWrap: mobile ? 'wrap' : 'nowrap' }}>
          <div style={{ flexShrink: 0 }}><StatusPill status={c.status} size="sm" /></div>
          <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <span style={{ fontSize: 15, fontWeight: 600, color: V.black, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.name}</span>
            <span style={{ fontSize: 12, color: V.greyMed, whiteSpace: 'nowrap', flexShrink: 0 }}>{c.segment}</span>
            <span style={{ flexShrink: 0 }}><CsmTag csm={c.csm} /></span>
          </div>
          <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 3 }}>
            <span style={{ fontSize: 9.5, fontWeight: 600, color: V.greyMed, textTransform: 'uppercase', letterSpacing: '0.04em' }}>MAU volume · MoM</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Sparkline data={sv.v} color={H.trendColor(c.status)} width={84} height={26} />
              <span style={{ width: 50, display: 'inline-flex', alignItems: 'center', gap: 4 }}><Delta pct={sv.vMom} size={12} /></span>
            </div>
          </div>
          <div style={{ flexShrink: 0, width: 1, alignSelf: 'stretch', background: V.greyXLight, margin: '2px 0', display: mobile ? 'none' : 'block' }} />
          <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 3 }}>
            <span style={{ fontSize: 9.5, fontWeight: 600, color: V.greyMed, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Logins · MoM</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Sparkline data={sv.l} color={H.trendColor(c.status)} width={64} height={26} />
              <span style={{ width: 50, display: 'inline-flex', alignItems: 'center', gap: 4 }}><Delta pct={sv.lMom} size={12} /></span>
            </div>
          </div>
          <div style={{ flexShrink: 0, width: 118, textAlign: 'right' }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: V.black }}>{H.fmtArr(c.arr)}</span>
            <span style={{ fontSize: 11, color: near ? V.orangeDark : V.greyMed, fontWeight: near ? 600 : 400 }}> · {near ? `${c.renewalDays}d` : H.fmtRenewal(c.renewal)}</span>
          </div>
          <div style={{ flexShrink: 0 }}><Button kind="secondary" size="sm" iconRight="arrowRight">Review</Button></div>
        </div>
        {/* row 2: reason + last touch */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 7, paddingLeft: 2 }}>
          <div style={{ flex: 1, minWidth: 0, fontSize: 13, lineHeight: '18px', color: V.greyDark, textWrap: 'pretty' }}>{c.headline}</div>
          <div style={{ flexShrink: 0 }}><OutreachStatus c={c} /></div>
        </div>
      </div>
    </div>
  );
}

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'stall', label: 'Stalled' },
  { key: 'risk', label: 'At Risk' },
  { key: 'watch', label: 'Watch' },
  { key: 'upsell', label: 'Upsell' },
  { key: 'healthy', label: 'Healthy' },
  { key: 'onboarding', label: 'Onboarding' },
  { key: 'nodata', label: 'No data' },
];

function Th({ children, sortable, active, dir, onClick, align = 'left', width }) {
  return (
    <th
      onClick={sortable ? onClick : undefined}
      style={{
        textAlign: align, padding: '0 14px', height: 38, width,
        fontSize: 11, fontWeight: 600, color: active ? V.black : V.greyDark,
        textTransform: 'uppercase', letterSpacing: '0.04em', whiteSpace: 'nowrap',
        cursor: sortable ? 'pointer' : 'default', userSelect: 'none',
        borderBottom: `1px solid ${V.greyXLight}`, background: V.greyBg,
      }}>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, justifyContent: align === 'right' ? 'flex-end' : 'flex-start' }}>
        {children}
        {sortable && <Icon name={active ? (dir === 'asc' ? 'chevronUp' : 'chevronDown') : 'chevronDown'} size={12} color={active ? V.black : V.greyLight} />}
      </span>
    </th>
  );
}

function AccountsTable({ rows, onSelect, range }) {
  const H = window.HEALTH;
  const [sortKey, setSortKey] = React.useState('status');
  const [dir, setDir] = React.useState('asc');
  const setSort = (k) => {
    if (sortKey === k) setDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortKey(k); setDir(k === 'name' ? 'asc' : 'desc'); }
  };
  const val = (c, k) => ({
    name: c.name.toLowerCase(), status: H.STATUS[c.status].rank,
    arr: c.arr, verif: c.verifMom ?? 999, login: c.loginMom ?? 999,
    cum: c.verifCum, renewal: c.renewalDays, csm: c.csm === 'Unassigned' ? 'zzz' : c.csm.toLowerCase(),
    touch: c.touchDays == null ? 1e9 : c.touchDays,
  }[k]);
  const sorted = [...rows].sort((a, b) => {
    const av = val(a, sortKey), bv = val(b, sortKey);
    const cmp = av < bv ? -1 : av > bv ? 1 : 0;
    return dir === 'asc' ? cmp : -cmp;
  });

  return (
    <div style={{ border: `1px solid ${V.greyXLight}`, borderRadius: 8, overflow: 'hidden', background: '#fff', boxShadow: V.shadow2 }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: V.font }}>
        <thead>
          <tr>
            <Th sortable active={sortKey === 'name'} dir={dir} onClick={() => setSort('name')}>Account</Th>
            <Th sortable active={sortKey === 'csm'} dir={dir} onClick={() => setSort('csm')} width={120}>CSM</Th>
            <Th sortable active={sortKey === 'status'} dir={dir} onClick={() => setSort('status')} width={104}>Status</Th>
            <Th sortable active={sortKey === 'arr'} dir={dir} onClick={() => setSort('arr')} align="right" width={84}>ARR</Th>
            <Th sortable active={sortKey === 'verif'} dir={dir} onClick={() => setSort('verif')} width={148}>Active Users</Th>
            <Th sortable active={sortKey === 'login'} dir={dir} onClick={() => setSort('login')} width={140}>Logins</Th>
            <Th sortable active={sortKey === 'cum'} dir={dir} onClick={() => setSort('cum')} align="right" width={92}>Since {H.MONTHS[range[0]]}</Th>
            <Th sortable active={sortKey === 'touch'} dir={dir} onClick={() => setSort('touch')} width={158}>Outreach</Th>
            <Th sortable active={sortKey === 'renewal'} dir={dir} onClick={() => setSort('renewal')} width={116}>Renewal</Th>
            <Th width={36}></Th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((c, i) => <AccountRow key={c.id} c={c} last={i === sorted.length - 1} onSelect={onSelect} range={range} />)}
        </tbody>
      </table>
    </div>
  );
}

function AccountRow({ c, last, onSelect, range }) {
  const H = window.HEALTH;
  const { overrides } = useOverrides();
  const muted = overrides[c.id] === 'noaction';
  const [hover, setHover] = React.useState(false);
  const dens = densityOf(useTweakCtx().density);
  const sv = sliceVals(c, range);
  const near = c.renewalDays <= 45;
  const border = last ? 'none' : `1px solid ${V.greyXLight}`;
  const td = { padding: dens.rowPad, borderBottom: border, fontSize: 14, color: V.greyDark, verticalAlign: 'middle' };
  return (
    <tr onClick={() => onSelect(c)} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{ background: hover ? V.greyBgLight : '#fff', cursor: 'pointer' }}>
      <td style={{ ...td }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: V.black, lineHeight: 1.2 }}>{c.name}</div>
        <div style={{ fontSize: 12, color: V.greyMed, marginTop: 2 }}>{c.segment}</div>
      </td>
      <td style={td}><CsmTag csm={c.csm} /></td>
      <td style={td}>{muted ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 600, color: V.greyDark, background: V.greyXLight, padding: '3px 9px', borderRadius: 64 }}><Icon name="check" size={11} color={V.greyDark} strokeWidth={2.5} />Override</span> : <StatusPill status={c.status} size="sm" />}</td>
      <td style={{ ...td, textAlign: 'right', fontWeight: 600, color: V.black }}>{H.fmtArr(c.arr)}</td>
      <td style={td}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Sparkline data={sv.v} color={H.trendColor(c.status)} width={68} height={26} />
          <Delta pct={sv.vMom} size={13} />
        </div>
      </td>
      <td style={td}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Sparkline data={sv.l} color={H.trendColor(c.status)} width={56} height={26} />
          <Delta pct={sv.lMom} size={13} />
        </div>
      </td>
      <td style={{ ...td, textAlign: 'right' }}><Delta pct={sv.vCum} size={13} /></td>
      <td style={td}>
        <OutreachStatus c={c} />
        {c.lastTouch && dens.sumLine && <div style={{ fontSize: 11, color: V.greyMed, marginTop: 4, maxWidth: 168, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.lastTouch.summary}</div>}
      </td>
      <td style={td}>
        <div style={{ fontSize: 13, color: V.greyDark }}>{H.fmtRenewal(c.renewal)}</div>
        {near && <div style={{ fontSize: 11, color: V.orangeDark, fontWeight: 600, marginTop: 2 }}>{c.renewalDays}d away</div>}
      </td>
      <td style={{ ...td, textAlign: 'right' }}><Icon name="chevronRight" size={16} color={hover ? V.greyDark : V.greyLight} /></td>
    </tr>
  );
}

function exportCsv(rows, H) {
  const cols = ['Account', 'Segment', 'CSM', 'Status', 'SF Health', 'ARR', 'MAU MoM', 'Login MoM', 'Since baseline', 'Open tickets', 'Renewal'];
  const cell = (v) => { const s = String(v == null ? '' : v); return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; };
  const lines = [cols.join(',')];
  rows.forEach((c) => { lines.push([c.name, c.segment, c.csm, H.STATUS[c.status].label, c.sfHealth, c.arr, H.fmtPct(c.verifMom), H.fmtPct(c.loginMom), H.fmtPct(c.verifCum), c.tickets, H.fmtRenewal(c.renewal)].map(cell).join(',')); });
  const blob = new Blob([lines.join('\n')], { type: 'text/csv' });
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'customer-health.csv'; a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

function Dashboard({ onSelect }) {
  const H = window.HEALTH;
  const all = H.customers;
  const { overrides } = useOverrides();
  const [filter, setFilter] = React.useState('all');
  const [query, setQuery] = React.useState('');
  const [rangeIdx, setRangeIdx] = React.useState(0);
  const [csm, setCsm] = React.useState('all');
  const [renewal, setRenewal] = React.useState('all');
  const [custSel, setCustSel] = React.useState([]);
  const [segSel, setSegSel] = React.useState([]);
  const [tierSel, setTierSel] = React.useState([]);
  const [alertsOpen, setAlertsOpen] = React.useState(false);
  const range = [RANGE_PRESETS[rangeIdx].s, RANGE_PRESETS[rangeIdx].e];

  const muted = (c) => overrides[c.id] === 'noaction';
  // CSM + renewal scope applies everywhere on the page
  const inScope = (c) => (csm === 'all' || c.csm === csm) && (renewal === 'all' || c.renewalQuarter.key === renewal) && (tierSel.length === 0 || tierSel.indexOf(c.tier) >= 0) && (segSel.length === 0 || segSel.indexOf(c.segment) >= 0) && (custSel.length === 0 || custSel.indexOf(c.id) >= 0);
  const scoped = all.filter(inScope);

  const count = (st) => scoped.filter((c) => c.status === st && !muted(c)).length;
  const arrSum = (sts) => scoped.filter((c) => sts.includes(c.status) && !muted(c)).reduce((a, c) => a + c.arr, 0);

  const FLAGGED = ['stall', 'risk', 'watch', 'upsell'];
  const flagged = scoped.filter((c) => FLAGGED.includes(c.status) && !muted(c))
    .sort((a, b) => (H.STATUS[a.status].rank - H.STATUS[b.status].rank) || (a.verifMom ?? 0) - (b.verifMom ?? 0));
  const mutedCount = scoped.filter((c) => FLAGGED.includes(c.status) && muted(c)).length;

  const tableRows = scoped.filter((c) => (filter === 'all' || c.status === filter) && c.name.toLowerCase().includes(query.toLowerCase()));

  // CSM + renewal options
  const csmNames = Array.from(new Set(all.map((c) => c.csm))).sort((a, b) => a === 'Unassigned' ? 1 : b === 'Unassigned' ? -1 : a.localeCompare(b));
  const csmOptions = [{ key: 'all', label: 'All CSMs', count: all.length }, ...csmNames.map((n) => ({ key: n, label: n, count: all.filter((c) => c.csm === n).length }))];
  const qtrKeys = Array.from(new Set(all.map((c) => c.renewalQuarter.key))).sort();
  const renewalOptions = [{ key: 'all', label: 'Any time', count: all.length }, ...qtrKeys.map((k) => { const c0 = all.find((c) => c.renewalQuarter.key === k); return { key: k, label: c0.renewalQuarter.label, count: all.filter((c) => c.renewalQuarter.key === k).length }; })];
  const custOptions = all.slice().sort((a, b) => a.name.localeCompare(b.name)).map((c) => ({ key: c.id, label: c.name }));
  const segOptions = Array.from(new Set(all.map((c) => c.segment).filter(Boolean))).sort().map((s) => ({ key: s, label: s }));
  const TIER_ORDER = ['Enterprise', 'Mid-Market', 'Scaled'];
  const tierOptions = TIER_ORDER.filter((t) => all.some((c) => c.tier === t)).map((t) => ({ key: t, label: t, count: all.filter((c) => c.tier === t).length }));

  return (
    <main style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'transparent', overflow: 'hidden', minWidth: 0 }}>
      {/* header */}
      <header style={{ padding: '18px 32px 16px', background: '#fff', borderBottom: `1px solid ${V.greyXLight}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, fontSize: 12, color: V.greyMed }}>
          <span>Customer Success</span><Icon name="chevronRight" size={12} color={V.greyLight} /><span style={{ color: V.greyDark }}>Customer Health</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
          <div>
            <h2 style={{ fontSize: 26, fontWeight: 700, color: V.black, margin: 0, letterSpacing: '-0.02em' }}>Customer Health</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 8, flexWrap: 'wrap' }}>
              <FilterMenu icon="users" label="CSM: " value={csm} options={csmOptions} onChange={setCsm} />
              <MultiSelectMenu icon="briefcase" label="Tier: " options={tierOptions} selected={tierSel} onChange={setTierSel} width={200} />
              <MultiSelectMenu icon="grid" label="Segment: " options={segOptions} selected={segSel} onChange={setSegSel} width={260} />
              <MultiSelectMenu icon="briefcase" label="Customers: " options={custOptions} selected={custSel} onChange={setCustSel} />
              <FilterMenu icon="calendar" label="Renews: " value={renewal} options={renewalOptions} onChange={setRenewal} width={150} />
              <DateRangeMenu idx={rangeIdx} setIdx={setRangeIdx} />
              {(csm !== 'all' || renewal !== 'all' || tierSel.length || segSel.length || custSel.length) ? (
                <button onClick={() => { setCsm('all'); setRenewal('all'); setTierSel([]); setSegSel([]); setCustSel([]); }}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6, height: 32, padding: '0 11px', borderRadius: 4, border: 'none', background: 'transparent', color: V.blue, fontSize: 12.5, fontWeight: 600, cursor: 'pointer', fontFamily: V.font }}>
                  <Icon name="close" size={13} color={V.blue} />Clear filters
                </button>
              ) : null}
              <span style={{ fontSize: 12, color: V.greyMed, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: /live sheet/.test(H.dataSource || '') ? V.green : V.greyMed }} />
                {/live sheet/.test(H.dataSource || '') ? 'Live · Google Sheet' : 'Local data'} · synced just now
              </span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <Button kind="secondary" size="md" icon="bell" onClick={() => setAlertsOpen(true)}>Configure Alerts</Button>
            <Button kind="secondary" size="md" icon="download" onClick={() => exportCsv(tableRows, H)}>Export</Button>
          </div>
        </div>
      </header>

      <div style={{ flex: 1, overflow: 'auto', padding: '24px 32px 48px' }}>
        {/* KPI strip */}
        <div style={{ display: 'flex', gap: 14, marginBottom: 28 }}>
          <Kpi icon="users" tone="neutral" value={scoped.length} label="In view" sub={csm === 'all' ? '0 CSM coverage' : csm} />
          <Kpi icon="octagon" tone="red" value={count('stall')} label="Stalled" sub={`${H.fmtMoney(arrSum(['stall']))} ARR`} active={filter === 'stall'} onClick={() => setFilter(filter === 'stall' ? 'all' : 'stall')} />
          <Kpi icon="trendingDown" tone="red" value={count('risk')} label="At Risk" sub={`${H.fmtMoney(arrSum(['risk']))} ARR`} active={filter === 'risk'} onClick={() => setFilter(filter === 'risk' ? 'all' : 'risk')} />
          <Kpi icon="alert" tone="orange" value={count('watch')} label="Watch" sub={`${H.fmtMoney(arrSum(['watch']))} ARR`} active={filter === 'watch'} onClick={() => setFilter(filter === 'watch' ? 'all' : 'watch')} />
          <Kpi icon="trendingUp" tone="purple" value={count('upsell')} label="Upsell" sub={`${H.fmtMoney(arrSum(['upsell']))} ARR`} active={filter === 'upsell'} onClick={() => setFilter(filter === 'upsell' ? 'all' : 'upsell')} />
        </div>

        {/* worklist */}
        <SectionHeading title="Needs attention" count={flagged.length} hint={mutedCount > 0 ? `Ranked by severity. ${mutedCount} ${mutedCount === 1 ? 'account is' : 'accounts are'} hidden by a CSM “no action needed” override.` : 'Ranked by severity. These accounts have crossed a trigger threshold.'} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 32 }}>
          {flagged.length === 0 && <div style={{ padding: '22px', textAlign: 'center', fontSize: 13, color: V.greyMed, background: '#fff', border: `1px solid ${V.greyXLight}`, borderRadius: 8 }}>No accounts need attention in this view.</div>}
          {flagged.map((c) => <WorklistItem key={c.id} c={c} onSelect={onSelect} range={range} />)}
        </div>

        {/* all accounts */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, flexWrap: 'wrap', gap: 12 }}>
          <SectionHeading title="All accounts" count={`${tableRows.length} of ${scoped.length}`} inline />
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, height: 32, padding: '0 10px', background: '#fff', border: `1px solid ${V.greyLight}`, borderRadius: 4, width: 200 }}>
              <Icon name="search" size={14} color={V.greyMed} />
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search accounts"
                style={{ border: 0, outline: 'none', flex: 1, fontSize: 13, fontFamily: V.font, color: V.black, background: 'transparent' }} />
            </div>
            <div style={{ display: 'flex', gap: 2, background: V.greyXLight, padding: 2, borderRadius: 6 }}>
              {FILTERS.map((f) => (
                <button key={f.key} onClick={() => setFilter(f.key)} style={{
                  border: 0, cursor: 'pointer', borderRadius: 4, padding: '5px 11px', fontSize: 12.5, fontWeight: 600, fontFamily: V.font,
                  background: filter === f.key ? '#fff' : 'transparent', color: filter === f.key ? V.black : V.greyDark,
                  boxShadow: filter === f.key ? V.shadow1 : 'none',
                }}>{f.label}</button>
              ))}
            </div>
          </div>
        </div>
        <AccountsTable rows={tableRows} onSelect={onSelect} range={range} />
        <div style={{ marginTop: 14, fontSize: 12, color: V.greyMed, textAlign: 'center' }}>
          Showing a representative slice of the segment. Full population ({H.SEGMENT.totalAccounts} accounts) loads once the metrics pipeline is live — see Build Plan.
        </div>
      </div>
      {alertsOpen && <AlertSettings onClose={() => setAlertsOpen(false)} />}
    </main>
  );
}

function Pill({ label, icon }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, height: 26, padding: '0 10px', borderRadius: 4, border: `1px solid ${V.greyLight}`, background: '#fff', fontSize: 12.5, fontWeight: 500, color: V.black }}>
      {icon && <Icon name={icon} size={13} color={V.greyDark} />}
      {label}
    </span>
  );
}

function SectionHeading({ title, count, hint, inline }) {
  return (
    <div style={{ marginBottom: inline ? 0 : 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <h3 style={{ fontSize: 17, fontWeight: 700, color: V.black, margin: 0 }}>{title}</h3>
        {count !== undefined && <span style={{ fontSize: 13, fontWeight: 600, color: V.greyMed, background: V.greyXLight, padding: '2px 9px', borderRadius: 64 }}>{count}</span>}
      </div>
      {hint && <div style={{ fontSize: 12.5, color: V.greyMed, marginTop: 5 }}>{hint}</div>}
    </div>
  );
}

Object.assign(window, { Dashboard, CsmTag });
