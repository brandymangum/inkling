// Customer Health — Alert settings modal
// Loaded as <script type="text/babel" src="lib/alerts.jsx">

const ALERT_DEFAULTS = {
  channels: { slack: true, email: true, salesforce: true },
  statuses: { stall: true, risk: true, watch: true, upsell: false },
  cadence: 'smart', // instant | digest | smart
  routing: 'assigned', // assigned | channel
};

function loadAlertSettings() {
  try { return { ...ALERT_DEFAULTS, ...JSON.parse(localStorage.getItem('cc_alert_settings') || '{}') }; }
  catch (e) { return { ...ALERT_DEFAULTS }; }
}

function ASwitch({ on, onToggle }) {
  return (
    <button onClick={onToggle} type="button" style={{ border: 0, background: 'transparent', cursor: 'pointer', padding: 0, flexShrink: 0 }}>
      <span style={{ display: 'block', width: 40, height: 22, borderRadius: 64, background: on ? V.greenDeep : V.greyLight, position: 'relative', transition: 'background 120ms ease' }}>
        <span style={{ position: 'absolute', top: 2, left: on ? 20 : 2, width: 18, height: 18, borderRadius: '50%', background: '#fff', transition: 'left 120ms ease', boxShadow: '0 1px 2px rgba(0,0,0,0.2)' }} />
      </span>
    </button>
  );
}

function ChannelRow({ icon, iconColor, title, detail, on, onToggle, last }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 13, padding: '14px 16px', borderBottom: last ? 'none' : `1px solid ${V.greyXLight}`, background: on ? '#fff' : V.greyBg }}>
      <span style={{ flexShrink: 0, width: 34, height: 34, borderRadius: 8, background: on ? V.greenLight : V.greyXLight, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon name={icon} size={17} color={on ? V.greenDeep : V.greyMed} strokeWidth={1.9} />
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: V.black }}>{title}</div>
        <div style={{ fontSize: 12, color: V.greyMed, marginTop: 2, lineHeight: '16px' }}>{detail}</div>
      </div>
      <ASwitch on={on} onToggle={onToggle} />
    </div>
  );
}

