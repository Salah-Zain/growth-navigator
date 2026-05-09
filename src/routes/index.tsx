import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "PerpeX Gap Analysis — Stop the Silent Profit Leaks" },
      { name: "description", content: "Find where your business is leaking revenue in 2 minutes. Free diagnostic + personalised fix plan." },
      { property: "og:title", content: "PerpeX Gap Analysis — Stop the Silent Profit Leaks" },
      { property: "og:description", content: "2-minute diagnostic. 7 leak areas. Free, no card." },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-hero">
      <div className="absolute inset-0 bg-grid pointer-events-none" />
      <span className="floating-dot animate-float-y" style={{ top: "18%", left: "12%" }} />
      <span className="floating-dot animate-float-y" style={{ top: "32%", right: "10%", animationDelay: "1.2s" }} />
      <span className="floating-dot animate-float-y" style={{ bottom: "22%", left: "18%", animationDelay: "2s" }} />
      <span className="floating-dot animate-float-y" style={{ bottom: "30%", right: "22%", animationDelay: "0.6s" }} />

      <header className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2">
          <div className="size-8 rounded-lg bg-gradient-primary shadow-soft" />
          <span className="font-semibold tracking-tight">PerpeX</span>
        </div>
        <Link
          to="/audit"
          className="hidden rounded-full border border-border bg-card/70 px-5 py-2 text-sm font-medium text-foreground backdrop-blur transition hover:bg-card md:inline-flex"
        >
          Start Audit
        </Link>
      </header>

      <main className="relative z-10 mx-auto flex min-h-[calc(100vh-96px)] max-w-5xl flex-col items-center justify-center px-6 pb-24 pt-10 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/80 px-5 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-primary shadow-soft backdrop-blur">
          <span className="size-1.5 rounded-full bg-primary-glow" />
          Free Business Audit
        </div>

        <h1 className="mt-8 font-serif text-5xl font-bold leading-[1.05] tracking-tight text-foreground md:text-7xl">
          Stop the Silent <span className="italic text-gradient-primary">Profit Leaks</span> Draining Your Business
        </h1>

        <p className="mx-auto mt-7 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
          Most businesses lose 10–30% of revenue to invisible inefficiencies. Our 2-minute diagnostic finds exactly where — and gives you the fix plan, free.
        </p>

        <Link
          to="/audit"
          className="group mt-10 inline-flex items-center gap-2 rounded-full bg-gradient-primary px-8 py-4 text-base font-semibold text-primary-foreground shadow-elegant transition hover:translate-y-[-1px] hover:shadow-[0_24px_60px_-20px_var(--primary)]"
        >
          Start My Free Audit
          <ArrowRight className="size-5 transition-transform group-hover:translate-x-1" />
        </Link>

        <div className="mt-16 grid grid-cols-3 gap-8 md:gap-16">
          <Stat value="7" label="Leak Areas Covered" />
          <Stat value="2min" label="To Complete" />
          <Stat value="Free" label="Always, No Card" />
        </div>
      </main>
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center">
      <div className="font-serif text-4xl font-bold text-gradient-primary md:text-5xl">{value}</div>
      <div className="mt-1 text-xs text-muted-foreground md:text-sm">{label}</div>
    </div>
  );
}
