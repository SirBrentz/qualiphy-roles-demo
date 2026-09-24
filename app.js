/* Qualiphy Roles & Permissions mockup - app shell
   No framework, no build step, no network. Open index.html and it runs. */

const STORE_KEY = 'qualiphy-roles-mockup-v1';
const CYCLE = [false, true, 'conditional'];

/* ---------- state ---------- */
function seedGrants() {
  const g = {};
  CAPABILITIES.forEach(c => {
    g[c.id] = {};
    ROLES.forEach(r => { g[c.id][r.id] = c.g[r.id] === undefined ? false : c.g[r.id]; });
  });
  return g;
}

let state = {
  view: 'roles',
  grants: seedGrants(),
  previewRole: 'clinic_manager',
  baselineRole: 'clinic_admin',
  filter: '',
};

function load() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return;
    const saved = JSON.parse(raw);
    if (saved && saved.grants) {
      // merge so newly added capabilities still appear
      Object.keys(state.grants).forEach(capId => {
        if (saved.grants[capId]) {
          Object.keys(state.grants[capId]).forEach(rid => {
            if (saved.grants[capId][rid] !== undefined) state.grants[capId][rid] = saved.grants[capId][rid];
          });
        }
      });
    }
    if (saved && saved.previewRole) state.previewRole = saved.previewRole;
    if (saved && saved.baselineRole) state.baselineRole = saved.baselineRole;
  } catch (e) { /* private mode / blocked storage - run from seed */ }
}

function save() {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify({
      grants: state.grants, previewRole: state.previewRole, baselineRole: state.baselineRole,
    }));
  } catch (e) { /* ignore */ }
}

/* ---------- helpers ---------- */
const $ = sel => document.querySelector(sel);
const esc = s => String(s).replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
const role = id => ROLES.find(r => r.id === id);
const cap = id => CAPABILITIES.find(c => c.id === id);
const initials = n => n.split(/\s+/).map(w => w[0]).slice(0, 2).join('').toUpperCase();

function refsHtml(refs) {
  if (!refs || !refs.length) return '';
  return '<div class="refs">' + refs.map(r => `<span class="ref">${esc(r)}</span>`).join('') + '</div>';
}

function grantCount(roleId) {
  return CAPABILITIES.filter(c => state.grants[c.id][roleId]).length;
}

function grantSymbol(v) {
  if (v === true) return '&#10003;';
  if (v === 'conditional') return '&#9679;';
  return '&#8722;';
}
function grantClass(v) {
  if (v === true) return 'yes';
  if (v === 'conditional') return 'conditional';
  return '';
}
function grantLabel(v) {
  if (v === true) return 'Allowed';
  if (v === 'conditional') return 'Allowed unless an Admin turns it off';
  return 'Not allowed';
}

/* ---------- views ---------- */
const VIEWS = {};

VIEWS.roles = () => {
  const q = ROLES.filter(r => r.side === 'qualiphy');
  const c = ROLES.filter(r => r.side === 'clinic');
  const total = CAPABILITIES.length;

  const card = r => {
    const n = grantCount(r.id);
    const pct = Math.round((n / total) * 100);
    return `
      <div class="role-card">
        <h3>${esc(r.name)}
          <span class="pill ${r.side === 'qualiphy' ? 'q' : 'c'}">${r.side === 'qualiphy' ? 'Qualiphy' : 'Clinic'}</span>
          ${r.proposed ? '<span class="pill proposed">Proposed</span>' : ''}
        </h3>
        <div class="blurb">${esc(r.blurb)}</div>
        <div class="meter"><i style="width:${pct}%"></i></div>
        <div class="meter-label"><span>${n} of ${total} permissions</span><span>${pct}%</span></div>
        ${refsHtml(r.refs)}
      </div>`;
  };

  return `
    <div class="page-intro">
      <p><strong>These are proposals, not current behaviour.</strong> Each role below comes from requests clinics and Qualiphy staff have already made.</p>
      <p>The one marked <span class="pill proposed">Proposed</span> is new, not from an existing request. If it does not survive the conversation, that is a useful result.</p>
    </div>

    <div class="stat-row">
      <div class="stat"><div class="n">${ROLES.length}</div><div class="l">Roles proposed</div></div>
      <div class="stat"><div class="n">${CAPABILITIES.length}</div><div class="l">Distinct permissions</div></div>
      <div class="stat"><div class="n">${AREAS.length}</div><div class="l">Permission areas</div></div>
      <div class="stat"><div class="n">${DECISIONS.length}</div><div class="l">Decisions needed</div></div>
    </div>

    <div class="card" style="margin-bottom:18px">
      <div class="card-head"><h2>Qualiphy staff</h2><span class="hint">Internal roles for Qualiphy staff.</span></div>
      <div class="card-body"><div class="grid three">${q.map(card).join('')}</div></div>
    </div>

    <div class="card">
      <div class="card-head"><h2>Clinic side</h2><span class="hint">What an account owner assigns to their own team.</span></div>
      <div class="card-body"><div class="grid three">${c.map(card).join('')}</div></div>
    </div>`;
};

