import { ExpertFinder } from "@/components/expert-finder";
import { getExpertProfiles } from "@/lib/data";

export default async function ExpertsPage() {
  const experts = await getExpertProfiles();

  return <ExpertFinder experts={experts} />;
}
