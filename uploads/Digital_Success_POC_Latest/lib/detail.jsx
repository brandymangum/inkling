// Customer Health — customer detail slide-over
// Loaded as <script type="text/babel" src="lib/detail.jsx">

// Same relay + deep-link config as dashboard.jsx (kept local to this file
// since top-level consts in one <script> aren't reliably readable from
// another). Update both copies together if either changes.
const DETAIL_SLACK_RELAY_URL = '';
const DETAIL_DASHBOARD_BASE_URL = 'https://REPLACE-WITH-HOST/Customer Health Dashboard.html';
function detailAccountDeepLink(accountId) {
  return `${DETAIL_DASHBOARD_BASE_URL}?account=${encodeURIComponent(accountId)}`;
}

// playbook + outreach mapping (from Riley's trigger/playbook library)
function playbookFor(c) {
  const map = {
    risk: {
      code: '1A', name: 'Product Usage — Decrease',
      philosophy: 'Catch the dip while it is still a conversation, not a renewal problem.',
      sla: 'Outreach within 2 business days',
      email: {
        tag: 'Option C — First outreach (uncovered account)',
        subject: 'Checking in on your Vela usage',
        body: `Hi [First name], I'm Riley on our Customer Success team — I'll be your point of contact going forward.\n\nI noticed your team's product usage has dropped over the last couple of months. I wanted to reach out directly rather than wait: is there a workflow change, a staffing shift, or something on our end getting in the way?\n\nHappy to find 15 minutes this week to make sure Vela is pulling its weight for you.`,
      },
    },
    stall: {
      code: '1B', name: 'Product Usage — Stall',
      philosophy: 'A signed contract with zero usage is a renewal already at risk. Re-onboard now.',
      sla: 'Outreach within 1 business day',
      email: {
        tag: 'Option C — First outreach (uncovered account)',
        subject: 'Getting your Vela account off the ground',
        body: `Hi [First name], I'm Riley from our Customer Success team.\n\nI'm reaching out because it looks like your team hasn't logged in yet. I'd love to help you get your users onboarded — most teams are up and running after one short working session.\n\nWould a 20-minute setup call this week work? I can walk through the first steps with you live.`,
      },
    },
    watch: {
      code: '1A', name: 'Product Usage — Early Warning (cumulative)',
      philosophy: 'No single month trips the alert, but the trend line is heading the wrong way. Intervene early.',
      sla: 'Outreach within 5 business days',
      email: {
        tag: 'Option C — First outreach (uncovered account)',
        subject: 'Quick check-in on your account',
        body: `Hi [First name], I'm Riley from our Customer Success team — your new point of contact.\n\nThings look steady week to week, but your overall usage volume has softened a bit since the start of the year. I'd love to understand what's changed and make sure nothing is slowing your team down.\n\nOpen to a quick 15-minute call in the next week or two?`,
      },
    },
    upsell: {
      code: '1C', name: 'Product Usage — Surge / Expansion',
      philosophy: 'Growth is the best time to talk about the plan. Get ahead of the cap before it becomes friction.',
      sla: 'Outreach within 5 business days',
      email: {
        tag: 'Option C — First outreach (uncovered account)',
        subject: 'Your usage volume is growing fast',
        body: `Hi [First name], I'm Riley from our Customer Success team.\n\nYour login volume has grown significantly over the past few months — great to see. I wanted to make sure your current plan keeps pace and that you're not bumping into any limits as you scale.\n\nCould we grab 15 minutes to look at where you're headed? I want to make sure Vela grows with you.`,
      },
    },
  };
  return map[c.status] || map.watch;
}

function triggerReasons(c) {
  const H = window.HEALTH;
  const prev = c.verif[c.verif.length - 2], last = c.verif[c.verif.length - 1];
  const base = c.verif.find((v) => v > 0) || 0;
  const out = [];
  if (c.status === 'stall') out.push({ icon: 'octagon', tone: 'red', text: `Zero login activity across all ${H.MONTHS.length} months — stall trigger.` });
  if (c.status === 'risk') out.push({ icon: 'trendingDown', tone: 'red', text: `Login activity down ${H.fmtPct(c.verifMom)} month-over-month (${prev} → ${last} in ${H.MONTHS[H.MONTHS.length - 1]}) — crossed the 30% decline trigger.` });
  if (c.status === 'watch') out.push({ icon: 'activity', tone: 'orange', text: `Cumulative ${H.fmtPct(c.verifCum)} since the January baseline (${base} → ${last}). A slow slide that never trips a single-month alert.` });
  if (c.status === 'upsell') out.push({ icon: 'trendingUp', tone: 'purple', text: `Logins up ${H.fmtPct(c.verifMom)} MoM and ${H.fmtPct(c.verifCum)} since January — 30% growth (expansion) signal.` });
  if (c.status !== 'healthy' && c.status !== 'onboarding' && c.status !== 'nodata' && c.renewalDays <= 60) out.push({ icon: 'calendar', tone: 'orange', text: `Renews in ${c.renewalDays} days (${H.fmtRenewal(c.renewal)}) — worth a proactive touch before renewal.` });
  if (!c.impl && !c.nd && c.sfHealth && c.sfHealth !== '—' && ((c.sfHealth === 'Green' && (c.status === 'risk' || c.status === 'watch')) || (c.sfHealth === 'Red' && (c.status === 'healthy' || c.status === 'upsell')))) out.push({ icon: 'alert', tone: 'orange', text: `Heads up: CRM health is ${c.sfHealth}, but the usage signal says ${H.STATUS[c.status].label.toLowerCase()} — the two disagree, which is exactly what this dashboard surfaces.` });
  return out;
}

function StatBlock({ label, children, sub }) {
  return (
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: V.greyMed, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 16, fontWeight: 600, color: V.black, lineHeight: 1.1 }}>{children}</div>
      {sub && <div style={{ fontSize: 11.5, color: V.greyMed, marginTop: 3 }}>{sub}</div>}
    </div>
  );
}

function ChartCard({ title, delta, deltaInvert, children, footer }) {
  return (
    <div style={{ border: `1px solid ${V.greyXLight}`, borderRadius: 8, padding: 16, background: V.white }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: V.black }}>{title}</span>
        {delta !== undefined && (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, color: V.greyMed }}>
            <span>MoM</span><Delta pct={delta} invertGood={deltaInvert} size={13} />
          </span>
        )}
      </div>
      {children}
      {footer && <div style={{ fontSize: 11.5, color: V.greyMed, marginTop: 8 }}>{footer}</div>}
    </div>
  );
}

function ManualWatchToggle({ c, onChange }) {
  const [open, setOpen] = React.useState(false);
  const [reason, setReason] = React.useState(c.manualWatch ? c.manualWatch.reason || '' : '');
  const isWatching = !!c.manualWatch;

  const save = () => {
    window.HEALTH.setManualWatch(c.id, reason, 'Leadership');
    if (window.Sync) window.Sync.logActivity({ who: 'Riley', action: 'added to watch', account: c.name, detail: reason || undefined });
    setOpen(false);
    if (onChange) onChange();
  };
  const remove = () => {
    window.HEALTH.clearManualWatch(c.id);
    if (window.Sync) window.Sync.logActivity({ who: 'Riley', action: 'removed from watch', account: c.name });
    setOpen(false);
    if (onChange) onChange();
  };

  return (
    <div style={{ position: 'relative' }}>
      <Button kind={isWatching ? 'subtle' : 'secondary'} size="sm" icon="activity" onClick={() => setOpen((o) => !o)}>
        {isWatching ? 'Watching' : 'Add to Watch'}
      </Button>
      {open && (
        <div style={{ position: 'absolute', top: 'calc(100% + 6px)', left: 0, zIndex: 30, width: 280, background: V.white, border: `1px solid ${V.greyLight}`, borderRadius: 8, boxShadow: V.shadow3, padding: 12 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: V.greyMed, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>Watch reason (optional)</div>
          <textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Why is this account being watched?"
            style={{ width: '100%', minHeight: 56, padding: '7px 9px', fontSize: 12.5, fontFamily: V.font, color: V.black, border: `1px solid ${V.greyLight}`, borderRadius: 6, outline: 'none', resize: 'vertical', boxSizing: 'border-box', marginBottom: 8 }} />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6 }}>
            {isWatching && <Button kind="ghost" size="sm" onClick={remove}>Remove</Button>}
            <Button kind="secondary" size="sm" onClick={() => setOpen(false)}>Cancel</Button>
            <Button kind="primary" size="sm" icon="check" onClick={save}>{isWatching ? 'Update' : 'Add'}</Button>
          </div>
        </div>
      )}
    </div>
  );
}