VIEWS.matrix = () => {
  const head = ROLES.map(r => `
    <th title="${esc(r.blurb)}">
      <span class="rolename">${esc(r.name)}</span>
      <span class="side">${r.side === 'qualiphy' ? 'QLPH' : 'Clinic'}</span>
    </th>`).join('');

  const q = state.filter.trim().toLowerCase();
  const match = c => !q || c.name.toLowerCase().includes(q) || c.detail.toLowerCase().includes(q)
    || c.refs.some(r => r.toLowerCase().includes(q));

  let body = '';
  let shown = 0;
  AREAS.forEach(area => {
    const caps = CAPABILITIES.filter(c => c.area === area.id && match(c));
    shown += caps.length;
    if (!caps.length) return;
    body += `<tr class="area-row"><td colspan="${ROLES.length + 1}">${esc(area.name)}</td></tr>`;
    caps.forEach(c => {
      const cells = ROLES.map(r => {
        const v = state.grants[c.id][r.id];
        return `<td class="cell">
          <button class="grant ${grantClass(v)}" data-cap="${c.id}" data-role="${r.id}"
            title="${esc(r.name)} &rarr; ${esc(c.name)}\n${grantLabel(v)}\nClick to change">${grantSymbol(v)}</button>
        </td>`;
      }).join('');
      body += `<tr>
        <td class="cap">
          <div class="capname">${esc(c.name)} ${c.urgent ? '<span class="pill urgent">Urgent</span>' : ''}</div>
          <div class="capdetail">${esc(c.detail)}</div>
          ${refsHtml(c.refs)}
        </td>
        ${cells}
      </tr>`;
    });
  });

  return `
    <div class="page-intro">
      <p><strong>Every row is a real request.</strong> Click any cell to cycle it through not allowed, allowed, and allowed-unless-an-Admin-turns-it-off.</p>
      <p>The point of this screen is to turn a pile of requests into a set of decisions that can be made in one sitting. Your changes save locally, so you can bring a marked-up version to a meeting.</p>
    </div>

    <div class="legend" style="margin-bottom:12px">
      <input class="sel filter" id="cap-filter" type="search" placeholder="Filter permissions, e.g. pricing" value="${esc(state.filter)}" />
      <span><i class="swatch yes"></i> Allowed</span>
      <span><i class="swatch conditional"></i> Conditional</span>
      <span><i class="swatch no"></i> Not allowed</span>
      <span style="margin-left:auto">${shown} of ${CAPABILITIES.length} shown</span>
    </div>

    <div class="matrix-wrap">
      <table class="matrix">
        <thead><tr><th class="cap-col">Permission</th>${head}</tr></thead>
        <tbody>${body || `<tr><td colspan="${ROLES.length + 1}" class="empty">Nothing matches &ldquo;${esc(state.filter)}&rdquo;</td></tr>`}</tbody>
      </table>
    </div>`;
};

