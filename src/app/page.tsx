import { prisma } from "@/lib/prisma";
import { groupBySubject } from "@/lib/utils";
import CategoryBlocks from "@/components/CategoryBlocks";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [allAssignments, allPracticals, notices] = await Promise.all([
    prisma.assignment.findMany({ orderBy: { createdAt: "desc" }, take: 50 }),
    prisma.practical.findMany({ orderBy: { createdAt: "desc" }, take: 50 }),
    prisma.notice.findMany({ orderBy: { createdAt: "desc" }, take: 30 }),
  ]);

  const assignmentsBySubject = groupBySubject(allAssignments);
  const practicalsBySubject = groupBySubject(allPracticals);

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:py-8">
      <CategoryBlocks
        notices={notices}
        assignments={assignmentsBySubject}
        practicals={practicalsBySubject}
      />
    </div>
  );
}
