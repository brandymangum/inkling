// Customer Health — dashboard overview
// Loaded as <script type="text/babel" src="lib/dashboard.jsx">

function Kpi({ value, label, sub, tone = 'neutral', icon, active, onClick }) {
  const tones = {
    neutral: { fg: V.black, accent: V.greyDark, bg: V.white },
    red: { fg: V.red, accent: V.red, bg: V.white },
    orange: { fg: V.orangeDark, accent: V.orange, bg: V.white },
    purple: { fg: V.purpleDark, accent: V.purple, bg: V.white },
  };
  const t = tones[tone] || tones.neutral;
  const [hover, setHover] = React.useState(false);
  const clickable = !!onClick;
  // Subtle brand/state hint on hover — neutral tiles hint brand green, toned tiles hint their own color.
  const hoverAccent = tone === 'neutral' ? V.green : t.accent;
  const borderColor = active ? t.accent : (hover && clickable ? hoverAccent : V.greyXLight);
  return (
    <div onClick={onClick} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} style={{
      flex: '1 1 160px', minWidth: 0, background: t.bg,
      border: active ? `1.5px solid ${t.accent}` : `${(hover && clickable) ? 1.5 : 1}px solid ${borderColor}`,
      borderRadius: 8, padding: '16px 18px', boxShadow: (hover && clickable) ? V.shadow3 : V.shadow2,
      display: 'flex', flexDirection: 'column', gap: 6, cursor: clickable ? 'pointer' : 'default',
      transition: 'box-shadow 120ms ease, border-color 120ms ease', position: 'relative',
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
      <button onClick={() => setOpen((o) => !o)} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, height: 26, padding: '0 10px', borderRadius: 4, border: `1px solid ${V.greyLight}`, background: V.white, fontSize: 12.5, fontWeight: 500, color: V.black, cursor: 'pointer', fontFamily: V.font }}>
        <Icon name="calendar" size={13} color={V.greyDark} />{RANGE_PRESETS[idx].label}<Icon name="chevronDown" size={12} color={V.greyDark} />
      </button>
      {open && (
        <div style={{ position: 'absolute', top: 32, left: 0, zIndex: 20, background: V.white, border: `1px solid ${V.greyLight}`, borderRadius: 6, boxShadow: V.shadow3, overflow: 'hidden', minWidth: 168 }}>
          {RANGE_PRESETS.map((p, i) => (
            <div key={i} onClick={() => { setIdx(i); setOpen(false); }} style={{ padding: '8px 12px', fontSize: 13, cursor: 'pointer', background: i === idx ? V.greyBg : V.white, color: i === idx ? V.black : V.greyDark, fontWeight: i === idx ? 600 : 400 }}>{p.label}</div>
          ))}
        </div>
      )}
    </div>
  );
}

function WorklistItem({ c, onSelect, range, followUp, onMarkOutreach }) {
  const H = window.HEALTH;
  const [hover, setHover] = React.useState(false);
  const dens = densityOf(useTweakCtx().density);
  const sv = sliceVals(c, range);
  const s = H.STATUS[c.status];
  const near = c.renewalDays <= 45;
  const muteMetrics = !!followUp;
  return (
    <div
      onClick={() => onSelect(c)}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{
        display: 'flex', alignItems: 'stretch', gap: 0, cursor: 'pointer',
        background: hover ? V.greyBgLight : V.white,
        border: `1px solid ${V.greyXLight}`, borderRadius: 8, overflow: 'hidden',
        boxShadow: hover ? V.shadow2 : 'none', transition: 'box-shadow 120ms ease',
      }}>
      <div style={{ width: 4, background: s.dot, flexShrink: 0 }} />
      <div style={{ flex: 1, minWidth: 0, padding: dens.wlPad }}>
        {/* row 1: identity + metrics */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0, flexWrap: 'wrap', rowGap: 10 }}>
          <div style={{ flexShrink: 0 }}><StatusPill status={c.status} size="sm" /></div>
          <div style={{ flex: 1, minWidth: 180, display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <span style={{ fontSize: 15, fontWeight: 600, color: V.black, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.name}</span>
            <span style={{ fontSize: 12, color: V.greyMed, whiteSpace: 'nowrap', flexShrink: 0 }}>{c.segment}</span>
            <span style={{ flexShrink: 0 }}><CsmTag csm={c.csm} /></span>
          </div>
          <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 14 }}>
            <span style={{ fontSize: 13, color: V.greyDark, whiteSpace: 'nowrap' }}>
              <span style={{ fontWeight: 700, color: V.black }}>{H.fmtArr(c.arr)}</span> ARR · <span style={{ color: near ? V.orangeDark : V.greyMed, fontWeight: near ? 600 : 400 }}>{near ? `renews ${c.renewalDays}d` : `renews ${H.fmtRenewal(c.renewal)}`}</span>
            </span>
            <div style={{ width: 150, display: 'flex', justifyContent: 'flex-end', flexShrink: 0 }}>
              <Button kind="secondary" size="sm" iconRight="arrowRight">Account details</Button>
            </div>
          </div>
        </div>
        {/* row 2: reason + metrics + action */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, marginTop: 7, paddingLeft: 2, flexWrap: 'wrap', rowGap: 8 }}>
          <div style={{ flex: 1, minWidth: 200, fontSize: 13, lineHeight: '18px', color: V.greyDark, textWrap: 'pretty' }}>{c.headline}</div>
          <div style={{ flexShrink: 0, marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, opacity: muteMetrics ? 0.5 : 1 }}>
              <span style={{ fontSize: 12, color: V.greyMed, display: 'inline-flex', alignItems: 'center', gap: 5, whiteSpace: 'nowrap' }}>Logins <Delta pct={sv.vMom} size={12} /></span>
              <span style={{ fontSize: 12, color: V.greyMed, display: 'inline-flex', alignItems: 'center', gap: 5, whiteSpace: 'nowrap' }}>Active users <Delta pct={sv.lMom} size={12} /></span>
            </div>
            <div style={{ width: 150, display: 'flex', justifyContent: 'flex-end', flexShrink: 0 }}>
              {onMarkOutreach && (
                <span onClick={(e) => e.stopPropagation()}>
                  <Button kind="ghost" size="sm" icon="check2" onClick={onMarkOutreach}>Log outreach</Button>
                </span>
              )}
            </div>
          </div>
        </div>
        {/* row 3: follow-up tracking (only for In-follow-up bucket) */}
        {followUp && (
          <div onClick={(e) => e.stopPropagation()} style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 8, paddingTop: 8, paddingLeft: 2, borderTop: `1px dashed ${V.greyXLight}`, flexWrap: 'wrap', cursor: 'default' }}>
            <Icon name={followUp.overdue ? 'alert' : 'clock'} size={13} color={followUp.overdue ? V.orangeDark : V.greyMed} strokeWidth={1.9} />
            <span style={{ fontSize: 12.5, color: V.greyDark }}>{followUp.reached}</span>
            <span style={{ fontSize: 12.5, color: V.greyLight }}>·</span>
            <span style={{ fontSize: 12.5, fontWeight: followUp.overdue ? 700 : 500, color: followUp.overdue ? V.orangeDark : V.greyDark }}>{followUp.fuText}</span>
            {followUp.playbook && <Chip tone="grey" icon="fileText">{followUp.playbook}</Chip>}
            {followUp.editing ? (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                {[['+7d', 7], ['+14d', 14], ['+30d', 30]].map(([lbl, d]) => (
                  <button key={lbl} onClick={() => followUp.onSetDays(d)} style={{ border: `1px solid ${V.greyLight}`, background: V.white, borderRadius: 4, padding: '3px 8px', fontSize: 11.5, fontWeight: 600, color: V.greyDark, cursor: 'pointer', fontFamily: V.font }}>{lbl}</button>
                ))}
                <input type="date" defaultValue={followUp.due || ''} onChange={(e) => e.target.value && followUp.onSetDate(e.target.value)}
                  style={{ height: 26, padding: '0 6px', fontSize: 12, fontFamily: V.font, color: V.black, border: `1px solid ${V.greyLight}`, borderRadius: 4 }} />
                <button onClick={followUp.onCancel} style={{ background: 'transparent', border: 0, cursor: 'pointer', fontSize: 12, color: V.greyMed, fontFamily: V.font }}>Cancel</button>
              </span>
            ) : (
              <button onClick={followUp.onEdit} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: 'transparent', border: 0, cursor: 'pointer', padding: 0, fontSize: 12, fontWeight: 600, color: V.blue, fontFamily: V.font }}>
                <Icon name="calendar" size={12} color={V.blue} />Set follow-up
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// A labeled worklist bucket — clear title, count, ARR-at-stake, and a one-line
// "what this means" so CSMs and leadership read it the same way. Optionally
// collapsible (used for the Recovered wins list).
function WorklistBucket({ accent, title, desc, count, arrValue, children, collapsible, defaultOpen = true }) {
  const H = window.HEALTH;
  const [open, setOpen] = React.useState(defaultOpen);
  return (
    <div style={{ marginBottom: 26 }}>
      <div onClick={() => collapsible && setOpen((o) => !o)} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4, cursor: collapsible ? 'pointer' : 'default' }}>
        <span style={{ width: 10, height: 10, borderRadius: 3, background: accent, flexShrink: 0 }} />
        <span style={{ fontSize: 15, fontWeight: 700, color: V.black }}>{title}</span>
        <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minWidth: 20, height: 20, padding: '0 6px', borderRadius: 10, background: V.greyXLight, fontSize: 12, fontWeight: 700, color: V.greyDark }}>{count}</span>
        {arrValue != null && count > 0 && <span style={{ fontSize: 12.5, color: V.greyMed }}>· <strong style={{ color: V.greyDark }}>{H.fmtMoney(arrValue)}</strong> annual ARR at stake</span>}
        <span style={{ flex: 1 }} />
        {collapsible && <Icon name={open ? 'chevronDown' : 'chevronRight'} size={15} color={V.greyMed} />}
      </div>
      <div style={{ fontSize: 12.5, color: V.greyMed, marginBottom: 12, paddingLeft: 20, lineHeight: '17px' }}>{desc}</div>
      {open && <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>{children}</div>}
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
    <div style={{ border: `1px solid ${V.greyXLight}`, borderRadius: 8, overflowX: 'auto', overflowY: 'hidden', background: V.white, boxShadow: V.shadow2 }}>
      <table style={{ width: '100%', minWidth: 720, borderCollapse: 'collapse', fontFamily: V.font }}>
        <thead>
          <tr>
            <Th sortable active={sortKey === 'name'} dir={dir} onClick={() => setSort('name')}>Account</Th>
            <Th sortable active={sortKey === 'csm'} dir={dir} onClick={() => setSort('csm')} width={120}>CSM</Th>
            <Th sortable active={sortKey === 'status'} dir={dir} onClick={() => setSort('status')} width={104}>Status</Th>
            <Th sortable active={sortKey === 'arr'} dir={dir} onClick={() => setSort('arr')} align="right" width={84}>ARR</Th>
            <Th sortable active={sortKey === 'verif'} dir={dir} onClick={() => setSort('verif')} width={148}>Logins</Th>
            <Th sortable active={sortKey === 'login'} dir={dir} onClick={() => setSort('login')} width={140}>Active users</Th>
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
      style={{ background: hover ? V.greyBgLight : V.white, cursor: 'pointer' }}>
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
  const cols = ['Account', 'Segment', 'CSM', 'Status', 'CRM Health', 'ARR', 'Verif MoM', 'Login MoM', 'Since baseline', 'Open tickets', 'Renewal'];
  const cell = (v) => { const s = String(v == null ? '' : v); return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; };
  const lines = [cols.join(',')];
  rows.forEach((c) => { lines.push([c.name, c.segment, c.csm, H.STATUS[c.status].label, c.sfHealth, c.arr, H.fmtPct(c.verifMom), H.fmtPct(c.loginMom), H.fmtPct(c.verifCum), c.tickets, H.fmtRenewal(c.renewal)].map(cell).join(',')); });
  const blob = new Blob([lines.join('\n')], { type: 'text/csv' });
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'customer-health.csv'; a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

