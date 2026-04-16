import { WikiBrowser } from "@/components/wiki-browser";
import { getWikiArticles } from "@/lib/data";

export default async function WikiPage() {
  const articles = await getWikiArticles();

  return <WikiBrowser articles={articles} />;
}
