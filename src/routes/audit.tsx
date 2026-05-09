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
  | { key: "industry"; type: "dropdown"; title: string; subtitle?: string; options: readonly string[]; field: keyof AuditData }
  | { key: "team"; type: "single"; title: string; options: readonly string[]; field: keyof AuditData; cols?: number }
  | { key: "revenue"; type: "single"; title: string; options: readonly string[]; field: keyof AuditData; cols?: number }
  | { key: "target"; type: "single"; title: string; options: readonly string[]; field: keyof AuditData; cols?: number }
  | { key: "timeline"; type: "single"; title: string; options: readonly string[]; field: keyof AuditData; cols?: number }
  | { key: "goal"; type: "single"; title: string; options: readonly string[]; field: keyof AuditData; cols?: number }
  | { key: GapKey; type: "multi"; title: string; subtitle?: string; options: readonly string[]; field: GapKey; cols?: number }
  | { key: "contact"; type: "contact"; title: string; subtitle?: string };

const STEPS: Step[] = [
  { key: "industry", type: "dropdown", title: "What industry are you in?", options: INDUSTRIES, field: "industry" },
  { key: "team", type: "single", title: "How big is your team?", options: TEAM_SIZES, field: "teamSize", cols: 2 },
  { key: "revenue", type: "single", title: "Current monthly revenue?", options: REVENUES, field: "revenue", cols: 2 },
  { key: "target", type: "single", title: "Revenue target in next 12 months?", options: TARGETS, field: "target", cols: 2 },
  { key: "goal", type: "single", title: "Primary growth goal?", options: GOALS, field: "goal", cols: 3 },
  { key: "sales", type: "multi", title: "Sales gap", subtitle: "Pick the ones that apply (min. 1)", options: GAP_GROUPS.sales.options, field: "sales", cols: 2 },
  { key: "marketing", type: "multi", title: "Marketing gap", subtitle: "Pick the ones that apply (min. 1)", options: GAP_GROUPS.marketing.options, field: "marketing", cols: 2 },
  { key: "operations", type: "multi", title: "Operations gap", subtitle: "Pick the ones that apply (min. 1)", options: GAP_GROUPS.operations.options, field: "operations", cols: 2 },
  { key: "hiring", type: "multi", title: "Hiring gap", subtitle: "Pick the ones that apply (min. 1)", options: GAP_GROUPS.hiring.options, field: "hiring", cols: 2 },
  { key: "growth", type: "multi", title: "Growth & leadership gap", subtitle: "Pick the ones that apply (min. 1)", options: GAP_GROUPS.growth.options, field: "growth", cols: 2 },
  { key: "contact", type: "contact", title: "Where should we send your report?", subtitle: "Just two quick details and your audit is ready." },
];