function Dashboard({ onSelect, role, declinePct, watchPct, setThreshold, dataLoadedAt }) {
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
  // Follow-up tracking: per-account custom follow-up date (default = outreach + 30d).
  const [followups, setFollowups] = React.useState(() => { try { return JSON.parse(localStorage.getItem('cc_followups') || '{}'); } catch (e) { return {}; } });
  const [editingFU, setEditingFU] = React.useState(null);
  const [, setTick] = React.useState(0);
  const [marking, setMarking] = React.useState(null);
  const markOutreach = (c) => { if (H.logOutreach) H.logOutreach(c.id, '2026-06-11', 'Riley', 'Logged from Customer Health'); setTick((t) => t + 1); };
  // Re-derive buckets once data + outreach overrides finish loading (in-place
  // mutations from applyOutreachOverrides don't trigger a React re-render on
  // their own), so an account that's been worked lands in the right bucket on load.
  React.useEffect(() => {
    const onLoaded = () => setTick((t) => t + 1);
    document.addEventListener('health:loaded', onLoaded);
    return () => document.removeEventListener('health:loaded', onLoaded);
  }, []);
  const saveFollowup = (id, date) => setFollowups((prev) => { const next = { ...prev }; if (date) next[id] = date; else delete next[id]; try { localStorage.setItem('cc_followups', JSON.stringify(next)); } catch (e) {} return next; });
  const TODAY = new Date('2026-06-11');
  const followUpDue = (c) => {
    if (followups[c.id]) return followups[c.id];
    const base = (c.outreach && c.outreach.date) || (c.lastTouch && c.lastTouch.date);
    if (!base) return null;
    const d = new Date(base); d.setDate(d.getDate() + 30); return d.toISOString().slice(0, 10);
  };
  const fmtDay = (iso) => new Date(iso).toLocaleString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
  const range = [RANGE_PRESETS[rangeIdx].s, RANGE_PRESETS[rangeIdx].e];

  const muted = (c) => overrides[c.id] === 'noaction';
  // CSM + renewal scope applies everywhere on the page
  const inScope = (c) => (csm === 'all' || c.csm === csm) && (renewal === 'all' || c.renewalQuarter.key === renewal) && (tierSel.length === 0 || tierSel.indexOf(c.tier) >= 0) && (segSel.length === 0 || segSel.indexOf(c.segment) >= 0) && (custSel.length === 0 || custSel.indexOf(c.id) >= 0);
  const scoped = all.filter(inScope);

  const count = (st) => scoped.filter((c) => c.status === st && !muted(c)).length;
  const arrSum = (sts) => scoped.filter((c) => sts.includes(c.status) && !muted(c)).reduce((a, c) => a + c.arr, 0);

  const FLAGGED = ['stall', 'risk', 'watch', 'upsell'];
  // The status tiles (Stalled / At Risk / Watch / Upsell) filter the whole
  // worklist to that status; "In view" / clicking an active tile clears it.
  const statusFilter = FLAGGED.includes(filter) ? filter : null;
  const flagged = scoped.filter((c) => FLAGGED.includes(c.status) && !muted(c) && (!statusFilter || c.status === statusFilter))
    .sort((a, b) => (H.STATUS[a.status].rank - H.STATUS[b.status].rank) || (a.verifMom ?? 0) - (b.verifMom ?? 0));
  const mutedCount = scoped.filter((c) => FLAGGED.includes(c.status) && muted(c)).length;

  // ─── Outreach pipeline buckets ───────────────────────────────────────────
  // Risk accounts split by where they are in the outreach lifecycle, so nothing
  // falls off the page once it's been worked.
  const RISK = ['stall', 'risk', 'watch'];
  const needsOutreach = flagged.filter((c) => RISK.includes(c.status) && c.outreach.state === 'needed');
  const inFollowUp = flagged.filter((c) => RISK.includes(c.status) && (c.outreach.state === 'pending' || c.outreach.state === 'completed'))
    .sort((a, b) => { const da = followUpDue(a), db = followUpDue(b); return (da ? H.daysUntil(da) : 1e9) - (db ? H.daysUntil(db) : 1e9); });
  const expansion = flagged.filter((c) => c.status === 'upsell');
  const outreachLog = H.getOutreachLog ? H.getOutreachLog() : {};
  const recovered = scoped.filter((c) => !muted(c) && c.status === 'healthy' && outreachLog[c.id] && !statusFilter);
  const sumArr = (arr) => arr.reduce((a, c) => a + (c.arr || 0), 0);
  const overdueCount = inFollowUp.filter((c) => { const d = followUpDue(c); return d && H.daysUntil(d) < 0; }).length;

  const renderFollowUp = (c) => {
    const due = followUpDue(c);
    const dleft = due ? H.daysUntil(due) : null;
    const overdue = dleft != null && dleft < 0;
    const pb = window.playbookFor ? window.playbookFor(c) : null;
    const outDate = (c.outreach && c.outreach.date) || (c.lastTouch && c.lastTouch.date);
    const by = (c.outreach && c.outreach.owner) || (c.lastTouch && c.lastTouch.by);
    const reached = outDate ? `Reached out ${fmtDay(outDate)}${by ? ` by ${by}` : ''}` : 'Outreach logged';
    const fuText = due
      ? (overdue ? `follow-up overdue ${Math.abs(dleft)}d · was due ${fmtDay(due)}` : dleft === 0 ? 'follow-up due today' : `follow-up due in ${dleft}d · ${fmtDay(due)}`)
      : 'no follow-up set';
    return {
      reached, fuText, overdue, due,
      playbook: pb ? `${pb.code} · ${pb.name.split(' \u2014 ')[0]}` : null,
      editing: editingFU === c.id,
      onEdit: () => setEditingFU(c.id),
      onCancel: () => setEditingFU(null),
      onSetDate: (date) => { saveFollowup(c.id, date); setEditingFU(null); },
      onSetDays: (days) => { const d = new Date(TODAY); d.setDate(d.getDate() + days); saveFollowup(c.id, d.toISOString().slice(0, 10)); setEditingFU(null); },
    };
  };

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
      <header style={{ padding: '18px 32px 16px', background: V.white, borderBottom: `1px solid ${V.greyXLight}` }}>
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
              <span title={`Data source: ${H.dataSource || 'embedded'}`} style={{ fontSize: 12, color: V.greyMed, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: /live sheet/.test(H.dataSource || '') ? V.green : V.greyMed }} />
                {/live sheet/.test(H.dataSource || '') ? 'Live · a data feed' : 'Local data'}{dataLoadedAt ? ` · synced ${relTime(dataLoadedAt)}` : ''}
              </span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <Button kind="secondary" size="md" icon="download" onClick={() => exportCsv(tableRows, H)}>Export</Button>
          </div>
        </div>
      </header>

      <div style={{ flex: 1, overflow: 'auto', padding: '24px 32px 48px' }}>
        {/* KPI strip */}
        <div style={{ display: 'flex', gap: 14, marginBottom: 28, flexWrap: 'wrap' }}>
          <Kpi icon="users" tone="neutral" value={scoped.length} label="In view" sub={csm === 'all' ? '0 CSM coverage' : csm} active={filter === 'all'} onClick={() => setFilter('all')} />
          <Kpi icon="octagon" tone="red" value={count('stall')} label="Stalled" sub={`${H.fmtMoney(arrSum(['stall']))} ARR`} active={filter === 'stall'} onClick={() => setFilter(filter === 'stall' ? 'all' : 'stall')} />
          <Kpi icon="trendingDown" tone="red" value={count('risk')} label="At Risk" sub={`${H.fmtMoney(arrSum(['risk']))} ARR`} active={filter === 'risk'} onClick={() => setFilter(filter === 'risk' ? 'all' : 'risk')} />
          <Kpi icon="alert" tone="orange" value={count('watch')} label="Watch" sub={`${H.fmtMoney(arrSum(['watch']))} ARR`} active={filter === 'watch'} onClick={() => setFilter(filter === 'watch' ? 'all' : 'watch')} />
          <Kpi icon="trendingUp" tone="purple" value={count('upsell')} label="Upsell" sub={`${H.fmtMoney(arrSum(['upsell']))} ARR`} active={filter === 'upsell'} onClick={() => setFilter(filter === 'upsell' ? 'all' : 'upsell')} />
        </div>

        {/* worklist — outreach pipeline */}
        {mutedCount > 0 && (
          <div style={{ fontSize: 12, color: V.greyMed, marginBottom: 14 }}>
            {mutedCount} {mutedCount === 1 ? 'account is' : 'accounts are'} hidden by a CSM “no action needed” override.
          </div>
        )}

        {statusFilter && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, fontSize: 12.5, color: V.greyMed }}>
            Showing <strong style={{ color: V.black }}>{H.STATUS[statusFilter].label}</strong> accounts only.
            <button onClick={() => setFilter('all')} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: 'transparent', border: 0, cursor: 'pointer', padding: 0, fontSize: 12.5, fontWeight: 600, color: V.blue, fontFamily: V.font }}>
              <Icon name="close" size={12} color={V.blue} />Clear
            </button>
          </div>
        )}

        {(!statusFilter || needsOutreach.length > 0) && (
        <WorklistBucket accent={V.red} title="Needs outreach" count={needsOutreach.length} arrValue={sumArr(needsOutreach)}
          desc="Flagged by a trigger and not yet contacted. Start here — reach out, then mark it done to move it into follow-up.">
          {needsOutreach.length === 0
            ? <div style={{ padding: '18px', textAlign: 'center', fontSize: 13, color: V.greyMed, background: V.white, border: `1px solid ${V.greyXLight}`, borderRadius: 8 }}>Nothing waiting on first outreach. Nice.</div>
            : needsOutreach.map((c) => <WorklistItem key={c.id} c={c} onSelect={onSelect} range={range} onMarkOutreach={() => setMarking(c)} />)}
        </WorklistBucket>
        )}

        {(!statusFilter || inFollowUp.length > 0) && (
        <WorklistBucket accent={V.blue} title="In follow-up" count={inFollowUp.length} arrValue={sumArr(inFollowUp)}
          desc={`Outreach done — still flagged, so we're watching for recovery. Default follow-up is 30 days; set a custom date per account. ${overdueCount > 0 ? `${overdueCount} ${overdueCount === 1 ? 'is' : 'are'} overdue.` : ''}`}>
          {inFollowUp.length === 0
            ? <div style={{ padding: '18px', textAlign: 'center', fontSize: 13, color: V.greyMed, background: V.white, border: `1px solid ${V.greyXLight}`, borderRadius: 8 }}>Nothing in follow-up yet. Accounts land here once you’ve reached out.</div>
            : inFollowUp.map((c) => <WorklistItem key={c.id} c={c} onSelect={onSelect} range={range} followUp={renderFollowUp(c)} />)}
        </WorklistBucket>
        )}

        {expansion.length > 0 && (
          <WorklistBucket accent={V.purple} title="Expansion signals" count={expansion.length} arrValue={sumArr(expansion)}
            desc="Usage is climbing past the growth trigger — an expansion or true-up conversation, not a risk.">
            {expansion.map((c) => <WorklistItem key={c.id} c={c} onSelect={onSelect} range={range} />)}
          </WorklistBucket>
        )}

        {!statusFilter && (
        <WorklistBucket accent={V.green} title="Recovered · last 90 days" count={recovered.length} arrValue={sumArr(recovered)}
          collapsible defaultOpen={recovered.length > 0}
          desc="Accounts you worked that have climbed back to healthy — the saves. Kept here so the win stays visible.">
          {recovered.length === 0
            ? <div style={{ padding: '18px', textAlign: 'center', fontSize: 13, color: V.greyMed, background: V.white, border: `1px solid ${V.greyXLight}`, borderRadius: 8 }}>Recoveries show up here once a flagged account you’ve worked returns to healthy.</div>
            : recovered.map((c) => <WorklistItem key={c.id} c={c} onSelect={onSelect} range={range} />)}
        </WorklistBucket>
        )}

        {/* all accounts */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, flexWrap: 'wrap', gap: 12 }}>
          <SectionHeading title="All accounts" count={`${tableRows.length} of ${scoped.length}`} inline />
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, height: 32, padding: '0 10px', background: V.white, border: `1px solid ${V.greyLight}`, borderRadius: 4, width: 200, maxWidth: '100%' }}>
              <Icon name="search" size={14} color={V.greyMed} />
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search accounts"
                style={{ border: 0, outline: 'none', flex: 1, minWidth: 0, fontSize: 13, fontFamily: V.font, color: V.black, background: 'transparent' }} />
            </div>
            <div style={{ display: 'flex', gap: 2, background: V.greyXLight, padding: 2, borderRadius: 6, flexWrap: 'wrap' }}>
              {FILTERS.map((f) => (
                <button key={f.key} onClick={() => setFilter(f.key)} style={{
                  border: 0, cursor: 'pointer', borderRadius: 4, padding: '5px 11px', fontSize: 12.5, fontWeight: 600, fontFamily: V.font,
                  background: filter === f.key ? V.white : 'transparent', color: filter === f.key ? V.black : V.greyDark,
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
      {marking && <MarkOutreachModal account={marking} by="Riley" onClose={() => setMarking(null)} onLogged={() => setTick((t) => t + 1)} />}
    </main>
  );
}

function Pill({ label, icon }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, height: 26, padding: '0 10px', borderRadius: 4, border: `1px solid ${V.greyLight}`, background: V.white, fontSize: 12.5, fontWeight: 500, color: V.black }}>
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

// ───────────────────────────────────────────────────────────────────────────
// Leadership Overview — CSM Summary + Risk & Revenue
// ───────────────────────────────────────────────────────────────────────────

// Quick-pick names for "Requested by" — populates the field on click but
// doesn't restrict it; anyone can type a different name. Update this list as
// the team changes (no separate "Other" toggle needed).
const QUICK_NAMES = ['Riley', 'Jordan', 'Morgan'];

// People who can be @mentioned when escalating to leadership. SLACK_IDS maps
// name -> real Slack member ID (format "U0123ABCD", found via a person's
// Slack profile -> "Copy member ID"). Until an ID is filled in, slackMention()
// falls back to plain "@Name" text, which won't trigger a real Slack
// notification but keeps the message readable — swap in real IDs once
// pointed at our workspace.
const NOTIFY_TARGETS = ['Jordan', 'Morgan'];
const SLACK_IDS = {
  // Jordan: 'U0123ABCD',
  // Morgan: 'U0456EFGH',
};
function slackMention(name) {
  return SLACK_IDS[name] ? `<@${SLACK_IDS[name]}>` : `@${name}`;
}

const LEAD_TABS = [
  { key: 'overview', label: 'Overview', icon: 'grid' },
  { key: 'csm', label: 'CSM Summary', icon: 'users' },
  { key: 'accounts', label: 'Accounts', icon: 'alert' },
  { key: 'risk', label: 'Risk & Revenue', icon: 'trendingDown' },
  { key: 'activity', label: 'Activity', icon: 'clock' },
  { key: 'settings', label: 'Settings', icon: 'target' },
];

function lGet(k, d) { try { var v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; } catch (e) { return d; } }
function lSet(k, v) { try { (window.Sync ? window.Sync.set : (k2, v2) => localStorage.setItem(k2, JSON.stringify(v2)))(k, v); } catch (e) {} }
// "synced just now" / "synced 4m ago" style relative time for the data-source indicator.
function relTime(ts) {
  if (!ts) return null;
  const diffMin = Math.round((Date.now() - ts) / 60000);
  if (diffMin < 1) return 'just now';
  if (diffMin === 1) return '1 minute ago';
  if (diffMin < 60) return `${diffMin} minutes ago`;
  const diffHr = Math.round(diffMin / 60);
  if (diffHr === 1) return '1 hour ago';
  return `${diffHr} hours ago`;
}

const NO_TOUCH_THRESHOLD = 30; // days

// Slack relay endpoint — kept blank until connected to our relay.
// The relay holds the webhook secret server-side; calls are stubbed via
// postRelay() today, so no request leaves the browser.
const SLACK_RELAY_URL = '';

// Base URL for the deployed dashboard — used to build deep links in Slack
// pings (?account=<id> opens straight to that account's detail view). Update
// this if the dashboard moves to a different host/path.
const DASHBOARD_BASE_URL = 'https://REPLACE-WITH-HOST/Customer Health Dashboard.html';
function accountDeepLink(accountId) {
  return `${DASHBOARD_BASE_URL}?account=${encodeURIComponent(accountId)}`;
}

// Plain-language "why" for Slack pings — c.headline has the trigger
// mechanics (specific %, "stall trigger", etc.) which is useful in-app but
// too jargon-heavy for a ping. This gives the CSM the gist without making
// them parse trigger names.
function simpleReason(c) {
  if (c.status === 'stall') return "This account hasn't shown any product usage recently.";
  if (c.status === 'risk') return "This account's usage has dropped off significantly compared to recent months.";
  if (c.status === 'watch') return "This account's usage is trending down, though not yet at a critical level.";
  if (c.status === 'upsell') return 'This account is showing strong growth — may be ready for an expansion conversation.';
  return c.headline || '';
}

// Check-in log — "I talked to this CSM about the 1:1 prompt, here's what we
// discussed." Stored per-CSM in cc_csm_checkins (synced). Each entry can be
// individually removed so it doesn't sit there forever once it's stale.
function getCheckins(csm) {
  const all = lGet('cc_csm_checkins', {});
  return all[csm] || [];
}
function addCheckin(csm, prompt, notes, by) {
  const all = lGet('cc_csm_checkins', {});
  const list = (all[csm] || []).slice();
  list.unshift({ id: 'ci' + Math.random().toString(36).slice(2, 9), ts: Date.now(), prompt, notes, by });
  const next = { ...all, [csm]: list };
  lSet('cc_csm_checkins', next);
  if (window.Sync) window.Sync.logActivity({ who: by, action: 'logged check-in', account: csm, detail: notes || undefined, full: { Prompt: prompt, Notes: notes || null } });
  return next;
}
function removeCheckin(csm, id) {
  const all = lGet('cc_csm_checkins', {});
  const list = (all[csm] || []).filter((e) => e.id !== id);
  const next = { ...all, [csm]: list };
  lSet('cc_csm_checkins', next);
  return next;
}

function csmRollup(all, csmName) {
  const accounts = all.filter((c) => c.csm === csmName);
  const red = accounts.filter((c) => ['stall', 'risk'].includes(c.status));
  const watch = accounts.filter((c) => c.status === 'watch');
  const noTouch = accounts.filter((c) => c.touchDays != null && c.touchDays >= NO_TOUCH_THRESHOLD);
  const arr = accounts.reduce((a, c) => a + c.arr, 0);
  const arrAtRisk = red.reduce((a, c) => a + c.arr, 0);
  const arrAtRiskPlusWatch = arrAtRisk + watch.reduce((a, c) => a + c.arr, 0);
  const needsHelp = red.length >= 3 || (accounts.length > 0 && (red.length / accounts.length) >= 0.4);
  // Longest-no-contact account, for the 1:1 prompt.
  const longestNoTouch = noTouch.slice().sort((a, b) => (b.touchDays ?? Infinity) - (a.touchDays ?? Infinity))[0] || null;
  return { csm: csmName, accounts, red, watch, noTouch, arr, arrAtRisk, arrAtRiskPlusWatch, needsHelp, longestNoTouch };
}

// Generates a short, observation-based prompt for the manager's 1:1 — facts
// plus soft language ("might be worth checking in on..."), never a
// diagnosis of what the CSM needs (we don't know that from the data).
function oneOnOnePrompt(rollup) {
  const { red, watch, noTouch, longestNoTouch, csm } = rollup;
  const firstName = csm.split(' ')[0];
  const atRiskPlusWatch = red.length + watch.length;
  if (atRiskPlusWatch === 0 && noTouch.length === 0) {
    return `${firstName}'s accounts look steady right now — nothing flagged for this 1:1.`;
  }
  const parts = [];
  if (red.length > 0) {
    parts.push(`${red.length} at-risk account${red.length === 1 ? '' : 's'}`);
  }
  if (watch.length > 0) {
    parts.push(`${watch.length} on watch`);
  }
  let line = parts.length ? `${firstName} is carrying ${parts.join(' and ')} right now.` : '';
  if (longestNoTouch) {
    const touchDesc = longestNoTouch.touchDays == null ? 'no logged contact yet' : `${longestNoTouch.touchDays} days since last contact`;
    const sentence = `Might be worth checking in on ${longestNoTouch.name} — ${touchDesc}.`;
    line = line ? `${line} ${sentence}` : sentence;
  }
  return line;
}

// "Who's escalating?" picker — a row of name buttons plus "Other" which
// reveals a free-text field. Used by both EscalateModal (CSM rollup) and
// the new account-detail leadership escalation.
// "Requested by" field — free text (so it works for anyone, including new
// hires not in any hardcoded list), with quick-pick chips for the most
// common names. Clicking a chip fills the field; it doesn't lock selection.
function RequestedByField({ value, onChange }) {
  return (
    <input value={value} onChange={(e) => onChange(e.target.value)} placeholder="Type your name…"
      style={{ width: '100%', height: 36, padding: '0 10px', fontSize: 13, fontFamily: V.font, color: V.black, border: `1px solid ${V.greyLight}`, borderRadius: 6, outline: 'none', boxSizing: 'border-box' }} />
  );
}

// "Notify" picker — multi-select of leadership names to @mention in the
// Slack post. Defaults to Jordan; extensible as the team grows.
function NotifyPicker({ selected, onToggle }) {
  return (
    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
      {NOTIFY_TARGETS.map((name) => {
        const active = selected.includes(name);
        return (
          <button key={name} onClick={() => onToggle(name)} style={{
            display: 'inline-flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 6, cursor: 'pointer', fontFamily: V.font, fontSize: 12.5, fontWeight: 600,
            border: `1.5px solid ${active ? V.green : V.greyLight}`, background: active ? V.greenLight : V.white, color: active ? V.greenDeep : V.greyDark,
          }}>
            {active && <Icon name="check" size={11} color={V.greenDeep} />}@{name}
          </button>
        );
      })}
    </div>
  );
}

function EscalateModal({ rollup, onClose, onPing }) {
  const H = window.HEALTH;
  const [items, setItems] = React.useState(() => {
    const fromRed = rollup.red.slice(0, 4).map((c) => `Check in on ${c.name} — ${H.STATUS[c.status].label.toLowerCase()}, ${H.fmtArr(c.arr)} ARR`);
    // List actual no-touch accounts by name (capped) instead of one lumped
    // "reach out to N accounts" line — that's not something anyone can act
    // on directly. Sort longest-no-contact first.
    const noTouchSorted = rollup.noTouch.slice().sort((a, b) => (b.touchDays ?? Infinity) - (a.touchDays ?? Infinity));
    const NT_CAP = 3;
    const fromTouch = noTouchSorted.slice(0, NT_CAP).map((c) => `Reach out to ${c.name} — ${c.touchDays == null ? 'no logged contact yet' : `${c.touchDays} days since last contact`}`);
    if (noTouchSorted.length > NT_CAP) {
      fromTouch.push(`+${noTouchSorted.length - NT_CAP} more no-contact account${noTouchSorted.length - NT_CAP === 1 ? '' : 's'} — see Needs Attention`);
    }
    return [...fromRed, ...fromTouch].slice(0, 8).map((text, i) => ({ id: 'i' + i, text, checked: true }));
  });
  const [channel, setChannel] = React.useState('slack');
  const [note, setNote] = React.useState('');
  const [requestedBy, setRequestedBy] = React.useState('Riley');
  const [notifyTargets, setNotifyTargets] = React.useState(['Jordan']);
  const [sending, setSending] = React.useState(false);
  const [error, setError] = React.useState(null);
  const toggle = (id) => setItems((prev) => prev.map((it) => it.id === id ? { ...it, checked: !it.checked } : it));
  const toggleNotify = (name) => setNotifyTargets((prev) => prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]);

  const send = async () => {
    setError(null);
    const checkedItems = items.filter((it) => it.checked).map((it) => it.text);

    if (channel === 'slack') {
      setSending(true);
      try {
        const resp = await postRelay( {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ csm: rollup.csm, items: checkedItems, note, escalatedBy: requestedBy, notify: notifyTargets, source: 'leadership-overview' }),
        });
        if (!resp.ok) throw new Error('Relay returned ' + resp.status);
        if (window.Sync) {
          window.Sync.logActivity({
            who: requestedBy, action: 'escalated', account: rollup.csm,
            detail: `${checkedItems.length} item${checkedItems.length === 1 ? '' : 's'}`,
            full: { 'Items': checkedItems.join('\n'), 'Note': note || null, 'Notified': notifyTargets.map((n) => `@${n}`).join(', ') || null },
          });
        }
        onPing();
        onClose();
      } catch (e) {
        setError("Couldn't reach Slack — check the relay is deployed and try again.");
      } finally {
        setSending(false);
      }
    } else {
      // No email relay yet — record the ping locally so the workflow can be reviewed.
      onPing();
      onClose();
    }
  };


  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 70, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(29,29,33,0.34)' }} />
      <div style={{ position: 'relative', width: 480, maxWidth: '100%', maxHeight: '90vh', background: V.white, borderRadius: 12, boxShadow: V.shadow3, display: 'flex', flexDirection: 'column', fontFamily: V.font, overflow: 'hidden' }}>
        <div style={{ padding: '18px 22px', borderBottom: `1px solid ${V.greyXLight}`, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexShrink: 0 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
              <Icon name="bell" size={18} color={V.black} strokeWidth={1.9} />
              <h3 style={{ fontSize: 18, fontWeight: 700, color: V.black, margin: 0 }}>Escalate — {rollup.csm}</h3>
            </div>
            <div style={{ fontSize: 12.5, color: V.greyMed, marginTop: 5 }}>Ping the CSM (or a shared channel) with the action items below.</div>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 0, cursor: 'pointer', padding: 6 }}><Icon name="close" size={20} color={V.greyDark} /></button>
        </div>

        <div style={{ flex: 1, overflow: 'auto', padding: '16px 22px 22px' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: V.greyMed, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Action items</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 18 }}>
            {items.length === 0 && <div style={{ fontSize: 13, color: V.greyMed, padding: '8px 0' }}>No flagged items — add a custom note below.</div>}
            {items.map((it) => (
              <label key={it.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 9, cursor: 'pointer' }}>
                <span onClick={() => toggle(it.id)} style={{ flexShrink: 0, marginTop: 2, width: 16, height: 16, borderRadius: 4, border: `1.5px solid ${it.checked ? V.greenDeep : V.greyLight}`, background: it.checked ? V.greenDeep : V.white, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                  {it.checked && <Icon name="check" size={11} color={V.onAccent} strokeWidth={3} />}
                </span>
                <span style={{ fontSize: 13, lineHeight: '18px', color: it.checked ? V.black : V.greyMed }}>{it.text}</span>
              </label>
            ))}
          </div>

          <div style={{ fontSize: 11, fontWeight: 700, color: V.greyMed, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Requested by</div>
          <div style={{ marginBottom: 18 }}>
            <RequestedByField value={requestedBy} onChange={setRequestedBy} />
          </div>

          <div style={{ fontSize: 11, fontWeight: 700, color: V.greyMed, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Notify</div>
          <div style={{ marginBottom: 18 }}>
            <NotifyPicker selected={notifyTargets} onToggle={toggleNotify} />
          </div>

          <div style={{ fontSize: 11, fontWeight: 700, color: V.greyMed, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Send to</div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 18 }}>
            {[['slack', 'slack', '#cs-alerts'], ['mail', 'mail', `${rollup.csm.split(' ')[0].toLowerCase()}@vela.com`]].map(([k, ic, detail]) => (
              <button key={k} onClick={() => setChannel(k)} style={{
                flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, padding: '10px 8px', borderRadius: 8, cursor: 'pointer', fontFamily: V.font,
                border: `1.5px solid ${channel === k ? V.green : V.greyLight}`, background: channel === k ? V.greenLight : V.white,
              }}>
                <Icon name={ic} size={16} color={channel === k ? V.greenDeep : V.greyDark} strokeWidth={1.9} />
                <span style={{ fontSize: 12.5, fontWeight: 600, color: channel === k ? V.greenDeep : V.black }}>{k === 'slack' ? 'Slack' : 'Email'}</span>
                <span style={{ fontSize: 10.5, color: V.greyMed }}>{k === 'mail' ? 'not yet connected' : detail}</span>
              </button>
            ))}
          </div>

          <div style={{ fontSize: 11, fontWeight: 700, color: V.greyMed, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Add a note (optional)</div>
          <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Anything else they should know…"
            style={{ width: '100%', minHeight: 64, padding: '8px 10px', fontSize: 13, fontFamily: V.font, color: V.black, border: `1px solid ${V.greyLight}`, borderRadius: 6, outline: 'none', resize: 'vertical', boxSizing: 'border-box' }} />
          {error && <div style={{ marginTop: 10, fontSize: 12.5, color: V.red }}>{error}</div>}
          {channel === 'mail' && <div style={{ marginTop: 10, fontSize: 12, color: V.greyMed, lineHeight: '16px' }}>Email isn't wired up yet — this will mark the account as pinged without sending anything. Slack is live via the test relay.</div>}
        </div>

        <div style={{ padding: '14px 22px', borderTop: `1px solid ${V.greyXLight}`, display: 'flex', justifyContent: 'flex-end', gap: 10, flexShrink: 0 }}>
          <Button kind="secondary" size="md" onClick={onClose}>Cancel</Button>
          <Button kind="primary" size="md" icon={channel === 'slack' ? 'slack' : 'mail'} onClick={send} disabled={sending}>
            {sending ? 'Sending…' : channel === 'slack' ? 'Ping in Slack' : 'Mark as pinged'}
          </Button>
        </div>
      </div>
    </div>
  );
}

// Popup for logging a 1:1 check-in — shows the prompt for context, lets the
// manager add a short note about what was discussed.
function LogCheckinModal({ csm, prompt, onClose, onSaved }) {
  const [notes, setNotes] = React.useState('');
  const [loggedBy, setLoggedBy] = React.useState('Riley');

  const save = () => {
    addCheckin(csm, prompt, notes.trim(), loggedBy);
    onSaved();
    onClose();
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 70, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(29,29,33,0.34)' }} />
      <div style={{ position: 'relative', width: 440, maxWidth: '100%', maxHeight: '90vh', background: V.white, borderRadius: 12, boxShadow: V.shadow3, display: 'flex', flexDirection: 'column', fontFamily: V.font, overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: `1px solid ${V.greyXLight}`, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexShrink: 0 }}>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: V.black, margin: 0 }}>Log check-in</h3>
            <div style={{ fontSize: 12.5, color: V.greyMed, marginTop: 4 }}>{csm}</div>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 0, cursor: 'pointer', padding: 4 }}><Icon name="close" size={18} color={V.greyDark} /></button>
        </div>
        <div style={{ padding: '16px 20px' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: V.greyMed, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>Prompt</div>
          <div style={{ fontSize: 13, color: V.greyDark, lineHeight: '19px', background: V.greyBgLight, borderRadius: 6, padding: '8px 10px', marginBottom: 14 }}>{prompt}</div>

          <div style={{ fontSize: 11, fontWeight: 700, color: V.greyMed, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>Logged by</div>
          <div style={{ marginBottom: 14 }}>
            <RequestedByField value={loggedBy} onChange={setLoggedBy} />
          </div>

          <div style={{ fontSize: 11, fontWeight: 700, color: V.greyMed, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>What did you discuss? (optional)</div>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="e.g. Talked about workload — she's delegating the Hawthorne follow-up to a teammate." autoFocus
            style={{ width: '100%', minHeight: 80, padding: '8px 10px', fontSize: 13, fontFamily: V.font, color: V.black, border: `1px solid ${V.greyLight}`, borderRadius: 6, outline: 'none', resize: 'vertical', boxSizing: 'border-box' }} />
        </div>
        <div style={{ padding: '12px 20px', borderTop: `1px solid ${V.greyXLight}`, display: 'flex', justifyContent: 'flex-end', gap: 10, flexShrink: 0 }}>
          <Button kind="secondary" size="md" onClick={onClose}>Cancel</Button>
          <Button kind="primary" size="md" icon="check" onClick={save}>Save</Button>
        </div>
      </div>
    </div>
  );
}

function CsmSummaryCard({ rollup, onSelect, pingedAt, onEscalate, onClearPing }) {
  const H = window.HEALTH;
  const [openFilter, setOpenFilter] = React.useState(null); // null | 'all' | 'red' | 'watch' | 'noTouch'
  const expanded = !!openFilter;
  const toggleFilter = (key) => setOpenFilter((cur) => cur === key ? null : key);
  const [checkins, setCheckins] = React.useState(() => getCheckins(rollup.csm));
  const [showAllCheckins, setShowAllCheckins] = React.useState(false);
  const [logOpen, setLogOpen] = React.useState(false);

  const listFor = (key) => {
    const sorted = rollup.accounts.slice().sort((a, b) => H.STATUS[a.status].rank - H.STATUS[b.status].rank);
    if (key === 'atRiskWatch') return sorted.filter((c) => ['stall', 'risk', 'watch'].includes(c.status));
    if (key === 'noTouch') return sorted.filter((c) => c.touchDays == null || c.touchDays >= NO_TOUCH_THRESHOLD);
    if (key === 'renewals') return rollup.accounts.filter((c) => c.renewalDays != null && c.renewalDays <= 90).sort((a, b) => a.renewalDays - b.renewalDays);
    if (key === 'upsell') return sorted.filter((c) => c.status === 'upsell');
    return sorted;
  };
  const list = listFor(openFilter);
  const hb = healthBuckets(rollup.accounts);
  const renew90 = rollup.accounts.filter((c) => c.renewalDays != null && c.renewalDays <= 90);
  const renew90Arr = renew90.reduce((a, c) => a + (c.arr || 0), 0);
  const upsells = rollup.accounts.filter((c) => c.status === 'upsell');
  const upsellArr = upsells.reduce((a, c) => a + (c.arr || 0), 0);

  return (
    <div style={{ background: V.white, border: `1px solid ${V.greyXLight}`, borderRadius: 8, boxShadow: V.shadow2, overflow: 'hidden' }}>
      <div style={{ padding: '16px 18px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap', marginBottom: 14 }}>
          <span style={{ width: 36, height: 36, borderRadius: '50%', background: V.purpleLight, color: V.purpleDark, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, flexShrink: 0 }}>
            {rollup.csm === 'Unassigned' ? '—' : rollup.csm.split(' ').map((p) => p[0]).slice(0, 2).join('')}
          </span>
          <div style={{ flex: 1, minWidth: 160 }}>
            <span style={{ fontSize: 15, fontWeight: 700, color: V.black }}>{rollup.csm}</span>
            <div style={{ fontSize: 12, color: V.greyMed, marginTop: 2 }}>{rollup.accounts.length} accounts · {H.fmtMoney(rollup.arr)} ARR</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            {pingedAt ? (
              <>
                <Chip tone="green" icon="check" title={new Date(pingedAt).toLocaleString()}>Pinged · {relTime(pingedAt)}</Chip>
                {rollup.csm !== 'Unassigned' && <Button kind="ghost" size="sm" icon="bell" onClick={onEscalate}>Send reminder</Button>}
                <button onClick={onClearPing} title="Clear pinged status" style={{ background: 'transparent', border: 0, cursor: 'pointer', padding: 2, display: 'inline-flex' }}>
                  <Icon name="close" size={13} color={V.greyMed} />
                </button>
              </>
            ) : (
              (rollup.needsHelp || rollup.noTouch.length > 0) && rollup.csm !== 'Unassigned' &&
              <Button kind="secondary" size="sm" icon="bell" onClick={onEscalate}>Escalate</Button>
            )}
            <button onClick={() => toggleFilter(expanded ? openFilter : 'all')} style={{ background: 'transparent', border: `1px solid ${V.greyLight}`, borderRadius: 6, width: 30, height: 30, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <Icon name={expanded ? 'chevronUp' : 'chevronDown'} size={15} color={V.greyDark} />
            </button>
          </div>
        </div>

        {rollup.accounts.length > 0 && (
          <div style={{ marginBottom: 12 }}>
            <HealthBar b={hb} height={12} />
            <div style={{ display: 'flex', gap: 14, marginTop: 7, flexWrap: 'wrap' }}>
              {HEALTH_SEGS.map((s) => hb[s.key].length > 0 && (
                <span key={s.key} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11.5, color: V.greyMed }}>
                  <span style={{ width: 8, height: 8, borderRadius: 2, background: s.color }} />{hb[s.key].length} {s.label}
                </span>
              ))}
            </div>
          </div>
        )}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: rollup.accounts.length > 0 ? 12 : 0 }}>
          <div onClick={() => (rollup.red.length + rollup.watch.length) > 0 && toggleFilter('atRiskWatch')} style={{
            flex: '1 1 160px', minWidth: 0, background: V.greyBg, borderRadius: 6, padding: '10px 14px', cursor: (rollup.red.length + rollup.watch.length) > 0 ? 'pointer' : 'default',
            outline: openFilter === 'atRiskWatch' ? `1.5px solid ${V.greyDark}` : 'none',
          }}>
            <div style={{ fontSize: 12, color: V.greyMed }}>At risk + watch</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: V.black, marginTop: 2 }}>{rollup.red.length + rollup.watch.length} account{(rollup.red.length + rollup.watch.length) === 1 ? '' : 's'}</div>
            {rollup.arrAtRiskPlusWatch > 0 && <div style={{ fontSize: 11.5, color: V.greyMed, marginTop: 2 }}>{H.fmtMoney(rollup.arrAtRiskPlusWatch)} ARR</div>}
          </div>
          <div style={{
            flex: '1 1 160px', minWidth: 0, background: V.greyBgLight, borderRadius: 6, padding: '10px 14px', border: `1px dashed ${V.greyLight}`,
          }}>
            <div style={{ fontSize: 12, color: V.greyMed }}>Last contact</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: V.greyMed, marginTop: 6 }}>Pending CRM sync</div>
          </div>
          <div onClick={() => renew90.length > 0 && toggleFilter('renewals')} style={{
            flex: '1 1 160px', minWidth: 0, background: V.greyBg, borderRadius: 6, padding: '10px 14px', cursor: renew90.length > 0 ? 'pointer' : 'default',
            outline: openFilter === 'renewals' ? `1.5px solid ${V.greyDark}` : 'none',
          }}>
            <div style={{ fontSize: 12, color: V.greyMed }}>Renewals · next 90d</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: V.black, marginTop: 2 }}>{renew90.length} account{renew90.length === 1 ? '' : 's'}</div>
            {renew90Arr > 0 && <div style={{ fontSize: 11.5, color: V.greyMed, marginTop: 2 }}>{H.fmtMoney(renew90Arr)} ARR up</div>}
          </div>
          <div onClick={() => upsells.length > 0 && toggleFilter('upsell')} style={{
            flex: '1 1 160px', minWidth: 0, background: V.greyBg, borderRadius: 6, padding: '10px 14px', cursor: upsells.length > 0 ? 'pointer' : 'default',
            outline: openFilter === 'upsell' ? `1.5px solid ${V.greyDark}` : 'none',
          }}>
            <div style={{ fontSize: 12, color: V.greyMed }}>Expansion signals</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: V.black, marginTop: 2 }}>{upsells.length} account{upsells.length === 1 ? '' : 's'}</div>
            {upsellArr > 0 && <div style={{ fontSize: 11.5, color: V.greyMed, marginTop: 2 }}>{H.fmtMoney(upsellArr)} ARR</div>}
          </div>
        </div>

        {rollup.accounts.length > 0 && (
          <div style={{ borderTop: `1px solid ${V.greyXLight}`, paddingTop: 12, display: 'flex', alignItems: 'flex-start', gap: 8 }}>
            <Icon name="bulb" size={14} color={V.greyMed} strokeWidth={1.9} style={{ marginTop: 2, flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 3 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: V.greyMed, textTransform: 'uppercase', letterSpacing: '0.04em' }}>For your 1:1</div>
                <button onClick={() => setLogOpen(true)} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: 'transparent', border: 0, cursor: 'pointer', padding: 0, fontSize: 12, fontWeight: 600, color: V.blue, fontFamily: V.font, flexShrink: 0 }}>
                  <Icon name="check" size={12} color={V.blue} />Log check-in
                </button>
              </div>
              <div style={{ fontSize: 13.5, color: V.black, lineHeight: '19px' }}>{oneOnOnePrompt(rollup)}</div>
              {checkins.length > 0 && (
                <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {(showAllCheckins ? checkins : checkins.slice(0, 2)).map((e) => (
                    <div key={e.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 6, fontSize: 12, color: V.greyMed, lineHeight: '17px' }}>
                      <span style={{ flexShrink: 0 }}>{nFmt(e.ts)} — {e.by}{e.notes ? `: ${e.notes}` : ''}</span>
                      <button onClick={() => setCheckins(removeCheckin(rollup.csm, e.id)[rollup.csm] || [])} title="Remove this check-in" style={{ background: 'transparent', border: 0, cursor: 'pointer', padding: 0, display: 'inline-flex', flexShrink: 0, marginLeft: 'auto' }}>
                        <Icon name="close" size={11} color={V.greyLight} />
                      </button>
                    </div>
                  ))}
                  {checkins.length > 2 && (
                    <button onClick={() => setShowAllCheckins((s) => !s)} style={{ alignSelf: 'flex-start', background: 'transparent', border: 0, cursor: 'pointer', padding: 0, fontSize: 12, fontWeight: 600, color: V.blue, fontFamily: V.font }}>
                      {showAllCheckins ? 'Show less' : `Show ${checkins.length - 2} more`}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      {logOpen && <LogCheckinModal csm={rollup.csm} prompt={oneOnOnePrompt(rollup)} onClose={() => setLogOpen(false)} onSaved={() => setCheckins(getCheckins(rollup.csm))} />}
      {expanded && (
        <div style={{ borderTop: `1px solid ${V.greyXLight}`, padding: '12px 18px 16px', background: V.greyBgLight }}>
          {openFilter !== 'all' && (
            <div style={{ fontSize: 11.5, color: V.greyMed, marginBottom: 8 }}>
              Showing {openFilter === 'atRiskWatch' ? 'at risk + watch' : openFilter === 'noTouch' ? 'no-contact (30+ days)' : openFilter === 'renewals' ? 'renewing in 90 days' : 'expansion-signal'} accounts for {rollup.csm}.{' '}
              <span onClick={() => setOpenFilter('all')} style={{ color: V.blue, fontWeight: 600, cursor: 'pointer' }}>Show all {rollup.accounts.length}</span>
            </div>
          )}
          {list.length === 0 ? (
            <div style={{ fontSize: 12.5, color: V.greyMed }}>No accounts in this view.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {list.map((c) => (
                <div key={c.id} onClick={() => onSelect(c)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 10px', borderRadius: 6, cursor: 'pointer', background: V.white, border: `1px solid ${V.greyXLight}` }}>
                  <StatusPill status={c.status} size="sm" />
                  <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: V.black, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.name}</span>
                  <span style={{ fontSize: 12, color: V.greyMed }}>{H.fmtArr(c.arr)}</span>
                  {openFilter === 'renewals' && c.renewalDays != null && <Chip tone={c.renewalDays <= 45 ? 'orange' : 'grey'} icon="clock">{c.renewalDays}d</Chip>}
                  {openFilter !== 'renewals' && (c.touchDays == null || c.touchDays >= NO_TOUCH_THRESHOLD) && <Chip tone="orange" icon="clock">{c.touchDays == null ? 'No touch' : `${c.touchDays}d`}</Chip>}
                  <Icon name="chevronRight" size={14} color={V.greyLight} />
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ColumnLegend() {
  const items = [
    ['Red / At Risk', 'Accounts that have stalled or crossed the decline trigger — click to see which.'],
    ['Watch', 'Trending down but not yet at the risk threshold — worth a look.'],
  ];
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginBottom: 16, padding: '10px 14px', background: V.white, border: `1px solid ${V.greyXLight}`, borderRadius: 8, fontSize: 12, color: V.greyDark }}>
      {items.map(([label, desc]) => (
        <div key={label} style={{ display: 'flex', alignItems: 'baseline', gap: 6, minWidth: 200 }}>
          <span style={{ fontWeight: 700, color: V.black, whiteSpace: 'nowrap' }}>{label}</span>
          <span style={{ color: V.greyMed, lineHeight: '16px' }}>{desc}</span>
        </div>
      ))}
    </div>
  );
}

// Bucket a list of accounts into the health language used across the overview.
function healthBuckets(accts) {
  const red = accts.filter((c) => c.status === 'risk' || c.status === 'stall');
  const yellow = accts.filter((c) => c.status === 'watch');
  const purple = accts.filter((c) => c.status === 'upsell');
  const green = accts.filter((c) => c.status === 'healthy' || c.status === 'onboarding' || c.status === 'nodata');
  const sum = (xs) => xs.reduce((s, c) => s + (c.arr || 0), 0);
  return {
    accts, total: accts.length,
    red, yellow, purple, green,
    arr: sum(accts), arrAtRisk: sum(red), arrWatch: sum(yellow),
  };
}

const HEALTH_SEGS = [
  { key: 'red', label: 'At risk', color: '#A9493F' },
  { key: 'yellow', label: 'Watch', color: '#B08A38' },
  { key: 'purple', label: 'Upsell', color: '#7D5878' },
  { key: 'green', label: 'Healthy', color: '#5F7D5A' },
];

function HealthBar({ b, height = 12 }) {
  const total = b.total || 1;
  return (
    <div style={{ display: 'flex', height, borderRadius: 999, overflow: 'hidden', background: V.greyXLight }}>
      {HEALTH_SEGS.map((s) => {
        const n = b[s.key].length;
        if (!n) return null;
        return <div key={s.key} title={`${n} ${s.label}`} style={{ width: `${(n / total) * 100}%`, background: s.color }} />;
      })}
    </div>
  );
}

function OverviewView({ onSelect }) {
  const H = window.HEALTH;
  const all = H.customers;
  const TIER_ORDER = ['Enterprise', 'Mid-Market', 'Scaled'];
  const [drill, setDrill] = React.useState(null); // { label, accts }

  const card = { background: V.white, border: `1px solid ${V.greyXLight}`, borderRadius: 8, boxShadow: V.shadow1 };
  const portfolio = healthBuckets(all);
  const arrSum = (xs) => xs.reduce((s, c) => s + (c.arr || 0), 0);
  const moneySegs = [
    { label: 'At risk', color: '#A9493F', arr: arrSum(portfolio.red) },
    { label: 'Watch', color: '#B08A38', arr: arrSum(portfolio.yellow) },
    { label: 'Upsell', color: '#7D5878', arr: arrSum(portfolio.purple) },
    { label: 'Healthy', color: '#5F7D5A', arr: arrSum(portfolio.green) },
  ];
  const exposedArr = arrSum(portfolio.red) + arrSum(portfolio.yellow);
  // Coverage — of exposed (at-risk + watch) ARR, how much is being worked vs untouched.
  const exposedAccts = [...portfolio.red, ...portfolio.yellow];
  const isTouchedOv = (c) => c.outreach && c.outreach.state !== 'needed' && c.outreach.state !== 'none';
  const workedExposedArr = arrSum(exposedAccts.filter(isTouchedOv));
  const untouchedExposedArr = Math.max(0, exposedArr - workedExposedArr);
  const coveragePct = exposedArr ? Math.round((workedExposedArr / exposedArr) * 100) : 0;
  const untouchedExposedCount = exposedAccts.filter((c) => !isTouchedOv(c)).length;
  // Renewals coming up in the next quarter — the leader's #1 timing scan
  const upcoming = all.filter((c) => c.renewalDays >= 0 && c.renewalDays <= 90).sort((a, b) => a.renewalDays - b.renewalDays);
  const upcomingArr = arrSum(upcoming);
  const upcomingRisk = upcoming.filter((c) => c.status === 'risk' || c.status === 'stall' || c.status === 'watch');
  // Forward-looking levers a leader manages: revenue coming live, and where the book can grow.
  const onboarding = all.filter((c) => c.status === 'onboarding').sort((a, b) => (b.arr || 0) - (a.arr || 0));
  const expansion = all.filter((c) => c.status === 'upsell').sort((a, b) => (b.arr || 0) - (a.arr || 0));
  const MoneyBar = () => (
    <div style={{ display: 'flex', height: 14, borderRadius: 999, overflow: 'hidden', background: V.greyXLight }}>
      {moneySegs.map((s) => s.arr > 0 ? <div key={s.label} title={`${s.label} · ${H.fmtMoney(s.arr)}`} style={{ width: `${(s.arr / (portfolio.arr || 1)) * 100}%`, background: s.color }} /> : null)}
    </div>
  );

  // CSM rollups — sorted by revenue at risk (who needs help first)
  const csmNames = Array.from(new Set(all.map((c) => c.csm))).filter((n) => n && n !== 'Unassigned');
  const csmData = csmNames
    .map((csm) => ({ csm, ...healthBuckets(all.filter((c) => c.csm === csm)) }))
    .sort((a, b) => b.arrAtRisk - a.arrAtRisk || b.arr - a.arr);

  // Tier rollups — revenue weighted
  const tierData = TIER_ORDER
    .map((tier) => ({ tier, ...healthBuckets(all.filter((c) => c.tier === tier)) }))
    .filter((t) => t.total > 0);

  // Segment rollups — sorted by exposure
  const segNames = Array.from(new Set(all.map((c) => c.segment))).filter(Boolean);
  const segData = segNames
    .map((segment) => ({ segment, ...healthBuckets(all.filter((c) => c.segment === segment)) }))
    .sort((a, b) => b.red.length - a.red.length || b.arr - a.arr);

  const openDrill = (label, accts) => setDrill({ label, accts: [...accts].sort((x, y) => (y.arr || 0) - (x.arr || 0)) });

  const SectionLabel = ({ children, hint }) => (
    <div style={{ marginBottom: 12 }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: V.greyDark, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{children}</div>
      {hint && <div style={{ fontSize: 12, color: V.greyMed, marginTop: 3 }}>{hint}</div>}
    </div>
  );

  const StatBox = ({ label, value, subtext, color }) => (
    <div style={{ ...card, padding: '14px 16px', flex: 1, minWidth: 150 }}>
      <div style={{ fontSize: 11, color: V.greyMed, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 7 }}>{label}</div>
      <div style={{ fontSize: 26, fontWeight: 700, color: color || V.black, lineHeight: 1, marginBottom: 4 }}>{value}</div>
      {subtext && <div style={{ fontSize: 12, color: V.greyMed }}>{subtext}</div>}
    </div>
  );

  const Legend = () => (
    <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center' }}>
      {HEALTH_SEGS.map((s) => (
        <span key={s.key} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, color: V.greyDark }}>
          <span style={{ width: 9, height: 9, borderRadius: '50%', background: s.color }} />{s.label}
        </span>
      ))}
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      {/* Portfolio headline — the money picture */}
      <div style={{ ...card, padding: 22 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ fontSize: 11, color: V.greyMed, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>ARR Under Management</div>
            <div style={{ fontSize: 34, fontWeight: 700, color: V.black, lineHeight: 1.05, marginTop: 5 }}>{H.fmtMoney(portfolio.arr)}</div>
            <div style={{ fontSize: 12.5, color: V.greyMed, marginTop: 3 }}>{all.length} accounts · {csmData.length} CSMs</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 11, color: V.greyMed, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Revenue Exposed</div>
            <div style={{ fontSize: 30, fontWeight: 700, color: V.red, lineHeight: 1.05, marginTop: 5 }}>{H.fmtMoney(exposedArr)}</div>
            <div style={{ fontSize: 12.5, color: V.greyMed, marginTop: 3 }}>{portfolio.arr ? Math.round((exposedArr / portfolio.arr) * 100) : 0}% of book · {portfolio.red.length + portfolio.yellow.length} accounts</div>
          </div>
        </div>
        <div style={{ marginTop: 20 }}>
          <MoneyBar />
          <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', marginTop: 13 }}>
            {moneySegs.map((s) => (
              <span key={s.label} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: 12.5, color: V.greyDark }}>
                <span style={{ width: 9, height: 9, borderRadius: '50%', background: s.color }} />
                <span style={{ fontWeight: 600 }}>{s.label}</span>
                <span style={{ color: V.greyMed }}>{H.fmtMoney(s.arr)}</span>
              </span>
            ))}
          </div>
        </div>
        {/* Coverage — are we actually working the exposed revenue? */}
        {exposedArr > 0 && (
          <div style={{ marginTop: 18, paddingTop: 16, borderTop: `1px solid ${V.greyXLight}` }}>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12, marginBottom: 9, flexWrap: 'wrap' }}>
              <div style={{ fontSize: 12.5, color: V.greyDark }}><span style={{ fontWeight: 700, color: V.black }}>{coveragePct}%</span> of exposed ARR is being worked</div>
              <div style={{ fontSize: 12.5, color: untouchedExposedArr > 0 ? V.red : V.greenDeep, fontWeight: 600 }}>{untouchedExposedArr > 0 ? `${H.fmtMoney(untouchedExposedArr)} untouched · ${untouchedExposedCount} acct${untouchedExposedCount === 1 ? '' : 's'}` : 'Full coverage'}</div>
            </div>
            <div style={{ display: 'flex', height: 12, borderRadius: 999, overflow: 'hidden', background: V.greyXLight }}>
              {workedExposedArr > 0 && <div title={`Being worked · ${H.fmtMoney(workedExposedArr)}`} style={{ width: `${(workedExposedArr / exposedArr) * 100}%`, background: V.green }} />}
              {untouchedExposedArr > 0 && <div title={`Untouched · ${H.fmtMoney(untouchedExposedArr)}`} style={{ width: `${(untouchedExposedArr / exposedArr) * 100}%`, background: V.red }} />}
            </div>
            <div style={{ display: 'flex', gap: 18, marginTop: 9, flexWrap: 'wrap' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11.5, color: V.greyMed }}><span style={{ width: 8, height: 8, borderRadius: 2, background: V.green }} />Being worked · {H.fmtMoney(workedExposedArr)}</span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11.5, color: V.greyMed }}><span style={{ width: 8, height: 8, borderRadius: 2, background: V.red }} />Untouched · {H.fmtMoney(untouchedExposedArr)}</span>
            </div>
          </div>
        )}
      </div>

      {/* Pipeline & Growth — the forward-looking levers */}
      <div>
        <SectionLabel hint="The forward-looking levers — revenue about to come live, and where the book can grow.">Pipeline &amp; Growth</SectionLabel>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {[
            { key: 'onboarding', title: 'Onboarding', accts: onboarding, accent: V.blue, metric: 'ARR coming live' },
            { key: 'expansion', title: 'Expansion Signals', accts: expansion, accent: V.purple, metric: 'ARR opportunity in play' },
          ].map((p) => (
            <div key={p.key} onClick={() => p.accts.length && openDrill(p.title, p.accts)}
              style={{ ...card, padding: 18, cursor: p.accts.length ? 'pointer' : 'default', transition: 'box-shadow 120ms, border-color 120ms' }}
              onMouseEnter={(e) => { if (p.accts.length) { e.currentTarget.style.boxShadow = V.shadow2; e.currentTarget.style.borderColor = p.accent; } }}
              onMouseLeave={(e) => { e.currentTarget.style.boxShadow = V.shadow1; e.currentTarget.style.borderColor = V.greyXLight; }}>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: V.black }}>{p.title}</div>
                <div style={{ fontSize: 11.5, color: V.greyMed }}>{p.accts.length} account{p.accts.length === 1 ? '' : 's'}</div>
              </div>
              <div style={{ fontSize: 28, fontWeight: 700, color: p.accent, lineHeight: 1.1, marginTop: 8 }}>{H.fmtMoney(p.accts.reduce((s, c) => s + (c.arr || 0), 0))}</div>
              <div style={{ fontSize: 12, color: V.greyMed, marginBottom: 12 }}>{p.metric}</div>
              <div style={{ borderTop: `1px solid ${V.greyXLight}`, paddingTop: 10, display: 'flex', flexDirection: 'column', gap: 7 }}>
                {p.accts.slice(0, 3).map((c) => (
                  <div key={c.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                    <span style={{ fontSize: 12.5, color: V.greyDark, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.name}</span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: V.greyDark, flexShrink: 0 }}>{H.fmtArr(c.arr)}</span>
                  </div>
                ))}
                {p.accts.length === 0 && <div style={{ fontSize: 12, color: V.greyMed }}>None right now.</div>}
                {p.accts.length > 3 && <div style={{ fontSize: 11.5, color: V.blue, fontWeight: 600 }}>+ {p.accts.length - 3} more</div>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Renewals on the horizon — the leader's #1 timing scan */}
      <div>
        <SectionLabel hint="What's up for renewal this quarter — and how much of it needs attention first.">Renewals · Next 90 Days</SectionLabel>
        <div style={{ ...card, overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, padding: '15px 18px', background: V.greyBg, borderBottom: `1px solid ${V.greyXLight}` }}>
            <div>
              <div style={{ fontSize: 22, fontWeight: 700, color: V.black, lineHeight: 1 }}>{H.fmtMoney(upcomingArr)}</div>
              <div style={{ fontSize: 12, color: V.greyMed, marginTop: 4 }}>{upcoming.length} up for renewal</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: upcomingRisk.length ? V.red : V.greenDeep, lineHeight: 1 }}>{H.fmtMoney(arrSum(upcomingRisk))}</div>
              <div style={{ fontSize: 12, color: V.greyMed, marginTop: 4 }}>{upcomingRisk.length} need attention first</div>
            </div>
          </div>
          {upcoming.length === 0 ? (
            <div style={{ padding: 22, textAlign: 'center', fontSize: 13, color: V.greyMed }}>No renewals in the next 90 days.</div>
          ) : (
            <>
              {upcoming.slice(0, 8).map((c, i) => {
                const flagged = c.status === 'risk' || c.status === 'stall' || c.status === 'watch';
                return (
                <div key={c.id} onClick={() => onSelect(c)}
                  style={{ display: 'flex', alignItems: 'flex-start', gap: 14, padding: '12px 18px', cursor: 'pointer', borderTop: i === 0 ? 'none' : `1px solid ${V.greyXLight}`, transition: 'background 120ms' }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = V.greyBgLight)}
                  onMouseLeave={(e) => (e.currentTarget.style.background = V.white)}>
                  <div style={{ marginTop: 1 }}><StatusPill status={c.status} size="sm" /></div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 600, color: V.black, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.name}</div>
                    <div style={{ fontSize: 11.5, color: V.greyMed, marginTop: 1 }}>{c.csm} · {c.tier}</div>
                    {flagged && c.headline && (
                      <div style={{ display: 'flex', gap: 6, marginTop: 5 }}>
                        <span style={{ width: 3, alignSelf: 'stretch', borderRadius: 2, background: c.status === 'watch' ? V.orangeDark : V.red, flexShrink: 0 }} />
                        <span style={{ fontSize: 11.5, color: V.greyDark, lineHeight: 1.4 }}>
                          {c.headline} <span style={{ color: c.status === 'watch' ? V.orangeDark : V.red, fontWeight: 600 }}>{H.fmtArr(c.arr)} at stake.</span>
                        </span>
                      </div>
                    )}
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 600, color: V.black }}>{H.fmtArr(c.arr)}</div>
                    <div style={{ fontSize: 11.5, color: c.renewalDays <= 45 ? V.orangeDark : V.greyMed, fontWeight: c.renewalDays <= 45 ? 600 : 400, marginTop: 1 }}>{c.renewalDays}d · {H.fmtRenewal(c.renewal)}</div>
                  </div>
                  <div style={{ marginTop: 2 }}><Icon name="chevronRight" size={15} color={V.greyLight} /></div>
                </div>
                );
              })}
              {upcoming.length > 8 && (
                <div style={{ padding: '11px 18px', borderTop: `1px solid ${V.greyXLight}`, fontSize: 12, color: V.greyMed, textAlign: 'center' }}>+ {upcoming.length - 8} more within 90 days</div>
              )}
            </>
          )}
        </div>
      </div>

      {/* CSM Overview — book of business by owner */}
      <div>
        <SectionLabel hint="Book of business by owner — ranked by revenue at risk.">CSM Overview</SectionLabel>
        <div style={{ ...card, overflow: 'hidden' }}>
          {csmData.map((d, i) => (
            <div key={d.csm} onClick={() => openDrill(d.csm, d.accts)}
              style={{ display: 'flex', alignItems: 'center', gap: 18, padding: '14px 18px', cursor: 'pointer',
                borderTop: i === 0 ? 'none' : `1px solid ${V.greyXLight}`, transition: 'background 120ms' }}
              onMouseEnter={(e) => (e.currentTarget.style.background = V.greyBgLight)}
              onMouseLeave={(e) => (e.currentTarget.style.background = V.white)}>
              <div style={{ width: 150, flexShrink: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: V.black }}>{d.csm}</div>
                <div style={{ fontSize: 11.5, color: V.greyMed, marginTop: 2 }}>{d.total} accounts · {H.fmtMoney(d.arr)}</div>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}><HealthBar b={d} /></div>
              <div style={{ width: 132, flexShrink: 0, textAlign: 'right' }}>
                {d.arrAtRisk > 0
                  ? <><div style={{ fontSize: 14, fontWeight: 700, color: V.red }}>{H.fmtMoney(d.arrAtRisk)}</div><div style={{ fontSize: 11, color: V.greyMed }}>{d.red.length} at risk</div></>
                  : <span style={{ fontSize: 12, fontWeight: 600, color: V.greenDeep }}>All healthy</span>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* By Tier — revenue weighted */}
      <div>
        <SectionLabel hint="Where revenue concentrates — and where it's exposed.">By Tier</SectionLabel>
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${tierData.length}, 1fr)`, gap: 12 }}>
          {tierData.map((d) => (
            <div key={d.tier} onClick={() => openDrill(d.tier + ' tier', d.accts)}
              style={{ ...card, padding: 18, cursor: 'pointer', transition: 'box-shadow 120ms, border-color 120ms' }}
              onMouseEnter={(e) => { e.currentTarget.style.boxShadow = V.shadow2; e.currentTarget.style.borderColor = V.green; }}
              onMouseLeave={(e) => { e.currentTarget.style.boxShadow = V.shadow1; e.currentTarget.style.borderColor = V.greyXLight; }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: V.black }}>{d.tier}</div>
              <div style={{ fontSize: 28, fontWeight: 700, color: V.black, lineHeight: 1.1, marginTop: 8 }}>{H.fmtMoney(d.arr)}</div>
              <div style={{ fontSize: 12, color: V.greyMed, marginBottom: 14 }}>{d.total} accounts</div>
              <HealthBar b={d} />
              <div style={{ marginTop: 10, fontSize: 12, color: d.arrAtRisk > 0 ? V.red : V.greenDeep, fontWeight: 600 }}>
                {d.arrAtRisk > 0 ? `${H.fmtMoney(d.arrAtRisk)} at risk` : 'No revenue at risk'}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* By Segment — vertical mix */}
      <div>
        <SectionLabel hint="Health across verticals — ranked by accounts at risk.">By Segment</SectionLabel>
        <div style={{ ...card, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: V.font }}>
            <thead>
              <tr style={{ background: V.greyBg }}>
                {['Segment', 'Accounts', 'Health', 'ARR', 'At risk'].map((h, i) => (
                  <th key={h} style={{ textAlign: i === 0 || i === 2 ? 'left' : 'right', padding: '9px 16px', fontSize: 10.5, fontWeight: 700,
                    color: V.greyMed, textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: `1px solid ${V.greyXLight}` }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {segData.map((d, i) => (
                <tr key={d.segment} onClick={() => openDrill(d.segment, d.accts)}
                  style={{ cursor: 'pointer', borderTop: i === 0 ? 'none' : `1px solid ${V.greyXLight}`, transition: 'background 120ms' }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = V.greyBgLight)}
                  onMouseLeave={(e) => (e.currentTarget.style.background = V.white)}>
                  <td style={{ padding: '11px 16px', fontSize: 13.5, fontWeight: 600, color: V.black }}>{d.segment}</td>
                  <td style={{ padding: '11px 16px', fontSize: 13, color: V.greyDark, textAlign: 'right' }}>{d.total}</td>
                  <td style={{ padding: '11px 16px', width: 200 }}><HealthBar b={d} height={10} /></td>
                  <td style={{ padding: '11px 16px', fontSize: 13, color: V.greyDark, textAlign: 'right' }}>{H.fmtMoney(d.arr)}</td>
                  <td style={{ padding: '11px 16px', fontSize: 13, textAlign: 'right', fontWeight: d.red.length ? 700 : 400, color: d.red.length ? V.red : V.greyMed }}>
                    {d.red.length ? H.fmtMoney(d.arrAtRisk) : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Drill-down */}
      {drill && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 70, display: 'flex', justifyContent: 'flex-end' }}>
          <div onClick={() => setDrill(null)} style={{ position: 'absolute', inset: 0, background: 'rgba(29,29,33,0.34)' }} />
          <aside style={{ position: 'relative', width: 520, maxWidth: '94vw', height: '100%', background: V.white, boxShadow: V.shadow3, display: 'flex', flexDirection: 'column', animation: 'slideIn 180ms ease-out' }}>
            <div style={{ padding: '18px 22px', borderBottom: `1px solid ${V.greyXLight}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexShrink: 0 }}>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700, color: V.black }}>{drill.label}</div>
                <div style={{ fontSize: 12, color: V.greyMed, marginTop: 2 }}>{drill.accts.length} accounts · {H.fmtMoney(drill.accts.reduce((s, c) => s + (c.arr || 0), 0))} ARR</div>
              </div>
              <button onClick={() => setDrill(null)} style={{ background: 'none', border: 0, cursor: 'pointer', fontSize: 20, color: V.greyMed, lineHeight: 1 }}>✕</button>
            </div>
            <div style={{ flex: 1, overflow: 'auto', padding: '8px 0' }}>
              {drill.accts.map((c) => {
                const flagged = c.status === 'risk' || c.status === 'stall' || c.status === 'watch';
                return (
                <div key={c.id} onClick={() => { setDrill(null); onSelect(c); }}
                  style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '11px 22px', cursor: 'pointer', transition: 'background 120ms' }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = V.greyBgLight)}
                  onMouseLeave={(e) => (e.currentTarget.style.background = V.white)}>
                  <div style={{ marginTop: 1 }}><StatusPill status={c.status} size="sm" /></div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 600, color: V.black, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.name}</div>
                    <div style={{ fontSize: 11.5, color: V.greyMed, marginTop: 1 }}>{c.segment} · {c.tier}</div>
                    {flagged && c.headline && (
                      <div style={{ display: 'flex', gap: 6, marginTop: 5 }}>
                        <span style={{ width: 3, alignSelf: 'stretch', borderRadius: 2, background: c.status === 'watch' ? V.orangeDark : V.red, flexShrink: 0 }} />
                        <span style={{ fontSize: 11.5, color: V.greyDark, lineHeight: 1.4 }}>
                          {c.headline} <span style={{ color: c.status === 'watch' ? V.orangeDark : V.red, fontWeight: 600 }}>{H.fmtArr(c.arr)} at stake.</span>
                        </span>
                      </div>
                    )}
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: V.black, flexShrink: 0, marginTop: 1 }}>{H.fmtArr(c.arr)}</div>
                  <div style={{ marginTop: 2 }}><Icon name="chevronRight" size={15} color={V.greyLight} /></div>
                </div>
                );
              })}
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}

