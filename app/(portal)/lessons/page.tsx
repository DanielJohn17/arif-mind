import { LessonsWorkbench } from "@/components/lessons-workbench";
import { getLessonsLearned } from "@/lib/data";

export default async function LessonsPage() {
  const lessons = await getLessonsLearned();

  return <LessonsWorkbench initialLessons={lessons} />;
}
