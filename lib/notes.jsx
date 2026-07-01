// Customer Health — Notes & Tasks
// Loaded as <script type="text/babel" src="lib/notes.jsx">
// CS workspace: cadence task lists (daily/weekly/monthly/quarterly) + auto-surfaced
// renewal/QBR tasks + a read-only renewal calendar + team notes + per-account notes.
// Persists to localStorage (swap to a real store / Salesforce when wired).

function nGet(k, d) { try { var v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; } catch (e) { return d; } }
function nSet(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
function nUid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
function nFmt(ts) { return new Date(ts).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }); }
window.NOTESDB = { get: nGet, set: nSet, uid: nUid };

const CADENCES = [
  { key: 'daily', label: 'Daily' },
  { key: 'weekly', label: 'Weekly' },
  { key: 'monthly', label: 'Monthly' },
  { key: 'quarterly', label: 'Quarterly' },
];
const TODAY = new Date('2026-06-12');
let DRAGGING_TASK = null; // fallback for environments where DataTransfer custom types don't round-trip

function seedTasks() {
  return [
    { id: nUid(), cadence: 'daily', text: 'Reach out to Kingfisher Networks — MAUs down 92% since Jan', done: false },
    { id: nUid(), cadence: 'daily', text: 'Re-onboard Ironvale Technologies (stalled, logins fading)', done: false },
    { id: nUid(), cadence: 'daily', text: 'Clear the "Needs attention" worklist to zero', done: false },
    { id: nUid(), cadence: 'weekly', text: 'Expansion call: Kestrel Solutions — sustained 30%+ growth', done: false },
    { id: nUid(), cadence: 'weekly', text: 'Review every account that crossed a threshold this week', done: false },
    { id: nUid(), cadence: 'weekly', text: 'Log all outreach in Salesforce before Friday', done: false },
    { id: nUid(), cadence: 'monthly', text: 'Pull usage + login trends for the full segment', done: false },
    { id: nUid(), cadence: 'monthly', text: 'Refresh health scores and re-rank at-risk accounts', done: false },
    { id: nUid(), cadence: 'monthly', text: 'Sync with Andy (Finance) on expansion-signal overlap', done: false },
    { id: nUid(), cadence: 'quarterly', text: 'Run QBRs for Green accounts renewing next quarter', done: false },
    { id: nUid(), cadence: 'quarterly', text: 'Re-validate the 30% thresholds with Reese', done: false },
    { id: nUid(), cadence: 'quarterly', text: 'Segment review with Jordan — wins, risks, expansion', done: false },
  ];
}

function renewalTasks(H) {
  var out = [];
  H.customers.forEach(function (c) {
    var d = c.renewalDays;
    if (d == null || d < 0 || d > 120) return;
    var bucket = d <= 30 ? 'daily' : d <= 90 ? 'weekly' : 'quarterly';
    var action = d <= 45 ? 'Renewal check-in' : 'Schedule QBR';
    out.push({ id: 'rnw-' + c.id, cadence: bucket, account: c, days: d,
      text: action + ' — ' + c.name + ' renews ' + H.fmtRenewal(c.renewal) + ' (' + d + 'd)' });
  });
  return out.sort(function (a, b) { return a.days - b.days; });
}

var CHEERS = [
  { emo: '🎉', msg: 'Nice work!' }, { emo: '💃', msg: 'Look at you go!' },
  { emo: '🕺', msg: 'One down!' }, { emo: '✨', msg: 'Crushing it.' },
  { emo: '🙌', msg: 'Another save!' }, { emo: '🌟', msg: 'You\u2019re on a roll.' },
  { emo: '🎊', msg: 'Boom. Done.' }, { emo: '🦦', msg: 'Otterly amazing.' },
];

function Celebrate({ cheer, onDone }) {
  React.useEffect(function () { var t = setTimeout(onDone, 1700); return function () { clearTimeout(t); }; }, []);
  var bits = []; var colors = ['#35BC98', '#503BD4', '#0D54F5', '#FF9A3C', '#EB5757', '#F6EA2F'];
  for (var i = 0; i < 16; i++) {
    var left = Math.round(Math.random() * 100);
    var delay = (Math.random() * 0.25).toFixed(2);
    var dur = (0.9 + Math.random() * 0.7).toFixed(2);
    var c = colors[i % colors.length];
    bits.push(<span key={i} style={{ position: 'absolute', top: '-12px', left: left + '%', width: 9, height: 9, borderRadius: 2, background: c, animation: 'confettiFall ' + dur + 's ' + delay + 's ease-in forwards' }} />);
  }
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 90, pointerEvents: 'none', overflow: 'hidden' }}>
      {bits}
      <div style={{ position: 'absolute', top: '38%', left: '50%', transform: 'translate(-50%,-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, animation: 'cheerPop 1.7s ease-out forwards' }}>
        <div style={{ fontSize: 64, animation: 'cheerDance 0.5s ease-in-out infinite' }}>{cheer.emo}</div>
        <div style={{ background: V.black, color: '#fff', fontSize: 14, fontWeight: 700, padding: '7px 16px', borderRadius: 64, fontFamily: V.font, boxShadow: V.shadow3 }}>{cheer.msg}</div>
      </div>
    </div>
  );
}

