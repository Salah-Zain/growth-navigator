import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import {
  AuditData,
  GAP_GROUPS,
  GOALS,
  GapKey,
  INDUSTRIES,
  REVENUES,
  TARGETS,
  TEAM_SIZES,
  TIMELINES,
  saveAudit,
} from "@/lib/audit-data";

export const Route = createFileRoute("/audit")({
  head: () => ({
    meta: [
      { title: "Free Business Audit — PerpeX" },
      { name: "description", content: "2-minute diagnostic to uncover where your business is leaking revenue." },
    ],
  }),
  component: AuditPage,
});

type Step =
  | { key: "industry"; type: "single"; title: string; subtitle?: string; options: readonly string[]; field: keyof AuditData }
  | { key: "team"; type: "single"; title: string; options: readonly string[]; field: keyof AuditData }
  | { key: "revenue"; type: "single"; title: string; options: readonly string[]; field: keyof AuditData }
  | { key: "target"; type: "single"; title: string; options: readonly string[]; field: keyof AuditData }
  | { key: "timeline"; type: "single"; title: string; options: readonly string[]; field: keyof AuditData }
  | { key: "goal"; type: "single"; title: string; options: readonly string[]; field: keyof AuditData }
  | { key: GapKey; type: "multi"; title: string; subtitle?: string; options: readonly string[]; field: GapKey }
  | { key: "contact"; type: "contact"; title: string; subtitle?: string };

const STEPS: Step[] = [
  { key: "industry", type: "single", title: "What industry are you in?", options: INDUSTRIES, field: "industry" },
  { key: "team", type: "single", title: "How big is your team?", options: TEAM_SIZES, field: "teamSize" },
  { key: "revenue", type: "single", title: "Current monthly revenue?", options: REVENUES, field: "revenue" },
  { key: "target", type: "single", title: "Revenue target in next 12 months?", options: TARGETS, field: "target" },
  { key: "timeline", type: "single", title: "Your growth timeline?", options: TIMELINES, field: "timeline" },
  { key: "goal", type: "single", title: "Primary growth goal?", options: GOALS, field: "goal" },
  { key: "sales", type: "multi", title: "Sales gap", subtitle: "Pick the ones that apply (min. 1)", options: GAP_GROUPS.sales.options, field: "sales" },
  { key: "marketing", type: "multi", title: "Marketing gap", subtitle: "Pick the ones that apply (min. 1)", options: GAP_GROUPS.marketing.options, field: "marketing" },
  { key: "operations", type: "multi", title: "Operations gap", subtitle: "Pick the ones that apply (min. 1)", options: GAP_GROUPS.operations.options, field: "operations" },
  { key: "hiring", type: "multi", title: "Hiring gap", subtitle: "Pick the ones that apply (min. 1)", options: GAP_GROUPS.hiring.options, field: "hiring" },
  { key: "growth", type: "multi", title: "Growth & leadership gap", subtitle: "Pick the ones that apply (min. 1)", options: GAP_GROUPS.growth.options, field: "growth" },
  { key: "contact", type: "contact", title: "Where should we send your report?", subtitle: "Just two quick details and your audit is ready." },
];