function StatusCheck({ status, label, on, onToggle }) {
  const meta = window.HEALTH.STATUS[status];
  return (
    <button onClick={onToggle} type="button" style={{
      display: 'inline-flex', alignItems: 'center', gap: 8, padding: '7px 12px', borderRadius: 64, cursor: 'pointer', fontFamily: V.font,
      border: `1px solid ${on ? meta.dot : V.greyLight}`, background: on ? meta.bg : '#fff', color: on ? meta.color : V.greyMed, fontSize: 12.5, fontWeight: 600,
    }}>
      <span style={{ width: 14, height: 14, borderRadius: 4, border: `1.5px solid ${on ? meta.color : V.greyLight}`, background: on ? meta.color : 'transparent', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
        {on && <Icon name="check" size={10} color="#fff" strokeWidth={3} />}
      </span>
      {label}
    </button>
  );
}

function CadenceOption({ value, cur, title, detail, onPick }) {
  const on = value === cur;
  return (
    <button onClick={() => onPick(value)} type="button" style={{
      display: 'flex', alignItems: 'flex-start', gap: 11, padding: '12px 14px', borderRadius: 8, cursor: 'pointer', textAlign: 'left', width: '100%', fontFamily: V.font,
      border: `1.5px solid ${on ? V.greenDeep : V.greyXLight}`, background: on ? V.greenLight : '#fff',
    }}>
      <span style={{ flexShrink: 0, marginTop: 1, width: 16, height: 16, borderRadius: '50%', border: `1.5px solid ${on ? V.greenDeep : V.greyLight}`, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
        {on && <span style={{ width: 8, height: 8, borderRadius: '50%', background: V.greenDeep }} />}
      </span>
      <div>
        <div style={{ fontSize: 13.5, fontWeight: 600, color: V.black }}>{title}</div>
        <div style={{ fontSize: 12, color: V.greyMed, marginTop: 2, lineHeight: '16px' }}>{detail}</div>
      </div>
    </button>
  );
}

// live Slack-style preview built from a real flagged account
function SlackPreview({ settings }) {
  const H = window.HEALTH;
  const flagged = H.customers.filter((c) => ['stall', 'risk', 'watch'].includes(c.status) && settings.statuses[c.status]);
  const c = flagged.sort((a, b) => H.STATUS[a.status].rank - H.STATUS[b.status].rank)[0] || H.customers.find((c) => c.status === 'risk');
  if (!c) return null;
  const meta = H.STATUS[c.status];
  const who = settings.routing === 'assigned' ? (c.csm === 'Unassigned' ? '@cs-lead' : '@' + c.csm.split(' ')[0].toLowerCase()) : '#cs-alerts';
  return (
    <div style={{ border: `1px solid ${V.greyXLight}`, borderRadius: 8, overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '8px 13px', background: V.greyBg, borderBottom: `1px solid ${V.greyXLight}` }}>
        <Icon name="slack" size={13} color={V.greyDark} />
        <span style={{ fontSize: 12, fontWeight: 600, color: V.greyDark }}>Slack · {who}</span>
        <span style={{ marginLeft: 'auto', fontSize: 11, color: V.greyMed }}>Preview</span>
      </div>
      <div style={{ padding: '13px', display: 'flex', gap: 11 }}>
        <span style={{ flexShrink: 0, width: 36, height: 36, borderRadius: 8, background: V.tealDeep, color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700 }}>V</span>
        <div style={{ minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 7 }}>
            <span style={{ fontSize: 13.5, fontWeight: 700, color: V.black }}>Customer Health</span>
            <span style={{ fontSize: 11, color: V.greyMed }}>APP · now</span>
          </div>
          <div style={{ fontSize: 13, color: V.black, marginTop: 3, lineHeight: '19px' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '1px 8px', borderRadius: 64, background: meta.bg, color: meta.color, fontSize: 11, fontWeight: 700, marginRight: 6 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: meta.dot }} />{meta.label}
            </span>
            <strong>{c.name}</strong> moved to {meta.label}.
          </div>
          <div style={{ fontSize: 12.5, color: V.greyDark, marginTop: 5, lineHeight: '18px' }}>{c.headline}</div>
          <div style={{ fontSize: 12, color: V.greyMed, marginTop: 6 }}>{H.fmtArr(c.arr)} ARR · renews {H.fmtRenewal(c.renewal)} · {who}</div>
          <div style={{ display: 'flex', gap: 8, marginTop: 9 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: V.blue }}>View in dashboard</span>
            <span style={{ fontSize: 12, fontWeight: 600, color: V.blue }}>Open in Salesforce</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function SectionLabel({ children, note }) {
  return (
    <div style={{ margin: '22px 0 12px' }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: V.black, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{children}</div>
      {note && <div style={{ fontSize: 12, color: V.greyMed, marginTop: 4 }}>{note}</div>}
    </div>
  );
}

function AlertSettings({ onClose }) {
  const H = window.HEALTH;
  const [s, setS] = React.useState(loadAlertSettings);
  const [saved, setSaved] = React.useState(false);
  const set = (patch) => { setS((prev) => ({ ...prev, ...patch })); setSaved(false); };
  const toggleCh = (k) => set({ channels: { ...s.channels, [k]: !s.channels[k] } });
  const toggleSt = (k) => set({ statuses: { ...s.statuses, [k]: !s.statuses[k] } });
  const save = () => { try { localStorage.setItem('cc_alert_settings', JSON.stringify(s)); } catch (e) {} setSaved(true); setTimeout(onClose, 550); };

  const activeChannels = Object.entries(s.channels).filter(([, v]) => v).map(([k]) => k);

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(29,29,33,0.34)' }} />
      <div style={{ position: 'relative', width: 600, maxWidth: '100%', maxHeight: '90vh', background: '#fff', borderRadius: 12, boxShadow: V.shadow3, display: 'flex', flexDirection: 'column', fontFamily: V.font, overflow: 'hidden' }}>
        {/* header */}
        <div style={{ padding: '18px 22px', borderBottom: `1px solid ${V.greyXLight}`, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexShrink: 0 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
              <Icon name="bell" size={18} color={V.black} strokeWidth={1.9} />
              <h3 style={{ fontSize: 19, fontWeight: 700, color: V.black, margin: 0 }}>Alert settings</h3>
            </div>
            <div style={{ fontSize: 12.5, color: V.greyMed, marginTop: 5 }}>Notify the CSM when an account crosses into Needs Attention.</div>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 0, cursor: 'pointer', padding: 6 }}><Icon name="close" size={20} color={V.greyDark} /></button>
        </div>

        {/* body */}
        <div style={{ flex: 1, overflow: 'auto', padding: '6px 22px 22px' }}>
          <SectionLabel note="Same alert fans out to every channel you turn on.">Delivery channels</SectionLabel>
          <div style={{ border: `1px solid ${V.greyXLight}`, borderRadius: 8, overflow: 'hidden' }}>
            <ChannelRow icon="slack" title="Slack" detail={s.routing === 'assigned' ? "DM the assigned CSM, or #cs-alerts if unassigned" : "Post to #cs-alerts"} on={s.channels.slack} onToggle={() => toggleCh('slack')} />
            <ChannelRow icon="mail" title="Email" detail="Amazon SES — to the assigned CSM" on={s.channels.email} onToggle={() => toggleCh('email')} />
            <ChannelRow icon="briefcase" title="Salesforce task" detail="Auto-assigned task — the system of record" on={s.channels.salesforce} onToggle={() => toggleCh('salesforce')} last />
          </div>

          <SectionLabel>Notify on</SectionLabel>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <StatusCheck status="stall" label="Stalled" on={s.statuses.stall} onToggle={() => toggleSt('stall')} />
            <StatusCheck status="risk" label="At Risk" on={s.statuses.risk} onToggle={() => toggleSt('risk')} />
            <StatusCheck status="watch" label="Watch" on={s.statuses.watch} onToggle={() => toggleSt('watch')} />
            <StatusCheck status="upsell" label="Upsell" on={s.statuses.upsell} onToggle={() => toggleSt('upsell')} />
          </div>

          <SectionLabel>Cadence</SectionLabel>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <CadenceOption value="smart" cur={s.cadence} onPick={(v) => set({ cadence: v })} title="Smart (recommended)" detail="Instant for stalls; everything else in a once-daily digest. Calm, not noisy." />
            <CadenceOption value="instant" cur={s.cadence} onPick={(v) => set({ cadence: v })} title="Instant" detail="Fire the moment an account crosses a threshold." />
            <CadenceOption value="digest" cur={s.cadence} onPick={(v) => set({ cadence: v })} title="Daily digest" detail="One roundup each morning of everything that changed." />
          </div>

          <SectionLabel>Routing</SectionLabel>
          <div style={{ display: 'flex', gap: 8 }}>
            <CadenceOption value="assigned" cur={s.routing} onPick={(v) => set({ routing: v })} title="Assigned CSM" detail="Route to whoever owns the account." />
            <CadenceOption value="channel" cur={s.routing} onPick={(v) => set({ routing: v })} title="Shared channel" detail="Everything to one #cs-alerts channel." />
          </div>

          <SectionLabel note="Built live from your current flagged accounts.">Preview</SectionLabel>
          {s.channels.slack ? <SlackPreview settings={s} /> : <div style={{ fontSize: 12.5, color: V.greyMed, padding: '12px 14px', border: `1px dashed ${V.greyLight}`, borderRadius: 8 }}>Turn on Slack to preview the message.</div>}

          {/* compliance note */}
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: '12px 14px', background: V.greenLight, borderRadius: 8, marginTop: 18 }}>
            <Icon name="shield" size={16} color={V.greenDeep} strokeWidth={1.9} style={{ marginTop: 1, flexShrink: 0 }} />
            <span style={{ fontSize: 12.5, lineHeight: '18px', color: '#0B5E4C' }}>
              Alerts carry <strong>commercial account data only</strong> — account name, ARR, usage counts, renewal. No personal data (PII) ever leaves in a notification; the CSM clicks through to Salesforce, behind auth, for record-level detail.
            </span>
          </div>
        </div>

        {/* footer */}
        <div style={{ padding: '14px 22px', borderTop: `1px solid ${V.greyXLight}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexShrink: 0, background: '#fff' }}>
          <span style={{ fontSize: 12, color: V.greyMed }}>{activeChannels.length} channel{activeChannels.length === 1 ? '' : 's'} on · {s.cadence === 'smart' ? 'smart cadence' : s.cadence}</span>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <SampleBadge label="Not yet wired" />
            <Button kind="secondary" size="md" onClick={onClose}>Cancel</Button>
            <Button kind="primary" size="md" icon={saved ? 'check' : undefined} onClick={save}>{saved ? 'Saved' : 'Save settings'}</Button>
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { AlertSettings });
