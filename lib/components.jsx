// Customer Health — shared components (forked from Vela customer-success kit)
// Loaded as <script type="text/babel" src="lib/components.jsx">

// Inkling ships a single considered look — the "ink on paper" palette below.
// One palette, no runtime theme switching.
const LIGHT = {
  black: '#141414', greyDark: '#55534C', greyMed: '#85816F',
  greyLight: '#D8D3C7', greyXLight: '#E3E0D8', greyBg: '#F0EFEC',
  greyBgLight: '#FAF8F4', white: '#FFFFFF', pageBg: '#F0EFEC',
  green: '#141414', greenHover: '#2A2A2A', greenDeep: '#5F7D5A',
  greenLight: '#E8EFE4',
  purple: '#7D5878', purpleLight: '#EFE7EE', purpleDark: '#6B4A66',
  blue: '#B45A38', blueBg: '#F6E9E1', blueDark: '#A0492B',
  yellow: '#96762F', yellowLight: '#F2EBD8', yellowDark: '#85691F',
  orange: '#C0803C', orangeDark: '#96762F', orangeLight: '#F2EBD8',
  red: '#A9493F', redLight: '#F5E5E2',
  tealDeep: '#141414', inkBar: '#141414', onAccent: '#F5F4F1',
  shadow1: '0 1px 2px 0 rgba(30,28,22,0.10)',
  shadow2: '0 2px 8px 0 rgba(0,0,0,0.04), 0 1px 3px 0 rgba(0,0,0,0.06)',
  shadow3: '0 8px 24px 0 rgba(0,0,0,0.08), 0 2px 6px 0 rgba(0,0,0,0.06)',
  font: '"Hanken Grotesk", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  mono: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Monaco, Consolas, monospace',
};
const V = LIGHT;


// Slack relay calls are stubbed — no network request leaves the browser. This
// no-op keeps the escalate/ping/log-outreach flows working (Customer Log +
// confirmation UI). Re-point at a real relay when our Slack is wired.
async function postRelay() { return { ok: true, status: 200, json: async () => ({ ok: true }), text: async () => '' }; }

