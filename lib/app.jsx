// Customer Health — app shell + nav
// Loaded last, after all component scripts.

// ── Easter egg: tap the inkling logo 5× quickly for a little brand-color
// confetti burst + a quiet "you found it" toast. Discoverable, not in the way.
let _brandTaps = 0, _brandTapTimer = null;
function brandTap() {
  clearTimeout(_brandTapTimer);
  _brandTaps += 1;
  _brandTapTimer = setTimeout(() => { _brandTaps = 0; }, 1400);
  if (_brandTaps >= 5) { _brandTaps = 0; clearTimeout(_brandTapTimer); fireBrandConfetti(); }
}
function fireBrandConfetti() {
  if (document.getElementById('egg-kf') == null) {
    const st = document.createElement('style');
    st.id = 'egg-kf';
    st.textContent = '@keyframes eggFall{0%{transform:translateY(-12vh) rotate(0deg);opacity:1}100%{transform:translateY(108vh) rotate(540deg);opacity:.9}}@keyframes eggToast{0%{opacity:0;transform:translate(-50%,12px)}12%{opacity:1;transform:translate(-50%,0)}80%{opacity:1;transform:translate(-50%,0)}100%{opacity:0;transform:translate(-50%,-8px)}}';
    document.head.appendChild(st);
  }
  const colors = ['#35BC98', '#503BD4', '#0D54F5', '#F6EA2F', '#EB5757'];
  const layer = document.createElement('div');
  layer.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:9999;overflow:hidden';
  for (let i = 0; i < 60; i++) {
    const p = document.createElement('div');
    const sz = 6 + Math.random() * 8;
    const dur = 1.8 + Math.random() * 1.6;
    p.style.cssText = `position:absolute;top:0;left:${Math.random() * 100}%;width:${sz}px;height:${sz * (0.5 + Math.random())}px;background:${colors[i % colors.length]};border-radius:${Math.random() < 0.4 ? '50%' : '1px'};animation:eggFall ${dur}s cubic-bezier(.4,.05,.5,1) ${Math.random() * 0.5}s forwards`;
    layer.appendChild(p);
  }
  const toast = document.createElement('div');
  toast.textContent = 'You found it — made with care by the CS team.';
  toast.style.cssText = 'position:fixed;left:50%;bottom:40px;transform:translate(-50%,0);background:#1D1D21;color:#fff;font-family:inherit;font-size:13px;font-weight:600;padding:10px 18px;border-radius:64px;z-index:10000;box-shadow:0 8px 24px rgba(0,0,0,0.25);animation:eggToast 3.2s ease forwards;pointer-events:none';
  document.body.appendChild(layer);
  document.body.appendChild(toast);
  setTimeout(() => { layer.remove(); toast.remove(); }, 4200);
}

// ── Sign-out: a clean, professional "You've been signed out" screen. Calm fade
// in, brand mark, one-line confirmation, and a button back to the Login page.
function playSignOff() {
  if (document.getElementById('signoff-wrap')) return;
  if (!document.getElementById('signoff-kf')) {
    var st = document.createElement('style');
    st.id = 'signoff-kf';
    st.textContent = '@keyframes soFade{from{opacity:0}to{opacity:1}}@keyframes soRise{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}';
    document.head.appendChild(st);
  }
  var wrap = document.createElement('div');
  wrap.id = 'signoff-wrap';
  wrap.style.cssText = 'position:fixed;inset:0;z-index:100000;display:flex;align-items:center;justify-content:center;background:#F0EFEC;font-family:' + (typeof V !== 'undefined' ? V.font : '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif') + ';opacity:0;animation:soFade .35s ease forwards';

  var card = document.createElement('div');
  card.style.cssText = 'text-align:center;padding:0 28px;max-width:360px;animation:soRise .45s cubic-bezier(.2,.7,.3,1) .08s both';
  card.innerHTML =
    '<div style="display:inline-flex;align-items:center;justify-content:center;width:52px;height:52px;border-radius:50%;background:#5F7D5A;margin-bottom:22px">' +
      '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#F5F4F1" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>' +
    '</div>' +
    '<div style="font-size:21px;font-weight:700;color:#141414;letter-spacing:-0.01em">You’ve been signed out</div>' +
    '<div style="font-size:13.5px;color:#55534C;margin-top:8px;line-height:1.5">Your session has ended securely. Thanks for using inkling.</div>';

  var btn = document.createElement('button');
  btn.textContent = 'Sign back in';
  btn.style.cssText = 'margin-top:24px;height:40px;padding:0 22px;border:0;border-radius:8px;background:#141414;color:#F5F4F1;font-family:inherit;font-size:13.5px;font-weight:600;cursor:pointer;box-shadow:0 1px 2px 0 rgba(30,28,22,0.14)';
  btn.onmouseenter = function () { btn.style.background = '#2A2A2A'; };
  btn.onmouseleave = function () { btn.style.background = '#141414'; };
  btn.onclick = function () { window.location.href = 'Login.html'; };
  card.appendChild(btn);

  var foot = document.createElement('div');
  foot.style.cssText = 'position:fixed;bottom:26px;left:0;right:0;display:flex;align-items:center;justify-content:center;gap:7px;color:#141414';
  foot.innerHTML = '<svg width="22" height="20" viewBox="0 0 72 64" fill="none"><path d="M 8 40 C 14 24 20 24 24 34 C 27 41 31 41 34 32 C 37 24 43 24 46 32" stroke="#141414" stroke-width="4" stroke-linecap="round" fill="none"/><circle cx="58" cy="34" r="6" fill="#C75A2E"/></svg><span style="font-size:15px;font-weight:600;letter-spacing:-0.02em">inkling</span>';
  wrap.appendChild(card);
  wrap.appendChild(foot);
  document.body.appendChild(wrap);
}

