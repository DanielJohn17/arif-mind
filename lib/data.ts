import {
  dashboardMetrics,
  expertProfiles,
  lessonsLearned,
  localizationEntries,
  wikiArticles,
} from "@/lib/mock-data";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type {
  DashboardMetric,
  ExpertProfile,
  LessonLearned,
  LocalizationEntry,
  WikiArticle,
} from "@/lib/types";

export async function getCurrentUserProfile(): Promise<{
  full_name: string;
  role: string;
  team: string;
} | null> {
  if (!isSupabaseConfigured()) {
    return {
      full_name: "Demo User",
      role: "admin",
      team: "Prototype",
    };
  }

  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return null;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role, team")
    .eq("id", user.id)
    .maybeSingle();

  return (
    profile ?? {
      full_name: user.email ?? "ArifMind user",
      role: "employee",
      team: "Unassigned",
    }
  );
}

export async function getDashboardMetrics(): Promise<DashboardMetric[]> {
  return dashboardMetrics;
}

export async function getWikiArticles(): Promise<WikiArticle[]> {
  if (!isSupabaseConfigured()) {
    return wikiArticles;
  }

  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return wikiArticles;
  }

  const { data, error } = await supabase
    .from("wiki_articles")
    .select("*")
    .order("updated_at", { ascending: false });

  if (error || !data) {
    return wikiArticles;
  }

  return data.map((article) => ({
    id: article.id,
    title: article.title,
    slug: article.slug,
    category: article.category,
    audience: article.audience,
    summary: article.summary,
    content: article.content,
    tags: article.tags ?? [],
    updatedAt: article.updated_at,
    featured: article.featured,
  }));
}

export async function getLessonsLearned(): Promise<LessonLearned[]> {
  if (!isSupabaseConfigured()) {
    return lessonsLearned;
  }

  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return lessonsLearned;
  }

  const { data, error } = await supabase
    .from("lessons_learned")
    .select("*")
    .order("created_at", { ascending: false });

  if (error || !data) {
    return lessonsLearned;
  }

  return data.map((lesson) => ({
    id: lesson.id,
    title: lesson.title,
    status: lesson.status,
    severity: lesson.severity,
    productArea: lesson.product_area,
    owner: lesson.owner,
    rootCause: lesson.root_cause,
    immediateFix: lesson.immediate_fix,
    prevention: lesson.prevention,
    expertAdvice: lesson.expert_advice,
    createdAt: lesson.created_at,
  }));
}

export async function getLocalizationEntries(): Promise<LocalizationEntry[]> {
  if (!isSupabaseConfigured()) {
    return localizationEntries;
  }

  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return localizationEntries;
  }

  const { data, error } = await supabase
    .from("localization_entries")
    .select("*")
    .order("region");

  if (error || !data) {
    return localizationEntries;
  }

  return data.map((entry) => ({
    id: entry.id,
    region: entry.region,
    primaryLanguage: entry.primary_language,
    keyTerms: entry.key_terms ?? [],
    localBusinessPractice: entry.local_business_practice,
    transactionBehavior: entry.transaction_behavior,
    notes: entry.notes,
    contributor: entry.contributor,
    reviewStatus: entry.review_status,
  }));
}

export async function getExpertProfiles(): Promise<ExpertProfile[]> {
  if (!isSupabaseConfigured()) {
    return expertProfiles;
  }

  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return expertProfiles;
  }

  const { data, error } = await supabase
    .from("expert_profiles")
    .select("*")
    .order("full_name");

  if (error || !data) {
    return expertProfiles;
  }

  return data.map((expert) => ({
    id: expert.id,
    name: expert.full_name,
    role: expert.role_title,
    team: expert.team,
    region: expert.region,
    languages: expert.languages ?? [],
    superpowers: expert.superpowers ?? [],
    contactChannel: expert.contact_channel,
    availability: expert.availability,
  }));
}
