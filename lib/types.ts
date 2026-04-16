export type UserRole = "admin" | "employee" | "field_agent";

export type WikiArticle = {
  id: string;
  title: string;
  slug: string;
  category: "API Documentation" | "Operational Manual" | "Product Guide";
  audience: "Engineering" | "Operations" | "Field" | "Leadership";
  summary: string;
  content: string;
  tags: string[];
  updatedAt: string;
  featured?: boolean;
};

export type LessonLearned = {
  id: string;
  title: string;
  status: "Open" | "Resolved" | "Monitoring";
  severity: "Critical" | "High" | "Medium" | "Low";
  productArea: string;
  owner: string;
  rootCause: string;
  immediateFix: string;
  prevention: string;
  expertAdvice: string;
  createdAt: string;
};

export type LocalizationEntry = {
  id: string;
  region: string;
  primaryLanguage: string;
  keyTerms: string[];
  localBusinessPractice: string;
  transactionBehavior: string;
  notes: string;
  contributor: string;
  reviewStatus: "Reviewed" | "Pending" | "Needs Follow-up";
};

export type ExpertProfile = {
  id: string;
  name: string;
  role: string;
  team: string;
  region: string;
  languages: string[];
  superpowers: string[];
  contactChannel: string;
  availability: "Available" | "Busy" | "On Field Duty";
};

export type DashboardMetric = {
  label: string;
  value: string;
  change: string;
  tone: "positive" | "neutral" | "attention";
};
