import { prisma } from "@/lib/prisma";
import { formatDate, groupBySubject } from "@/lib/utils";
import SubjectGroup from "@/components/SubjectGroup";
import FilePreview from "@/components/FilePreview";

export const dynamic = "force-dynamic";

export default async function PracticalsPage() {
  const practicals = await prisma.practical.findMany({
    orderBy: { createdAt: "desc" },
  });

  const bySubject = groupBySubject(practicals);

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-sm font-medium text-[#888] tracking-wide uppercase">Practicals</h1>
        <span className="text-xs text-[#555]">{practicals.length} total</span>
      </div>

      {practicals.length === 0 ? (
        <div className="card-dark p-8 text-center">
          <p className="text-sm text-[#555]">No practicals posted yet.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {[...bySubject.entries()].map(([subject, items]) => (
            <SubjectGroup
              key={subject}
              subject={subject}
              count={items.length}
              typeLabel="Practical"
              typeColor="text-[#888]"
            >
              {items.map((item) => (
                <div key={item.id} className="card-dark p-4">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-xs text-[#888] font-medium">Practical</span>
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
