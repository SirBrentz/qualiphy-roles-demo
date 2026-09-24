/* Qualiphy Roles & Permissions - mockup data
   FAKE DATA ONLY. Public share build: sources and internal notes removed. */

const ROLES = [
  // --- Qualiphy-side ---
  { id: 'super_admin', name: 'Super Admin', side: 'qualiphy', blurb: 'Full platform access. Qualiphy staff only.', refs: [], proposed: false },
  { id: 'support_specialist', name: 'Support Specialist', side: 'qualiphy', blurb: 'Tier 1-2 support. Needs visibility without clinical authority.', refs: [], proposed: false },
  { id: 'exam_quality_manager', name: 'Exam Quality Manager', side: 'qualiphy', blurb: 'Maintains exam templates, macros and order sets.', refs: [], proposed: false },
  { id: 'rx_provider', name: 'Rx Provider', side: 'qualiphy', blurb: 'Reviews and issues prescriptions. Not necessarily a GFE provider.', refs: [], proposed: false },
  { id: 'provider', name: 'Provider', side: 'qualiphy', blurb: 'Conducts GFE screenings.', refs: [], proposed: false },
  { id: 'collab_physician', name: 'Collaborating Physician', side: 'qualiphy', blurb: 'Chart review and clinical oversight.', refs: [], proposed: false },
  // --- Clinic-side ---
  { id: 'medical_director', name: 'Medical Director', side: 'clinic', blurb: 'Oversees one or more clinics.', refs: [], proposed: false },
  { id: 'clinic_admin', name: 'Clinic Admin', side: 'clinic', blurb: 'Owns the account. Billing, settings, credentials.', refs: [], proposed: false },
  { id: 'clinic_manager', name: 'Clinic Manager', side: 'clinic', blurb: 'Day-to-day operator. Financial visibility is the open question.', refs: [], proposed: false },
  { id: 'clinic_staff', name: 'Clinic Staff', side: 'clinic', blurb: 'Sends invites, sees nothing financial.', refs: [], proposed: true },
];

const AREAS = [
  { id: 'billing', name: 'Billing & finance' },
  { id: 'exams', name: 'Patients & exams' },
  { id: 'rx', name: 'Prescribing' },
  { id: 'clinical', name: 'Clinical work' },
  { id: 'clinicadmin', name: 'Clinic administration' },
  { id: 'integrations', name: 'Integrations & credentials' },
  { id: 'platform', name: 'Platform' },
];

/* grant values: true | false | 'conditional'
   'conditional' means "allowed, but gated by a setting another role controls" -
   that distinction matters for pricing visibility. */