VIEWS.org = () => {
  const locs = ORG.locations.map(l => `
    <div class="loc ${l.active ? '' : 'off'}">
      <span class="dot"></span>
      <div>
        <div class="lname">${esc(l.name)}</div>
        <div class="lmeta">${esc(l.id)} &middot; ${esc(l.state)} &middot; ${l.active ? 'Active' : 'Inactive'}</div>
      </div>
      <div class="lkey ${l.apiKey ? '' : 'none'}">${l.apiKey ? esc(l.apiKey) : 'no location key'}</div>
    </div>`).join('');

  const people = ORG.people.map(p => {
    const r = role(p.role);
    return `<div class="person">
      <div class="avatar">${initials(p.name)}</div>
      <div>
        <div class="pname">${esc(p.name)}</div>
        <div class="pmail">${esc(p.email)}</div>
      </div>
      <div class="plocs">
        <div>${esc(r ? r.name : p.role)}</div>
        <div>${p.locations.length} of ${ORG.locations.length} locations</div>
      </div>
    </div>`;
  }).join('');

  return `
    <div class="page-intro">
      <p><strong>Multi-location customers need an organization.</strong> One Org holds its locations and its people. Every ask below assumes an Org exists.</p>
      <p>Deciding the model changes what the locations work builds.</p>
    </div>

    <div class="grid two">
      <div class="card">
        <div class="card-head"><h2>${esc(ORG.name)}</h2><span class="hint">${esc(ORG.id)}</span></div>
        <div class="card-body">
          ${locs}
          ${refsHtml(ORG.refs)}
        </div>
      </div>

      <div class="card">
        <div class="card-head"><h2>People</h2><span class="hint">One login, many locations</span></div>
        <div class="card-body">
          ${people}
          
        </div>
      </div>
    </div>

    <div class="card" style="margin-top:14px">
      <div class="card-head"><h2>What an Org would have to answer</h2></div>
      <div class="card-body">
        <div class="decision"><div class="q"><span class="n">1</span> Can a clinic be moved between Orgs, taking its history with it?</div><div class="why">It is the difference between an Org being a real object and a label.</div></div>
        <div class="decision"><div class="q"><span class="n">2</span> Does a location inherit the Org's permissions, or override them?</div><div class="why">Northstar Boise above has no location key. If permissions are inherited, it is already broken; if overridden, it is intentional.</div></div>
        <div class="decision"><div class="q"><span class="n">3</span> Is a separate Qualiphy account per site ever an Org?</div><div class="why">The locations work so far treats them as separate accounts, not locations of one another. Product should confirm that.</div></div>
      </div>
    </div>`;
};

