export type AuditData = {
  industry?: string;
  teamSize?: string;
  revenue?: string;
  target?: string;
  timeline?: string;
  goal?: string;
  sales?: string[];
  marketing?: string[];
  operations?: string[];
  hiring?: string[];
  growth?: string[];
  name?: string;
  phone?: string;
};

const KEY = "perpex_audit_data";

export function saveAudit(data: AuditData) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(KEY, JSON.stringify(data));
}

export function loadAudit(): AuditData {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(sessionStorage.getItem(KEY) || "{}");
  } catch {
    return {};
  }
}

export const INDUSTRIES = [
  "Construction & Real Estate",
  "Education & Training",
  "Retail & Distribution",
  "Healthcare & Wellness",
  "IT / Software / Tech",
  "Marketing & Creative Agency",
  "Manufacturing",
  "Hospitality & Food & Beverage",
  "E-commerce",
  "Professional Services",
  "Logistics & Transport",
  "Other",
];

export const TEAM_SIZES = ["Solo founder", "2–5 people", "6–15 people", "16–50 people", "50+ people"];
export const REVENUES = ["Below ₹1L/month", "₹1L–₹5L/month", "₹5L–₹25L/month", "₹25L–₹1Cr/month", "₹1Cr–₹5Cr/month", "₹5Cr+/month"];
export const TARGETS = ["Below ₹5L/month", "₹5L–₹15L/month", "₹15L–₹50L/month", "₹50L–₹1Cr/month", "₹1Cr–₹5Cr/month", "₹5Cr+/month"];
export const TIMELINES = ["Within 3 months", "Within 6 months", "Within 12 months", "1–2 years"];
export const GOALS = [
  "Increase sales and revenue",
  "Fix operations and reduce chaos",
  "Build a stronger brand",
  "Hire a better team",
  "Open a new branch",
  "Scale nationally",
  "Improve profitability",
  "Build systems and processes",
  "Raise investment",
];

export const GAP_GROUPS = {
  sales: { title: "Sales Gap", options: ["Inconsistent revenue", "Poor lead conversion", "No structured follow-up", "Low repeat business/referrals"] },
  marketing: { title: "Marketing Gap", options: ["Weak brand positioning", "Low visibility online", "Poor social media presence", "No reliable lead generation system"] },
  operations: { title: "Operations Gap", options: ["Founder handling too much personally", "No SOPs or systems", "Operational inefficiencies & delays", "Team communication gaps"] },
  hiring: { title: "Hiring Gap", options: ["Difficulty hiring quality talent", "High employee turnover", "Weak onboarding or hiring process", "Team lacks skills for next stage"] },
  growth: { title: "Growth & Leadership Gap", options: ["Difficulty scaling", "No clear roadmap", "Business too founder-dependent", "Lack of strategic guidance or mentorship"] },
} as const;

export type GapKey = keyof typeof GAP_GROUPS;

// Derive a simple health score & severity from selections
export function deriveScore(d: AuditData) {
  const groups: GapKey[] = ["sales", "marketing", "operations", "hiring", "growth"];
  const counts = groups.map((g) => (d[g]?.length || 0));
  const total = counts.reduce((a, b) => a + b, 0);
  // 0..20 selected items; lower score = more gaps
  const score = Math.max(20, Math.round(100 - (total / 20) * 65));
  const severities: Record<GapKey, number> = {
    sales: Math.round(((d.sales?.length || 0) / 4) * 100),
    marketing: Math.round(((d.marketing?.length || 0) / 4) * 100),
    operations: Math.round(((d.operations?.length || 0) / 4) * 100),
    hiring: Math.round(((d.hiring?.length || 0) / 4) * 100),
    growth: Math.round(((d.growth?.length || 0) / 4) * 100),
  };
  return { score, severities, total };
}