// One cadence card with its own add row
function TaskGroup({ cd, tasks, autoTasks, autoDone, onAdd, onToggle, onToggleAuto, onDel, onSelect, onMove, card }) {
  const [val, setVal] = React.useState('');
  const [over, setOver] = React.useState(false);
  const add = () => { const t = val.trim(); if (!t) return; onAdd(cd.key, t); setVal(''); };
  const open = tasks.filter((t) => !t.done).length + autoTasks.filter((t) => !autoDone[t.id]).length;
  const onDrop = (e) => {
    e.preventDefault(); setOver(false);
    const id = e.dataTransfer.getData('text/task-id') || DRAGGING_TASK;
    DRAGGING_TASK = null;
    if (id) onMove(id, cd.key);
  };
  return (
    <div onDragOver={(e) => { e.preventDefault(); if (!over) setOver(true); }} onDragLeave={(e) => { if (e.currentTarget === e.target) setOver(false); }} onDrop={onDrop}
      style={{ ...card, overflow: 'hidden', display: 'flex', flexDirection: 'column', outline: over ? `2px solid ${V.green}` : '2px solid transparent', outlineOffset: -1, transition: 'outline-color 120ms' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 14px', borderBottom: `1px solid ${V.greyXLight}`, background: V.greyBg }}>
        <span style={{ fontSize: 13.5, fontWeight: 700, color: V.black }}>{cd.label}</span>
        <span style={{ fontSize: 11, fontWeight: 700, color: open ? V.greenDeep : V.greyMed, background: open ? V.greenLight : V.greyXLight, borderRadius: 64, padding: '2px 9px' }}>{open} open</span>
      </div>
      <div style={{ flex: 1, maxHeight: 360, overflowY: 'auto' }}>
        {autoTasks.map((t) => (
          <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderBottom: `1px solid ${V.greyXLight}`, background: V.greyBgLight }}>
            <span onClick={() => onToggleAuto(t.id)} style={{ flexShrink: 0, width: 18, height: 18, borderRadius: 5, cursor: 'pointer', border: `1.5px solid ${autoDone[t.id] ? V.greenDeep : V.greyLight}`, background: autoDone[t.id] ? V.greenDeep : '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
              {autoDone[t.id] && <Icon name="check" size={12} color="#fff" strokeWidth={3} />}
            </span>
            <Icon name={t.days <= 45 ? 'calendar' : 'clock'} size={15} color={t.days <= 45 ? V.orangeDark : V.greyDark} strokeWidth={1.9} style={{ flexShrink: 0 }} />
            <span onClick={() => onSelect(t.account)} style={{ flex: 1, fontSize: 13, color: autoDone[t.id] ? V.greyMed : V.black, textDecoration: autoDone[t.id] ? 'line-through' : 'none', lineHeight: '17px', cursor: 'pointer' }}>{t.text}</span>
            <Chip tone={t.days <= 45 ? 'orange' : 'grey'}>Auto</Chip>
          </div>
        ))}
        {tasks.length === 0 && autoTasks.length === 0 && <div style={{ padding: '18px', textAlign: 'center', fontSize: 12.5, color: V.greyMed }}>Nothing scheduled.</div>}
        {tasks.map((t) => (
          <div key={t.id} draggable onDragStart={(e) => { DRAGGING_TASK = t.id; e.dataTransfer.effectAllowed = 'move'; try { e.dataTransfer.setData('text/task-id', t.id); } catch (err) {} }} onDragEnd={() => { DRAGGING_TASK = null; }}
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px 10px 14px', borderBottom: `1px solid ${V.greyXLight}`, cursor: 'grab' }}>
            <span onClick={() => onToggle(t.id)} style={{ flexShrink: 0, width: 18, height: 18, borderRadius: 5, cursor: 'pointer', border: `1.5px solid ${t.done ? V.greenDeep : V.greyLight}`, background: t.done ? V.greenDeep : '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
              {t.done && <Icon name="check" size={12} color="#fff" strokeWidth={3} />}
            </span>
            <span style={{ flex: 1, fontSize: 13, color: t.done ? V.greyMed : V.black, textDecoration: t.done ? 'line-through' : 'none', lineHeight: '17px' }}>{t.text}</span>
            <span title="Drag to another list" style={{ flexShrink: 0, color: V.greyLight, display: 'inline-flex', cursor: 'grab' }}><Icon name="more" size={14} color={V.greyLight} /></span>
            <span onClick={() => onDel(t.id)} style={{ flexShrink: 0, cursor: 'pointer', padding: 3, opacity: 0.5 }}><Icon name="close" size={13} color={V.greyMed} /></span>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 7, padding: 10, borderTop: `1px solid ${V.greyXLight}` }}>
        <input value={val} onChange={(e) => setVal(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') add(); }} placeholder={`Add a ${cd.label.toLowerCase()} task`}
          style={{ flex: 1, height: 34, padding: '0 11px', fontSize: 13, fontFamily: V.font, color: V.black, border: `1px solid ${V.greyLight}`, borderRadius: 4, outline: 'none', background: '#fff' }} />
        <Button kind="subtle" size="sm" icon="plus" onClick={add}>Add</Button>
      </div>
    </div>
  );
}

// Read-only month calendar with renewal markers
function RenewalCalendar({ H, onSelect, card, staticOffset, monthName: forceName }) {
  const [navOffset, setNavOffset] = React.useState(0);
  const fixed = staticOffset !== undefined;
  const offset = fixed ? staticOffset : navOffset;
  const base = new Date(Date.UTC(TODAY.getFullYear(), TODAY.getMonth() + offset, 1));
  const y = base.getUTCFullYear(), m = base.getUTCMonth();
  const monthName = base.toLocaleString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' });
  const firstDow = new Date(Date.UTC(y, m, 1)).getUTCDay();
  const daysInMonth = new Date(Date.UTC(y, m + 1, 0)).getUTCDate();
  // renewals this month → day → [customers]
  const byDay = {};
  H.customers.forEach((c) => {
    if (!c.renewal) return;
    const d = new Date(c.renewal);
    if (d.getUTCFullYear() === y && d.getUTCMonth() === m) {
      const day = d.getUTCDate();
      (byDay[day] = byDay[day] || []).push(c);
    }
  });
  const isToday = (day) => offset === 0 && day === TODAY.getUTCDate() && m === TODAY.getMonth() && y === TODAY.getFullYear();
  const cells = [];
  for (let i = 0; i < firstDow; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  const monthRenewals = Object.keys(byDay).reduce((a, k) => a + byDay[k].length, 0);

  return (
    <div style={{ ...card, overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 12px', borderBottom: `1px solid ${V.greyXLight}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <span style={{ fontSize: 12.5, fontWeight: 700, color: offset === 0 ? V.greenDeep : V.black }}>{fixed ? base.toLocaleString('en-US', { month: 'short', year: 'numeric', timeZone: 'UTC' }) : monthName}</span>
          {monthRenewals > 0 && <Chip tone="purple">{monthRenewals}</Chip>}
        </div>
        {!fixed && (
          <div style={{ display: 'flex', gap: 4 }}>
            <button onClick={() => setNavOffset(offset - 1)} style={navBtn}><Icon name="chevronRight" size={15} color={V.greyDark} style={{ transform: 'rotate(180deg)' }} /></button>
            <button onClick={() => setNavOffset(0)} style={{ ...navBtn, width: 'auto', padding: '0 9px', fontSize: 12, fontWeight: 600, color: V.greyDark, fontFamily: V.font }}>Today</button>
            <button onClick={() => setNavOffset(offset + 1)} style={navBtn}><Icon name="chevronRight" size={15} color={V.greyDark} /></button>
          </div>
        )}
      </div>
      <div style={{ padding: '8px 10px 10px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 2, marginBottom: 3 }}>
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => <div key={i} style={{ textAlign: 'center', fontSize: 9, fontWeight: 700, color: V.greyMed, padding: '1px 0' }}>{d}</div>)}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 2 }}>
          {cells.map((d, i) => {
            if (d === null) return <div key={i} />;
            const rs = byDay[d];
            const today = isToday(d);
            return (
              <div key={i} title={rs ? rs.map((c) => c.name + ' renews').join('\n') : ''}
                onClick={rs ? () => onSelect(rs[0]) : undefined}
                style={{
                  position: 'relative', height: 26, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  borderRadius: 4, fontSize: 11, cursor: rs ? 'pointer' : 'default',
                  background: today ? V.greenDeep : rs ? V.purpleLight : 'transparent',
                  color: today ? '#fff' : rs ? V.purpleDark : V.greyDark, fontWeight: today || rs ? 700 : 400,
                  border: rs && !today ? `1px solid ${V.purple}` : '1px solid transparent',
                }}>
                {d}
                {rs && rs.length > 1 && <span style={{ position: 'absolute', top: 0, right: 3, fontSize: 8, fontWeight: 700, color: today ? '#fff' : V.purpleDark }}>{rs.length}</span>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
const navBtn = { width: 28, height: 28, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${V.greyLight}`, borderRadius: 6, background: '#fff', cursor: 'pointer' };

function NotesTasks({ onSelect }) {
  const H = window.HEALTH;
  const [tasks, setTasks] = React.useState(() => nGet('cc_tasks_v2', seedTasks()));
  const [notes, setNotes] = React.useState(() => nGet('cc_team_notes', [
    { id: nUid(), text: 'Jordan confirmed the two core triggers; thresholds still TBD pending Reese.', ts: Date.now() - 86400000 * 2 },
  ]));
  const [noteInput, setNoteInput] = React.useState('');
  const [cheer, setCheer] = React.useState(null);
  React.useEffect(() => nSet('cc_tasks_v2', tasks), [tasks]);
  React.useEffect(() => nSet('cc_team_notes', notes), [notes]);

  const [autoDone, setAutoDone] = React.useState(() => nGet('cc_auto_done', {}));
  React.useEffect(() => nSet('cc_auto_done', autoDone), [autoDone]);
  const toggleAuto = (id) => setAutoDone((prev) => {
    if (!prev[id]) setCheer(CHEERS[Math.floor(Math.random() * CHEERS.length)]);
    const next = { ...prev }; if (next[id]) delete next[id]; else next[id] = true; return next;
  });
  const addTask = (cadence, text) => setTasks([{ id: nUid(), cadence, text, done: false }, ...tasks]);
  const toggle = (id) => setTasks(tasks.map((t) => {
    if (t.id !== id) return t;
    if (!t.done) setCheer(CHEERS[Math.floor(Math.random() * CHEERS.length)]);
    return { ...t, done: !t.done };
  }));
  const delTask = (id) => setTasks(tasks.filter((t) => t.id !== id));
  const moveTask = (id, cadence) => setTasks(tasks.map((t) => t.id === id ? { ...t, cadence } : t));
  const addNote = () => { const t = noteInput.trim(); if (!t) return; setNotes([{ id: nUid(), text: t, ts: Date.now() }, ...notes]); setNoteInput(''); };
  const delNote = (id) => setNotes(notes.filter((n) => n.id !== id));

  const auto = renewalTasks(H);
  const totalOpen = tasks.filter((t) => !t.done).length;

  const acctNotes = nGet('cc_acct_notes', {});
  const acctRows = Object.keys(acctNotes).map((id) => {
    const c = H.customers.find((x) => x.id === id);
    const list = acctNotes[id] || [];
    if (!c || !list.length) return null;
    const latest = list.slice().sort((a, b) => b.ts - a.ts)[0];
    return { c, count: list.length, latest };
  }).filter(Boolean).sort((a, b) => b.latest.ts - a.latest.ts);

  const card = { background: '#fff', border: `1px solid ${V.greyXLight}`, borderRadius: 8, boxShadow: V.shadow2 };
  const inputStyle = { flex: 1, height: 38, padding: '0 12px', fontSize: 13.5, fontFamily: V.font, color: V.black, border: `1px solid ${V.greyLight}`, borderRadius: 4, outline: 'none', background: '#fff' };

  return (
    <main style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'transparent', overflow: 'hidden', minWidth: 0 }}>
      {cheer && <Celebrate cheer={cheer} onDone={() => setCheer(null)} />}
      <header style={{ padding: '18px 32px 16px', background: '#fff', borderBottom: `1px solid ${V.greyXLight}`, flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, fontSize: 12, color: V.greyMed }}>
          <span>Customer Success</span><Icon name="chevronRight" size={12} color={V.greyLight} /><span style={{ color: V.greyDark }}>Notes &amp; Tasks</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
          <div>
            <h2 style={{ fontSize: 26, fontWeight: 700, color: V.black, margin: 0, letterSpacing: '-0.02em' }}>Notes &amp; Tasks</h2>
            <div style={{ fontSize: 13.5, color: V.greyDark, marginTop: 7 }}>Your daily, weekly, monthly &amp; quarterly worklist, the renewal calendar, and notes.</div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <Chip tone={totalOpen ? 'orange' : 'green'} icon="check2">{totalOpen} open {totalOpen === 1 ? 'task' : 'tasks'}</Chip>
            <SampleBadge label="Saved locally" />
          </div>
        </div>
      </header>

      <div style={{ flex: 1, overflow: 'auto', padding: '24px 32px 48px' }}>
        {/* Renewal calendars — previous, current, next */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <SectionLabel icon="calendar">Renewals — last month through next</SectionLabel>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16, marginBottom: 10 }}>
          <RenewalCalendar H={H} onSelect={onSelect} card={card} staticOffset={-1} />
          <RenewalCalendar H={H} onSelect={onSelect} card={card} staticOffset={0} />
          <RenewalCalendar H={H} onSelect={onSelect} card={card} staticOffset={1} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28, fontSize: 11.5, color: V.greyMed }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><span style={{ width: 11, height: 11, borderRadius: 3, background: V.greenDeep }} />Today</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><span style={{ width: 11, height: 11, borderRadius: 3, background: V.purpleLight, border: `1px solid ${V.purple}` }} />Renewal — click to open the account</span>
          <span>Read-only view of account renewals.</span>
        </div>

        {/* Tasks — all cadences in a grid */}
        <SectionLabel icon="check2">Tasks</SectionLabel>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16, marginBottom: 28 }}>
          {CADENCES.map((cd) => (
            <TaskGroup key={cd.key} cd={cd} card={card}
              tasks={tasks.filter((t) => t.cadence === cd.key)}
              autoTasks={auto.filter((t) => t.cadence === cd.key)}
              autoDone={autoDone}
              onAdd={addTask} onToggle={toggle} onToggleAuto={toggleAuto} onDel={delTask} onMove={moveTask} onSelect={onSelect} />
          ))}
        </div>

        {/* Team notes */}
        <div style={{ marginBottom: 28 }}>
          <SectionLabel icon="fileText">Team notes</SectionLabel>
          <div style={{ ...card, overflow: 'hidden' }}>
              <div style={{ display: 'flex', gap: 8, padding: 12, borderBottom: `1px solid ${V.greyXLight}` }}>
                <input value={noteInput} onChange={(e) => setNoteInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') addNote(); }} placeholder="Jot a note and press Enter" style={inputStyle} />
                <Button kind="secondary" size="md" icon="plus" onClick={addNote}>Note</Button>
              </div>
              <div>
                {notes.length === 0 && <div style={{ padding: 20, textAlign: 'center', fontSize: 13, color: V.greyMed }}>No notes yet.</div>}
                {notes.map((n, i) => (
                  <div key={n.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 11, padding: '12px 14px', borderBottom: i === notes.length - 1 ? 'none' : `1px solid ${V.greyXLight}` }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13.5, color: V.black, lineHeight: '19px', textWrap: 'pretty' }}>{n.text}</div>
                      <div style={{ fontSize: 11, color: V.greyMed, marginTop: 4 }}>{nFmt(n.ts)}</div>
                    </div>
                    <span onClick={() => delNote(n.id)} style={{ flexShrink: 0, cursor: 'pointer', padding: 3, opacity: 0.55 }}><Icon name="close" size={14} color={V.greyMed} /></span>
                  </div>
                ))}
              </div>
            </div>
        </div>

        {/* Account notes */}
        <SectionLabel icon="briefcase">Account notes</SectionLabel>
        {acctRows.length === 0 ? (
          <div style={{ ...card, padding: '18px', fontSize: 13, color: V.greyMed }}>
            Open any account and add a note in its detail panel — it'll show up here, newest first.
          </div>
        ) : (
          <div style={{ ...card, overflow: 'hidden' }}>
            {acctRows.map((r, i) => (
              <div key={r.c.id} onClick={() => onSelect(r.c)} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '13px 16px', borderBottom: i === acctRows.length - 1 ? 'none' : `1px solid ${V.greyXLight}`, cursor: 'pointer' }}>
                <div style={{ width: 200, flexShrink: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: V.black }}>{r.c.name}</div>
                  <div style={{ fontSize: 12, color: V.greyMed, marginTop: 2 }}>{r.count} note{r.count === 1 ? '' : 's'} · {nFmt(r.latest.ts)}</div>
                </div>
                <div style={{ flex: 1, minWidth: 0, fontSize: 13, color: V.greyDark, lineHeight: '18px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.latest.text}</div>
                <Icon name="chevronRight" size={16} color={V.greyLight} />
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

function SectionLabel({ icon, children }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
      {icon && <Icon name={icon} size={16} color={V.greyDark} strokeWidth={2} />}
      <span style={{ fontSize: 15, fontWeight: 700, color: V.black }}>{children}</span>
    </div>
  );
}

Object.assign(window, { NotesTasks });
