// Fernhall print farm: 12 printers over the last 90 days. Everything below is generated once from a
// fixed seed, so every total on the page is a sum of these printer-days and always adds up.

export type State = "printed" | "failed" | "idle";
export type Reason = "Nozzle clog" | "Bed adhesion" | "Layer shift" | "Filament runout";
export type Cell = { printer: string; state: State; hours: number; parts: number; grams: number; reason?: Reason; customer?: string };
export type Day = { date: Date; cells: Cell[] };

export const TODAY = new Date(2026, 10, 9);
export const PRINTERS = ["A1", "A2", "A3", "A4", "A5", "A6", "B1", "B2", "B3", "B4", "B5", "B6"];
export const REASONS: Reason[] = ["Nozzle clog", "Bed adhesion", "Layer shift", "Filament runout"];
export const SPAN = 90;
// Customers and what Fernhall charges them per part (GBP).
export const CUSTOMERS = [
  { name: "Northgate Labs", price: 3.4, weight: 0.27 },
  { name: "Oakline Furniture", price: 5.9, weight: 0.21 },
  { name: "Halden Robotics", price: 8.2, weight: 0.16 },
  { name: "Kinetic Clinic", price: 14.5, weight: 0.08 },
  { name: "Moss & Co", price: 2.6, weight: 0.15 },
  { name: "Skyward Club", price: 6.8, weight: 0.13 },
];
const dayIndex = (m: number, d: number) => Math.round((new Date(2026, m, d).getTime() - new Date(2026, 10, 9).getTime()) / 864e5) + SPAN - 1;
const A3_FROM = dayIndex(9, 18), B4_FROM = dayIndex(8, 22), B4_TO = dayIndex(8, 27);

function rng(seed: number) {
  return () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
}

export const DAYS: Day[] = (() => {
  const r = rng(20261109), out: Day[] = [];
  for (let d = SPAN - 1; d >= 0; d--) {
    const date = new Date(TODAY); date.setDate(TODAY.getDate() - d);
    const i = SPAN - 1 - d, wd = date.getDay();
    // Busier towards the end of the period (holiday orders), quieter on Sundays.
    const busy = 0.5 + i * 0.0038 + (wd === 0 ? -0.22 : wd === 6 ? -0.08 : 0.04);
    const cells = PRINTERS.map((printer): Cell => {
      // B4 was down for a hot-end swap for six days; A3 has clogged repeatedly since 18 Oct.
      if (printer === "B4" && i >= B4_FROM && i <= B4_TO) return { printer, state: "idle", hours: 0, parts: 0, grams: 0 };
      const a3 = printer === "A3" && i >= A3_FROM;
      const x = r();
      if (x < busy) {
        const failP = a3 ? 0.34 : 0.035;
        if (r() < failP) {
          const reason: Reason = a3 ? "Nozzle clog" : REASONS[Math.floor(r() * 4)];
          return { printer, state: "failed", hours: Math.round(2 + r() * 6), parts: 0, grams: Math.round(60 + r() * 180), reason };
        }
        const hours = Math.round(13 + r() * 9);
        let y = r(), customer = CUSTOMERS[0].name;
        for (const c of CUSTOMERS) { if (y < c.weight) { customer = c.name; break; } y -= c.weight; }
        return { printer, state: "printed", hours, parts: Math.round(hours * (0.35 + r() * 0.25)), grams: Math.round(hours * (34 + r() * 12)), customer };
      }
      return { printer, state: "idle", hours: 0, parts: 0, grams: 0 };
    });
    out.push({ date, cells });
  }
  return out;
})();

export type Totals = { printed: number; failed: number; idle: number; hours: number; parts: number; kg: number; failRate: number; reasons: Record<Reason, number> };
export function totals(days: Day[], printer: string | null): Totals {
  const t: Totals = { printed: 0, failed: 0, idle: 0, hours: 0, parts: 0, kg: 0, failRate: 0, reasons: { "Nozzle clog": 0, "Bed adhesion": 0, "Layer shift": 0, "Filament runout": 0 } };
  for (const d of days) for (const c of d.cells) {
    if (printer && c.printer !== printer) continue;
    t[c.state]++; t.hours += c.hours; t.parts += c.parts; t.kg += c.grams / 1000;
    if (c.reason) t.reasons[c.reason]++;
  }
  t.failRate = t.printed + t.failed ? (t.failed / (t.printed + t.failed)) * 100 : 0;
  return t;
}

