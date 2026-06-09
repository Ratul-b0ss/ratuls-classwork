"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { formatDate } from "@/lib/utils";

type Tab = "assignments" | "practicals" | "notices";

interface Item {
  id: string;
  title: string;
  description?: string;
  content?: string;
  subject?: string;
  dueDate?: string | null;
  date?: string | null;
  fileUrl?: string | null;
  fileName?: string | null;
  createdAt: string;
}

export default function AdminDashboardPage() {
  const { data: session, status } = useSession();
  const [activeTab, setActiveTab] = useState<Tab>("assignments");
  const [items, setItems] = useState<Item[]>([]);
  const [tabCounts, setTabCounts] = useState<Record<Tab, number>>({
    assignments: 0,
    practicals: 0,
    notices: 0,
  });
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") redirect("/admin/login");
  }, [status]);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/${activeTab}`);
      const data = await res.json();
      setItems(data);
      // Update count for active tab
      setTabCounts((prev) => ({ ...prev, [activeTab]: Array.isArray(data) ? data.length : 0 }));
      // Also fetch counts for the other two tabs
      const otherTabs = (["assignments", "practicals", "notices"] as Tab[]).filter((t) => t !== activeTab);
      const results = await Promise.allSettled(
        otherTabs.map(async (tab) => {
          const r = await fetch(`/api/${tab}`);
          const d = await r.json();
          return { tab, count: Array.isArray(d) ? d.length : 0 };
        })
      );
      const countUpdates: Partial<Record<Tab, number>> = {};
      for (const result of results) {
        if (result.status === "fulfilled") countUpdates[result.value.tab] = result.value.count;
      }
      setTabCounts((prev) => ({ ...prev, ...countUpdates }));
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === "authenticated") fetchItems();
  }, [status, activeTab]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-sm text-[#555]">Loading...</p>
      </div>
    );
  }

  const tabColors: Record<Tab, string> = {
    assignments: "text-[#999]",
    practicals: "text-[#888]",
    notices: "text-[#bbb]",
  };

  const tabLabels: Record<Tab, string> = {
    assignments: "Assignments",
    practicals: "Practicals",
    notices: "Notices",
  };

  const resetForm = () => {
    setFormData({});
    setSelectedFile(null);
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (item: Item) => {
    setFormData({
      title: item.title || "",
      description: item.description || item.content || "",
      subject: item.subject || "",
      dueDate: item.dueDate || "",
      date: item.date || "",
      content: item.content || "",
      fileUrl: item.fileUrl || "",
      fileName: item.fileName || "",
    });
    setEditingId(item.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this item?")) return;
    setDeleting(id);
    try {
      await fetch(`/api/${activeTab}?id=${id}`, { method: "DELETE" });
      await fetchItems();
    } catch {
      // ignore
    } finally {
      setDeleting(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    let fileUrl = formData.fileUrl || "";
    let fileName = formData.fileName || "";

    if (selectedFile) {
      const uploadData = new FormData();
      uploadData.append("file", selectedFile);
      const uploadRes = await fetch("/api/upload", { method: "POST", body: uploadData });
      if (uploadRes.ok) {
        const result = await uploadRes.json();
        fileUrl = result.url;
        fileName = result.fileName;
      }
    }

    const body: Record<string, string> = { ...formData, fileUrl, fileName };
    if (activeTab === "notices") {
      delete body.subject;
      delete body.dueDate;
      delete body.fileUrl;
      delete body.fileName;
      delete body.description;
    } else {
      delete body.date;
      delete body.content;
    }

    try {
      const method = editingId ? "PATCH" : "POST";
      const url = editingId ? `/api/${activeTab}?id=${editingId}` : `/api/${activeTab}`;
      await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      resetForm();
      await fetchItems();
    } catch {
      // ignore
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className={`text-sm font-medium tracking-wide uppercase ${tabColors[activeTab]}`}>
          {tabLabels[activeTab]}
        </h1>
        {!showForm && (
          <button onClick={() => { setShowForm(true); setEditingId(null); setFormData({}); }}
            className="btn-primary px-4 py-2 text-xs">
            + New
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-[#1a1a1a] pb-3">
        {(Object.keys(tabLabels) as Tab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => { setActiveTab(tab); setShowForm(false); }}
            className={`px-3 py-1.5 rounded text-xs font-medium cursor-pointer transition-colors ${
              activeTab === tab
                ? "bg-[#141414] text-white"
                : "text-[#555] hover:text-white hover:bg-[#141414]"
            }`}
          >
            {tabLabels[tab]}
            <span className="ml-1.5 text-[#555]">({tabCounts[tab]})</span>
          </button>
        ))}
      </div>

      {/* Form */}
      {showForm && (
        <div className="card-dark p-5 mb-6">
          <h2 className="text-sm font-medium text-white mb-4">
            {editingId ? "Edit" : "New"} {tabLabels[activeTab]}
          </h2>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="text-xs text-[#888] mb-1.5 block">Title</label>
              <input
                value={formData.title || ""}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                className="input-dark w-full h-9 px-3 text-sm"
              />
            </div>

            {activeTab !== "notices" && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-[#888] mb-1.5 block">Subject</label>
                  <input
                    value={formData.subject || ""}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    required
                    className="input-dark w-full h-9 px-3 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-[#888] mb-1.5 block">Due Date</label>
                  <input
                    type="date"
                    value={formData.dueDate || ""}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    className="input-dark w-full h-9 px-3 text-sm"
                  />
                </div>
              </div>
            )}

            {activeTab === "notices" && (
              <div>
                <label className="text-xs text-[#888] mb-1.5 block">Date</label>
                <input
                  type="date"
                  value={formData.date || ""}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="input-dark w-full h-9 px-3 text-sm"
                />
              </div>
            )}

            {activeTab !== "notices" && (
              <div>
                <label className="text-xs text-[#888] mb-1.5 block">
                  Attachment (PDF, image, etc.)
                </label>
                <input
                  type="file"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  className="w-full text-xs text-[#888] file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:bg-[#1a1a1a] file:text-white file:text-xs file:cursor-pointer"
                />
                {formData.fileName && !selectedFile && (
                  <p className="text-xs text-[#555] mt-1">Current: {formData.fileName}</p>
                )}
              </div>
            )}

            <div>
              <label className="text-xs text-[#888] mb-1.5 block">
                {activeTab === "notices" ? "Content" : "Description"}
              </label>
              <textarea
                value={activeTab === "notices" ? (formData.content || "") : (formData.description || "")}
                onChange={(e) => {
                  const key = activeTab === "notices" ? "content" : "description";
                  setFormData({ ...formData, [key]: e.target.value });
                }}
                required
                rows={4}
                className="input-dark w-full px-3 py-2 text-sm resize-vertical"
              />
            </div>

            <div className="flex gap-2 justify-end">
              <button type="button" onClick={resetForm}
                className="btn-ghost px-4 py-2 text-xs">
                Cancel
              </button>
              <button type="submit" disabled={saving}
                className="btn-primary px-4 py-2 text-xs disabled:opacity-50">
                {saving ? "Saving..." : editingId ? "Update" : "Create"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-sm text-[#666]">Loading...</p>
        </div>
      ) : items.length === 0 && !showForm ? (
        <div className="card-dark p-8 text-center">
          <p className="text-sm text-[#666]">No {tabLabels[activeTab].toLowerCase()} yet.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {items.map((item) => (
            <div key={item.id} className="card-dark p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs font-medium ${tabColors[activeTab]}`}>
                      {tabLabels[activeTab].slice(0, -1)}
                    </span>
                    <span className="text-xs text-[#555]">&middot;</span>
                    <span className="text-xs text-[#555]">{formatDate(item.createdAt)}</span>
                    {item.dueDate && (
                      <>
                        <span className="text-xs text-[#555]">&middot;</span>
                        <span className="text-xs text-[#888]">Due: {formatDate(item.dueDate)}</span>
                      </>
                    )}
                  </div>
                  <h3 className="text-sm font-medium text-white">{item.title}</h3>
                  <p className="text-xs text-[#777] mt-1 line-clamp-2">
                    {item.description || item.content}
                  </p>
                  {(item.subject || item.fileName) && (
                    <div className="flex items-center gap-2 mt-2">
                      {item.subject && (
                        <span className="text-xs px-2 py-0.5 rounded bg-[#141414] text-[#777]">{item.subject}</span>
                      )}
                      {item.fileName && (
                        <span className="text-xs text-[#555]">📎 {item.fileName}</span>
                      )}
                    </div>
                  )}
                </div>
                <div className="flex gap-1.5 shrink-0">
                  <button onClick={() => handleEdit(item)}
                    className="btn-ghost px-2.5 py-1.5 text-xs">
                    Edit
                  </button>
                  <button onClick={() => handleDelete(item.id)} disabled={deleting === item.id}
                    className="btn-ghost px-2.5 py-1.5 text-xs border-[#555]/30 text-[#888] hover:bg-[#555]/10 disabled:opacity-50">
                    {deleting === item.id ? "..." : "Delete"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
