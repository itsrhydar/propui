"use client";

import { useLayoutEffect, useMemo, useRef, useState, type CSSProperties, type KeyboardEvent } from "react";
import { AnimatePresence, MotionConfig, animate, motion, useInView, useReducedMotion } from "motion/react";

import { geist, geistMono } from "./fonts";
import { DAYS, LIVE, PRINTERS, PRICE_KWH, REASONS, SERVICE_EVERY, SHIPPED, ORDERS, SPAN, CAPACITY_PER_DAY, customerRevenue, maintenance, power, schedule, totals, type Cell, type State } from "./data";

import "./post.css";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const EASE = [0.2, 0.7, 0.2, 1] as const;
const PHONE_DAYS = 45;
const gbp = (n: number) => "£" + Math.round(n).toLocaleString("en-GB");
const ORDER: State[] = ["printed", "failed", "idle"];
const fmtDay = (d: Date) => `${d.getDate()} ${MONTHS[d.getMonth()]}`;
const int = (n: number) => Math.round(n).toLocaleString("en-GB");

// A figure that rolls to its new value when the selection changes.
function Num({ value, format }: { value: number; format: (n: number) => string }) {
  const ref = useRef<HTMLSpanElement>(null), last = useRef(0), reduced = useReducedMotion();
  useLayoutEffect(() => {
    const el = ref.current; if (!el) return;
    if (reduced) { el.textContent = format(value); last.current = value; return; }
    const c = animate(last.current, value, { type: "spring", stiffness: 140, damping: 26, restDelta: 0.01, onUpdate: (v) => { el.textContent = format(v); } });
    last.current = value;
    return () => c.stop();
  }, [value, format, reduced]);
  return <span ref={ref} className="fh-num" />;
}
const fmtInt = (n: number) => int(n);
const fmtPct = (n: number) => n.toFixed(1) + "%";
const fmtKg = (n: number) => n.toFixed(0);

function Mark() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 19V8l7-4 7 4v11" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M8.5 19v-3h7v3M8.5 13h7" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

// Nav glyphs drawn for a print farm: 1.6px rounded strokes plus a soft fill (".fh-gf") that tints on the active item.
type Glyph = "floor" | "queue" | "printers" | "spools" | "customers" | "reports" | "bay" | "plus" | "help" | "settings" | "side" | "chev" | "right" | "updown";
function G({ n }: { n: Glyph }) {
  const body = (() => {
    switch (n) {
      case "floor": return <><rect className="fh-gf" x="4" y="4" width="7" height="7" rx="2" /><rect x="4" y="4" width="7" height="7" rx="2" /><rect x="13" y="4" width="7" height="7" rx="2" /><rect x="4" y="13" width="7" height="7" rx="2" /><rect x="13" y="13" width="7" height="7" rx="2" /></>;
      case "queue": return <><rect className="fh-gf" x="4" y="14" width="16" height="6" rx="2" /><rect x="4" y="14" width="16" height="6" rx="2" /><path d="M6 10.5h12M8 6.5h8" /></>;
      case "printers": return <><rect className="fh-gf" x="10" y="14.5" width="4" height="3.5" rx="0.8" /><rect x="3.5" y="3.5" width="17" height="17" rx="3" /><path d="M3.5 8.5h17M12 8.5v2.5l-1 1.2h2l-1-1.2M7 18h10" /><rect x="10" y="14.5" width="4" height="3.5" rx="0.8" /></>;
      case "spools": return <><circle className="fh-gf" cx="11" cy="12" r="7.5" /><circle cx="11" cy="12" r="7.5" /><circle cx="11" cy="12" r="2.5" /><path d="M11 4.5c3 0 6 1 9.5 3.5" /></>;
      case "customers": return <><circle className="fh-gf" cx="9" cy="8" r="3.5" /><circle cx="9" cy="8" r="3.5" /><path d="M2.5 19.5c.8-3.2 3.3-5 6.5-5s5.7 1.8 6.5 5M16 4.8a3.5 3.5 0 0 1 0 6.4M18 14.8c1.8.7 3 2.3 3.5 4.7" /></>;
      case "reports": return <><rect className="fh-gf" x="3.5" y="3.5" width="17" height="17" rx="3" /><rect x="3.5" y="3.5" width="17" height="17" rx="3" /><path d="M8 16v-3M12 16V8.5M16 16v-5" /></>;
      case "bay": return <><rect className="fh-gf" x="4" y="4" width="16" height="16" rx="2.5" /><rect x="4" y="4" width="16" height="16" rx="2.5" /><path d="M4 10h16M4 15h16M8 7h2M8 12.5h2M8 17.5h2" /></>;
      case "plus": return <path d="M12 6v12M6 12h12" />;
      case "help": return <><circle className="fh-gf" cx="12" cy="12" r="8.5" /><circle cx="12" cy="12" r="8.5" /><path d="M9.6 9.5a2.5 2.5 0 0 1 4.8.9c0 1.7-2.4 2.2-2.4 3.6M12 17h.01" /></>;
      case "settings": return <><path d="M4 7h9M17 7h3M4 17h3M11 17h9" /><circle className="fh-gf" cx="15" cy="7" r="2.2" /><circle cx="15" cy="7" r="2.2" /><circle className="fh-gf" cx="9" cy="17" r="2.2" /><circle cx="9" cy="17" r="2.2" /></>;
      case "side": return <><rect x="3.5" y="4.5" width="17" height="15" rx="3" /><path d="M9.5 4.5v15" /><rect className="fh-gf" x="3.5" y="4.5" width="6" height="15" rx="3" /></>;
      case "chev": return <path d="m7 10 5 5 5-5" />;
      case "right": return <path d="m10 7 5 5-5 5" />;
      case "updown": return <path d="m8 15 4 4 4-4M8 9l4-4 4 4" />;
    }
  })();
  return <svg viewBox="0 0 24 24" aria-hidden="true" className="fh-nico" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">{body}</svg>;
}