const CAPABILITIES = [
  // Billing
  { id: 'billing.export', area: 'billing', name: 'Export billing summaries', detail: 'Download billing for their own clinic.', refs: [], urgent: true,
    g: { super_admin: true, support_specialist: true, clinic_admin: true, clinic_manager: 'conditional', medical_director: true } },
  { id: 'billing.bulk_export_org', area: 'billing', name: 'Bulk export across all sub-locations', detail: 'One export covering every clinic under a master account.', refs: [], urgent: true,
    g: { super_admin: true, clinic_admin: true, medical_director: true } },
  { id: 'billing.view_pricing', area: 'billing', name: 'See exam and medication pricing', detail: 'Clinic Admins want the ability to hide this from Managers.', refs: [], urgent: false,
    g: { super_admin: true, support_specialist: true, clinic_admin: true, clinic_manager: 'conditional', medical_director: true } },
  { id: 'billing.view_failed_payments', area: 'billing', name: 'See failed and skipped payments', detail: 'Failed and skipped payments alongside the billing export.', refs: [], urgent: false,
    g: { super_admin: true, support_specialist: true, clinic_admin: true } },
  { id: 'billing.waive_reprocess', area: 'billing', name: 'Waive billing on a reprocessed Rx', detail: 'Waive the charge when a prescription is reprocessed.', refs: [], urgent: false,
    g: { super_admin: true } },

  // Patients & exams
  { id: 'exam.send_invite', area: 'exams', name: 'Send an exam invite', detail: 'Baseline capability for every clinic-side role.', refs: [], urgent: false,
    g: { super_admin: true, support_specialist: true, clinic_admin: true, clinic_manager: true, clinic_staff: true, medical_director: true } },
  { id: 'exam.view_deferred', area: 'exams', name: 'View deferred exams and the reason', detail: 'A queue of deferred exams, each with its reason.', refs: [], urgent: false,
    g: { super_admin: true, support_specialist: true, clinic_admin: true, clinic_manager: true, medical_director: true, collab_physician: true } },
  { id: 'exam.edit_patient', area: 'exams', name: 'Edit patient details after submission', detail: 'Including while the exam is still pending.', refs: [], urgent: false,
    g: { super_admin: true, support_specialist: true, clinic_admin: true, provider: 'conditional' } },
  { id: 'exam.move', area: 'exams', name: 'Move or re-assign a GFE exam', detail: 'Move an exam to the correct patient profile.', refs: [], urgent: false,
    g: { super_admin: true, support_specialist: true, clinic_admin: true } },
  { id: 'exam.hide', area: 'exams', name: 'Hide specific exams from view', detail: 'MD or Admin restricts which exams their staff can send.', refs: [], urgent: false,
    g: { super_admin: true, clinic_admin: true, medical_director: true } },
  { id: 'exam.bulk_deactivate', area: 'exams', name: 'Bulk deactivate exams', detail: 'Toggle many exams off at once rather than one by one.', refs: [], urgent: false,
    g: { super_admin: true, clinic_admin: true } },
  { id: 'exam.consult_history', area: 'exams', name: 'View or export consultation history', detail: 'Per clinic, including duration.', refs: [], urgent: false,
    g: { super_admin: true, support_specialist: true, clinic_admin: true, medical_director: true } },
  { id: 'exam.lock_api_answers', area: 'exams', name: 'Edit API-populated intake answers', detail: 'Change intake answers that arrived through the API.', refs: [], urgent: false,
    g: { super_admin: true, provider: 'conditional', rx_provider: 'conditional' } },

  // Prescribing
  { id: 'rx.prescribe_from_profile', area: 'rx', name: 'Prescribe from the patient profile', detail: 'Any pharmacy, any order set attached to the exam.', refs: [], urgent: false,
    g: { super_admin: true, rx_provider: true } },
  { id: 'rx.reprocess_denied', area: 'rx', name: 'Reprocess a denied prescription', detail: 'Send a denied prescription again once it is fixed.', refs: [], urgent: false,
    g: { super_admin: true, rx_provider: true } },
  { id: 'rx.override_pharmacy', area: 'rx', name: 'Override the pharmacy on an order', detail: 'Switch pharmacy after the GFE has been completed.', refs: [], urgent: false,
    g: { super_admin: true, rx_provider: true } },
  { id: 'rx.open_pharmacies', area: 'rx', name: 'Prescribe to any pharmacy', detail: 'Super-admin gated toggle on an Rx Provider.', refs: [], urgent: false,
    g: { super_admin: true, rx_provider: 'conditional' } },
  { id: 'rx.all_patients', area: 'rx', name: 'See patients across all clinics', detail: 'Cross-clinic patient access for the providers who need it.', refs: [], urgent: false,
    g: { super_admin: true, rx_provider: 'conditional', provider: 'conditional' } },

  // Clinical work
  { id: 'clinical.conduct_screening', area: 'clinical', name: 'Conduct a GFE screening', detail: 'Run the patient visit and reach a verdict.', refs: [], urgent: false,
    g: { super_admin: true, provider: true, rx_provider: true } },
  { id: 'clinical.decide_exam', area: 'clinical', name: 'Approve, defer or reject an exam', detail: 'The clinical decision itself.', refs: [], urgent: false,
    g: { super_admin: true, provider: true, rx_provider: true } },
  { id: 'clinical.chart_review', area: 'clinical', name: 'Review and comment on charts', detail: 'Collaborating physician oversight, with edit and comment.', refs: [], urgent: false,
    g: { super_admin: true, collab_physician: true, medical_director: true } },
  { id: 'clinical.reaccess_inprogress', area: 'clinical', name: 'Re-access an in-progress exam', detail: 'Pick up an exam another provider started, or resume your own.', refs: [], urgent: false,
    g: { super_admin: true, provider: true, rx_provider: true, collab_physician: true } },
  { id: 'clinical.manage_macros', area: 'clinical', name: 'Create and edit exam macros', detail: 'Reusable clinical text blocks. The reason the Exam Quality Manager role exists.', refs: [], urgent: false,
    g: { super_admin: true, exam_quality_manager: true } },
  { id: 'clinical.manage_templates', area: 'clinical', name: 'Create and edit exam templates and order sets', detail: 'Build and change exam templates and order sets without engineering.', refs: [], urgent: false,
    g: { super_admin: true, exam_quality_manager: true } },
  { id: 'clinical.view_own_licenses', area: 'clinical', name: 'See own licenses, status and collaborations', detail: 'Providers see their own license state and collaborations.', refs: [], urgent: false,
    g: { super_admin: true, exam_quality_manager: true, provider: true, rx_provider: true, collab_physician: true } },
  { id: 'clinical.view_own_payout', area: 'clinical', name: 'See own payout in real time', detail: 'Relevant to part-time and 1099 providers.', refs: [], urgent: false,
    g: { super_admin: true, provider: true, rx_provider: true, collab_physician: true } },

  // Clinic administration
  { id: 'clinic.blacklist_provider', area: 'clinicadmin', name: 'Block a provider from this clinic', detail: 'And the reverse: a provider declining a clinic.', refs: [], urgent: false,
    g: { super_admin: true, clinic_admin: true, medical_director: true } },
  { id: 'clinic.view_id', area: 'clinicadmin', name: 'See their own Clinic ID', detail: 'Show the Clinic ID in the portal.', refs: [], urgent: false,
    g: { super_admin: true, support_specialist: true, clinic_admin: true, clinic_manager: true, medical_director: true, provider: true } },
  { id: 'clinic.see_managers', area: 'clinicadmin', name: 'See managers assigned to a clinic', detail: 'Names and contact details.', refs: [], urgent: false,
    g: { super_admin: true, support_specialist: true, clinic_admin: true, medical_director: true } },
  { id: 'clinic.suspend', area: 'clinicadmin', name: 'Suspend or deactivate a clinic', detail: 'Retaining the ability to view prior exams.', refs: [], urgent: false,
    g: { super_admin: true } },
  { id: 'clinic.view_suspended', area: 'clinicadmin', name: 'View deleted or suspended clinics', detail: 'Support can look up deleted or suspended clinics.', refs: [], urgent: false,
    g: { super_admin: true, support_specialist: true } },
  { id: 'clinic.email_cc', area: 'clinicadmin', name: 'Choose who is cc\'d on patient email', detail: 'Per-clinic control of Qualiphy outbound.', refs: [], urgent: false,
    g: { super_admin: true, clinic_admin: true } },
  { id: 'clinic.edit_contact', area: 'clinicadmin', name: 'Edit clinic phone and contact details', detail: 'Clinics update their own phone and contact details.', refs: [], urgent: false,
    g: { super_admin: true, support_specialist: true, clinic_admin: true } },

  // Integrations
  { id: 'api.regenerate_key', area: 'integrations', name: 'Regenerate the clinic API key', detail: 'Issue a new key and retire the old one.', refs: [], urgent: false,
    g: { super_admin: true, clinic_admin: true } },
  { id: 'api.per_location_key', area: 'integrations', name: 'Issue per-location API credentials', detail: 'Order-scoped and location-scoped credentials.', refs: [], urgent: false,
    g: { super_admin: true, clinic_admin: true } },
  { id: 'api.assign_exam_key', area: 'integrations', name: 'Assign exams or an API key per exam', detail: 'Scope a credential to specific exams.', refs: [], urgent: false,
    g: { super_admin: true } },
  { id: 'api.view_integrations', area: 'integrations', name: 'See the Integrations page', detail: 'Self-service credential management in the clinic portal.', refs: [], urgent: false,
    g: { super_admin: true, clinic_admin: true } },

  // Platform
  { id: 'platform.manage_roles', area: 'platform', name: 'Create roles and assign them to users', detail: 'The bootstrap permission for role administration.', refs: [], urgent: false,
    g: { super_admin: true } },
  { id: 'platform.switch_accounts', area: 'platform', name: 'Switch between clinics with one login', detail: 'One email address holding several usertypes at once.', refs: [], urgent: false,
    g: { super_admin: true, medical_director: true, clinic_admin: 'conditional' } },
  { id: 'platform.usage_metrics', area: 'platform', name: 'View exam usage and metrics', detail: 'Per clinic, admin and provider.', refs: [], urgent: false,
    g: { super_admin: true, support_specialist: true, clinic_admin: true, medical_director: true } },
];