const iconPaths = {
  plus: 'M12 5v14M5 12h14',
  check: 'M20 6L9 17l-5-5',
  close: 'M18 6L6 18M6 6l12 12',
  chevronDown: 'M6 9l6 6 6-6',
  chevronRight: 'M9 18l6-6-6-6',
  chevronUp: 'M18 15l-6-6-6 6',
  arrowRight: 'M5 12h14M12 5l7 7-7 7',
  arrowDown: 'M12 5v14M19 12l-7 7-7-7',
  arrowUpRight: 'M7 17L17 7M7 7h10v10',
  search: 'M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM21 21l-4.35-4.35',
  trendingUp: 'M23 6l-9.5 9.5-5-5L1 18M17 6h6v6',
  trendingDown: 'M23 18l-9.5-9.5-5 5L1 6M17 18h6v-6',
  activity: 'M22 12h-4l-3 9L9 3l-3 9H2',
  users: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75',
  alert: 'M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4M12 17h.01',
  octagon: 'M7.86 2h8.28L22 7.86v8.28L16.14 22H7.86L2 16.14V7.86L7.86 2zM12 8v4M12 16h.01',
  bell: 'M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0',
  calendar: 'M19 4H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zM16 2v4M8 2v4M3 10h18',
  filter: 'M22 3H2l8 9.46V19l4 2v-8.54L22 3z',
  externalLink: 'M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3',
  fileText: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M16 13H8M16 17H8M10 9H8',
  database: 'M12 8c4.97 0 9-1.34 9-3s-4.03-3-9-3-9 1.34-9 3 4.03 3 9 3zM21 12c0 1.66-4 3-9 3s-9-1.34-9-3M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5',
  server: 'M20 2H4a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2zM20 14H4a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-4a2 2 0 0 0-2-2zM6 6h.01M6 18h.01',
  zap: 'M13 2L3 14h9l-1 8 10-12h-9l1-8z',
  shield: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',
  layers: 'M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5',
  dollar: 'M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6',
  briefcase: 'M20 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2zM16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16',
  mail: 'M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zM22 6l-10 7L2 6',
  phone: 'M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z',
  clock: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 6v6l4 2',
  heart: 'M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z',
  grid: 'M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z',
  more: 'M12 13a1 1 0 1 0 0-2 1 1 0 0 0 0 2zM19 13a1 1 0 1 0 0-2 1 1 0 0 0 0 2zM5 13a1 1 0 1 0 0-2 1 1 0 0 0 0 2z',
  refresh: 'M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15',
  download: 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3',
  printer: 'M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2M6 14h12v8H6z',
  target: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12zM12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4z',
  check2: 'M22 11.08V12a10 10 0 1 1-5.93-9.14M22 4L12 14.01l-3-3',
  slack: 'M14.5 10c-.83 0-1.5-.67-1.5-1.5v-5a1.5 1.5 0 1 1 3 0v5c0 .83-.67 1.5-1.5 1.5zM20.5 10H19V8.5a1.5 1.5 0 1 1 1.5 1.5zM9.5 14c.83 0 1.5.67 1.5 1.5v5a1.5 1.5 0 1 1-3 0v-5c0-.83.67-1.5 1.5-1.5zM3.5 14H5v1.5A1.5 1.5 0 1 1 3.5 14zM14 14.5c0-.83.67-1.5 1.5-1.5h5a1.5 1.5 0 1 1 0 3h-5c-.83 0-1.5-.67-1.5-1.5zM14 20.5V19h1.5a1.5 1.5 0 1 1-1.5 1.5zM10 9.5c0 .83-.67 1.5-1.5 1.5h-5a1.5 1.5 0 1 1 0-3h5c.83 0 1.5.67 1.5 1.5zM10 3.5V5H8.5A1.5 1.5 0 1 1 10 3.5z',
  sun: 'M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10zM12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42',
  moon: 'M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z',
  sparkles: 'M12 3l1.6 5.4L19 10l-5.4 1.6L12 17l-1.6-5.4L5 10l5.4-1.6L12 3zM19 15l.7 2.3L22 18l-2.3.7L19 21l-.7-2.3L16 18l2.3-.7L19 15z',
  bulb: 'M9 18h6M10 22h4M12 2a6 6 0 0 0-6 6c0 2.5 1.5 4 2.5 5.5S9 16 9 18h6c0-2 .5-3 1.5-4.5S18 10.5 18 8a6 6 0 0 0-6-6z',
  logout: 'M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9',
};

function Icon({ name, size = 16, color = 'currentColor', strokeWidth = 1.75, style = {} }) {
  const d = iconPaths[name];
  if (!d) return null;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" style={style}>
      {d.split('M').filter(Boolean).map((seg, i) => <path key={i} d={'M' + seg} />)}
    </svg>
  );
}

function VelaMark({ size = 24 }) {
  return (
    <svg width={size * 72 / 64} height={size} viewBox="0 0 72 64" fill="none">
      <path d="M 8 40 C 14 24 20 24 24 34 C 27 41 31 41 34 32 C 37 24 43 24 46 32" stroke="#141414" strokeWidth="4" strokeLinecap="round" fill="none" />
      <circle cx="58" cy="34" r="6" fill="#C75A2E" />
    </svg>
  );
}

function Button({ kind = 'primary', size = 'md', icon, iconRight, children, onClick, disabled, style = {} }) {
  const styleMap = {
    primary: { background: V.green, color: V.onAccent, boxShadow: V.shadow1, border: 0 },
    secondary: { background: V.white, color: V.black, border: `1px solid ${V.greyLight}` },
    ghost: { background: 'transparent', color: V.blue, border: 0, fontWeight: 600 },
    subtle: { background: V.greyXLight, color: V.black, border: 0 },
    danger: { background: V.red, color: V.onAccent, border: 0, boxShadow: V.shadow1 },
  };
  const sizeMap = {
    sm: { padding: '5px 12px', fontSize: 13, height: 28 },
    md: { padding: '8px 16px', fontSize: 14, height: 36 },
  };
  const iconColor = (kind === 'primary' || kind === 'danger') ? V.onAccent : (kind === 'ghost' ? V.blue : V.greyDark);
  const dis = disabled ? { background: V.greyXLight, color: V.greyMed, boxShadow: 'none', border: 0, cursor: 'not-allowed' } : {};
  return (
    <button onClick={disabled ? undefined : onClick} disabled={disabled} style={{
      fontFamily: V.font, fontWeight: 600, borderRadius: 4,
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 7,
      lineHeight: 1, cursor: 'pointer', whiteSpace: 'nowrap',
      ...styleMap[kind], ...sizeMap[size], ...dis, ...style,
    }}>
      {icon && <Icon name={icon} size={14} color={disabled ? V.greyMed : iconColor} />}
      {children}
      {iconRight && <Icon name={iconRight} size={14} color={disabled ? V.greyMed : iconColor} />}
    </button>
  );
}

