// Halyard: an API platform's revenue and usage desk. Generated once from fixed seeds, so totals add up and
// server and client render the same.

function rng(seed: number) {
  return () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
}
const round = (n: number, d = 2) => Math.round(n * 10 ** d) / 10 ** d;

export type Range = "1D" | "1W" | "1M";
export type Point = { label: string; value: number; sub: number };
export type Kind = "gbp" | "count" | "requests";

const HOURS = (i: number) => `${String(Math.floor(i / 2)).padStart(2, "0")}:${i % 2 ? "30" : "00"}`;
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const WEEK = (i: number) => `${DAYS[Math.floor(i / 7) % 7]} ${String(Math.floor((i % 7) * 3.4)).padStart(2, "0")}:00`;
const MONTH = (i: number) => { const d = new Date(2026, 9, 11 + Math.floor((i * 30) / 48)); return `${d.getDate()} ${["Oct", "Nov"][d.getMonth() - 9]}`; };

function growth(start: number, end: number, wobble: number, seed: number, label: (i: number) => string, sub: (v: number) => number): Point[] {
  const r = rng(seed);
  return Array.from({ length: 48 }, (_, i) => {
    const t = i / 47, v = start + (end - start) * (t * t * 0.4 + t * 0.6) + (r() - 0.5) * wobble;
    return { label: label(i), value: round(v), sub: Math.round(sub(v)) };
  });
}
// API traffic over a day (requests per half-hour): overnight trough, working-day plateau, evening tail
function traffic(scale: number, seed: number): Point[] {
  const r = rng(seed);
  return Array.from({ length: 48 }, (_, i) => {
    const h = i / 2, bump = (c: number, w: number, a: number) => a * Math.exp(-((h - c) ** 2) / (2 * w * w));
    const v = (120 + bump(10.5, 2.4, 420) + bump(15, 2.2, 470) + bump(20, 1.6, 160) + (r() - 0.5) * 50) * scale * 1000;
    return { label: HOURS(i), value: Math.round(v), sub: Math.round(v * 0.0021) };
  });
}

export type Metric = { key: string; code: string; name: string; kind: Kind; value: number; change: number; vs: string; subLabel: string; series: Record<Range, Point[]> };

export const METRICS: Metric[] = [
  { key: "mrr", code: "MRR", name: "Monthly recurring revenue", kind: "gbp", value: 84320, change: 4.2, vs: "vs last month", subLabel: "Paying workspaces",
    series: { "1D": growth(84020, 84320, 60, 11, HOURS, (v) => v / 33), "1W": growth(82900, 84320, 140, 12, WEEK, (v) => v / 33), "1M": growth(80900, 84320, 260, 13, MONTH, (v) => v / 33) } },
  { key: "ws", code: "WORKSPACES", name: "Active workspaces", kind: "count", value: 2814, change: 3.1, vs: "vs last month", subLabel: "Seats in use",
    series: { "1D": growth(2801, 2814, 3, 21, HOURS, (v) => v * 4.3), "1W": growth(2768, 2814, 6, 22, WEEK, (v) => v * 4.3), "1M": growth(2729, 2814, 10, 23, MONTH, (v) => v * 4.3) } },
  { key: "req", code: "REQUESTS", name: "API requests today", kind: "requests", value: 18_420_000, change: -2.3, vs: "vs yesterday", subLabel: "Errors",
    series: { "1D": traffic(1, 31), "1W": traffic(1.04, 32), "1M": traffic(0.97, 33) } },
];

// Live service strip under the top bar
export const STRIP = [
  { label: "API p95", value: "142 ms", change: -6.1, good: true },
  { label: "Uptime, 30 days", value: "99.98%", change: 0.01, good: true },
  { label: "Webhooks", value: "1,240/min", change: 3.4, good: true },
  { label: "Signups today", value: "64", change: 12.3, good: true },
  { label: "Trials running", value: "212", change: -1.4, good: false },
  { label: "Churn, 30 days", value: "1.9%", change: -0.3, good: true },
];

export const TILES = [
  { key: "churn", label: "Churn", value: "1.9", unit: "%", delta: "−0.3 pts vs last month", good: true },
  { key: "nrr", label: "Net retention", value: "112", unit: "%", delta: "+3 pts this quarter", good: true },
  { key: "trial", label: "Trial to paid", value: "24", unit: "%", delta: "41 of 171 last month", good: true },
  { key: "tickets", label: "Open tickets", value: "7", unit: "", delta: "2 waiting over a day", good: false },
];

export const PLANS = [
  { key: "starter", name: "Starter", seat: 19, note: "1M requests" },
  { key: "growth", name: "Growth", seat: 39, note: "10M requests" },
  { key: "scale", name: "Scale", seat: 79, note: "Unlimited, SSO, SLA" },
] as const;
export const ANNUAL_OFF = 0.15;

export type SubStatus = "Active" | "Trialing" | "Past due" | "Cancelled";
export const SUBS: { id: string; company: string; plan: string; seats: number; mrr: number; status: SubStatus; started: string; order: number; usage: number }[] = [
  { id: "HY-2291", company: "Northgate Labs", plan: "Scale", seats: 42, mrr: 3318, status: "Active", started: "9 Nov", order: 9, usage: 82 },
  { id: "HY-2288", company: "Oakline Furniture", plan: "Growth", seats: 18, mrr: 702, status: "Trialing", started: "8 Nov", order: 8, usage: 36 },
  { id: "HY-2285", company: "Kinetic Clinic", plan: "Growth", seats: 25, mrr: 975, status: "Active", started: "6 Nov", order: 6, usage: 64 },
  { id: "HY-2281", company: "Wren & Pike", plan: "Starter", seats: 6, mrr: 114, status: "Past due", started: "3 Nov", order: 3, usage: 91 },
  { id: "HY-2277", company: "Skyward Club", plan: "Starter", seats: 9, mrr: 171, status: "Cancelled", started: "1 Nov", order: 1, usage: 0 },
  { id: "HY-2274", company: "Halden Robotics", plan: "Scale", seats: 30, mrr: 2370, status: "Active", started: "30 Oct", order: 0, usage: 57 },
];

export const fmtGbp = (n: number, d = 0) => `£${Math.abs(n).toLocaleString("en-GB", { minimumFractionDigits: d, maximumFractionDigits: d })}`;
export const fmtCount = (n: number) => Math.round(n).toLocaleString("en-GB");
export const fmtReq = (n: number) => (n >= 1e6 ? `${(n / 1e6).toFixed(1)}M` : n >= 1e3 ? `${(n / 1e3).toFixed(0)}k` : `${Math.round(n)}`);
export const fmtKind = (k: Kind, n: number) => (k === "gbp" ? fmtGbp(n) : k === "count" ? fmtCount(n) : fmtReq(n));