// ───────────────────────────────────────────────────────────────────────────
// Escalate to Leadership — for "hot customer" situations. Pings Jordan
// directly in Slack (kind: 'leadership_escalation', styled to stand out from
// routine needs_attention pings), logs a permanent record in the account's
// Customer Log, and logs to the shared activity feed — so the CSM has proof
// they escalated even if the Slack message scrolls away.
// ───────────────────────────────────────────────────────────────────────────
function EscalateToLeadershipModal({ c, onClose, onEscalated }) {
  const [context, setContext] = React.useState('');
  const [requestedBy, setRequestedBy] = React.useState('Riley');
  const [notifyTargets, setNotifyTargets] = React.useState(['Jordan']);
  const [sending, setSending] = React.useState(false);
  const [error, setError] = React.useState(null);
  const toggleNotify = (name) => setNotifyTargets((prev) => prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]);

  const send = async () => {
    setError(null);
    setSending(true);
    try {
      const resp = await postRelay( {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kind: 'leadership_escalation',
          account: c.name,
          csm: c.csm === 'Unassigned' ? 'Unassigned' : c.csm,
          escalatedBy: requestedBy,
          notify: notifyTargets,
          reason: c.headline || window.HEALTH.STATUS[c.status].label,
          note: context,
          link: detailAccountDeepLink(c.id),
        }),
      });
      if (!resp.ok) throw new Error('Relay returned ' + resp.status);

      // Log to the Customer Log so the CSM has a permanent record they can
      // point to — "I escalated this, here's what I said, here's when."
      const updated = { ...window.NOTESDB.get('cc_acct_notes', {}) };
      const list = (updated[c.id] || []).slice();
      list.push({
        id: window.NOTESDB.uid(), ts: Date.now(), type: 'escalation', by: requestedBy, source: 'Manual',
        summary: `Escalated to leadership (${notifyTargets.map((n) => `@${n}`).join(', ') || 'leadership'}) — ${context || c.headline || window.HEALTH.STATUS[c.status].label}`,
        fullNotes: context || null,
      });
      updated[c.id] = list;
      window.NOTESDB.set('cc_acct_notes', updated);

      if (window.Sync) {
        window.Sync.logActivity({
          who: requestedBy, action: 'escalated to leadership', account: c.name,
          detail: c.headline || window.HEALTH.STATUS[c.status].label,
          full: { 'Context': context || null, 'Account CSM': c.csm === 'Unassigned' ? 'Unassigned' : c.csm, 'Notified': notifyTargets.map((n) => `@${n}`).join(', ') || null },
        });
      }

      onEscalated();
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
      <div style={{ position: 'relative', width: 480, maxWidth: '100%', maxHeight: '90vh', background: V.white, borderRadius: 12, boxShadow: V.shadow3, display: 'flex', flexDirection: 'column', fontFamily: V.font, overflow: 'hidden', border: `2px solid ${V.red}` }}>
        <div style={{ padding: '18px 22px', borderBottom: `1px solid ${V.greyXLight}`, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexShrink: 0, background: V.redLight }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
              <Icon name="alert" size={18} color={V.red} strokeWidth={2} />
              <h3 style={{ fontSize: 18, fontWeight: 700, color: V.black, margin: 0 }}>Escalate to Leadership</h3>
            </div>
            <div style={{ fontSize: 12.5, color: V.greyDark, marginTop: 5 }}>Posts to #cs-alerts with an @mention — use for hot customers that need leadership attention now. {c.name}</div>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 0, cursor: 'pointer', padding: 6 }}><Icon name="close" size={20} color={V.greyDark} /></button>
        </div>

        <div style={{ flex: 1, overflow: 'auto', padding: '16px 22px 22px' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: V.greyMed, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Requested by</div>
          <div style={{ marginBottom: 18 }}>
            <RequestedByField value={requestedBy} onChange={setRequestedBy} />
          </div>

          <div style={{ fontSize: 11, fontWeight: 700, color: V.greyMed, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Notify</div>
          <div style={{ marginBottom: 18 }}>
            <NotifyPicker selected={notifyTargets} onToggle={toggleNotify} />
          </div>

          <div style={{ fontSize: 11, fontWeight: 700, color: V.greyMed, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>What's going on?</div>
          <textarea value={context} onChange={(e) => setContext(e.target.value)} placeholder="Give leadership the context — what's happening, why it's urgent, what you need…" autoFocus
            style={{ width: '100%', minHeight: 100, padding: '8px 10px', fontSize: 13, fontFamily: V.font, color: V.black, border: `1px solid ${V.greyLight}`, borderRadius: 6, outline: 'none', resize: 'vertical', boxSizing: 'border-box', marginBottom: 12 }} />

          <div style={{ fontSize: 12, color: V.greyMed, lineHeight: '17px' }}>
            This will be logged in {c.name}'s Customer Log and the team activity feed — so you have a record that this was escalated, separate from the Slack message.
          </div>
          {error && <div style={{ marginTop: 10, fontSize: 12.5, color: V.red }}>{error}</div>}
        </div>

        <div style={{ padding: '14px 22px', borderTop: `1px solid ${V.greyXLight}`, display: 'flex', justifyContent: 'flex-end', gap: 10, flexShrink: 0 }}>
          <Button kind="secondary" size="md" onClick={onClose}>Cancel</Button>
          <Button kind="danger" size="md" icon="alert" onClick={send} disabled={sending}>
            {sending ? 'Sending…' : 'Send to #cs-alerts'}
          </Button>
        </div>
      </div>
    </div>
  );
}

function CustomerDetail({ c, onClose }) {
  const H = window.HEALTH;
  const [escalateOpen, setEscalateOpen] = React.useState(false);
  const [logOpen, setLogOpen] = React.useState(false);
  const [tab, setTab] = React.useState('signals');
  const [emailOpen, setEmailOpen] = React.useState(c.status !== 'healthy');
  const [, forceTick] = React.useState(0);
  if (!c) return null;
  const pb = playbookFor(c);
  const reasons = triggerReasons(c);
  const near = c.renewalDays <= 60;
  // Has this account already been escalated to leadership? Used to show a
  // persistent "Escalated" state in the footer (proof for the CSM, not just
  // a one-session toggle).
  const acctNotes = (window.NOTESDB.get('cc_acct_notes', {})[c.id] || []);
  const lastEscalation = acctNotes.filter((e) => e.type === 'escalation').sort((a, b) => b.ts - a.ts)[0];

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', justifyContent: 'flex-end' }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(29,29,33,0.32)' }} />
      <aside style={{
        position: 'relative', width: 620, maxWidth: '94vw', height: '100%', background: V.white,
        display: 'flex', flexDirection: 'column', boxShadow: V.shadow3, fontFamily: V.font,
        animation: 'slideIn 180ms ease-out',
      }}>
        {/* header */}
        <div style={{ padding: '18px 24px', borderBottom: `1px solid ${V.greyXLight}`, flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
            <div style={{ minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, flexWrap: 'wrap' }}>
                <StatusPill status={c.status} />
                <ScoreChip health={c.health} />
                <span style={{ fontSize: 12, color: V.greyMed }}>{c.segment}</span>
              </div>
              <h3 style={{ fontSize: 22, fontWeight: 700, color: V.black, margin: 0, letterSpacing: '-0.01em' }}>{c.name}</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 8, flexWrap: 'wrap' }}>
                <CsmTag csm={c.csm} />
                <SfdcLink url={c.sfdcUrl} />
                <ManualWatchToggle c={c} onChange={() => forceTick((t) => t + 1)} />
              </div>
            </div>
            <button onClick={onClose} style={{ background: 'transparent', border: 0, cursor: 'pointer', padding: 6, borderRadius: 4, flexShrink: 0 }}>
              <Icon name="close" size={20} color={V.greyDark} />
            </button>
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
            <StatBlock label="ARR">{H.fmtArr(c.arr)}</StatBlock>
            <StatBlock label="Renewal" sub={near ? `${c.renewalDays} days away` : null}>
              <span style={{ color: near ? V.orangeDark : V.black }}>{H.fmtRenewal(c.renewal)}</span>
            </StatBlock>
            <StatBlock label="CRM Health">{c.sfHealth === '—' ? '—' : c.sfHealth}</StatBlock>
            <StatBlock label="Open tickets" sub="Help desk">{c.tickets}</StatBlock>
            <StatBlock label="Platform">{c.platform}</StatBlock>
          </div>
        </div>

        {/* body */}
        <div style={{ flex: 1, overflow: 'auto', padding: '18px 24px 24px' }}>
          <DetailTabs tab={tab} setTab={setTab} />
          {tab === 'signals' && (<>
          <HealthScore c={c} />
          {/* last touch / activity */}
          <div style={{ marginBottom: 24 }}>
            <SubHead icon="clock">Outreach</SubHead>
            <div style={{ marginTop: -8, marginBottom: 12 }}><SampleBadge /></div>
            <div style={{ border: `1px solid ${V.greyXLight}`, borderRadius: 8, padding: 16, background: V.white }}>
              <div style={{ marginBottom: 14 }}><OutreachStatus c={c} /></div>
              {c.lastTouch ? (
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                  <div style={{ display: 'flex', gap: 11, alignItems: 'flex-start', minWidth: 0 }}>
                    <span style={{ flexShrink: 0, width: 30, height: 30, borderRadius: '50%', background: V.greyBg, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Icon name={{ email: 'mail', call: 'phone', task: 'check2' }[c.lastTouch.channel] || 'clock'} size={15} color={V.greyDark} strokeWidth={1.9} />
                    </span>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 13.5, color: V.black }}>
                        <span style={{ fontWeight: 600 }}>{c.lastTouch.by}</span>
                        <span style={{ color: V.greyMed }}> · {({ email: 'Email', call: 'Call', task: 'Task' })[c.lastTouch.channel]} · {H.fmtAgo(c.lastTouch.date)}</span>
                      </div>
                      <div style={{ fontSize: 12.5, color: V.greyDark, marginTop: 3, lineHeight: '17px' }}>{c.lastTouch.summary}</div>
                    </div>
                  </div>
                  <Chip tone="grey" icon="briefcase">Logged in CRM</Chip>
                </div>
              ) : (
                <div style={{ display: 'flex', gap: 11, alignItems: 'flex-start' }}>
                  <Icon name="alert" size={17} color={V.red} strokeWidth={2} style={{ marginTop: 1, flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: 13.5, fontWeight: 600, color: V.red }}>No outreach logged yet</div>
                    <div style={{ fontSize: 12.5, color: V.greyDark, marginTop: 3, lineHeight: '17px' }}>This account has never been contacted — exactly the gap this segment was set up to close.</div>
                  </div>
                </div>
              )}
              <div style={{ fontSize: 11.5, color: V.greyMed, marginTop: 12, paddingTop: 12, borderTop: `1px solid ${V.greyXLight}`, display: 'flex', alignItems: 'center', gap: 7 }}>
                <Icon name="refresh" size={12} color={V.greyMed} /> Activity syncs from CRM. Sending outreach or creating a task below logs back automatically.
              </div>
            </div>
          </div>
          {/* why flagged */}
          {reasons.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <SubHead icon="alert">Why this is flagged</SubHead>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {reasons.map((r, i) => (
                  <div key={i} style={{ display: 'flex', gap: 11, alignItems: 'flex-start', padding: '11px 13px', background: V.greyBg, border: `1px solid ${V.greyXLight}`, borderRadius: 6 }}>
                    <span style={{ marginTop: 1, flexShrink: 0 }}><Icon name={r.icon} size={16} color={{ red: V.red, orange: V.orangeDark, purple: V.purple }[r.tone]} strokeWidth={2} /></span>
                    <span style={{ fontSize: 13, lineHeight: '19px', color: V.greyDark, textWrap: 'pretty' }}>{r.text}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* charts */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
            <ChartCard title="Logins" delta={c.verifMom} footer={`${H.MONTHS[0]}–${H.MONTHS[H.MONTHS.length - 1]} 2026 · cumulative ${H.fmtPct(c.verifCum)} vs baseline`}>
              <TrendChart data={c.verif} months={H.MONTHS} color={H.trendColor(c.status) === '#A4A8AF' ? V.greyDark : H.trendColor(c.status)} valueFmt={(v) => v >= 1000 ? (v / 1000).toFixed(1) + 'k' : v} />
            </ChartCard>
            <ChartCard title="Monthly active users (MAU)" delta={c.loginMom} footer="Primary usage signal (active users weigh more than seat count for contract health).">
              <TrendChart data={c.logins} months={H.MONTHS} color={V.blue} height={130} baseline={false} />
            </ChartCard>
          </div>

          {/* contract utilization */}
          <div style={{ marginBottom: 24 }}>
            <SubHead icon="layers">Contract utilization <span style={{ fontWeight: 400, color: V.greyMed, fontSize: 12 }}>· are they using what they pay for?</span></SubHead>
            <div style={{ marginTop: -8, marginBottom: 12, display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
              <Chip tone={c.util.overallPct >= 60 ? 'green' : c.util.overallPct >= 35 ? 'orange' : 'red'}>{c.util.overallPct}% overall</Chip>
              <SampleBadge label="Sample entitlements" />
            </div>
            <div style={{ border: `1px solid ${V.greyXLight}`, borderRadius: 8, overflow: 'hidden', background: V.white }}>
              {c.util.lines.map((l, i) => <UtilLine key={l.key} l={l} last={i === c.util.lines.length - 1} />)}
            </div>
            <div style={{ fontSize: 11.5, color: V.greyMed, marginTop: 9, lineHeight: '16px' }}>Per Priya &amp; Casey: watch usage across <em>all</em> contract areas — not just logins — plus client logins, API calls, and mass data exports as future signals.</div>
          </div>

          {/* support tickets */}
          <div style={{ marginBottom: 24 }}>
            <SubHead icon="bell">Open support tickets</SubHead>
            <div style={{ marginTop: -8, marginBottom: 12 }}><SampleBadge label="From Help desk" /></div>
            <div style={{ border: `1px solid ${V.greyXLight}`, borderRadius: 8, padding: 16, background: V.white, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 28, fontWeight: 700, color: c.tickets > 8 ? V.red : V.black, lineHeight: 1 }}>{c.tickets}</span>
                <span style={{ fontSize: 13, color: V.greyMed }}>open {c.tickets === 1 ? 'ticket' : 'tickets'}</span>
                {c.tickets !== c.ticketsPrev && (
                  <span style={{ fontSize: 12, fontWeight: 600, color: c.tickets > c.ticketsPrev ? V.red : V.greenDeep }}>{c.tickets > c.ticketsPrev ? '▲' : '▼'} {Math.abs(c.tickets - c.ticketsPrev)} vs last month</span>
                )}
              </div>
              <Chip tone={c.tickets > 8 ? 'red' : c.tickets === 0 ? 'grey' : 'green'}>{c.tickets > 8 ? 'Friction' : c.tickets === 0 ? 'Quiet' : 'Healthy'}</Chip>
            </div>
          </div>

          {/* playbook */}
          <SubHead icon="fileText">Recommended playbook</SubHead>
          <div style={{ border: `1px solid ${V.greyXLight}`, borderRadius: 8, overflow: 'hidden' }}>
            <div style={{ padding: 16, background: V.greyBg, borderBottom: `1px solid ${V.greyXLight}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: V.onAccent, background: V.greenDeep, padding: '3px 8px', borderRadius: 4, letterSpacing: '0.02em' }}>Playbook {pb.code}</span>
                <span style={{ fontSize: 14, fontWeight: 600, color: V.black }}>{pb.name}</span>
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <Chip tone="grey" icon="briefcase">Owner · Digital CS</Chip>
                <Chip tone="grey" icon="clock">{pb.sla}</Chip>
              </div>
              <div style={{ fontSize: 12.5, color: V.greyDark, marginTop: 11, lineHeight: '18px', fontStyle: 'italic' }}>{pb.philosophy}</div>
            </div>
            {/* email */}
            <div style={{ padding: 16 }}>
              <div onClick={() => setEmailOpen((o) => !o)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                  <Icon name="mail" size={15} color={V.greyDark} />
                  <span style={{ fontSize: 13, fontWeight: 600, color: V.black }}>Suggested outreach</span>
                  <Chip tone="green">{pb.email.tag}</Chip>
                </div>
                <Icon name={emailOpen ? 'chevronUp' : 'chevronDown'} size={16} color={V.greyMed} />
              </div>
              {emailOpen && (
                <div style={{ marginTop: 12, border: `1px solid ${V.greyXLight}`, borderRadius: 6, overflow: 'hidden' }}>
                  <div style={{ padding: '10px 13px', borderBottom: `1px solid ${V.greyXLight}`, fontSize: 13 }}>
                    <span style={{ color: V.greyMed }}>Subject:&nbsp;</span><span style={{ color: V.black, fontWeight: 600 }}>{pb.email.subject}</span>
                  </div>
                  <div style={{ padding: '13px', fontSize: 13, lineHeight: '20px', color: V.greyDark, whiteSpace: 'pre-wrap' }}>{pb.email.body}</div>
                  <div style={{ padding: '10px 13px', borderTop: `1px solid ${V.greyXLight}`, display: 'flex', gap: 8, background: V.greyBg }}>
                    <Button kind="secondary" size="sm" icon="mail">Open in email</Button>
                    <Button kind="ghost" size="sm" icon="fileText">View 3 options</Button>
                  </div>
                </div>
              )}
              <div style={{ display: 'flex', gap: 16, marginTop: 14, fontSize: 12.5, color: V.greyMed }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><Icon name="phone" size={13} color={V.greyMed} />Call guidance included</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><Icon name="arrowUpRight" size={13} color={V.greyMed} />Escalation path defined</span>
              </div>
            </div>
          </div>
          </>)}
          {tab === 'log' && <CustomerLogView c={c} onChange={() => forceTick((t) => t + 1)} />}
          {tab === 'contract' && <ContractView c={c} />}
        </div>

        {/* footer actions */}
        <div style={{ padding: '14px 24px', borderTop: `1px solid ${V.greyXLight}`, background: V.white, display: 'flex', flexDirection: 'column', gap: 8, flexShrink: 0 }}>
          {lastEscalation && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: V.red, background: V.redLight, borderRadius: 6, padding: '6px 10px' }}>
              <Icon name="alert" size={13} color={V.red} strokeWidth={2} />
              Escalated to leadership by {lastEscalation.by} · {nFmt(lastEscalation.ts)}
            </div>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Button kind="primary" size="md" icon="check2" onClick={() => setLogOpen(true)} style={{ flex: 1 }}>Log outreach</Button>
            <Button kind="danger" size="md" icon="alert" onClick={() => setEscalateOpen(true)}>Escalate</Button>
            {c.snoozedUntil ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Button kind="secondary" size="md" icon="clock" disabled>{`Snoozed · ${Math.max(1, Math.ceil((c.snoozedUntil - Date.now()) / 86400000))}d left`}</Button>
                <button onClick={() => { window.HEALTH.clearSnooze(c.id); if (window.Sync) window.Sync.logActivity({ who: 'Riley', action: 'removed snooze', account: c.name }); forceTick((t) => t + 1); }} title="Remove snooze" style={{ background: 'transparent', border: 0, cursor: 'pointer', padding: 2, display: 'inline-flex' }}>
                  <Icon name="close" size={14} color={V.greyMed} />
                </button>
              </div>
            ) : (
              <Button kind="secondary" size="md" icon="clock" onClick={() => { window.HEALTH.snoozeAccount(c.id, 30); if (window.Sync) window.Sync.logActivity({ who: 'Riley', action: 'snoozed', account: c.name, detail: '30 days' }); forceTick((t) => t + 1); }}>Snooze 30d</Button>
            )}
          </div>
        </div>
        {escalateOpen && <EscalateToLeadershipModal c={c} onClose={() => setEscalateOpen(false)} onEscalated={() => forceTick((t) => t + 1)} />}
        {logOpen && window.MarkOutreachModal && React.createElement(window.MarkOutreachModal, { account: c, by: 'Riley', onClose: () => setLogOpen(false), onLogged: () => forceTick((t) => t + 1) })}
      </aside>
    </div>
  );
}

function Toggle({ on, onToggle, onLabel = 'On', offLabel = 'Off' }) {
  return (
    <button onClick={onToggle} style={{
      display: 'inline-flex', alignItems: 'center', gap: 8, cursor: 'pointer', border: 0, background: 'transparent', fontFamily: V.font, flexShrink: 0,
    }}>
      <span style={{ fontSize: 12, fontWeight: 600, color: on ? V.greenDeep : V.greyDark }}>{on ? onLabel : offLabel}</span>
      <span style={{ width: 40, height: 22, borderRadius: 64, background: on ? V.greenDeep : V.greyLight, position: 'relative', transition: 'background 120ms ease', flexShrink: 0 }}>
        <span style={{ position: 'absolute', top: 2, left: on ? 20 : 2, width: 18, height: 18, borderRadius: '50%', background: V.white, transition: 'left 120ms ease', boxShadow: '0 1px 2px rgba(0,0,0,0.2)' }} />
      </span>
    </button>
  );
}

function DetailTabs({ tab, setTab }) {
  const tabs = [['signals', 'Health signals'], ['log', 'Customer log'], ['contract', 'Contract']];
  return (
    <div style={{ display: 'flex', gap: 2, background: V.greyXLight, padding: 2, borderRadius: 6, marginBottom: 20 }}>
      {tabs.map(([k, l]) => (
        <button key={k} onClick={() => setTab(k)} style={{
          flex: 1, border: 0, cursor: 'pointer', borderRadius: 4, padding: '7px 12px',
          fontSize: 13, fontWeight: 600, fontFamily: V.font,
          background: tab === k ? V.white : 'transparent', color: tab === k ? V.black : V.greyDark,
          boxShadow: tab === k ? V.shadow1 : 'none',
        }}>{l}</button>
      ))}
    </div>
  );
}

function ScoreChip({ health }) {
  const b = health.band;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '3px 10px', borderRadius: 64, background: b.bg, color: b.color, fontSize: 12, fontWeight: 600 }}>
      <Icon name="heart" size={12} color={b.color} strokeWidth={2} />
      {health.score != null ? <span>{health.score}<span style={{ opacity: 0.6, fontWeight: 500 }}>/100</span> · {b.label}</span> : b.label}
    </span>
  );
}

function Gauge({ score, color, size = 66 }) {
  const r = (size - 8) / 2; const circ = 2 * Math.PI * r; const off = circ * (1 - score / 100);
  return (
    <svg width={size} height={size} style={{ flexShrink: 0 }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#E3E0D8" strokeWidth="7" />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth="7" strokeLinecap="round"
        strokeDasharray={circ} strokeDashoffset={off} transform={`rotate(-90 ${size / 2} ${size / 2})`} />
      <text x="50%" y="50%" textAnchor="middle" dominantBaseline="central" fontSize="18" fontWeight="700" fill="#141414" fontFamily="var(--font-ui)">{score}</text>
    </svg>
  );
}

const STAT_COLOR = { green: '#5F7D5A', yellow: '#96762F', red: '#A9493F' };
const STAT_BG = { green: '#E8EFE4', yellow: '#F2EBD8', red: '#F5E5E2' };

function MetricRow({ m, last }) {
  const col = STAT_COLOR[m.status];
  const pct = m.max ? Math.min(1, m.earned / m.max) : 0;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '10px 16px 10px 20px', borderBottom: last ? 'none' : `1px solid ${V.greyXLight}` }}>
      <span style={{ width: 7, height: 7, borderRadius: '50%', background: col, flexShrink: 0 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: V.black }}>{m.label}{m.sample && <span style={{ color: V.orangeDark }}> *</span>}</div>
        <div style={{ fontSize: 11.5, color: V.greyMed, marginTop: 2, lineHeight: '15px' }}>{m.note}</div>
      </div>
      <div style={{ flexShrink: 0, width: 70, textAlign: 'right' }}>
        <div style={{ fontSize: 12.5, fontWeight: 700, color: V.black }}>{m.earned}<span style={{ fontSize: 11, fontWeight: 500, color: V.greyMed }}>/{m.max}</span></div>
        <div style={{ width: 70, height: 4, borderRadius: 3, background: V.greyXLight, marginTop: 4, overflow: 'hidden', marginLeft: 'auto' }}>
          <div style={{ width: (pct * 100) + '%', height: '100%', background: col, borderRadius: 3 }} />
        </div>
      </div>
    </div>
  );
}

function CategoryBlock({ cat, first }) {
  const col = STAT_COLOR[cat.status], bg = STAT_BG[cat.status];
  return (
    <div style={{ borderTop: first ? 'none' : `1px solid ${V.greyXLight}` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 16px', background: V.greyBg }}>
        <span style={{ flexShrink: 0, width: 26, height: 26, borderRadius: 6, background: bg, color: col, fontSize: 13, fontWeight: 700, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>{cat.letter}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13.5, fontWeight: 700, color: V.black }}>{cat.name}</div>
          <div style={{ fontSize: 11.5, color: V.greyMed, marginTop: 1 }}>{cat.desc}</div>
        </div>
        <span style={{ flexShrink: 0, fontSize: 12, fontWeight: 700, color: col, background: bg, padding: '3px 9px', borderRadius: 64 }}>{cat.earned}/{cat.max}</span>
      </div>
      {cat.metrics.map((m, i) => <MetricRow key={m.label} m={m} last={i === cat.metrics.length - 1} />)}
    </div>
  );
}

function HealthScore({ c }) {
  const h = c.health; const b = h.band;
  if (h.onboarding || h.nodata) {
    return (
      <div style={{ marginBottom: 24 }}>
        <SubHead icon="heart">Customer health score</SubHead>
        <div style={{ border: `1px solid ${V.greyXLight}`, borderRadius: 8, padding: 16, background: V.white, display: 'flex', gap: 12, alignItems: 'flex-start' }}>
          <span style={{ flexShrink: 0, padding: '4px 11px', borderRadius: 64, background: b.bg, color: b.color, fontSize: 12.5, fontWeight: 600 }}>{b.label}</span>
          <div>
            <div style={{ fontSize: 13.5, fontWeight: 600, color: V.black }}>{h.onboarding ? 'Auto-green during onboarding' : 'Awaiting usage data'}</div>
            <div style={{ fontSize: 12.5, color: V.greyMed, marginTop: 4, lineHeight: '18px' }}>{h.note}</div>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div style={{ marginBottom: 24 }}>
      <SubHead icon="heart">Customer health score</SubHead>
      <div style={{ marginTop: -8, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <Chip tone="purple">Weighted scorecard</Chip>
        <span style={{ fontSize: 11.5, color: V.greyMed }}>Deployment · Engagement · Adoption · ROI</span>
      </div>
      <div style={{ border: `1px solid ${V.greyXLight}`, borderRadius: 8, overflow: 'hidden', background: V.white }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 18, padding: '16px 18px', background: V.greyBg, borderBottom: `1px solid ${V.greyXLight}` }}>
          <Gauge score={h.score} color={b.track} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
              <span style={{ fontSize: 30, fontWeight: 700, color: V.black, lineHeight: 1 }}>{h.score}</span>
              <span style={{ fontSize: 14, color: V.greyMed, fontWeight: 500 }}>/ 100</span>
              <span style={{ marginLeft: 4, padding: '3px 10px', borderRadius: 64, background: b.bg, color: b.color, fontSize: 12, fontWeight: 600 }}>{b.label}</span>
            </div>
            <div style={{ fontSize: 12.5, color: V.greyMed, marginTop: 7, lineHeight: '17px' }}>Built from four categories — onboarding setup, engagement with CS/support, product usage, and value realized vs. spend. Each is scored green / yellow / red and weighted into the overall score.</div>
          </div>
        </div>
        {h.categories.map((cat, i) => <CategoryBlock key={cat.key} cat={cat} first={i === 0} />)}
        <div style={{ padding: '10px 16px', borderTop: `1px solid ${V.greyXLight}`, fontSize: 11, color: V.greyMed, display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ color: V.orangeDark, fontWeight: 700 }}>*</span> Sample input — becomes real once Help desk, active-user events, and contract entitlements are wired up.
        </div>
      </div>
    </div>
  );
}

function ItemGroup({ title, fee, items, last }) {
  return (
    <div style={{ borderBottom: last ? 'none' : `1px solid ${V.greyXLight}`, padding: '12px 14px', background: V.white }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <span style={{ fontSize: 12.5, fontWeight: 700, color: V.black }}>{title} <span style={{ fontWeight: 400, color: V.greyMed }}>· {items.length} included</span></span>
        <span style={{ fontSize: 13, fontWeight: 700, color: V.black }}>{fee}</span>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {items.map((it) => (
          <span key={it} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 10px', borderRadius: 4, background: V.greyBg, border: `1px solid ${V.greyXLight}`, fontSize: 12, color: V.greyDark }}>
            <Icon name="check" size={11} color={V.greenDeep} strokeWidth={2.5} />{it}
          </span>
        ))}
      </div>
    </div>
  );
}

// ───────────────────────────────────────────────────────────────────────────
// Customer log — shared call/note history kept on the account so context
// doesn't leave with a person. Entries are stored in cc_acct_notes (same key
// notes.jsx reads for "Account notes" on the Notes & Tasks page), extended
// with a shape: { id, ts, type: 'call'|'note', by, source: 'Notes'|'Manual',
// summary, fullNotes?, commitment?: bool, done?: bool, isTodo?: bool }.
// Mock history is seeded once per account (status-relevant) so the tab isn't
// empty — a real build would sync this from Notes (see Build Plan).
// ───────────────────────────────────────────────────────────────────────────

function seedLogFor(c) {
  const pb = playbookFor(c);
  const csmFirst = c.csm === 'Unassigned' ? 'Jordan' : c.csm.split(' ')[0];
  const base = Date.now();
  if (c.status === 'healthy' || c.status === 'upsell') {
    return [
      {
        id: 'seed1', ts: base - 86400000 * 30, type: 'call', by: csmFirst, source: 'Notes',
        summary: 'Quarterly check-in — steady usage, no concerns raised. Confirmed renewal expectations and current champion.',
        fullNotes: `Walked through usage trends (steady, in line with contract). No open issues. Champion confirmed as primary contact through renewal. Mentioned interest in exploring additional ${c.platform === 'OEM' ? 'OEM' : 'platform'} workflows next quarter — flagged as a soft expansion signal for ${csmFirst} to revisit closer to renewal.`,
        commitment: true, done: true,
      },
    ];
  }
  if (c.status === 'stall') {
    return [
      {
        id: 'seed1', ts: base - 86400000 * 21, type: 'call', by: csmFirst, source: 'Notes',
        summary: 'Kickoff/onboarding call — walked through first login batch together.',
        fullNotes: `Reviewed the onboarding checklist and ran the first batch of logins live on the call. Team seemed comfortable with the workflow by the end. Agreed ${csmFirst} would follow up in two weeks to confirm logins are continuing on their own.`,
        commitment: true, done: false, isTodo: true,
        todoText: `Follow up with ${c.name} — confirm logins resumed after onboarding call`,
      },
      {
        id: 'seed2', ts: base - 86400000 * 2, type: 'note', by: 'System', source: 'Manual',
        summary: `Auto-flagged: ${c.headline || 'Certification activity stalled at zero since onboarding.'}`,
      },
    ];
  }
  if (c.status === 'risk') {
    return [
      {
        id: 'seed1', ts: base - 86400000 * 45, type: 'call', by: csmFirst, source: 'Notes',
        summary: 'Quarterly check-in — usage looked healthy at the time, no flags raised.',
        fullNotes: 'Standard QBR. Logins was tracking with prior quarters. No concerns surfaced from either side. Next touchpoint scheduled informally for next quarter.',
        commitment: false,
      },
      {
        id: 'seed2', ts: base - 86400000 * 3, type: 'note', by: 'System', source: 'Manual',
        summary: `Auto-flagged: ${c.headline || 'Logins dropped sharply month over month.'}`,
        isTodo: true, done: false,
        todoText: `Reach out to ${c.name} — confirm what changed and use Playbook ${pb.code} (${pb.name})`,
      },
    ];
  }
  // watch
  return [
    {
      id: 'seed1', ts: base - 86400000 * 60, type: 'call', by: csmFirst, source: 'Notes',
      summary: 'Quarterly check-in — healthy at the time, light discussion on usage patterns.',
      fullNotes: 'Routine QBR. Usage was within normal range. Briefly discussed seasonal dips the team sometimes sees — noted as expected, not a concern at the time.',
      commitment: false,
    },
  ];
}

function CustomerLogView({ c, onChange }) {
  const H = window.HEALTH;
  const { overrides, setOverride } = useOverrides();
  const muted = overrides[c.id] === 'noaction';

  // entries lives in state (not a useMemo over window.NOTESDB) so that
  // mutations below — addNote, markAttendance, etc. — actually re-render
  // this view. Previously this was a useMemo keyed on c.id only, so writes
  // to NOTESDB never showed up until the account was reopened (this is why
  // "Mark attended"/"Mark no-show" looked broken — they wrote to storage
  // correctly but the UI never re-read it).
  const [entries, setEntries] = React.useState(() => {
    const all = window.NOTESDB.get('cc_acct_notes', {});
    if (all[c.id] && all[c.id].length) return all[c.id];
    const seeded = seedLogFor(c);
    const next = { ...all, [c.id]: seeded };
    window.NOTESDB.set('cc_acct_notes', next);
    return seeded;
  });

  // Persist a new entries list — updates both NOTESDB (storage/sync) and
  // local state (so the UI reflects it immediately).
  const saveEntries = (list) => {
    const updated = { ...window.NOTESDB.get('cc_acct_notes', {}) };
    updated[c.id] = list;
    window.NOTESDB.set('cc_acct_notes', updated);
    setEntries(list);
    if (onChange) onChange();
  };

  const [expanded, setExpanded] = React.useState({});
  const [showCommitments, setShowCommitments] = React.useState(false);
  const [noteInput, setNoteInput] = React.useState('');
  const [schedOpen, setSchedOpen] = React.useState(false);
  const [schedDate, setSchedDate] = React.useState('');
  const [schedNote, setSchedNote] = React.useState('');
  const [outcomeNotes, setOutcomeNotes] = React.useState({}); // { [entryId]: noteText } — draft notes while picking an outcome

  const sorted = entries.slice().sort((a, b) => b.ts - a.ts);
  const todos = entries.filter((e) => e.isTodo && !e.done);
  const delivered = entries.filter((e) => e.commitment && e.done);
  const handoffs = new Set(entries.map((e) => e.by)).size;
  const scheduledCalls = entries.filter((e) => e.type === 'scheduled_call');
  const callsAttended = scheduledCalls.filter((e) => e.status === 'attended').length;
  const callsNoShow = scheduledCalls.filter((e) => e.status === 'no-show').length;
  const callsRescheduled = scheduledCalls.filter((e) => e.status === 'rescheduled').length;
  const callsPending = scheduledCalls.filter((e) => e.status === 'pending').length;
  // Reschedules don't count toward either side of the attended ratio — they're
  // not a no-show, but they're not "attended" either, so they're tracked
  // separately rather than muddying the headline number.
  const callsDecided = callsAttended + callsNoShow;

  const addNote = () => {
    const text = noteInput.trim();
    if (!text) return;
    const list = entries.slice();
    list.push({ id: window.NOTESDB.uid(), ts: Date.now(), type: 'note', by: 'Riley', source: 'Manual', summary: text });
    saveEntries(list);
    setNoteInput('');
  };

  // Log a scheduled call — recorded with status 'pending' until the CSM
  // records what actually happened. Lets the team see how often calls are
  // scheduled vs. actually happen.
  const logScheduledCall = () => {
    if (!schedDate) return;
    const list = entries.slice();
    list.push({ id: window.NOTESDB.uid(), ts: Date.now(), type: 'scheduled_call', by: 'Riley', source: 'Manual', scheduledFor: schedDate, summary: schedNote || 'Check-in call scheduled.', status: 'pending' });
    saveEntries(list);
    if (window.Sync) window.Sync.logActivity({ who: 'Riley', action: 'scheduled call', account: c.name, detail: schedDate });
    setSchedDate(''); setSchedNote(''); setSchedOpen(false);
  };

  // Record what happened with a scheduled call — Attended / Rescheduled /
  // No-show, with optional notes. Updates the scheduled_call entry's status
  // in place (it's the permanent record) and adds a follow-up History note
  // for visibility in the feed.
  const markOutcome = (call, status) => {
    const note = (outcomeNotes[call.id] || '').trim();
    const list = entries.map((e) => e.id === call.id ? { ...e, status, outcomeNotes: note || null } : e);
    const labels = { attended: 'Attended as scheduled', rescheduled: 'Rescheduled', 'no-show': "Customer didn't attend" };
    const summaryBase = `${labels[status]} (${call.scheduledFor}).`;
    list.push({ id: window.NOTESDB.uid(), ts: Date.now(), type: 'note', by: 'Riley', source: 'Manual', summary: note ? `${summaryBase} ${note}` : summaryBase });
    saveEntries(list);
    setOutcomeNotes((prev) => { const next = { ...prev }; delete next[call.id]; return next; });
    if (window.Sync) window.Sync.logActivity({ who: 'Riley', action: `marked call ${status}`, account: c.name, detail: call.scheduledFor, full: note ? { Notes: note } : undefined });
  };

  // Mark a to-do done — marks the originating entry done (so it drops off
  // "Open to-dos" and counts toward "delivered commitments" if it was one),
  // and adds a new History entry recording the completion.
  const markTodoDone = (todo) => {
    const list = entries.map((e) => e.id === todo.id ? { ...e, done: true } : e);
    list.push({ id: window.NOTESDB.uid(), ts: Date.now(), type: 'note', by: 'Riley', source: 'Manual', summary: `Completed: ${todo.todoText || todo.summary}` });
    saveEntries(list);
    if (window.Sync) window.Sync.logActivity({ who: 'Riley', action: 'completed to-do', account: c.name, detail: todo.todoText || todo.summary });
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
        <Icon name="users" size={14} color={V.greyMed} strokeWidth={1.9} />
        <span style={{ fontSize: 12.5, color: V.greyMed }}>Shared history, kept on the account so context never leaves with a person.</span>
        <Chip tone="orange" icon="refresh">Syncs from Notes</Chip>
        <SampleBadge label="Mock call history" />
      </div>

      {/* Add a note — kept at the top so it's the first thing a CSM can do */}
      <div style={{ display: 'flex', gap: 8, marginBottom: schedOpen ? 10 : 18 }}>
        <input value={noteInput} onChange={(e) => setNoteInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') addNote(); }} placeholder="Add a note…"
          style={{ flex: 1, height: 36, padding: '0 10px', fontSize: 13, fontFamily: V.font, color: V.black, border: `1px solid ${V.greyLight}`, borderRadius: 6, outline: 'none', background: V.white }} />
        <Button kind="secondary" size="md" icon="plus" onClick={addNote}>Add</Button>
        <Button kind="secondary" size="md" icon="calendar" onClick={() => setSchedOpen((o) => !o)}>Log scheduled call</Button>
      </div>
      {schedOpen && (
        <div style={{ display: 'flex', gap: 8, marginBottom: 18, alignItems: 'flex-end' }}>
          <div style={{ flexShrink: 0 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: V.greyMed, marginBottom: 4 }}>Date</div>
            <input type="date" value={schedDate} onChange={(e) => setSchedDate(e.target.value)}
              style={{ height: 36, padding: '0 10px', fontSize: 13, fontFamily: V.font, color: V.black, border: `1px solid ${V.greyLight}`, borderRadius: 6, outline: 'none', background: V.white }} />
          </div>
          <input value={schedNote} onChange={(e) => setSchedNote(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') logScheduledCall(); }} placeholder="What's the call for? (optional)"
            style={{ flex: 1, height: 36, padding: '0 10px', fontSize: 13, fontFamily: V.font, color: V.black, border: `1px solid ${V.greyLight}`, borderRadius: 6, outline: 'none', background: V.white }} />
          <Button kind="secondary" size="md" icon="check" onClick={logScheduledCall} disabled={!schedDate}>Log</Button>
        </div>
      )}

      {/* AI account summary */}
      <div style={{ border: `1px solid ${V.purpleLight}`, borderRadius: 8, padding: 16, background: V.purpleLight, marginBottom: 18 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
          <Icon name="sparkles" size={15} color={V.purpleDark} strokeWidth={1.9} />
          <span style={{ fontSize: 13, fontWeight: 700, color: V.purpleDark }}>Account summary</span>
          <Chip tone="purple">AI</Chip>
          <span style={{ fontSize: 12, color: V.greyMed }}>· {handoffs} CSM handoff{handoffs === 1 ? '' : 's'} on record</span>
          {scheduledCalls.length > 0 && (
            <Chip tone={callsDecided > 0 && callsNoShow > 0 ? 'orange' : 'grey'} icon="calendar" title="Scheduled calls — attended vs. no-show (reschedules tracked separately)">
              {callsAttended}/{callsDecided || scheduledCalls.length} calls attended
              {callsRescheduled > 0 ? ` · ${callsRescheduled} rescheduled` : ''}
              {callsPending > 0 ? ` · ${callsPending} pending` : ''}
            </Chip>
          )}
        </div>
        <div style={{ fontSize: 13.5, color: V.black, lineHeight: '20px' }}>
          {sorted[0] ? sorted[0].summary : 'No history yet — add a note or call summary below.'}
        </div>
        <div style={{ fontSize: 11.5, color: V.greyMed, marginTop: 8, lineHeight: '15px' }}>Auto-generated from the full history below — what a new CSM reads first.</div>
      </div>

      {/* Open to-dos from calls */}
      <div style={{ marginBottom: 18 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <Icon name="check2" size={15} color={V.black} strokeWidth={1.9} />
          <span style={{ fontSize: 14, fontWeight: 700, color: V.black }}>Open to-dos from calls</span>
          <span style={{ fontSize: 12, color: V.greyMed }}>· {todos.length} open</span>
        </div>
        {todos.length === 0 ? (
          <div style={{ border: `1px solid ${V.greyXLight}`, borderRadius: 8, padding: '14px 16px', background: V.greyBgLight, fontSize: 13, color: V.greyMed, textAlign: 'center' }}>
            No open follow-ups. 🎉
          </div>
        ) : (
          <div style={{ border: `1px solid ${V.greyXLight}`, borderRadius: 8, overflow: 'hidden', background: V.white }}>
            {todos.map((t, i) => (
              <div key={t.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '11px 14px', borderBottom: i === todos.length - 1 ? 'none' : `1px solid ${V.greyXLight}` }}>
                <span onClick={() => markTodoDone(t)} title="Mark done" style={{ flexShrink: 0, marginTop: 2, width: 18, height: 18, borderRadius: 5, cursor: 'pointer', border: `1.5px solid ${V.greyLight}`, background: V.white, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }} />
                <span style={{ fontSize: 13, color: V.black, lineHeight: '18px' }}>{t.todoText || t.summary}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delivered commitments */}
      {delivered.length > 0 && (
        <div style={{ marginBottom: 18 }}>
          <button onClick={() => setShowCommitments((s) => !s)} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'transparent', border: 0, cursor: 'pointer', padding: 0, fontSize: 12.5, fontWeight: 600, color: V.blue, fontFamily: V.font }}>
            <Icon name={showCommitments ? 'chevronUp' : 'chevronDown'} size={14} color={V.blue} />
            {delivered.length} delivered commitment{delivered.length === 1 ? '' : 's'} — {showCommitments ? 'hide' : 'show'}
          </button>
          {showCommitments && (
            <div style={{ marginTop: 8, border: `1px solid ${V.greyXLight}`, borderRadius: 8, overflow: 'hidden', background: V.white }}>
              {delivered.map((d, i) => (
                <div key={d.id} style={{ padding: '11px 14px', borderBottom: i === delivered.length - 1 ? 'none' : `1px solid ${V.greyXLight}`, fontSize: 13, color: V.greyDark, lineHeight: '18px', display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                  <Icon name="check" size={14} color={V.greenDeep} strokeWidth={2.5} style={{ marginTop: 2, flexShrink: 0 }} />
                  <span>{d.summary}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* History */}
      <div style={{ marginBottom: 18 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <Icon name="clock" size={15} color={V.black} strokeWidth={1.9} />
          <span style={{ fontSize: 14, fontWeight: 700, color: V.black }}>History</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
          {sorted.map((e) => {
            const isOpen = !!expanded[e.id];
            const isEscalation = e.type === 'escalation';
            const isSchedCall = e.type === 'scheduled_call';
            const typeIcon = e.type === 'call' ? 'phone' : isEscalation ? 'alert' : isSchedCall ? 'calendar' : 'fileText';
            const typeLabel = e.type === 'call' ? 'Call' : isEscalation ? 'Escalation' : isSchedCall ? 'Scheduled call' : 'Note';
            return (
              <div key={e.id} style={{ border: `1px solid ${isEscalation ? V.red : V.greyXLight}`, borderRadius: 8, padding: '12px 14px', background: isEscalation ? V.redLight : V.white }}>
                <div style={{ display: 'flex', gap: 11, alignItems: 'flex-start' }}>
                  <span style={{ flexShrink: 0, width: 30, height: 30, borderRadius: '50%', background: isEscalation ? V.white : V.greyBg, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon name={typeIcon} size={14} color={isEscalation ? V.red : V.greyDark} strokeWidth={1.9} />
                  </span>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginBottom: 3 }}>
                      <span style={{ fontSize: 13.5, fontWeight: 600, color: V.black }}>{typeLabel}</span>
                      <Chip tone={isEscalation ? 'red' : 'grey'}>{typeLabel}</Chip>
                      {e.source === 'Notes' && <Chip tone="purple" icon="sparkles">Notes</Chip>}
                      {isSchedCall && (
                        <Chip tone={e.status === 'attended' ? 'green' : e.status === 'no-show' ? 'red' : e.status === 'rescheduled' ? 'blue' : 'orange'} icon={e.status === 'attended' ? 'check' : e.status === 'no-show' ? 'close' : e.status === 'rescheduled' ? 'refresh' : 'clock'}>
                          {e.status === 'attended' ? 'Attended' : e.status === 'no-show' ? 'No-show' : e.status === 'rescheduled' ? 'Rescheduled' : 'Scheduled'}
                        </Chip>
                      )}
                    </div>
                    {isSchedCall && <div style={{ fontSize: 12.5, color: V.greyDark, marginBottom: 2 }}>Scheduled for {e.scheduledFor}</div>}
                    <div style={{ fontSize: 13, color: V.black, lineHeight: '18px' }}>{e.summary}</div>
                    {e.outcomeNotes && <div style={{ fontSize: 12.5, color: V.greyDark, lineHeight: '17px', marginTop: 4 }}>{e.outcomeNotes}</div>}
                    {e.fullNotes && (
                      <>
                        {isOpen && <div style={{ fontSize: 12.5, color: V.greyDark, lineHeight: '18px', marginTop: 8, paddingTop: 8, borderTop: `1px solid ${V.greyXLight}` }}>{e.fullNotes}</div>}
                        <button onClick={() => setExpanded((p) => ({ ...p, [e.id]: !p[e.id] }))} style={{ marginTop: 6, background: 'transparent', border: 0, cursor: 'pointer', padding: 0, fontSize: 12, fontWeight: 600, color: V.blue, fontFamily: V.font, display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Icon name={isOpen ? 'chevronUp' : 'chevronDown'} size={12} color={V.blue} />
                          {isOpen ? 'Hide full notes' : 'Read full notes'}
                        </button>
                      </>
                    )}
                    {isSchedCall && e.status === 'pending' && (
                      <div style={{ marginTop: 8 }}>
                        <input value={outcomeNotes[e.id] || ''} onChange={(ev) => setOutcomeNotes((prev) => ({ ...prev, [e.id]: ev.target.value }))} placeholder="Notes (optional)…"
                          style={{ width: '100%', height: 32, padding: '0 9px', fontSize: 12.5, fontFamily: V.font, color: V.black, border: `1px solid ${V.greyLight}`, borderRadius: 6, outline: 'none', boxSizing: 'border-box', marginBottom: 6 }} />
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                          <Button kind="secondary" size="sm" icon="check" onClick={() => markOutcome(e, 'attended')}>Attended</Button>
                          <Button kind="secondary" size="sm" icon="refresh" onClick={() => markOutcome(e, 'rescheduled')}>Rescheduled</Button>
                          <Button kind="secondary" size="sm" icon="close" onClick={() => markOutcome(e, 'no-show')}>No-show</Button>
                        </div>
                      </div>
                    )}
                    <div style={{ fontSize: 11.5, color: V.greyMed, marginTop: 6 }}>{e.by} · {nFmt(e.ts)}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <div style={{ fontSize: 11.5, color: V.greyMed, lineHeight: '16px' }}>
          In production, call summaries and action items auto-post here from Notes / the AI notetaker — long calls collapse to a summary with "Read full notes," so even years of history stays scannable.
        </div>
      </div>

      {/* CSM override */}
      <div style={{ padding: '11px 14px', borderRadius: 8, background: muted ? V.greenLight : V.greyBg, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, minWidth: 0 }}>
          <Icon name={muted ? 'check2' : 'shield'} size={15} color={muted ? V.greenDeep : V.greyDark} strokeWidth={1.9} />
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 12.5, fontWeight: 600, color: muted ? V.greenDeep : V.black }}>{muted ? 'Marked "No action needed"' : 'CSM override'}</div>
            <div style={{ fontSize: 11, color: V.greyMed, marginTop: 1 }}>{muted ? 'Hidden from the worklist & alert counts until you undo.' : 'Override the signal if you know this account is fine.'}</div>
          </div>
        </div>
        <Toggle on={muted} onLabel="No action" offLabel="Mark OK" onToggle={() => {
          const next = muted ? null : 'noaction';
          setOverride(c.id, next);
          if (window.Sync) window.Sync.logActivity({ who: 'Riley', action: next ? 'marked no action needed' : 'removed no-action mark', account: c.name });
        }} />
      </div>
    </div>
  );
}

function ContractView({ c }) {
  const H = window.HEALTH; const k = c.contract;
  const cell = { padding: '11px 12px', fontSize: 13, color: V.greyDark };
  const headCell = { padding: '9px 12px' };
  const appCols = '1.7fr 1.2fr 1fr 1fr';
  const svcCols = '1.5fr 1.1fr 0.9fr 0.9fr 1fr';
  return (
    <div>
      <div style={{ fontSize: 12.5, color: V.greyMed, marginBottom: 18, display: 'flex', alignItems: 'center', gap: 7, lineHeight: '17px', flexWrap: 'wrap' }}>
        <Icon name="fileText" size={14} color={V.greyMed} style={{ flexShrink: 0 }} /> Pulled from the CRM order form. Every line item — SKUs and data sources included — is broken out individually. <SampleBadge label="Sample figures" />
      </div>

      <SubHead icon="dollar">One-time fees</SubHead>
      <div style={{ border: `1px solid ${V.greyXLight}`, borderRadius: 8, overflow: 'hidden', marginBottom: 22 }}>
        {k.oneTime.map((o, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 14px', borderBottom: `1px solid ${V.greyXLight}` }}>
            <span style={{ fontSize: 13.5, color: V.greyDark }}>{o.label}</span>
            <span style={{ fontSize: 13.5, fontWeight: 600, color: V.black }}>{H.fmtUSD0(o.amount)}</span>
          </div>
        ))}
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 14px', background: V.greyBg }}>
          <span style={{ fontSize: 13.5, fontWeight: 700, color: V.black }}>Total one-time fees</span>
          <span style={{ fontSize: 13.5, fontWeight: 700, color: V.black }}>{H.fmtUSD0(k.oneTimeTotal)}</span>
        </div>
      </div>

      <SubHead icon="layers">Application</SubHead>
      <div style={{ border: `1px solid ${V.greyXLight}`, borderRadius: 8, overflow: 'hidden', marginBottom: 22 }}>
        <div style={{ display: 'grid', gridTemplateColumns: appCols, background: V.inkBar, color: V.white, fontSize: 10.5, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          <div style={headCell}>Application</div>
          <div style={{ ...headCell, textAlign: 'center' }}>Unit Allotment</div>
          <div style={{ ...headCell, textAlign: 'center' }}>Per-Unit</div>
          <div style={{ ...headCell, textAlign: 'right' }}>Annual Fees</div>
        </div>
        <div style={{ padding: '10px 12px', fontSize: 13, fontWeight: 700, color: V.black, background: V.greyBg, borderBottom: `1px solid ${V.greyXLight}` }}>{k.application.certification}</div>
        <div style={{ display: 'grid', gridTemplateColumns: appCols, borderBottom: `1px solid ${V.greyXLight}`, alignItems: 'center' }}>
          <div style={cell}>{k.application.group}</div>
          <div style={{ ...cell, textAlign: 'center' }}>{k.application.allotment} {k.application.allotmentUnit}</div>
          <div style={{ ...cell, textAlign: 'center' }}>{H.fmtUSDc(k.application.perUnit)}</div>
          <div style={{ ...cell, textAlign: 'right', fontWeight: 700, color: V.black }}>{H.fmtUSD0(k.application.annual)}</div>
        </div>
        <ItemGroup title="Core Platform SKUs" fee={H.fmtUSD0(k.application.skusFee)} items={k.application.skus} />
        <ItemGroup title="Data Sources" fee={H.fmtUSD0(k.application.dataFee)} items={k.application.dataSources} last />
      </div>

      <SubHead icon="briefcase">Services</SubHead>
      <div style={{ border: `1px solid ${V.greyXLight}`, borderRadius: 8, overflow: 'hidden', marginBottom: 22 }}>
        <div style={{ display: 'grid', gridTemplateColumns: svcCols, background: V.inkBar, color: V.white, fontSize: 10.5, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          <div style={headCell}>Services</div>
          <div style={{ ...headCell, textAlign: 'center' }}>Unit Allotment</div>
          <div style={{ ...headCell, textAlign: 'center' }}>Per-Unit</div>
          <div style={{ ...headCell, textAlign: 'center' }}>Overages</div>
          <div style={{ ...headCell, textAlign: 'right' }}>Annual Fees</div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: svcCols, borderBottom: `1px solid ${V.greyXLight}`, alignItems: 'center' }}>
          <div style={cell}>{k.services.name}</div>
          <div style={{ ...cell, textAlign: 'center' }}>{k.services.allotment} {k.services.allotmentUnit}</div>
          <div style={{ ...cell, textAlign: 'center' }}>{H.fmtUSDc(k.services.perUnit)}</div>
          <div style={{ ...cell, textAlign: 'center' }}>{H.fmtUSDc(k.services.overages)}</div>
          <div style={{ ...cell, textAlign: 'right', fontWeight: 700, color: V.black }}>{H.fmtUSD0(k.services.annual)}</div>
        </div>
        <div style={{ padding: '10px 14px', fontSize: 12, color: V.greyMed, lineHeight: '17px' }}>
          <span style={{ fontWeight: 600, color: V.greyDark }}>Data Sources: </span>{k.services.note}
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24, background: V.inkBar, color: V.white, borderRadius: 8, padding: '14px 22px' }}>
          <span style={{ fontSize: 13, fontWeight: 600, letterSpacing: '0.02em' }}>Annual Commitment</span>
          <span style={{ fontSize: 20, fontWeight: 700 }}>{H.fmtUSD0(k.annualCommitment)}</span>
        </div>
      </div>
    </div>
  );
}

function UtilLine({ l, last }) {
  const pct = l.pct;
  const col = pct >= 70 ? V.greenDeep : pct >= 40 ? V.orangeDark : V.red;
  return (
    <div style={{ padding: '11px 14px', borderBottom: last ? 'none' : `1px solid ${V.greyXLight}` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 7, gap: 8 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: V.black }}>{l.label}{l.sample && <span style={{ color: V.orangeDark }}> *</span>}{l.real && <span style={{ fontSize: 10, fontWeight: 700, color: V.greenDeep, marginLeft: 6 }}>REAL</span>}</span>
        <span style={{ fontSize: 12.5, color: V.greyDark, whiteSpace: 'nowrap' }}><strong style={{ color: V.black }}>{l.used.toLocaleString()}</strong> / {l.entitled.toLocaleString()} {l.unit} · <span style={{ fontWeight: 700, color: col }}>{Math.min(999, pct)}%</span></span>
      </div>
      <div style={{ height: 7, borderRadius: 4, background: V.greyXLight, overflow: 'hidden' }}>
        <div style={{ width: Math.min(100, pct) + '%', height: '100%', background: col, borderRadius: 4 }} />
      </div>
    </div>
  );
}

function SubHead({ icon, children }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
      {icon && <Icon name={icon} size={15} color={V.greyDark} strokeWidth={2} />}
      <span style={{ fontSize: 14, fontWeight: 700, color: V.black }}>{children}</span>
    </div>
  );
}

Object.assign(window, { CustomerDetail, playbookFor });
