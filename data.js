/* Roles & Permissions demo: data. Public share build: internal notes, sources and names removed. */
(function () {
  const D = (window.ROLES_DEMO = {});

  D.ACCOUNT = { name: 'Mock Wellness Clinic', you: 'Alex Rivera (Admin)' };

  D.LOCATIONS = ['Mock Wellness Clinic', 'Mock Wellness Clinic - Santa Monica'];

  D.MANAGERS = [
    { id: 501, first: 'Danielle', last: 'Ortiz', phone: '(155) 501-0050', email: 'danielle.ortiz@example.com', location: 'Mock Wellness Clinic', roleId: 2 },
    { id: 502, first: 'Marcus', last: 'Webb', phone: '(155) 501-0050', email: 'marcus.webb@example.com', location: 'Mock Wellness Clinic - Santa Monica', roleId: 2 },
    { id: 503, first: 'Priya', last: 'Shah', phone: '(155) 501-0050', email: 'priya.shah@example.com', location: 'Mock Wellness Clinic', roleId: 3 },
  ];

  D.AREAS = ['Patients & exams', 'Billing & finance', 'Clinic administration', 'Integrations & credentials', 'Roles'];

  /* 23 clinic-side permissions, same keys and wording as the in-portal prototype. */
  D.PERMISSIONS = [
    { key: 'exam.send_invite', area: 'Patients & exams', name: 'Send exam invites',
      detail: 'Start a new exam for a patient. Managers can do this today.' },
    { key: 'exam.view_results', area: 'Patients & exams', name: 'View results and previous exams',
      detail: 'The Results tab. Managers can do this today.' },
    { key: 'exam.view_deferred', area: 'Patients & exams', name: 'View deferred exams and the reason',
      detail: 'See deferred exams, each with the reason.' },
    { key: 'exam.edit_patient', area: 'Patients & exams', name: 'Edit patient details after submission',
      detail: 'Including while the exam is still pending.' },
    { key: 'exam.move', area: 'Patients & exams', name: 'Move an exam to another patient profile',
      detail: 'Fix an exam sent against the wrong patient.' },
    { key: 'exam.hide', area: 'Patients & exams', name: 'Hide specific exams from the send list',
      detail: 'Restrict which exams staff can send.' },
    { key: 'exam.bulk_deactivate', area: 'Patients & exams', name: 'Bulk deactivate exams',
      detail: 'Toggle many exams off at once instead of one by one.' },
    { key: 'exam.consult_history', area: 'Patients & exams', name: 'View or export consultation history',
      detail: 'Per location, including consultation duration.' },
    { key: 'exam.intake_forms', area: 'Patients & exams', name: 'Manage intake forms',
      detail: 'The Intake Forms tab. Managers can do this today.' },

    { key: 'billing.view_pricing', area: 'Billing & finance', name: 'See exam and medication pricing',
      detail: 'Clinic Admins have asked to be able to hide this from Managers. Managers see it by default (decided Sep 15).' },
    { key: 'billing.export', area: 'Billing & finance', name: 'Export billing summaries',
      detail: 'Managers cannot do this today.' },
    { key: 'billing.bulk_export_org', area: 'Billing & finance', name: 'Export billing across all locations', orgOnly: true,
      detail: 'One export covering every location under the account.' },
    { key: 'billing.view_failed_payments', area: 'Billing & finance', name: 'See failed and skipped payments',
      detail: 'Failed and skipped payments alongside billing.' },

    { key: 'clinic.manage_managers', area: 'Clinic administration', name: 'Add, edit and remove managers',
      detail: 'The Managers tab.' },
    { key: 'clinic.see_managers', area: 'Clinic administration', name: 'See managers assigned to each location',
      detail: 'Names and contact details per location.' },
    { key: 'clinic.edit_contact', area: 'Clinic administration', name: 'Edit clinic phone and contact details',
      detail: 'Update the clinic phone number and contact details.' },
    { key: 'clinic.email_cc', area: 'Clinic administration', name: 'Choose who is cc\'d on patient emails',
      detail: 'Per-clinic control of Qualiphy outbound email.' },
    { key: 'clinic.notification_settings', area: 'Clinic administration', name: 'Change notification settings',
      detail: 'Settings tab. Managers can do this today.' },
    { key: 'clinic.white_label', area: 'Clinic administration', name: 'Edit white label settings',
      detail: 'White Label tab. Managers can do this today.' },

    { key: 'api.view_integrations', area: 'Integrations & credentials', name: 'View the Integrations page',
      detail: 'Self-service credential management in the portal.' },
    { key: 'api.regenerate_key', area: 'Integrations & credentials', name: 'Regenerate the clinic API key',
      detail: 'Issue a new API key and retire the old one.' },
    { key: 'api.per_location_key', area: 'Integrations & credentials', name: 'Issue per-location API credentials',
      detail: 'Location-scoped and order-scoped credentials.' },

    { key: 'roles.manage', area: 'Roles', name: 'Create roles and assign them to managers', adminOnly: true,
      detail: 'This screen. Account owner only.' },
  ];

  D.ROLES = [
    { id: 1, name: 'Admin', system: true, locked: true,
      description: 'Account owner. Full access to every location, billing and settings.', permissions: [] },
    { id: 2, name: 'Manager', system: true,
      description: 'Sends exams and reviews results for an assigned location. What a Manager can do today.',
      permissions: ['exam.send_invite', 'exam.view_results', 'exam.intake_forms', 'billing.view_pricing', 'clinic.notification_settings', 'clinic.white_label'] },
    { id: 3, name: 'Front Desk',
      description: 'Sends exam invites and checks results. No pricing, billing or settings.',
      permissions: ['exam.send_invite', 'exam.view_results'] },
  ];

  /* Real product copy from today's Managers tab and Add Manager modal. */
  D.COPY = {
    addManagerTip: 'Managers will have access to previous exams and be able to initiate new ones. However they will not be able to modify, edit or customize/create new ones.',
    addManagerModalTip: 'Your manager will receive an email invite from Qualiphy prompting them to sign up. Once they set their password, they will have manager access for the assigned location below.',
    addRoleTip: 'Roles decide what a manager can see and do. Admin and Manager are built in. Add a custom role, then assign it from the Managers tab.',
    editorTip: 'Tick what this role can do. Managers assigned to it get exactly these permissions and nothing else.',
    lockedTip: 'Admin is the account owner and always has every permission.',
    changeRoleTip: 'The manager keeps their location. Only what they can see and do changes.',
  };

  /* ---------------------------------------------------------------- EPIC CONTEXT (public share build)
     Same shape as the private block in v2/data.js, without ticket keys, colleague or customer names,
     or security findings. Edit both when the epic changes. */
  D.EPIC = {
    title: 'Clinic Roles and Permissions',
    status: 'In discovery. Stories follow the open answers.',
    summary: 'Let a clinic admin define roles, choose what each role can do, and assign a role to each manager.',
    problem: [
      'Today a clinic has two user types, Admin and Manager, and Manager permissions are fixed. Clinics keep asking for one capability to be added to or removed from Managers, and each request is handled on its own.',
      'Managers cannot export billing summaries. Enterprise clients are blocked and the team is covering by hand.',
      'Admins want to hide pricing from Managers so staff do not quote the wrong number to patients.',
      'Admins want to see which managers are on which location, with contact details.',
      'Each of these is a missing-role problem, not a feature problem. A role model solves the class.',
    ],
    inScope: [
      'Roles tab in the clinic portal, visible to the clinic Admin only.',
      'Create, edit, duplicate and delete custom roles. Built-in roles cannot be deleted; Admin is locked with every permission.',
      'Permission checklist: 23 clinic-side permissions in five areas.',
      'Assign a role to each manager from the Managers tab, plus Managers-tab filtering for multi-location accounts.',
      'Server-side enforcement of each permission on the endpoints the clinic portal uses.',
      'Audit of who granted or changed a role and when.',
      'Multi-location accounts: all-locations permissions apply across every location under the account.',
    ],
    outScope: [
      'Qualiphy-internal roles (Super Admin, Support Specialist, Exam Quality Manager): a follow-on on the same role model.',
      'Provider user types on the roadmap: a follow-on on the same role model.',
      'Medical Director verification, one email holding several account types, a formal Organization object, and provider-side permissions.',
    ],
    decisions: [
      { id: 'D1', state: 'decided', q: 'Can Clinic Managers see exam and medication pricing?', a: 'Yes, by default (decided Sep 15). Invites already show the sender the exam and medication prices. A Clinic Admin may still turn pricing off for a role.', demo: 'The built-in Manager role includes pricing.' },
      { id: 'D2', state: 'open', q: 'Is Medical Director a role or an account type?', a: 'Decides whether Medical Director requests belong here. Proposed: out of scope.', demo: 'Not in the demo.' },
      { id: 'D3', state: 'open', q: 'Does one manager hold one role or many?', a: 'Answer pending.', demo: 'One role per manager, like the prototype.' },
      { id: 'D4', state: 'open', q: 'Are sub-locations an Org, or clinics sharing a billing contact?', a: 'The locations work so far assumes the second.', demo: 'Two locations under one account; the all-locations permission appears.' },
      { id: 'D5', state: 'open', q: 'Who can regenerate an API key?', a: 'A new key breaks every integration using the old one, so it may need super-admin approval.', demo: 'An ordinary permission any role can hold.' },
      { id: 'D6', state: 'open', q: 'Is a permission on by default, with the Clinic Admin able to switch it off (an admin override)?', a: 'If yes, a permission has three states (on, off, on unless overridden), which is a data-model question for engineering.', demo: 'Checkboxes: on or off.' },
      { id: 'Eng', state: 'open', q: 'Do permissions map onto role names, or does the role model need a permissions table?', a: 'The role model stores roles and role assignments with no permissions concept. Engineering decides before the backend story is written, along with hard constraints such as the audit trail for privilege grants.', demo: 'Roles hold a list of permissions.' },
    ],
    prototype: 'Built inside a local copy of the clinic portal on Sep 14, 2026 with the portal\'s own Managers-tab components. This demo reproduces those screens outside the portal code.',
  };
})();
