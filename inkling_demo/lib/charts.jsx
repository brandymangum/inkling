// Customer Health — charts (lightweight SVG, no deps)
// Loaded as <script type="text/babel" src="lib/charts.jsx">

// compact sparkline for table rows
function Sparkline({ data, color = '#A4A8AF', width = 96, height = 30 }) {
  const pad = 3;
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;
  const n = data.length;
  const x = (i) => pad + (i * (width - pad * 2)) / (n - 1);
  const y = (v) => height - pad - ((v - min) / range) * (height - pad * 2);
  const allZero = data.every((d) => d === 0);
  const pts = data.map((v, i) => `${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' ');
  const areaPts = `${pad},${height - pad} ${pts} ${width - pad},${height - pad}`;
  const gid = 'sg' + Math.abs(data.reduce((a, b, i) => a + b * (i + 1), 0)) + color.replace('#', '');
  if (allZero) {
    return (
      <svg width={width} height={height} style={{ display: 'block' }}>
        <line x1={pad} y1={height / 2} x2={width - pad} y2={height / 2} stroke="#C6C9CE" strokeWidth="1.5" strokeDasharray="2 3" />
      </svg>
    );
  }
  return (
    <svg width={width} height={height} style={{ display: 'block' }}>
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.16" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={areaPts} fill={`url(#${gid})`} />
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={x(n - 1)} cy={y(data[n - 1])} r="2.4" fill={color} />
    </svg>
  );
}

// larger line/area chart for the detail view
function TrendChart({ data, months, color = '#585C64', height = 168, valueFmt = (v) => v, baseline = true, threshold30 = false }) {
  const W = 520, H = height;
  const padL = 38, padR = 16, padT = 16, padB = 26;
  const innerW = W - padL - padR;
  const innerH = H - padT - padB;
  const max = Math.max(...data, 1);
  const niceMax = max * 1.18;
  const n = data.length;
  const x = (i) => padL + (i * innerW) / (n - 1);
  const y = (v) => padT + innerH - (v / niceMax) * innerH;
  const allZero = data.every((d) => d === 0);
  const pts = data.map((v, i) => `${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' ');
  const areaPts = `${x(0)},${padT + innerH} ${pts} ${x(n - 1)},${padT + innerH}`;
  const gid = 'tg' + color.replace('#', '');

  // baseline (first non-zero) reference
  const base = data.find((v) => v > 0) || 0;
  const gridVals = [0, niceMax / 2, niceMax];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: 'block' }}>
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.14" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* gridlines */}
      {gridVals.map((gv, i) => (
        <g key={i}>
          <line x1={padL} y1={y(gv)} x2={W - padR} y2={y(gv)} stroke="#E8EAEF" strokeWidth="1" />
          <text x={padL - 8} y={y(gv) + 3} textAnchor="end" fontSize="10" fill="#A4A8AF" fontFamily="var(--font-ui)">{valueFmt(Math.round(gv))}</text>
        </g>
      ))}
      {/* baseline marker */}
      {baseline && base > 0 && (
        <g>
          <line x1={padL} y1={y(base)} x2={W - padR} y2={y(base)} stroke="#A4A8AF" strokeWidth="1.25" strokeDasharray="4 4" />
          <text x={W - padR} y={y(base) - 5} textAnchor="end" fontSize="9.5" fill="#A4A8AF" fontFamily="var(--font-ui)">Jan baseline</text>
        </g>
      )}
      {allZero ? (
        <line x1={padL} y1={padT + innerH} x2={W - padR} y2={padT + innerH} stroke="#C6C9CE" strokeWidth="2" strokeDasharray="3 4" />
      ) : (
        <>
          <polygon points={areaPts} fill={`url(#${gid})`} />
          <polyline points={pts} fill="none" stroke={color} strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" />
          {data.map((v, i) => (
            <circle key={i} cx={x(i)} cy={y(v)} r={i === n - 1 ? 4 : 2.75} fill={i === n - 1 ? color : '#fff'} stroke={color} strokeWidth="1.75" />
          ))}
        </>
      )}
      {/* month labels */}
      {months.map((m, i) => (
        <text key={m} x={x(i)} y={H - 8} textAnchor="middle" fontSize="10.5" fill="#A4A8AF" fontFamily="var(--font-ui)">{m}</text>
      ))}
    </svg>
  );
}

// horizontal utilization bar (seats current / contracted)
function UtilBar({ current, contracted, color = '#503BD4' }) {
  const pct = contracted ? Math.min(100, Math.round((current / contracted) * 100)) : 0;
  return (
    <div style={{ width: '100%' }}>
      <div style={{ height: 8, borderRadius: 4, background: '#E8EAEF', overflow: 'hidden' }}>
        <div style={{ width: pct + '%', height: '100%', borderRadius: 4, background: color }} />
      </div>
    </div>
  );
}

Object.assign(window, { Sparkline, TrendChart, UtilBar });