function NavItem({ icon, label, active, muted, badge, onClick }) {
  const [hover, setHover] = React.useState(false);
  return (
    <div onClick={onClick} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{
        position: 'relative', display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', margin: '0 8px',
        borderRadius: 6, cursor: 'pointer',
        background: active ? V.greenLight : (hover ? V.greyBg : 'transparent'),
        color: active ? V.greenDeep : (muted ? V.greyMed : V.greyDark),
      }}>
      {active && <span style={{ position: 'absolute', left: -8, top: 7, bottom: 7, width: 3, borderRadius: 3, background: V.green }} />}
      <Icon name={icon} size={17} color={active ? V.greenDeep : (muted ? V.greyMed : V.greyDark)} strokeWidth={1.9} />
      <span style={{ fontSize: 13.5, fontWeight: active ? 600 : 500, flex: 1 }}>{label}</span>
      {badge !== undefined && (
        <span style={{ fontSize: 11, fontWeight: 700, color: V.red, background: V.redLight, borderRadius: 64, padding: '1px 7px' }}>{badge}</span>
      )}
    </div>
  );
}

function NavGroup({ label }) {
  return <div style={{ fontSize: 10.5, fontWeight: 700, color: V.greyMed, textTransform: 'uppercase', letterSpacing: '0.06em', padding: '0 20px', margin: '18px 0 8px' }}>{label}</div>;
}

function MenuRow({ icon, label, onClick, href, danger }) {
  const [h, setH] = React.useState(false);
  const inner = (
    <div onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)} onClick={onClick}
      style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 10px', borderRadius: 6, cursor: 'pointer', background: h ? V.greyBg : 'transparent', color: danger ? V.red : V.greyDark, fontSize: 13, fontWeight: 500 }}>
      <Icon name={icon} size={15} color={danger ? V.red : V.greyDark} strokeWidth={1.9} />
      <span style={{ flex: 1 }}>{label}</span>
      {href && <Icon name="externalLink" size={13} color={V.greyMed} />}
    </div>
  );
  return href ? <a href={href} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>{inner}</a> : inner;
}

function useRole() {
  const [role, setRoleState] = React.useState(() => { try { return localStorage.getItem('cc_role') || 'leadership'; } catch (e) { return 'leadership'; } });
  const setRole = React.useCallback((v) => { setRoleState(v); try { localStorage.setItem('cc_role', v); } catch (e) {} }, []);
  return [role, setRole];
}