// What each printer is doing right now.
export type Live = { printer: string; status: "printing" | "attention" | "idle"; job?: string; customer?: string; pct?: number; left?: string; note?: string };
export const LIVE: Live[] = [
  { printer: "A1", status: "printing", job: "Hinge bracket v3", customer: "Oakline Furniture", pct: 82, left: "48m" },
  { printer: "A2", status: "printing", job: "Cable clip ×120", customer: "Northgate Labs", pct: 37, left: "4h 10m" },
  { printer: "A3", status: "attention", job: "Lamp shade, large", customer: "Wren & Pike", note: "Clogged at layer 214" },
  { printer: "A4", status: "printing", job: "Gear housing", customer: "Halden Robotics", pct: 64, left: "2h 05m" },
  { printer: "A5", status: "printing", job: "Drone arm ×8", customer: "Skyward Club", pct: 15, left: "7h 40m" },
  { printer: "A6", status: "idle", note: "Next job at 14:30" },
  { printer: "B1", status: "printing", job: "Planter insert", customer: "Moss & Co", pct: 91, left: "22m" },
  { printer: "B2", status: "printing", job: "Hinge bracket v3", customer: "Oakline Furniture", pct: 58, left: "1h 35m" },
  { printer: "B3", status: "printing", job: "Prosthetic socket", customer: "Kinetic Clinic", pct: 44, left: "6h 15m" },
  { printer: "B4", status: "printing", job: "Enclosure lid", customer: "Northgate Labs", pct: 73, left: "1h 02m" },
  { printer: "B5", status: "idle", note: "Spool change needed" },
  { printer: "B6", status: "printing", job: "Cable clip ×120", customer: "Northgate Labs", pct: 26, left: "5h 20m" },
];

// Spool stock. Daily use is the last 14 days' filament split by each material's share of jobs.
export const SPOOLS = [
  { name: "PLA Matte Black", hex: "#2a2826", kg: 18.4, share: 0.34 },
  { name: "PETG Clear", hex: "#cfd8d6", kg: 11.2, share: 0.22 },
  { name: "PLA Bone White", hex: "#ece6da", kg: 4.1, share: 0.21 },
  { name: "PLA Signal Orange", hex: "#e2531b", kg: 9.6, share: 0.13 },
  { name: "TPU 95A Grey", hex: "#8d8f8c", kg: 6.0, share: 0.1 },
];
export function dailyKg() {
  const recent = DAYS.slice(-14);
  return recent.reduce((s, d) => s + d.cells.reduce((x, c) => x + c.grams, 0), 0) / 1000 / 14;
}

// Revenue by customer over a window of days: parts printed for them × their price per part.
export function customerRevenue(days: Day[]) {
  return CUSTOMERS.map((c) => {
    let parts = 0;
    for (const d of days) for (const x of d.cells) if (x.customer === c.name) parts += x.parts;
    return { name: c.name, parts, revenue: parts * c.price };
  }).sort((a, b) => b.revenue - a.revenue);
}

// Power: each printing hour draws about 0.14 kWh, plus 5 kWh a day for the enclosure heaters and lights.
export const KWH_PER_HOUR = 0.14, BASE_KWH = 5, PRICE_KWH = 0.27;
export function power(d: Day) {
  const hours = d.cells.reduce((s, c) => s + c.hours, 0), parts = d.cells.reduce((s, c) => s + c.parts, 0);
  const kwh = BASE_KWH + hours * KWH_PER_HOUR;
  return { kwh, cost: kwh * PRICE_KWH, parts };
}