// status pill — uses HEALTH.STATUS meta
function StatusPill({ status, size = 'md' }) {
  const s = window.HEALTH.STATUS[status];
  if (!s) return null;
  const dims = size === 'sm' ? { fontSize: 11, padding: '2px 8px 2px 6px', dot: 6, gap: 5 } : { fontSize: 12, padding: '3px 10px 3px 8px', dot: 7, gap: 6 };
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: dims.gap,
      padding: dims.padding, borderRadius: 64, background: s.bg, color: s.color,
      fontSize: dims.fontSize, fontWeight: 600, fontFamily: V.font, lineHeight: 1, whiteSpace: 'nowrap',
    }}>
      <span style={{ width: dims.dot, height: dims.dot, borderRadius: '50%', background: s.dot }} />
      {s.label}
    </span>
  );
}

// small flag chip
function Chip({ tone = 'grey', icon, children, title }) {
  const tones = {
    grey: { bg: V.greyXLight, fg: V.greyDark },
    red: { bg: V.redLight, fg: V.red },
    orange: { bg: V.orangeLight, fg: V.orangeDark },
    purple: { bg: V.purpleLight, fg: V.purpleDark },
    green: { bg: V.greenLight, fg: V.greenDeep },
    blue: { bg: V.blueBg, fg: V.blueDark },
  };
  const t = tones[tone] || tones.grey;
  return (
    <span title={title} style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      height: 20, padding: '0 8px', borderRadius: 4, background: t.bg, color: t.fg,
      fontSize: 11, fontWeight: 600, lineHeight: 1, fontFamily: V.font, whiteSpace: 'nowrap',
    }}>
      {icon && <Icon name={icon} size={11} color={t.fg} />}
      {children}
    </span>
  );
}

// delta indicator: arrow + signed pct, colored by direction & whether "good"
function Delta({ pct, invertGood = false, size = 13 }) {
  const H = window.HEALTH;
  if (pct === null) {
    return <span style={{ color: V.purpleDark, fontWeight: 600, fontSize: size, fontFamily: V.font }}>New</span>;
  }
  const up = pct > 0;
  const flat = Math.round(pct) === 0;
  // for logins/logins: up = good (green), down = bad (red). invertGood flips.
  const good = invertGood ? !up : up;
  const color = flat ? V.greyMed : (good ? V.greenDeep : V.red);
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, color, fontWeight: 600, fontSize: size, fontFamily: V.font, whiteSpace: 'nowrap' }}>
      {!flat && <Icon name={up ? 'trendingUp' : 'trendingDown'} size={size} color={color} strokeWidth={2} />}
      {H.fmtPct(pct)}
    </span>
  );
}

const TOUCH_ICON = { email: 'mail', call: 'phone', task: 'check2' };
function LastTouch({ lt, days, showSummary }) {
  if (!lt) {
    return (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12.5, color: V.red, fontWeight: 600 }}>
        <Icon name="alert" size={12} color={V.red} strokeWidth={2} /> Never contacted
      </span>
    );
  }
  const ago = window.HEALTH.fmtAgo(lt.date);
  const overdue = days != null && days > 30;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12.5, color: V.greyDark, whiteSpace: 'nowrap' }}>
      <Icon name={TOUCH_ICON[lt.channel] || 'clock'} size={12} color={V.greyMed} />
      <span style={{ fontWeight: 600, color: V.black }}>{lt.by}</span>
      <span style={{ color: overdue ? V.orangeDark : V.greyMed, fontWeight: overdue ? 600 : 400 }}>· {ago}</span>
    </span>
  );
}

function OutreachStatus({ c }) {
  const o = c.outreach;
  if (o.state === 'needed') return <Chip tone="red" icon="alert">Outreach needed</Chip>;
  if (o.state === 'pending') return <Chip tone="blue" icon="clock">Pending · {o.owner}</Chip>;
  if (o.state === 'completed') return <Chip tone="green" icon="check">Sent {window.HEALTH.fmtAgo(o.date)} · {o.owner}</Chip>;
  return <Chip tone="grey" icon="check">Up to date</Chip>;
}