function UserMenu({ role, setRole }) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef(null);
  React.useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h); return () => document.removeEventListener('mousedown', h);
  }, []);
  return (
    <div ref={ref} style={{ position: 'relative', borderBottom: `1px solid ${V.greyXLight}`, padding: '12px' }}>
      {open && (
        <div style={{ position: 'absolute', top: 'calc(100% - 4px)', left: 12, right: 12, background: V.white, border: `1px solid ${V.greyLight}`, borderRadius: 10, boxShadow: V.shadow3, padding: 7, zIndex: 40 }}>
          <div style={{ padding: '6px 10px 9px' }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: V.black }}>Riley</div>
            <div style={{ fontSize: 11.5, color: V.greyMed }}>riley@inkling.app · CS Leader</div>
          </div>
          <div style={{ height: 1, background: V.greyXLight, margin: '2px 0 6px' }} />
          <div style={{ padding: '2px 10px 7px', fontSize: 10.5, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: V.greyMed }}>Connected tools</div>
          <MenuRow icon="briefcase" label="Open CRM" href="#" />
          <MenuRow icon="trendingUp" label="Open Analytics" href="#" />
          <MenuRow icon="bell" label="Open Help desk" href="#" />
          <div style={{ height: 1, background: V.greyXLight, margin: '6px 0' }} />
          <div style={{ padding: '2px 10px 7px', fontSize: 10.5, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: V.greyMed }}>View as</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 5, padding: '0 6px 6px' }}>
            {[['leadership', 'CS Leader', 'grid'], ['csm', 'CSM', 'users']].map(([k, label, ic]) => (
              <button key={k} onClick={() => { setRole(k); setOpen(false); }} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '8px 4px', borderRadius: 7, cursor: 'pointer', fontFamily: V.font, fontSize: 12, fontWeight: 600, minWidth: 0,
                border: `1px solid ${role === k ? V.green : V.greyLight}`, background: role === k ? V.greenLight : V.white, color: role === k ? V.greenDeep : V.greyDark,
              }}>
                <Icon name={ic} size={14} color={role === k ? V.greenDeep : V.greyDark} strokeWidth={1.9} />
                {label}
              </button>
            ))}
          </div>
          <div style={{ padding: '0 10px 7px', fontSize: 10.5, lineHeight: 1.5, color: V.greyMed }}>{role === 'csm' ? 'CSM view: your own book, no leadership rollups.' : 'CS Leader: everything, including the Leadership rollup.'}</div>
          <div style={{ height: 1, background: V.greyXLight, margin: '2px 0 6px' }} />
          <MenuRow icon="logout" label="Sign out" danger onClick={() => { setOpen(false); playSignOff(); }} />
        </div>
      )}
      <div onClick={() => setOpen((o) => !o)} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
        <span style={{ width: 32, height: 32, borderRadius: '50%', background: V.purpleLight, color: V.purpleDark, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700 }}>R</span>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: V.black }}>Riley</div>
          <div style={{ fontSize: 11.5, color: V.greyMed }}>{role === 'csm' ? 'CSM view' : 'CS Leader'}</div>
        </div>
        <Icon name={open ? 'chevronUp' : 'chevronDown'} size={15} color={V.greyMed} />
      </div>
    </div>
  );
}

function AppSidebar({ view, setView, flaggedCount, dataSource, role, setRole }) {
  const isFiles = /file/i.test(dataSource || '');
  return (
    <aside style={{ width: 248, flexShrink: 0, background: V.white, borderRight: `1px solid ${V.greyXLight}`, display: 'flex', flexDirection: 'column', fontFamily: V.font }}>
      <div onClick={() => { if (window.openSnakeGame) window.openSnakeGame(); }} title="" style={{ padding: '18px 20px 14px', display: 'flex', alignItems: 'center', gap: 9, cursor: 'pointer', userSelect: 'none' }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}><InklingMark size={22} /><span style={{ fontFamily: V.font, fontWeight: 600, fontSize: 20, color: '#141414', letterSpacing: '-0.02em' }}>inkling</span></span>
      </div>
      <UserMenu role={role} setRole={setRole} />

      <NavGroup label="Customer Success" />
      <NavItem icon="activity" label="Customer Health" active={view === 'dashboard'} badge={flaggedCount} onClick={() => setView('dashboard')} />
      <NavItem icon="users" label="Accounts" active={view === 'accounts'} onClick={() => setView('accounts')} />
      <NavItem icon="check2" label="Notes & Tasks" active={view === 'notes'} onClick={() => setView('notes')} />
      <NavItem icon="fileText" label="Playbooks" active={view === 'playbooks'} onClick={() => setView('playbooks')} />

      {role !== 'csm' && (
        <React.Fragment>
          <NavGroup label="Leadership" />
          <NavItem icon="grid" label="Overview" active={view.startsWith('leadership')} onClick={() => setView('leadership')} />
        </React.Fragment>
      )}

      <NavGroup label="Digital CS POC" />
      <NavItem icon="layers" label="Build Plan" active={view === 'buildplan'} onClick={() => setView('buildplan')} />
      <NavItem icon="target" label="Triggers & Thresholds" active={view === 'triggers'} onClick={() => setView('triggers')} />

      <div style={{ flex: 1 }} />
      <div title={`Data source: ${dataSource || 'embedded'}`} style={{ margin: '0 12px 4px', padding: '8px 10px', borderRadius: 6, background: V.greyBg, display: 'flex', alignItems: 'center', gap: 8 }}>
        <Icon name="database" size={13} color={isFiles ? V.greenDeep : V.greyMed} strokeWidth={1.9} />
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: V.black }}>{isFiles ? 'Flat files' : 'Embedded data'}</div>
          <div style={{ fontSize: 10, color: V.greyMed, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{isFiles ? 'data/*.csv · swap to go live' : 'offline fallback'}</div>
        </div>
      </div>
      <div style={{ margin: '4px 12px 14px', padding: '11px 10px 0', borderTop: `1px solid ${V.greyXLight}`, fontSize: 10, lineHeight: 1.6, color: V.greyMed }}>
        Concept, design &amp; solution architecture by <span style={{ color: V.greyDark, fontWeight: 600 }}>Brandy Mangum</span><br />Built with the help of AI tooling.
      </div>
    </aside>
  );
}

