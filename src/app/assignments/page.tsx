import { prisma } from "@/lib/prisma";
import { formatDate, groupBySubject } from "@/lib/utils";
import SubjectGroup from "@/components/SubjectGroup";
import FilePreview from "@/components/FilePreview";

export const dynamic = "force-dynamic";

export default async function AssignmentsPage() {
  const assignments = await prisma.assignment.findMany({
    orderBy: { createdAt: "desc" },
  });

  const bySubject = groupBySubject(assignments);

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-sm font-medium text-[#999] tracking-wide uppercase">Assignments</h1>
        <span className="text-xs text-[#555]">{assignments.length} total</span>
      </div>

      {assignments.length === 0 ? (
        <div className="card-dark p-8 text-center">
          <p className="text-sm text-[#555]">No assignments posted yet.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {[...bySubject.entries()].map(([subject, items]) => (
            <SubjectGroup
              key={subject}
              subject={subject}
              count={items.length}
              typeLabel="Assignment"
              typeColor="text-[#999]"
            >
              {items.map((item) => (
                <div key={item.id} className="card-dark p-4">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-xs text-[#999] font-medium">Assignment</span>
                    <span className="text-xs text-[#555]">&middot;</span>
                    <span className="text-xs text-[#555]">{formatDate(item.createdAt)}</span>
                    {item.dueDate && (
                      <>
                        <span className="text-xs text-[#555]">&middot;</span>
                        <span className="text-xs text-[#888]">Due: {formatDate(item.dueDate)}</span>
                      </>
                    )}
                  </div>
                  <h2 className="text-sm font-medium text-white mb-1">{item.title}</h2>
                  <p className="text-xs text-[#777] leading-relaxed whitespace-pre-wrap mb-3">
                    {item.description}
                  </p>
                  {item.fileUrl && (
                    <FilePreview fileUrl={item.fileUrl} fileName={item.fileName} />
                  )}
                </div>
              ))}
            </SubjectGroup>
          ))}
        </div>
      )}
    </div>
  );
}
