import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AuditData, getAllAudits, deriveScore } from "@/lib/audit-data";
import { ArrowLeft, Trash2, Eye, X, User, Building2, Target, BarChart3, FileText } from "lucide-react";
import { format } from "date-fns";
import { AuditReport } from "@/components/AuditReport";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin Dashboard — PerpeX" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminDashboard,
});

type StoredAudit = AuditData & { id: string; timestamp: string };

const TABS = [
  { key: "contact", label: "Contact", icon: User },
  { key: "business", label: "Business", icon: Building2 },
  { key: "goals", label: "Goals", icon: Target },
  { key: "gaps", label: "Gaps", icon: BarChart3 },
  { key: "report", label: "Report", icon: FileText },
] as const;

type TabKey = (typeof TABS)[number]["key"];

function GapBar({ label, count, max = 4 }: { label: string; count: number; max?: number }) {
  const pct = Math.round((count / max) * 100);
  const color =
    pct >= 75 ? "bg-red-500" : pct >= 50 ? "bg-amber-500" : pct >= 25 ? "bg-yellow-400" : "bg-emerald-500";
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm font-medium text-foreground">{label}</span>
        <span className="text-xs text-muted-foreground">{count}/{max} gaps</span>
      </div>
      <div className="h-2 w-full rounded-full bg-accent overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-700 ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function AuditModal({ audit, onClose }: { audit: StoredAudit; onClose: () => void }) {
  const [tab, setTab] = useState<TabKey>("contact");
  const { score, severities, total } = deriveScore(audit);

  const gapGroups = [
    { key: "sales" as const, label: "Sales Gap", items: audit.sales || [] },
    { key: "marketing" as const, label: "Marketing Gap", items: audit.marketing || [] },
    { key: "operations" as const, label: "Operations Gap", items: audit.operations || [] },
    { key: "hiring" as const, label: "Hiring Gap", items: audit.hiring || [] },
    { key: "growth" as const, label: "Growth & Leadership Gap", items: audit.growth || [] },
  ];

  const scoreColor = score >= 70 ? "text-emerald-500" : score >= 50 ? "text-amber-500" : "text-red-500";
  const scoreLabel = score >= 70 ? "Healthy" : score >= 50 ? "Moderate Risk" : "High Risk";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="relative w-full max-w-3xl max-h-[90vh] flex flex-col rounded-3xl border border-border bg-card shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-start justify-between border-b border-border bg-accent/30 px-8 py-5">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-foreground">{audit.name || "Anonymous"}</h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              {audit.phone} · Submitted {format(new Date(audit.timestamp), "MMM d, yyyy 'at' h:mm a")}
            </p>
          </div>
          <button
            onClick={onClose}
            className="size-9 flex items-center justify-center rounded-xl bg-accent text-muted-foreground transition hover:text-foreground hover:bg-border"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border bg-card px-6 overflow-x-auto">
          {TABS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={[
                "flex items-center gap-2 px-4 py-3.5 text-sm font-medium whitespace-nowrap border-b-2 transition",
                tab === key
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              ].join(" ")}
            >
              <Icon className="size-4" />
              {label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto px-8 py-6">
          {tab === "contact" && (
            <div className="grid gap-4">
              <InfoRow label="Full Name" value={audit.name || "—"} />
              <InfoRow label="Phone / WhatsApp" value={audit.phone || "—"} />
              <InfoRow label="Submitted At" value={format(new Date(audit.timestamp), "MMMM d, yyyy 'at' h:mm a")} />
            </div>
          )}

          {tab === "business" && (
            <div className="grid gap-4">
              <InfoRow label="Industry" value={audit.industry || "—"} />
              <InfoRow label="Team Size" value={audit.teamSize || "—"} />
              <InfoRow label="Monthly Revenue" value={audit.revenue || "—"} />
              <InfoRow label="Revenue Target (12 mo)" value={audit.target || "—"} />
            </div>
          )}

          {tab === "goals" && (
            <div className="grid gap-4">
              <InfoRow label="Primary Growth Goal" value={audit.goal || "—"} />
              <InfoRow label="Revenue Target" value={audit.target || "—"} />
            </div>
          )}

          {tab === "gaps" && (
            <div className="grid gap-6">
              <div className="text-sm text-muted-foreground mb-2">
                {total} total gaps identified across {gapGroups.filter(g => g.items.length > 0).length} categories.
              </div>
              {gapGroups.map((g) => (
                <div key={g.key}>
                  <GapBar label={g.label} count={g.items.length} />
                  {g.items.length > 0 && (
                    <ul className="mt-2 space-y-1">
                      {g.items.map((item) => (
                        <li key={item} className="flex items-start gap-2 text-xs text-muted-foreground">
                          <span className="mt-1 size-1.5 rounded-full bg-primary shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          )}

          {tab === "report" && (
            <AuditReport data={audit} />
          )}
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 py-3 border-b border-border last:border-0">
      <span className="text-sm text-muted-foreground shrink-0 w-40">{label}</span>
      <span className="text-sm font-medium text-foreground text-right">{value}</span>
    </div>
  );
}

function AdminDashboard() {
  const [audits, setAudits] = useState<StoredAudit[]>([]);
  const [viewingAudit, setViewingAudit] = useState<StoredAudit | null>(null);

  useEffect(() => {
    setAudits(getAllAudits().reverse());
  }, []);

  const clearAudits = () => {
    if (confirm("Are you sure you want to delete all audit records? This cannot be undone.")) {
      localStorage.removeItem("perpex_all_audits");
      setAudits([]);
    }
  };

  const deleteAudit = (id: string) => {
    if (confirm("Delete this record?")) {
      const updated = audits.filter((a) => a.id !== id);
      localStorage.setItem("perpex_all_audits", JSON.stringify(updated.slice().reverse()));
      setAudits(updated);
    }
  };

  return (
    <div className="min-h-screen bg-hero pb-24">
      <div className="absolute inset-0 bg-grid pointer-events-none opacity-40" />

      {viewingAudit && (
        <AuditModal audit={viewingAudit} onClose={() => setViewingAudit(null)} />
      )}

      <header className="relative z-10 border-b border-border bg-card/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <Link to="/" className="inline-flex size-10 items-center justify-center rounded-xl bg-accent text-muted-foreground transition hover:text-foreground">
              <ArrowLeft className="size-5" />
            </Link>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Admin Dashboard</h1>
              <p className="text-sm text-muted-foreground">{audits.length} submission{audits.length !== 1 && "s"}</p>
            </div>
          </div>
          <button
            onClick={clearAudits}
            className="inline-flex items-center gap-2 rounded-lg bg-destructive/10 px-4 py-2 text-sm font-semibold text-destructive transition hover:bg-destructive hover:text-destructive-foreground"
          >
            <Trash2 className="size-4" />
            Clear All Data
          </button>
        </div>
      </header>

      <main className="relative z-10 mx-auto mt-10 max-w-7xl px-6">
        <div className="rounded-3xl border border-border bg-card shadow-card overflow-hidden">
          {audits.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 text-center">
              <div className="size-16 rounded-2xl bg-accent flex items-center justify-center mb-4">
                <svg className="size-8 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-foreground">No audits yet</h3>
              <p className="mt-1 text-sm text-muted-foreground max-w-sm">
                When users complete the lead magnet audit, their details will appear here.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-border bg-accent/50 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Contact</th>
                    <th className="px-6 py-4">Business Profile</th>
                    <th className="px-6 py-4">Goal</th>
                    <th className="px-6 py-4">Gaps</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {audits.map((audit) => {
                    const totalGaps =
                      (audit.sales?.length || 0) +
                      (audit.marketing?.length || 0) +
                      (audit.operations?.length || 0) +
                      (audit.hiring?.length || 0) +
                      (audit.growth?.length || 0);
                    const { score } = deriveScore(audit);
                    const scoreColor =
                      score >= 70 ? "bg-emerald-500/10 text-emerald-600" :
                      score >= 50 ? "bg-amber-500/10 text-amber-600" :
                      "bg-red-500/10 text-red-500";

                    return (
                      <tr key={audit.id} className="transition hover:bg-accent/20">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-medium text-foreground">{format(new Date(audit.timestamp), "MMM d, yyyy")}</div>
                          <div className="text-xs text-muted-foreground mt-0.5">{format(new Date(audit.timestamp), "h:mm a")}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-semibold text-foreground">{audit.name || "Unknown"}</div>
                          <div className="text-muted-foreground mt-0.5">{audit.phone || "No phone"}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-foreground">{audit.industry || "—"}</div>
                          <div className="text-xs text-muted-foreground mt-0.5">{audit.teamSize} · {audit.revenue}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-foreground truncate max-w-[180px]" title={audit.goal}>{audit.goal || "—"}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${scoreColor}`}>
                            Score {score} · {totalGaps} gap{totalGaps !== 1 && "s"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => setViewingAudit(audit)}
                              className="inline-flex items-center gap-1.5 rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary transition hover:bg-primary hover:text-primary-foreground"
                              title="View full report"
                            >
                              <Eye className="size-3.5" />
                              View
                            </button>
                            <button
                              onClick={() => deleteAudit(audit.id)}
                              className="size-8 flex items-center justify-center rounded-lg text-muted-foreground transition hover:text-destructive hover:bg-accent"
                              title="Delete record"
                            >
                              <Trash2 className="size-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
