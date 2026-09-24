/* Roles & Permissions demo v2: app. Vanilla JS, no build step, no network calls.
   Reproduces the Sep 14 in-portal prototype (Managers tab Role column + Change Role, Roles & Permissions
   tab with the role editor, duplicate and delete) in the current clinic portal chrome, plus two
   epic scope items the prototype did not show (location filter, role change history).
   Icons adapted from Feather (MIT). */
(function () {
  'use strict';

  const D = window.ROLES_DEMO;
  const KEY = 'qualiphy-roles-demo-v2';
  const params = new URLSearchParams(location.search);
  if (params.has('static')) document.body.classList.add('static');
  const PERM_BY = Object.fromEntries(D.PERMISSIONS.map((p) => [p.key, p]));
  const ALL_KEYS = D.PERMISSIONS.map((p) => p.key);
  const ASSIGNABLE = D.PERMISSIONS.filter((p) => !p.adminOnly).map((p) => p.key);
  const MULTI_LOCATION = D.LOCATIONS.length > 1;
  const DEFAULT_ROLE_ID = 2;
  const YOU = D.ACCOUNT.you;
  const BL = { name: 'Billing Lead', description: 'Exports billing and sees pricing. No settings.', perms: ['exam.send_invite', 'exam.view_results', 'billing.view_pricing', 'billing.export', 'billing.bulk_export_org', 'billing.view_failed_payments'] };

  let S = null;
  let lastScrolled = -1;

  /* ------------------------------------------------------------------ icons */
  const CLIP = '<path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>';
  const P = {
    clipboard: CLIP + '<line x1="9" y1="12" x2="15" y2="12"/><line x1="9" y1="16" x2="13" y2="16"/>',
    clipSearch: CLIP + '<circle cx="11" cy="13" r="3"/><line x1="13.5" y1="15.5" x2="16" y2="18"/>',
    clipPlus: CLIP + '<line x1="12" y1="10" x2="12" y2="17"/><line x1="8.5" y1="13.5" x2="15.5" y2="13.5"/>',
    home: '<path d="M3 10l9-7 9 7v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><line x1="12" y1="11" x2="12" y2="17"/><line x1="9" y1="14" x2="15" y2="14"/>',
    userTie: '<circle cx="12" cy="7" r="4"/><path d="M4 21v-1a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v1z"/><path d="M12 14l-1.5 3 1.5 3 1.5-3z"/>',
    userShield: '<circle cx="9" cy="7" r="4"/><path d="M2 21v-2a4 4 0 0 1 4-4h5"/><path d="M18 22s4-2 4-5v-3l-4-1.5-4 1.5v3c0 3 4 5 4 5z"/>',
    userPlus: '<path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/>',
    userCog: '<circle cx="9" cy="7" r="4"/><path d="M2 21v-2a4 4 0 0 1 4-4h5"/><circle cx="18" cy="17" r="2.5"/><path d="M18 13v1.5M18 20.5V22M14 17h1.5M20.5 17H22"/>',
    fileText: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>',
    help: '<circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/>',
    edit: '<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>',
    palette: '<circle cx="13.5" cy="6.5" r="1"/><circle cx="17.5" cy="10.5" r="1"/><circle cx="8.5" cy="7.5" r="1"/><circle cx="6.5" cy="12.5" r="1"/><path d="M12 2a10 10 0 0 0 0 20c1 0 1.6-.8 1.6-1.7 0-.4-.2-.8-.4-1.1-.3-.3-.4-.7-.4-1.1a1.6 1.6 0 0 1 1.7-1.7h2a5.5 5.5 0 0 0 5.5-5.5C22 6 17.5 2 12 2z"/>',
    cog: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>',
    logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>',
    x: '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>',
    check: '<polyline points="20 6 9 17 4 12"/>',
    mail: '<path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>',
    more: '<circle cx="12" cy="5" r="1.2"/><circle cx="12" cy="12" r="1.2"/><circle cx="12" cy="19" r="1.2"/>',
    info: '<circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>',
    infoFill: '<circle cx="12" cy="12" r="10" fill="currentColor" stroke="none"/><line x1="12" y1="16.5" x2="12" y2="11.5" stroke="#fff"/><line x1="12" y1="7.8" x2="12.01" y2="7.8" stroke="#fff"/>',
    checkCircle: '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>',
    arrowLeft: '<line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>',
    arrowRight: '<line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>',
    play: '<polygon points="6 3 20 12 6 21 6 3"/>',
    pin: '<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>',
    book: '<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>',
    eye: '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>',
    eyeOff: '<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><path d="M14.12 14.12a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>',
    refresh: '<polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/>',
  };
  const I = (n, cls) => `<svg class="ic${cls ? ' ' + cls : ''}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${P[n] || ''}</svg>`;
  /* Portal chrome uses the portal's own glyphs (icons.js); the demo layer uses the line icons above. */
  const PI = (n, cls) => ((window.PORTAL_ICONS || {})[n] || '').replace('<svg ', `<svg class="pi${cls ? ' ' + cls : ''}" `);

  /* ------------------------------------------------------------------ utils */
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const fmtWhen = (t) => new Date(t).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
  const dnote = (k, html, attrs) => `<div class="dnote"${attrs ? ' ' + attrs : ''}>${I('info')}<div><span class="dn-k">${esc(k)}</span>${html}</div></div>`;
  const clone = (x) => JSON.parse(JSON.stringify(x));
  const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;
  function setPath(o, path, v) { const ks = path.split('.'); let t = o; for (let i = 0; i < ks.length - 1; i++) { if (t[ks[i]] == null) t[ks[i]] = {}; t = t[ks[i]]; } t[ks[ks.length - 1]] = v; }
  function toast(msg, kind) {
    const box = document.getElementById('toast'); if (!box) return;
    const el = document.createElement('div');
    el.className = 'toast' + (kind === 'info' ? ' info' : '');
    el.innerHTML = `${I(kind === 'info' ? 'info' : 'checkCircle')}<span>${esc(msg)}</span>`;
    box.appendChild(el);
    setTimeout(() => el.remove(), 3200);
  }

  /* ------------------------------------------------------------------ state */
  function fresh() {
    const t0 = Date.now(); const day = 864e5;
    const roles = clone(D.ROLES);
    return {
      v: 2, page: 'managers', roles, managers: clone(D.MANAGERS), nextRoleId: 4, nextMgrId: 504,
      history: [
        { at: t0 - 10 * day + 36e5, who: YOU, what: 'Priya Shah: role changed', from: 'Manager', to: 'Front Desk' },
        { at: t0 - 10 * day, who: YOU, what: 'Front Desk role added with 2 permissions', from: '', to: '' },
      ],
      filter: { location: 'all', role: 'all' }, menu: null, modal: null, drawer: null, ctxTab: 'decisions',
      wt: { on: false, step: 0 }, welcomed: false, notes: true, flash: null,
    };
  }
  function load() {
    if (params.has('fresh') || params.has('step')) return null;
    try { const s = JSON.parse(localStorage.getItem(KEY) || 'null'); return s && s.v === 2 && s.roles && s.managers ? s : null; } catch (e) { return null; }
  }
  let saveTimer = null;
  function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* storage blocked: the demo still runs */ } }
  function saveSoon() { clearTimeout(saveTimer); saveTimer = setTimeout(save, 200); }

  /* ------------------------------------------------------------------ model */
  const role = (id) => S.roles.find((r) => r.id === id);
  const roleByName = (n) => S.roles.find((r) => r.name.toLowerCase() === String(n).toLowerCase());
  const mgr = (id) => S.managers.find((m) => m.id === id);
  const effective = (r) => (r ? (r.locked ? ALL_KEYS : r.permissions) : []);
  const members = (id) => S.managers.filter((m) => m.roleId === id).length;
  const visibleKeysFor = (r) => D.PERMISSIONS.filter((p) => (MULTI_LOCATION || !p.orgOnly) && ((r && r.locked) || !p.adminOnly)).map((p) => p.key);
  const permLine = (p) => [p.detail, p.note, p.refs && p.refs.length ? `Requested in ${p.refs.join(', ')}.` : ''].filter(Boolean).join(' ');
  function log(what, from, to) { S.history.unshift({ at: Date.now(), who: YOU, what, from: from || '', to: to || '' }); }

  function saveRoleFromEditor() {
    const m = S.modal; const name = (m.name || '').trim(); const desc = (m.description || '').trim();
    const errors = {};
    if (!name) errors.name = 'Role name is required';
    else if (name.length > 40) errors.name = 'Keep it under 40 characters';
    else { const dup = roleByName(name); if (dup && !(m.mode === 'edit' && dup.id === m.roleId)) errors.name = 'A role with this name already exists'; }
    if (desc.length > 160) errors.description = 'Keep it under 160 characters';
    if (Object.keys(errors).length) { m.errors = errors; return false; }
    const perms = ASSIGNABLE.filter((k) => m.checked.includes(k));
    if (m.mode === 'edit') {
      const r = role(m.roleId); const before = r.permissions.slice();
      r.name = name; r.description = desc; r.permissions = perms;
      const added = perms.filter((k) => !before.includes(k)).map((k) => PERM_BY[k].name);
      const removed = before.filter((k) => !perms.includes(k)).map((k) => PERM_BY[k].name);
      log(`${name} role edited`, removed.length ? `Removed: ${removed.join(', ')}` : '', added.length ? `Added: ${added.join(', ')}` : (removed.length ? '' : 'Name or description only'));
      toast('Role updated successfully');
      S.flash = { table: 'role', id: r.id };
    } else {
      const r = { id: S.nextRoleId++, name, description: desc, permissions: perms };
      S.roles.push(r);
      log(`${name} role added with ${plural(perms.length, 'permission', 'permissions')}`);
      toast('Role added successfully');
      S.flash = { table: 'role', id: r.id };
    }
    S.modal = null;
    return true;
  }
  function assignRole(mgrId, roleId) {
    const m = mgr(mgrId); const from = role(m.roleId); const to = role(roleId);
    if (!m || !to || m.roleId === roleId) { S.modal = null; return; }
    m.roleId = roleId;
    log(`${m.first} ${m.last}: role changed`, from ? from.name : '', to.name);
    toast('Role updated successfully');
    S.flash = { table: 'mgr', id: m.id };
    S.modal = null;
  }
  function deleteRole(id) {
    const r = role(id); if (!r || r.system) return;
    const fallback = role(DEFAULT_ROLE_ID);
    S.managers.filter((m) => m.roleId === id).forEach((m) => { m.roleId = DEFAULT_ROLE_ID; log(`${m.first} ${m.last}: moved when ${r.name} was deleted`, r.name, fallback.name); });
    S.roles = S.roles.filter((x) => x.id !== id);
    log(`${r.name} role deleted`);
    toast('Role deleted successfully');
    S.modal = null;
  }
  function addManager() {
    const m = S.modal; const errors = {};
    if (!(m.first || '').trim()) errors.first = 'First name is required';
    if (!(m.last || '').trim()) errors.last = 'Last name is required';
    if (!(m.email || '').trim()) errors.email = 'Please enter your email';
    else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(m.email.trim())) errors.email = 'Please enter a valid email';
    const digits = (m.phone || '').replace(/\D/g, '');
    if (!digits) errors.phone = 'Please enter your phone number';
    else if (digits.length !== 10) errors.phone = 'Phone number is not valid';
    if (Object.keys(errors).length) { m.errors = errors; return false; }
    const phone = `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
    const nm = { id: S.nextMgrId++, first: m.first.trim(), last: m.last.trim(), email: m.email.trim(), phone, location: m.location, roleId: DEFAULT_ROLE_ID };
    S.managers.push(nm);
    log(`${nm.first} ${nm.last} added as a manager`, '', role(DEFAULT_ROLE_ID).name);
    toast('Manager added successfully');
    S.flash = { table: 'mgr', id: nm.id };
    S.modal = null;
    return true;
  }

  /* ------------------------------------------------------------------ portal chrome */
  const MENU = [
    ['Results', 'TbReportAnalytics', ''], ['Clinics', 'BiClinic', ''], ['Managers', 'FaUserTie', 'managers'], ['Roles & Permissions', 'FaUserShield', 'roles'],
    ['Medication Management', 'MdOutlineContentPasteSearch', ''], ['Exams', 'FaNotesMedical', ''], ['Intake Forms (Beta)', 'FaFileAlt', ''], ['Knowledge Base', 'BsQuestionCircle', ''],
    ['Weight Loss Exam', 'MdOutlineNoteAlt', ''], ['Rewards', 'TiUserAdd', ''], ['White Label', 'IoIosColorPalette', ''], ['Settings', 'IoSettings', ''],
  ];
  function sidebar() {
    return `<aside class="side"><div class="brand"><img src="assets/logo_white.png" alt="Qualiphy"></div><div class="dash">Dashboard ${PI('IoClose')}</div><nav>${MENU.map(([l, ic, pg]) => `<button${pg ? ` id="nav-${pg}"` : ''} class="${pg && pg === S.page ? 'on' : ''}" data-act="${pg ? 'page' : 'noop'}" data-page="${pg}">${PI(ic)}${esc(l)}</button>`).join('')}<div class="gap"></div><button data-act="noop">${PI('TbLogout')}Logout</button></nav></aside>`;
  }
  function topbar() {
    const isRoles = S.page === 'roles';
    return `<header class="top"><h1>${PI(isRoles ? 'FaUserShield' : 'FaUserTie')}${isRoles ? 'Roles &amp; Permissions' : 'Managers'}</h1><button class="btn btn-primary" data-act="noop">${PI('RiMailSendFill')} Send Exam Invite</button></header>`;
  }
  function kebab(kind, id, options) {
    const open = S.menu && S.menu.kind === kind && S.menu.id === id;
    return `<div class="kebab-wrap"><button class="kebab" data-act="menu" data-kind="${kind}" data-id="${id}" aria-label="Actions">${PI('BsThreeDotsVertical')}</button>${open ? `<div class="menu" data-stop-menu>${options.map((o) => `<button class="${o.cls || ''}" data-act="${o.act}" data-id="${id}">${esc(o.name)}</button>`).join('')}</div>` : ''}</div>`;
  }

  /* ------------------------------------------------------------------ managers page */
  function managersPage() {
    const f = S.filter;
    const list = S.managers.filter((m) => (f.location === 'all' || m.location === f.location) && (f.role === 'all' || String(m.roleId) === String(f.role)));
    const rows = list.map((m) => {
      const r = role(m.roleId);
      const flash = S.flash && S.flash.table === 'mgr' && S.flash.id === m.id ? ' class="flash"' : '';
      return `<tr${flash} data-mgr="${m.id}"><td>${m.id}</td><td>${esc(m.first)} ${esc(m.last)}</td><td>${esc(m.phone)}</td><td>${esc(m.location)}</td><td>${esc(r ? r.name : '-')}</td><td>${kebab('mgr', m.id, [
        { name: 'Unassign Location', act: 'noop' }, { name: 'View', act: 'noop' }, { name: 'Edit', act: 'noop' },
        { name: 'Change Role', act: 'open-assign', cls: 'new-opt' }, { name: 'Delete', act: 'noop', cls: 'danger' },
      ])}</td></tr>`;
    }).join('');
    const filters = MULTI_LOCATION ? `<div class="filters" id="mgr-filters">
        <label>Location<select class="sel" data-bind="filter.location" data-rerender><option value="all">All locations</option>${D.LOCATIONS.map((l) => `<option${f.location === l ? ' selected' : ''}>${esc(l)}</option>`).join('')}</select></label>
        <label>Role<select class="sel" data-bind="filter.role" data-rerender style="min-width:180px"><option value="all">All roles</option>${S.roles.filter((r) => !r.locked).map((r) => `<option value="${r.id}"${String(f.role) === String(r.id) ? ' selected' : ''}>${esc(r.name)}</option>`).join('')}</select></label>
        <span class="count">${plural(list.length, 'manager', 'managers')}${list.length !== S.managers.length ? ` of ${S.managers.length}` : ''}</span>
      </div>` : '';
    return `<div class="page">
      <div class="page-h"><h2>Managers List</h2><button class="btn btn-primary" data-act="open-addmgr">${PI('MdManageAccounts')} Add Manager <span class="tip-ico" data-tip="${esc(D.COPY.addManagerTip)}">${PI('FaInfoCircle', 'tip-ico')}</span></button></div>
      ${dnote('What changes on this tab', 'A <b>Role</b> column and <b>Change Role</b> in each row menu. Everything else is today\'s Managers tab, including the Add Manager tip on the right.')}
      ${filters}
      ${MULTI_LOCATION ? dnote('Epic scope, not in the Sep 14 prototype', 'Filtering by location for multi-location accounts rides in the same story. Filtering by role is a proposal.') : ''}
      ${rows ? `<table class="tbl" id="mgr-table"><thead><tr><th>Id</th><th>Name</th><th>Phone Number</th><th>Clinic Assigned</th><th>Role</th><th>Actions</th></tr></thead><tbody>${rows}</tbody></table>` : '<div class="empty" id="mgr-table">No managers match these filters</div>'}
    </div>`;
  }

  /* ------------------------------------------------------------------ roles page */
  function rolesPage() {
    const total = ALL_KEYS.length;
    const rows = S.roles.map((r) => {
      const opts = [{ name: 'View', act: 'open-view' }, { name: 'Edit', act: 'open-edit' }, { name: 'Duplicate', act: 'open-dup' }, { name: 'Delete', act: 'open-delete', cls: 'danger' }];
      const allowed = r.locked ? [opts[0], opts[2]] : r.system ? opts.slice(0, 3) : opts;
      const flash = S.flash && S.flash.table === 'role' && S.flash.id === r.id ? ' class="flash"' : '';
      return `<tr${flash} data-role="${r.id}"><td><span style="display:inline-flex;gap:8px;align-items:center">${esc(r.name)}${r.system ? '<span class="badge">Built in</span>' : ''}</span></td><td>${esc(r.description || '-')}</td><td>${r.locked ? 'Account owner' : members(r.id)}</td><td>${effective(r).length} of ${total}</td><td>${kebab('role', r.id, allowed)}</td></tr>`;
    }).join('');
    const hist = S.history.slice(0, 8).map((h) => `<li><time>${fmtWhen(h.at)}</time><div><span class="who">${esc(h.who)}</span> <span class="chg">${esc(h.what)}${h.from || h.to ? `: ${h.from ? `<span class="from">${esc(h.from)}</span> ` : ''}${h.from && h.to ? '&rarr; ' : ''}${esc(h.to)}` : ''}</span></div></li>`).join('');
    return `<div class="page">
      <div class="page-h"><h2>Roles</h2><button class="btn btn-primary" data-act="open-add">${PI('FaUserShield')} Add Role <span class="tip-ico" data-tip="${esc(D.COPY.addRoleTip)}">${PI('FaInfoCircle', 'tip-ico')}</span></button></div>
      ${dnote('Where it lives', 'A new <b>Roles &amp; Permissions</b> tab right after Managers, visible to the clinic Admin only. It reuses the Managers tab\'s header, table and modals, so it reads as a sibling screen, not a new design.')}
      <table class="tbl" id="role-table"><thead><tr><th>Role</th><th>Description</th><th>Managers</th><th>Permissions</th><th>Actions</th></tr></thead><tbody>${rows}</tbody></table>
      <div class="card" id="role-history"><h3>Role changes</h3><p class="small muted" style="margin:0">Who granted or changed a role, and when.</p><ul class="history">${hist || '<li><span class="muted">No changes yet.</span></li>'}</ul></div>
      ${dnote('Epic scope, not in the Sep 14 prototype', 'An audit of who granted or changed a role and when. The epic requires it; where it lives in the portal is still open.')}
    </div>`;
  }

  /* ------------------------------------------------------------------ modals */
  function modalShell(title, tip, body, size) {
    return `<div class="modal-wrap"><div class="modal${size === 'sm' ? ' sm' : ''}" role="dialog" aria-label="${esc(title)}"><div class="modal-h"><h3>${esc(title)}${tip ? ` <span data-tip="${esc(tip)}" class="tip-down">${PI('FaInfoCircle', 'info-dot')}</span>` : ''}</h3><button class="modal-x" data-act="close-modal" aria-label="Close">${PI('IoClose')}</button></div><div class="modal-b">${body}</div></div></div>`;
  }
  function editorModal() {
    const m = S.modal; const r = m.roleId ? role(m.roleId) : null;
    const readOnly = m.mode === 'view' || !!(r && r.locked && m.mode !== 'duplicate');
    const lockedView = !!(r && r.locked && m.mode !== 'duplicate');
    const visible = visibleKeysFor(lockedView ? r : null);
    const selected = lockedView ? visible.length : visible.filter((k) => m.checked.includes(k)).length;
    const title = m.mode === 'add' ? 'Add Role' : m.mode === 'edit' ? 'Edit Role' : m.mode === 'duplicate' ? 'Duplicate Role' : 'Role';
    const errs = m.errors || {};
    const areas = D.AREAS.map((a) => {
      const perms = D.PERMISSIONS.filter((p) => p.area === a && (MULTI_LOCATION || !p.orgOnly));
      if (!perms.length) return '';
      return `<div class="perm-area"><div class="ah">${esc(a)}</div>${perms.map((p) => {
        const ownerOnly = !!p.adminOnly && !lockedView;
        const on = lockedView ? true : !ownerOnly && m.checked.includes(p.key);
        const dis = readOnly || ownerOnly;
        return `<label class="perm${on ? ' on' : ''}${dis ? ' dis' : ''}${ownerOnly ? ' owner' : ''}"${dis ? '' : ` data-act="toggle-perm" data-key="${p.key}"`}><span class="cbx">${I('check')}</span><span><span class="pn">${esc(p.name)}${ownerOnly ? '<span class="badge">Account owner only</span>' : ''}${p.orgOnly ? '<span class="badge soft">All locations</span>' : ''}</span><span class="pd">${esc(p.detail)}${p.note ? ` <span class="note">${esc(p.note)}</span>` : ''}${p.refs && p.refs.length ? ` Requested in ${esc(p.refs.join(', '))}.` : ''}</span></span></label>`;
      }).join('')}</div>`;
    }).join('');
    const body = `<div class="row2">
        <label class="fld">Role Name<input class="inp" id="role-name" data-bind="modal.name" placeholder="e.g. Front Desk" value="${esc(m.name)}" ${readOnly ? 'disabled' : ''}>${errs.name ? `<span class="err-txt">${esc(errs.name)}</span>` : ''}</label>
        <label class="fld">Description<input class="inp" data-bind="modal.description" placeholder="What this role is for" value="${esc(m.description)}" ${readOnly ? 'disabled' : ''}>${errs.description ? `<span class="err-txt">${esc(errs.description)}</span>` : ''}</label>
      </div>
      <div class="perm-h"><span style="font-weight:500">Permissions</span><span class="cnt">${selected} of ${visible.length} selected</span></div>
      <div class="perm-list">${areas}</div>
      <div class="modal-f"><button class="btn btn-outline" data-act="close-modal">${readOnly ? 'Close' : 'Cancel'}</button>${readOnly ? '' : `<button class="btn btn-primary" id="save-role" data-act="save-role">${m.mode === 'edit' ? 'Save Changes' : 'Add Role'}</button>`}</div>`;
    return modalShell(title, lockedView ? D.COPY.lockedTip : D.COPY.editorTip, body);
  }
  function deleteModal() {
    const r = role(S.modal.roleId); if (!r) return '';
    const n = members(r.id); const fb = role(DEFAULT_ROLE_ID);
    return modalShell('Delete Role', '', `<div style="font-weight:500">Are you sure you want to delete the ${esc(r.name)} role?</div>${n ? `<div class="small muted">${n} manager${n === 1 ? '' : 's'} currently ${n === 1 ? 'has' : 'have'} this role. They will be moved to <b>${esc(fb.name)}</b>.</div>` : ''}<div class="modal-f"><button class="btn btn-outline" data-act="close-modal">Cancel</button><button class="btn btn-error" id="confirm-delete" data-act="confirm-delete">Delete</button></div>`, 'sm');
  }
  function assignModal() {
    const m = mgr(S.modal.mgrId); if (!m) return '';
    const sel = role(S.modal.roleId);
    const options = S.roles.filter((r) => !r.locked).map((r) => `<option value="${r.id}"${r.id === S.modal.roleId ? ' selected' : ''}>${esc(r.name)}</option>`).join('');
    return modalShell('Change Role', D.COPY.changeRoleTip, `<div><div class="kv-lbl">Manager</div><div class="kv-val">${esc(m.first)} ${esc(m.last)}</div></div>
      <label class="fld">Role<select class="inp" id="assign-role" data-bind="modal.roleId" data-num data-rerender>${options}</select>${sel && sel.description ? `<span class="small muted">${esc(sel.description)}</span>` : ''}</label>
      <div class="small muted">Admin is the account owner and is not assignable.</div>
      <div class="modal-f"><button class="btn btn-outline" data-act="close-modal">Cancel</button><button class="btn btn-primary" id="save-assign" data-act="save-assign">Save</button></div>`, 'sm');
  }
  function addManagerModal() {
    const m = S.modal; const e = m.errors || {};
    const f = (label, key, ph, type) => `<label class="fld">${label}<input class="inp" data-bind="modal.${key}" placeholder="${esc(ph)}" type="${type || 'text'}" value="${esc(m[key])}">${e[key] ? `<span class="err-txt">${esc(e[key])}</span>` : ''}</label>`;
    return modalShell('Add Manager', D.COPY.addManagerModalTip, `<div class="row2">${f('First Name', 'first', 'First Name')}${f('Last Name', 'last', 'Last Name')}</div><div class="row2">${f('Email', 'email', 'Email', 'email')}${f('Phone Number', 'phone', '(555) 555-5555', 'tel')}</div>
      <label class="fld">Assign Clinic<select class="inp" data-bind="modal.location">${D.LOCATIONS.map((l) => `<option${m.location === l ? ' selected' : ''}>${esc(l)}</option>`).join('')}</select></label>
      ${dnote('In this demo', 'New managers start with the <b>Manager</b> role, exactly as today. Change it afterwards from the row menu.')}
      <div class="modal-f"><button class="btn btn-outline" data-act="close-modal">Cancel</button><button class="btn btn-primary" data-act="save-manager">Add Manager</button></div>`);
  }

  /* ------------------------------------------------------------------ demo layer */
  function welcome() {
    return `<div class="modal-wrap"><div class="welcome" role="dialog" aria-label="Welcome">
      <div class="kick">Qualiphy · Clinic portal · Product demo</div>
      <h1>Roles &amp; Permissions</h1>
      <p class="lede">Let a clinic Admin define roles, choose what each role can do, and assign a role to each manager. Built on today's clinic portal: the Managers tab you know, plus a new Roles &amp; Permissions tab beside it.</p>
      <div class="w-cards">
        <div class="w-card"><div class="t">Why</div>Managers' permissions are fixed today, so every "let managers do X" or "hide Y from managers" request becomes its own ticket. A role model solves the whole class.</div>
        <div class="w-card"><div class="t">What you'll see</div><ul><li>Managers tab: a Role column and Change Role</li><li>Roles &amp; Permissions: built-in and custom roles</li><li>The role editor with all 23 permissions</li></ul></div>
        <div class="w-card"><div class="t">Where it stands</div>One decision made (Managers see pricing by default). Five decisions and one engineering question are open.</div>
      </div>
      <div class="w-actions"><button class="btn btn-primary" data-act="start-wt" id="start-wt">${I('play')} Start the walkthrough (about 3 minutes)</button><button class="btn ghost" data-act="start-explore" id="start-explore">Explore on my own</button></div>
      <p class="fine">Fake data only. Not connected to any Qualiphy environment. The screens reproduce the in-portal prototype of Sep 14, 2026.</p>
    </div></div>`;
  }
  function drawer() {
    const t = S.ctxTab; const E = D.EPIC;
    let body = '';
    if (t === 'decisions') {
      body = `<p>${esc(E.summary)}</p>${E.decisions.map((d) => `<div class="dec ${d.state}"><div class="dec-top"><span class="dec-id">${esc(d.id)}</span><span class="dec-q">${esc(d.q)}</span><span class="chip ${d.state === 'decided' ? 'chip-ok' : 'chip-open'}">${d.state === 'decided' ? 'Decided' : 'Open'}</span></div><div class="dec-a">${esc(d.a)}</div><div class="dec-demo">In this demo: ${esc(d.demo)}</div></div>`).join('')}`;
    } else if (t === 'scope') {
      body = `<h3>The problem</h3><ul>${E.problem.map((x) => `<li>${esc(x)}</li>`).join('')}</ul><h3>In scope</h3><ul>${E.inScope.map((x) => `<li>${esc(x)}</li>`).join('')}</ul><h3>Out of scope</h3><ul>${E.outScope.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>`;
    } else {
      body = `<h3>What this is</h3><p>${esc(E.prototype)}</p><h3>What's real and what's made up</h3><ul><li><b>From the epic and the prototype:</b> the screens, the 23 permissions and their wording, the built-in roles, the modals and their copy, the decisions.</li><li><b>Illustrative:</b> the account, the managers, the Front Desk and Billing Lead roles, and the history entries.</li><li><b>Not built:</b> enforcement, invitations, and anything outside the Managers and Roles &amp; Permissions tabs.</li></ul><h3>How to use it</h3><ul><li>The bottom bar switches between the two tabs, opens the walkthrough and this panel, and resets the demo.</li><li><b>Notes</b> hides the amber placement notes.</li><li>Changes are kept in this browser until you reset.</li></ul>`;
    }
    const tabs = [['decisions', 'Decisions'], ['scope', 'Scope'], ['about', 'About the demo']];
    return `<div class="backdrop" data-act="drawer-bg"><div class="drawer" data-stop id="ctx-drawer"><div class="dr-head"><div class="dr-top"><div><div class="dr-kicker">Epic context</div><h2>${esc(E.title)}</h2><div class="sub">${esc(E.status)}</div></div><button class="dr-x" data-act="drawer-close" aria-label="Close">${I('x')}</button></div><div class="dr-tabs">${tabs.map(([id, l]) => `<button class="${t === id ? 'on' : ''}" data-act="ctx-tab" data-tab="${id}">${l}</button>`).join('')}</div></div><div class="dr-body">${body}</div></div></div>`;
  }
  function bar() {
    return `<div class="bar-inner"><span class="bar-tag">Demo</span>
      <button class="bar-btn ${S.page === 'managers' ? 'on' : ''}" data-act="page" data-page="managers">${I('userTie')}Managers</button>
      <button class="bar-btn ${S.page === 'roles' ? 'on' : ''}" data-act="page" data-page="roles">${I('userShield')}Roles &amp; Permissions</button>
      <span class="bar-sep"></span>
      <button class="bar-btn ${S.wt.on ? 'on' : ''}" data-act="wt-toggle">${I('play')}Walkthrough</button>
      <button class="bar-btn" data-act="drawer" data-tab="decisions">${I('book')}Decisions</button>
      <button class="bar-btn" data-act="notes">${I(S.notes ? 'eye' : 'eyeOff')}Notes</button>
      <button class="bar-btn" data-act="reset">${I('refresh')}Reset</button></div>`;
  }

  /* ------------------------------------------------------------------ walkthrough */
  const billingLead = () => roleByName(BL.name);
  const openEditor = (mode, r, overrides) => {
    const base = r ? (r.locked ? ASSIGNABLE : effective(r)) : ['exam.send_invite', 'exam.view_results'];
    S.modal = Object.assign({ kind: 'editor', mode, roleId: r ? r.id : null, name: mode === 'duplicate' && r ? `${r.name} (copy)` : (r ? r.name : ''), description: r ? r.description : '', checked: base.slice(), errors: {} }, overrides || {});
  };
  const STEPS = [
    { id: 'today', title: 'Today: two user types', where: 'Clinic portal › Managers', target: '#mgr-table',
      body: `<p>Today a clinic has two user types, <b>Admin</b> and <b>Manager</b>, and a Manager's permissions are fixed.</p><ul><li>The Add Manager tip says it plainly: managers can see previous exams and start new ones, and can't change anything else.</li><li>So every "let managers do X" or "hide Y from managers" request becomes its own ticket. Billing export and hiding pricing are the loudest.</li></ul>`,
      run() { S.page = 'managers'; S.modal = null; S.filter = { location: 'all', role: 'all' }; } },
    { id: 'tab', title: 'A new tab, next to Managers', where: 'Clinic portal › sidebar', target: '#nav-roles',
      body: `<p><b>Roles &amp; Permissions</b> sits right after Managers, visible to the clinic Admin only.</p><p>It reuses the Managers tab's header, table and modals, so it reads as a sibling screen rather than a new design.</p>`,
      run() { S.page = 'managers'; S.modal = null; } },
    { id: 'roles', title: 'Built-in roles, plus your own', where: 'Clinic portal › Roles & Permissions', target: '#role-table',
      body: `<ul><li><b>Admin</b> is the account owner: built in, locked, every permission.</li><li><b>Manager</b> is built in and matches what managers can do today. It includes pricing, because Managers see pricing by default (D1, decided).</li><li><b>Front Desk</b> is an example custom role: send invites and check results, nothing financial.</li></ul>`,
      run() { S.page = 'roles'; S.modal = null; } },
    { id: 'add', title: 'Add a role', where: 'Roles & Permissions › Add Role', target: () => (S.modal ? '.modal' : '#role-table'), stay: true,
      body: `<p>Name the role and tick what it can do: 23 permissions in five areas.</p><ul><li><b>Account owner only</b> permissions are greyed out for custom roles.</li><li><b>All locations</b> permissions only appear on multi-location accounts, like this one.</li></ul><p>This one answers the loudest request: a role that can export billing.</p>`,
      doLabel: 'Add the Billing Lead role',
      done: () => !!billingLead(),
      doIt() { if (billingLead()) return; if (!(S.modal && S.modal.kind === 'editor')) openEditor('add', null, { name: BL.name, description: BL.description, checked: BL.perms.slice() }); S.page = 'roles'; saveRoleFromEditor(); },
      run() { S.page = 'roles'; if (!billingLead()) openEditor('add', null, { name: BL.name, description: BL.description, checked: BL.perms.slice() }); else S.modal = null; } },
    { id: 'assign', title: 'Assign it from Managers', where: 'Managers › row menu › Change Role', target: () => (S.modal ? '.modal' : '#mgr-table'), stay: true,
      body: `<p>Each manager gets a <b>Role</b> column and a <b>Change Role</b> option in the row menu.</p><p>The manager keeps their location. Only what they can see and do changes.</p>`,
      doLabel: 'Make Marcus Webb a Billing Lead',
      done: () => { const b = billingLead(); const m = mgr(502); return !!(b && m && m.roleId === b.id); },
      doIt() { const b = billingLead(); if (!b) return; S.page = 'managers'; assignRole(502, b.id); },
      run() { S.page = 'managers'; S.filter = { location: 'all', role: 'all' }; const b = billingLead(); const m = mgr(502); if (b && m && m.roleId !== b.id) S.modal = { kind: 'assign', mgrId: 502, roleId: b.id }; else S.modal = null; } },
    { id: 'filter', title: 'Filter by location', where: 'Managers › filters', target: '#mgr-filters',
      body: `<p>For accounts with more than one location, managers can be filtered by location. The epic carries this in the same story. Filtering by role is a proposal.</p><p class="wt-hint">This wasn't in the Sep 14 prototype. It's in the epic's scope.</p>`,
      run() { S.page = 'managers'; S.modal = null; S.filter = { location: D.LOCATIONS[1], role: 'all' }; } },
    { id: 'history', title: 'Every role change is recorded', where: 'Roles & Permissions › Role changes', target: '#role-history',
      body: `<p>Who granted or changed a role, and when. The changes you just made are at the top.</p><p class="wt-hint">Also epic scope beyond the prototype. Where it lives in the portal is still open.</p>`,
      run() { S.page = 'roles'; S.modal = null; S.filter = { location: 'all', role: 'all' }; } },
    { id: 'delete', title: 'Deleting a role is safe', where: 'Roles & Permissions › row menu › Delete', target: () => (S.modal ? '.modal' : '#role-table'), stay: true,
      body: `<p>Built-in roles can't be deleted. Deleting a custom role moves its managers to <b>Manager</b>, so nobody is left without a role.</p>`,
      doLabel: 'Delete the Front Desk role',
      done: () => !roleByName('Front Desk'),
      doIt() { const r = roleByName('Front Desk'); if (r) deleteRole(r.id); },
      run() { S.page = 'roles'; const r = roleByName('Front Desk'); S.modal = r ? { kind: 'delete', roleId: r.id } : null; } },
    { id: 'decisions', title: 'What\'s decided, what\'s open', where: 'Epic context › Decisions', target: null,
      body: `<ul><li><b>Decided:</b> Managers see pricing by default, and an Admin can turn it off per role (D1).</li><li><b>Open:</b> Medical Director as a role or an account type; one role per manager or many; how sub-locations work; who can regenerate an API key; whether a permission can be on by default with an Admin override.</li><li><b>Engineering:</b> how permissions map onto the role tables before the backend story is written.</li></ul>`,
      run() { S.modal = null; S.drawer = 'ctx'; S.ctxTab = 'decisions'; } },
    { id: 'end', title: 'That\'s the flow', where: 'Explore freely', target: null,
      body: `<p>Try the rest yourself: edit or duplicate a role, change a manager's role, add a manager, or filter by location.</p><p><b>Reset</b> in the bottom bar puts everything back.</p>`,
      run() { S.drawer = null; S.page = 'roles'; } },
  ];
  function ensure(i) { for (let k = 0; k < i; k++) { const st = STEPS[k]; if (st.doIt && !(st.done && st.done())) st.doIt(); } }
  function goStep(i) {
    const n = Math.max(0, Math.min(STEPS.length - 1, i));
    S.wt.step = n; S.wt.on = true; S.menu = null; S.drawer = null; S.modal = null;
    ensure(n); S.modal = null; S.flash = null;
    STEPS[n].run(); lastScrolled = -1;
  }
  function startWalkthrough(at) { const notes = S ? S.notes : true; S = fresh(); S.notes = notes; S.welcomed = true; goStep(at || 0); }
  function wtPanel() {
    const i = S.wt.step; const st = STEPS[i]; const n = STEPS.length; const done = st.done ? !!st.done() : false;
    const doBtn = st.doIt ? `<button class="wt-do ${done ? 'done' : ''}" data-act="wt-do" ${done ? 'disabled' : ''}>${done ? I('check') + ' Done' : I('play') + ' ' + esc(st.doLabel)}</button>${done ? '' : '<p class="wt-or">Or do it yourself on the page. Next also does it for you.</p>'}` : '';
    return `<div class="wt-top"><span class="wt-kicker">Walkthrough</span><span class="wt-count">${String(i + 1).padStart(2, '0')} / ${n}</span><button class="wt-x" data-act="wt-close" aria-label="Close the walkthrough">${I('x')}</button></div>
      <div class="wt-progress"><i style="width:${((i + 1) / n) * 100}%"></i></div>
      <div class="wt-dots">${STEPS.map((s, k) => `<button class="${k === i ? 'cur' : k < i ? 'done' : ''}" data-act="wt-goto" data-i="${k}" title="${esc(s.title)}" aria-label="Step ${k + 1}"></button>`).join('')}</div>
      <div class="wt-scroll"><div class="wt-where">${I('pin')}<span>${esc(st.where)}</span></div><h2 class="wt-title">${esc(st.title)}</h2><div class="wt-body">${st.body}</div>${doBtn}</div>
      <div class="wt-nav"><button data-act="wt-back" ${i === 0 ? 'disabled' : ''}>${I('arrowLeft')} Back</button><button class="primary" data-act="wt-next" id="wt-next" ${i === n - 1 ? 'disabled' : ''}>Next ${I('arrowRight')}</button></div>
      <div class="wt-foot"><button data-act="wt-restart">Restart from the beginning</button><button data-act="drawer" data-tab="decisions">Decisions</button><button data-act="wt-close">Explore freely</button></div>`;
  }

  /* ------------------------------------------------------------------ actions */
  const ACT = {
    noop() { toast('Not part of this demo.', 'info'); S.menu = null; },
    page(d) { S.page = d.page; S.menu = null; S.modal = null; S.drawer = null; S.flash = null; window.scrollTo(0, 0); },
    menu(d) { const id = Number(d.id); S.menu = S.menu && S.menu.kind === d.kind && S.menu.id === id ? null : { kind: d.kind, id }; },
    'open-add'() { S.menu = null; openEditor('add', null); },
    'open-view'(d) { S.menu = null; openEditor('view', role(Number(d.id))); },
    'open-edit'(d) { S.menu = null; openEditor('edit', role(Number(d.id))); },
    'open-dup'(d) { S.menu = null; openEditor('duplicate', role(Number(d.id))); },
    'open-delete'(d) { S.menu = null; S.modal = { kind: 'delete', roleId: Number(d.id) }; },
    'open-assign'(d) { S.menu = null; const m = mgr(Number(d.id)); S.modal = { kind: 'assign', mgrId: m.id, roleId: m.roleId }; },
    'open-addmgr'() { S.menu = null; S.modal = { kind: 'addmgr', first: '', last: '', email: '', phone: '', location: D.LOCATIONS[0], errors: {} }; },
    'toggle-perm'(d) { const m = S.modal; if (!m || m.kind !== 'editor') return false; const i = m.checked.indexOf(d.key); if (i >= 0) m.checked.splice(i, 1); else m.checked.push(d.key); },
    'save-role'() { saveRoleFromEditor(); },
    'save-assign'() { assignRole(S.modal.mgrId, Number(S.modal.roleId)); },
    'confirm-delete'() { deleteRole(S.modal.roleId); },
    'save-manager'() { addManager(); },
    'close-modal'() { S.modal = null; },
    drawer(d) { S.drawer = 'ctx'; S.ctxTab = d.tab || 'decisions'; S.menu = null; },
    'drawer-close'() { S.drawer = null; },
    'drawer-bg'() { S.drawer = null; },
    'ctx-tab'(d) { S.ctxTab = d.tab; },
    notes() { S.notes = !S.notes; },
    reset() { const on = S.wt.on; const notes = S.notes; S = fresh(); S.notes = notes; S.welcomed = true; if (on) goStep(0); toast('Demo reset.', 'info'); },
    'wt-toggle'() { if (S.wt.on) S.wt.on = false; else goStep(S.wt.step || 0); },
    'wt-next'() { const st = STEPS[S.wt.step]; if (st.stay && st.doIt && !(st.done && st.done())) { st.doIt(); lastScrolled = -1; return; } if (S.wt.step < STEPS.length - 1) goStep(S.wt.step + 1); },
    'wt-back'() { if (S.wt.step > 0) goStep(S.wt.step - 1); },
    'wt-goto'(d) { goStep(Number(d.i)); },
    'wt-do'() { const st = STEPS[S.wt.step]; if (st.doIt && !(st.done && st.done())) { st.doIt(); lastScrolled = -1; } },
    'wt-close'() { S.wt.on = false; },
    'wt-restart'() { startWalkthrough(0); },
    'start-wt'() { startWalkthrough(0); },
    'start-explore'() { const notes = S.notes; S = fresh(); S.notes = notes; S.welcomed = true; S.page = 'roles'; },
  };

  /* ------------------------------------------------------------------ render + events */
  const $app = document.getElementById('app'); const $ov = document.getElementById('overlay'); const $wt = document.getElementById('wt'); const $bar = document.getElementById('bar');
  function overlays() {
    if (!S.welcomed) return welcome();
    let h = '';
    if (S.drawer) h += drawer();
    if (S.modal) h += S.modal.kind === 'editor' ? editorModal() : S.modal.kind === 'delete' ? deleteModal() : S.modal.kind === 'assign' ? assignModal() : S.modal.kind === 'addmgr' ? addManagerModal() : '';
    return h;
  }
  function afterRender() {
    if (!S.wt.on || !S.welcomed) return;
    const st = STEPS[S.wt.step]; if (!st || !st.target) return;
    const sel = typeof st.target === 'function' ? st.target() : st.target;
    const el = sel ? document.querySelector(sel) : null; if (!el) return;
    el.classList.add('wt-hl');
    if (lastScrolled !== S.wt.step) { lastScrolled = S.wt.step; requestAnimationFrame(() => el.scrollIntoView({ block: 'center', behavior: document.body.classList.contains('static') ? 'auto' : 'smooth' })); }
  }
  function render() {
    const wtOn = !!(S.wt.on && S.welcomed);
    document.body.classList.toggle('wt-open', wtOn);
    document.body.classList.toggle('notes-off', !S.notes);
    $app.innerHTML = `<div class="shell">${sidebar()}<main class="main">${topbar()}${S.page === 'roles' ? rolesPage() : managersPage()}</main></div>`;
    $ov.innerHTML = overlays();
    $wt.innerHTML = wtOn ? wtPanel() : '';
    $bar.innerHTML = S.welcomed ? bar() : '';
    afterRender();
    S.flash = null;
    saveSoon();
  }

  document.addEventListener('click', (e) => {
    const el = e.target.closest('[data-act]');
    if (!el) { if (S.menu && !e.target.closest('[data-stop-menu]')) { S.menu = null; render(); } return; }
    if (el.dataset.act === 'drawer-bg' && e.target.closest('[data-stop]')) return;
    const fn = ACT[el.dataset.act]; if (!fn) return;
    e.preventDefault();
    if (fn(el.dataset, el, e) !== false) render();
  });
  document.addEventListener('input', (e) => {
    const el = e.target; const path = el.dataset && el.dataset.bind; if (!path || el.tagName === 'SELECT') return;
    setPath(S, path, el.value);
  });
  document.addEventListener('change', (e) => {
    const el = e.target; const path = el.dataset && el.dataset.bind; if (!path) return;
    setPath(S, path, el.dataset.num !== undefined ? Number(el.value) : el.value);
    if (el.dataset.rerender !== undefined) render(); else saveSoon();
  });
  document.addEventListener('keydown', (e) => {
    const tag = (e.target.tagName || '').toLowerCase();
    if (e.key === 'Enter' && tag === 'input' && S.modal) { e.preventDefault(); const act = S.modal.kind === 'editor' ? 'save-role' : S.modal.kind === 'addmgr' ? 'save-manager' : null; if (act) { ACT[act](); render(); } return; }
    if (tag === 'input' || tag === 'textarea' || tag === 'select') return;
    if (e.key === 'Escape') { if (S.menu) S.menu = null; else if (S.modal && S.welcomed) S.modal = null; else if (S.drawer) S.drawer = null; render(); return; }
    if (!S.wt.on || !S.welcomed) return;
    if (e.key === 'ArrowRight') { ACT['wt-next'](); render(); } else if (e.key === 'ArrowLeft') { ACT['wt-back'](); render(); }
  });
  window.addEventListener('beforeunload', save);

  /* ------------------------------------------------------------------ init */
  S = load() || fresh();
  if (params.has('step')) { startWalkthrough(Number(params.get('step')) || 0); }
  render();
  window.__demo = { get state() { return JSON.parse(JSON.stringify(S)); }, steps: STEPS.map((s) => s.id) };
})();