function CsmSummaryView({ onSelect }) {
  const H = window.HEALTH;
  const all = H.customers;
  const [pinged, setPinged] = React.useState(() => lGet('cc_csm_pinged', {}));
  const [escalating, setEscalating] = React.useState(null);
  const [filter, setFilter] = React.useState('all'); // all | needsHelp | noTouch
  const setPing = (csm) => setPinged((prev) => { const next = { ...prev, [csm]: Date.now() }; lSet('cc_csm_pinged', next); return next; });
  const clearPing = (csm) => setPinged((prev) => { const next = { ...prev }; delete next[csm]; lSet('cc_csm_pinged', next); return next; });

  const csmNames = Array.from(new Set(all.map((c) => c.csm))).filter((n) => n !== 'Unassigned').sort();
  const allRollups = csmNames.map((n) => csmRollup(all, n));
  const unassigned = csmRollup(all, 'Unassigned');

  const needsHelpCount = allRollups.filter((r) => r.needsHelp).length;
  const totalNoTouch = allRollups.reduce((a, r) => a + r.noTouch.length, 0) + unassigned.noTouch.length;
  const totalArrAtRisk = allRollups.reduce((a, r) => a + r.arrAtRisk, 0) + unassigned.arrAtRisk;
  const totalBookArr = allRollups.reduce((a, r) => a + r.arr, 0) + unassigned.arr;
  const avgBookArr = csmNames.length ? Math.round(allRollups.reduce((a, r) => a + r.arr, 0) / csmNames.length) : 0;
  // Book concentration — ARR share per CSM. A continuity / key-person check, NOT a ranking.
  const concentration = [...allRollups, ...(unassigned.accounts.length ? [unassigned] : [])]
    .filter((r) => r.accounts.length > 0)
    .map((r) => ({ csm: r.csm, arr: r.arr, accounts: r.accounts.length }))
    .sort((a, b) => b.arr - a.arr);
  const concentrationTotal = concentration.reduce((a, r) => a + r.arr, 0) || 1;
  const topShare = concentration.length ? Math.round((concentration[0].arr / concentrationTotal) * 100) : 0;

  const matchFilter = (r) => filter === 'all' || (filter === 'needsHelp' ? r.needsHelp : r.noTouch.length > 0);
  const rollups = allRollups.filter(matchFilter);
  const showUnassigned = unassigned.accounts.length > 0 && matchFilter(unassigned);
  const tog = (k) => setFilter((f) => f === k ? 'all' : k);

  return (
    <div>
      <div style={{ display: 'flex', gap: 14, marginBottom: 16, flexWrap: 'wrap' }}>
        <Kpi icon="dollar" tone="neutral" value={H.fmtMoney(totalBookArr)} label="Book under management" sub={`${csmNames.length} CSMs`} active={filter === 'all'} onClick={() => setFilter('all')} />
        <Kpi icon="briefcase" tone="neutral" value={H.fmtMoney(avgBookArr)} label="Avg book / CSM" sub="capacity check" />
        <Kpi icon="alert" tone="red" value={needsHelpCount} label="Need support" sub={`${H.fmtMoney(totalArrAtRisk)} ARR concentrated`} active={filter === 'needsHelp'} onClick={() => tog('needsHelp')} />
        <Kpi icon="clock" tone="neutral" value="—" label="Last contact" sub="Pending CRM sync" />
      </div>

      {filter !== 'all' && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14, fontSize: 12.5, color: V.greyMed }}>
          Showing <strong style={{ color: V.black }}>CSMs that need support</strong> ({rollups.length + (showUnassigned ? 1 : 0)}).
          <button onClick={() => setFilter('all')} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: 'transparent', border: 0, cursor: 'pointer', padding: 0, fontSize: 12.5, fontWeight: 600, color: V.blue, fontFamily: V.font }}>
            <Icon name="close" size={12} color={V.blue} />Clear
          </button>
        </div>
      )}

      <SectionHeading title="By CSM" count={rollups.length + (showUnassigned ? 1 : 0)} hint="Where the team needs support — not a ranking. A CSM carrying several at-risk accounts needs help rebalancing, not a low score. Click a number to see those accounts." />
      <ColumnLegend />
      {rollups.length === 0 && !showUnassigned ? (
        <div style={{ border: `1px solid ${V.greyXLight}`, borderRadius: 8, padding: 22, textAlign: 'center', fontSize: 13, color: V.greyMed, background: V.white, marginBottom: 24 }}>
          No CSMs match this filter right now.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
          {rollups.map((r) => (
            <CsmSummaryCard key={r.csm} rollup={r} onSelect={onSelect} pingedAt={pinged[r.csm]} onEscalate={() => setEscalating(r)} onClearPing={() => clearPing(r.csm)} />
          ))}
          {showUnassigned && (
            <CsmSummaryCard rollup={unassigned} onSelect={onSelect} pingedAt={pinged['Unassigned']} onEscalate={() => setEscalating(unassigned)} onClearPing={() => clearPing('Unassigned')} />
          )}
        </div>
      )}

      <SectionHeading title="Book concentration" hint="How portfolio ARR is spread across the team — a continuity check (key-person risk), not a ranking." />
      <div style={{ background: V.white, border: `1px solid ${V.greyXLight}`, borderRadius: 8, boxShadow: V.shadow2, padding: '16px 18px', marginBottom: 24 }}>
        <div style={{ fontSize: 12.5, color: V.greyMed, marginBottom: 14, lineHeight: '18px' }}>
          The largest book holds <strong style={{ color: V.black }}>{topShare}%</strong> of managed ARR. Worth watching if too much revenue sits with any one person.
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {concentration.map((r) => {
            const pct = Math.round((r.arr / concentrationTotal) * 100);
            return (
              <div key={r.csm} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ flex: '0 0 150px', fontSize: 13, fontWeight: 600, color: r.csm === 'Unassigned' ? V.greyMed : V.black, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.csm}</span>
                <div style={{ flex: 1, height: 14, borderRadius: 999, background: V.greyXLight, overflow: 'hidden' }}>
                  <div title={`${r.csm}: ${H.fmtMoney(r.arr)} (${pct}%)`} style={{ width: `${pct}%`, height: '100%', background: r.csm === 'Unassigned' ? V.greyLight : V.greyDark, borderRadius: 999 }} />
                </div>
                <span style={{ flex: '0 0 116px', textAlign: 'right', fontSize: 12.5, color: V.greyDark }}>{H.fmtMoney(r.arr)} · {pct}%</span>
              </div>
            );
          })}
        </div>
      </div>

      {escalating && (
        <EscalateModal rollup={escalating} onClose={() => setEscalating(null)} onPing={() => setPing(escalating.csm)} />
      )}
    </div>
  );
}