// Maintenance: each printer is serviced every 400 print hours. Hours counted since its last service.
export const SERVICE_EVERY = 400;
const LAST_SERVICE: Record<string, [number, number]> = {
  A1: [9, 24], A2: [9, 30], A3: [10, 3], A4: [9, 16], A5: [9, 21], A6: [9, 27],
  B1: [9, 19], B2: [9, 28], B3: [10, 1], B4: [9, 6], B5: [9, 25], B6: [9, 14],
};
export function maintenance() {
  return PRINTERS.map((p) => {
    const from = dayIndex(...LAST_SERVICE[p]);
    const hours = DAYS.slice(from + 1).reduce((s, d) => s + (d.cells.find((c) => c.printer === p)?.hours ?? 0), 0);
    const [m, dd] = LAST_SERVICE[p];
    return { printer: p, hours, since: new Date(2026, m, dd) };
  }).sort((a, b) => b.hours - a.hours);
}

// The queue, in print order. Farm capacity is 12 printers × 20 usable hours a day.
export const CAPACITY_PER_DAY = 12 * 20;
export const QUEUE = [
  { job: "Cable clip ×1,200", customer: "Northgate Labs", material: "PETG Clear", hours: 96, due: new Date(2026, 10, 11) },
  { job: "Hinge bracket v3 ×400", customer: "Oakline Furniture", material: "PLA Matte Black", hours: 210, due: new Date(2026, 10, 12) },
  { job: "Gear housing ×60", customer: "Halden Robotics", material: "PLA Matte Black", hours: 132, due: new Date(2026, 10, 13) },
  { job: "Prosthetic socket ×6", customer: "Kinetic Clinic", material: "TPU 95A Grey", hours: 74, due: new Date(2026, 10, 11) },
  { job: "Planter insert ×300", customer: "Moss & Co", material: "PLA Bone White", hours: 165, due: new Date(2026, 10, 13) },
  { job: "Drone arm ×80", customer: "Skyward Club", material: "PLA Signal Orange", hours: 118, due: new Date(2026, 10, 16) },
  { job: "Enclosure lid ×150", customer: "Northgate Labs", material: "PETG Clear", hours: 142, due: new Date(2026, 10, 17) },
];
export function schedule() {
  let used = 0;
  return QUEUE.map((q) => {
    used += q.hours;
    const finish = new Date(TODAY); finish.setDate(TODAY.getDate() + Math.ceil(used / CAPACITY_PER_DAY));
    return { ...q, finish, late: finish > q.due };
  });
}

// Shipments, last 30 days.
export const SHIPPED = { orders: 52, onTime: 49 };
// Every order shipped in the last 30 days, oldest first (FH-2240 … FH-2291). Days vs due: negative is early.
export const ORDERS = (() => {
  const who = ["Northgate Labs", "Oakline Furniture", "Halden Robotics", "Moss & Co", "Skyward Club", "Kinetic Clinic", "Wren & Pike"];
  const r = rng(52), fixed: Record<number, [string, number]> = { 51: ["Oakline Furniture", -1], 48: ["Halden Robotics", 0], 45: ["Wren & Pike", 1], 43: ["Northgate Labs", -2], 7: ["Moss & Co", 2], 23: ["Skyward Club", 1] };
  return Array.from({ length: 52 }, (_, i) => {
    const [customer, delta] = fixed[i] ?? [who[Math.floor(r() * who.length)], -Math.floor(r() * 3)];
    const shipped = new Date(TODAY); shipped.setDate(TODAY.getDate() - Math.round((51 - i) * 30 / 52) - 1);
    return { order: `FH-${2240 + i}`, customer, delta, shipped };
  });
})();
export const SHIPMENTS = [
  { order: "FH-2291", customer: "Oakline Furniture", parts: 380, due: new Date(2026, 10, 9), shipped: new Date(2026, 10, 8) },
  { order: "FH-2288", customer: "Halden Robotics", parts: 45, due: new Date(2026, 10, 7), shipped: new Date(2026, 10, 7) },
  { order: "FH-2285", customer: "Wren & Pike", parts: 12, due: new Date(2026, 10, 5), shipped: new Date(2026, 10, 6) },
  { order: "FH-2283", customer: "Northgate Labs", parts: 900, due: new Date(2026, 10, 6), shipped: new Date(2026, 10, 4) },
];