function useIsMobile() {
  const [m, setM] = React.useState(() => (typeof window !== 'undefined' ? window.innerWidth <= 900 : false));
  React.useEffect(() => {
    const on = () => setM(window.innerWidth <= 900);
    window.addEventListener('resize', on); on();
    return () => window.removeEventListener('resize', on);
  }, []);
  return m;
}

function MobileNav({ view, setView, flaggedCount, role, setRole }) {
  const items = [
    ['dashboard', 'Health', 'activity', flaggedCount],
    ['accounts', 'Accounts', 'users'],
    ['notes', 'Notes', 'check2'],
    ['playbooks', 'Playbooks', 'fileText'],
    ...(role !== 'csm' ? [['leadership', 'Leadership', 'grid']] : []),
    ['buildplan', 'Build', 'layers'],
    ['triggers', 'Triggers', 'target'],
  ];
  return (
    <header style={{ flexShrink: 0, background: V.white, borderBottom: `1px solid ${V.greyXLight}`, fontFamily: V.font, position: 'relative', zIndex: 30 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}><InklingMark size={18} /><span style={{ fontWeight: 600, fontSize: 18, color: '#141414', letterSpacing: '-0.02em' }}>inkling</span></span>
        </div>
        <div style={{ position: 'relative', minWidth: 150 }}><UserMenu role={role} setRole={setRole} /></div>
      </div>
      <div style={{ display: 'flex', gap: 4, overflowX: 'auto', padding: '0 10px 10px', WebkitOverflowScrolling: 'touch' }}>
        {items.map(([key, label, icon, badge]) => {
          const on = view === key;
          return (
            <button key={key} onClick={() => setView(key)} style={{
              flexShrink: 0, display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 12px', borderRadius: 64, cursor: 'pointer', fontFamily: V.font, fontSize: 13, fontWeight: 600,
              border: `1px solid ${on ? V.green : V.greyLight}`, background: on ? V.greenLight : V.white, color: on ? V.greenDeep : V.greyDark, whiteSpace: 'nowrap',
            }}>
              <Icon name={icon} size={14} color={on ? V.greenDeep : V.greyDark} strokeWidth={1.9} />{label}
              {badge ? <span style={{ fontSize: 10, fontWeight: 700, color: V.red, background: V.redLight, borderRadius: 64, padding: '0 6px' }}>{badge}</span> : null}
            </button>
          );
        })}
      </div>
    </header>
  );
}

const CHEER_LINES = [
  ['Fun fact', 'There are more possible chess games than atoms in the observable universe.'],
  ['Fun fact', 'Honey found in 3,000-year-old Egyptian tombs was still edible.'],
  ['Fun fact', 'A teaspoon of neutron star would weigh about 6 billion tons.'],
  ['Fun fact', 'Wombats are the only animal whose poop is cube-shaped.'],
  ['Fun fact', 'Octopuses have nine brains and blue blood.'],
  ['Fun fact', 'Bananas share about 60% of their DNA with humans.'],
  ['Fun fact', 'The Eiffel Tower grows about 6 inches taller in summer heat.'],
  ['Fun fact', 'A bolt of lightning is roughly five times hotter than the sun’s surface.'],
  ['Fun fact', 'Cleopatra lived closer in time to the Moon landing than to the building of the pyramids.'],
  ['Fun fact', 'Sharks existed before trees did — by about 50 million years.'],
  ['Fun fact', 'Hot water can freeze faster than cold water. It’s called the Mpemba effect.'],
  ['Fun fact', 'Scotland’s national animal is the unicorn.'],
  ['Fun fact', 'Your stomach gets a brand-new lining every few days so it doesn’t digest itself.'],
  ['Fun fact', 'There’s enough gold in Earth’s core to coat the whole planet knee-deep.'],
  ['Fun fact', 'A single cloud can weigh more than a million pounds.'],
  ['Fun fact', 'Vending machines kill more people per year than sharks do.'],
  ['Fun fact', 'The first computer “bug” was a literal moth found in a relay in 1947.'],
  ['Fun fact', 'Snails can sleep for up to three years.'],
  ['Fun fact', 'The dot over a lowercase “i” or “j” is called a tittle.'],
  ['Fun fact', 'Humans share about 50% of their DNA with bananas and 96% with chimpanzees.'],
  ['Movie quote', '“May the Force be with you.” — Star Wars'],
  ['Movie quote', '“To infinity and beyond!” — Toy Story'],
  ['Movie quote', '“Life is like a box of chocolates.” — Forrest Gump'],
  ['Movie quote', '“Just keep swimming.” — Finding Nemo'],
  ['Movie quote', '“There’s no place like home.” — The Wizard of Oz'],
  ['Movie quote', '“Hakuna Matata — it means no worries.” — The Lion King'],
  ['Movie quote', '“Adventure is out there!” — Up'],
  ['Movie quote', '“I’ll be back.” — The Terminator'],
  ['Movie quote', '“After all, tomorrow is another day.” — Gone with the Wind'],
  ['Joke', 'Why don’t scientists trust atoms? They make up everything.'],
  ['Joke', 'Why did the scarecrow win an award? He was outstanding in his field.'],
  ['Joke', 'I only know 25 letters of the alphabet. I don’t know y.'],
  ['Joke', 'What do you call fake spaghetti? An impasta.'],
  ['Joke', 'Why did the bicycle fall over? It was two-tired.'],
  ['Joke', 'Parallel lines have so much in common — shame they’ll never meet.'],
  ['Joke', 'I used to play piano by ear. Now I use my hands.'],
  ['Disney', '\u201cIf you can dream it, you can do it.\u201d \u2014 Walt Disney'],
  ['Disney', '\u201cThe only way to get started is to quit talking and begin doing.\u201d \u2014 Walt Disney'],
  ['Disney', '\u201cOhana means family. Family means nobody gets left behind.\u201d \u2014 Lilo & Stitch'],
  ['Disney', '\u201cThe past can hurt. But you can run from it, or learn from it.\u201d \u2014 The Lion King'],
  ['Disney', '\u201cEven miracles take a little time.\u201d \u2014 Cinderella'],
  ['Disney', '\u201cThe flower that blooms in adversity is the rarest of all.\u201d \u2014 Mulan'],
  ['Riddle', 'What has keys but can’t open a lock? A piano.'],
  ['Riddle', 'What gets wetter the more it dries? A towel.'],
  ['Riddle', 'What has hands but can’t clap? A clock.'],
  ['Riddle', 'What has a head and a tail but no body? A coin.'],
  ['Riddle', 'The more you take, the more you leave behind. What are they? Footsteps.'],
  ['Riddle', 'What has many teeth but can’t bite? A comb.'],
  ['Riddle', 'What goes up but never comes down? Your age.'],
  ['Riddle', 'What can travel the world while staying in a corner? A stamp.'],
  ['CS humor', 'Forecast: 100% chance of a renewal conversation you’ve been putting off.'],
  ['CS humor', 'NPS stands for “Nervously Pressing Send” on that follow-up.'],
  ['CS humor', 'A healthy account is just an at-risk account with better follow-up.'],
  ['CS humor', 'Churn is when a customer ghosts you, but with paperwork.'],
  ['CS humor', 'I don’t always log calls, but when I do, it’s right before the QBR.'],
  ['CS wisdom', 'A renewal is won in the 90 days before it, not the week of.'],
  ['CS wisdom', 'Onboarding is the whole relationship in fast-forward — get it right.'],
  ['CS wisdom', 'The best escalation is the one you made unnecessary last month.'],
  ['CS wisdom', 'Adoption beats sentiment — usage tells the truth before the survey does.'],
  ['Work life', 'Block focus time like it’s a customer meeting. It is one — with future you.'],
  ['Work life', 'A short “no” today saves a long apology later.'],
  ['Work life', 'Inbox zero is a myth. Triage is the skill.'],
  ['Quote', '“However difficult life may seem, there is always something you can do.” — Stephen Hawking'],
  ['Quote', '“Quality is not an act, it is a habit.” — Aristotle'],
  ['Quote', '“The secret of getting ahead is getting started.” — Mark Twain'],
  ['Reminder', 'Steady check-ins prevent quiet churn.'],
  ['Did you know', 'A group of flamingos is called a “flamboyance.” Be the flamboyance.'],
  ['Quote', '“The best way to predict the future is to create it.” — Peter Drucker'],
  ['CS humor', 'I told an at-risk account a joke. No response. Tough crowd — or a churn signal.'],
  ['From the team', 'You’ve carried a lot lately — and it shows in the work.'],
  ['Did you know', 'Sea otters hold hands while they sleep so they don’t drift apart. Like a good QBR.'],
  ['Quote', '“It always seems impossible until it’s done.” — Nelson Mandela'],
  ['CS humor', 'My favorite trigger? The one that fires before the renewal, not after.'],
  ['Worth remembering', 'The signal is usually in what a customer doesn’t say.'],
  ['Did you know', 'Honey never spoils. Neither does a well-logged CRM note.'],
  ['Quote', '“Whether you think you can or you think you can’t, you’re right.” — Henry Ford'],
  ['CS humor', 'Why did the dashboard go to therapy? Too many unresolved issues.'],
  ['From the team', 'You can’t pour from an empty cup. Pace yourself.'],
  ['Did you know', 'Wombats make cube-shaped poop. Anyway — green means healthy.'],
  ['Quote', '“Done is better than perfect.” — Sheryl Sandberg'],
  ['CS humor', 'Active users down but logins up? Bold strategy. Let’s see how it plays out.'],
  ['Reminder', 'Clarity is a kindness — to customers and to yourself.'],
  ['Did you know', 'Bananas are berries, but strawberries aren’t. Nature loves an edge case.'],
  ['Quote', '“Start where you are. Use what you have. Do what you can.” — Arthur Ashe'],
  ['CS humor', 'A CSM walks into a renewal. The renewal says: “Been expecting you.”'],
  ['From the team', 'Small, consistent effort compounds. So does showing up.'],
  ['Did you know', 'Octopuses have three hearts. You only need one to do good work.'],
  ['Quote', '“What gets measured gets managed.” — Peter Drucker'],
  ['CS humor', 'I’m not saying it’s always the renewal date… but it’s always the renewal date.'],
  ['Did you know', 'A day on Venus is longer than its year. Some Mondays feel similar.'],
  ['Quote', '“Be the change you wish to see in your pipeline.” — almost Gandhi'],
  ['Worth remembering', 'The quiet, careful work matters most.'],
  ['Did you know', 'Shrimp’s hearts are in their heads. Lead with yours, too.'],
];
function Marquee() {
  const strip = React.useMemo(() => {
    const a = CHEER_LINES.slice();
    for (let i = a.length - 1; i > 0; i--) { const j = (Math.random() * (i + 1)) | 0; const t = a[i]; a[i] = a[j]; a[j] = t; }
    return a.concat(a);
  }, []);
  const dur = CHEER_LINES.length * 11; // seconds — scales with line count so scroll speed stays slow & readable
  return (
    <div style={{ flexShrink: 0, height: 30, background: V.white, borderBottom: `1px solid ${V.greyXLight}`, overflow: 'hidden', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center' }}>
      <div style={{ display: 'inline-flex', alignItems: 'center', animation: `ccmarquee ${dur}s linear infinite`, willChange: 'transform' }}>
        {strip.map((c, i) => (
          <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '0 22px' }}>
            <span style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: V.greyMed }}>{c[0]}:</span>
            <span style={{ fontSize: 12.5, color: V.greyDark }}>{c[1]}</span>
            <span style={{ color: V.greyLight, fontSize: 11 }}>•</span>
          </span>
        ))}
      </div>
    </div>
  );
}

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "declinePct": 20,
  "watchPct": 25,
  "density": "regular",
  "showSampleBadges": true
}/*EDITMODE-END*/;

