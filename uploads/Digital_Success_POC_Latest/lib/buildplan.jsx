// Customer Health — Build Plan / feasibility view
// Loaded as <script type="text/babel" src="lib/buildplan.jsx">

function BPSection({ title, hint, children, step }) {
  return (
    <section style={{ marginBottom: 34 }}>
      <div style={{ marginBottom: 16 }}>
        <h3 style={{ fontSize: 18, fontWeight: 700, color: V.black, margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
          {step && <span style={{ width: 24, height: 24, borderRadius: '50%', background: V.inkBar, color: V.onAccent, fontSize: 13, fontWeight: 700, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>{step}</span>}
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
    grey: { bd: V.greyLight, ic: V.greyDark, bg: V.white },
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

// ───────────────────────────────────────────────────────────────────────────
// "What this replaces & what it saves" — honest sweep of the tool landscape.
// Ranges are illustrative estimates, clearly labeled, to validate against the
// team's real tool spend and headcount.
// ───────────────────────────────────────────────────────────────────────────
function ReplacesAndSaves() {
  const replaces = [
    ['Dedicated Customer Success platform', 'The health scoring, risk worklist, playbooks, and alerting here are the core of what a paid CS platform (Gainsight, ChurnZero, Vitally, Catalyst, Totango, etc.) does.', '$18k–$60k / yr', 'Fully'],
    ['Manual health-tracking spreadsheets', 'The weekly "pull the numbers into a sheet and eyeball who’s slipping" ritual is replaced by a live, always-current view.', 'Time — see below', 'Fully'],
    ['Ad-hoc BI dashboard churn-checking', 'CSMs no longer hand-scan usage dashboards account by account looking for decline; the triggers surface it.', 'Time — see below', 'Mostly'],
    ['Separate reminder / alerting setup', 'Status-change alerts and escalations post automatically instead of living in someone’s calendar or a manual Slack habit.', 'Time — see below', 'Mostly'],
  ];
  const merges = [
    ['CRM', 'Account roster, ARR, renewal date, owner, and health rating.'],
    ['Product analytics / BI', 'Logins, active users, and usage trends — the core signals.'],
    ['Help desk', 'Open support ticket counts per account.'],
    ['Call notes / notetaker', 'Customer Log history and AI account summaries.'],
  ];
  const keeps = ['The CRM (still the system of record)', 'The product-analytics / BI / data warehouse', 'The help desk / ticketing tool', 'SSO / identity provider', 'Team chat (Slack) itself'];
  const savings = [
    ['Avoided CS-platform subscription', 'No dedicated CS tool to license.', '$18k–$60k / yr'],
    ['Reclaimed CSM time', '~2–4 hrs/CSM/week no longer spent pulling & assembling health data. At ~4 CSMs and a ~$55/hr loaded rate.', '$23k–$46k / yr'],
    ['Reclaimed analyst / report time', 'Fewer one-off "who’s at risk?" report requests to the data team.', '~$5k / yr'],
    ['Run cost', 'Static files on existing hosting, so no new infra there. Any ongoing cost comes from the data connections each source needs.', 'Low · depends on sources'],
  ];

  return (
    <section style={{ marginBottom: 34 }}>
      <div style={{ marginBottom: 16 }}>
        <h3 style={{ fontSize: 18, fontWeight: 700, color: V.black, margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
          <Icon name="dollar" size={20} color={V.greenDeep} strokeWidth={2.2} />
          What this replaces — and what it saves
        </h3>
        <div style={{ fontSize: 13, color: V.greyMed, marginTop: 6, maxWidth: 760, lineHeight: '19px' }}>
          An honest read on where this fits. It is a <strong>read + workflow layer</strong> that pulls signals from tools you already have into one view — not a new system of record. The dollar figures are <strong>rough, illustrative estimates</strong>; validate them against the team’s real tool spend and headcount before quoting them.
        </div>
      </div>

      {/* headline estimate */}
      <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: 16 }}>
        <div style={{ flex: '1 1 220px', background: V.greenLight, border: `1px solid ${V.green}`, borderRadius: 8, padding: '16px 18px' }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: V.greenDeep }}>Rough annual savings</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: V.greenDeep, lineHeight: 1.1, marginTop: 6, letterSpacing: '-0.02em' }}>~$45k–$110k</div>
          <div style={{ fontSize: 11.5, color: V.greenDeep, marginTop: 4, opacity: 0.85 }}>per year · the sum of the line items below · validate against real tool spend + headcount</div>
        </div>
        <div style={{ flex: '1 1 220px', background: V.white, border: `1px solid ${V.greyXLight}`, borderRadius: 8, padding: '16px 18px', boxShadow: V.shadow2 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: V.greyDark }}>New spend to run it</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: V.black, lineHeight: 1.1, marginTop: 6, letterSpacing: '-0.02em' }}>Low</div>
          <div style={{ fontSize: 11.5, color: V.greyMed, marginTop: 4 }}>hosting is near-zero; real cost depends on the data connections each source needs, plus one-time eng time to wire live data + auth</div>
        </div>
      </div>

      {/* replaces */}
      <div style={{ fontSize: 13, fontWeight: 700, color: V.black, marginBottom: 8 }}>Replaces / makes unnecessary</div>
      <div style={{ border: `1px solid ${V.greyXLight}`, borderRadius: 8, overflow: 'hidden', background: V.white, boxShadow: V.shadow2, marginBottom: 16 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: V.font }}>
          <thead>
            <tr style={{ background: V.greyBg }}>
              {['Tool / activity', 'What it does today', 'Est. cost avoided', 'Coverage'].map((h) => (
                <th key={h} style={{ textAlign: 'left', padding: '10px 16px', fontSize: 11, fontWeight: 600, color: V.greyDark, textTransform: 'uppercase', letterSpacing: '0.04em', borderBottom: `1px solid ${V.greyXLight}` }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {replaces.map((r, i, arr) => (
              <tr key={r[0]}>
                <td style={tdBP(i === arr.length - 1)}><span style={{ color: V.black, fontWeight: 600 }}>{r[0]}</span></td>
                <td style={tdBP(i === arr.length - 1)}><span style={{ fontSize: 12.5, lineHeight: '17px' }}>{r[1]}</span></td>
                <td style={tdBP(i === arr.length - 1)}><span style={{ fontSize: 12.5, fontWeight: 600, color: V.greenDeep }}>{r[2]}</span></td>
                <td style={tdBP(i === arr.length - 1)}><Chip tone={r[3] === 'Fully' ? 'green' : 'blue'}>{r[3]}</Chip></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* merges + still keep, side by side */}
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 16 }}>
        <div style={{ flex: 1, minWidth: 300 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: V.black, marginBottom: 8 }}>Merges into one view <span style={{ fontWeight: 500, color: V.greyMed }}>(sources stay)</span></div>
          <div style={{ border: `1px solid ${V.greyXLight}`, borderRadius: 8, padding: 16, background: V.white, boxShadow: V.shadow2 }}>
            {merges.map((m, i) => (
              <div key={m[0]} style={{ display: 'flex', gap: 11, alignItems: 'flex-start', padding: '9px 0', borderBottom: i === merges.length - 1 ? 'none' : `1px solid ${V.greyXLight}` }}>
                <Icon name="layers" size={16} color={V.purple} strokeWidth={1.9} style={{ marginTop: 1, flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: 13.5, fontWeight: 600, color: V.black }}>{m[0]}</div>
                  <div style={{ fontSize: 12, color: V.greyMed, marginTop: 2, lineHeight: '17px' }}>{m[1]}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ flex: 1, minWidth: 300 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: V.black, marginBottom: 8 }}>Does <em>not</em> replace <span style={{ fontWeight: 500, color: V.greyMed }}>(you still pay for these)</span></div>
          <div style={{ border: `1px solid ${V.greyXLight}`, borderRadius: 8, padding: 16, background: V.white, boxShadow: V.shadow2 }}>
            {keeps.map((k, i) => (
              <div key={i} style={{ display: 'flex', gap: 11, alignItems: 'flex-start', padding: '9px 0', borderBottom: i === keeps.length - 1 ? 'none' : `1px solid ${V.greyXLight}` }}>
                <Icon name="close" size={15} color={V.greyMed} strokeWidth={2} style={{ marginTop: 2, flexShrink: 0 }} />
                <span style={{ fontSize: 13, color: V.greyDark, lineHeight: '18px' }}>{k}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* savings breakdown */}
      <div style={{ fontSize: 13, fontWeight: 700, color: V.black, marginBottom: 8 }}>Where the savings come from</div>
      <div style={{ border: `1px solid ${V.greyXLight}`, borderRadius: 8, overflow: 'hidden', background: V.white, boxShadow: V.shadow2, marginBottom: 12 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: V.font }}>
          <thead>
            <tr style={{ background: V.greyBg }}>
              {['Line', 'Assumption', 'Est. / yr'].map((h) => (
                <th key={h} style={{ textAlign: 'left', padding: '10px 16px', fontSize: 11, fontWeight: 600, color: V.greyDark, textTransform: 'uppercase', letterSpacing: '0.04em', borderBottom: `1px solid ${V.greyXLight}` }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {savings.map((r, i, arr) => (
              <tr key={r[0]}>
                <td style={tdBP(i === arr.length - 1)}><span style={{ color: V.black, fontWeight: 600 }}>{r[0]}</span></td>
                <td style={tdBP(i === arr.length - 1)}><span style={{ fontSize: 12.5, lineHeight: '17px' }}>{r[1]}</span></td>
                <td style={tdBP(i === arr.length - 1)}><span style={{ fontSize: 12.5, fontWeight: 600, color: V.greenDeep }}>{r[2]}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: '12px 14px', background: V.orangeLight, borderRadius: 6 }}>
        <Icon name="alert" size={16} color={V.orangeDark} strokeWidth={2} style={{ marginTop: 1, flexShrink: 0 }} />
        <span style={{ fontSize: 12.5, lineHeight: '18px', color: V.orangeDark }}>
          <strong>Honest caveat:</strong> these are ballpark figures, not a quote. CS-platform pricing varies widely by vendor and seat count, and the "reclaimed time" line only becomes real savings if that time is redeployed. It also doesn’t replace your CRM, analytics, ticketing, SSO, or chat — those costs stay. Treat this as a starting point for a real ROI conversation, not the final number.
        </span>
      </div>
    </section>
  );
}

function BuildPlan() {
  return (
    <main style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'transparent', overflow: 'hidden', minWidth: 0 }}>
      <header style={{ padding: '18px 32px 16px', background: V.white, borderBottom: `1px solid ${V.greyXLight}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, fontSize: 12, color: V.greyMed }}>
          <span>Digital CS POC</span><Icon name="chevronRight" size={12} color={V.greyLight} /><span style={{ color: V.greyDark }}>Build Plan</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
          <div>
            <h2 style={{ fontSize: 26, fontWeight: 700, color: V.black, margin: 0, letterSpacing: '-0.02em' }}>Build Plan</h2>
            <div style={{ fontSize: 13.5, color: V.greyDark, marginTop: 7 }}>What this replaces, what it saves, and how we stand it up on the existing stack — for the data &amp; engineering review.</div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <Chip tone="green" icon="target">Reuse before buy</Chip>
            <Chip tone="blue" icon="calendar">Target · ~4 weeks</Chip>
          </div>
        </div>
      </header>

      <div style={{ flex: 1, overflow: 'auto', padding: '26px 32px 56px' }}>
        <div style={{ maxWidth: 1040 }}>

          <ReplacesAndSaves />

          {/* Progress so far */}
          <section style={{ marginBottom: 34 }}>
            <div style={{ marginBottom: 16 }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: V.black, margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
                <Icon name="check2" size={20} color={V.greenDeep} strokeWidth={2.2} />
                What's built so far
              </h3>
              <div style={{ fontSize: 13, color: V.greyMed, marginTop: 6, maxWidth: 760, lineHeight: '19px' }}>
                A working, end-to-end POC — dashboard, Leadership views, and alert/notification flows wired and ready to connect. Handing this off so someone else can pick up the remaining "go live" items in the table below.
              </div>
            </div>

            <div style={{ border: `1px solid ${V.greyXLight}`, borderRadius: 8, padding: '18px 20px', background: V.white, boxShadow: V.shadow2, marginBottom: 14 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: V.black, marginBottom: 10 }}>The dashboard</div>
              <ul style={{ margin: 0, paddingLeft: 20, fontSize: 13, color: V.greyDark, lineHeight: '22px' }}>
                <li>Customer Health view — live from a data feed (account roster + health rating), Risk-by-tier table, sortable Renewals.</li>
                <li>Account detail — DEAR health score, contract/utilization view, and a <strong>Customer Log</strong> tab (AI account summary, open to-dos from calls, collapsible call history, CSM "Mark OK" override, Snooze 30d) — currently seeded with mock history per account.</li>
                <li>Leadership Overview — three tabs: <strong>CSM Summary</strong> (per-CSM rollup, click-to-drill-down on red/watch/no-touch), <strong>Accounts</strong> (Needs Attention vs. Watch, split by the two core triggers), and <strong>Risk &amp; Revenue</strong> (renewals at risk, program impact, risk by segment).</li>
                <li>Role-based views — a "View as" toggle hides Leadership nav + Configure Alerts for the CSM role (today this is a UI toggle, not real auth — see SSO below).</li>
                <li>Trigger Settings — live-adjustable Decline/Watch thresholds, a read-only log of the active triggers, and a "Test alerts" tool.</li>
                <li>Fun/personalization — light/dark/pastel/neon themes, and a "this week's wins" log for quick personal acknowledgment.</li>
              </ul>
            </div>

            <div style={{ border: `1px solid ${V.greyXLight}`, borderRadius: 8, padding: '18px 20px', background: V.white, boxShadow: V.shadow2, marginBottom: 14 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: V.black, marginBottom: 10 }}>Alerts &amp; notifications — how they work</div>
              <div style={{ fontSize: 13, color: V.greyDark, lineHeight: '20px', marginBottom: 14 }}>
                Notifications were built and tested end-to-end — escalations, automatic status-change pings, and confirmation messages all fired correctly in testing. Connecting them to the team’s real chat workspace is the one remaining step (see the table below). The secure pattern — a small server-side relay that holds the webhook secret so it never lives in the browser — matches what step 7 describes for production.
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  ['1', 'Escalations post to the team channel', 'The "Escalate" (CSM Summary) and account-level "Escalate to Leadership" flows send a formatted message with context and @mentions.'],
                  ['2', 'Outreach + needs-attention pings', '"Mark outreach" and needs-attention alerts include the account, the plain-language reason, and the suggested playbook.'],
                  ['3', 'Automatic status-change alerts', 'When an account crosses into/out of Needs Attention after a data refresh, an alert fires automatically — "Needs attention" or a "Save" message.'],
                  ['4', 'Playbook references in each message', 'Each needs-attention message names the suggested playbook so the next step is clear.'],
                ].map((r) => (
                  <div key={r[0]} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    <span style={{ width: 22, height: 22, borderRadius: '50%', background: V.greyBg, color: V.greyDark, fontSize: 12, fontWeight: 700, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>{r[0]}</span>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: V.black }}>{r[1]}</div>
                      <div style={{ fontSize: 12.5, color: V.greyMed, marginTop: 2, lineHeight: '17px' }}>{r[2]}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ border: `1px solid ${V.greyXLight}`, borderRadius: 8, padding: '18px 20px', background: V.white, boxShadow: V.shadow2, marginBottom: 14 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: V.black, marginBottom: 10 }}>Updating the dashboard</div>
              <div style={{ fontSize: 13, color: V.greyDark, lineHeight: '20px', marginBottom: 14 }}>
                The dashboard is plain static files (HTML/JS) with no build step, so updating is just swapping in the new files wherever it ends up hosted and refreshing. Final hosting will be decided with IT.
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  ['1', 'Get the latest files', 'Use the latest export of the dashboard files (lib/*.jsx, lib/data.js, etc.).'],
                  ['2', 'Swap the files in place', 'Replace the existing files with the new ones wherever the dashboard is hosted.'],
                  ['3', 'Refresh to confirm', 'Reload the dashboard — no build step, so changes appear immediately.'],
                ].map((r) => (
                  <div key={r[0]} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    <span style={{ width: 22, height: 22, borderRadius: '50%', background: V.greyBg, color: V.greyDark, fontSize: 12, fontWeight: 700, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>{r[0]}</span>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: V.black }}>{r[1]}</div>
                      <div style={{ fontSize: 12.5, color: V.greyMed, marginTop: 2, lineHeight: '17px' }}>{r[2]}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ border: `1px solid ${V.greyXLight}`, borderRadius: 8, padding: '18px 20px', background: V.white, boxShadow: V.shadow2, marginBottom: 14 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: V.black, marginBottom: 10 }}>Going live: SSO &amp; data security</div>
              <div style={{ fontSize: 13, color: V.greyDark, lineHeight: '20px', marginBottom: 14 }}>
                Today this is a <strong>static front-end</strong> with a UI-only role switch — the "CSM view / Leadership view" toggle is a local flag, not real authentication, so anyone with the URL sees everything. Production needs a real login layer in front. The lowest-lift path puts an identity-aware access gateway in front of the existing static site.
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  ['1', 'Put the dashboard behind an identity-aware proxy', 'An identity-aware access gateway gates the site so no one reaches it without logging in — no app code changes to add it. Most major cloud and CDN providers offer one.'],
                  ['2', 'Connect it to your identity provider', 'Whatever the company already uses for SSO (Okta, Google Workspace, Microsoft Entra, etc.). The gateway runs the full SAML/OIDC login handshake; the app holds no auth code or passwords.'],
                  ['3', 'Drive roles from identity-provider groups', 'Map a group (e.g. “cs-leadership”) to the Leadership view and everyone else to the CSM view. The app reads the verified group claim instead of today’s localStorage toggle — a small, clean swap.'],
                  ['4', 'Move the underlying data server-side', 'The real protection step: today the data is a CSV/feed the browser downloads, so even behind a login the raw file is readable. Fetch it server-side behind the same auth, ideally scoped per person (a CSM sees their book; leadership sees all).'],
                ].map((r) => (
                  <div key={r[0]} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    <span style={{ width: 22, height: 22, borderRadius: '50%', background: V.greyBg, color: V.greyDark, fontSize: 12, fontWeight: 700, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>{r[0]}</span>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: V.black }}>{r[1]}</div>
                      <div style={{ fontSize: 12.5, color: V.greyMed, marginTop: 2, lineHeight: '17px' }}>{r[2]}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ fontSize: 12.5, color: V.greyMed, marginTop: 13, paddingTop: 12, borderTop: `1px solid ${V.greyXLight}`, lineHeight: '17px' }}>
                <strong style={{ color: V.greyDark }}>In short:</strong> An access gateway → your SSO for login, identity-provider groups for the CSM-vs-Leadership split, and move the data behind that same auth — the login screen alone doesn’t protect the numbers.
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: '12px 14px', background: V.greenLight, borderRadius: 6, marginBottom: 14 }}>
              <Icon name="check2" size={16} color={V.greenDeep} strokeWidth={2} style={{ marginTop: 1, flexShrink: 0 }} />
              <span style={{ fontSize: 13, lineHeight: '19px', color: '#3E5A39' }}>
                <strong>To take this live for the team,</strong> the main swap is pointing the alert relay at the team’s real chat workspace webhook — the dashboard wiring stays the same. The other go-live items — SSO, real CRM links, live usage data — are listed in the table below and don't block this swap.
              </span>
            </div>

            <div style={{ fontSize: 13, fontWeight: 700, color: V.black, marginBottom: 10 }}>What's real vs. mock right now</div>
            <div style={{ border: `1px solid ${V.greyXLight}`, borderRadius: 8, overflow: 'hidden', background: V.white, boxShadow: V.shadow2 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: V.font }}>
                <thead>
                  <tr style={{ background: V.greyBg }}>
                    {['Data / feature', 'Status', 'Notes'].map((h) => (
                      <th key={h} style={{ textAlign: 'left', padding: '10px 16px', fontSize: 11, fontWeight: 600, color: V.greyDark, textTransform: 'uppercase', letterSpacing: '0.04em', borderBottom: `1px solid ${V.greyXLight}` }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['Account roster (name, CSM, ARR, segment, renewal)', 'live', 'From the data feed / CSV — edits show up in the dashboard on refresh.'],
                    ['Health rating (Green/Yellow/Red)', 'live', 'From the account feed, joined by account name.'],
                    ['Logins & active-user volume (the two core triggers)', 'mock', 'Sample/illustrative — see step 2 (Closing the usage-data gap) for the plan to make this live.'],
                    ['Contract utilization detail (per-line entitlements)', 'mock', 'Marked with "Sample" badges in the UI — would come from the order form / CRM.'],
                    ['Customer Log (call history, AI summary, to-dos, scheduled calls)', 'mock + live', '1-2 seeded entries per account, status-relevant, marked "Mock call history". Scheduled-call logging and attendance tracking are real/functional — just not pre-populated with data.'],
                    ['Alerts (pings, auto-pings, escalations, confirmations)', 'wired, not connected', 'Notifications were tested end-to-end and work — just not yet pointed at the real chat workspace. Includes the "Escalate to Leadership" flow.'],
                    ['"Open in CRM" links', 'mock', 'Placeholder URLs — see step 8 for real per-account links.'],
                    ['Open tickets (help desk)', 'mock', 'Sample figures, badged in the UI.'],
                  ].map((r, i, arr) => (
                    <tr key={r[0]}>
                      <td style={tdBP(i === arr.length - 1)}><span style={{ color: V.black, fontWeight: 600 }}>{r[0]}</span></td>
                      <td style={tdBP(i === arr.length - 1)}><Chip tone={r[1] === 'live' ? 'green' : r[1].startsWith('live') ? 'blue' : 'orange'}>{r[1]}</Chip></td>
                      <td style={tdBP(i === arr.length - 1)}><span style={{ fontSize: 12.5, lineHeight: '17px' }}>{r[2]}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Decisions log */}
          <section style={{ marginBottom: 34 }}>
            <div style={{ marginBottom: 16 }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: V.black, margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
                <Icon name="fileText" size={20} color={V.purpleDark} strokeWidth={2.2} />
                Decisions log — what we did and why
              </h3>
              <div style={{ fontSize: 13, color: V.greyMed, marginTop: 6, maxWidth: 760, lineHeight: '19px' }}>
                The tradeoffs behind the build, in case you want to see how I got here. A running record of the calls made along the way, so a new engineer (or whoever picks this up next) can see the reasoning without re-deriving it. Grouped by area; "Still needed" notes where a decision is provisional pending more info.
              </div>
            </div>

            {[
              {
                area: 'Triggers',
                rows: [
                  ['Focused the POC on 2 core triggers', 'Kept the POC focused on the two highest-confidence signals (Product Usage Stall, Low Usage Across Contract) rather than diluting attention across many. The rest are scoped in the Playbooks library for later phases.', null],
                  ['30% month-over-month drop as the Low Usage threshold', 'One number to reason about across the dashboard. Adjustable live via Trigger Settings.', 'Validate against real usage data once step 2 is live — 30% may need tuning per segment.'],
                  ['Active users as a fallback signal for early-contract accounts', 'Seat utilization can look artificially low for customers still ramping up, which would false-flag healthy new accounts. Login / active-user volume doesn’t have that early-contract distortion.', 'Needs the same live-data wiring as usage volume (step 2).'],
                ],
              },
              {
                area: 'Data architecture',
                rows: [
                  ['Read-only on the product database', 'The pipeline only reads from the product database and CRM — it never writes back to source systems, so there’s no risk of corrupting a system of record.', null],
                  ['Reuse the existing data pipeline', 'Rather than propose a new orchestration tool, the plan adds one nightly rollup to whatever pipeline is already in place.', null],
                  ['Two versions of the architecture proposal', 'A simpler version using only already-approved stack components, plus a more technically-detailed one — so the plan fits whichever audience is reviewing.', null],
                ],
              },
              {
                area: 'Alert delivery',
                rows: [
                  ['A serverless relay, not a direct webhook call from the browser', 'Browsers can’t safely hold a chat webhook secret — anyone could read it from the page source and spam the channel. The relay holds the secret server-side and forwards formatted messages. This mirrors the production pattern in step 7.', 'Production swap is just the webhook URL → the team’s real workspace — see the green callout above.'],
                  ['Auto-pings on status transitions, not just manual buttons', 'Manual "Ping" / "Escalate" buttons cover intentional outreach, but accounts can silently cross into Needs Attention between sessions. Comparing each load against a stored status snapshot catches that without anyone having to remember to check.', null],
                ],
              },
              {
                area: 'Theming (Light / Dark / Pastel / Neon)',
                rows: [
                  ['Dark mode is a real second palette, not a CSS filter', 'Each theme is a full set of explicit color values in components.jsx, not a runtime invert/hue-rotate hack — so contrast stays correct on accent chips and dark surfaces.', null],
                  ['Two extra themes beyond Light/Dark: Pastel and Neon', 'Each is a full palette — Pastel is soft lavender/peach/mint with a rounded font; Neon is a dark, high-contrast palette with a monospace font. Light and Dark stay the primary themes.', null],
                  ['New tokens: inkBar and onAccent', 'Some elements (table headers, numbered badges, callouts) stay dark regardless of theme — inkBar handles that. onAccent is the text color for content sitting on saturated accent backgrounds.', null],
                ],
              },
              {
                area: 'Customer Log',
                rows: [
                  ['Seeded with 1-2 mock history entries per account, status-relevant', 'Avoids an empty-feeling tab during demos — a stalled account gets an onboarding-call entry, a healthy account gets a clean QBR summary, etc. Marked with a \u2018Mock call history’ badge so it’s clearly not real.', 'Real history needs the notes-tool integration — see step 8.'],
                  ['"Read full notes" expand/collapse on each history entry', 'Keeps the tab a consistent height/scan pattern across accounts regardless of how much detail any single call has — so even years of history stays scannable.', null],
                  ['CSM override ("Mark OK") lives inside the Customer Log tab', 'The override sits right next to the history that justifies it, which is where it makes the most contextual sense.', null],
                ],
              },
              {
                area: 'Honesty about what\'s connected',
                rows: [
                  ['"Create CSM task in the CRM" doesn\'t write to the CRM', 'Clicking it shows "Marked — the CRM isn’t connected yet, recorded here only" instead of pretending a real task was created. Same pattern applied to the Email outreach channel and CRM links — anything that looks like an integration but isn’t says so.', 'Real CRM write needs per-account record IDs (step 8).'],
                  ['Snooze 30d is functional (not just decorative)', 'Stores an expiry (synced), and the Needs Attention list filters out snoozed accounts until it expires. The button shows "Snoozed · Nd left" while active.', null],
                  ['Removed account deep links from alert messages', 'The current hosting path has a space in the filename, which breaks chat link auto-detection. Removed the deep link from needs-attention and escalation messages for now.', 'Re-add once there’s an internal hosting URL without spaces in the path — the deep-link helpers are still defined but unused.'],
                ],
              },
              {
                area: 'Shared sync layer',
                rows: [
                  ['A lightweight shared store, not a new database', 'Same "reuse before we buy" principle — no new vendor. localStorage stays as a fast local cache; a small shared backend is the source of truth for team state.', 'Needs to actually be deployed. Until then, sync is off and the app runs localStorage-only (each browser is its own silo).'],
                  ['Personal preferences (theme, role) stay device-local', 'These are about how one person likes to use the dashboard, not shared team state — syncing them would mean one person’s dark-mode preference overwrites another’s. Only outreach logs, overrides, snoozes, Customer Log, activity feed, check-ins, and wins sync.', null],
                  ['Activity feed added as a shared key', 'Once data is shared across browsers, "who did what" becomes visible and useful — pings, outreach, watch flags, snoozes, and overrides all log here.', null],
                ],
              },
              {
                area: 'Escalation to Leadership & meeting tracking',
                rows: [
                  ['"Create CSM task in the CRM" replaced with "Escalate to Leadership"', 'The CRM button was a placeholder that didn’t write anywhere — and didn’t address the real need, which is getting a hot customer in front of leadership fast. The new flow posts to the team channel with a popup for context.', null],
                  ['Escalation logged to the Customer Log, not just chat', 'Chat messages scroll away — if a CSM needs to show they escalated (e.g. during a post-mortem on a lost account), the Customer Log entry is the durable record. The footer also shows "Escalated by X · [time]" persistently once it happens.', null],
                  ['"Who\'s escalating" picker replaced with a free-text "Requested by" field', 'A fixed name list breaks every time someone joins or leaves. Now it’s a text field defaulting to the current user’s name, with quick-pick chips that fill it in but don’t restrict it. New hires never need a code change.', null],
                  ['Single account-level chat action', 'Escalate to Leadership is the one account-level channel action — it posts to the shared team channel (not a private DM) so the whole team has visibility, plus an @mention so the right person gets notified.', null],
                  ['"Notify" picker for @mentions', 'Both escalate flows have a "Notify" picker that @mentions the selected people. Real notifications require each person’s chat member ID in the lookup map — until filled in, mentions render as plain @Name text (visible but won’t ping).', 'Need the real chat member IDs once pointed at the team’s workspace.'],
                  ['Escalation checklist lists no-touch accounts by name', 'Instead of "reach out to 12 untouched accounts", the checklist lists the longest-no-contact accounts by name (capped at 3, oldest first) with their actual day counts, plus a "+N more" line if there’s overflow.', null],
                  ['Scheduled-call logging with attendance tracking (attended / no-show)', 'Log when a check-in call is scheduled, then mark it attended or no-show afterward. Surfaces as an "X/Y calls attended" chip on the account, so the team can see cadence and show-up rate over time.', 'A team-wide attendance rollup would need aggregating across accounts — not built yet.'],
                ],
              },
            ].map((group) => (
              <div key={group.area} style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: V.black, marginBottom: 8 }}>{group.area}</div>
                <div style={{ border: `1px solid ${V.greyXLight}`, borderRadius: 8, overflow: 'hidden', background: V.white, boxShadow: V.shadow2 }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: V.font }}>
                    <thead>
                      <tr style={{ background: V.greyBg }}>
                        {['Decision', 'Why', 'Still needed'].map((h) => (
                          <th key={h} style={{ textAlign: 'left', padding: '10px 16px', fontSize: 11, fontWeight: 600, color: V.greyDark, textTransform: 'uppercase', letterSpacing: '0.04em', borderBottom: `1px solid ${V.greyXLight}` }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {group.rows.map((r, i, arr) => (
                        <tr key={r[0]}>
                          <td style={tdBP(i === arr.length - 1)}><span style={{ color: V.black, fontWeight: 600 }}>{r[0]}</span></td>
                          <td style={tdBP(i === arr.length - 1)}><span style={{ fontSize: 12.5, lineHeight: '17px' }}>{r[1]}</span></td>
                          <td style={tdBP(i === arr.length - 1)}>{r[2] ? <span style={{ fontSize: 12.5, lineHeight: '17px', color: V.orangeDark }}>{r[2]}</span> : <span style={{ fontSize: 12.5, color: V.greyMed }}>—</span>}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </section>

          {/* 1. data needed */}
          <BPSection step="1" title="What the dashboard needs" hint="A handful of signals, mostly already in the stack. The only real unknown is where login/auth events live.">
            <div style={{ border: `1px solid ${V.greyXLight}`, borderRadius: 8, overflow: 'hidden', background: V.white, boxShadow: V.shadow2 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: V.font }}>
                <thead>
                  <tr style={{ background: V.greyBg }}>
                    {['Signal', 'Source', 'System', 'Readiness'].map((h) => (
                      <th key={h} style={{ textAlign: 'left', padding: '10px 16px', fontSize: 11, fontWeight: 600, color: V.greyDark, textTransform: 'uppercase', letterSpacing: '0.04em', borderBottom: `1px solid ${V.greyXLight}` }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['Logins / usage volume', 'Product database', 'App DB → data pipeline', 'available'],
                    ['Active users (unique)', 'App auth / event logs', 'App DB or analytics store', 'confirm'],
                    ['ARR & renewal date', 'CRM', 'CRM', 'pending'],
                    ['Segment membership', 'CRM', 'CRM', 'available'],
                    ['Active users vs. contracted seats', 'Product DB + contract', 'App DB + CRM', 'secondary'],
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

          {/* 2. live usage data */}
          <BPSection step="2" title="Closing the usage-data gap" hint="Same pattern as the live account roster: a scheduled export → CSV / data feed → dashboard. No new infrastructure, and it replaces today's sample/placeholder usage data with real numbers.">
            <div style={{ border: `1px solid ${V.greyXLight}`, borderRadius: 8, padding: '18px 20px', background: V.white, boxShadow: V.shadow2, marginBottom: 14 }}>
              <div style={{ fontSize: 13.5, color: V.greyDark, lineHeight: '20px', marginBottom: 14 }}>
                The account roster + health feed already update live this way — refresh the feed, the dashboard reflects it within minutes. <strong>Logins and active-user volume are still sample/placeholder</strong> for most accounts. The product-analytics team’s usage tracking (contracted vs. actual, by account) is already most of this signal — if it can export on the same feed pattern, we can plug it in directly.
              </div>
              <div style={{ display: 'flex', alignItems: 'stretch', gap: 6 }}>
                <StageCol label="Source (exists)">
                  <Node icon="trendingUp" title="Analytics dashboard" sub="usage vs. contract, by account" tone="purple" />
                </StageCol>
                <Arrow label="export" />
                <StageCol label="New: live feed">
                  <Node icon="layers" title="Usage feed / CSV" sub="Account, Month, Logins, Active users" tone="green" />
                  <Node icon="refresh" title="Scheduled publish" sub="same as roster feed" tone="green" />
                </StageCol>
                <Arrow label="fetch on load" />
                <StageCol label="This dashboard">
                  <Node icon="grid" title="Usage &amp; active-user trends" sub="flips Sample → Live" tone="blue" />
                  <Node icon="target" title="Trigger calculations" sub="real MoM / cumulative, not illustrative" tone="blue" />
                </StageCol>
              </div>
            </div>

            <div style={{ border: `1px solid ${V.greyXLight}`, borderRadius: 8, overflow: 'hidden', background: V.white, boxShadow: V.shadow2, marginBottom: 14 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: V.font }}>
                <thead>
                  <tr style={{ background: V.greyBg }}>
                    {['Column', 'Description', 'Example'].map((h) => (
                      <th key={h} style={{ textAlign: 'left', padding: '10px 16px', fontSize: 11, fontWeight: 600, color: V.greyDark, textTransform: 'uppercase', letterSpacing: '0.04em', borderBottom: `1px solid ${V.greyXLight}` }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['Account', 'Same account name/ID used in the roster feed, so rows join cleanly.', 'Northgate Systems'],
                    ['Month', 'Calendar month the row covers.', '2026-05'],
                    ['Logins', 'Total logins / sessions for the month.', '4,210'],
                    ['Active users', 'Unique active users for the month — the fallback signal for early-contract accounts.', '18'],
                    ['(optional) Contract seats', 'Contracted seat count, if available — lets the dashboard show utilization %, not just MoM trend.', '25'],
                  ].map((r, i, arr) => (
                    <tr key={r[0]}>
                      <td style={tdBP(i === arr.length - 1)}><span style={{ color: V.black, fontWeight: 600 }}>{r[0]}</span></td>
                      <td style={tdBP(i === arr.length - 1)}>{r[1]}</td>
                      <td style={tdBP(i === arr.length - 1)}><span style={{ fontFamily: V.mono, fontSize: 12.5, color: V.greyDark }}>{r[2]}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: '12px 14px', background: V.greenLight, borderRadius: 6, marginBottom: 10 }}>
              <Icon name="check2" size={16} color={V.greenDeep} strokeWidth={2} style={{ marginTop: 1, flexShrink: 0 }} />
              <span style={{ fontSize: 13, lineHeight: '19px', color: '#3E5A39' }}>
                <strong>One row per account per month</strong>, long format — easiest for the dashboard to read and for the feed to stay accurate as months roll forward. If the export is wide (a column per month), a quick pivot step can reshape it before publishing.
              </span>
            </div>
            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: '12px 14px', background: V.greyBg, borderRadius: 6 }}>
              <Icon name="fileText" size={16} color={V.greyDark} strokeWidth={2} style={{ marginTop: 1, flexShrink: 0 }} />
              <span style={{ fontSize: 13, lineHeight: '19px', color: V.greyDark }}>
                <strong>Manual fallback stays available</strong> — until the live feed exists (or for any month it’s missing), the same cells can be hand-updated directly. The dashboard doesn’t need to know the difference; it just reads whatever’s published.
              </span>
            </div>
          </BPSection>

          {/* 3. architecture */}
          <BPSection step="3" title="Recommended architecture" hint="Reuse the existing data-sync pattern that already pushes data into the CRM. Nothing new to buy.">
            <div style={{ border: `1px solid ${V.greyXLight}`, borderRadius: 8, padding: '22px 20px', background: V.white, boxShadow: V.shadow2 }}>
              <div style={{ display: 'flex', alignItems: 'stretch', gap: 6 }}>
                <StageCol label="Sources">
                  <Node icon="database" title="Product database" sub="logins · active users" />
                  <Node icon="briefcase" title="CRM" sub="ARR · renewal · segment" />
                </StageCol>
                <Arrow label="read-only" />
                <StageCol label="Pipeline (reuse)">
                  <Node icon="refresh" title="Nightly rollup" sub="scheduled job" tone="green" />
                  <Node icon="layers" title="health_metrics" sub="account · month · deltas · flags" tone="green" />
                </StageCol>
                <Arrow label="event" />
                <StageCol label="Detection">
                  <Node icon="zap" title="Threshold check" sub="±30% MoM + cumulative" />
                  <Node icon="server" title="Queue → delivery" sub="reused sync path" />
                </StageCol>
                <Arrow label="fan-out" />
                <StageCol label="Surfaces">
                  <Node icon="briefcase" title="CRM task" sub="auto-assigned · system of record" tone="purple" />
                  <Node icon="slack" title="Chat / Email" sub="alert the assigned CSM" tone="blue" />
                  <Node icon="grid" title="This dashboard" sub="internal tool" tone="blue" />
                </StageCol>
              </div>
              <div style={{ marginTop: 18, display: 'flex', gap: 10, alignItems: 'flex-start', padding: '12px 14px', background: V.greenLight, borderRadius: 6 }}>
                <Icon name="check2" size={16} color={V.greenDeep} strokeWidth={2} style={{ marginTop: 1, flexShrink: 0 }} />
                <span style={{ fontSize: 13, lineHeight: '19px', color: '#3E5A39' }}>
                  The <strong>existing data-sync job</strong> already runs a queue → CRM path in production. We add one rollup and one threshold check — no new infrastructure, no new vendor. The <strong>queue fans out</strong>: the same alert creates a CRM task and posts to chat and email, so adding channels is config, not a rebuild.
                </span>
              </div>
            </div>
          </BPSection>

          {/* 4. options */}
          <BPSection step="4" title="Three ways to build it" hint="Same guiding principle throughout: reuse before we buy, buy before we build.">
            <div style={{ display: 'flex', gap: 14 }}>
              <OptionCard n="1" title="LLM as the intelligence layer" body="An LLM API reads health data, drafts personalized outreach, and writes tasks + context to the CRM." note="Most aligned with an AI-forward roadmap. Needs a data-privacy review." badge={{ tone: 'purple', label: 'Phase 2' }} icon="zap" />
              <OptionCard n="2" title="Scheduled job + queue + CRM" body="Scheduled threshold checks against the product DB; a queue fans out alerts; a delivery step creates CSM tasks. Reuses the existing sync path." note="Lowest lift and most likely to hit the target date." badge={{ tone: 'green', label: 'Recommended' }} icon="server" recommended />
              <OptionCard n="3" title="CRM-native automation" body="The CRM’s own workflow builder monitors metrics already synced to it and creates CSM tasks." note="Fastest if data is already in the CRM — but cumulative-decline math is hard to express there." badge={{ tone: 'grey', label: 'Fallback' }} icon="briefcase" />
            </div>
          </BPSection>

          {/* 5 + 6 side by side */}
          <div style={{ display: 'flex', gap: 22, flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 320 }}>
              <BPSection step="5" title="Data &amp; privacy guardrails">
                <div style={{ border: `1px solid ${V.greyXLight}`, borderRadius: 8, padding: 18, background: V.white, boxShadow: V.shadow2 }}>
                  {[
                    ['Commercial account data only', 'Alerts carry account name, ARR, usage counts & deltas, renewal — no sensitive record-level or end-user data.'],
                    ['Sensitive detail stays behind auth', 'Record-level detail lives in the CRM / the app; the CSM clicks through to reach it.'],
                    ['Approved channels only', 'Chat to the corporate workspace, email via the approved sender — security controls inherited, nothing fanned out ungoverned.'],
                    ['Read-only on the product DB', 'The pipeline never writes back to the product database.'],
                    ['CRM field-level security', 'Tasks respect existing CRM permissions.'],
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
              <BPSection step="6" title="Open questions for data + eng">
                <div style={{ border: `1px solid ${V.greyXLight}`, borderRadius: 8, padding: 18, background: V.white, boxShadow: V.shadow2 }}>
                  {[
                    'Can the analytics tool export Account/Month/Logins/Active-users on the same feed pattern as the roster?',
                    'Where do login / auth events live — the product DB, or a separate analytics store?',
                    'Can we add a rollup asset to the existing pipeline, or extend one?',
                    'Confirm reuse of the existing queue → CRM path, and add chat + email as fan-out targets.',
                    'Which CRM object / field for CSM tasks, and assignment rules for uncovered accounts?',
                    'Lock final thresholds after baseline (30% MoM + a cumulative-decline trigger).',
                    'Does any other team’s expansion-signal project overlap — can we share the pipeline?',
                  ].map((q, i) => (
                    <div key={i} style={{ display: 'flex', gap: 11, alignItems: 'flex-start', padding: '9px 0', borderBottom: i === 6 ? 'none' : `1px solid ${V.greyXLight}` }}>
                      <span style={{ width: 16, height: 16, borderRadius: 4, border: `1.5px solid ${V.greyLight}`, flexShrink: 0, marginTop: 1 }} />
                      <span style={{ fontSize: 13, color: V.greyDark, lineHeight: '18px' }}>{q}</span>
                    </div>
                  ))}
                </div>
              </BPSection>
            </div>
          </div>

          {/* 7. alert delivery */}
          <BPSection step="7" title="Alert delivery — what each channel needs">
            <div style={{ fontSize: 13, color: V.greyDark, lineHeight: '19px', marginBottom: 14, maxWidth: 720 }}>
              When an account crosses a trigger, the delivery step fans the alert out to any enabled channel. Each carries <strong>commercial account data only</strong> (name, ARR, deltas, renewal) — no sensitive record-level data. Here's what to stand each one up:
            </div>
            <div style={{ border: `1px solid ${V.greyXLight}`, borderRadius: 8, overflow: 'hidden', background: V.white, boxShadow: V.shadow2 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: V.font }}>
                <thead>
                  <tr style={{ background: V.greyBg }}>
                    {['Channel', 'What it needs', 'Setup', 'Lift'].map((h) => (
                      <th key={h} style={{ textAlign: 'left', padding: '10px 16px', fontSize: 11, fontWeight: 600, color: V.greyDark, textTransform: 'uppercase', letterSpacing: '0.04em', borderBottom: `1px solid ${V.greyXLight}` }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['Chat', 'A chat app with an Incoming Webhook URL (or a bot token). Store the secret in a secrets manager.', 'Create the app → enable the webhook → pick the alerts channel → POST JSON from the relay.', 'Low'],
                    ['Email', 'A managed email sender (already in the stack) — a verified sender domain + send permission on the delivery step.', 'Verify the from-domain, move out of sandbox, send from the delivery step.', 'Low'],
                    ['CRM task', 'CRM REST API + a connected app / OAuth (the existing sync job already has this path).', 'Reuse the existing integration user → create a task on the account, assigned to the CSM.', 'Reuse'],
                  ].map((r, i, arr) => (
                    <tr key={r[0]}>
                      <td style={tdBP(i === arr.length - 1)}><span style={{ color: V.black, fontWeight: 600 }}>{r[0]}</span></td>
                      <td style={tdBP(i === arr.length - 1)}>{r[1]}</td>
                      <td style={tdBP(i === arr.length - 1)}>{r[2]}</td>
                      <td style={tdBP(i === arr.length - 1)}><Chip tone={r[3] === 'Low' ? 'green' : r[3] === 'Reuse' ? 'blue' : 'grey'}>{r[3]}</Chip></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{ marginTop: 14, display: 'flex', gap: 10, alignItems: 'flex-start', padding: '12px 14px', background: V.greenLight, borderRadius: 6 }}>
              <Icon name="check2" size={16} color={V.greenDeep} strokeWidth={2} style={{ marginTop: 1, flexShrink: 0 }} />
              <span style={{ fontSize: 13, lineHeight: '19px', color: '#3E5A39' }}>
                No new vendor required — chat webhooks are free, managed email is already in the stack, and the CRM path is already running in the sync job. The work is wiring + storing 2–3 secrets, not new infrastructure.
              </span>
            </div>
          </BPSection>

          {/* 8. dependencies on other teams */}
          <BPSection step="8" title="What we need from other teams" hint="Everything in this build can be demoed and tested without these — but going live for real users depends on them.">
            <div style={{ border: `1px solid ${V.greyXLight}`, borderRadius: 8, overflow: 'hidden', background: V.white, boxShadow: V.shadow2 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: V.font }}>
                <thead>
                  <tr style={{ background: V.greyBg }}>
                    {['Need', 'From', 'Why it matters', 'Status'].map((h) => (
                      <th key={h} style={{ textAlign: 'left', padding: '10px 16px', fontSize: 11, fontWeight: 600, color: V.greyDark, textTransform: 'uppercase', letterSpacing: '0.04em', borderBottom: `1px solid ${V.greyXLight}` }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['Live usage feed (Account, Month, Logins, Active users)', 'Data / analytics team', 'Replaces sample usage data — makes both core triggers (Product Usage Stall, Low Usage Across Contract) real instead of illustrative.', 'pending'],
                    ['Per-account CRM links (real record IDs)', 'CRM admin', 'Powers the "Open in CRM" link on each account, which needs the real CRM record ID per account.', 'pending'],
                    ['Confirm the final dashboard URL', 'Whoever hosts the final site', 'Alert pings include a deep link (?account=<id>) to the account’s detail view — the URL just needs updating to wherever this ends up hosted long-term.', 'confirm'],
                    ['Live, complete account roster', 'CRM / CS Ops', 'The roster feed works for the accounts already in it — confirm it covers the full book and stays current as accounts are added/removed.', 'confirm'],
                    ['SSO login', 'IT / Security', 'The login page is currently a demo form — needs real SSO before this can hold real customer/account data for general use.', 'pending'],
                    ['The team’s chat webhook (real workspace)', 'Chat admin', 'Pings were tested and work. Needs an Incoming Webhook on the real workspace, and a decision on channel(s) — one shared channel vs. splitting CSM-alerts from a leadership digest.', 'pending'],
                    ['Notes-tool integration for the Customer Log', 'IT / notes-tool admin', 'The Customer Log tab currently runs on mock/seeded entries per account. In production it syncs from the notes tool / AI notetaker — needs an API connection and a mapping from notes to accounts.', 'pending'],
                  ].map((r, i, arr) => (
                    <tr key={r[0]}>
                      <td style={tdBP(i === arr.length - 1)}><span style={{ color: V.black, fontWeight: 600 }}>{r[0]}</span></td>
                      <td style={tdBP(i === arr.length - 1)}>{r[1]}</td>
                      <td style={tdBP(i === arr.length - 1)}><span style={{ fontSize: 12.5, lineHeight: '17px' }}>{r[2]}</span></td>
                      <td style={tdBP(i === arr.length - 1)}><ReadinessChip level={r[3]} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{ marginTop: 14, display: 'flex', gap: 10, alignItems: 'flex-start', padding: '12px 14px', background: V.greyBg, borderRadius: 6 }}>
              <Icon name="fileText" size={16} color={V.greyDark} strokeWidth={2} style={{ marginTop: 1, flexShrink: 0 }} />
              <span style={{ fontSize: 13, lineHeight: '19px', color: V.greyDark }}>
                None of these block continued demo/iteration — the dashboard, Leadership views, and alert pings were all tested and work on sample data. They're the swap-outs needed to move from <strong>"working POC"</strong> to <strong>"live for the team."</strong>
              </span>
            </div>
          </BPSection>

          <BPSection step="9" title="Path to go-live" hint="Editable — click any milestone to edit, use the × to remove, or add a new one. Saved automatically.">
            <PathToJuly3 />
          </BPSection>

        </div>
      </div>
    </main>
  );
}

// ───────────────────────────────────────────────────────────────────────────
// Path to go-live — editable milestone timeline. Stored in cc_buildplan_milestones
// (synced via the shared layer like other state) so edits persist and are
// visible to anyone else looking at the Build Plan.
// ───────────────────────────────────────────────────────────────────────────
const DEFAULT_MILESTONES = [
  { id: 'm1', when: 'Week 1', text: 'Confirm data sources + CRM access. Lock thresholds with the CS lead.' },
  { id: 'm2', when: 'Week 2', text: 'Build the nightly rollup + threshold check. Reuse the queue path.' },
  { id: 'm3', when: 'Week 3', text: 'Wire queue → CRM tasks + chat/email alerts. Dashboard reads health_metrics. Pilot 5 accounts.' },
  { id: 'm4', when: 'Week 4', text: 'POC live for the pilot segment.' },
];

function bpGet(k, d) { try { var v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; } catch (e) { return d; } }
function bpSet(k, v) { try { (window.Sync ? window.Sync.set : (k2, v2) => localStorage.setItem(k2, JSON.stringify(v2)))(k, v); } catch (e) {} }
function bpUid() { return 'm' + Math.random().toString(36).slice(2, 9); }

function PathToJuly3() {
  const [milestones, setMilestones] = React.useState(() => bpGet('cc_buildplan_milestones', DEFAULT_MILESTONES));
  const [editing, setEditing] = React.useState(null); // id of milestone being edited

  const save = (next) => { setMilestones(next); bpSet('cc_buildplan_milestones', next); };
  const update = (id, field, value) => save(milestones.map((m) => m.id === id ? { ...m, [field]: value } : m));
  const remove = (id) => save(milestones.filter((m) => m.id !== id));
  const add = () => {
    const next = [...milestones, { id: bpUid(), when: 'New date', text: 'New milestone — click to edit.' }];
    save(next);
    setEditing(next[next.length - 1].id);
  };

  return (
    <div>
      <div style={{ display: 'flex', gap: 0, alignItems: 'stretch', flexWrap: 'wrap' }}>
        {milestones.map((m, i) => {
          const isLast = i === milestones.length - 1;
          const isEditing = editing === m.id;
          return (
            <div key={m.id} style={{ flex: '1 1 180px', minWidth: 180, position: 'relative', paddingRight: isLast ? 0 : 14, marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <span style={{ width: 11, height: 11, borderRadius: '50%', background: isLast ? V.green : V.black, flexShrink: 0, zIndex: 1 }} />
                {!isLast && <span style={{ flex: 1, height: 2, background: V.greyLight }} />}
                <button onClick={() => remove(m.id)} title="Remove milestone" style={{ marginLeft: 'auto', background: 'transparent', border: 0, cursor: 'pointer', padding: 2, display: 'inline-flex', flexShrink: 0 }}>
                  <Icon name="close" size={13} color={V.greyMed} />
                </button>
              </div>
              {isEditing ? (
                <input value={m.when} onChange={(e) => update(m.id, 'when', e.target.value)} onBlur={() => setEditing(null)} autoFocus
                  style={{ fontSize: 13, fontWeight: 700, color: isLast ? V.greenDeep : V.black, marginBottom: 5, border: `1px solid ${V.greyLight}`, borderRadius: 4, padding: '2px 6px', fontFamily: V.font, width: '100%', boxSizing: 'border-box' }} />
              ) : (
                <div onClick={() => setEditing(m.id)} title="Click to edit" style={{ fontSize: 13, fontWeight: 700, color: isLast ? V.greenDeep : V.black, marginBottom: 5, cursor: 'text', padding: '2px 6px', borderRadius: 4 }}>{m.when}</div>
              )}
              <textarea value={m.text} onChange={(e) => update(m.id, 'text', e.target.value)}
                style={{ fontSize: 12.5, color: V.greyMed, lineHeight: '18px', border: '1px solid transparent', borderRadius: 4, padding: '2px 6px', paddingRight: 12, fontFamily: V.font, width: '100%', boxSizing: 'border-box', resize: 'vertical', minHeight: 54, background: 'transparent' }}
                onFocus={(e) => { e.target.style.border = `1px solid ${V.greyLight}`; e.target.style.background = V.white; }}
                onBlur={(e) => { e.target.style.border = '1px solid transparent'; e.target.style.background = 'transparent'; }} />
            </div>
          );
        })}
      </div>
      <Button kind="secondary" size="sm" icon="plus" onClick={add}>Add milestone</Button>
    </div>
  );
}

function tdBP(last) {
  return { padding: '12px 16px', fontSize: 13.5, color: V.greyDark, borderBottom: last ? 'none' : `1px solid ${V.greyXLight}`, verticalAlign: 'middle' };
}

function OptionCard({ n, title, body, note, badge, icon, recommended }) {
  return (
    <div style={{
      flex: 1, minWidth: 0, background: V.white, borderRadius: 8, padding: 18,
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