VIEWS.preview = () => {
  const r = role(state.previewRole);
  const b = role(state.baselineRole);
  const opts = id => ROLES.map(x => `<option value="${x.id}" ${x.id === id ? 'selected' : ''}>${esc(x.name)}</option>`).join('');

  const NAV = [
    { label: 'Send exam invite', cap: 'exam.send_invite' },
    { label: 'Results dashboard', cap: 'exam.consult_history' },
    { label: 'Deferred exams', cap: 'exam.view_deferred' },
    { label: 'Pricing on the invite screen', cap: 'billing.view_pricing' },
    { label: 'Billing & export', cap: 'billing.export' },
    { label: 'Org-wide billing export', cap: 'billing.bulk_export_org' },
    { label: 'Clinic settings', cap: 'clinic.edit_contact' },
    { label: 'Integrations & API keys', cap: 'api.view_integrations' },
    { label: 'Regenerate API key', cap: 'api.regenerate_key' },
    { label: 'Usage & metrics', cap: 'platform.usage_metrics' },
    { label: 'Switch clinic', cap: 'platform.switch_accounts' },
    { label: 'Role management', cap: 'platform.manage_roles' },
  ];

  const mark = v => v === true ? '&#10003;' : (v === 'conditional' ? '&#9679;' : '&#8722;');
  const cls = v => v === true ? 'on' : (v === 'conditional' ? 'cond' : 'off');

  const rows = NAV.map(n => {
    const v = state.grants[n.cap][state.previewRole];
    const bv = state.grants[n.cap][state.baselineRole];
    const on = v === true || v === 'conditional';
    const bon = bv === true || bv === 'conditional';
    const lost = bon && !on;
    const gained = on && !bon;
    const c = cap(n.cap);
    return `<tr class="${lost ? 'lost' : gained ? 'gained' : ''}">
      <td class="lbl ${on ? '' : 'dim'}">${esc(n.label)}</td>
      <td class="mk ${cls(bv)}">${mark(bv)}</td>
      <td class="mk ${cls(v)}">${mark(v)}</td>
      <td class="delta">${lost ? '<span class="tag lost">removed</span>' : gained ? '<span class="tag gained">added</span>' : ''}</td>
      <td class="why">${esc((c.refs[0] || '').toString())}</td>
    </tr>`;
  }).join('');

  const visible = NAV.filter(n => state.grants[n.cap][state.previewRole]).length;
  const lostCount = NAV.filter(n => {
    const v = state.grants[n.cap][state.previewRole], bv = state.grants[n.cap][state.baselineRole];
    return (bv === true || bv === 'conditional') && !(v === true || v === 'conditional');
  }).length;

  return `
    <div class="page-intro">
      <p><strong>The same portal, seen by two roles side by side.</strong> This is the screen that makes the argument in a meeting. Nobody argues about a permissions table; everybody has an opinion about a menu that just lost six items.</p>
      <p>It reads live from the permission matrix, so whatever you toggle there shows up here.</p>
    </div>

    <div class="card">
      <div class="card-head">
        <h2>Compare</h2>
        <div class="preview-bar" style="margin-left:auto">
          <span style="font-size:12px;color:var(--ink-50)">Baseline</span>
          <select class="sel" id="baseline-role">${opts(state.baselineRole)}</select>
          <span style="font-size:12px;color:var(--ink-50)">vs</span>
          <select class="sel" id="preview-role">${opts(state.previewRole)}</select>
        </div>
      </div>
      <div class="card-body">
        <div class="stat-row" style="margin-bottom:14px">
          <div class="stat"><div class="n">${visible}/${NAV.length}</div><div class="l">Areas visible to ${esc(r.name)}</div></div>
          <div class="stat"><div class="n">${lostCount}</div><div class="l">Removed vs ${esc(b.name)}</div></div>
        </div>
        <p style="margin-top:0;color:var(--ink-50)">${esc(r.name)}: ${esc(r.blurb)}</p>
        <table class="compare">
          <thead><tr>
            <th>Portal area</th>
            <th class="mk">${esc(b.name)}</th>
            <th class="mk">${esc(r.name)}</th>
            <th></th>
            <th class="why"></th>
          </tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    </div>`;
};

VIEWS.decisions = () => `
    <div class="page-intro">
      <p><strong>These are the questions the mockup exists to force.</strong> None of them can be answered by engineering alone.</p>
    </div>
    <div class="card">
      <div class="card-head"><h2>Open decisions</h2><span class="hint">Product owns all of these</span></div>
      <div class="card-body">
        ${DECISIONS.map((d, i) => `
          <div class="decision">
            <div class="q"><span class="n">D${i + 1}</span> ${esc(d.q)}</div>
            <div class="why">${esc(d.why)}</div>
            ${refsHtml(d.refs)}
          </div>`).join('')}
      </div>
    </div>`;

VIEWS.export = () => {
  let md = '# Qualiphy roles and permissions\n\nGenerated from the mockup.\n\n';
  md += '## Roles\n\n';
  ROLES.forEach(r => {
    md += `### ${r.name} (${r.side === 'qualiphy' ? 'Qualiphy staff' : 'Clinic'})${r.proposed ? ' [PROPOSED]' : ''}\n`;
    md += `${r.blurb}\n`;
    if (r.refs.length) md += `Sources: ${r.refs.join(', ')}\n`;
    md += '\n';
  });
  md += '## Permissions\n\n';
  AREAS.forEach(area => {
    const caps = CAPABILITIES.filter(c => c.area === area.id);
    if (!caps.length) return;
    md += `### ${area.name}\n\n`;
    caps.forEach(c => {
      const yes = ROLES.filter(r => state.grants[c.id][r.id] === true).map(r => r.name);
      const cond = ROLES.filter(r => state.grants[c.id][r.id] === 'conditional').map(r => r.name);
      md += `**${c.name}**\n`;
      md += `- ${c.detail}\n`;
      md += `- Allowed: ${yes.length ? yes.join(', ') : 'nobody'}\n`;
      if (cond.length) md += `- Conditional: ${cond.join(', ')}\n`;
      md += '\n';
    });
  });
  md += '## Open decisions\n\n';
  DECISIONS.forEach((d, i) => { md += `${i + 1}. **${d.q}** ${d.why}\n`; });

  return `
    <div class="page-intro">
      <p><strong>The matrix as requirements text.</strong> Whatever the matrix says right now, ready to copy once the decisions are made.</p>
    </div>
    <div class="card">
      <div class="card-head">
        <h2>Specification</h2>
        <button class="btn primary" id="btn-copy" style="margin-left:auto">Copy to clipboard</button>
      </div>
      <div class="card-body"><pre class="out" id="spec">${esc(md)}</pre></div>
    </div>`;
};

