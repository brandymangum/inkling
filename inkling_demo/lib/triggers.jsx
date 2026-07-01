// Customer Health — Triggers & Thresholds tab
// Loaded as <script type="text/babel" src="lib/triggers.jsx">

function RuleRow({ tone, label, rule }) {
  const tones = { red: { bg: V.redLight, fg: V.red }, orange: { bg: V.orangeLight, fg: V.orangeDark }, purple: { bg: V.purpleLight, fg: V.purpleDark } };
  const t = tones[tone] || tones.red;
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '11px 0', borderBottom: `1px solid ${V.greyXLight}` }}>
      <span style={{ flexShrink: 0, fontSize: 11, fontWeight: 700, color: t.fg, background: t.bg, padding: '3px 9px', borderRadius: 64, minWidth: 64, textAlign: 'center' }}>{label}</span>
      <span style={{ fontSize: 13.5, lineHeight: '19px', color: V.greyDark, textWrap: 'pretty' }}>{rule}</span>
    </div>
  );
}

function TriggerCard({ num, name, status, statusTone, watch, rules, dataSource, note }) {
  return (
    <div style={{ border: `1px solid ${V.greyXLight}`, borderRadius: 8, overflow: 'hidden', background: '#fff', boxShadow: V.shadow2 }}>
      <div style={{ padding: '16px 18px', borderBottom: `1px solid ${V.greyXLight}`, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#fff', background: V.black, padding: '3px 9px', borderRadius: 4 }}>Trigger {num}</span>
            <h3 style={{ fontSize: 17, fontWeight: 700, color: V.black, margin: 0 }}>{name}</h3>
          </div>
          <div style={{ fontSize: 13, color: V.greyDark }}><span style={{ fontWeight: 600, color: V.black }}>Watching:</span> {watch}</div>
        </div>
        <Chip tone={statusTone}>{status}</Chip>
      </div>
      <div style={{ padding: '6px 18px 14px' }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: V.greyMed, textTransform: 'uppercase', letterSpacing: '0.04em', margin: '12px 0 2px' }}>Threshold logic</div>
        {rules.map((r, i) => <RuleRow key={i} {...r} />)}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 14 }}>
          <Icon name="database" size={14} color={V.greyMed} />
          <span style={{ fontSize: 12, color: V.greyDark }}><span style={{ fontWeight: 600 }}>Source:</span> <span style={{ fontFamily: V.mono, fontSize: 12 }}>{dataSource}</span></span>
        </div>
        {note && <div style={{ fontSize: 12, color: V.greyMed, marginTop: 10, lineHeight: '17px', display: 'flex', gap: 7 }}><Icon name="info" size={13} color={V.greyMed} style={{ flexShrink: 0, marginTop: 1 }} />{note}</div>}
      </div>
    </div>
  );
}

