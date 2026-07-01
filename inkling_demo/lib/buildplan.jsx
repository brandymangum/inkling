// Customer Health — Build Plan / feasibility view
// Loaded as <script type="text/babel" src="lib/buildplan.jsx">

function BPSection({ title, hint, children, step }) {
  return (
    <section style={{ marginBottom: 34 }}>
      <div style={{ marginBottom: 16 }}>
        <h3 style={{ fontSize: 18, fontWeight: 700, color: V.black, margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
          {step && <span style={{ width: 24, height: 24, borderRadius: '50%', background: V.black, color: '#fff', fontSize: 13, fontWeight: 700, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>{step}</span>}
          {title}
        </h3>
        {hint && <div style={{ fontSize: 13, color: V.greyMed, marginTop: 6, maxWidth: 720, lineHeight: '19px' }}>{hint}</div>}
      </div>
      {children}
    </section>
  );
}

function ReadinessChip({ level }) {
  const map = {
    available: { tone: 'green', label: 'Available' },
    confirm: { tone: 'orange', label: 'Confirm w/ data team' },
    pending: { tone: 'orange', label: 'Access pending' },
    secondary: { tone: 'grey', label: 'Secondary' },
  };
  const m = map[level];
  return <Chip tone={m.tone}>{m.label}</Chip>;
}

// pipeline node
function Node({ icon, title, sub, tone = 'grey' }) {
  const tones = {
    grey: { bd: V.greyLight, ic: V.greyDark, bg: '#fff' },
    green: { bd: V.green, ic: V.greenDeep, bg: V.greenLight },
    purple: { bd: V.purple, ic: V.purple, bg: V.purpleLight },
    blue: { bd: V.blue, ic: V.blue, bg: V.blueBg },
  };
  const t = tones[tone];
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', background: t.bg, border: `1px solid ${t.bd}`, borderRadius: 6, minWidth: 0 }}>
      <Icon name={icon} size={17} color={t.ic} strokeWidth={1.9} />
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: V.black, lineHeight: 1.2, whiteSpace: 'nowrap' }}>{title}</div>
        {sub && <div style={{ fontSize: 11, color: V.greyMed, marginTop: 2 }}>{sub}</div>}
      </div>
    </div>
  );
}

function Arrow({ label }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexShrink: 0, padding: '0 2px' }}>
      {label && <span style={{ fontSize: 10, color: V.greyMed, marginBottom: 3, whiteSpace: 'nowrap' }}>{label}</span>}
      <Icon name="arrowRight" size={18} color={V.greyLight} strokeWidth={2} />
    </div>
  );
}

function StageCol({ label, children }) {
  return (
    <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: V.greyMed, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>{label}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>{children}</div>
    </div>
  );
}

