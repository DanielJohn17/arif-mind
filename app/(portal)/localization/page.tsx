import { LocalizationDirectory } from "@/components/localization-directory";
import { getLocalizationEntries } from "@/lib/data";

export default async function LocalizationPage() {
  const entries = await getLocalizationEntries();

  return <LocalizationDirectory initialEntries={entries} />;
}
