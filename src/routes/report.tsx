import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  BadgeCheck,
  Building2,
  CalendarDays,
  Check,
  CircleDot,
  Compass,
  Download,
  Gauge,
  MessageCircle,
  Printer,
  Rocket,
  ShieldAlert,
  Sparkles,
  Target,
  TrendingUp,
  Wrench,
  X,
} from "lucide-react";
import { AuditData, GAP_GROUPS, GapKey, deriveScore, loadAudit } from "@/lib/audit-data";

export const Route = createFileRoute("/report")({
  head: () => ({
    meta: [
      { title: "Your Gap Analysis Report — PerpeX" },
      { name: "description", content: "Personalised business diagnostic report with leak estimates, gap severity and a 90-day roadmap." },
    ],
  }),
  component: ReportPage,
});

const REVENUE_MID: Record<string, number> = {
  "Below ₹1L/month": 75000,
  "₹1L–₹5L/month": 300000,
  "₹5L–₹25L/month": 1500000,
  "₹25L–₹1Cr/month": 6250000,
  "₹1Cr–₹5Cr/month": 30000000,
  "₹5Cr+/month": 75000000,
};

function fmtINR(n: number) {
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(1)}Cr`;
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
  if (n >= 1000) return `₹${Math.round(n / 1000)}K`;
  return `₹${n}`;
}

function ReportPage() {
  const navigate = useNavigate();
  const [data, setData] = useState<AuditData | null>(null);

  useEffect(() => {
    const d = loadAudit();
    if (!d.industry) {
      navigate({ to: "/audit" });
      return;
    }
    setData(d);
  }, [navigate]);

  const computed = useMemo(() => {
    if (!data) return null;
    const { score, severities, total } = deriveScore(data);
    const revenueMid = REVENUE_MID[data.revenue || ""] || 1500000;
    const leakLow = Math.round(revenueMid * 0.10);
    const leakHigh = Math.round(revenueMid * Math.min(0.30, 0.10 + total * 0.012));
    const leakPct = `${Math.round((leakLow / revenueMid) * 100)}–${Math.round((leakHigh / revenueMid) * 100)}%`;

    const groups: { key: GapKey; title: string; severity: number; leakLow: number; leakHigh: number; bullets: string[] }[] = (
      ["operations", "sales", "growth", "marketing", "hiring"] as GapKey[]
    ).map((k) => {
      const sev = severities[k];
      const w = sev / 100;
      return {
        key: k,
        title:
          k === "operations" ? "Operations Gap"
          : k === "sales" ? "Sales Systems"
          : k === "growth" ? "Scale Readiness"
          : k === "marketing" ? "Marketing & Brand"
          : "Hiring Systems",
        severity: sev,
        leakLow: Math.round(revenueMid * 0.04 * w),
        leakHigh: Math.round(revenueMid * 0.07 * w),
        bullets: data[k] || [],
      };
    });

    const tier = score >= 80 ? "Healthy" : score >= 60 ? "Stable" : score >= 40 ? "Significant Leakage" : "Critical";
    return { score, tier, leakLow, leakHigh, leakPct, groups };
  }, [data]);

  if (!data || !computed) return null;
  const { score, tier, leakLow, leakHigh, leakPct, groups } = computed;
  const reportId = `PGA-${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}${String(new Date().getDate()).padStart(2, "0")}-001`;
  const today = new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

  return (
    <div className="min-h-screen bg-secondary/40">
      {/* Top bar (no print) */}
      <header className="sticky top-0 z-20 border-b border-border bg-card/90 backdrop-blur print:hidden">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link to="/results" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground">
            <ArrowLeft className="size-4" /> Back to profile
          </Link>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium hover:bg-accent"
            >
              <Printer className="size-4" /> Print / PDF
            </button>
            <a
              href={`https://wa.me/919999999999?text=${encodeURIComponent(`Hi PerpeX, please book my strategy session. Report ${reportId}`)}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-gradient-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-elegant hover:translate-y-[-1px]"
            >
              <MessageCircle className="size-4" /> Book Strategy Call
            </a>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10">
        {/* Cover header */}
        <section className="overflow-hidden rounded-3xl border border-border bg-card shadow-card">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border bg-gradient-to-r from-accent/60 to-card px-8 py-5">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-xl bg-gradient-primary shadow-soft" />
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">PerpeX Gap Analysis™</div>
                <div className="text-xs text-muted-foreground">Confidential Business Diagnostic</div>
              </div>
            </div>
            <div className="text-right text-xs text-muted-foreground">
              <div className="flex items-center justify-end gap-1.5"><CalendarDays className="size-3.5" /> {today}</div>
              <div className="mt-0.5">Report ID: <span className="font-mono">{reportId}</span></div>
            </div>
          </div>

          <div className="grid gap-6 px-8 py-8 md:grid-cols-[1.4fr_1fr]">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Prepared for</div>
              <h1 className="mt-1 font-serif text-4xl font-bold leading-tight tracking-tight">
                {data.name || "Your Business"}
              </h1>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1"><Building2 className="size-3.5" /> {data.industry}</span>
                <Dot /> <span>{data.teamSize}</span>
                <Dot /> <span>{data.revenue}</span>
              </div>
              <div className="mt-5 grid gap-2 text-sm">
                <Row icon={<Target className="size-4 text-primary" />} k="Goal" v={data.goal || "—"} />
                <Row icon={<Rocket className="size-4 text-primary" />} k="Target" v={`${data.target} in ${data.timeline?.toLowerCase()}`} />
              </div>
            </div>

            <div className="grid gap-3">
              <div className={`rounded-2xl border p-5 ${sevTone(100 - score).cardCls}`}>
                <div className="flex items-center justify-between">
                  <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Business Health Score</div>
                  <Gauge className="size-4" style={{ color: sevTone(100 - score).fg }} />
                </div>
                <div className="mt-2 flex items-baseline gap-2">
                  <div className="font-serif text-5xl font-bold" style={{ color: sevTone(100 - score).fg }}>{score}</div>
                  <div className="text-sm text-muted-foreground">/100</div>
                </div>
                <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-card px-3 py-1 text-xs font-semibold" style={{ color: sevTone(100 - score).fg }}>
                  <ShieldAlert className="size-3.5" /> {tier}
                </div>
              </div>

              <div className={`rounded-2xl border p-5 ${sevTone(Math.min(100, Math.round((leakHigh / (leakHigh + leakLow || 1)) * 100) + 30)).cardCls}`}>
                <div className="flex items-center justify-between">
                  <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Est. Monthly Leakage</div>
                  <TrendingUp className="size-4 text-primary" />
                </div>
                <div className="mt-2 font-serif text-2xl font-bold">
                  {fmtINR(leakLow)} – {fmtINR(leakHigh)}
                </div>
                <div className="mt-1 text-xs text-muted-foreground">{leakPct} of monthly revenue</div>
              </div>
            </div>
          </div>
        </section>

        {/* Target Gap callout */}
        <section className="mt-6 rounded-3xl border border-border bg-gradient-to-br from-accent/60 to-card px-8 py-7 shadow-card">
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-card p-2 text-primary shadow-soft"><Compass className="size-5" /></div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Target Gap</div>
              <p className="mt-1 text-lg leading-snug">
                You're targeting <strong>{data.target}</strong>. Your current systems are built for <strong>{data.revenue}</strong>.
              </p>
              <p className="mt-1 text-sm text-muted-foreground">That gap doesn't close with effort — it closes with structure.</p>
            </div>
          </div>
        </section>

        {/* Critical gaps */}
        <section className="mt-6">
          <SectionTitle icon={<AlertTriangle className="size-4" />}>Critical Gaps Detected</SectionTitle>
          <div className="grid gap-3 md:grid-cols-3">
            {groups.slice(0, 3).map((g) => {
              const t = sevTone(g.severity);
              return (
                <div key={g.key} className={`rounded-2xl border p-5 shadow-card ${t.cardCls}`}>
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-semibold">{g.title}</div>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${t.pillCls}`}>
                      {t.label} · {g.severity}%
                    </span>
                  </div>
                  <ul className="mt-3 space-y-1.5 text-sm text-foreground/80">
                    {(g.bullets.length ? g.bullets : ["No critical signals"]).slice(0, 3).map((b) => (
                      <li key={b} className="flex items-start gap-2">
                        <CircleDot className="mt-0.5 size-3.5 shrink-0" style={{ color: t.fg }} />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </section>

        {/* Where you're bleeding */}
        <section className="mt-8">
          <SectionTitle icon={<TrendingUp className="size-4" />}>Where You're Bleeding</SectionTitle>
          <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-card">
            {groups.map((g, i) => {
              const t = sevTone(g.severity);
              return (
                <div key={g.key} className={`grid items-center gap-4 px-5 py-4 md:grid-cols-[1.6fr_1fr_2fr] ${i ? "border-t border-border" : ""}`}>
                  <div>
                    <div className="text-sm font-semibold">{g.title}</div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      {(g.bullets.length ? g.bullets : (GAP_GROUPS[g.key].options as readonly string[]).slice(0, 2) as unknown as string[]).join(" · ")}
                    </div>
                  </div>
                  <div className="text-sm font-semibold" style={{ color: t.fg }}>{fmtINR(g.leakLow)} – {fmtINR(g.leakHigh)}/mo</div>
                  <div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Severity · {t.label}</span>
                      <span className="font-semibold" style={{ color: t.fg }}>{g.severity}%</span>
                    </div>
                    <div className="mt-1 h-2 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${g.severity}%`, background: t.bar }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Snapshot table */}
        <section className="mt-8 grid gap-6 md:grid-cols-2">
          <div>
            <SectionTitle icon={<BadgeCheck className="size-4" />}>Brand & Website Snapshot</SectionTitle>
            <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-card">
              {[
                ["Clear value prop in 3 seconds", "Missing"],
                ["Customer testimonials / social proof", "Missing"],
                ["Trust signals (certs, logos)", "Partial"],
                ["WhatsApp / Call CTA on homepage", "Weak"],
                ["Mobile-responsive experience", "Good"],
                ["SSL / Secure site", "Good"],
              ].map(([k, s], i) => (
                <div key={k} className={`flex items-center justify-between gap-3 px-5 py-3 text-sm ${i ? "border-t border-border" : ""}`}>
                  <span>{k}</span>
                  <Status status={s as string} />
                </div>
              ))}
            </div>
          </div>

          <div>
            <SectionTitle icon={<Target className="size-4" />}>You vs Similar Businesses</SectionTitle>
            <div className="grid grid-cols-2 gap-3">
              {[
                ["Lead Follow-Up", "Weak", "Moderate"],
                ["Brand Trust Signals", "Low", "Strong"],
                ["Operational Systems", "Weak", "Moderate"],
                ["Online Visibility", "Average", "Strong"],
              ].map(([k, you, m]) => {
                const t = sevToneFromLabel(you);
                return (
                  <div key={k} className={`rounded-2xl border p-4 shadow-card ${t.cardCls}`}>
                    <div className="text-xs font-semibold text-muted-foreground">{k}</div>
                    <div className="mt-2 text-sm font-bold" style={{ color: t.fg }}>You: {you}</div>
                    <div className="text-xs text-muted-foreground">Market: {m}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Roadmap */}
        <section className="mt-8">
          <SectionTitle icon={<Rocket className="size-4" />}>Recommended Growth Roadmap</SectionTitle>
          <div className="grid gap-3 md:grid-cols-3">
            {[
              { p: "Phase 1", d: "Days 1–30", t: "Sales + Operations Stabilisation" },
              { p: "Phase 2", d: "Days 31–60", t: "Brand Positioning Improvement" },
              { p: "Phase 3", d: "Days 61–90", t: "Team Capability Scaling" },
            ].map((p) => (
              <div key={p.p} className="rounded-2xl border border-border bg-card p-5 shadow-card">
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">{p.p}</div>
                <div className="text-xs text-muted-foreground">{p.d}</div>
                <div className="mt-3 text-base font-semibold">{p.t}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Immediate actions */}
        <section className="mt-8">
          <SectionTitle icon={<Wrench className="size-4" />}>Immediate Actions — Next 30 Days</SectionTitle>
          <div className="space-y-3">
            {[
              { t: "Build a structured lead follow-up system", d: "Most deals die in follow-up, not in pitch. A simple CRM + 5-step sequence changes this.", i: "HIGH IMPACT" },
              { t: "Reduce founder dependency with one core SOP", d: "Document your most-repeated process. Frees 8–10 hours/week immediately.", i: "HIGH IMPACT" },
              { t: "Add trust signals to your website in 48 hours", d: "Add 3 testimonials + a clear CTA. Low effort, immediate conversion impact.", i: "MEDIUM" },
              { t: "Introduce weekly team KPI reviews", d: "15-minute Friday check-in. Creates accountability without micromanagement.", i: "MEDIUM" },
              { t: "Standardise inquiry handling process", d: "Same response, same speed, same follow-up — regardless of who picks up the lead.", i: "QUICK WIN" },
            ].map((a) => (
              <div key={a.t} className="flex items-start gap-4 rounded-2xl border border-border bg-card p-5 shadow-card">
                <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-xl bg-gradient-primary text-primary-foreground shadow-soft">
                  <Check className="size-4" />
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="text-base font-semibold">{a.t}</div>
                    <ImpactPill label={a.i} />
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{a.d}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="mt-10 overflow-hidden rounded-3xl border border-border bg-gradient-primary p-8 text-primary-foreground shadow-elegant">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] opacity-80">
                <Sparkles className="size-3.5" /> Next step
              </div>
              <h3 className="mt-2 font-serif text-3xl font-bold leading-tight">Your gaps are identified. Now let's close them.</h3>
              <p className="mt-2 max-w-xl text-sm opacity-90">
                The PerpeX team will walk you through your top 3 gaps in a free 30-minute strategy session.
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <a
                href={`https://wa.me/919999999999?text=${encodeURIComponent(`Hi PerpeX, book my strategy session. Report ${reportId}`)}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-card px-6 py-3 text-sm font-semibold text-primary shadow-soft hover:translate-y-[-1px]"
              >
                <MessageCircle className="size-4" /> WhatsApp the team
              </a>
              <button
                onClick={() => window.print()}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-primary-foreground/30 px-6 py-3 text-sm font-semibold hover:bg-primary-foreground/10"
              >
                <Download className="size-4" /> Save as PDF
              </button>
            </div>
          </div>
        </section>

        <p className="mx-auto mt-8 max-w-3xl text-center text-xs text-muted-foreground">
          PerpeX Gap Analysis™ is based on PerpeX's experience with 100+ SMBs. Leakage estimates are indicative and benchmarked against industry data and self-reported revenue. Actual figures require a detailed audit. This report identifies direction, not precision.
        </p>
      </main>
    </div>
  );
}

function Dot() { return <span className="size-1 rounded-full bg-muted-foreground/50" />; }

function Row({ icon, k, v }: { icon: React.ReactNode; k: string; v: string }) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-border bg-secondary/40 px-3 py-2">
      {icon}
      <span className="text-xs uppercase tracking-wider text-muted-foreground">{k}</span>
      <span className="ml-auto font-medium">{v}</span>
    </div>
  );
}

function SectionTitle({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <h2 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-primary">
      {icon} {children}
    </h2>
  );
}

function Status({ status }: { status: string }) {
  const ok = status === "Good";
  const partial = status === "Partial";
  const tone = ok ? "text-success bg-success/10" : partial ? "text-warning bg-warning/10" : "text-destructive bg-destructive/10";
  const Icon = ok ? Check : partial ? CircleDot : X;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${tone}`}>
      <Icon className="size-3" /> {status}
    </span>
  );
}

function ImpactPill({ label }: { label: string }) {
  const tone =
    label === "HIGH IMPACT" ? "bg-destructive/10 text-destructive" :
    label === "MEDIUM" ? "bg-warning/15 text-[oklch(0.45_0.15_75)]" :
    "bg-success/15 text-[oklch(0.4_0.15_145)]";
  return <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wider ${tone}`}>{label}</span>;
}