function Triggers() {
  const valid = [
    ['Would have caught Cobalt Studio\u2019s February dip (\u221230%)', 'green'],
    ['Would have caught Riverstone Digital\u2019s multi-month decline', 'green'],
    ['Would have caught Kingfisher Networks early \u2014 before it reached a 90% drop', 'green'],
    ['No false positives for growing accounts (Lakeside Labs, Kestrel Solutions)', 'green'],
  ];
  return (
    <main style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'transparent', overflow: 'hidden', minWidth: 0 }}>
      <header style={{ padding: '18px 32px 16px', background: '#fff', borderBottom: `1px solid ${V.greyXLight}`, flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, fontSize: 12, color: V.greyMed }}>
          <span>Digital CS POC</span><Icon name="chevronRight" size={12} color={V.greyLight} /><span style={{ color: V.greyDark }}>Triggers &amp; Thresholds</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
          <div>
            <h2 style={{ fontSize: 26, fontWeight: 700, color: V.black, margin: 0, letterSpacing: '-0.02em' }}>Triggers &amp; Thresholds</h2>
            <div style={{ fontSize: 13.5, color: V.greyDark, marginTop: 7 }}>Two core triggers, a single 30% month-over-month threshold, validated against Jan–May 2026 data.</div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <Chip tone="grey" icon="target">30% MoM</Chip>
            <Chip tone="orange" icon="info">Proposed · pending Reese</Chip>
          </div>
        </div>
      </header>

      <div style={{ flex: 1, overflow: 'auto', padding: '26px 32px 56px' }}>
        <div style={{ maxWidth: 920, display: 'flex', flexDirection: 'column', gap: 22 }}>

          <TriggerCard
            num={1} name="Usage Activity" status="Confirmed w/ Jordan" statusTone="green"
            watch="Monthly monthly-active-user volume per customer."
            rules={[
              { tone: 'red', label: 'Decline', rule: 'Current month is 30% or more below the previous month — early-warning alert.' },
              { tone: 'red', label: 'Stall', rule: 'Zero usage activity for 30 or more consecutive days — urgent alert.' },
              { tone: 'purple', label: 'Upsell', rule: 'Current month is 30% or more above the previous month — expansion signal.' },
              { tone: 'orange', label: 'Cumulative', rule: 'Down 30% or more from the highest point in the last 3 months — catches slow slides (the Kingfisher Networks case) that never trip a single-month alert.' },
            ]}
            dataSource="usage_events · event_at, is_success, organization"
            note="Cumulative-decline rule added after Kingfisher Networks slid from 128 to 12 without any single month crossing 30%."
          />

          <TriggerCard
            num={2} name="Login Activity & Usage" status="Direction confirmed · source TBD" statusTone="orange"
            watch="Login events and unique users logging in per customer, weekly or monthly."
            rules={[
              { tone: 'red', label: 'Decline', rule: 'Current month login activity is 30% or more below the previous month.' },
              { tone: 'purple', label: 'Upsell', rule: 'Current month login activity is 30% or more above the previous month.' },
            ]}
            dataSource="TBD — pending eng confirmation of where login-event data lives in the stack"
            note="Jordan flagged that seat-count-vs-contracted was the original Trigger 2, but contracted amounts can be annual or life-of-contract — a customer early in their contract can look underutilized while perfectly on track. Login activity is a more reliable behavioral signal because it doesn't depend on contract timing."
          />

          {/* exclusions */}
          <div style={{ border: `1px solid ${V.greyXLight}`, borderRadius: 8, padding: '16px 18px', background: '#fff', boxShadow: V.shadow2 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 8 }}>
              <Icon name="shield" size={16} color={V.greyDark} strokeWidth={1.9} />
              <h3 style={{ fontSize: 15, fontWeight: 700, color: V.black, margin: 0 }}>Exclusions &amp; maturity rule</h3>
            </div>
            <div style={{ fontSize: 13.5, color: V.greyDark, lineHeight: '20px' }}>Accounts in implementation or within 90 days of go-live are excluded from decline alerts and shown <strong>auto-green (Onboarding)</strong> until they reach maturity. Stall and decline triggers only apply to established usage.</div>
          </div>

          {/* validation */}
          <div style={{ border: `1px solid ${V.greyXLight}`, borderRadius: 8, padding: '16px 18px', background: '#fff', boxShadow: V.shadow2 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 12 }}>
              <Icon name="check2" size={16} color={V.greenDeep} strokeWidth={1.9} />
              <h3 style={{ fontSize: 15, fontWeight: 700, color: V.black, margin: 0 }}>Threshold validation</h3>
              <span style={{ fontSize: 12, color: V.greyMed }}>~25 accounts · Jan–May 2026</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
              {valid.map((v, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <Icon name="check" size={15} color={V.greenDeep} strokeWidth={2.25} style={{ marginTop: 2, flexShrink: 0 }} />
                  <span style={{ fontSize: 13.5, color: V.greyDark, lineHeight: '19px' }}>{v[0]}</span>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 14, padding: '11px 13px', background: V.redLight, borderRadius: 6, fontSize: 12.5, color: '#9B2C2C', lineHeight: '18px' }}>
              <strong>Immediate flags regardless of threshold:</strong> Clearwater Ventures &amp; Ironvale Technologies (zero activity all 5 months); Kingfisher Networks (128 → 12, a 90%+ drop).
            </div>
          </div>

          {/* open items */}
          <div style={{ border: `1px solid ${V.greyXLight}`, borderRadius: 8, padding: '16px 18px', background: V.greyBg }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: V.greyMed, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 10 }}>Still open</div>
            {[
              'All thresholds are proposed — finalize after the full baseline analysis and sign-off from Reese (senior CSM validator).',
              'Login-activity data source is TBD pending the engineering team.',
              'Six more triggers (failed-usage spike, usage-time degradation, support-ticket volume & silence, premium module decline, Needs-Review flags) are scoped in the Playbooks library for later phases.',
            ].map((t, i) => (
              <div key={i} style={{ display: 'flex', gap: 11, alignItems: 'flex-start', padding: '7px 0' }}>
                <span style={{ width: 16, height: 16, borderRadius: 4, border: `1.5px solid ${V.greyLight}`, flexShrink: 0, marginTop: 1, background: '#fff' }} />
                <span style={{ fontSize: 13, color: V.greyDark, lineHeight: '18px' }}>{t}</span>
              </div>
            ))}
          </div>

        </div>
      </div>
    </main>
  );
}

Object.assign(window, { Triggers });
