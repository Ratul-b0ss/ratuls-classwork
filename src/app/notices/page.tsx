import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import type { Notice } from "@prisma/client";

export const dynamic = "force-dynamic";

export default async function NoticesPage() {
  const notices: Notice[] = await prisma.notice.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-sm font-medium text-[#bbb] tracking-wide uppercase">Notices</h1>
        <span className="text-xs text-[#555]">{notices.length} total</span>
      </div>

      {notices.length === 0 ? (
        <div className="card-dark p-8 text-center">
          <p className="text-sm text-[#555]">No notices posted yet.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {notices.map((n) => (
            <div key={n.id} id={n.id} className="card-dark p-4">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-xs text-[#bbb] font-medium">Notice</span>
                <span className="text-xs text-[#555]">&middot;</span>
                <span className="text-xs text-[#555]">
                  {n.date ? formatDate(n.date) : formatDate(n.createdAt)}
                </span>
              </div>
              <h2 className="text-sm font-medium text-white mb-1.5">{n.title}</h2>
              <div className="text-xs text-[#777] whitespace-pre-wrap leading-relaxed">
                {n.content}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
