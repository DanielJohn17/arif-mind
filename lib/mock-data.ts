import type {
  DashboardMetric,
  ExpertProfile,
  LessonLearned,
  LocalizationEntry,
  WikiArticle,
} from "@/lib/types";

export const dashboardMetrics: DashboardMetric[] = [
  {
    label: "Published Knowledge Assets",
    value: "148",
    change: "+12 this month",
    tone: "positive",
  },
  {
    label: "Resolved Lessons Logged",
    value: "27",
    change: "4 awaiting review",
    tone: "neutral",
  },
  {
    label: "Localization Coverage",
    value: "9 regions",
    change: "3 new regions requested",
    tone: "attention",
  },
  {
    label: "Experts Listed",
    value: "42",
    change: "8 field specialists online",
    tone: "positive",
  },
];

export const wikiArticles: WikiArticle[] = [
  {
    id: "wiki-api-pos-sync",
    title: "POS Sync Recovery Runbook",
    slug: "pos-sync-recovery-runbook",
    category: "Operational Manual",
    audience: "Operations",
    summary:
      "Steps for validating terminal sync delays before escalating to engineering.",
    content:
      "Start by checking the TMS heartbeat, confirm whether the issue is regional or terminal-specific, and compare the latest transaction timestamp against the merchant's settlement record.",
    tags: ["POS", "Runbook", "TMS"],
    updatedAt: "2026-04-10",
    featured: true,
  },
  {
    id: "wiki-api-qr",
    title: "QR Payment API Overview",
    slug: "qr-payment-api-overview",
    category: "API Documentation",
    audience: "Engineering",
    summary:
      "High-level request flow for QR initiation, settlement callbacks, and reconciliation.",
    content:
      "The QR API provides merchant registration, payment initiation, callback verification, and daily reconciliation endpoints for partner systems.",
    tags: ["API", "QR", "Settlement"],
    updatedAt: "2026-04-08",
  },
  {
    id: "wiki-guide-onboarding",
    title: "Merchant Onboarding Playbook",
    slug: "merchant-onboarding-playbook",
    category: "Product Guide",
    audience: "Field",
    summary:
      "Field guide for training merchants on receipt handling, refunds, and onboarding checks.",
    content:
      "Use the onboarding checklist, validate KYC completeness, demonstrate offline fallback, and capture language preferences before go-live.",
    tags: ["Onboarding", "Field", "Merchants"],
    updatedAt: "2026-04-02",
    featured: true,
  },
];

export const lessonsLearned: LessonLearned[] = [
  {
    id: "lesson-terminal-timeout",
    title: "Intermittent terminal timeout during peak settlement",
    status: "Resolved",
    severity: "High",
    productArea: "POS Platform",
    owner: "Mekdes Alemu",
    rootCause:
      "A retry job was saturating the queue after duplicate settlement webhooks from one banking partner.",
    immediateFix:
      "Rate-limited the retry worker and purged the duplicate messages in the affected queue.",
    prevention:
      "Added idempotency checks to the settlement consumer and an alert for queue growth anomalies.",
    expertAdvice:
      "When the queue spikes, confirm whether the issue is upstream duplication before scaling workers.",
    createdAt: "2026-04-07",
  },
  {
    id: "lesson-receipt-encoding",
    title: "Receipt text rendered incorrectly on Afaan Oromo terminals",
    status: "Monitoring",
    severity: "Medium",
    productArea: "Localization",
    owner: "Rahel Tadesse",
    rootCause:
      "Two printer templates were still using a legacy font pack without the expected glyph coverage.",
    immediateFix:
      "Rolled out the updated printer template and manually reprinted affected receipts for pilot merchants.",
    prevention:
      "Standardize font validation in release QA for every region-specific printer profile.",
    expertAdvice:
      "Tie localization QA to device firmware checks, not just translated strings.",
    createdAt: "2026-04-12",
  },
  {
    id: "lesson-fraud-flag",
    title: "False fraud flags during market-day transaction bursts",
    status: "Open",
    severity: "Critical",
    productArea: "Risk Engine",
    owner: "Samuel Bekele",
    rootCause:
      "Threshold tuning did not reflect regional transaction bursts observed during weekly market events.",
    immediateFix:
      "Created a temporary exemption window for the affected merchant cluster while analysis continues.",
    prevention:
      "Incorporate regional transaction behavior data into fraud thresholds and review seasonality quarterly.",
    expertAdvice:
      "Fraud models need localization context or they will misread normal peak behavior as abuse.",
    createdAt: "2026-04-14",
  },
];

export const localizationEntries: LocalizationEntry[] = [
  {
    id: "loc-addis",
    region: "Addis Ababa",
    primaryLanguage: "Amharic",
    keyTerms: ["Receipt = Delasi", "Refund = Gebi Melash"],
    localBusinessPractice:
      "Merchants expect fast printed confirmation and often ask for end-of-day settlement summaries.",
    transactionBehavior:
      "Higher evening peak volume and stronger preference for QR in cafes and retail chains.",
    notes:
      "Urban merchants value speed and visible confirmation more than voice prompts.",
    contributor: "Helen Worku",
    reviewStatus: "Reviewed",
  },
  {
    id: "loc-oromia",
    region: "Oromia",
    primaryLanguage: "Afaan Oromo",
    keyTerms: ["Receipt = Ragaa Kaffaltii", "Refund = Deebii Kaffaltii"],
    localBusinessPractice:
      "Field teams report stronger trust when the onboarding demo includes spoken explanations in Afaan Oromo.",
    transactionBehavior:
      "Merchants frequently ask about offline behavior and delayed settlement reliability.",
    notes:
      "Use simpler refund language and confirm device battery expectations during training.",
    contributor: "Fitsum Jibat",
    reviewStatus: "Reviewed",
  },
  {
    id: "loc-tigray",
    region: "Tigray",
    primaryLanguage: "Tigrinya",
    keyTerms: ["Receipt = ወረቐት ክፍሊት", "Refund = ምምላስ ክፍሊት"],
    localBusinessPractice:
      "Merchants appreciate visual examples and concise printed training references they can keep on site.",
    transactionBehavior:
      "Users ask for reconciliation clarity after network interruptions and prefer low-friction repeat flows.",
    notes:
      "Short visual job aids perform better than long manuals for first-week adoption.",
    contributor: "Yonas Kiros",
    reviewStatus: "Pending",
  },
];

export const expertProfiles: ExpertProfile[] = [
  {
    id: "expert-hana",
    name: "Hana Tesfaye",
    role: "Lead API Engineer",
    team: "Platform",
    region: "Addis Ababa",
    languages: ["Amharic", "English"],
    superpowers: ["QR integration", "Callback debugging", "Settlement reconciliation"],
    contactChannel: "@hana.t",
    availability: "Available",
  },
  {
    id: "expert-dawit",
    name: "Dawit Gemechu",
    role: "Regional Enablement Manager",
    team: "Field Operations",
    region: "Oromia",
    languages: ["Afaan Oromo", "Amharic", "English"],
    superpowers: ["Merchant onboarding", "Field training", "Device troubleshooting"],
    contactChannel: "@dawit.g",
    availability: "On Field Duty",
  },
  {
    id: "expert-selam",
    name: "Selam Hailu",
    role: "Risk Analyst",
    team: "Trust & Safety",
    region: "Addis Ababa",
    languages: ["Amharic", "Tigrinya", "English"],
    superpowers: ["Fraud detection", "Merchant monitoring", "Escalation triage"],
    contactChannel: "@selam.h",
    availability: "Busy",
  },
];
