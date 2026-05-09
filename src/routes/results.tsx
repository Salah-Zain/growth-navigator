import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ChevronDown, Download, MessageCircle, PartyPopper, Sparkles, Target, Trophy, Users } from "lucide-react";
import { AuditData, GAP_GROUPS, GapKey, deriveScore, loadAudit } from "@/lib/audit-data";

export const Route = createFileRoute("/results")({
  head: () => ({
    meta: [
      { title: "Your Profile is Ready — PerpeX" },
      { name: "description", content: "Your business gap profile, severity scores and recommended next steps." },
    ],
  }),
  component: ResultsPage,
});

function tierFor(score: number) {
  if (score >= 80) return { label: "Optimizer Tier", tone: "Optimizer" };
  if (score >= 60) return { label: "Builder Tier", tone: "Builder" };
  if (score >= 40) return { label: "Explorer Tier", tone: "Explorer" };
  return { label: "Foundation Tier", tone: "Foundation" };
}

function topGap(d: AuditData): { key: GapKey; title: string } {
  const order: GapKey[] = ["operations", "sales", "growth", "marketing", "hiring"];
  let best: { key: GapKey; n: number } = { key: "operations", n: -1 };
  for (const k of order) {
    const n = d[k]?.length || 0;
    if (n > best.n) best = { key: k, n };
  }
  return { key: best.key, title: GAP_GROUPS[best.key].title };
}

