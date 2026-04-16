insert into public.wiki_articles
  (title, slug, category, audience, summary, content, tags, featured, published)
values
  (
    'POS Sync Recovery Runbook',
    'pos-sync-recovery-runbook',
    'Operational Manual',
    'Operations',
    'Steps for validating terminal sync delays before escalating to engineering.',
    'Check the TMS heartbeat, compare the latest transaction timestamp against merchant settlement records, and determine whether the issue is regional or terminal-specific before escalating.',
    array['POS', 'Runbook', 'TMS'],
    true,
    true
  ),
  (
    'QR Payment API Overview',
    'qr-payment-api-overview',
    'API Documentation',
    'Engineering',
    'Request flow for QR initiation, settlement callbacks, and reconciliation.',
    'The QR API exposes merchant registration, payment initiation, callback verification, and reconciliation endpoints for partner systems and internal gateway services.',
    array['API', 'QR', 'Settlement'],
    false,
    true
  ),
  (
    'Merchant Onboarding Playbook',
    'merchant-onboarding-playbook',
    'Product Guide',
    'Field',
    'Field guide for training merchants on receipts, refunds, and onboarding checks.',
    'Use the onboarding checklist, validate KYC completeness, demonstrate offline fallback, and capture language preferences before the merchant goes live.',
    array['Onboarding', 'Field', 'Merchants'],
    true,
    true
  )
on conflict (slug) do nothing;

insert into public.lessons_learned
  (title, status, severity, product_area, owner, root_cause, immediate_fix, prevention, expert_advice)
values
  (
    'Intermittent terminal timeout during peak settlement',
    'Resolved',
    'High',
    'POS Platform',
    'Mekdes Alemu',
    'A retry worker saturated the queue after duplicate settlement webhooks from one banking partner.',
    'Rate-limited the retry worker and purged duplicate queue messages.',
    'Add idempotency checks to the settlement consumer and alert on queue growth anomalies.',
    'Confirm whether duplication is upstream before scaling workers.'
  ),
  (
    'Receipt text rendered incorrectly on Afaan Oromo terminals',
    'Monitoring',
    'Medium',
    'Localization',
    'Rahel Tadesse',
    'Two printer templates still used a legacy font pack without the right glyph coverage.',
    'Rolled out the updated printer template and reprinted affected receipts.',
    'Standardize font validation in release QA for each region-specific printer profile.',
    'Localization QA must validate device firmware and printer templates, not just translated strings.'
  ),
  (
    'False fraud flags during market-day transaction bursts',
    'Open',
    'Critical',
    'Risk Engine',
    'Samuel Bekele',
    'Threshold tuning did not reflect regional transaction bursts observed during weekly market events.',
    'Created a temporary exemption window for the affected merchant cluster while analysis continued.',
    'Incorporate regional transaction behavior into fraud thresholds and review seasonality quarterly.',
    'Fraud models need localization context or normal peak behavior looks suspicious.'
  );

insert into public.localization_entries
  (region, primary_language, key_terms, local_business_practice, transaction_behavior, notes, contributor, review_status)
values
  (
    'Addis Ababa',
    'Amharic',
    array['Receipt = Delasi', 'Refund = Gebi Melash'],
    'Merchants expect fast printed confirmation and often ask for end-of-day settlement summaries.',
    'Higher evening peak volume and stronger preference for QR in cafes and retail chains.',
    'Urban merchants value speed and visible confirmation more than voice prompts.',
    'Helen Worku',
    'Reviewed'
  ),
  (
    'Oromia',
    'Afaan Oromo',
    array['Receipt = Ragaa Kaffaltii', 'Refund = Deebii Kaffaltii'],
    'Field teams report stronger trust when onboarding demos include spoken explanations in Afaan Oromo.',
    'Merchants frequently ask about offline behavior and delayed settlement reliability.',
    'Use simpler refund language and confirm device battery expectations during training.',
    'Fitsum Jibat',
    'Reviewed'
  ),
  (
    'Tigray',
    'Tigrinya',
    array['Receipt = ወረቐት ክፍሊት', 'Refund = ምምላስ ክፍሊት'],
    'Merchants appreciate visual examples and concise printed training references they can keep on site.',
    'Users ask for reconciliation clarity after network interruptions and prefer low-friction repeat flows.',
    'Short visual job aids outperform long manuals for first-week adoption.',
    'Yonas Kiros',
    'Pending'
  );

insert into public.expert_profiles
  (full_name, role_title, team, region, languages, superpowers, contact_channel, availability)
values
  (
    'Hana Tesfaye',
    'Lead API Engineer',
    'Platform',
    'Addis Ababa',
    array['Amharic', 'English'],
    array['QR integration', 'Callback debugging', 'Settlement reconciliation'],
    '@hana.t',
    'Available'
  ),
  (
    'Dawit Gemechu',
    'Regional Enablement Manager',
    'Field Operations',
    'Oromia',
    array['Afaan Oromo', 'Amharic', 'English'],
    array['Merchant onboarding', 'Field training', 'Device troubleshooting'],
    '@dawit.g',
    'On Field Duty'
  ),
  (
    'Selam Hailu',
    'Risk Analyst',
    'Trust & Safety',
    'Addis Ababa',
    array['Amharic', 'Tigrinya', 'English'],
    array['Fraud detection', 'Merchant monitoring', 'Escalation triage'],
    '@selam.h',
    'Busy'
  );