function touchBucket(touchDays) {
  if (touchDays == null) return { label: 'No contact on record', rank: 4, tone: 'red' };
  if (touchDays >= 90) return { label: `${touchDays}d — 90+ no contact`, rank: 3, tone: 'red' };
  if (touchDays >= 60) return { label: `${touchDays}d — 60+ no contact`, rank: 2, tone: 'orange' };
  if (touchDays >= 30) return { label: `${touchDays}d — 30+ no contact`, rank: 1, tone: 'orange' };
  return { label: `${touchDays}d ago`, rank: 0, tone: 'grey' };
}

function tGetPinged() { return lGet('cc_account_pinged', {}); }
function tSetPinged(v) { lSet('cc_account_pinged', v); }

function PingAccountModal({ account, onClose, onPing }) {
  const H = window.HEALTH;
  const bucket = touchBucket(account.touchDays);
  const playbook = window.playbookFor ? window.playbookFor(account) : null;
  const pbRef = playbook ? `Playbook ${playbook.code} (${playbook.name})` : 'the suggested playbook';
  const outreachLine = account.touchDays == null
    ? `No outreach logged. Use ${pbRef} to re-engage, then update the Customer Log with the outreach date and what was discussed.`
    : `${bucket.label}. Use ${pbRef} to re-engage, then update the Customer Log with the outreach date and what was discussed.`;
  const [note, setNote] = React.useState('');
  const [sending, setSending] = React.useState(false);
  const [error, setError] = React.useState(null);

  const send = async () => {
    setError(null);
    setSending(true);
    try {
      const resp = await postRelay( {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kind: 'needs_attention',
          account: account.name,
          csm: account.csm === 'Unassigned' ? 'Unassigned' : account.csm,
          reason: simpleReason(account),
          outreach: outreachLine,
          link: accountDeepLink(account.id),
          playbook: playbook ? `${playbook.code} — ${playbook.name}` : null,
          note,
        }),
      });
      if (!resp.ok) throw new Error('Relay returned ' + resp.status);
      if (window.Sync) {
        window.Sync.logActivity({
          who: 'Riley', action: 'pinged', account: account.name,
          detail: account.headline || H.STATUS[account.status].label,
          full: {
            'Sent to': account.csm === 'Unassigned' ? 'Unassigned' : account.csm,
            'Reason': account.headline || H.STATUS[account.status].label,
            'Outreach status': outreachLine,
            'Playbook': playbook ? `${playbook.code} — ${playbook.name}` : null,
            'Note': note || null,
          },
        });
      }
      onPing();
      onClose();
    } catch (e) {
      setError("Couldn't reach Slack — check the relay is deployed and try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 70, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(29,29,33,0.34)' }} />
      <div style={{ position: 'relative', width: 480, maxWidth: '100%', maxHeight: '90vh', background: V.white, borderRadius: 12, boxShadow: V.shadow3, display: 'flex', flexDirection: 'column', fontFamily: V.font, overflow: 'hidden' }}>
        <div style={{ padding: '18px 22px', borderBottom: `1px solid ${V.greyXLight}`, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexShrink: 0 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
              <Icon name="bell" size={18} color={V.black} strokeWidth={1.9} />
              <h3 style={{ fontSize: 18, fontWeight: 700, color: V.black, margin: 0 }}>Ping — {account.name}</h3>
            </div>
            <div style={{ fontSize: 12.5, color: V.greyMed, marginTop: 5 }}>Flags this account in #cs-alerts so {account.csm === 'Unassigned' ? 'the team' : account.csm} can act on it.</div>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 0, cursor: 'pointer', padding: 6 }}><Icon name="close" size={20} color={V.greyDark} /></button>
        </div>

        <div style={{ flex: 1, overflow: 'auto', padding: '16px 22px 22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
            <StatusPill status={account.status} size="sm" />
            <CsmTag csm={account.csm} />
            <Chip tone={bucket.tone} icon="clock">{bucket.label}</Chip>
          </div>

          <div style={{ fontSize: 11, fontWeight: 700, color: V.greyMed, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Message preview</div>
          <div style={{ border: `1px solid ${V.greyXLight}`, borderRadius: 8, padding: '12px 14px', marginBottom: 18, background: V.greyBgLight, fontSize: 13, lineHeight: '20px', color: V.black }}>
            <div style={{ fontWeight: 700 }}>Needs attention: {account.name}</div>
            <div><strong>Assigned CSM:</strong> {account.csm === 'Unassigned' ? 'Unassigned' : account.csm}</div>
            <div><strong>Why:</strong> {simpleReason(account)}</div>
            <div><strong>Outreach:</strong> {outreachLine}</div>
          </div>

          <div style={{ fontSize: 11, fontWeight: 700, color: V.greyMed, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Add a note (optional)</div>
          <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Anything else they should know…"
            style={{ width: '100%', minHeight: 64, padding: '8px 10px', fontSize: 13, fontFamily: V.font, color: V.black, border: `1px solid ${V.greyLight}`, borderRadius: 6, outline: 'none', resize: 'vertical', boxSizing: 'border-box' }} />
          {error && <div style={{ marginTop: 10, fontSize: 12.5, color: V.red }}>{error}</div>}
          <div style={{ marginTop: 10, fontSize: 12, color: V.greyMed, lineHeight: '16px' }}>Posts to <strong>#cs-alerts</strong> via the test relay.</div>
        </div>

        <div style={{ padding: '14px 22px', borderTop: `1px solid ${V.greyXLight}`, display: 'flex', justifyContent: 'flex-end', gap: 10, flexShrink: 0 }}>
          <Button kind="secondary" size="md" onClick={onClose}>Cancel</Button>
          <Button kind="primary" size="md" icon="slack" onClick={send} disabled={sending}>{sending ? 'Sending…' : 'Ping #cs-alerts'}</Button>
        </div>
      </div>
    </div>
  );
}

function MarkOutreachModal({ account, onClose, onLogged, by = 'Riley' }) {
  const H = window.HEALTH;
  const today = new Date('2026-06-11').toISOString().slice(0, 10);
  const addDays = (iso, n) => { const d = new Date(iso); d.setDate(d.getDate() + n); return d.toISOString().slice(0, 10); };
  const detected = window.playbookFor ? window.playbookFor(account) : null;
  const PB = (window.PLAYBOOKS_DATA && window.PLAYBOOKS_DATA.playbooks) || {};
  const pbOptions = Object.values(PB).map((p) => ({ code: p.code, title: p.title }));
  const [pbCode, setPbCode] = React.useState(detected ? detected.code : (pbOptions[0] && pbOptions[0].code) || '');
  const [date, setDate] = React.useState(today);
  const [followUp, setFollowUp] = React.useState(addDays(today, 30));
  const [note, setNote] = React.useState('');
  const [sending, setSending] = React.useState(false);
  const [error, setError] = React.useState(null);
  const pbName = (PB[pbCode] && PB[pbCode].title) || (detected && detected.name) || pbCode;
  const fmtDay = (iso) => new Date(iso).toLocaleString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });

  const save = async () => {
    window.HEALTH.logOutreach(account.id, date, by, note);
    try { const fu = JSON.parse(localStorage.getItem('cc_followups') || '{}'); fu[account.id] = followUp; localStorage.setItem('cc_followups', JSON.stringify(fu)); } catch (e) {}
    // Permanent per-account record in the Customer Log (the modal promises this).
    try {
      if (window.NOTESDB) {
        const updated = { ...window.NOTESDB.get('cc_acct_notes', {}) };
        const list = (updated[account.id] || []).slice();
        list.push({
          id: window.NOTESDB.uid(), ts: Date.now(), type: 'call', by, source: 'Manual',
          summary: `Outreach logged${pbCode ? ` · ${pbCode} — ${pbName}` : ''} · follow-up ${fmtDay(followUp)}`,
          fullNotes: note || null,
        });
        updated[account.id] = list;
        window.NOTESDB.set('cc_acct_notes', updated);
      }
    } catch (e) {}
    if (window.Sync) {
      window.Sync.logActivity({
        who: by, action: 'logged outreach', account: account.name,
        detail: `${fmtDay(date)}${pbCode ? ' · ' + pbCode : ''}${note ? ' · ' + note : ''} · follow-up ${fmtDay(followUp)}`,
        full: { 'Outreach date': date, 'Playbook': pbCode ? `${pbCode} — ${pbName}` : null, 'Follow-up due': followUp, 'Note': note || null },
      });
    }
    onLogged();
    setError(null);
    setSending(true);
    try {
      const resp = await postRelay( {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kind: 'outreach_logged', account: account.name, csm: account.csm === 'Unassigned' ? 'Unassigned' : account.csm, outreach: date, playbook: pbCode ? `${pbCode} — ${pbName}` : null, followUp, note }),
      });
      if (!resp.ok) throw new Error('Relay returned ' + resp.status);
      onClose();
    } catch (e) {
      setError("Logged to the Customer Log, but couldn't post the Slack confirmation.");
    } finally {
      setSending(false);
    }
  };

  const lbl = { fontSize: 11, fontWeight: 700, color: V.greyMed, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 };
  const field = { width: '100%', height: 36, padding: '0 10px', fontSize: 13, fontFamily: V.font, color: V.black, border: `1px solid ${V.greyLight}`, borderRadius: 6, outline: 'none', boxSizing: 'border-box', background: V.white };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 80, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(29,29,33,0.34)' }} />
      <div style={{ position: 'relative', width: 440, maxWidth: '100%', maxHeight: '90vh', background: V.white, borderRadius: 12, boxShadow: V.shadow3, display: 'flex', flexDirection: 'column', fontFamily: V.font, overflow: 'hidden' }}>
        <div style={{ padding: '18px 22px', borderBottom: `1px solid ${V.greyXLight}`, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexShrink: 0 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
              <Icon name="check2" size={18} color={V.black} strokeWidth={1.9} />
              <h3 style={{ fontSize: 18, fontWeight: 700, color: V.black, margin: 0 }}>Log outreach</h3>
            </div>
            <div style={{ fontSize: 12.5, color: V.greyMed, marginTop: 5 }}>{account.name} · records to the Customer Log</div>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 0, cursor: 'pointer', padding: 6 }}><Icon name="close" size={20} color={V.greyDark} /></button>
        </div>
        <div style={{ padding: '16px 22px 20px', overflow: 'auto' }}>
          <div style={lbl}>Playbook used</div>
          <div style={{ marginBottom: 16 }}>
            <select value={pbCode} onChange={(e) => setPbCode(e.target.value)} style={field}>
              {pbOptions.map((p) => <option key={p.code} value={p.code}>{p.code} · {p.title}</option>)}
            </select>
            {detected && detected.code === pbCode && <div style={{ fontSize: 11.5, color: V.greenDeep, marginTop: 6 }}>Recommended for this trigger.</div>}
          </div>
          <div style={{ display: 'flex', gap: 12, marginBottom: 14 }}>
            <div style={{ flex: 1 }}>
              <div style={lbl}>Date of outreach</div>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} max={today} style={field} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={lbl}>Follow-up by</div>
              <input type="date" value={followUp} onChange={(e) => setFollowUp(e.target.value)} min={date} style={field} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 6, marginBottom: 16, alignItems: 'center', flexWrap: 'wrap' }}>
            {[['+7d', 7], ['+14d', 14], ['+30d', 30]].map(([t, n]) => (
              <button key={t} onClick={() => setFollowUp(addDays(date, n))} style={{ border: `1px solid ${followUp === addDays(date, n) ? V.green : V.greyLight}`, background: followUp === addDays(date, n) ? V.greenLight : V.white, color: followUp === addDays(date, n) ? V.greenDeep : V.greyDark, borderRadius: 4, padding: '5px 12px', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: V.font }}>{t}</button>
            ))}
            <span style={{ fontSize: 11.5, color: V.greyMed }}>from outreach date</span>
          </div>
          <div style={lbl}>What did you discuss? (optional)</div>
          <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Walked through the dip, confirmed a workflow change on their end. Recap sent."
            style={{ width: '100%', minHeight: 64, padding: '8px 10px', fontSize: 13, fontFamily: V.font, color: V.black, border: `1px solid ${V.greyLight}`, borderRadius: 6, outline: 'none', resize: 'vertical', boxSizing: 'border-box' }} />
          <div style={{ marginTop: 12, fontSize: 12, color: V.greyMed, lineHeight: '16px' }}>Logs to the <strong>Customer Log</strong>, moves {account.name} into <strong>In follow-up</strong>, and sets the follow-up for <strong>{fmtDay(followUp)}</strong>.</div>
          {error && <div style={{ marginTop: 10, fontSize: 12.5, color: V.red }}>{error}</div>}
        </div>
        <div style={{ padding: '14px 22px', borderTop: `1px solid ${V.greyXLight}`, display: 'flex', justifyContent: 'flex-end', gap: 10, flexShrink: 0 }}>
          <Button kind="secondary" size="md" onClick={onClose}>{error ? 'Close' : 'Cancel'}</Button>
          <Button kind="primary" size="md" icon="check" onClick={save} disabled={sending}>{sending ? 'Saving…' : error ? 'Retry' : 'Log outreach'}</Button>
        </div>
      </div>
    </div>
  );
}