function ResultsPage() {
  const navigate = useNavigate();
  const [data, setData] = useState<AuditData | null>(null);
  const [openExercises, setOpenExercises] = useState(false);

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
    const { score, severities } = deriveScore(data);
    const tier = tierFor(score);
    const gap = topGap(data);
    const risk = Math.min(100, severities.sales + 5);
    const emotion = Math.min(100, Math.round((severities.hiring + severities.marketing) / 2));
    const fn = Math.min(100, Math.round((severities.operations + severities.growth) / 2));
    const triggers = (data.operations || []).slice(0, 2).concat((data.sales || []).slice(0, 1)).slice(0, 3);
    const exercises = [
      "Build a 5-step lead follow-up sequence",
      "Document one core SOP this week",
      "Add 3 testimonials + clear CTA to homepage",
      "15-min Friday team KPI review",
    ];
    return { score, tier, gap, risk, emotion, fn, triggers, exercises };
  }, [data]);

  if (!data || !computed) return null;
  const { tier, gap, risk, emotion, fn, triggers, exercises } = computed;

  return (
    <div className="relative min-h-screen bg-hero">
      <div className="absolute inset-0 bg-grid pointer-events-none opacity-50" />

      <header className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
        <Link to="/" className="flex items-center gap-2">
          <div className="size-8 rounded-lg bg-gradient-primary shadow-soft" />
          <span className="font-semibold tracking-tight">PerpeX</span>
        </Link>
      </header>

      <main className="relative z-10 mx-auto max-w-xl px-5 pb-20 pt-2">
        <div className="flex flex-col items-center text-center">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-gradient-primary text-primary-foreground shadow-elegant">
            <Trophy className="size-7" />
          </div>
          <h1 className="mt-4 flex items-center gap-2 text-xl font-bold tracking-tight">
            Profile Ready! <PartyPopper className="size-5 text-primary-glow" />
          </h1>
        </div>

        <div className="mt-6 overflow-hidden rounded-3xl border border-border bg-card shadow-card">
          {/* Tier header */}
          <div className="bg-accent/60 px-6 pt-6 pb-7 text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-card px-4 py-1.5 text-xs font-semibold text-primary">
              <Sparkles className="size-3.5" /> {tier.label}
            </span>
            <h2 className="mt-3 text-xl font-bold leading-snug tracking-tight md:text-2xl">
              {gap.title} — Needs <span className="text-gradient-primary">{labelForFix(gap.key)}</span>
            </h2>
          </div>

          {/* Bars */}
          <div className="space-y-4 px-6 py-6">
            <Bar label="Risk" value={risk} tone="risk" />
            <Bar label="Emotion" value={emotion} tone="emotion" />
            <Bar label="Function" value={fn} tone="function" />
          </div>

          <div className="mx-6 rounded-2xl border border-border bg-accent/40 px-4 py-3 text-sm text-foreground">
            {insightFor(gap.key)}
          </div>

          {/* Triggers */}
          <div className="px-6 pt-6">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Target className="size-4 text-primary" /> Triggers
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {triggers.length === 0 && <span className="text-xs text-muted-foreground">No critical triggers detected.</span>}
              {triggers.map((t) => (
                <span key={t} className="rounded-full bg-accent px-3 py-1 text-xs font-medium text-primary">
                  {t}
                </span>
              ))}
            </div>
          </div>

          {/* Exercises */}
          <div className="px-6 pt-5">
            <button
              onClick={() => setOpenExercises((o) => !o)}
              className="flex w-full items-center justify-between rounded-2xl border border-border bg-card px-4 py-3 text-sm font-semibold transition hover:bg-accent/40"
            >
              <span className="flex items-center gap-2">
                <span className="text-primary">≡</span> Exercises ({exercises.length})
              </span>
              <ChevronDown className={`size-4 transition ${openExercises ? "rotate-180" : ""}`} />
            </button>
            {openExercises && (
              <ul className="mt-3 space-y-2">
                {exercises.map((e, i) => (
                  <li key={e} className="flex items-start gap-3 rounded-xl border border-border bg-accent/30 px-3 py-2.5 text-sm">
                    <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-gradient-primary text-[10px] font-bold text-primary-foreground">
                      {i + 1}
                    </span>
                    {e}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Actions */}
          <div className="space-y-3 px-6 py-6">
            <Link
              to="/report"
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-primary px-5 py-3.5 text-sm font-semibold text-primary-foreground shadow-elegant transition hover:translate-y-[-1px]"
            >
              <Download className="size-4" /> Report
            </Link>
            <a
              href={`https://wa.me/919999999999?text=${encodeURIComponent("Hi PerpeX, I just completed the Gap Analysis.")}`}
              target="_blank"
              rel="noreferrer"
              className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-foreground/90 bg-card px-5 py-3.5 text-sm font-semibold text-foreground transition hover:bg-accent/40"
            >
              <MessageCircle className="size-4" /> WhatsApp
            </a>
            <button
              type="button"
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-primary px-5 py-3.5 text-sm font-semibold text-primary-foreground shadow-elegant transition hover:translate-y-[-1px]"
            >
              <Users className="size-4" /> Community
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

function labelForFix(k: GapKey) {
  const map: Record<GapKey, string> = {
    sales: "Sales Discipline",
    marketing: "Brand Clarity",
    operations: "Organization Skills",
    hiring: "People Systems",
    growth: "Strategic Roadmap",
  };
  return map[k];
}

function insightFor(k: GapKey) {
  const map: Record<GapKey, string> = {
    sales: "Pipeline leaks dominate. A simple 5-step follow-up changes everything.",
    marketing: "Visibility is the bottleneck. Position first, then amplify.",
    operations: "Founder dependency is the main challenge. SOPs unlock 8–10 hrs/week.",
    hiring: "Onboarding gaps drive turnover. Standardize the first 30 days.",
    growth: "Lack of roadmap is stalling scale. Define a 90-day priority sprint.",
  };
  return map[k];
}

function Bar({ label, value, tone }: { label: string; value: number; tone: "risk" | "emotion" | "function" }) {
  const sev = value <= 33 ? "Low" : value <= 66 ? "Moderate" : "High";
  const color =
    tone === "function"
      ? "bg-[oklch(0.78_0.16_75)]"
      : value <= 33
        ? "bg-[oklch(0.7_0.18_145)]"
        : value <= 66
          ? "bg-[oklch(0.78_0.16_75)]"
          : "bg-[oklch(0.62_0.22_27)]";
  return (
    <div>
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-foreground/80">{label}</span>
        <span className="text-xs font-semibold text-foreground/70">
          {sev} ({value}%)
        </span>
      </div>
      <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-muted">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}
