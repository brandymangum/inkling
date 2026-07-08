// Customer Health — Accounts directory (real CRM roster view)
// Loaded as <script type="text/babel" src="lib/accounts.jsx">

function ArrBar({ c }) {
  const parts = [
    { label: 'Core Platform', val: c.software, color: V.green },
    { label: 'Analytics', val: c.monitoring, color: V.purple },
    { label: 'Managed Services', val: c.cvo, color: V.blue },
    { label: 'Add-ons', val: c.licensing, color: V.orange },
    { label: 'Integrations', val: c.enrollment, color: V.greyMed },
  ].filter((p) => p.val > 0);
  const total = parts.reduce((a, p) => a + p.val, 0) || 1;
  return (
    <div title={parts.map((p) => `${p.label} ${window.HEALTH.fmtUSD0(p.val)}`).join(' · ')} style={{ display: 'flex', height: 6, borderRadius: 3, overflow: 'hidden', width: 92, background: V.greyXLight }}>
      {parts.map((p) => <div key={p.label} style={{ width: (p.val / total * 100) + '%', background: p.color }} />)}
    </div>
  );
}

function AcctStatusPill({ status }) {
  const launched = status === 'Launched';
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 600, color: launched ? V.greenDeep : V.blueDark, background: launched ? V.greenLight : V.blueBg, padding: '2px 9px', borderRadius: 64 }}>
      {status}
    </span>
  );
}

function SfHealthDot({ h }) {
  const dot = { Green: '#5F7D5A', Yellow: '#B08A38', Red: '#A9493F', '—': '#D8D3C7' }[h] || '#D8D3C7';
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: 13, color: V.greyDark }}>
      <span style={{ width: 9, height: 9, borderRadius: '50%', background: dot }} />
      {h === '—' ? 'New' : h}
    </span>
  );
}

function AcctTh({ children, align = 'left', width, sortable, active, dir, onClick }) {
  return (
    <th onClick={sortable ? onClick : undefined} style={{ textAlign: align, padding: '0 14px', height: 38, width, fontSize: 11, fontWeight: 600, color: active ? V.black : V.greyDark, textTransform: 'uppercase', letterSpacing: '0.04em', whiteSpace: 'nowrap', borderBottom: `1px solid ${V.greyXLight}`, background: V.greyBg, cursor: sortable ? 'pointer' : 'default', userSelect: 'none' }}>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, justifyContent: align === 'right' ? 'flex-end' : 'flex-start' }}>
        {children}{sortable && <Icon name={active ? (dir === 'asc' ? 'chevronUp' : 'chevronDown') : 'chevronDown'} size={12} color={active ? V.black : V.greyLight} />}
      </span>
    </th>
  );
}