function AuditPage() {
  const navigate = useNavigate();
  const [stepIdx, setStepIdx] = useState(0);
  const [data, setData] = useState<AuditData>({});
  const step = STEPS[stepIdx];
  const progress = ((stepIdx + 1) / STEPS.length) * 100;

  const canContinue = useMemo(() => {
    if (step.type === "single" || step.type === "dropdown") return Boolean(data[step.field]);
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
    <div className="relative min-h-screen overflow-x-hidden bg-hero">
      <div className="absolute inset-0 bg-grid pointer-events-none opacity-60" />
      {/* Decorative blobs – clipped so they don't scroll on mobile */}
      <div className="pointer-events-none absolute -top-20 -left-20 size-[300px] rounded-full bg-primary/5 blur-3xl sm:size-[500px] sm:-top-32 sm:-left-32" />
      <div className="pointer-events-none absolute -bottom-20 -right-20 size-[250px] rounded-full bg-primary/8 blur-3xl sm:size-[400px] sm:-bottom-32 sm:-right-32" />

      <header className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 sm:py-5">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="size-8 rounded-xl bg-gradient-primary shadow-soft transition group-hover:shadow-elegant" />
          <span className="font-bold tracking-tight text-foreground">PerpeX</span>
        </Link>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 rounded-full border border-border bg-card/70 px-3 py-1 text-[10px] font-semibold text-muted-foreground backdrop-blur shadow-soft sm:px-4 sm:py-1.5 sm:text-xs">
            <span className="size-1.5 rounded-full bg-primary animate-pulse" />
            {stepIdx + 1} / {STEPS.length}
          </div>
        </div>
      </header>

      {/* Progress bar */}
      <div className="relative z-10 mx-auto max-w-2xl px-4 sm:px-6">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-primary/70">{Math.round(progress)}% complete</span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted/60 sm:h-2">
          <div
            className="h-full rounded-full bg-gradient-primary transition-[width] duration-700 ease-out shadow-[0_0_8px_0_var(--primary)]"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <main className="relative z-10 mx-auto max-w-2xl px-4 pb-16 pt-5 sm:px-6 sm:pb-24 sm:pt-8">
        <div className="rounded-2xl border border-border/60 bg-card/95 p-5 shadow-[0_8px_48px_-12px_rgba(0,0,0,0.18)] backdrop-blur sm:rounded-3xl sm:p-8 md:p-10">

          {/* Step badge */}
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/8 px-4 py-1.5">
            <span className="size-1.5 rounded-full bg-primary" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
              {step.type === "multi" ? "Gap Detection" : step.type === "contact" ? "Almost Done" : "About Your Business"}
            </span>
          </div>

          <h1 className="font-serif text-2xl font-bold leading-tight tracking-tight sm:text-3xl md:text-4xl text-gradient-primary">{step.title}</h1>
          {"subtitle" in step && step.subtitle && (
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{step.subtitle}</p>
          )}

          <div className="my-4 h-px w-full bg-gradient-to-r from-primary/20 via-border to-transparent sm:my-6" />

          <div>
            {step.type === "single" && (
              <div className={["grid gap-2.5", step.cols === 3 ? "grid-cols-2 sm:grid-cols-3" : step.cols === 2 ? "grid-cols-2" : "grid-cols-1"].join(" ")}>
                {step.options.map((opt) => {
                  const selected = data[step.field] === opt;
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setData((d) => ({ ...d, [step.field]: opt }))}
                      className={[
                        "group relative flex items-center justify-between rounded-xl border px-4 py-3.5 text-left text-sm font-medium transition-all duration-200 sm:rounded-2xl sm:px-5 sm:py-4",
                        selected
                          ? "border-primary bg-gradient-to-br from-primary/10 to-primary/5 text-foreground shadow-[0_0_0_2px_var(--primary)] scale-[1.01]"
                          : "border-border bg-card hover:border-primary/50 hover:bg-accent/50 hover:scale-[1.005] hover:shadow-soft",
                      ].join(" ")}
                    >
                      <span className={selected ? "font-semibold" : ""}>{opt}</span>
                      <span
                        className={[
                          "ml-3 flex size-5 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-200",
                          selected ? "border-primary bg-gradient-primary text-primary-foreground shadow-soft scale-110" : "border-border/60 bg-muted/30",
                        ].join(" ")}
                      >
                        {selected && <Check className="size-3" strokeWidth={3} />}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            {step.type === "dropdown" && (
              <div className="grid gap-4">
                <div className="relative">
                  <select
                    value={(data[step.field] as string) || ""}
                    onChange={(e) => setData((d) => ({ ...d, [step.field]: e.target.value }))}
                    className="w-full appearance-none rounded-2xl border border-border bg-card px-5 py-4 text-sm font-medium text-foreground outline-none transition focus:border-primary focus:shadow-[0_0_0_3px_color-mix(in_srgb,var(--primary)_15%,transparent)] focus:ring-0 cursor-pointer"
                  >
                    <option value="" disabled>Select your industry…</option>
                    {step.options.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-5 flex items-center">
                    <svg className="size-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg>
                  </div>
                </div>
              </div>
            )}

            {step.type === "multi" && (
              <div className={["grid gap-2.5", step.cols === 3 ? "grid-cols-2 sm:grid-cols-3" : step.cols === 2 ? "grid-cols-2" : "grid-cols-1"].join(" ")}>
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
                        "flex items-center gap-3 rounded-xl border px-4 py-3.5 text-left text-sm font-medium transition-all duration-200 sm:rounded-2xl sm:px-5 sm:py-4",
                        selected
                          ? "border-primary bg-gradient-to-br from-primary/10 to-primary/5 shadow-[0_0_0_2px_var(--primary)] scale-[1.01]"
                          : "border-border bg-card hover:border-primary/50 hover:bg-accent/50 hover:shadow-soft",
                      ].join(" ")}
                    >
                      <span
                        className={[
                          "flex size-5 shrink-0 items-center justify-center rounded-md border-2 transition-all duration-200",
                          selected ? "border-primary bg-gradient-primary text-primary-foreground shadow-soft scale-110" : "border-border/60 bg-muted/30",
                        ].join(" ")}
                      >
                        {selected && <Check className="size-3" strokeWidth={3} />}
                      </span>
                      <span className={selected ? "font-semibold" : ""}>{opt}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {step.type === "contact" && (
              <div className="grid gap-5">
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
                <div className="flex items-start gap-2 rounded-2xl border border-border/60 bg-accent/30 px-4 py-3">
                  <span className="mt-0.5 size-4 shrink-0 rounded-full bg-primary/20 flex items-center justify-center">
                    <span className="size-1.5 rounded-full bg-primary" />
                  </span>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    We'll only use this to deliver your personalised report. No spam, ever.
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="mt-6 flex items-center justify-between gap-3 border-t border-border/50 pt-5 sm:mt-8 sm:pt-6">
            <button
              type="button"
              onClick={back}
              disabled={stepIdx === 0}
              className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-2.5 text-sm font-medium text-muted-foreground transition hover:bg-accent hover:text-foreground disabled:cursor-not-allowed disabled:opacity-30"
            >
              <ArrowLeft className="size-4" /> Back
            </button>

            <button
              type="button"
              onClick={next}
              disabled={!canContinue}
              className="inline-flex items-center gap-2 rounded-full bg-gradient-primary px-8 py-3 text-sm font-semibold text-primary-foreground shadow-elegant transition hover:translate-y-[-2px] hover:shadow-[0_16px_40px_-12px_var(--primary)] disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none disabled:translate-y-0"
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
    <label className="block group">
      <span className="mb-2 block text-sm font-semibold text-foreground">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-2xl border border-border bg-card px-5 py-3.5 text-sm outline-none transition placeholder:text-muted-foreground/50 focus:border-primary focus:shadow-[0_0_0_3px_color-mix(in_srgb,var(--primary)_15%,transparent)] focus:ring-0"
      />
    </label>
  );
}