function AccountsAttentionView({ onSelect }) {
  const H = window.HEALTH;
  const [pinged, setPinged] = React.useState(() => tGetPinged());
  const [pinging, setPinging] = React.useState(null);
  const [markingOutreach, setMarkingOutreach] = React.useState(null);
  const [tick, setTick] = React.useState(0); // bump to re-read window.HEALTH.customers after logOutreach mutates in place
  const [naFilter, setNaFilter] = React.useState('all'); // all | noContact90 | notified | watch
  const setPing = (id, value) => setPinged((prev) => {
    const next = { ...prev };
    if (value === null) delete next[id];
    else next[id] = Date.now();
    tSetPinged(next);
    return next;
  });

  const all = H.customers;
  // Needs Attention: the two real triggers only (Cert Activity Stall = stall, Low Usage = risk).
  // No-touch is a reminder signal in the ping/list, not a separate inclusion criterion.
  const needsAttentionAll = all
    .filter((c) => (c.status === 'stall' || c.status === 'risk') && !c.snoozedUntil)
    .map((c) => ({ ...c, _bucket: touchBucket(c.touchDays) }))
    .sort((a, b) => {
      if (b._bucket.rank !== a._bucket.rank) return b._bucket.rank - a._bucket.rank;
      return H.STATUS[a.status].rank - H.STATUS[b.status].rank;
    });

  const watch = all
    .filter((c) => c.status === 'watch')
    .map((c) => ({ ...c, _bucket: touchBucket(c.touchDays) }))
    .sort((a, b) => H.STATUS[a.status].rank - H.STATUS[b.status].rank);

  const notNotified = needsAttentionAll.filter((c) => !pinged[c.id]);
  const noContact90 = needsAttentionAll.filter((c) => c._bucket.rank >= 3).length;

  const needsAttention = naFilter === 'noContact90' ? needsAttentionAll.filter((c) => c._bucket.rank >= 3)
    : naFilter === 'notified' ? needsAttentionAll.filter((c) => pinged[c.id])
    : needsAttentionAll;
  const tog = (k) => setNaFilter((f) => f === k ? 'all' : k);

  // Leadership money picture: ARR-weighted exposure across the whole book.
  const arrBy = (pred) => all.filter(pred).reduce((s, c) => s + (c.arr || 0), 0);
  const exposure = [
    { key: 'risk', label: 'At risk', color: V.red, arr: arrBy((c) => c.status === 'stall' || c.status === 'risk') },
    { key: 'watch', label: 'Watch', color: V.orangeDark, arr: arrBy((c) => c.status === 'watch') },
    { key: 'upsell', label: 'Upsell', color: V.purple, arr: arrBy((c) => c.status === 'upsell') },
    { key: 'healthy', label: 'Healthy', color: V.green, arr: arrBy((c) => c.status === 'healthy' || c.status === 'onboarding') },
  ];
  const totalArr = all.reduce((s, c) => s + (c.arr || 0), 0) || 1;
  const flaggedArr = arrBy((c) => ['stall', 'risk', 'watch'].includes(c.status));

  const Row = ({ c, showPing }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px' }}>
      <StatusPill status={c.status} size="sm" />
      <div onClick={() => onSelect(c)} style={{ flex: 1, minWidth: 0, cursor: 'pointer' }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: V.black }}>{c.name}</div>
        <div style={{ fontSize: 12, color: V.greyMed, marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {c.headline || c.segment}{c.headline ? <span style={{ color: V.red, fontWeight: 600 }}> · {H.fmtArr(c.arr)} at stake</span> : null}
        </div>
      </div>
      <CsmTag csm={c.csm} />
      <Chip tone={c._bucket.tone} icon="clock">{c._bucket.label}</Chip>
      <div style={{ minWidth: 70, textAlign: 'right', fontSize: 13, fontWeight: 700, color: V.black }}>{H.fmtArr(c.arr)}</div>
      {showPing && (
        <div style={{ display: 'flex', gap: 6 }}>
          <Button kind="ghost" size="sm" icon="check2" onClick={() => setMarkingOutreach(c)}>Mark outreach</Button>
          {pinged[c.id] ? (
            <>
              <Chip tone="green" icon="check" title={new Date(pinged[c.id]).toLocaleString()}>Notified · {relTime(pinged[c.id])}</Chip>
              <button onClick={() => setPing(c.id, null)} title="Clear notified status" style={{ background: 'transparent', border: 0, cursor: 'pointer', padding: 2, display: 'inline-flex' }}>
                <Icon name="close" size={13} color={V.greyMed} />
              </button>
            </>
          ) : (
            <Button kind="secondary" size="sm" icon="bell" onClick={() => setPinging(c)}>Ping</Button>
          )}
        </div>
      )}
    </div>
  );

  return (
    <div>
      <div style={{ background: V.white, border: `1px solid ${V.greyXLight}`, borderRadius: 8, boxShadow: V.shadow2, padding: '14px 18px', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12, marginBottom: 10, flexWrap: 'wrap' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: V.black }}>ARR by health</div>
          <div style={{ fontSize: 12, color: V.greyMed }}><strong style={{ color: V.red }}>{H.fmtMoney(flaggedArr)}</strong> of {H.fmtMoney(totalArr)} flagged</div>
        </div>
        <div style={{ display: 'flex', height: 14, borderRadius: 999, overflow: 'hidden', background: V.greyXLight }}>
          {exposure.map((s) => s.arr > 0 && (
            <div key={s.key} title={`${s.label}: ${H.fmtMoney(s.arr)}`} style={{ width: `${(s.arr / totalArr) * 100}%`, background: s.color }} />
          ))}
        </div>
        <div style={{ display: 'flex', gap: 16, marginTop: 9, flexWrap: 'wrap' }}>
          {exposure.map((s) => s.arr > 0 && (
            <span key={s.key} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11.5, color: V.greyMed }}>
              <span style={{ width: 8, height: 8, borderRadius: 2, background: s.color }} />{s.label} · {H.fmtMoney(s.arr)}
            </span>
          ))}
        </div>
      </div>
      <div style={{ display: 'flex', gap: 14, marginBottom: 16, flexWrap: 'wrap' }}>
        <Kpi icon="alert" tone="red" value={needsAttentionAll.length} label="Needs attention" sub="Cert Activity Stall or Low Usage trigger" active={naFilter === 'all'} onClick={() => setNaFilter('all')} />
        <Kpi icon="clock" tone="orange" value={noContact90} label="90+ days, no contact" sub="oldest in the queue" active={naFilter === 'noContact90'} onClick={() => tog('noContact90')} />
        <Kpi icon="bell" tone="neutral" value={needsAttentionAll.length - notNotified.length} label="Notified" sub={`of ${needsAttentionAll.length} flagged`} active={naFilter === 'notified'} onClick={() => tog('notified')} />
        <Kpi icon="activity" tone="neutral" value={watch.length} label="Watch" sub="trending down, no action yet" onClick={() => { const el = document.getElementById('watch-section'); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' }); }} />
      </div>

      <SectionHeading title="Needs attention" count={needsAttention.length} hint="Driven by the two core triggers (Product Usage Stall, Low Usage Across Contract) — sorted by how long it's been since last contact. Ping reminds the CSM to update the Customer Log and log outreach; Mark outreach removes it from this list until it ages back past 30/60/90 days." />
      {naFilter !== 'all' && (
        <div style={{ marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5, color: V.greyMed }}>
          Filtered to {naFilter === 'noContact90' ? '90+ days, no contact' : 'Notified'}.
          <button onClick={() => setNaFilter('all')} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: 'transparent', border: 0, cursor: 'pointer', padding: 0, fontSize: 12.5, fontWeight: 600, color: V.blue, fontFamily: V.font }}>
            <Icon name="close" size={12} color={V.blue} />Clear
          </button>
        </div>
      )}
      <div style={{ border: `1px solid ${V.greyXLight}`, borderRadius: 8, overflow: 'hidden', background: V.white, boxShadow: V.shadow2, marginBottom: 28 }}>
        {needsAttention.length === 0 ? (
          <div style={{ padding: 22, textAlign: 'center', fontSize: 13, color: V.greyMed }}>
            {naFilter !== 'all' ? 'Nothing matches this filter right now.' : 'Nothing needs attention right now.'}
          </div>
        ) : needsAttention.map((c, i) => (
          <div key={c.id} style={{ borderBottom: i === needsAttention.length - 1 ? 'none' : `1px solid ${V.greyXLight}` }}>
            <Row c={c} showPing />
          </div>
        ))}
      </div>

      <div id="watch-section">
        <SectionHeading title="Watch" count={watch.length} hint="Trending down but below the trigger threshold. Visibility only — usually already has context in the Customer Log, no ping needed yet." />
        <div style={{ border: `1px solid ${V.greyXLight}`, borderRadius: 8, overflow: 'hidden', background: V.white, boxShadow: V.shadow2 }}>
          {watch.length === 0 ? (
            <div style={{ padding: 22, textAlign: 'center', fontSize: 13, color: V.greyMed }}>Nothing on watch right now.</div>
          ) : watch.map((c, i) => (
            <div key={c.id} style={{ borderBottom: i === watch.length - 1 ? 'none' : `1px solid ${V.greyXLight}`, opacity: 0.85 }}>
              <Row c={c} showPing={false} />
            </div>
          ))}
        </div>
      </div>

      {pinging && <PingAccountModal account={pinging} onClose={() => setPinging(null)} onPing={() => setPing(pinging.id)} />}
      {markingOutreach && <MarkOutreachModal account={markingOutreach} onClose={() => setMarkingOutreach(null)} onLogged={() => setTick((t) => t + 1)} />}
    </div>
  );
}

