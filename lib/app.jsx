// Customer Health — app shell + nav
// Loaded last, after all component scripts.

function NavItem({ icon, label, active, muted, badge, onClick }) {
  const [hover, setHover] = React.useState(false);
  return (
    <div onClick={onClick} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', margin: '0 8px',
        borderRadius: 6, cursor: 'pointer',
        background: active ? V.greyXLight : (hover ? V.greyBg : 'transparent'),
        color: active ? V.black : (muted ? V.greyMed : V.greyDark),
      }}>
      <Icon name={icon} size={17} color={active ? V.black : (muted ? V.greyMed : V.greyDark)} strokeWidth={1.9} />
      <span style={{ fontSize: 13.5, fontWeight: active ? 600 : 500, flex: 1 }}>{label}</span>
      {badge !== undefined && (
        <span style={{ fontSize: 11, fontWeight: 700, color: V.red, background: V.redLight, borderRadius: 64, padding: '1px 7px' }}>{badge}</span>
      )}
    </div>
  );
}

function NavGroup({ label }) {
  return <div style={{ fontSize: 10.5, fontWeight: 700, color: V.greyMed, textTransform: 'uppercase', letterSpacing: '0.06em', padding: '0 20px', margin: '18px 0 8px' }}>{label}</div>;
}

function MenuRow({ icon, label, onClick, href, danger }) {
  const [h, setH] = React.useState(false);
  const inner = (
    <div onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)} onClick={onClick}
      style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 10px', borderRadius: 6, cursor: 'pointer', background: h ? V.greyBg : 'transparent', color: danger ? V.red : V.greyDark, fontSize: 13, fontWeight: 500 }}>
      <Icon name={icon} size={15} color={danger ? V.red : V.greyDark} strokeWidth={1.9} />
      <span style={{ flex: 1 }}>{label}</span>
      {href && <Icon name="externalLink" size={13} color={V.greyMed} />}
    </div>
  );
  return href ? <a href={href} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>{inner}</a> : inner;
}

function UserMenu({ theme, setTheme }) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef(null);
  React.useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h); return () => document.removeEventListener('mousedown', h);
  }, []);
  const opts = [['light', 'Light', 'sun'], ['dark', 'Dark', 'moon'], ['rainbow', 'Rainbow', 'sparkles']];
  return (
    <div ref={ref} style={{ position: 'relative', borderBottom: `1px solid ${V.greyXLight}`, padding: '12px' }}>
      {open && (
        <div style={{ position: 'absolute', top: 'calc(100% - 4px)', left: 12, right: 12, background: '#fff', border: `1px solid ${V.greyLight}`, borderRadius: 10, boxShadow: V.shadow3, padding: 7, zIndex: 40 }}>
          <div style={{ padding: '6px 10px 9px' }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: V.black }}>Alex</div>
            <div style={{ fontSize: 11.5, color: V.greyMed }}>alex@inklinghq.io · Digital CS</div>
          </div>
          <div style={{ height: 1, background: V.greyXLight, margin: '2px 0 6px' }} />
          <MenuRow icon="briefcase" label="Salesforce" href="https://example.lightning.force.com" />
          <MenuRow icon="trendingUp" label="the analytics warehouse" href="https://quicksight.aws.amazon.com" />
          <MenuRow icon="bell" label="the support desk" href="https://example.zendesk.com" />
          <div style={{ height: 1, background: V.greyXLight, margin: '6px 0' }} />
          <div style={{ padding: '2px 10px 7px', fontSize: 10.5, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: V.greyMed }}>Appearance</div>
          <div style={{ display: 'flex', gap: 5, padding: '0 6px 6px' }}>
            {opts.map(([k, label, ic]) => (
              <button key={k} onClick={() => setTheme(k)} style={{
                flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, padding: '9px 4px', borderRadius: 7, cursor: 'pointer', fontFamily: V.font, fontSize: 11, fontWeight: 600,
                border: `1px solid ${theme === k ? V.green : V.greyLight}`, background: theme === k ? V.greenLight : '#fff', color: theme === k ? V.greenDeep : V.greyDark,
              }}>
                <Icon name={ic} size={16} color={theme === k ? V.greenDeep : V.greyDark} strokeWidth={1.9} />
                {label}
              </button>
            ))}
          </div>
          <div style={{ height: 1, background: V.greyXLight, margin: '2px 0 6px' }} />
          <MenuRow icon="logout" label="Sign out" danger onClick={() => { window.location.href = 'Login.html'; }} />
        </div>
      )}
      <div onClick={() => setOpen((o) => !o)} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
        <span style={{ width: 32, height: 32, borderRadius: '50%', background: V.purpleLight, color: V.purpleDark, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700 }}>B</span>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: V.black }}>Alex</div>
          <div style={{ fontSize: 11.5, color: V.greyMed }}>Digital CS</div>
        </div>
        <Icon name={open ? 'chevronUp' : 'chevronDown'} size={15} color={V.greyMed} />
      </div>
    </div>
  );
}