function AuditPage() {
  const navigate = useNavigate();
  const [stepIdx, setStepIdx] = useState(0);
  const [data, setData] = useState<AuditData>({});
  const step = STEPS[stepIdx];
  const progress = ((stepIdx + 1) / STEPS.length) * 100;

  const canContinue = useMemo(() => {
    if (step.type === "single") return Boolean(data[step.field]);
    if (step.type === "multi") {
      const v = data[step.field] as string[] | undefined;
      return Boolean(v && v.length > 0);
    }
    if (step.type === "contact") {
      return Boolean(data.name && data.name.trim().length >= 2 && data.phone && data.phone.replace(/\D/g, "").length >= 7);
    }
    return false;
  }, [step, data]);

  const next = () => {
    if (!canContinue) return;
    if (stepIdx === STEPS.length - 1) {
      saveAudit(data);
      navigate({ to: "/results" });
      return;
    }
    setStepIdx((i) => i + 1);
  };

  const back = () => setStepIdx((i) => Math.max(0, i - 1));

  return (
    <div className="relative min-h-screen bg-hero">
      <div className="absolute inset-0 bg-grid pointer-events-none opacity-60" />

      <header className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
        <Link to="/" className="flex items-center gap-2">
          <div className="size-8 rounded-lg bg-gradient-primary shadow-soft" />
          <span className="font-semibold tracking-tight">PerpeX</span>
        </Link>
        <div className="text-xs font-medium text-muted-foreground">
          Step {stepIdx + 1} <span className="opacity-50">/ {STEPS.length}</span>
        </div>
      </header>

      <div className="relative z-10 mx-auto max-w-2xl px-6">
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-gradient-primary transition-[width] duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <main className="relative z-10 mx-auto max-w-2xl px-6 pb-24 pt-10">
        <div className="rounded-3xl border border-border bg-card p-8 shadow-card md:p-10">
          <div className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            {step.type === "multi" ? "Gap detection" : step.type === "contact" ? "Almost done" : "About your business"}
          </div>
          <h1 className="font-serif text-3xl font-bold leading-tight tracking-tight md:text-4xl">{step.title}</h1>
          {"subtitle" in step && step.subtitle && (
            <p className="mt-2 text-sm text-muted-foreground">{step.subtitle}</p>
          )}

          <div className="mt-8">
            {step.type === "single" && (
              <div className="grid gap-2.5">
                {step.options.map((opt) => {
                  const selected = data[step.field] === opt;
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setData((d) => ({ ...d, [step.field]: opt }))}
                      className={[
                        "group flex items-center justify-between rounded-2xl border px-5 py-4 text-left text-sm font-medium transition",
                        selected
                          ? "border-primary bg-accent text-foreground shadow-soft"
                          : "border-border bg-card hover:border-primary/40 hover:bg-accent/40",
                      ].join(" ")}
                    >
                      <span>{opt}</span>
                      <span
                        className={[
                          "flex size-5 items-center justify-center rounded-full border transition",
                          selected ? "border-primary bg-gradient-primary text-primary-foreground" : "border-border bg-card",
                        ].join(" ")}
                      >
                        {selected && <Check className="size-3" />}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            {step.type === "multi" && (
              <div className="grid gap-2.5">
                {step.options.map((opt) => {
                  const arr = (data[step.field] as string[] | undefined) || [];
                  const selected = arr.includes(opt);
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() =>
                        setData((d) => {
                          const cur = (d[step.field] as string[] | undefined) || [];
                          const newArr = cur.includes(opt) ? cur.filter((x) => x !== opt) : [...cur, opt];
                          return { ...d, [step.field]: newArr };
                        })
                      }
                      className={[
                        "flex items-center gap-3 rounded-2xl border px-5 py-4 text-left text-sm font-medium transition",
                        selected
                          ? "border-primary bg-accent shadow-soft"
                          : "border-border bg-card hover:border-primary/40 hover:bg-accent/40",
                      ].join(" ")}
                    >
                      <span
                        className={[
                          "flex size-5 items-center justify-center rounded-md border transition",
                          selected ? "border-primary bg-gradient-primary text-primary-foreground" : "border-border bg-card",
                        ].join(" ")}
                      >
                        {selected && <Check className="size-3.5" />}
                      </span>
                      <span>{opt}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {step.type === "contact" && (
              <div className="grid gap-4">
                <Field
                  label="Your name"
                  placeholder="e.g. Aarav Mehta"
                  value={data.name || ""}
                  onChange={(v) => setData((d) => ({ ...d, name: v }))}
                />
                <Field
                  label="Phone / WhatsApp number"
                  placeholder="+91 90000 00000"
                  type="tel"
                  value={data.phone || ""}
                  onChange={(v) => setData((d) => ({ ...d, phone: v }))}
                />
                <p className="text-xs text-muted-foreground">
                  We'll only use this to deliver your report. No spam, ever.
                </p>
              </div>
            )}
          </div>

          <div className="mt-10 flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={back}
              disabled={stepIdx === 0}
              className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-2.5 text-sm font-medium text-muted-foreground transition hover:bg-accent disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ArrowLeft className="size-4" /> Back
            </button>

            <button
              type="button"
              onClick={next}
              disabled={!canContinue}
              className="inline-flex items-center gap-2 rounded-full bg-gradient-primary px-7 py-3 text-sm font-semibold text-primary-foreground shadow-elegant transition hover:translate-y-[-1px] disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
            >
              {stepIdx === STEPS.length - 1 ? "See My Report" : stepIdx === STEPS.length - 2 ? "Submit" : "Continue"}
              <ArrowRight className="size-4" />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

function Field({
  label, value, onChange, placeholder, type = "text",
}: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-foreground">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-2xl border border-border bg-card px-5 py-3.5 text-sm outline-none transition placeholder:text-muted-foreground/70 focus:border-primary focus:ring-4 focus:ring-primary/15"
      />
    </label>
  );
}