/* ---------- titles ---------- */
const TITLES = {
  roles: ['Roles', 'Who exists in the system, and where they come from'],
  matrix: ['Permissions', 'Every row is a real request'],
  org: ['Organizations', 'Multi-location structure, and what it forces us to decide'],
  preview: ['Preview as…', 'The same portal through one role’s eyes'],
  decisions: ['Open decisions', 'Questions only Product can answer'],
  export: ['Export spec', 'The matrix, as requirements text'],
};

/* ---------- render ---------- */
function render() {
  const [t, s] = TITLES[state.view];
  $('#page-title').textContent = t;
  $('#page-sub').textContent = s;
  $('#view').innerHTML = VIEWS[state.view]();
  document.querySelectorAll('.nav-item').forEach(b => b.classList.toggle('on', b.dataset.view === state.view));
  $('#view').scrollTop = 0;
  window.scrollTo(0, 0);
  wireView();
}

function wireView() {
  document.querySelectorAll('.grant').forEach(btn => {
    btn.addEventListener('click', () => {
      const { cap: capId, role: roleId } = btn.dataset;
      const cur = state.grants[capId][roleId];
      const next = CYCLE[(CYCLE.indexOf(cur) + 1) % CYCLE.length];
      state.grants[capId][roleId] = next;
      btn.className = 'grant ' + grantClass(next);
      btn.innerHTML = grantSymbol(next);
      btn.title = `${role(roleId).name} → ${cap(capId).name}\n${grantLabel(next)}\nClick to change`;
      save();
    });
  });

  const sel = $('#preview-role');
  if (sel) sel.addEventListener('change', e => { state.previewRole = e.target.value; save(); render(); });

  const base = $('#baseline-role');
  if (base) base.addEventListener('change', e => { state.baselineRole = e.target.value; save(); render(); });

  const filt = $('#cap-filter');
  if (filt) {
    filt.addEventListener('input', e => {
      state.filter = e.target.value;
      render();
      const f = $('#cap-filter');
      if (f) { f.focus(); f.setSelectionRange(f.value.length, f.value.length); }
    });
  }

  const copy = $('#btn-copy');
  if (copy) copy.addEventListener('click', async () => {
    const text = $('#spec').textContent;
    try { await navigator.clipboard.writeText(text); copy.textContent = 'Copied'; }
    catch (e) {
      const r = document.createRange(); r.selectNodeContents($('#spec'));
      const s = window.getSelection(); s.removeAllRanges(); s.addRange(r);
      copy.textContent = 'Selected. Press Ctrl+C';
    }
    setTimeout(() => { copy.textContent = 'Copy to clipboard'; }, 2200);
  });
}

/* ---------- boot ---------- */
load();
$('#cnt-roles').textContent = ROLES.length;
$('#cnt-caps').textContent = CAPABILITIES.length;
$('#cnt-dec').textContent = DECISIONS.length;

document.querySelectorAll('.nav-item').forEach(b => {
  b.addEventListener('click', () => { state.view = b.dataset.view; render(); });
});

$('#btn-reset').addEventListener('click', () => {
  state.grants = seedGrants();
  save();
  render();
});

render();