function AppSidebar({ view, setView, flaggedCount, dataSource, theme, setTheme }) {
  const isFiles = /file/i.test(dataSource || '');
  return (
    <aside style={{ width: 248, flexShrink: 0, background: '#fff', borderRight: `1px solid ${V.greyXLight}`, display: 'flex', flexDirection: 'column', fontFamily: V.font }}>
      <div style={{ padding: '18px 20px 14px', display: 'flex', alignItems: 'center', gap: 9 }}>
        <InklingMark size={24} />
        <span style={{ fontFamily: V.font, fontWeight: 700, fontSize: 19, color: V.tealDeep, letterSpacing: '-0.3px' }}>inkling</span>
      </div>
      <UserMenu theme={theme} setTheme={setTheme} />

      <NavGroup label="Customer Success" />
      <NavItem icon="activity" label="Customer Health" active={view === 'dashboard'} badge={flaggedCount} onClick={() => setView('dashboard')} />
      <NavItem icon="users" label="Accounts" active={view === 'accounts'} onClick={() => setView('accounts')} />
      <NavItem icon="check2" label="Notes & Tasks" active={view === 'notes'} onClick={() => setView('notes')} />
      <NavItem icon="fileText" label="Playbooks" active={view === 'playbooks'} onClick={() => setView('playbooks')} />

      <NavGroup label="Digital CS POC" />
      <NavItem icon="layers" label="Build Plan" active={view === 'buildplan'} onClick={() => setView('buildplan')} />
      <NavItem icon="target" label="Triggers & Thresholds" active={view === 'triggers'} onClick={() => setView('triggers')} />

      <div style={{ flex: 1 }} />
      <div title={`Data source: ${dataSource || 'embedded'}`} style={{ margin: '0 12px 4px', padding: '8px 10px', borderRadius: 6, background: V.greyBg, display: 'flex', alignItems: 'center', gap: 8 }}>
        <Icon name="database" size={13} color={isFiles ? V.greenDeep : V.greyMed} strokeWidth={1.9} />
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: V.black }}>{isFiles ? 'Flat files' : 'Embedded data'}</div>
          <div style={{ fontSize: 10, color: V.greyMed, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{isFiles ? 'data/*.csv · swap to go live' : 'offline fallback'}</div>
        </div>
      </div>
      <div style={{ margin: '0 12px 12px', padding: '10px 10px 2px', borderTop: `1px solid ${V.greyXLight}`, fontSize: 10.5, lineHeight: '15px', color: V.greyMed }}>
        Concept, design &amp; solution architecture by <span style={{ fontWeight: 700, color: V.greyDark }}>Brandy Mangum</span>; built with the help of AI tooling.
      </div>
    </aside>
  );
}

function useIsMobile() {
  const [m, setM] = React.useState(() => (typeof window !== 'undefined' ? window.innerWidth <= 760 : false));
  React.useEffect(() => {
    const on = () => setM(window.innerWidth <= 760);
    window.addEventListener('resize', on); on();
    return () => window.removeEventListener('resize', on);
  }, []);
  return m;
}

