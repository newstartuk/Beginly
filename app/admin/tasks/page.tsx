"use client";
import { useState } from "react";
import Link from "next/link";
import { SEED_TASKS } from "@/lib/seed-data";
import type { Task } from "@/types";
import { ChevronLeft, Shield, CheckCircle, XCircle, Pencil, X } from "lucide-react";
import Navigation from "@/components/Navigation";
import AdminGuard from "@/components/AdminGuard";

const PRIORITY_COLORS: Record<string, string> = {
  "Very High": "text-red-500 bg-red-50 border border-red-200",
  "High": "text-amber-600 bg-amber-50 border border-amber-200",
  "Medium": "text-blue-500 bg-blue-50 border border-blue-200",
  "Low": "text-muted bg-civic-50 border border-civic-200",
};

export default function AdminTasksPage() {
  const [tasks, setTasks] = useState<Task[]>(SEED_TASKS);
  const [editing, setEditing] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Task>>({});
  const [filter, setFilter] = useState<"ALL" | "active" | "inactive">("ALL");

  const filtered = tasks.filter((t) => {
    if (filter === "active") return t.active;
    if (filter === "inactive") return !t.active;
    return true;
  });

  const startEdit = (task: Task) => {
    setEditing(task.taskId);
    setEditForm({ ...task });
  };

  const saveEdit = () => {
    setTasks((prev) =>
      prev.map((t) => (t.taskId === editing ? { ...t, ...editForm } as Task : t))
    );
    setEditing(null);
  };

  return (
    <AdminGuard>
    <Navigation>
      <div className="max-w-6xl mx-auto space-y-4 animate-fade-in">
        <div className="flex items-center gap-3">
          <Link href="/admin" className="text-muted hover:text-primary transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <Shield className="w-5 h-5 text-primary" />
          <h1 className="text-xl font-bold text-navy">Task Manager</h1>
          <span className="text-xs text-muted ml-auto">{tasks.filter((t) => t.active).length} active · {tasks.filter((t) => !t.active).length} inactive</span>
        </div>

        {/* Filters */}
        <div className="flex gap-2">
          {(["ALL", "active", "inactive"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                filter === f ? "bg-primary text-white" : "bg-white text-muted border border-border"
              }`}
            >
              {f === "ALL" ? "All" : f === "active" ? "Active" : "Inactive"} ({tasks.filter((t) => f === "ALL" ? true : f === "active" ? t.active : !t.active).length})
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="card overflow-x-auto">
          <table className="w-full text-xs min-w-[700px]">
            <thead>
              <tr className="border-b border-border">
                {["ID", "Title", "Stage", "Category", "Priority", "Required", "AI", "Risk", "Active", "Actions"].map((h) => (
                  <th key={h} className="text-left py-2 px-2 text-muted font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((task) => (
                <tr key={task.taskId} className="border-b border-civic-50 last:border-0 hover:bg-civic-50/50">
                  <td className="py-2 px-2 font-mono text-muted whitespace-nowrap">{task.taskId}</td>
                  <td className="py-2 px-2 text-navy max-w-[180px]"><p className="truncate">{task.title}</p></td>
                  <td className="py-2 px-2 text-muted">{task.stage}</td>
                  <td className="py-2 px-2 text-muted">{task.category}</td>
                  <td className="py-2 px-2">
                    <span className={`px-2 py-0.5 rounded-full font-medium ${PRIORITY_COLORS[task.priority]}`}>
                      {task.priority}
                    </span>
                  </td>
                  <td className="py-2 px-2">{task.required ? <CheckCircle className="w-4 h-4 text-green-500" /> : <XCircle className="w-4 h-4 text-civic-200" />}</td>
                  <td className="py-2 px-2">{task.aiHelperAllowed ? <CheckCircle className="w-4 h-4 text-green-400" /> : <XCircle className="w-4 h-4 text-civic-200" />}</td>
                  <td className="py-2 px-2">{task.riskWarning ? <span className="text-amber-500">⚠</span> : <span className="text-civic-200">—</span>}</td>
                  <td className="py-2 px-2">{task.active ? <CheckCircle className="w-4 h-4 text-green-500" /> : <XCircle className="w-4 h-4 text-civic-200" />}</td>
                  <td className="py-2 px-2">
                    <button onClick={() => startEdit(task)} className="text-primary hover:underline">Edit</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Edit modal */}
        {editing && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-4 border-b border-border sticky top-0 bg-white">
                <h2 className="font-semibold text-navy">Edit Task</h2>
                <button onClick={() => setEditing(null)} className="btn-ghost p-1.5"><X className="w-4 h-4" /></button>
              </div>
              <div className="p-4 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  {["priority", "stage", "category"].map((field) => (
                    <div key={field}>
                      <label className="block text-xs font-medium text-navy mb-1 capitalize">{field}</label>
                      <select
                        value={(editForm as Record<string, unknown>)[field] as string ?? ""}
                        onChange={(e) => setEditForm((f) => ({ ...f, [field]: e.target.value }))}
                        className="select-field text-xs"
                      >
                        {field === "priority" && ["Very High", "High", "Medium", "Low"].map((p) => (
                          <option key={p} value={p}>{p}</option>
                        ))}
                        {field === "stage" && ["PRE", "D1", "D7", "D30", "D90", "GROW"].map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                        {field === "category" && [
                          "Documents", "Accommodation", "University", "Money", "Health",
                          "Transport", "Local Admin", "Work", "Safety", "Growth", "Local Life"
                        ].map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
                <div>
                  <label className="block text-xs font-medium text-navy mb-1">Guidance slug</label>
                  <input
                    value={editForm.guidanceSlug ?? ""}
                    onChange={(e) => setEditForm((f) => ({ ...f, guidanceSlug: e.target.value }))}
                    className="input-field text-xs"
                    placeholder="e.g. how-to-register-with-a-gp"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-navy mb-1">Risk warning</label>
                  <textarea
                    value={editForm.riskWarning ?? ""}
                    onChange={(e) => setEditForm((f) => ({ ...f, riskWarning: e.target.value }))}
                    className="input-field text-xs resize-none"
                    rows={2}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <label className="flex items-center gap-2 text-xs text-navy">
                    <input
                      type="checkbox"
                      checked={editForm.active ?? true}
                      onChange={(e) => setEditForm((f) => ({ ...f, active: e.target.checked }))}
                      className="accent-primary"
                    />
                    Active
                  </label>
                  <label className="flex items-center gap-2 text-xs text-navy">
                    <input
                      type="checkbox"
                      checked={editForm.required ?? true}
                      onChange={(e) => setEditForm((f) => ({ ...f, required: e.target.checked }))}
                      className="accent-primary"
                    />
                    Required
                  </label>
                </div>
              </div>
              <div className="flex gap-2 p-4 border-t border-border sticky bottom-0 bg-white">
                <button onClick={() => setEditing(null)} className="btn-ghost flex-1 justify-center">Cancel</button>
                <button onClick={saveEdit} className="btn-primary flex-1 justify-center">Save changes</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Navigation>
    </AdminGuard>
  );
}