function Waffle({ selected }: { selected: string | null }) {
  const [active, setActive] = useState<number | null>(null);
  const reduced = useReducedMotion();
  const cols = useMemo(() => DAYS.map((d) => ({ ...d, sorted: [...d.cells].sort((a, b) => ORDER.indexOf(a.state) - ORDER.indexOf(b.state)) })), []);
  const months = useMemo(() => DAYS.flatMap((d, i) => (d.date.getDate() === 1 || i === 0 ? [{ i, label: MONTHS[d.date.getMonth()] }] : [])), []);
  const show = active ?? null;
  const day = show !== null ? cols[show] : null;
  const count = (cells: Cell[], s: State) => cells.filter((c) => c.state === s).length;
  const mine = day && selected ? day.cells.find((c) => c.printer === selected) : null;

  const onKey = (e: KeyboardEvent) => {
    if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
      e.preventDefault();
      setActive((a) => Math.max(0, Math.min(DAYS.length - 1, (a ?? DAYS.length - 1) + (e.key === "ArrowRight" ? 1 : -1))));
    } else if (e.key === "Escape") setActive(null);
  };

  return (
    <div className="fh-chart">
      <div className="fh-axis" aria-hidden="true"><span>12</span><span>6</span><span>0</span></div>
      <div
        className="fh-plot"
        tabIndex={0}
        role="group"
        aria-label="Printer-days for the last 90 days. Use the left and right arrow keys to read each day."
        onKeyDown={onKey}
        onFocus={() => setActive((a) => a ?? DAYS.length - 1)}
        onBlur={() => setActive(null)}
        onMouseLeave={() => setActive(null)}
      >
        {cols.map((d, i) => (
          <motion.div
            key={i}
            className={`fh-col${show === i ? " fh-on" : ""}${i < SPAN - PHONE_DAYS ? " fh-early" : ""}`}
            onMouseEnter={() => setActive(i)}
            initial={{ clipPath: "inset(100% 0 0 0)" }}
            animate={{ clipPath: "inset(0% 0 0 0)" }}
            transition={reduced ? { duration: 0 } : { duration: 0.5, ease: EASE, delay: 0.15 + i * 0.008 }}
          >
            {d.sorted.map((c) => (
              <i key={c.printer} className={`fh-cell fh-${c.state}${selected ? (c.printer === selected ? " fh-mine" : " fh-dim") : ""}`} />
            ))}
          </motion.div>
        ))}
        <AnimatePresence>
          {day && (
            <motion.div
              key="tip"
              className={`fh-tip${show! < 8 ? " fh-tl" : ""}${show! < SPAN - PHONE_DAYS + 5 ? " fh-tl-ph" : ""}${show! > SPAN - 9 ? " fh-tr" : ""}`}
              style={{ "--i": show } as CSSProperties}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              transition={FADE}
            >
              <b>{["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][day.date.getDay()]} {fmtDay(day.date)}</b>
              {mine ? (
                <span>{mine.printer}: {mine.state === "printed" ? `printed ${mine.hours}h, ${mine.parts} parts` : mine.state === "failed" ? `failed, ${mine.reason!.toLowerCase()}` : "idle"}</span>
              ) : (
                <span><em>{count(day.cells, "printed")}</em> printed · <em>{count(day.cells, "failed")}</em> failed · {count(day.cells, "idle")} idle</span>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <div className="fh-months" aria-hidden="true">
        {months.map((m) => <span key={m.i} className={m.i < SPAN - PHONE_DAYS + 2 ? "fh-early" : undefined} style={{ "--i": m.i } as CSSProperties}>{m.label}</span>)}
        <span className="fh-today">Today</span>
      </div>
      <p className="fh-sr" aria-live="polite">{day ? `${fmtDay(day.date)}: ${count(day.cells, "printed")} printed, ${count(day.cells, "failed")} failed, ${count(day.cells, "idle")} idle` : ""}</p>
    </div>
  );
}

const dayName = (d: Date) => ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][d.getDay()];
const deltaText = (n: number) => (n > 0 ? `${n} day${n > 1 ? "s" : ""} late` : n < 0 ? `${-n} day${n < -1 ? "s" : ""} early` : "On the day");

// One spring for everything that moves on this page, so it all feels like one material.
const SPRING_SOFT = { type: "spring", stiffness: 210, damping: 28, mass: 0.9 } as const;
const FADE = { duration: 0.22, ease: [0.2, 0.7, 0.2, 1] } as const;
const fmtGbp = (n: number) => gbp(n);
const fmtKwh = (n: number) => `${Math.round(n)} kWh`;

// A caption that cross-fades when its text changes, without jumping the line.
function Swap({ k, children }: { k: string; children: React.ReactNode }) {
  return (
    <span className="fh-swap">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.small key={k} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={FADE}>{children}</motion.small>
      </AnimatePresence>
    </span>
  );
}

function CustomersCard({ custs, revenue }: { custs: { name: string; parts: number; revenue: number }[]; revenue: number }) {
  const [hot, setHot] = useState<string | null>(null);
  const ref = useRef<HTMLElement>(null), seen = useInView(ref, { once: true, amount: 0.4 });
  const h = hot ? custs.find((c) => c.name === hot)! : null;
  return (
    <section ref={ref} className="fh-panel fh-cust" aria-labelledby="fh-cust-h" onMouseLeave={() => setHot(null)}>
      <div className="fh-ph"><h2 id="fh-cust-h">Customers, last 30 days</h2></div>
      <p className="fh-big" aria-live="polite">
        <Num value={h ? h.revenue : revenue} format={fmtGbp} />
        <Swap k={hot ?? "all"}>{h ? `${h.name}, ${Math.round((h.revenue / revenue) * 100)}% of billing` : `billed for ${int(custs.reduce((s, c) => s + c.parts, 0))} parts`}</Swap>
      </p>
      <div className="fh-stack">
        {custs.map((c, i) => (
          <motion.i
            key={c.name}
            onMouseEnter={() => setHot(c.name)}
            style={{ flexGrow: c.revenue, originX: 0 }}
            initial={{ scaleX: 0, opacity: 1 - i * 0.14 }}
            animate={{ scaleX: seen ? 1 : 0, scaleY: hot === c.name ? 1.7 : 1, opacity: hot && hot !== c.name ? 0.18 : 1 - i * 0.14 }}
            transition={{ scaleX: { ...SPRING_SOFT, delay: seen ? 0.1 + i * 0.06 : 0 }, scaleY: SPRING_SOFT, opacity: FADE }}
          />
        ))}
      </div>
      <ul>
        {custs.map((c, i) => (
          <motion.li key={c.name} onMouseEnter={() => setHot(c.name)} animate={{ opacity: hot && hot !== c.name ? 0.4 : 1 }} transition={FADE}>
            <i style={{ opacity: 1 - i * 0.14 }} /><span>{c.name}</span><small className="fh-num">{int(c.parts)}</small><b className="fh-num">{gbp(c.revenue)}</b>
          </motion.li>
        ))}
      </ul>
    </section>
  );
}

function PowerCard({ days, dates }: { days: { kwh: number; cost: number; parts: number }[]; dates: Date[] }) {
  const [hot, setHot] = useState<number | null>(null);
  const ref = useRef<HTMLElement>(null), seen = useInView(ref, { once: true, amount: 0.4 });
  const yd = days.length - 2, i = hot ?? yd, d = days[i];
  const max = Math.max(...days.map((x) => x.kwh)), total = days.reduce((s, x) => s + x.kwh, 0), parts = days.reduce((s, x) => s + x.parts, 0);
  const label = hot === null || hot === yd ? "yesterday" : i === days.length - 1 ? "today so far" : `${dayName(dates[i])} ${fmtDay(dates[i])}`;
  return (
    <section ref={ref} className="fh-panel fh-power" aria-labelledby="fh-power-h">
      <div className="fh-ph"><h2 id="fh-power-h">Power</h2><span className="fh-count">last 30 days</span></div>
      <p className="fh-big" aria-live="polite"><Num value={d.kwh} format={fmtKwh} /><Swap k={label}>{label}, {gbp(d.cost)}</Swap></p>
      <div className="fh-bars" role="img" aria-label={`Daily power use over 30 days, between ${Math.min(...days.map((x) => x.kwh)).toFixed(0)} and ${max.toFixed(0)} kWh`} onMouseLeave={() => setHot(null)}>
        {days.map((x, k) => (
          <span key={k} className="fh-barhit" onMouseEnter={() => setHot(k)}>
            <motion.i
              style={{ height: `${(x.kwh / max) * 100}%`, originY: 1 }}
              initial={{ scaleY: 0 }}
              animate={{ scaleY: seen ? 1 : 0, opacity: hot !== null && k !== i ? 0.5 : 1, backgroundColor: k === i ? "#e4561a" : "#e9e6e0" }}
              transition={{ scaleY: { ...SPRING_SOFT, delay: seen ? 0.1 + k * 0.014 : 0 }, opacity: FADE, backgroundColor: FADE }}
            />
          </span>
        ))}
      </div>
      <dl className="fh-mini fh-well">
        <div><dt>30-day total</dt><dd className="fh-num">{int(total)} kWh</dd></div>
        <div><dt>Cost per part</dt><dd className="fh-num">{"£" + ((total * PRICE_KWH) / parts).toFixed(3)}</dd></div>
      </dl>
    </section>
  );
}

function ShipCard() {
  const [hot, setHot] = useState<number | null>(null);
  const ref = useRef<HTMLElement>(null), seen = useInView(ref, { once: true, amount: 0.4 });
  const o = hot !== null ? ORDERS[hot] : null;
  const recent = [51, 48, 45, 43];
  return (
    <section ref={ref} className="fh-panel fh-ship" aria-labelledby="fh-ship-h" onMouseLeave={() => setHot(null)}>
      <div className="fh-ph"><h2 id="fh-ship-h">Shipped on time</h2><span className="fh-count">last 30 days</span></div>
      <p className="fh-big fh-big-swap" aria-live="polite">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span key={o ? o.order : "all"} className="fh-swaprow" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={FADE}>
            {o ? <><span className="fh-num">{o.order}</span><small>{o.customer}, {deltaText(o.delta).toLowerCase()}, {fmtDay(o.shipped)}</small></>
               : <><span className="fh-num">{((SHIPPED.onTime / SHIPPED.orders) * 100).toFixed(1)}%</span><small>{SHIPPED.onTime} of {SHIPPED.orders} orders</small></>}
          </motion.span>
        </AnimatePresence>
      </p>
      <div className="fh-dots">
        {ORDERS.map((x, k) => (
          <motion.i
            key={x.order}
            className={`${x.delta > 0 ? "fh-miss" : ""}${hot === k ? " fh-on" : ""}`}
            onMouseEnter={() => setHot(k)}
            initial={{ scale: 0 }}
            animate={{ scale: !seen ? 0 : hot === k ? 1.6 : 1 }}
            transition={{ ...SPRING_SOFT, delay: seen && hot === null ? 0.1 + k * 0.012 : 0 }}
          />
        ))}
      </div>
      <ul>
        {recent.map((k) => {
          const x = ORDERS[k];
          return (
            <li key={x.order} className={hot === k ? "fh-on" : undefined} onMouseEnter={() => setHot(k)}>
              <span className="fh-num fh-ord">{x.order}</span><span>{x.customer}</span>
              <span className={`fh-pill ${x.delta > 0 ? "fh-pill-late" : "fh-pill-ok"}`}>{deltaText(x.delta)}</span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export default function FernhallPrintFarm() {
  const [selected, setSelected] = useState<string | null>(null);
  const [leedsOpen, setLeedsOpen] = useState(true);
  const [navOpen, setNavOpen] = useState(true);
  const t = useMemo(() => totals(DAYS, selected), [selected]);
  const farm = useMemo(() => totals(DAYS, null), []);

  // The finding: A3's clogs since 18 Oct against the rest of the farm.
  const since = DAYS.findIndex((d) => d.date.getMonth() === 9 && d.date.getDate() === 18);
  const recent = DAYS.slice(since);
  const a3 = totals(recent, "A3"), all = totals(recent, null);
  const share = Math.round((a3.failed / all.failed) * 100);
  const restRate = ((all.failed - a3.failed) / (all.printed + all.failed - a3.printed - a3.failed)) * 100;

  const reasonMax = Math.max(...REASONS.map((r) => t.reasons[r]), 1);
  const topReason = REASONS.reduce((a, b) => (t.reasons[b] > t.reasons[a] ? b : a));
  const running = LIVE.filter((l) => l.status === "printing").length;
  const plan = schedule(), queueHours = plan.reduce((s, q) => s + q.hours, 0);
  const service = maintenance();
  const custs = customerRevenue(DAYS.slice(-30)), revenue = custs.reduce((s, c) => s + c.revenue, 0);
  const last30 = DAYS.slice(-30).map(power);

  return (
    <MotionConfig reducedMotion="user">
      <div className={`fh${navOpen ? "" : " fh-collapsed"} ${geist.variable} ${geistMono.variable}`}>
        <aside className="fh-side-nav" aria-label="Sidebar">
          <div className="fh-sn-head">
            <div className="fh-brand"><span className="fh-logo"><Mark /></span>Fernhall</div>
            <button type="button" className="fh-sn-toggle" aria-label={navOpen ? "Collapse sidebar" : "Expand sidebar"} aria-expanded={navOpen} onClick={() => setNavOpen((o) => !o)}><G n="side" /></button>
          </div>
          <label className="fh-sn-search"><svg viewBox="0 0 24 24" aria-hidden="true" className="fh-nico" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><circle cx="11" cy="11" r="6.5" /><path d="m16 16 4 4" /></svg><input type="search" placeholder="Search" aria-label="Search jobs, printers and customers" /><kbd>⌘K</kbd></label>
          <nav className="fh-sn-body" aria-label="Main">
            <p className="fh-sn-label">Main</p>
            <ul>
              {([["Floor", "floor"], ["Queue", "queue"], ["Printers", "printers"], ["Spools", "spools"], ["Customers", "customers"], ["Reports", "reports"]] as const).map(([n, g]) => (
                <li key={n}><a href="#" className="fh-sn-item" aria-current={n === "Floor" ? "page" : undefined} onClick={(e) => e.preventDefault()}><G n={g} /><span>{n}</span>{n === "Queue" && <em className="fh-sn-count">7</em>}{n === "Printers" && <em className="fh-sn-count fh-sn-alert" aria-label="1 needs a check">1</em>}</a></li>
              ))}
            </ul>
            <div className="fh-sn-sep" />
            <p className="fh-sn-label">Farms</p>
            <ul>
              <li>
                <button type="button" className="fh-sn-item" aria-expanded={leedsOpen} onClick={() => setLeedsOpen((o) => !o)}>
                  <span className="fh-sn-farm" style={{ background: "#e4561a" }}>L</span><span>Leeds farm</span><i className="fh-sn-chev"><G n="chev" /></i>
                </button>
                {leedsOpen && (
                  <ul className="fh-sn-tree">
                    {(["A", "B"] as const).map((bay) => {
                      const ps = LIVE.filter((l) => l.printer.startsWith(bay)), on = ps.filter((l) => l.status === "printing").length, warn = ps.some((l) => l.status === "attention");
                      return (
                        <li key={bay}><a href="#" className="fh-sn-item fh-sn-sub" onClick={(e) => e.preventDefault()}><G n="bay" /><span>Bay {bay}</span><small><i className={warn ? "fh-sn-dot fh-warn" : "fh-sn-dot"} />{on}/{ps.length}</small></a></li>
                      );
                    })}
                    <li><a href="#" className="fh-sn-item fh-sn-sub fh-sn-add" onClick={(e) => e.preventDefault()}><G n="plus" /><span>Add bay</span></a></li>
                  </ul>
                )}
              </li>
              <li><a href="#" className="fh-sn-item" onClick={(e) => e.preventDefault()}><span className="fh-sn-farm" style={{ background: "#2c2a27" }}>B</span><span>Bristol farm</span><small className="fh-sn-meta">8 printers</small></a></li>
              <li><a href="#" className="fh-sn-item fh-sn-add" onClick={(e) => e.preventDefault()}><G n="plus" /><span>Add farm</span></a></li>
            </ul>
          </nav>
          <div className="fh-sn-now">
            <p><b>Floor now</b><span>{LIVE.filter((l) => l.status === "printing").length} of {LIVE.length} printing</span></p>
            <div className="fh-sn-grid" aria-hidden="true">
              {LIVE.map((l) => <i key={l.printer} className={`fh-sn-p fh-sn-${l.status}`} title={`${l.printer}: ${l.status}`} />)}
            </div>
            <p className="fh-sn-low"><i className="fh-sn-dot fh-warn" />Bone White PLA: 3 days left</p>
          </div>
          <div className="fh-sn-foot">
            <a href="#" className="fh-sn-item" onClick={(e) => e.preventDefault()}><G n="help" /><span>Help</span></a>
            <a href="#" className="fh-sn-item" onClick={(e) => e.preventDefault()}><G n="settings" /><span>Settings</span></a>
          </div>
          <button type="button" className="fh-sn-user" aria-label="Account: Isla Grant">
            <span className="fh-me">IG</span>
            <span className="fh-sn-who"><b>Isla Grant</b><small>Floor lead</small></span>
            <G n="updown" />
          </button>
        </aside>

        <div className="fh-body">
        <header className="fh-top">
          <div className="fh-crumbs"><span>Leeds farm</span><G n="right" /><span aria-current="page">Floor</span></div>
          <div className="fh-tools">
            <span className="fh-shift">Day shift, 06:00–18:00</span>
            <button type="button" className="fh-btn">Pause farm</button>
          </div>
        </header>

        <main className="fh-main">
          <div className="fh-head">
            <h1>Floor</h1>
            <p>
              A3 caused <b>{share}%</b> of failed prints since 18 Oct, all nozzle clogs. The other eleven printers failed{" "}
              <b>{restRate.toFixed(1)}%</b> of their prints.
            </p>
          </div>

          <div className="fh-grid">
            <section className="fh-panel fh-trend" aria-labelledby="fh-trend-h">
              <div className="fh-ph">
                <h2 id="fh-trend-h">{selected ? `${selected}, last 90 days` : "Printer-days, last 90 days"}</h2>
                <ul className="fh-legend">
                  <li><i className="fh-printed" />Printed</li>
                  <li><i className="fh-failed" />Failed</li>
                  <li><i className="fh-idle" />Idle</li>
                </ul>
              </div>
              <p className="fh-sub">Each column is a day; each square is one of the 12 printers on that day.</p>
              <Waffle selected={selected} />
              <dl className="fh-stats">
                <div><dt>Print hours</dt><dd><Num value={t.hours} format={fmtInt} /></dd></div>
                <div><dt>Parts made</dt><dd><Num value={t.parts} format={fmtInt} /></dd></div>
                <div><dt>Failure rate</dt><dd className={t.failRate > farm.failRate * 1.5 ? "fh-alert" : undefined}><Num value={t.failRate} format={fmtPct} /></dd></div>
                <div><dt>Filament used</dt><dd><Num value={t.kg} format={fmtKg} /><small>kg</small></dd></div>
              </dl>
            </section>

            <section className="fh-panel fh-tray fh-live" aria-labelledby="fh-live-h">
              <div className="fh-ph">
                <h2 id="fh-live-h">Running now</h2>
                <span className="fh-count">{running} of {PRINTERS.length}</span>
              </div>
              <button type="button" className="fh-all" aria-pressed={selected === null} onClick={() => setSelected(null)}>All printers</button>
              <ul className="fh-inner">
                {LIVE.map((l) => (
                  <li key={l.printer}>
                    <button
                      type="button"
                      className={`fh-row fh-${l.status}`}
                      aria-pressed={selected === l.printer}
                      onClick={() => setSelected((s) => (s === l.printer ? null : l.printer))}
                    >
                      <span className="fh-id">{l.printer}</span>
                      <span className="fh-job">
                        {l.job ? <><b>{l.job}</b><small>{l.customer}</small></> : <><b>Idle</b><small>{l.note}</small></>}
                        {l.status === "attention" && <small className="fh-warnline">{l.note}</small>}
                      </span>
                      {l.status === "printing" ? (
                        <span className="fh-prog">
                          <span className="fh-bar"><i style={{ width: `${l.pct}%` }} /></span>
                          <small>{l.left}</small>
                        </span>
                      ) : l.status === "attention" ? <span className="fh-flag">Check</span> : <span className="fh-prog" />}
                    </button>
                  </li>
                ))}
              </ul>
            </section>

            <div className="fh-trio">
              <CustomersCard custs={custs} revenue={revenue} />
              <PowerCard days={last30} dates={DAYS.slice(-30).map((d) => d.date)} />
              <ShipCard />
            </div>

            <section className="fh-panel fh-tray fh-queue" aria-labelledby="fh-queue-h">
              <div className="fh-ph">
                <h2 id="fh-queue-h">Queue</h2>
                <span className="fh-count">{plan.length} jobs, {int(queueHours)} print hours, {(queueHours / CAPACITY_PER_DAY).toFixed(1)} days of work</span>
              </div>
              <div className="fh-inner" tabIndex={0} role="region" aria-label="Queue table"><table className="fh-table">
                <thead><tr><th>Job</th><th>Material</th><th className="fh-r">Hours</th><th>Due</th><th>Finishes</th><th>Status</th></tr></thead>
                <tbody>
                  {plan.map((q) => (
                    <tr key={q.job} className={q.late ? "fh-late" : undefined}>
                      <td><b>{q.job}</b><small>{q.customer}</small></td>
                      <td>{q.material}</td>
                      <td className="fh-r"><span className="fh-num">{q.hours}</span></td>
                      <td>{fmtDay(q.due)}</td>
                      <td className="fh-fin">{fmtDay(q.finish)}</td>
                      <td>{q.late ? <span className="fh-pill fh-pill-late">Late</span> : <span className="fh-pill fh-pill-ok">On time</span>}</td>
                    </tr>
                  ))}
                </tbody>
              </table></div>
            </section>

            <div className="fh-side">
              <section className="fh-panel fh-why" aria-labelledby="fh-why-h">
                <div className="fh-ph">
                  <h2 id="fh-why-h">Why prints failed</h2>
                  <span className="fh-count">{t.failed} failed{selected ? ` on ${selected}` : ""}</span>
                </div>
                <ul>
                  {REASONS.map((r) => (
                    <li key={r} className={r === topReason && t.failed ? "fh-top1" : undefined}>
                      <span>{r}</span>
                      <span className="fh-track"><motion.i initial={false} animate={{ width: `${(t.reasons[r] / reasonMax) * 100}%` }} transition={{ duration: 0.45, ease: EASE }} /></span>
                      <b className="fh-num">{t.reasons[r]}</b>
                    </li>
                  ))}
                </ul>
                <p className="fh-note">
                  {t.failed === 0 ? "No failed prints in this period." : `${topReason} accounts for ${Math.round((t.reasons[topReason] / t.failed) * 100)}% of failures${selected ? ` on ${selected}` : ""}.`}
                </p>
              </section>

              <section className="fh-panel fh-tray fh-service" aria-labelledby="fh-service-h">
                <div className="fh-ph">
                  <h2 id="fh-service-h">Service due</h2>
                  <span className="fh-count">every {SERVICE_EVERY} print hours</span>
                </div>
                <ul className="fh-inner">
                  {service.slice(0, 4).map((m) => {
                    const pct = Math.min(100, (m.hours / SERVICE_EVERY) * 100), due = pct >= 90;
                    return (
                      <li key={m.printer} className={due ? "fh-due" : undefined}>
                        <span className="fh-id">{m.printer}</span>
                        <span className="fh-sv">
                          <span className="fh-svt"><b>{due ? (pct >= 100 ? "Overdue" : "Due this week") : `${int(SERVICE_EVERY - m.hours)} h left`}</b><small>since {fmtDay(m.since)}</small></span>
                          <span className="fh-track"><i style={{ width: `${pct}%` }} /></span>
                        </span>
                        <span className="fh-num fh-svh">{int(m.hours)} h</span>
                      </li>
                    );
                  })}
                </ul>
              </section>

            </div>

          </div>
        </main>
        </div>
      </div>
    </MotionConfig>
  );
}