function MobileNav({ view, setView, flaggedCount, theme, setTheme }) {
  const items = [
    ['dashboard', 'Health', 'activity', flaggedCount],
    ['accounts', 'Accounts', 'users'],
    ['notes', 'Notes', 'check2'],
    ['playbooks', 'Playbooks', 'fileText'],
    ['buildplan', 'Build', 'layers'],
    ['triggers', 'Triggers', 'target'],
  ];
  return (
    <header style={{ flexShrink: 0, background: '#fff', borderBottom: `1px solid ${V.greyXLight}`, fontFamily: V.font, position: 'relative', zIndex: 30 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <InklingMark size={22} />
          <span style={{ fontWeight: 700, fontSize: 17, color: V.tealDeep, letterSpacing: '-0.3px' }}>inkling</span>
        </div>
        <div style={{ position: 'relative', minWidth: 150 }}><UserMenu theme={theme} setTheme={setTheme} /></div>
      </div>
      <div style={{ display: 'flex', gap: 4, overflowX: 'auto', padding: '0 10px 10px', WebkitOverflowScrolling: 'touch' }}>
        {items.map(([key, label, icon, badge]) => {
          const on = view === key;
          return (
            <button key={key} onClick={() => setView(key)} style={{
              flexShrink: 0, display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 12px', borderRadius: 64, cursor: 'pointer', fontFamily: V.font, fontSize: 13, fontWeight: 600,
              border: `1px solid ${on ? V.green : V.greyLight}`, background: on ? V.greenLight : '#fff', color: on ? V.greenDeep : V.greyDark, whiteSpace: 'nowrap',
            }}>
              <Icon name={icon} size={14} color={on ? V.greenDeep : V.greyDark} strokeWidth={1.9} />{label}
              {badge ? <span style={{ fontSize: 10, fontWeight: 700, color: V.red, background: V.redLight, borderRadius: 64, padding: '0 6px' }}>{badge}</span> : null}
            </button>
          );
        })}
      </div>
    </header>
  );
}

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "declinePct": 30,
  "watchPct": 25,
  "density": "regular",
  "showSampleBadges": true
}/*EDITMODE-END*/;

function App() {
  const [view, setView] = React.useState('dashboard');
  const [selected, setSelected] = React.useState(null);
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [dataVer, setDataVer] = React.useState(0);
  const [dataSource, setDataSource] = React.useState(window.HEALTH.dataSource);
  const [theme, setThemeState] = React.useState(() => { try { return localStorage.getItem('cc_theme') || 'light'; } catch (e) { return 'light'; } });
  const setTheme = React.useCallback((v) => { setThemeState(v); try { localStorage.setItem('cc_theme', v); } catch (e) {} }, []);
  const [overrides, setOverrides] = React.useState(() => {
    try { return JSON.parse(localStorage.getItem('cc_overrides') || '{}'); } catch (e) { return {}; }
  });
  const setOverride = React.useCallback((id, val) => {
    setOverrides((prev) => {
      const next = { ...prev };
      if (val) next[id] = val; else delete next[id];
      try { localStorage.setItem('cc_overrides', JSON.stringify(next)); } catch (e) {}
      return next;
    });
  }, []);

  // re-derive every account's status/headline against the live thresholds before rendering children
  React.useMemo(() => window.HEALTH.applyThresholds(t), [t.declinePct, t.watchPct]);

  const flaggedCount = window.HEALTH.customers.filter((c) => ['stall', 'risk', 'watch', 'upsell'].includes(c.status) && overrides[c.id] !== 'noaction').length;

  React.useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') setSelected(null); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Load the flat files (data/*.csv) at startup; re-derive + re-render when they arrive.
  React.useEffect(() => {
    const onLoaded = () => {
      window.HEALTH.applyThresholds(t);
      setDataSource(window.HEALTH.dataSource);
      setDataVer((v) => v + 1);
    };
    document.addEventListener('health:loaded', onLoaded);
    window.HEALTH.loadFromFiles();
    return () => document.removeEventListener('health:loaded', onLoaded);
  }, []);

  const nonDefault = t.declinePct !== 30 || t.watchPct !== 25;
  const mobile = useIsMobile();

  return (
    <TweakCtx.Seat value={{ density: t.density, showSampleBadges: t.showSampleBadges }}>
      <OverrideCtx.Seat value={{ overrides, setOverride }}>
        <div style={{ display: 'flex', flexDirection: mobile ? 'column' : 'row', height: '100vh', background: theme === 'rainbow' ? 'linear-gradient(120deg,#fbecf0 0%,#fdf3e6 20%,#eef8ee 42%,#e9f3f7 62%,#eceefb 82%,#f4ecf8 100%)' : V.greyBg, fontFamily: V.font, overflow: 'hidden', filter: theme === 'dark' ? 'invert(0.93) hue-rotate(180deg)' : 'none' }}>
          {mobile
            ? <MobileNav view={view} setView={setView} flaggedCount={flaggedCount} theme={theme} setTheme={setTheme} />
            : <AppSidebar view={view} setView={setView} flaggedCount={flaggedCount} dataSource={dataSource} theme={theme} setTheme={setTheme} />}
          {view === 'dashboard' ? <Dashboard onSelect={setSelected} /> : view === 'playbooks' ? <Playbooks /> : view === 'accounts' ? <Accounts onSelect={setSelected} /> : view === 'notes' ? <NotesTasks onSelect={setSelected} /> : view === 'triggers' ? <Triggers /> : <BuildPlan />}
          {selected && <CustomerDetail c={selected} onClose={() => setSelected(null)} />}
        </div>
        <TweaksPanel>
          <TweakSection label="Trigger thresholds" />
          <TweakSlider label="Decline / growth trigger" value={t.declinePct} min={15} max={50} step={5} unit="%"
            onChange={(v) => setTweak('declinePct', v)} />
          <TweakSlider label="Cumulative slide (Watch)" value={t.watchPct} min={10} max={40} step={5} unit="%"
            onChange={(v) => setTweak('watchPct', v)} />
          <div style={{ fontSize: 11, color: '#A4A8AF', padding: '2px 2px 8px', lineHeight: '15px' }}>
            MoM (or vs 3-month-high) drop past the decline trigger flags <strong>At&nbsp;Risk</strong>; the same rise flags <strong>Upsell</strong>. A softer cumulative slide flags <strong>Watch</strong>.
            {nonDefault && <span style={{ color: '#D97A22' }}> · Off the proposed 30% baseline.</span>}
          </div>
          <TweakSection label="Display" />
          <TweakRadio label="Density" value={t.density} options={['compact', 'regular', 'comfy']}
            onChange={(v) => setTweak('density', v)} />
          <TweakToggle label="Show sample-data badges" value={t.showSampleBadges}
            onChange={(v) => setTweak('showSampleBadges', v)} />
        </TweaksPanel>
      </OverrideCtx.Seat>
    </TweakCtx.Seat>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