function BuildPlan() {
  return (
    <main style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'transparent', overflow: 'hidden', minWidth: 0 }}>
      <header style={{ padding: '18px 32px 16px', background: '#fff', borderBottom: `1px solid ${V.greyXLight}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, fontSize: 12, color: V.greyMed }}>
          <span>Digital CS POC</span><Icon name="chevronRight" size={12} color={V.greyLight} /><span style={{ color: V.greyDark }}>Build Plan</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
          <div>
            <h2 style={{ fontSize: 26, fontWeight: 700, color: V.black, margin: 0, letterSpacing: '-0.02em' }}>Build Plan</h2>
            <div style={{ fontSize: 13.5, color: V.greyDark, marginTop: 7 }}>How we stand this dashboard up on the existing stack — for the data &amp; engineering review.</div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <Chip tone="green" icon="target">Reuse before buy</Chip>
            <Chip tone="blue" icon="calendar">Target · July 3, 2026</Chip>
          </div>
        </div>
      </header>

      <div style={{ flex: 1, overflow: 'auto', padding: '26px 32px 56px' }}>
        <div style={{ maxWidth: 1040 }}>

          {/* 1. data needed */}
          <BPSection step="1" title="What the dashboard needs" hint="Five signals, mostly already in the stack. The only real unknown is where login/auth events live.">
            <div style={{ border: `1px solid ${V.greyXLight}`, borderRadius: 8, overflow: 'hidden', background: '#fff', boxShadow: V.shadow2 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: V.font }}>
                <thead>
                  <tr style={{ background: V.greyBg }}>
                    {['Signal', 'Source', 'System', 'Readiness'].map((h, i) => (
                      <th key={h} style={{ textAlign: 'left', padding: '10px 16px', fontSize: 11, fontWeight: 600, color: V.greyDark, textTransform: 'uppercase', letterSpacing: '0.04em', borderBottom: `1px solid ${V.greyXLight}` }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['Usage / usage volume', 'Product database', 'PostgreSQL (RDS) → Dagster', 'available'],
                    ['Login activity — unique users', 'App auth / event logs', 'RDS or analytics store', 'confirm'],
                    ['ARR & renewal date', 'CRM', 'Salesforce', 'pending'],
                    ['Segment membership (<$50K OEM)', 'CRM', 'Salesforce', 'available'],
                    ['Seat count vs contracted', 'Product DB + contract', 'RDS + Salesforce', 'secondary'],
                  ].map((r, i, arr) => (
                    <tr key={r[0]}>
                      <td style={tdBP(i === arr.length - 1)}><span style={{ color: V.black, fontWeight: 600 }}>{r[0]}</span></td>
                      <td style={tdBP(i === arr.length - 1)}>{r[1]}</td>
                      <td style={tdBP(i === arr.length - 1)}><span style={{ fontFamily: V.mono, fontSize: 12.5, color: V.greyDark }}>{r[2]}</span></td>
                      <td style={tdBP(i === arr.length - 1)}><ReadinessChip level={r[3]} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </BPSection>

          {/* 2. architecture */}
          <BPSection step="2" title="Recommended architecture" hint="Reuse the roster-ingestion-service pattern that already pushes data into Salesforce via Lambda + SQS. Nothing new to buy.">
            <div style={{ border: `1px solid ${V.greyXLight}`, borderRadius: 8, padding: '22px 20px', background: '#fff', boxShadow: V.shadow2 }}>
              <div style={{ display: 'flex', alignItems: 'stretch', gap: 6 }}>
                <StageCol label="Sources">
                  <Node icon="database" title="PostgreSQL (RDS)" sub="mau · logins" />
                  <Node icon="briefcase" title="Salesforce" sub="ARR · renewal · segment" />
                </StageCol>
                <Arrow label="read-only" />
                <StageCol label="Pipeline (reuse)">
                  <Node icon="refresh" title="Dagster job" sub="nightly rollup" tone="green" />
                  <Node icon="layers" title="health_metrics" sub="account · month · deltas · flags" tone="green" />
                </StageCol>
                <Arrow label="EventBridge" />
                <StageCol label="Detection">
                  <Node icon="zap" title="Threshold Lambda" sub="±30% MoM + cumulative" />
                  <Node icon="server" title="SQS → Delivery Lambda" sub="reused from roster-ingestion" />
                </StageCol>
                <Arrow label="fan-out" />
                <StageCol label="Surfaces">
                  <Node icon="briefcase" title="Salesforce task" sub="auto-assigned · system of record" tone="purple" />
                  <Node icon="slack" title="Slack / Email" sub="alert the assigned CSM" tone="blue" />
                  <Node icon="grid" title="This dashboard" sub="the analytics warehouse / internal tool" tone="blue" />
                </StageCol>
              </div>
              <div style={{ marginTop: 18, display: 'flex', gap: 10, alignItems: 'flex-start', padding: '12px 14px', background: V.greenLight, borderRadius: 6 }}>
                <Icon name="check2" size={16} color={V.greenDeep} strokeWidth={2} style={{ marginTop: 1, flexShrink: 0 }} />
                <span style={{ fontSize: 13, lineHeight: '19px', color: '#0B5E4C' }}>
                  The <strong>roster-ingestion-service</strong> already runs Lambda&nbsp;+&nbsp;SQS&nbsp;→&nbsp;Salesforce in production. We add one Dagster rollup and one threshold Lambda — no new infrastructure, no new vendor. <strong>SQS fans out</strong>: the same alert creates a Salesforce task and posts to Slack (Incoming Webhook) and email (Amazon SES), so adding channels is config, not a rebuild.
                </span>
              </div>
            </div>
          </BPSection>

          {/* 3. options */}
          <BPSection step="3" title="Three ways to build it" hint="Same guiding principle throughout: reuse before we buy, buy before we build.">
            <div style={{ display: 'flex', gap: 14 }}>
              <OptionCard n="1" title="Claude as the intelligence layer" body="Anthropic API reads health data, drafts personalized outreach, and writes tasks + context to Salesforce." note="Most aligned with company direction. Needs a data-privacy review given the healthcare context." badge={{ tone: 'purple', label: 'Phase 2' }} icon="zap" />
              <OptionCard n="2" title="Lambda + SQS + Salesforce" body="Scheduled threshold checks against RDS; SQS queues alerts; delivery Lambda creates CSM tasks. Reuses roster-ingestion-service." note="Lowest lift and most likely to hit July 3." badge={{ tone: 'green', label: 'Recommended' }} icon="server" recommended />
              <OptionCard n="3" title="Salesforce-native Flow" body="Flow Builder monitors metrics already synced to Salesforce and creates CSM tasks." note="Fastest if data is already in SF — but cumulative-decline math is hard to express in Flow." badge={{ tone: 'grey', label: 'Fallback' }} icon="briefcase" />
            </div>
          </BPSection>

          {/* 4. guardrails + open questions side by side */}
          <div style={{ display: 'flex', gap: 22, flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 320 }}>
              <BPSection step="4" title="Compliance guardrails">
                <div style={{ border: `1px solid ${V.greyXLight}`, borderRadius: 8, padding: 18, background: '#fff', boxShadow: V.shadow2 }}>
                  {[
                    ['Commercial account data only', 'Alerts carry account name, ARR, usage counts & deltas, renewal — no personal data (PII).'],
                    ['PII stays behind auth', 'Record-level detail lives in Salesforce / the app; the CSM clicks through to reach it.'],
                    ['Approved channels only', 'Slack to the corporate workspace, email via SES — SOC 2 controls inherited, nothing fanned out ungoverned.'],
                    ['Read-only on the product DB', 'Pipeline never writes back to RDS.'],
                    ['Salesforce field-level security', 'Tasks respect existing CRM permissions.'],
                  ].map((g) => (
                    <div key={g[0]} style={{ display: 'flex', gap: 11, alignItems: 'flex-start', padding: '9px 0', borderBottom: `1px solid ${V.greyXLight}` }}>
                      <Icon name="shield" size={16} color={V.greenDeep} strokeWidth={1.9} style={{ marginTop: 1, flexShrink: 0 }} />
                      <div>
                        <div style={{ fontSize: 13.5, fontWeight: 600, color: V.black }}>{g[0]}</div>
                        <div style={{ fontSize: 12, color: V.greyMed, marginTop: 2, lineHeight: '17px' }}>{g[1]}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </BPSection>
            </div>
            <div style={{ flex: 1, minWidth: 320 }}>
              <BPSection step="5" title="Open questions for data + eng">
                <div style={{ border: `1px solid ${V.greyXLight}`, borderRadius: 8, padding: 18, background: '#fff', boxShadow: V.shadow2 }}>
                  {[
                    'Where do login / auth events live — RDS, or a separate analytics store?',
                    'Can we add a Dagster asset for the nightly health_metrics rollup, or extend one?',
                    'Confirm reuse of the roster-ingestion Lambda + SQS → Salesforce path, and add Slack webhook + SES as fan-out targets.',
                    'Which Salesforce object / field for CSM tasks, and assignment rules for uncovered accounts?',
                    'Lock final thresholds after baseline (30% MoM + a cumulative-decline trigger).',
                    "Does Andy's Finance expansion-signal project overlap — can we share the pipeline?",
                  ].map((q, i) => (
                    <div key={i} style={{ display: 'flex', gap: 11, alignItems: 'flex-start', padding: '9px 0', borderBottom: i === 5 ? 'none' : `1px solid ${V.greyXLight}` }}>
                      <span style={{ width: 16, height: 16, borderRadius: 4, border: `1.5px solid ${V.greyLight}`, flexShrink: 0, marginTop: 1 }} />
                      <span style={{ fontSize: 13, color: V.greyDark, lineHeight: '18px' }}>{q}</span>
                    </div>
                  ))}
                </div>
              </BPSection>
            </div>
          </div>

          {/* 6. timeline */}
          <BPSection step="6" title="Path to July 3">
            <div style={{ display: 'flex', gap: 0, alignItems: 'stretch' }}>
              {[
                ['Wk of Jun 16', 'Confirm data sources + Salesforce access. Lock thresholds with Reese.'],
                ['Wk of Jun 23', 'Build Dagster rollup + threshold Lambda. Reuse the SQS path.'],
                ['Wk of Jun 30', 'Wire SQS → Salesforce tasks. Dashboard reads health_metrics. Pilot 5 accounts.'],
                ['Jul 3', 'POC live for the pilot segment.'],
              ].map((t, i, arr) => (
                <div key={i} style={{ flex: 1, position: 'relative', paddingRight: i === arr.length - 1 ? 0 : 14 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                    <span style={{ width: 11, height: 11, borderRadius: '50%', background: i === arr.length - 1 ? V.green : V.black, flexShrink: 0, zIndex: 1 }} />
                    {i < arr.length - 1 && <span style={{ flex: 1, height: 2, background: V.greyLight }} />}
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: i === arr.length - 1 ? V.greenDeep : V.black, marginBottom: 5 }}>{t[0]}</div>
                  <div style={{ fontSize: 12.5, color: V.greyMed, lineHeight: '18px', paddingRight: 12 }}>{t[1]}</div>
                </div>
              ))}
            </div>
          </BPSection>

        </div>
      </div>
    </main>
  );
}

function tdBP(last) {
  return { padding: '12px 16px', fontSize: 13.5, color: V.greyDark, borderBottom: last ? 'none' : `1px solid ${V.greyXLight}`, verticalAlign: 'middle' };
}

function OptionCard({ n, title, body, note, badge, icon, recommended }) {
  return (
    <div style={{
      flex: 1, minWidth: 0, background: '#fff', borderRadius: 8, padding: 18,
      border: recommended ? `2px solid ${V.green}` : `1px solid ${V.greyXLight}`,
      boxShadow: recommended ? V.shadow2 : 'none',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <span style={{ width: 28, height: 28, borderRadius: 6, background: V.greyBg, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name={icon} size={16} color={V.greyDark} strokeWidth={1.9} />
          </span>
          <span style={{ fontSize: 12, fontWeight: 700, color: V.greyMed }}>Option {n}</span>
        </div>
        <Chip tone={badge.tone}>{badge.label}</Chip>
      </div>
      <div style={{ fontSize: 14.5, fontWeight: 700, color: V.black, marginBottom: 8, lineHeight: 1.25 }}>{title}</div>
      <div style={{ fontSize: 13, color: V.greyDark, lineHeight: '19px', marginBottom: 12 }}>{body}</div>
      <div style={{ fontSize: 12.5, color: V.greyMed, lineHeight: '18px', paddingTop: 11, borderTop: `1px solid ${V.greyXLight}`, fontStyle: 'italic' }}>{note}</div>
    </div>
  );
}

Object.assign(window, { BuildPlan });