function App() {
  const [view, setViewState] = React.useState('dashboard');
  const [role, setRole] = useRole();
  const setView = React.useCallback((v) => {
    if (v === 'leadership' && role === 'csm') return; // CSMs can't navigate to Leadership
    setViewState(v);
  }, [role]);
  // if switching to CSM while on the Leadership view, bounce back to dashboard
  React.useEffect(() => { if (role === 'csm' && view === 'leadership') setViewState('dashboard'); }, [role, view]);
  const [selected, setSelected] = React.useState(null);
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  // Live, persisted thresholds for in-app Trigger Settings — separate from the
  // design-mode Tweaks panel (which only lives in-memory + the host protocol).
  const [liveThresh, setLiveThreshState] = React.useState(() => {
    try { return JSON.parse(localStorage.getItem('cc_thresholds')) || { declinePct: t.declinePct, watchPct: t.watchPct }; } catch (e) { return { declinePct: t.declinePct, watchPct: t.watchPct }; }
  });
  const setLiveThresh = React.useCallback((key, val) => {
    setLiveThreshState((prev) => {
      const next = { ...prev, [key]: val };
      try { (window.Sync ? window.Sync.set : (k,v) => localStorage.setItem(k, JSON.stringify(v)))('cc_thresholds', next); } catch (e) {}
      return next;
    });
  }, []);
  const [dataVer, setDataVer] = React.useState(0);
  const [dataSource, setDataSource] = React.useState(window.HEALTH.dataSource);
  const [dataLoadedAt, setDataLoadedAt] = React.useState(null);
  const [overrides, setOverrides] = React.useState(() => {
    try { return JSON.parse(localStorage.getItem('cc_overrides') || '{}'); } catch (e) { return {}; }
  });
  const setOverride = React.useCallback((id, val) => {
    setOverrides((prev) => {
      const next = { ...prev };
      if (val) next[id] = val; else delete next[id];
      try { (window.Sync ? window.Sync.set : (k,v) => localStorage.setItem(k, JSON.stringify(v)))('cc_overrides', next); } catch (e) {}
      return next;
    });
  }, []);

  // Effective thresholds: the design-mode Tweaks panel wins if it's been
  // changed from its defaults (a designer is actively iterating); otherwise
  // use the persisted, leadership-editable live thresholds.
  const tweaksChanged = t.declinePct !== TWEAK_DEFAULTS.declinePct || t.watchPct !== TWEAK_DEFAULTS.watchPct;
  const effThresh = tweaksChanged ? { declinePct: t.declinePct, watchPct: t.watchPct } : liveThresh;

  // re-derive every account's status/headline against the live thresholds before rendering children
  React.useMemo(() => window.HEALTH.applyThresholds(effThresh), [effThresh.declinePct, effThresh.watchPct]);

  const flaggedCount = window.HEALTH.customers.filter((c) => ['stall', 'risk', 'watch', 'upsell'].includes(c.status) && overrides[c.id] !== 'noaction').length;

  React.useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') setSelected(null); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Deep-link support: ?account=<id> opens that account's detail panel
  // directly — used by Slack ping links ("Update this account" CTA).
  const openDeepLinkedAccount = React.useCallback(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const accountId = params.get('account');
      if (!accountId) return;
      const c = window.HEALTH.customers.find((c) => c.id === accountId);
      if (c) setSelected(c);
    } catch (e) {}
  }, []);
  React.useEffect(() => { openDeepLinkedAccount(); }, [openDeepLinkedAccount]);

  const [syncStatus, setSyncStatus] = React.useState(() => window.Sync ? window.Sync.status() : { enabled: false });

  // Pull shared state (outreach logs, ping history, watch overrides, snoozes,
  // Customer Log, activity feed) from the shared backend backend before loading
  // account data, so overrides/snoozes are in localStorage by the time
  // applyThresholds first runs. Falls through to localStorage-only if the
  // backend isn't configured/reachable — sync is additive, not required.
  React.useEffect(() => {
    let cancelled = false;
    const onLoaded = () => {
      window.HEALTH.applyThresholds(effThresh);
      setDataSource(window.HEALTH.dataSource);
      setDataLoadedAt(Date.now());
      setDataVer((v) => v + 1);
      window.checkTransitionsAndPing();
      openDeepLinkedAccount();
    };
    document.addEventListener('health:loaded', onLoaded);
    (async () => {
      if (window.Sync) {
        await window.Sync.init();
        if (cancelled) return;
        setSyncStatus(window.Sync.status());
      }
      window.HEALTH.loadFromFiles();
    })();
    return () => { cancelled = true; document.removeEventListener('health:loaded', onLoaded); };
  }, []);

  const nonDefault = t.declinePct !== 20 || t.watchPct !== 25;
  const mobile = useIsMobile();

  return (
    <TweakCtx.Provider value={{ density: t.density, showSampleBadges: t.showSampleBadges }}>
      <OverrideCtx.Provider value={{ overrides, setOverride }}>
        <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: V.pageBg, fontFamily: V.font, overflow: 'hidden' }}>
          <div style={{ position: 'relative', flex: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9, padding: '7px 16px', background: role === 'csm' ? V.greenLight : V.purpleLight, borderBottom: `1px solid ${V.greyXLight}` }}>
            <Icon name={role === 'csm' ? 'users' : 'grid'} size={14} color={role === 'csm' ? V.greenDeep : V.purpleDark} strokeWidth={2} />
            <span style={{ fontSize: 12, fontWeight: 700, color: role === 'csm' ? V.greenDeep : V.purpleDark }}>{role === 'csm' ? 'CSM view' : 'CS Leader view'}</span>
            <span style={{ fontSize: 12, color: V.greyDark }}>{role === 'csm' ? 'one CSM\u2019s own book \u00b7 Leadership rollups are hidden' : 'the whole team\u2019s book \u00b7 plus the Leadership rollup'}</span>
            <button onClick={() => setRole(role === 'csm' ? 'leadership' : 'csm')} style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: V.font, fontSize: 11.5, fontWeight: 600, color: V.greyDark, background: V.white, border: `1px solid ${V.greyLight}`, borderRadius: 7, padding: '4px 10px', cursor: 'pointer', whiteSpace: 'nowrap' }}>
              <Icon name="refresh" size={12} color={V.greyDark} strokeWidth={2} />
              {role === 'csm' ? 'Switch to CS Leader' : 'Switch to CSM'}
            </button>
          </div>
          <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: mobile ? 'column' : 'row', overflow: 'hidden' }}>
            {mobile
              ? <MobileNav view={view} setView={setView} flaggedCount={flaggedCount} role={role} setRole={setRole} />
              : <AppSidebar view={view} setView={setView} flaggedCount={flaggedCount} dataSource={dataSource} role={role} setRole={setRole} />}
            {view === 'dashboard' ? <Dashboard onSelect={setSelected} role={role} declinePct={effThresh.declinePct} watchPct={effThresh.watchPct} setThreshold={setLiveThresh} dataLoadedAt={dataLoadedAt} /> : view === 'playbooks' ? <Playbooks /> : view === 'accounts' ? <Accounts onSelect={setSelected} /> : view === 'notes' ? <NotesTasks onSelect={setSelected} /> : view === 'triggers' ? <Triggers /> : view.startsWith('leadership') ? (role !== 'csm' ? <LeadershipOverview onSelect={setSelected} declinePct={effThresh.declinePct} watchPct={effThresh.watchPct} setThreshold={setLiveThresh} initialTab={view === 'leadership' ? 'overview' : view.split('-')[1]} /> : <Dashboard onSelect={setSelected} role={role} declinePct={effThresh.declinePct} watchPct={effThresh.watchPct} setThreshold={setLiveThresh} dataLoadedAt={dataLoadedAt} />) : <BuildPlan />}
            {selected && <CustomerDetail c={selected} onClose={() => setSelected(null)} />}
          </div>
        </div>
        <TweaksPanel>
          <TweakSection label="Trigger thresholds" />
          <TweakSlider label="Decline / growth trigger" value={t.declinePct} min={15} max={50} step={5} unit="%"
            onChange={(v) => setTweak('declinePct', v)} />
          <TweakSlider label="Cumulative slide (Watch)" value={t.watchPct} min={10} max={40} step={5} unit="%"
            onChange={(v) => setTweak('watchPct', v)} />
          <div style={{ fontSize: 11, color: '#A4A8AF', padding: '2px 2px 8px', lineHeight: '15px' }}>
            MoM (or vs 3-month-high) drop past the decline trigger flags <strong>At&nbsp;Risk</strong>; the same rise flags <strong>Upsell</strong>. A softer cumulative slide flags <strong>Watch</strong>.
            {nonDefault && <span style={{ color: '#D97A22' }}> · Off the proposed 30% baseline.</span>}
          </div>
          <TweakSection label="Display" />
          <TweakRadio label="Density" value={t.density} options={['compact', 'regular', 'comfy']}
            onChange={(v) => setTweak('density', v)} />
          <TweakToggle label="Show sample-data badges" value={t.showSampleBadges}
            onChange={(v) => setTweak('showSampleBadges', v)} />
        </TweaksPanel>
      </OverrideCtx.Provider>
    </TweakCtx.Provider>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
