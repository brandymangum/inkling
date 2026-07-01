// Customer Health — customer detail slide-over
// Loaded as <script type="text/babel" src="lib/detail.jsx">

// playbook + outreach mapping (from Alex's trigger/playbook library)
function playbookFor(c) {
  const map = {
    risk: {
      code: '1A', name: 'Usage Activity — Decrease',
      philosophy: 'Catch the dip while it is still a conversation, not a renewal problem.',
      sla: 'Outreach within 2 business days',
      email: {
        tag: 'Option C — First outreach (uncovered account)',
        subject: 'Checking in on your Inkling compliance',
        body: `Hi [First name], I'm Alex on Inkling's Customer Success team — I'll be your point of contact going forward.\n\nI noticed your team's compliance activity has dropped over the last couple of months. I wanted to reach out directly rather than wait: is there a workflow change, a staffing shift, or something on our end getting in the way?\n\nHappy to find 15 minutes this week to make sure Inkling is pulling its weight for you.`,
      },
    },
    stall: {
      code: '1B', name: 'Usage Activity — Stall',
      philosophy: 'A signed contract with zero usage is a renewal already at risk. Re-onboard now.',
      sla: 'Outreach within 1 business day',
      email: {
        tag: 'Option C — First outreach (uncovered account)',
        subject: 'Getting your Inkling account off the ground',
        body: `Hi [First name], I'm Alex from Inkling's Customer Success team.\n\nI'm reaching out because it looks like your team hasn't logged any active usage yet. I'd love to help you get your first users onboarded — most teams are up and running after one short working session.\n\nWould a 20-minute setup call this week work? I can walk through the first batch with you live.`,
      },
    },
    watch: {
      code: '1A', name: 'Usage Activity — Early Warning (cumulative)',
      philosophy: 'No single month trips the alert, but the trend line is heading the wrong way. Intervene early.',
      sla: 'Outreach within 5 business days',
      email: {
        tag: 'Option C — First outreach (uncovered account)',
        subject: 'Quick check-in on your compliance workflow',
        body: `Hi [First name], I'm Alex from Inkling's Customer Success team — your new point of contact.\n\nThings look steady week to week, but your overall compliance volume has softened a bit since the start of the year. I'd love to understand what's changed and make sure nothing is slowing your team down.\n\nOpen to a quick 15-minute call in the next week or two?`,
      },
    },
    upsell: {
      code: '1C', name: 'Usage Activity — Surge / Expansion',
      philosophy: 'Growth is the best time to talk about the plan. Get ahead of the cap before it becomes friction.',
      sla: 'Outreach within 5 business days',
      email: {
        tag: 'Option C — First outreach (uncovered account)',
        subject: 'Your compliance volume is growing fast',
        body: `Hi [First name], I'm Alex from Inkling's Customer Success team.\n\nYour MAU volume has grown significantly over the past few months — great to see. I wanted to make sure your current plan keeps pace and that you're not bumping into any limits as you scale.\n\nCould we grab 15 minutes to look at where you're headed? I want to make sure Inkling grows with you.`,
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
  if (c.status === 'stall') out.push({ icon: 'octagon', tone: 'red', text: `Zero usage activity across all ${H.MONTHS.length} months — stall trigger.` });
  if (c.status === 'risk') out.push({ icon: 'trendingDown', tone: 'red', text: `Usage activity down ${H.fmtPct(c.verifMom)} month-over-month (${prev} → ${last} in ${H.MONTHS[H.MONTHS.length - 1]}) — crossed the 30% decline trigger.` });
  if (c.status === 'watch') out.push({ icon: 'activity', tone: 'orange', text: `Cumulative ${H.fmtPct(c.verifCum)} since the January baseline (${base} → ${last}). A slow slide that never trips a single-month alert.` });
  if (c.status === 'upsell') out.push({ icon: 'trendingUp', tone: 'purple', text: `MAU volume up ${H.fmtPct(c.verifMom)} MoM and ${H.fmtPct(c.verifCum)} since January — 30% growth (expansion) signal.` });
  if (c.status !== 'healthy' && c.status !== 'onboarding' && c.status !== 'nodata' && c.renewalDays <= 60) out.push({ icon: 'calendar', tone: 'orange', text: `Renews in ${c.renewalDays} days (${H.fmtRenewal(c.renewal)}) — worth a proactive touch before renewal.` });
  if (!c.impl && !c.nd && c.sfHealth && c.sfHealth !== '—' && ((c.sfHealth === 'Green' && (c.status === 'risk' || c.status === 'watch')) || (c.sfHealth === 'Red' && (c.status === 'healthy' || c.status === 'upsell')))) out.push({ icon: 'alert', tone: 'orange', text: `Heads up: Salesforce health is ${c.sfHealth}, but the usage signal says ${H.STATUS[c.status].label.toLowerCase()} — the two disagree, which is exactly what this dashboard surfaces.` });
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
    <div style={{ border: `1px solid ${V.greyXLight}`, borderRadius: 8, padding: 16, background: '#fff' }}>
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

function CustomerDetail({ c, onClose }) {
  const H = window.HEALTH;
  const [taskDone, setTaskDone] = React.useState(false);
  const [tab, setTab] = React.useState('signals');
  const [emailOpen, setEmailOpen] = React.useState(c.status !== 'healthy');
  const { overrides, setOverride } = useOverrides();
  const muted = overrides[c.id] === 'noaction';
  if (!c) return null;
  const pb = playbookFor(c);
  const reasons = triggerReasons(c);
  const near = c.renewalDays <= 60;

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', justifyContent: 'flex-end' }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(29,29,33,0.32)' }} />
      <aside style={{
        position: 'relative', width: 620, maxWidth: '94vw', height: '100%', background: '#fff',
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
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 8 }}>
                <CsmTag csm={c.csm} />
                <SfdcLink url={c.sfdcUrl} />
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
            <StatBlock label="SF Health">{c.sfHealth === '—' ? '—' : c.sfHealth}</StatBlock>
            <StatBlock label="Open tickets" sub="the support desk">{c.tickets}</StatBlock>
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
            <div style={{ border: `1px solid ${V.greyXLight}`, borderRadius: 8, padding: 16, background: '#fff' }}>
              <div style={{ marginBottom: 14 }}>{taskDone ? <Chip tone="blue" icon="clock">Pending · Alex · just now</Chip> : <OutreachStatus c={c} />}</div>
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
                  <Chip tone="grey" icon="briefcase">Logged in Salesforce</Chip>
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
                <Icon name="refresh" size={12} color={V.greyMed} /> Activity syncs from Salesforce. Sending outreach or creating a task below logs back automatically.
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
            <ChartCard title="MAU volume" delta={c.verifMom} footer={`${H.MONTHS[0]}–${H.MONTHS[H.MONTHS.length - 1]} 2026 · cumulative ${H.fmtPct(c.verifCum)} vs baseline`}>
              <TrendChart data={c.verif} months={H.MONTHS} color={H.trendColor(c.status) === '#A4A8AF' ? V.greyDark : H.trendColor(c.status)} valueFmt={(v) => v >= 1000 ? (v / 1000).toFixed(1) + 'k' : v} />
            </ChartCard>
            <ChartCard title="Login activity — unique users" delta={c.loginMom} footer="Primary usage signal (logins weight higher than seat count for contract health).">
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
            <div style={{ border: `1px solid ${V.greyXLight}`, borderRadius: 8, overflow: 'hidden', background: '#fff' }}>
              {c.util.lines.map((l, i) => <UtilLine key={l.key} l={l} last={i === c.util.lines.length - 1} />)}
            </div>
            <div style={{ fontSize: 11.5, color: V.greyMed, marginTop: 9, lineHeight: '16px' }}>Per Brian &amp; Sam: watch usage across <em>all</em> contract areas — not just MAUs — plus client logins, API calls, and mass data exports as future signals.</div>
          </div>

          {/* support tickets */}
          <div style={{ marginBottom: 24 }}>
            <SubHead icon="bell">Open support tickets</SubHead>
            <div style={{ marginTop: -8, marginBottom: 12 }}><SampleBadge label="From the support desk" /></div>
            <div style={{ border: `1px solid ${V.greyXLight}`, borderRadius: 8, padding: 16, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
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
                <span style={{ fontSize: 12, fontWeight: 700, color: '#fff', background: V.greenDeep, padding: '3px 8px', borderRadius: 4, letterSpacing: '0.02em' }}>Playbook {pb.code}</span>
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
          {tab === 'contract' && <ContractView c={c} />}
        </div>

        {/* CSM override */}
        <div style={{ padding: '11px 24px', borderTop: `1px solid ${V.greyXLight}`, background: muted ? V.greenLight : V.greyBg, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, minWidth: 0 }}>
            <Icon name={muted ? 'check2' : 'shield'} size={15} color={muted ? V.greenDeep : V.greyDark} strokeWidth={1.9} />
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 12.5, fontWeight: 600, color: muted ? V.greenDeep : V.black }}>{muted ? 'Marked “No action needed”' : 'CSM override'}</div>
              <div style={{ fontSize: 11, color: V.greyMed, marginTop: 1 }}>{muted ? 'Hidden from the worklist & alert counts until you undo.' : 'Override the signal if you know this account is fine.'}</div>
            </div>
          </div>
          <Toggle on={muted} onLabel="No action" offLabel="Mark OK" onToggle={() => setOverride(c.id, muted ? null : 'noaction')} />
        </div>

        {/* footer actions */}
        <div style={{ padding: '14px 24px', borderTop: `1px solid ${V.greyXLight}`, background: '#fff', display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          {taskDone ? (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 9, color: V.greenDeep, fontSize: 13.5, fontWeight: 600 }}>
              <span style={{ width: 22, height: 22, borderRadius: '50%', background: V.greenLight, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="check" size={13} color={V.greenDeep} strokeWidth={2.5} />
              </span>
              Task created in Salesforce — assigned to Digital CS
            </div>
          ) : (
            <>
              <Button kind="primary" size="md" icon="check2" onClick={() => setTaskDone(true)} style={{ flex: 1 }}>Create CSM task in Salesforce</Button>
              <Button kind="secondary" size="md" icon="clock">Snooze 30d</Button>
            </>
          )}
        </div>
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
        <span style={{ position: 'absolute', top: 2, left: on ? 20 : 2, width: 18, height: 18, borderRadius: '50%', background: '#fff', transition: 'left 120ms ease', boxShadow: '0 1px 2px rgba(0,0,0,0.2)' }} />
      </span>
    </button>
  );
}

function DetailTabs({ tab, setTab }) {
  const tabs = [['signals', 'Health signals'], ['contract', 'Contract']];
  return (
    <div style={{ display: 'flex', gap: 2, background: V.greyXLight, padding: 2, borderRadius: 6, marginBottom: 20 }}>
      {tabs.map(([k, l]) => (
        <button key={k} onClick={() => setTab(k)} style={{
          flex: 1, border: 0, cursor: 'pointer', borderRadius: 4, padding: '7px 12px',
          fontSize: 13, fontWeight: 600, fontFamily: V.font,
          background: tab === k ? '#fff' : 'transparent', color: tab === k ? V.black : V.greyDark,
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
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#E8EAEF" strokeWidth="7" />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth="7" strokeLinecap="round"
        strokeDasharray={circ} strokeDashoffset={off} transform={`rotate(-90 ${size / 2} ${size / 2})`} />
      <text x="50%" y="50%" textAnchor="middle" dominantBaseline="central" fontSize="18" fontWeight="700" fill="#1D1D21" fontFamily="var(--font-ui)">{score}</text>
    </svg>
  );
}

const STAT_COLOR = { green: '#00827B', yellow: '#D97A22', red: '#EB5757' };
const STAT_BG = { green: '#D9F4ED', yellow: '#FFE8D3', red: '#FBD7D7' };

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
        <div style={{ border: `1px solid ${V.greyXLight}`, borderRadius: 8, padding: 16, background: '#fff', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
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
        <Chip tone="purple">DEAR scorecard</Chip>
        <span style={{ fontSize: 11.5, color: V.greyMed }}>Deployment · Engagement · Adoption · ROI</span>
      </div>
      <div style={{ border: `1px solid ${V.greyXLight}`, borderRadius: 8, overflow: 'hidden', background: '#fff' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 18, padding: '16px 18px', background: V.greyBg, borderBottom: `1px solid ${V.greyXLight}` }}>
          <Gauge score={h.score} color={b.track} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
              <span style={{ fontSize: 30, fontWeight: 700, color: V.black, lineHeight: 1 }}>{h.score}</span>
              <span style={{ fontSize: 14, color: V.greyMed, fontWeight: 500 }}>/ 100</span>
              <span style={{ marginLeft: 4, padding: '3px 10px', borderRadius: 64, background: b.bg, color: b.color, fontSize: 12, fontWeight: 600 }}>{b.label}</span>
            </div>
            <div style={{ fontSize: 12.5, color: V.greyMed, marginTop: 7, lineHeight: '17px' }}>Gainsight-style DEAR scorecard. Each metric is scored green / yellow / red and weighted into its category and the overall score.</div>
          </div>
        </div>
        {h.categories.map((cat, i) => <CategoryBlock key={cat.key} cat={cat} first={i === 0} />)}
        <div style={{ padding: '10px 16px', borderTop: `1px solid ${V.greyXLight}`, fontSize: 11, color: V.greyMed, display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ color: V.orangeDark, fontWeight: 700 }}>*</span> Sample input — becomes real once the support desk, login events, and contract entitlements are wired up.
        </div>
      </div>
    </div>
  );
}

function ItemGroup({ title, fee, items, last }) {
  return (
    <div style={{ borderBottom: last ? 'none' : `1px solid ${V.greyXLight}`, padding: '12px 14px', background: '#fff' }}>
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

function ContractView({ c }) {
  const H = window.HEALTH; const k = c.contract;
  const cell = { padding: '11px 12px', fontSize: 13, color: V.greyDark };
  const headCell = { padding: '9px 12px' };
  const appCols = '1.7fr 1.2fr 1fr 1fr';
  const svcCols = '1.5fr 1.1fr 0.9fr 0.9fr 1fr';
  return (
    <div>
      <div style={{ fontSize: 12.5, color: V.greyMed, marginBottom: 18, display: 'flex', alignItems: 'center', gap: 7, lineHeight: '17px', flexWrap: 'wrap' }}>
        <Icon name="fileText" size={14} color={V.greyMed} style={{ flexShrink: 0 }} /> Pulled from the Salesforce order form. Every line item — SKUs and data sources included — is broken out individually. <SampleBadge label="Sample figures" />
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
        <div style={{ display: 'grid', gridTemplateColumns: appCols, background: V.black, color: '#fff', fontSize: 10.5, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          <div style={headCell}>Application</div>
          <div style={{ ...headCell, textAlign: 'center' }}>Unit Allotment</div>
          <div style={{ ...headCell, textAlign: 'center' }}>Per-Unit</div>
          <div style={{ ...headCell, textAlign: 'right' }}>Annual Fees</div>
        </div>
        <div style={{ padding: '10px 12px', fontSize: 13, fontWeight: 700, color: V.black, background: V.greyBg, borderBottom: `1px solid ${V.greyXLight}` }}>{k.application.usage}</div>
        <div style={{ display: 'grid', gridTemplateColumns: appCols, borderBottom: `1px solid ${V.greyXLight}`, alignItems: 'center' }}>
          <div style={cell}>{k.application.group}</div>
          <div style={{ ...cell, textAlign: 'center' }}>{k.application.allotment} {k.application.allotmentUnit}</div>
          <div style={{ ...cell, textAlign: 'center' }}>{H.fmtUSDc(k.application.perUnit)}</div>
          <div style={{ ...cell, textAlign: 'right', fontWeight: 700, color: V.black }}>{H.fmtUSD0(k.application.annual)}</div>
        </div>
        <ItemGroup title="Software SKUs" fee={H.fmtUSD0(k.application.skusFee)} items={k.application.skus} />
        <ItemGroup title="Data Sources" fee={H.fmtUSD0(k.application.dataFee)} items={k.application.dataSources} last />
      </div>

      <SubHead icon="briefcase">Services</SubHead>
      <div style={{ border: `1px solid ${V.greyXLight}`, borderRadius: 8, overflow: 'hidden', marginBottom: 22 }}>
        <div style={{ display: 'grid', gridTemplateColumns: svcCols, background: V.black, color: '#fff', fontSize: 10.5, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 24, background: V.black, color: '#fff', borderRadius: 8, padding: '14px 22px' }}>
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

Object.assign(window, { CustomerDetail });