function ActivityView({ onSelect }) {
  const H = window.HEALTH;
  const log = window.Sync ? window.Sync.get('cc_activity_log', []) : [];
  const status = window.Sync ? window.Sync.status() : { enabled: false };

  const ACTION_ICON = {
    pinged: 'bell', 'auto-pinged (needs attention)': 'bell', 'auto-pinged (save)': 'check2',
    'marked outreach': 'check2', escalated: 'bell', 'added to watch': 'activity', 'removed from watch': 'activity',
    'marked no action needed': 'shield', 'removed no-action mark': 'shield', snoozed: 'clock',
  };
  const ACTION_TONE = {
    pinged: 'orange', 'auto-pinged (needs attention)': 'orange', 'auto-pinged (save)': 'green',
    'marked outreach': 'green', escalated: 'orange', 'added to watch': 'purple', 'removed from watch': 'grey',
    'marked no action needed': 'green', 'removed no-action mark': 'grey', snoozed: 'blue',
  };

  const [expanded, setExpanded] = React.useState({});

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        <SectionHeading title="Team activity" count={log.length} hint="Pings, outreach, watch flags, snoozes, and overrides across the team — shared via the shared backend sync layer so it's not siloed per browser." />
        {status.enabled ? (
          <Chip tone={status.lastError ? 'red' : 'green'} icon={status.lastError ? 'alert' : 'check2'}>
            {status.lastError ? 'Sync issue' : 'Synced'}
          </Chip>
        ) : (
          <Chip tone="orange" icon="alert">Sync not configured — showing this browser only</Chip>
        )}
      </div>

      {log.length === 0 ? (
        <div style={{ border: `1px solid ${V.greyXLight}`, borderRadius: 8, padding: 22, textAlign: 'center', fontSize: 13, color: V.greyMed, background: V.white }}>
          No activity yet — pings, outreach, and overrides will show up here.
        </div>
      ) : (
        <div style={{ border: `1px solid ${V.greyXLight}`, borderRadius: 8, overflow: 'hidden', background: V.white, boxShadow: V.shadow2 }}>
          {log.map((e, i) => {
            const c = e.account ? H.customers.find((x) => x.name === e.account) : null;
            const hasFull = e.full && Object.values(e.full).some((v) => v != null && v !== '');
            const isOpen = !!expanded[i];
            return (
              <div key={i} style={{ borderBottom: i === log.length - 1 ? 'none' : `1px solid ${V.greyXLight}` }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '11px 16px' }}>
                  <span style={{ flexShrink: 0, width: 28, height: 28, borderRadius: '50%', background: V.greyBg, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginTop: 1 }}>
                    <Icon name={ACTION_ICON[e.action] || 'clock'} size={13} color={V.greyDark} strokeWidth={1.9} />
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, color: V.black, lineHeight: '18px' }}>
                      <span style={{ fontWeight: 600 }}>{e.who}</span>{' '}
                      <Chip tone={ACTION_TONE[e.action] || 'grey'}>{e.action}</Chip>{' '}
                      {c ? (
                        <span onClick={() => onSelect(c)} style={{ fontWeight: 600, color: V.blue, cursor: 'pointer' }}>{e.account}</span>
                      ) : (
                        <span style={{ fontWeight: 600 }}>{e.account}</span>
                      )}
                    </div>
                    {e.detail && <div style={{ fontSize: 12, color: V.greyMed, marginTop: 2, lineHeight: '16px' }}>{e.detail}</div>}
                    {hasFull && (
                      <button onClick={() => setExpanded((p) => ({ ...p, [i]: !p[i] }))} style={{ marginTop: 6, background: 'transparent', border: 0, cursor: 'pointer', padding: 0, fontSize: 12, fontWeight: 600, color: V.blue, fontFamily: V.font, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Icon name={isOpen ? 'chevronUp' : 'chevronDown'} size={12} color={V.blue} />
                        {isOpen ? 'Hide details' : 'Show details'}
                      </button>
                    )}
                  </div>
                  <div style={{ fontSize: 11.5, color: V.greyMed, flexShrink: 0, marginTop: 2 }}>{nFmt(e.ts)}</div>
                </div>
                {hasFull && isOpen && (
                  <div style={{ padding: '2px 16px 14px 56px' }}>
                    <div style={{ border: `1px solid ${V.greyXLight}`, borderRadius: 6, background: V.greyBgLight, padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {Object.entries(e.full).filter(([, v]) => v != null && v !== '').map(([k, v]) => (
                        <div key={k} style={{ fontSize: 12.5, lineHeight: '17px' }}>
                          <span style={{ fontWeight: 600, color: V.greyDark }}>{k}: </span>
                          <span style={{ color: V.black, whiteSpace: 'pre-wrap' }}>{v}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function RiskRevenueView({ onSelect }) {
  const H = window.HEALTH;
  const all = H.customers;
  const FLAGGED = ['stall', 'risk', 'watch', 'upsell'];
  const [flagFilter, setFlagFilter] = React.useState('all'); // all | touched
  const [openSeg, setOpenSeg] = React.useState(null);

  // Renewals at risk — next 90 days, owner has health Yellow/Red
  const renewalsAtRisk = all.filter((c) => c.renewalDays <= 90 && c.renewalDays >= 0 && c.sfHealth !== 'Green')
    .sort((a, b) => a.renewalDays - b.renewalDays);
  const arrAtRisk90 = renewalsAtRisk.reduce((a, c) => a + c.arr, 0);

  // Program impact — flagged → touched
  const flaggedAll = all.filter((c) => FLAGGED.includes(c.status))
    .sort((a, b) => H.STATUS[a.status].rank - H.STATUS[b.status].rank);
  const flaggedArr = flaggedAll.reduce((a, c) => a + c.arr, 0);
  const isTouched = (c) => c.outreach && c.outreach.state !== 'needed' && c.outreach.state !== 'none';
  const touched = flaggedAll.filter(isTouched);
  const untouchedList = flaggedAll.filter((c) => !isTouched(c));
  const flagged = flagFilter === 'touched' ? touched : flagFilter === 'untouched' ? untouchedList : flaggedAll;

  // Risk by segment
  const segMap = {};
  all.forEach((c) => {
    segMap[c.segment] = segMap[c.segment] || { segment: c.segment, total: 0, atRisk: 0, arr: 0, arrAtRisk: 0, flaggedAccts: [] };
    segMap[c.segment].total += 1;
    segMap[c.segment].arr += c.arr;
    if (FLAGGED.includes(c.status)) { segMap[c.segment].atRisk += 1; segMap[c.segment].arrAtRisk += c.arr; segMap[c.segment].flaggedAccts.push(c); }
  });
  const segments = Object.values(segMap).sort((a, b) => b.arrAtRisk - a.arrAtRisk);
  const maxSegArr = Math.max(1, ...segments.map((s) => s.arrAtRisk));

  // Coverage — of flagged ARR, how much is being worked vs untouched.
  const workedArr = touched.reduce((a, c) => a + c.arr, 0);
  const untouchedArr = Math.max(0, flaggedArr - workedArr);
  const workedPct = flaggedArr ? Math.round((workedArr / flaggedArr) * 100) : 0;
  const untouchedCount = flaggedAll.length - touched.length;

  // Risk by tier — portfolio shape of exposure.
  const TIER_ORDER = ['Enterprise', 'Mid-Market', 'Scaled'];
  const tierMap = {};
  all.forEach((c) => {
    const t = c.tier || '—';
    tierMap[t] = tierMap[t] || { tier: t, total: 0, atRisk: 0, arr: 0, arrAtRisk: 0, flaggedAccts: [] };
    tierMap[t].total += 1; tierMap[t].arr += c.arr;
    if (FLAGGED.includes(c.status)) { tierMap[t].atRisk += 1; tierMap[t].arrAtRisk += c.arr; tierMap[t].flaggedAccts.push(c); }
  });
  const tiers = TIER_ORDER.filter((t) => tierMap[t]).map((t) => tierMap[t]).concat(Object.values(tierMap).filter((t) => !TIER_ORDER.includes(t.tier)));
  const maxTierArr = Math.max(1, ...tiers.map((t) => t.arrAtRisk));
  const [openTier, setOpenTier] = React.useState(null);

  return (
    <div>
      <div style={{ display: 'flex', gap: 14, marginBottom: 24, flexWrap: 'wrap' }}>
        <Kpi icon="alert" tone="orange" value={renewalsAtRisk.length} label="Renewals at risk" sub={`next 90 days · ${H.fmtMoney(arrAtRisk90)} ARR`} onClick={() => { const el = document.getElementById('renewals-section'); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' }); }} />
        <Kpi icon="trendingDown" tone="red" value={flaggedAll.length} label="Flagged accounts" sub={`${H.fmtMoney(flaggedArr)} ARR`} active={flagFilter === 'all'} onClick={() => setFlagFilter('all')} />
        <Kpi icon="check2" tone="neutral" value={touched.length} label="Being worked" sub={`${H.fmtMoney(workedArr)} ARR · ${workedPct}% of flagged`} active={flagFilter === 'touched'} onClick={() => setFlagFilter((f) => f === 'touched' ? 'all' : 'touched')} />
        <Kpi icon="alert" tone={untouchedArr > 0 ? 'red' : 'neutral'} value={untouchedCount} label="Untouched" sub={`${H.fmtMoney(untouchedArr)} ARR · no outreach yet`} active={flagFilter === 'untouched'} onClick={() => { setFlagFilter((f) => f === 'untouched' ? 'all' : 'untouched'); const el = document.getElementById('flagged-section'); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' }); }} />
      </div>

      <SectionHeading title="Risk coverage" hint="Of the ARR currently flagged, how much the team is actively working vs. still untouched — the untouched slice is open exposure." />
      <div style={{ background: V.white, border: `1px solid ${V.greyXLight}`, borderRadius: 8, boxShadow: V.shadow2, padding: '16px 18px', marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12, marginBottom: 10, flexWrap: 'wrap' }}>
          <div style={{ fontSize: 13, color: V.greyDark }}><strong style={{ color: V.black }}>{H.fmtMoney(workedArr)}</strong> of {H.fmtMoney(flaggedArr)} flagged ARR is being worked</div>
          <div style={{ fontSize: 12.5, color: untouchedArr > 0 ? V.red : V.greenDeep, fontWeight: 600 }}>{untouchedArr > 0 ? `${H.fmtMoney(untouchedArr)} untouched` : 'Full coverage'}</div>
        </div>
        <div style={{ display: 'flex', height: 16, borderRadius: 999, overflow: 'hidden', background: V.greyXLight }}>
          {workedArr > 0 && <div title={`Being worked: ${H.fmtMoney(workedArr)}`} style={{ width: `${(workedArr / (flaggedArr || 1)) * 100}%`, background: V.green }} />}
          {untouchedArr > 0 && <div title={`Untouched: ${H.fmtMoney(untouchedArr)}`} style={{ width: `${(untouchedArr / (flaggedArr || 1)) * 100}%`, background: V.red }} />}
        </div>
        <div style={{ display: 'flex', gap: 18, marginTop: 10, flexWrap: 'wrap' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11.5, color: V.greyMed }}><span style={{ width: 8, height: 8, borderRadius: 2, background: V.green }} />Being worked · {touched.length} accts · {H.fmtMoney(workedArr)}</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11.5, color: V.greyMed }}><span style={{ width: 8, height: 8, borderRadius: 2, background: V.red }} />Untouched · {untouchedCount} accts · {H.fmtMoney(untouchedArr)}</span>
        </div>
        <div style={{ marginTop: 12, paddingTop: 10, borderTop: `1px solid ${V.greyXLight}`, fontSize: 11.5, color: V.greyMed, lineHeight: '16px' }}>Saves and time-to-touch trends populate once outreach history accumulates — see Build Plan.</div>
      </div>


      <div id="renewals-section">
        <SectionHeading title="Renewals at risk — next 90 days" count={renewalsAtRisk.length} hint="Sorted by urgency. Owner, health, and ARR for each." />
        <div style={{ border: `1px solid ${V.greyXLight}`, borderRadius: 8, overflow: 'hidden', background: V.white, boxShadow: V.shadow2, marginBottom: 28 }}>
          {renewalsAtRisk.length === 0 ? (
            <div style={{ padding: 22, textAlign: 'center', fontSize: 13, color: V.greyMed }}>No at-risk renewals in the next 90 days.</div>
          ) : renewalsAtRisk.map((c, i) => (
            <div key={c.id} onClick={() => onSelect(c)} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 16px', cursor: 'pointer', borderBottom: i === renewalsAtRisk.length - 1 ? 'none' : `1px solid ${V.greyXLight}` }}>
              <StatusPill status={c.status} size="sm" />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: V.black }}>{c.name}</div>
                <div style={{ fontSize: 12, color: V.greyMed, marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.headline || c.segment}{c.headline ? <span style={{ color: V.red, fontWeight: 600 }}> · {H.fmtArr(c.arr)} at stake</span> : null}</div>
              </div>
              <CsmTag csm={c.csm} />
              <Chip tone={c.sfHealth === 'Red' ? 'red' : 'orange'}>{c.sfHealth} health</Chip>
              <OutreachStatus c={c} />
              <div style={{ textAlign: 'right', minWidth: 90 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: V.black }}>{H.fmtArr(c.arr)}</div>
                <div style={{ fontSize: 11.5, color: V.orangeDark, fontWeight: 600 }}>{c.renewalDays}d away</div>
              </div>
              <Icon name="chevronRight" size={15} color={V.greyLight} />
            </div>
          ))}
        </div>
      </div>

      <div id="flagged-section">
        <SectionHeading title="Flagged accounts" count={flagged.length} hint="Every account currently in Stall, At Risk, Watch, or Upsell — with whether outreach has been logged. Use the Touched tile above to filter to accounts that have been contacted." />
        {flagFilter !== 'all' && (
          <div style={{ marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5, color: V.greyMed }}>
            Filtered to {flagFilter === 'touched' ? 'Being worked' : 'Untouched'}.
            <button onClick={() => setFlagFilter('all')} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: 'transparent', border: 0, cursor: 'pointer', padding: 0, fontSize: 12.5, fontWeight: 600, color: V.blue, fontFamily: V.font }}>
              <Icon name="close" size={12} color={V.blue} />Clear
            </button>
          </div>
        )}
        <div style={{ border: `1px solid ${V.greyXLight}`, borderRadius: 8, overflow: 'hidden', background: V.white, boxShadow: V.shadow2, marginBottom: 28 }}>
          {flagged.length === 0 ? (
            <div style={{ padding: 22, textAlign: 'center', fontSize: 13, color: V.greyMed }}>
              {flagFilter !== 'all' ? 'No accounts match this filter.' : 'No flagged accounts right now.'}
            </div>
          ) : flagged.map((c, i) => (
            <div key={c.id} onClick={() => onSelect(c)} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 16px', cursor: 'pointer', borderBottom: i === flagged.length - 1 ? 'none' : `1px solid ${V.greyXLight}` }}>
              <StatusPill status={c.status} size="sm" />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: V.black }}>{c.name}</div>
                <div style={{ fontSize: 12, color: V.greyMed, marginTop: 2 }}>{c.segment}</div>
              </div>
              <CsmTag csm={c.csm} />
              <OutreachStatus c={c} />
              <div style={{ textAlign: 'right', minWidth: 80, fontSize: 14, fontWeight: 700, color: V.black }}>{H.fmtArr(c.arr)}</div>
              <Icon name="chevronRight" size={15} color={V.greyLight} />
            </div>
          ))}
        </div>
      </div>

      <SectionHeading title="Risk by tier" count={tiers.length} hint="ARR exposure by account tier — where the flagged revenue is concentrated. Click a tier to see the accounts behind it." />
      <div style={{ border: `1px solid ${V.greyXLight}`, borderRadius: 8, overflow: 'hidden', background: V.white, boxShadow: V.shadow2 }}>
        {tiers.map((s, i) => {
          const isOpen = openTier === s.tier;
          return (
            <div key={s.tier} style={{ borderBottom: i === tiers.length - 1 ? 'none' : `1px solid ${V.greyXLight}` }}>
              <div onClick={() => s.atRisk > 0 && setOpenTier(isOpen ? null : s.tier)} style={{ padding: '12px 16px', cursor: s.atRisk > 0 ? 'pointer' : 'default' }}>
                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12, marginBottom: 7 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 600, color: V.black }}>{s.tier}</div>
                  <div style={{ fontSize: 12, color: V.greyMed }}>
                    <span style={{ color: s.arrAtRisk ? V.red : V.greyMed, fontWeight: s.arrAtRisk ? 700 : 400 }}>{H.fmtMoney(s.arrAtRisk)}</span> at risk · {s.total} accts · {H.fmtMoney(s.arr)} total
                  </div>
                </div>
                <div style={{ height: 12, borderRadius: 999, background: V.greyXLight, overflow: 'hidden' }}>
                  <div style={{ width: `${(s.arrAtRisk / maxTierArr) * 100}%`, height: '100%', background: s.arrAtRisk ? V.red : V.greyLight, borderRadius: 999 }} />
                </div>
              </div>
              {isOpen && (
                <div style={{ background: V.greyBgLight, borderTop: `1px solid ${V.greyXLight}` }}>
                  {s.flaggedAccts.sort((a, b) => H.STATUS[a.status].rank - H.STATUS[b.status].rank).map((c) => (
                    <div key={c.id} onClick={() => onSelect(c)} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '9px 16px 9px 22px', cursor: 'pointer', borderTop: `1px solid ${V.greyXLight}` }}>
                      <StatusPill status={c.status} size="sm" />
                      <div style={{ flex: 1, minWidth: 0, fontSize: 13, fontWeight: 600, color: V.black, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.name}</div>
                      <CsmTag csm={c.csm} />
                      <div style={{ fontSize: 13, fontWeight: 700, color: V.black }}>{H.fmtArr(c.arr)}</div>
                      <Icon name="chevronRight" size={15} color={V.greyLight} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: 28 }}>
        <SectionHeading title="Risk by segment" count={segments.length} hint="ARR exposure by industry segment — bar length is ARR currently flagged. Click a segment to see the accounts behind it." />
        <div style={{ border: `1px solid ${V.greyXLight}`, borderRadius: 8, overflow: 'hidden', background: V.white, boxShadow: V.shadow2 }}>
          {segments.map((s, i) => {
            const isOpen = openSeg === s.segment;
            return (
              <div key={s.segment} style={{ borderBottom: i === segments.length - 1 ? 'none' : `1px solid ${V.greyXLight}` }}>
                <div onClick={() => s.atRisk > 0 && setOpenSeg(isOpen ? null : s.segment)} style={{ padding: '12px 16px', cursor: s.atRisk > 0 ? 'pointer' : 'default' }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12, marginBottom: 7 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 600, color: V.black }}>{s.segment}</div>
                    <div style={{ fontSize: 12, color: V.greyMed }}>
                      <span style={{ color: s.arrAtRisk ? V.red : V.greyMed, fontWeight: s.arrAtRisk ? 700 : 400 }}>{H.fmtMoney(s.arrAtRisk)}</span> at risk · {s.total} accts · {H.fmtMoney(s.arr)} total
                    </div>
                  </div>
                  <div style={{ height: 12, borderRadius: 999, background: V.greyXLight, overflow: 'hidden' }}>
                    <div style={{ width: `${(s.arrAtRisk / maxSegArr) * 100}%`, height: '100%', background: s.arrAtRisk ? V.red : V.greyLight, borderRadius: 999 }} />
                  </div>
                </div>
                {isOpen && (
                  <div style={{ background: V.greyBgLight, borderTop: `1px solid ${V.greyXLight}` }}>
                    {s.flaggedAccts.sort((a, b) => H.STATUS[a.status].rank - H.STATUS[b.status].rank).map((c) => (
                      <div key={c.id} onClick={() => onSelect(c)} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '9px 16px 9px 22px', cursor: 'pointer', borderTop: `1px solid ${V.greyXLight}` }}>
                        <StatusPill status={c.status} size="sm" />
                        <div style={{ flex: 1, minWidth: 0, fontSize: 13, fontWeight: 600, color: V.black, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.name}</div>
                        <CsmTag csm={c.csm} />
                        <div style={{ fontSize: 13, fontWeight: 700, color: V.black }}>{H.fmtArr(c.arr)}</div>
                        <Icon name="chevronRight" size={15} color={V.greyLight} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ───────────────────────────────────────────────────────────────────────────
// Trigger Settings — leadership-facing thresholds + active trigger log
// ───────────────────────────────────────────────────────────────────────────

// Trigger Settings — now lives under Leadership > Settings as page content
// (previously a modal opened from every page's header).
function TriggerSettingsSection({ declinePct, watchPct, onThresholdChange }) {
  const H = window.HEALTH;
  const [testAccountId, setTestAccountId] = React.useState(() => {
    const flagged = H.customers.find((c) => c.status === 'stall' || c.status === 'risk');
    return (flagged || H.customers[0] || {}).id || '';
  });
  const [testKind, setTestKind] = React.useState('needs_attention'); // 'needs_attention' | 'save'
  const [testState, setTestState] = React.useState('idle'); // idle | sending | sent | error

  const sendTestPing = async () => {
    const account = H.customers.find((c) => c.id === testAccountId);
    if (!account) return;
    setTestState('sending');
    // Simulate the transition: needs_attention assumes coming from healthy/watch;
    // save assumes coming from stall/risk. The current status/headline are used as-is.
    const simulated = { ...account, _prevStatus: testKind === 'save' ? 'stall' : 'healthy' };
    try {
      await pingTransition(simulated, testKind);
      setTestState('sent');
      setTimeout(() => setTestState('idle'), 2000);
    } catch (e) {
      setTestState('error');
    }
  };

  return (
    <div style={{ background: V.white, border: `1px solid ${V.greyXLight}`, borderRadius: 8, boxShadow: V.shadow2, padding: '18px 22px', marginBottom: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 5 }}>
        <Icon name="target" size={18} color={V.tealDeep} strokeWidth={1.9} />
        <h3 style={{ fontSize: 18, fontWeight: 700, color: V.black, margin: 0 }}>Trigger settings</h3>
      </div>
      <div style={{ fontSize: 12.5, color: V.greyMed, marginBottom: 18 }}>Adjust the core thresholds and define new triggers for the team.</div>

      <div style={{ fontSize: 11, fontWeight: 700, color: V.greyMed, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>Core thresholds</div>
      <div style={{ border: `1px solid ${V.greyXLight}`, borderRadius: 8, padding: '14px 16px', marginBottom: 22, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
            <span style={{ fontWeight: 600, color: V.black }}>Decline / growth trigger</span>
            <span style={{ color: V.greyDark }}>{declinePct}%</span>
          </div>
          <input type="range" min={15} max={50} step={5} value={declinePct} onChange={(e) => onThresholdChange('declinePct', Number(e.target.value))}
            style={{ width: '100%', accentColor: V.green }} />
          <div style={{ fontSize: 11.5, color: V.greyMed, marginTop: 4 }}>MoM (or vs 3-month-high) drop past this flags <strong>At Risk</strong>; the same rise flags <strong>Upsell</strong>.</div>
        </div>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
            <span style={{ fontWeight: 600, color: V.black }}>Cumulative slide (Watch)</span>
            <span style={{ color: V.greyDark }}>{watchPct}%</span>
          </div>
          <input type="range" min={10} max={40} step={5} value={watchPct} onChange={(e) => onThresholdChange('watchPct', Number(e.target.value))}
            style={{ width: '100%', accentColor: V.green }} />
          <div style={{ fontSize: 11.5, color: V.greyMed, marginTop: 4 }}>A softer cumulative slide past this flags <strong>Watch</strong>.</div>
        </div>
      </div>

      <div style={{ fontSize: 11, fontWeight: 700, color: V.greyMed, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>Active triggers</div>
      <div style={{ border: `1px solid ${V.greyXLight}`, borderRadius: 8, overflow: 'hidden' }}>
        {[
          { name: 'Low Usage Across Contract', status: 'risk', metric: 'Logins · MoM (or vs. 3-month-high)', rule: `Drops more than ${declinePct}%`, tone: 'red' },
          { name: 'Product Usage Stall', status: 'stall', metric: 'Logins', rule: 'Flat at zero while logins continue', tone: 'red' },
          { name: 'Watch (early warning)', status: 'watch', metric: 'Logins · cumulative since window start', rule: `Cumulative slide past ${watchPct}%`, tone: 'orange' },
          { name: 'Upsell', status: 'upsell', metric: 'Logins · MoM', rule: `Rises more than ${declinePct}%`, tone: 'green' },
        ].map((row, i, arr) => (
          <div key={row.name} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '11px 14px', borderBottom: i === arr.length - 1 ? 'none' : `1px solid ${V.greyXLight}`, background: V.white }}>
            <Chip tone={row.tone}>{row.name}</Chip>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12.5, color: V.black, fontWeight: 600 }}>{row.metric}</div>
              <div style={{ fontSize: 12, color: V.greyMed, marginTop: 2 }}>{row.rule}</div>
            </div>
            <StatusPill status={row.status} size="sm" />
          </div>
        ))}
      </div>
      <div style={{ fontSize: 11.5, color: V.greyMed, marginTop: 10, lineHeight: '16px' }}>
        These are the triggers currently evaluated against every account, using the thresholds above. Adding a genuinely new trigger (a new metric beyond login/login volume) requires connecting that data source first — see Build Plan.
      </div>

      <div style={{ height: 1, background: V.greyXLight, margin: '20px 0' }} />

      <div style={{ fontSize: 11, fontWeight: 700, color: V.greyMed, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>Test Slack pings</div>
      <div style={{ border: `1px solid ${V.greyXLight}`, borderRadius: 8, padding: '14px 16px' }}>
        <div style={{ fontSize: 12.5, color: V.greyDark, lineHeight: '18px', marginBottom: 12 }}>
          Sends a real message to <strong>#cs-alerts</strong> using an account's current data, formatted as if it had just transitioned. Doesn't change the account's actual status or the auto-ping history — safe to run anytime.
        </div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
          <select value={testAccountId} onChange={(e) => setTestAccountId(e.target.value)}
            style={{ flex: 1, minWidth: 180, height: 34, padding: '0 8px', fontSize: 13, fontFamily: V.font, color: V.black, border: `1px solid ${V.greyLight}`, borderRadius: 6, background: V.white }}>
            {H.customers.map((c) => <option key={c.id} value={c.id}>{c.name} ({H.STATUS[c.status].label})</option>)}
          </select>
          <select value={testKind} onChange={(e) => setTestKind(e.target.value)}
            style={{ height: 34, padding: '0 8px', fontSize: 13, fontFamily: V.font, color: V.black, border: `1px solid ${V.greyLight}`, borderRadius: 6, background: V.white }}>
            <option value="needs_attention">Needs attention</option>
            <option value="save">Save (improved)</option>
          </select>
          <Button kind="secondary" size="md" icon="slack" onClick={sendTestPing} disabled={testState === 'sending'}>
            {testState === 'sending' ? 'Sending…' : testState === 'sent' ? 'Sent ✓' : 'Send test ping'}
          </Button>
        </div>
        {testState === 'error' && <div style={{ fontSize: 12.5, color: V.red }}>Couldn't reach Slack — check the relay is deployed.</div>}
      </div>
    </div>
  );
}


function SettingsView({ declinePct, watchPct, setThreshold }) {
  return (
    <div>
      <TriggerSettingsSection declinePct={declinePct} watchPct={watchPct} onThresholdChange={setThreshold} />
      <AlertSettingsSection />
    </div>
  );
}

function downloadCsv(filename, cols, rows) {
  const cell = (v) => { const s = String(v == null ? '' : v); return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; };
  const lines = [cols.map(cell).join(',')];
  rows.forEach((r) => lines.push(r.map(cell).join(',')));
  const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = filename; a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

// Builds a CSV for the active Leadership tab — exports what you're looking at.
function buildLeadershipCsv(tab, H) {
  const all = H.customers;
  const ACCT_COLS = ['Account', 'CSM', 'Segment', 'Tier', 'Status', 'ARR', 'Renewal', 'Days to renewal', 'Why'];
  const acctRow = (c) => [c.name, c.csm, c.segment, c.tier, H.STATUS[c.status].label, c.arr, H.fmtRenewal(c.renewal), c.renewalDays, c.headline];
  if (tab === 'csm') {
    const names = Array.from(new Set(all.map((c) => c.csm))).filter((n) => n !== 'Unassigned').sort();
    const rows = names.map((n) => { const r = csmRollup(all, n); return [n, r.accounts.length, r.arr, r.red.length, r.arrAtRisk, r.watch.length, r.noTouch.length]; });
    return { filename: 'leadership-csm-summary.csv', cols: ['CSM', 'Accounts', 'Book ARR', 'At risk', 'ARR at risk', 'On watch', 'No-touch'], rows };
  }
  if (tab === 'activity') {
    const log = window.Sync ? window.Sync.get('cc_activity_log', []) : [];
    const rows = log.map((e) => [e.ts ? new Date(e.ts).toLocaleString() : '', e.who, e.action, e.account, e.detail || '']);
    return { filename: 'leadership-activity.csv', cols: ['Time', 'Who', 'Action', 'Account', 'Detail'], rows };
  }
  const flagged = tab === 'accounts' || tab === 'risk';
  const src = (flagged ? all.filter((c) => ['stall', 'risk', 'watch'].includes(c.status)) : all.slice()).sort((a, b) => b.arr - a.arr);
  return { filename: `leadership-${tab}.csv`, cols: ACCT_COLS, rows: src.map(acctRow) };
}

function ExportMenu({ tab }) {
  const H = window.HEALTH;
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef(null);
  React.useEffect(() => {
    const onDoc = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);
  const item = { display: 'flex', alignItems: 'center', gap: 9, width: '100%', padding: '8px 10px', border: 0, background: 'transparent', borderRadius: 5, cursor: 'pointer', fontSize: 13, fontWeight: 500, fontFamily: V.font, color: V.greyDark, textAlign: 'left' };
  const doCsv = () => { const { filename, cols, rows } = buildLeadershipCsv(tab, H); downloadCsv(filename, cols, rows); setOpen(false); };
  const doPrint = () => { setOpen(false); setTimeout(() => window.print(), 80); };
  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <Button kind="secondary" size="md" icon="download" iconRight="chevronDown" onClick={() => setOpen((o) => !o)}>Export</Button>
      {open && (
        <div style={{ position: 'absolute', top: 'calc(100% + 6px)', right: 0, minWidth: 212, background: V.white, border: `1px solid ${V.greyLight}`, borderRadius: 8, boxShadow: V.shadow2, padding: 6, zIndex: 90 }}>
          <button style={item} onClick={doCsv} onMouseEnter={(e) => (e.currentTarget.style.background = V.greyBgLight)} onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}>
            <Icon name="fileText" size={15} color={V.greyDark} />Download CSV
          </button>
          <button style={item} onClick={doPrint} onMouseEnter={(e) => (e.currentTarget.style.background = V.greyBgLight)} onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}>
            <Icon name="printer" size={15} color={V.greyDark} />Print / Save as PDF
          </button>
        </div>
      )}
    </div>
  );
}

function LeadershipOverview({ onSelect, declinePct, watchPct, setThreshold, initialTab }) {
  const [tab, setTab] = React.useState(initialTab || 'overview');
  React.useEffect(() => {
    if (initialTab) setTab(initialTab);
  }, [initialTab]);
  return (
    <main style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'transparent', overflow: 'hidden', minWidth: 0 }}>
      <header style={{ padding: '18px 32px 16px', background: V.white, borderBottom: `1px solid ${V.greyXLight}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, fontSize: 12, color: V.greyMed }}>
          <span>Leadership</span><Icon name="chevronRight" size={12} color={V.greyLight} /><span style={{ color: V.greyDark }}>Overview</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', marginBottom: 12 }}>
          <h2 style={{ fontSize: 26, fontWeight: 700, color: V.black, margin: 0, letterSpacing: '-0.02em' }}>Leadership Overview</h2>
          {tab !== 'settings' && <ExportMenu tab={tab} />}
        </div>
        <div style={{ display: 'flex', gap: 2, background: V.greyXLight, padding: 2, borderRadius: 6, width: 'fit-content', flexWrap: 'wrap' }}>
          {LEAD_TABS.map((t) => (
            <button key={t.key} onClick={() => setTab(t.key)} style={{
              display: 'inline-flex', alignItems: 'center', gap: 6, border: 0, cursor: 'pointer', borderRadius: 4, padding: '7px 14px', fontSize: 13, fontWeight: 600, fontFamily: V.font,
              background: tab === t.key ? V.white : 'transparent', color: tab === t.key ? V.greenDeep : V.greyDark,
              boxShadow: tab === t.key ? V.shadow1 : 'none',
            }}>
              <Icon name={t.icon} size={14} color={tab === t.key ? V.greenDeep : V.greyDark} />{t.label}
            </button>
          ))}
        </div>
      </header>
      <div style={{ flex: 1, overflow: 'auto', padding: '24px 32px 48px' }}>
        {tab === 'overview' ? <OverviewView onSelect={onSelect} />
          : tab === 'csm' ? <CsmSummaryView onSelect={onSelect} />
          : tab === 'accounts' ? <AccountsAttentionView onSelect={onSelect} />
          : tab === 'risk' ? <RiskRevenueView onSelect={onSelect} />
          : tab === 'activity' ? <ActivityView onSelect={onSelect} />
          : <SettingsView declinePct={declinePct} watchPct={watchPct} setThreshold={setThreshold} />}
      </div>
    </main>
  );
}

// ───────────────────────────────────────────────────────────────────────────
// Status-transition pings — fired once after data loads (not on every
// threshold tweak, to avoid spamming Slack while someone's dragging a slider).
// ───────────────────────────────────────────────────────────────────────────

async function pingTransition(account, kindLabel) {
  const H = window.HEALTH;
  const playbook = kindLabel === 'needs_attention' && window.playbookFor ? window.playbookFor(account) : null;
  const pbRef = playbook ? `Playbook ${playbook.code} (${playbook.name})` : 'the suggested playbook';
  try {
    await postRelay( {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        kind: kindLabel,
        account: account.name,
        csm: account.csm === 'Unassigned' ? 'Unassigned' : account.csm,
        reason: kindLabel === 'save'
          ? `${H.STATUS[account._prevStatus].label} → ${H.STATUS[account.status].label}`
          : simpleReason(account),
        outreach: kindLabel === 'needs_attention'
          ? (account.touchDays == null
              ? `No outreach logged. Use ${pbRef} to re-engage, then update the Customer Log with the outreach date and what was discussed.`
              : `${touchBucket(account.touchDays).label}. Use ${pbRef} to re-engage, then update the Customer Log with the outreach date and what was discussed.`)
          : undefined,
        link: kindLabel === 'needs_attention' ? accountDeepLink(account.id) : undefined,
        playbook: playbook ? `${playbook.code} — ${playbook.name}` : null,
      }),
    });
    if (window.Sync) {
      const isSave = kindLabel === 'save';
      window.Sync.logActivity({
        who: 'System', action: isSave ? 'auto-pinged (save)' : 'auto-pinged (needs attention)',
        account: account.name,
        detail: isSave ? `${H.STATUS[account._prevStatus].label} → ${H.STATUS[account.status].label}` : (account.headline || H.STATUS[account.status].label),
        full: isSave
          ? { 'Status change': `${H.STATUS[account._prevStatus].label} → ${H.STATUS[account.status].label}`, 'CSM': account.csm === 'Unassigned' ? 'Unassigned' : account.csm }
          : { 'CSM': account.csm === 'Unassigned' ? 'Unassigned' : account.csm, 'Reason': account.headline || H.STATUS[account.status].label, 'Outreach status': account.touchDays == null ? 'No outreach logged — please update the Customer Log.' : `${touchBucket(account.touchDays).label} — please log outreach once you've reached out.`, 'Playbook': playbook ? `${playbook.code} — ${playbook.name}` : null },
      });
    }
  } catch (e) {
    // Best-effort — auto-pings shouldn't block the UI on a failed fetch.
  }
}

async function checkTransitionsAndPing() {
  const H = window.HEALTH;
  if (!H || !H.detectTransitions) return { newAttention: [], saves: [] };
  const { newAttention, saves } = H.detectTransitions();
  for (const c of newAttention) await pingTransition(c, 'needs_attention');
  for (const c of saves) await pingTransition(c, 'save');
  return { newAttention, saves };
}

Object.assign(window, { Dashboard, CsmTag, LeadershipOverview, checkTransitionsAndPing, pingTransition, MarkOutreachModal });