function SampleBadge({ label = 'Sample data' }) {
  const ctx = React.useContext(TweakCtx);
  if (ctx && ctx.showSampleBadges === false) return null;
  return (
    <span title="Illustrative placeholder — would come from CRM / your model once wired up" style={{
      display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 9.5, fontWeight: 700,
      letterSpacing: '0.04em', textTransform: 'uppercase', color: V.orangeDark,
      background: V.orangeLight, border: `1px dashed ${V.orange}`, borderRadius: 4, padding: '1px 6px', lineHeight: 1.5, whiteSpace: 'nowrap',
    }}>{label}</span>
  );
}

// ---- CSM override store (persisted) ----
const OverrideCtx = React.createContext({ overrides: {}, setOverride: () => {} });
function useOverrides() { return React.useContext(OverrideCtx); }
function isMuted(c, overrides) { return (overrides || {})[c.id] === 'noaction'; }

// generic dropdown menu (label + options)
function FilterMenu({ icon, label, value, options, onChange, width = 180 }) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef(null);
  React.useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h); return () => document.removeEventListener('mousedown', h);
  }, []);
  const cur = options.find((o) => o.key === value) || options[0];
  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button onClick={() => setOpen((o) => !o)} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, height: 32, padding: '0 10px', borderRadius: 4, border: `1px solid ${V.greyLight}`, background: V.white, fontSize: 12.5, fontWeight: 500, color: V.black, cursor: 'pointer', fontFamily: V.font }}>
        {icon && <Icon name={icon} size={13} color={V.greyDark} />}
        <span style={{ color: V.greyMed }}>{label}</span>{cur.label}
        <Icon name="chevronDown" size={12} color={V.greyDark} />
      </button>
      {open && (
        <div style={{ position: 'absolute', top: 36, left: 0, zIndex: 30, background: V.white, border: `1px solid ${V.greyLight}`, borderRadius: 6, boxShadow: V.shadow3, overflow: 'hidden', minWidth: width, maxHeight: 320, overflowY: 'auto' }}>
          {options.map((o) => (
            <div key={o.key} onClick={() => { onChange(o.key); setOpen(false); }} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '8px 12px', fontSize: 13, cursor: 'pointer', background: o.key === value ? V.greyBg : V.white, color: o.key === value ? V.black : V.greyDark, fontWeight: o.key === value ? 600 : 400 }}>
              <span>{o.label}</span>{o.count !== undefined && <span style={{ fontSize: 11, color: V.greyMed }}>{o.count}</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// link out to CRM
function SfdcLink({ url, size = 'sm' }) {
  const sm = size === 'sm';
  return (
    <a href={url} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} style={{
      display: 'inline-flex', alignItems: 'center', gap: 6, textDecoration: 'none',
      fontSize: sm ? 12 : 13, fontWeight: 600, color: V.blue, padding: sm ? '0' : '7px 12px',
      border: sm ? 'none' : `1px solid ${V.greyLight}`, borderRadius: 4, background: sm ? 'transparent' : V.white,
    }}>
      <Icon name="externalLink" size={sm ? 12 : 14} color={V.blue} />CRM
    </a>
  );
}

// ---- Tweak context (density + sample-badge visibility) ----
const TweakCtx = React.createContext({ density: 'regular', showSampleBadges: true });
function useTweakCtx() { return React.useContext(TweakCtx); }
const DENSITY = {
  compact: { rowPad: '7px 14px', wlPad: '8px 16px 9px', sumLine: false },
  regular: { rowPad: '14px 14px', wlPad: '13px 16px 14px', sumLine: true },
  comfy:   { rowPad: '22px 14px', wlPad: '18px 16px 18px', sumLine: true },
};
function densityOf(d) { return DENSITY[d] || DENSITY.regular; }

function MultiSelectMenu({ label, icon, options, selected, onChange, width = 280 }) {
  const [open, setOpen] = React.useState(false);
  const [q, setQ] = React.useState('');
  const ref = React.useRef(null);
  React.useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h); return () => document.removeEventListener('mousedown', h);
  }, []);
  const allKeys = options.map((o) => o.key);
  const noneSel = selected.length === 0;
  const allChecked = allKeys.length > 0 && selected.length === allKeys.length;
  const filtering = !noneSel && !allChecked;
  const effective = selected;
  const summary = (noneSel || allChecked) ? 'All' : (effective.length === 1 ? (options.find((o) => o.key === effective[0]) || {}).label : effective.length + ' of ' + allKeys.length);
  const filtered = options.filter((o) => o.label.toLowerCase().includes(q.toLowerCase()));
  const isChecked = (k) => selected.indexOf(k) >= 0;
  const toggle = (k) => {
    const base = selected.slice();
    const i = base.indexOf(k);
    if (i >= 0) base.splice(i, 1); else base.push(k);
    onChange(base);
  };
  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button onClick={() => setOpen((o) => !o)} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, maxWidth: 220, height: 32, padding: '0 10px', borderRadius: 4, border: `1px solid ${filtering ? V.green : V.greyLight}`, background: filtering ? V.greenLight : V.white, fontSize: 12.5, fontWeight: 500, color: V.black, cursor: 'pointer', fontFamily: V.font, whiteSpace: 'nowrap' }}>
        {icon && <Icon name={icon} size={13} color={V.greyDark} />}
        <span style={{ color: V.greyMed }}>{label}</span><span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{summary}</span>
        <Icon name="chevronDown" size={12} color={V.greyDark} />
      </button>
      {open && (
        <div style={{ position: 'absolute', top: 36, left: 0, zIndex: 30, background: V.white, border: `1px solid ${V.greyLight}`, borderRadius: 8, boxShadow: V.shadow3, width, overflow: 'hidden' }}>
          <div style={{ padding: 8, borderBottom: `1px solid ${V.greyXLight}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, height: 30, padding: '0 9px', border: `1px solid ${V.greyLight}`, borderRadius: 4 }}>
              <Icon name="search" size={13} color={V.greyMed} />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search customers" style={{ border: 0, outline: 'none', flex: 1, fontSize: 12.5, fontFamily: V.font, color: V.black, background: 'transparent' }} />
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 12px', borderBottom: `1px solid ${V.greyXLight}` }}>
            <div style={{ display: 'flex', gap: 14 }}>
              <span onClick={() => onChange(allKeys)} style={{ fontSize: 12, fontWeight: 600, color: allChecked ? V.greyMed : V.blue, cursor: allChecked ? 'default' : 'pointer' }}>Select all</span>
              <span onClick={() => onChange([])} style={{ fontSize: 12, fontWeight: 600, color: noneSel ? V.greyMed : V.blue, cursor: noneSel ? 'default' : 'pointer' }}>Deselect all</span>
            </div>
            <span style={{ fontSize: 11.5, color: V.greyMed }}>{noneSel ? 'none selected' : effective.length + ' selected'}</span>
          </div>
          <div style={{ maxHeight: 280, overflowY: 'auto', padding: 4 }}>
            {filtered.map((o) => {
              const on = isChecked(o.key);
              return (
                <div key={o.key} onClick={() => toggle(o.key)} style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '7px 9px', borderRadius: 6, cursor: 'pointer', fontSize: 13, color: V.black }}>
                  <span style={{ width: 16, height: 16, borderRadius: 4, border: `1.5px solid ${on ? V.green : V.greyLight}`, background: on ? V.green : V.white, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {on && <Icon name="check" size={11} color={V.onAccent} strokeWidth={3} />}
                  </span>
                  <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{o.label}</span>
                </div>
              );
            })}
            {filtered.length === 0 && <div style={{ padding: '10px 12px', fontSize: 12.5, color: V.greyMed }}>No matches.</div>}
          </div>
        </div>
      )}
    </div>
  );
}

function useMobile(bp) {
  const [m, setM] = React.useState(() => typeof window !== 'undefined' && window.innerWidth <= (bp || 900));
  React.useEffect(() => { const on = () => setM(window.innerWidth <= (bp || 900)); window.addEventListener('resize', on); on(); return () => window.removeEventListener('resize', on); }, []);
  return m;
}

Object.assign(window, { V, Icon, VelaMark, Button, StatusPill, Chip, Delta, LastTouch, OutreachStatus, SampleBadge, OverrideCtx, useOverrides, isMuted, FilterMenu, MultiSelectMenu, SfdcLink, useMobile, TweakCtx, useTweakCtx, densityOf });
