// Customer Health — Playbooks library tab
// Loaded as <script type="text/babel" src="lib/playbooks.jsx">

const KIND_TONE = {
  'Early warning': 'orange', 'Urgent': 'red', 'Positive': 'purple', 'Expansion': 'purple',
  'Education': 'blue', 'Check-in': 'grey', 'Re-engagement': 'blue', 'Risk': 'orange'
};
const TAG_META = {
  confirmed: { tone: 'green', label: 'Confirmed' },
  proposed: { tone: 'grey', label: 'Proposed' },
  backpocket: { tone: 'blue', label: 'Back pocket' }
};

function PBSectionLabel({ icon, children, badge }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, marginTop: 4 }}>
      {icon && <Icon name={icon} size={15} color={V.greyDark} strokeWidth={2} />}
      <span style={{ fontSize: 13, fontWeight: 700, color: V.black, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{children}</span>
      {badge}
    </div>);

}

function PlaybookNavRow({ pb, active, onClick }) {
  const [hover, setHover] = React.useState(false);
  return (
    <div onClick={onClick} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
    style={{
      display: 'flex', alignItems: 'center', gap: 10, padding: '9px 16px 9px 20px', cursor: 'pointer',
      background: active ? V.greyXLight : hover ? V.greyBg : 'transparent',
      borderLeft: active ? `3px solid ${V.green}` : '3px solid transparent'
    }}>
      <span style={{ flexShrink: 0, fontSize: 11, fontWeight: 700, color: active ? V.black : V.greyMed, fontFamily: V.mono, width: 22 }}>{pb.code}</span>
      <span style={{ flex: 1, minWidth: 0, fontSize: 13, fontWeight: active ? 600 : 500, color: active ? V.black : V.greyDark, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{pb.title}</span>
      <Chip tone={KIND_TONE[pb.kind] || 'grey'}>{pb.kind}</Chip>
    </div>);

}

function EmailCard({ e }) {
  return (
    <div style={{ border: `1px solid ${V.greyXLight}`, borderRadius: 6, overflow: 'hidden' }}>
      <div style={{ padding: '9px 13px', background: V.greyBg, borderBottom: `1px solid ${V.greyXLight}`, display: 'flex', alignItems: 'center', gap: 8 }}>
        <Icon name="mail" size={13} color={V.greyDark} />
        <span style={{ fontSize: 12, fontWeight: 600, color: V.black }}>{e.tag}</span>
      </div>
      <div style={{ padding: '10px 13px', borderBottom: `1px solid ${V.greyXLight}`, fontSize: 13 }}>
        <span style={{ color: V.greyMed }}>Subject:&nbsp;</span><span style={{ color: V.black, fontWeight: 600 }}>{e.subject}</span>
      </div>
      <div style={{ padding: 13, fontSize: 13, lineHeight: '20px', color: V.greyDark, whiteSpace: 'pre-wrap' }}>{e.body}</div>
    </div>);

}

function PlaybookDetail({ pb, trigger }) {
  return (
    <div style={{ maxWidth: 760 }}>
      {/* header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: '#fff', background: V.greenDeep, padding: '3px 9px', borderRadius: 4, letterSpacing: '0.02em' }}>Playbook {pb.code}</span>
        <Chip tone={KIND_TONE[pb.kind] || 'grey'}>{pb.kind}</Chip>
        <span style={{ fontSize: 12, color: V.greyMed }}>Trigger {trigger.num} · {trigger.name}</span>
      </div>
      <h2 style={{ fontSize: 24, fontWeight: 700, color: V.black, margin: '0 0 12px', letterSpacing: '-0.01em' }}>{pb.title}</h2>
      <p style={{ fontSize: 14, lineHeight: '22px', color: V.greyDark, margin: '0 0 20px', textWrap: 'pretty' }}>{pb.whatItIs}</p>

      {/* meta chips */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
        <Chip tone="grey" icon="briefcase">Owner · Assigned CSM</Chip>
        <Chip tone="grey" icon="database">{trigger.dataSource}</Chip>
      </div>

      {/* when to use + philosophy */}
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 24 }}>
        <div style={{ flex: 1, minWidth: 280 }}>
          <PBSectionLabel icon="target">When to use</PBSectionLabel>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {pb.whenToUse.map((w, i) =>
            <div key={i} style={{ display: 'flex', gap: 9, alignItems: 'flex-start' }}>
                <Icon name="check" size={15} color={V.greenDeep} strokeWidth={2.25} style={{ marginTop: 2, flexShrink: 0 }} />
                <span style={{ fontSize: 13.5, lineHeight: '19px', color: V.greyDark }}>{w}</span>
              </div>
            )}
          </div>
        </div>
        <div style={{ flex: 1, minWidth: 280 }}>
          <PBSectionLabel icon="heart">Philosophy</PBSectionLabel>
          <div style={{ background: V.greyBg, border: `1px solid ${V.greyXLight}`, borderRadius: 8, padding: '13px 15px', fontSize: 13, lineHeight: '20px', color: V.greyDark, fontStyle: 'italic', textWrap: 'pretty' }}>{pb.philosophy}</div>
        </div>
      </div>

      {/* SLA cadence */}
      <PBSectionLabel icon="clock">Response cadence &amp; SLA</PBSectionLabel>
      <div style={{ border: `1px solid ${V.greyXLight}`, borderRadius: 8, overflow: 'hidden', marginBottom: 24, background: '#fff' }}>
        {pb.sla.map((s, i) =>
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 15px', borderBottom: i === pb.sla.length - 1 ? 'none' : `1px solid ${V.greyXLight}` }}>
            <span style={{ flexShrink: 0, width: 22, height: 22, borderRadius: '50%', background: V.black, color: '#fff', fontSize: 12, fontWeight: 700, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>{i + 1}</span>
            <span style={{ fontSize: 13.5, color: V.greyDark }}>{s}</span>
          </div>
        )}
      </div>

      {/* outreach */}
      <PBSectionLabel icon="mail" badge={!pb.emails ? <SampleBadge label="Templates in framework" /> : null}>Outreach templates</PBSectionLabel>
      {pb.emails ?
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
          {pb.emails.map((e, i) => <EmailCard key={i} e={e} />)}
          <div style={{ fontSize: 12, color: V.greyMed, display: 'flex', alignItems: 'center', gap: 7 }}>
            <Icon name="info" size={13} color={V.greyMed} /> Initial outreach shown. The framework also includes follow-up and post-call templates for each option.
          </div>
        </div> :

      <div style={{ border: `1px solid ${V.greyXLight}`, borderRadius: 8, padding: '14px 16px', marginBottom: 24, background: '#fff' }}>
          <div style={{ fontSize: 13.5, color: V.black, fontWeight: 600, marginBottom: 6 }}>{pb.response}</div>
          <div style={{ fontSize: 12.5, color: V.greyMed, lineHeight: '18px' }}>Full warm / direct / first-touch (uncovered) email templates are documented in the V1 framework. The three Usage Activity playbooks (1A / 1B / 1C) carry the complete verbatim copy.</div>
        </div>
      }

      {/* call guidance */}
      <PBSectionLabel icon="phone">Call guidance</PBSectionLabel>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
        {pb.callPoints.map((p, i) =>
        <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: '10px 13px', background: V.greyBg, border: `1px solid ${V.greyXLight}`, borderRadius: 6 }}>
            <span style={{ flexShrink: 0, fontSize: 12, fontWeight: 700, color: V.greyMed, fontFamily: V.mono, marginTop: 1 }}>{i + 1}</span>
            <span style={{ fontSize: 13.5, lineHeight: '19px', color: V.greyDark, textWrap: 'pretty' }}>{p}</span>
          </div>
        )}
      </div>

      {/* escalation */}
      <PBSectionLabel icon="arrowUpRight">Escalation</PBSectionLabel>
      <div style={{ display: 'flex', gap: 11, alignItems: 'flex-start', padding: '13px 15px', background: V.redLight, borderRadius: 8, marginBottom: 8 }}>
        <Icon name="alert" size={16} color={V.red} strokeWidth={2} style={{ marginTop: 1, flexShrink: 0 }} />
        <span style={{ fontSize: 13, lineHeight: '19px', color: '#9B2C2C', textWrap: 'pretty' }}>{pb.escalation}</span>
      </div>
    </div>);

}

function Playbooks() {
  const { triggers, playbooks } = window.PLAYBOOKS_DATA;
  const [sel, setSel] = React.useState('1A');
  const mobile = useMobile();
  const pb = playbooks[sel];
  const trigger = triggers.find((t) => t.num === pb.trigger);
  const totalPb = Object.keys(playbooks).length;

  return (
    <main style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'transparent', overflow: 'hidden', minWidth: 0 }}>
      <header style={{ padding: '18px 32px 16px', background: '#fff', borderBottom: `1px solid ${V.greyXLight}`, flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, fontSize: 12, color: V.greyMed }}>
          <span>Customer Success</span><Icon name="chevronRight" size={12} color={V.greyLight} /><span style={{ color: V.greyDark }}>Playbooks</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
          <div style={{ fontFamily: "system-ui" }}>
            <h2 style={{ fontSize: 26, fontWeight: 700, color: V.black, margin: 0, letterSpacing: '-0.02em' }}>Playbooks</h2>
            <div style={{ fontSize: 13.5, color: V.greyDark, marginTop: 7 }}>The trigger &amp; response library — what to do, and what to say, when a signal fires.</div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <Chip tone="grey" icon="target">{triggers.length} triggers</Chip>
            <Chip tone="grey" icon="fileText">{totalPb} playbooks</Chip>
          </div>
        </div>
      </header>

      <div style={{ flex: 1, display: 'flex', flexDirection: mobile ? 'column' : 'row', overflow: mobile ? 'auto' : 'hidden', minHeight: 0 }}>
        {/* nav rail */}
        <nav style={{ width: mobile ? '100%' : 320, flexShrink: 0, background: '#fff', borderRight: mobile ? 'none' : `1px solid ${V.greyXLight}`, borderBottom: mobile ? `1px solid ${V.greyXLight}` : 'none', overflow: mobile ? 'visible' : 'auto', maxHeight: mobile ? 240 : 'none', overflowY: mobile ? 'auto' : 'auto' }}>
          {triggers.map((t) =>
          <div key={t.num}>
              <div style={{ padding: '14px 16px 8px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: V.greyDark, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Trigger {t.num} · {t.name}</span>
                <Chip tone={TAG_META[t.tag].tone}>{TAG_META[t.tag].label}</Chip>
              </div>
              {t.playbooks.map((code) =>
            <PlaybookNavRow key={code} pb={playbooks[code]} active={sel === code} onClick={() => setSel(code)} />
            )}
            </div>
          )}
        </nav>

        {/* detail */}
        <div style={{ flex: 1, overflow: 'auto', padding: mobile ? '20px 18px 40px' : '26px 32px 48px', minWidth: 0 }}>
          <PlaybookDetail pb={pb} trigger={trigger} />
        </div>
      </div>
    </main>);

}

Object.assign(window, { Playbooks });