function Accounts({ onSelect }) {
  const H = window.HEALTH;
  const all = H.customers;
  const [filter, setFilter] = React.useState('all');
  const matchFilter = (c) => {
    if (filter === 'all') return true;
    if (filter === 'launched') return c.accountStatus === 'Launched';
    if (filter === 'implementing') return c.accountStatus === 'Implementing';
    if (filter === 'red') return c.sfHealth === 'Red';
    if (filter === 'uncovered') return c.csm === 'Unassigned';
    return true;
  };
  const [sortKey, setSortKey] = React.useState('arr');
  const [dir, setDir] = React.useState('desc');
  const [q, setQ] = React.useState('');
  const setSort = (k) => { if (sortKey === k) setDir((d) => d === 'asc' ? 'desc' : 'asc'); else { setSortKey(k); setDir(k === 'name' ? 'asc' : 'desc'); } };
  const sfRank = { Red: 0, Yellow: 1, Green: 2, '—': 3 };
  const val = (c, k) => ({ name: c.name.toLowerCase(), arr: c.arr, renewal: c.renewalDays, sf: sfRank[c.sfHealth] ?? 4, status: c.accountStatus, signal: H.STATUS[c.status].rank, platform: c.platform }[k]);
  const rows = all.filter((c) => matchFilter(c) && c.name.toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => { const av = val(a, sortKey), bv = val(b, sortKey); const cmp = av < bv ? -1 : av > bv ? 1 : 0; return dir === 'asc' ? cmp : -cmp; });

  const totalArr = H.sum(all.map((c) => c.arr));
  const byStatus = (s) => all.filter((c) => c.accountStatus === s).length;
  const bySf = (h) => all.filter((c) => c.sfHealth === h).length;
  const uncovered = all.filter((c) => c.csm === 'Unassigned').length;
  const tog = (k) => setFilter(filter === k ? 'all' : k);

  const td = { padding: '0 14px', height: 56, borderBottom: `1px solid ${V.greyXLight}`, fontSize: 14, color: V.greyDark, verticalAlign: 'middle' };

  return (
    <main style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'transparent', overflow: 'hidden', minWidth: 0 }}>
      <header style={{ padding: '18px 32px 16px', background: V.white, borderBottom: `1px solid ${V.greyXLight}`, flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, fontSize: 12, color: V.greyMed }}>
          <span>Customer Success</span><Icon name="chevronRight" size={12} color={V.greyLight} /><span style={{ color: V.greyDark }}>Accounts</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
          <div>
            <h2 style={{ fontSize: 26, fontWeight: 700, color: V.black, margin: 0, letterSpacing: '-0.02em' }}>Accounts</h2>
            <div style={{ fontSize: 13.5, color: V.greyDark, marginTop: 7 }}>The full customer book — the system-of-record view from the CS Customer Report.</div>
          </div>
          <Chip tone="grey" icon="briefcase">All owners</Chip>
        </div>
      </header>

      <div style={{ flex: 1, overflow: 'auto', padding: '24px 32px 48px' }}>
        {/* summary strip — click a tile to filter the table */}
        <div style={{ display: 'flex', gap: 14, marginBottom: 24, flexWrap: 'wrap' }}>
          <AcctKpi label="All accounts" value={all.length} sub={`${H.fmtMoney(totalArr)} total ARR`} active={filter === 'all'} onClick={() => setFilter('all')} />
          <AcctKpi label="Launched" value={byStatus('Launched')} sub="In production" active={filter === 'launched'} onClick={() => tog('launched')} />
          <AcctKpi label="Implementing" value={byStatus('Implementing')} sub="Onboarding" active={filter === 'implementing'} onClick={() => tog('implementing')} />
          <AcctKpi label="CRM Red" value={bySf('Red')} sub="Flagged in CRM" tone="red" active={filter === 'red'} onClick={() => tog('red')} />
          <AcctKpi label="Uncovered" value={uncovered} sub="No assigned CSM" tone="red" active={filter === 'uncovered'} onClick={() => tog('uncovered')} />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, gap: 12, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, height: 32, padding: '0 10px', background: V.white, border: `1px solid ${V.greyLight}`, borderRadius: 4, width: 220 }}>
            <Icon name="search" size={14} color={V.greyMed} />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search accounts" style={{ border: 0, outline: 'none', flex: 1, fontSize: 13, fontFamily: V.font, color: V.black, background: 'transparent' }} />
          </div>
          <span style={{ fontSize: 12.5, color: V.greyMed }}>CRM Health is from CRM; Signal is what our triggers compute — when they disagree, that's the catch.</span>
        </div>

        <div style={{ border: `1px solid ${V.greyXLight}`, borderRadius: 8, overflow: 'hidden', background: V.white, boxShadow: V.shadow2 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: V.font, fontVariantNumeric: 'tabular-nums' }}>
            <thead>
              <tr>
                <AcctTh sortable active={sortKey === 'name'} dir={dir} onClick={() => setSort('name')}>Account</AcctTh>
                <AcctTh sortable active={sortKey === 'platform'} dir={dir} onClick={() => setSort('platform')} width={92}>Platform</AcctTh>
                <AcctTh sortable active={sortKey === 'status'} dir={dir} onClick={() => setSort('status')} width={110}>Status</AcctTh>
                <AcctTh sortable active={sortKey === 'sf'} dir={dir} onClick={() => setSort('sf')} width={104}>CRM Health</AcctTh>
                <AcctTh sortable active={sortKey === 'signal'} dir={dir} onClick={() => setSort('signal')} width={104}>Signal</AcctTh>
                <AcctTh sortable active={sortKey === 'arr'} dir={dir} onClick={() => setSort('arr')} align="right" width={150}>ARR</AcctTh>
                <AcctTh sortable active={sortKey === 'renewal'} dir={dir} onClick={() => setSort('renewal')} width={116}>Renewal</AcctTh>
                <AcctTh width={32}></AcctTh>
              </tr>
            </thead>
            <tbody>
              {rows.map((c, i) => <AcctRow key={c.id} c={c} td={{ ...td, borderBottom: i === rows.length - 1 ? 'none' : td.borderBottom }} onSelect={onSelect} H={H} />)}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}

function AcctRow({ c, td, onSelect, H }) {
  const [hover, setHover] = React.useState(false);
  const near = c.renewalDays <= 60;
  return (
    <tr onClick={() => onSelect(c)} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} style={{ background: hover ? V.greyBgLight : V.white, cursor: 'pointer' }}>
      <td style={td}>
        <div style={{ fontSize: 14, fontWeight: 600, color: V.black, lineHeight: 1.2 }}>{c.name}</div>
        <div style={{ fontSize: 12, color: V.greyMed, marginTop: 2 }}>{c.segment}</div>
      </td>
      <td style={td}><span style={{ fontSize: 12.5, color: V.greyDark }}>{c.platform}</span></td>
      <td style={td}><AcctStatusPill status={c.accountStatus} /></td>
      <td style={td}><SfHealthDot h={c.sfHealth} /></td>
      <td style={td}><StatusPill status={c.status} size="sm" /></td>
      <td style={{ ...td, textAlign: 'right' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 5 }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: V.black }}>{H.fmtArr(c.arr)}</span>
          <ArrBar c={c} />
        </div>
      </td>
      <td style={td}>
        <div style={{ fontSize: 13, color: V.greyDark }}>{H.fmtRenewal(c.renewal)}</div>
        {near && <div style={{ fontSize: 11, color: V.orangeDark, fontWeight: 600, marginTop: 2 }}>{c.renewalDays}d</div>}
      </td>
      <td style={{ ...td, textAlign: 'right' }}><Icon name="chevronRight" size={16} color={hover ? V.greyDark : V.greyLight} /></td>
    </tr>
  );
}

function AcctKpi({ label, value, sub, tone, active, onClick }) {
  const [hover, setHover] = React.useState(false);
  const accent = tone === 'red' ? V.red : V.greyDark;
  return (
    <div onClick={onClick} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{ flex: 1, minWidth: 150, background: V.white, border: `1px solid ${active ? accent : V.greyXLight}`, outline: active ? `1px solid ${accent}` : 'none', borderRadius: 8, padding: '14px 18px', boxShadow: (hover && onClick) ? V.shadow3 : V.shadow2, cursor: onClick ? 'pointer' : 'default', transition: 'box-shadow 120ms' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: V.greyDark }}>{label}</span>
        {onClick && <Icon name="filter" size={11} color={active ? accent : V.greyLight} />}
      </div>
      <div style={{ fontSize: 26, fontWeight: 700, color: tone === 'red' ? V.red : V.black, lineHeight: 1.1, marginTop: 6, letterSpacing: '-0.02em' }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: V.greyMed, marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

Object.assign(window, { Accounts });