/* Org model - fake data */
const ORG = {
  name: 'Northstar Wellness Group',
  id: 'org_4821',
  refs: [],
  locations: [
    { id: 'clinic_5501', name: 'Northstar Wellness - Scottsdale', state: 'AZ', apiKey: 'nw_sc_••••7741', active: true },
    { id: 'clinic_5502', name: 'Northstar Wellness - Tempe', state: 'AZ', apiKey: 'nw_te_••••2210', active: true },
    { id: 'clinic_5503', name: 'Northstar Wellness - Henderson', state: 'NV', apiKey: 'nw_he_••••9034', active: true },
    { id: 'clinic_5504', name: 'Northstar Wellness - Boise', state: 'ID', apiKey: null, active: false },
  ],
  people: [
    { name: 'Dana Whitfield', email: 'dana@northstarwellness.example', role: 'medical_director', locations: ['clinic_5501', 'clinic_5502', 'clinic_5503', 'clinic_5504'] },
    { name: 'Marcus Feld', email: 'marcus@northstarwellness.example', role: 'clinic_admin', locations: ['clinic_5501', 'clinic_5502'] },
    { name: 'Priya Raman', email: 'priya@northstarwellness.example', role: 'clinic_manager', locations: ['clinic_5501'] },
    { name: 'Joel Okafor', email: 'joel@northstarwellness.example', role: 'clinic_staff', locations: ['clinic_5503'] },
  ],
};

/* Decisions this mockup exists to force */
const DECISIONS = [
  { id: 'd1', q: 'Can a Clinic Manager see pricing?', why: 'Admins may want to hide pricing from Managers. That only makes sense if Managers see it by default.', refs: [] },
  { id: 'd2', q: 'Is Medical Director a role, or an account type?', why: 'One view makes it an account type that spans clinics and merges accounts; another makes it an authentication step. Those are different products.', refs: [] },
  { id: 'd3', q: 'Does one email address hold many roles at once, or one role per account?', why: 'Several asks assume one login holds many roles. Every permission decision downstream depends on the answer.', refs: [] },
  { id: 'd4', q: 'Are sub-locations an Org, or just clinics that share a billing contact?', why: 'A real Org object would let clinics move between Orgs. The locations work so far assumes the weaker model.', refs: [] },
  { id: 'd5', q: 'Who can regenerate an API key?', why: 'Admin-only is the obvious answer, but a new key breaks every integration using the old one, so it may need super-admin approval.', refs: [] },
  { id: 'd6', q: 'Is "conditional" a real grant type?', why: 'Several asks are not yes/no but "allowed, unless an Admin turns it off". If that is real, the data model needs a third state, not a boolean.', refs: [] },
];
