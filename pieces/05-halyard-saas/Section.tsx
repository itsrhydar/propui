"use client";

import { useEffect, useMemo, useRef, useState, type PointerEvent, type ReactNode } from "react";
import { AnimatePresence, MotionConfig, animate, motion, useReducedMotion, useSpring } from "motion/react";

import { funnel, geist, geistMono } from "./fonts";
import { ANNUAL_OFF, METRICS, PLANS, STRIP, SUBS, TILES, fmtGbp, fmtKind, fmtReq, type Metric, type Point, type Range } from "./data";

import "./post.css";

const EASE = [0.2, 0.7, 0.2, 1] as const;
const FADE = { duration: 0.22, ease: EASE } as const;

// A number that glides on one spring and retargets mid-flight
function Num({ value, format }: { value: number; format: (n: number) => string }) {
  const ref = useRef<HTMLSpanElement>(null), reduced = useReducedMotion();
  const mv = useSpring(value, { stiffness: 170, damping: 26, restDelta: 0.001 });
  useEffect(() => { if (reduced) mv.jump(value); else mv.set(value); }, [value, reduced, mv]);
  useEffect(() => mv.on("change", (v) => { if (ref.current) ref.current.textContent = format(v); }), [mv, format]);
  return <span ref={ref} className="wl-num">{format(value)}</span>;
}
// The hero figure counts up once when the page opens
function CountUp({ value, format }: { value: number; format: (n: number) => string }) {
  const ref = useRef<HTMLSpanElement>(null), reduced = useReducedMotion();
  useEffect(() => {
    if (reduced || !ref.current) return;
    const el = ref.current;
    const c = animate(value * 0.82, value, { duration: 1.6, ease: [0.16, 1, 0.3, 1], onUpdate: (v) => { el.textContent = format(v); } });
    return () => c.stop();
  }, [value, format, reduced]);
  return <span ref={ref} className="wl-num">{format(value)}</span>;
}

type GlyphName = "grid" | "users" | "card" | "pulse" | "receipt" | "chart" | "bell" | "search" | "side" | "star" | "bolt" | "clock" | "info" | "plus" | "cal" | "chev" | "up" | "down" | "quote" | "minus" | "check" | "copy" | "heart" | "ticket";
function G({ n }: { n: GlyphName }) {
  const d: Record<GlyphName, ReactNode> = {
    grid: <><rect x="4" y="4" width="7" height="7" rx="1.5" /><rect x="13" y="4" width="7" height="7" rx="3.5" /><rect x="4" y="13" width="7" height="7" rx="1.5" /><rect x="13" y="13" width="7" height="7" rx="1.5" /></>,
    users: <><circle cx="9" cy="8" r="3.2" /><path d="M3 19c.7-3 3.1-4.6 6-4.6s5.3 1.6 6 4.6M16 5a3.2 3.2 0 0 1 0 6.2M18 14.6c1.6.6 2.7 2 3 4.4" /></>,
    card: <><rect x="3.5" y="5.5" width="17" height="13" rx="2.5" /><path d="M3.5 10h17M7 15h3" /></>,
    pulse: <path d="M3 12h4l2-5 4 10 2-5h6" />,
    receipt: <path d="M6 3.5h12v17l-3-1.8-3 1.8-3-1.8-3 1.8zM9 8h6M9 12h6" />,
    chart: <><rect x="4" y="4" width="16" height="16" rx="3" /><path d="M8 16v-3M12 16V8M16 16v-6" /></>,
    bell: <path d="M6 9a6 6 0 1 1 12 0c0 6 2.5 7.5 2.5 7.5h-17S6 15 6 9Zm4 11a2 2 0 0 0 4 0" />,
    search: <><circle cx="11" cy="11" r="6.5" /><path d="m16 16 4 4" /></>,
    side: <><rect x="3.5" y="4.5" width="17" height="15" rx="3" /><path d="M9.5 4.5v15" /></>,
    star: <path d="m12 4 2.4 5 5.4.6-4 3.7 1.1 5.4L12 16l-4.9 2.7 1.1-5.4-4-3.7 5.4-.6z" />,
    bolt: <path d="M13 3 5 13h6l-1 8 8-10h-6z" />,
    clock: <><circle cx="12" cy="12" r="8" /><path d="M12 8v4l3 2" /></>,
    info: <><circle cx="12" cy="12" r="8" /><path d="M12 11v5M12 8h.01" /></>,
    plus: <path d="M12 6v12M6 12h12" />,
    cal: <><rect x="4" y="5" width="16" height="15" rx="2" /><path d="M4 10h16M9 3v4M15 3v4" /></>,
    chev: <path d="m7 10 5 5 5-5" />,
    up: <path d="m6 15 6-6 6 6" />,
    down: <path d="m6 9 6 6 6-6" />,
    quote: <><path d="M7 4h7l4 4v12H7z" /><path d="M14 4v4h4M10 13h5M10 16h3" /></>,
    minus: <path d="M6 12h12" />,
    check: <path d="m5 12 4.5 4.5L19 7" />,
    copy: <><rect x="8" y="8" width="12" height="12" rx="2" /><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" /></>,
    heart: <path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z" />,
    ticket: <path d="M4 8a2 2 0 0 0 0 4v4h16v-4a2 2 0 0 1 0-4V4H4zM10 4v12" />,
  };
  return <svg viewBox="0 0 24 24" aria-hidden="true" className="wl-g" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">{d[n]}</svg>;
}

const Pill = ({ v }: { v: number }) => <span className={`wl-pill ${v >= 0 ? "wl-up" : "wl-down"}`}>{v >= 0 ? "+" : "−"}{Math.abs(v).toFixed(1)}%</span>;

function Spark({ pts, up, id }: { pts: Point[]; up: boolean; id: string }) {
  const ys = pts.map((p) => p.value), lo = Math.min(...ys), hi = Math.max(...ys);
  const line = ys.map((v, i) => `${i ? "L" : "M"}${((i / (ys.length - 1)) * 100).toFixed(2)},${(36 - ((v - lo) / (hi - lo || 1)) * 30 - 3).toFixed(2)}`).join(" ");
  const c = up ? "#3ee0a1" : "#f2555a";
  return (
    <svg className="wl-spark" viewBox="0 0 100 40" preserveAspectRatio="none" aria-hidden="true">
      <defs><linearGradient id={`sp-${id}`} x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor={c} stopOpacity="0.28" /><stop offset="1" stopColor={c} stopOpacity="0" /></linearGradient></defs>
      <path d={`${line} L100,40 L0,40 Z`} fill={`url(#sp-${id})`} />
      <path d={line} className={up ? "wl-sl-up" : "wl-sl-down"} vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

function PriceChart({ m, range }: { m: Metric; range: Range }) {
  const pts = m.series[range];
  const [hot, setHot] = useState<number | null>(null);
  const box = useRef<HTMLDivElement>(null);
  const ys = pts.map((p) => p.value), min = Math.min(...ys), max = Math.max(...ys);
  const raw = (max - min) / 3 || 1, mag = 10 ** Math.floor(Math.log10(raw)), step = [1, 2, 2.5, 5, 10].map((k) => k * mag).find((v) => v >= raw)!;
  const lo = Math.floor(min / step) * step, hi = Math.ceil(max / step) * step;
  const X = (i: number) => (i / (pts.length - 1)) * 1000, Y = (v: number) => 280 - ((v - lo) / (hi - lo || 1)) * 260;
  const line = pts.map((p, i) => `${i ? "L" : "M"}${X(i).toFixed(1)},${Y(p.value).toFixed(1)}`).join(" ");
  const grid = Array.from({ length: Math.round((hi - lo) / step) + 1 }, (_, k) => lo + k * step);
  const p = hot !== null ? pts[hot] : null;
  const onMove = (e: PointerEvent) => {
    const r = box.current?.getBoundingClientRect(); if (!r) return;
    setHot(Math.max(0, Math.min(pts.length - 1, Math.round(((e.clientX - r.left) / r.width) * (pts.length - 1)))));
  };
  return (
    <div className="wl-chart">
      <div className="wl-yaxis" aria-hidden="true">{grid.slice().reverse().map((v) => <span key={v}>{fmtKind(m.kind, v)}</span>)}</div>
      <div ref={box} className="wl-plot" onPointerMove={onMove} onPointerLeave={() => setHot(null)} role="img"
        aria-label={`${m.name}, ${range}: from ${fmtKind(m.kind, pts[0].value)} to ${fmtKind(m.kind, pts[pts.length - 1].value)}`}>
        <svg viewBox="0 0 1000 290" preserveAspectRatio="none" aria-hidden="true">
          <defs>
            <linearGradient id="wl-area" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0" stopColor="#3ee0a1" stopOpacity="0.32" /><stop offset="0.7" stopColor="#3ee0a1" stopOpacity="0.04" /><stop offset="1" stopColor="#3ee0a1" stopOpacity="0" />
            </linearGradient>
          </defs>
          {grid.map((v) => <line key={v} x1="0" x2="1000" y1={Y(v)} y2={Y(v)} className="wl-gridline" vectorEffect="non-scaling-stroke" />)}
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.g key={`${m.key}-${range}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={FADE}>
              <path d={`${line} L1000,290 L0,290 Z`} fill="url(#wl-area)" />
              <motion.path d={line} className="wl-line" vectorEffect="non-scaling-stroke" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.1, ease: EASE }} />
            </motion.g>
          </AnimatePresence>
        </svg>
        {p && hot !== null && (
          <>
            <i className="wl-cross" style={{ left: `${(hot / (pts.length - 1)) * 100}%` }} />
            <i className="wl-dot" style={{ left: `${(hot / (pts.length - 1)) * 100}%`, top: `${(Y(p.value) / 290) * 100}%` }} />
            <div className={`wl-tip${hot > pts.length * 0.7 ? " wl-tip-l" : ""}`} style={{ left: `${(hot / (pts.length - 1)) * 100}%` }}>
              <small>{p.label}</small>
              <div><span><i className="wl-k wl-k-price" />{m.code === "REQUESTS" ? "Requests" : m.name.split(" ")[0] === "Monthly" ? "MRR" : "Workspaces"}</span><b className="wl-num">{fmtKind(m.kind, p.value)}</b></div>
              <div><span><i className="wl-k wl-k-vol" />{m.subLabel}</span><b className="wl-num">{p.sub.toLocaleString("en-GB")}</b></div>
            </div>
          </>
        )}
      </div>
      <div className="wl-xaxis" aria-hidden="true">{[0, 12, 24, 36, 47].map((t) => <span key={t} style={{ left: `${((t / (pts.length - 1)) * 100).toFixed(2)}%` }}>{pts[t].label}</span>)}</div>
    </div>
  );
}

// Requests in every half-hour today, coloured by load
function Load({ pts }: { pts: Point[] }) {
  const [hot, setHot] = useState<number | null>(null);
  const max = Math.max(...pts.map((p) => p.value));
  const band = (v: number) => (v < max * 0.45 ? "lo" : v < max * 0.8 ? "mid" : "hi");
  const counts: Record<string, number> = { lo: 0, mid: 0, hi: 0 };
  pts.forEach((p) => counts[band(p.value)]++);
  const p = hot !== null ? pts[hot] : null, peak = pts.reduce((a, b) => (b.value > a.value ? b : a));
  return (
    <section className="wl-panel wl-spread" aria-labelledby="wl-spread-h">
      <div className="wl-ph"><h2 id="wl-spread-h">Load by half-hour</h2><button type="button" className="wl-iconbtn" aria-label="About this chart"><G n="info" /></button></div>
      <p className="wl-big"><span className="wl-num">{p ? fmtReq(p.value) : fmtReq(peak.value)}</span><small>{p ? `requests at ${p.label}` : `peak, at ${peak.label}`}</small></p>
      <ul className="wl-legend">
        <li><i className="wl-b-lo" />Quiet <b>{counts.lo}</b></li>
        <li><i className="wl-b-mid" />Busy <b>{counts.mid}</b></li>
        <li><i className="wl-b-hi" />Peak <b>{counts.hi}</b></li>
      </ul>
      <div className="wl-bars" onPointerLeave={() => setHot(null)}>
        {pts.map((x, i) => (
          <span key={i} className="wl-barhit" onPointerEnter={() => setHot(i)}>
            <i className={`wl-b-${band(x.value)}${hot !== null && hot !== i ? " wl-fade" : ""}`} style={{ height: `${((x.value / max) * 100).toFixed(1)}%` }} />
          </span>
        ))}
      </div>
    </section>
  );
}

function QuoteCard() {
  const [plan, setPlan] = useState<(typeof PLANS)[number]["key"]>("growth");
  const [seats, setSeats] = useState(25);
  const [annual, setAnnual] = useState(true);
  const p = PLANS.find((x) => x.key === plan)!;
  const list = p.seat * seats, monthly = annual ? list * (1 - ANNUAL_OFF) : list, total = annual ? monthly * 12 : monthly, saved = annual ? list * ANNUAL_OFF * 12 : 0;
  const gbp = (n: number) => fmtGbp(n), gbp2 = (n: number) => fmtGbp(n, 2);
  const set = (n: number) => setSeats(Math.max(1, Math.min(500, Math.round(n) || 1)));
  return (
    <section className="wl-panel wl-trade" aria-labelledby="wl-trade-h">
      <div className="wl-ph"><h2 id="wl-trade-h"><span className="wl-badge"><G n="quote" /></span>Quote builder</h2><span className="wl-count">Draft</span></div>
      <p className="wl-hint">Price a plan for a prospect and send it in one click.</p>
      <fieldset className="wl-plans">
        <legend className="wl-sr">Plan</legend>
        {PLANS.map((x) => (
          <label key={x.key} className={plan === x.key ? "wl-on" : undefined}>
            <input type="radio" name="wl-plan" value={x.key} checked={plan === x.key} onChange={() => setPlan(x.key)} />
            <span className="wl-radio" aria-hidden="true"><G n="check" /></span>
            <span className="wl-pn"><b>{x.name}</b><small>{x.note}</small></span>
            <span className="wl-pp"><b>£{x.seat}</b><small>seat/mo</small></span>
          </label>
        ))}
      </fieldset>
      <div className="wl-qrow">
        <span>Seats</span>
        <div className="wl-stepper">
          <button type="button" aria-label="Fewer seats" onClick={() => set(seats - 1)}><G n="minus" /></button>
          <input value={seats} inputMode="numeric" aria-label="Seats" onChange={(e) => set(Number(e.target.value.replace(/\D/g, "")))} />
          <button type="button" aria-label="More seats" onClick={() => set(seats + 1)}><G n="plus" /></button>
        </div>
      </div>
      <div className="wl-seg" role="group" aria-label="Billing">
        <button type="button" aria-pressed={!annual} onClick={() => setAnnual(false)}>Monthly</button>
        <button type="button" aria-pressed={annual} onClick={() => setAnnual(true)}>Annual <em>−15%</em></button>
      </div>
      <div className="wl-field wl-field-ro">
        <span>{annual ? "Billed yearly" : "Billed monthly"}</span>
        <b><Num value={total} format={gbp} /></b>
        <small><Num value={monthly / seats} format={gbp2} /> per seat a month{annual ? <> · saves <Num value={saved} format={gbp} /></> : null}</small>
      </div>
      <div className="wl-modes">
        <button type="button"><G n="copy" />Copy link</button>
        <button type="button" className="wl-cta">Send quote</button>
      </div>
    </section>
  );
}

const STATUS_CLASS: Record<string, string> = { Active: "wl-s-ok", Trialing: "wl-s-work", "Past due": "wl-s-part", Cancelled: "wl-s-off" };
const initials = (s: string) => s.split(" ").filter((w) => /^[A-Z]/.test(w)).map((w) => w[0]).join("").slice(0, 2);

export default function HalyardSaas() {
  const [sel, setSel] = useState("mrr");
  const [range, setRange] = useState<Range>("1M");
  const [navOpen, setNavOpen] = useState(true);
  const [sort, setSort] = useState<{ k: "order" | "seats" | "mrr"; dir: 1 | -1 }>({ k: "order", dir: -1 });
  const m = METRICS.find((x) => x.key === sel)!;
  const rows = useMemo(() => [...SUBS].sort((a, b) => (a[sort.k] - b[sort.k]) * sort.dir), [sort]);
  const sortBy = (k: "order" | "seats" | "mrr") => setSort((s) => ({ k, dir: s.k === k ? (s.dir === 1 ? -1 : 1) : -1 }));
  const aria = (k: string) => (sort.k === k ? (sort.dir === 1 ? "ascending" : "descending") : "none") as "ascending" | "descending" | "none";
  const gbp2 = (n: number) => fmtGbp(n, 2);
  const tileIcon: Record<string, GlyphName> = { churn: "heart", nrr: "pulse", trial: "clock", tickets: "ticket" };

  return (
    <MotionConfig reducedMotion="user">
      <div className={`wl${navOpen ? "" : " wl-collapsed"} ${geist.variable} ${geistMono.variable} ${funnel.variable}`}>
        <aside className="wl-nav" aria-label="Sidebar">
          <div className="wl-nav-head">
            <div className="wl-brand">
              <span className="wl-logo" aria-hidden="true"><svg viewBox="0 0 24 24" className="wl-g"><path d="M5 19 12 5l7 14M8.5 13h7" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg></span>
              <span className="wl-ws"><b>Halyard</b><small>Acme Cloud</small></span>
            </div>
            <button type="button" className="wl-iconbtn" aria-label={navOpen ? "Collapse sidebar" : "Expand sidebar"} aria-expanded={navOpen} onClick={() => setNavOpen((o) => !o)}><G n="side" /></button>
          </div>
          <div className="wl-welcome"><b>Good afternoon, Priya</b><small>3 invoices are due this week</small></div>
          <nav className="wl-nav-body" aria-label="Main">
            <p className="wl-nav-label">Workspace</p>
            <ul>
              {([["Overview", "grid", ""], ["Customers", "users", ""], ["Subscriptions", "card", "12"], ["Usage", "pulse", ""]] as const).map(([n, g, b]) => (
                <li key={n}><a href="#" className="wl-item" aria-current={n === "Overview" ? "page" : undefined} onClick={(e) => e.preventDefault()}><G n={g} /><span>{n}</span>{b && <em className="wl-cnt">{b}</em>}</a></li>
              ))}
            </ul>
            <p className="wl-nav-label">Account</p>
            <ul>
              <li><a href="#" className="wl-item" onClick={(e) => e.preventDefault()}><G n="receipt" /><span>Billing</span><em className="wl-cnt wl-cnt-warn">3</em></a></li>
              <li><a href="#" className="wl-item" onClick={(e) => e.preventDefault()}><G n="chart" /><span>Reports</span><em className="wl-beta">Beta</em></a></li>
            </ul>
            <p className="wl-nav-label">Pinned accounts</p>
            <ul>
              {SUBS.filter((s) => s.plan === "Scale" || s.status === "Past due").slice(0, 3).map((s) => (
                <li key={s.id}><a href="#" className="wl-item wl-watch" onClick={(e) => e.preventDefault()}><i className="wl-star"><G n="star" /></i><span>{s.company}</span><small className={s.status === "Past due" ? "wl-downc" : "wl-upc"}>{fmtGbp(s.mrr)}</small></a></li>
              ))}
            </ul>
          </nav>
          <button type="button" className="wl-user" aria-label="Account: Priya Shah"><span className="wl-av">PS</span><span className="wl-who"><b>Priya Shah</b><small>Head of revenue</small></span><G n="chev" /></button>
        </aside>

        <div className="wl-body">
          <header className="wl-top">
            <label className="wl-search"><G n="search" /><input type="search" placeholder="Search" aria-label="Search customers and invoices" /><kbd>⌘K</kbd></label>
            <nav className="wl-tabs" aria-label="Sections">
              {([["Overview", "grid"], ["Customers", "users"], ["Usage", "pulse"], ["Billing", "receipt"], ["Reports", "chart"]] as const).map(([n, g]) => (
                <a key={n} href="#" aria-current={n === "Overview" ? "page" : undefined} onClick={(e) => e.preventDefault()}><G n={g} />{n}</a>
              ))}
            </nav>
            <div className="wl-topr">
              <button type="button" className="wl-iconbtn" aria-label="Notifications, 3 new"><G n="bell" /><i className="wl-dotn" /></button>
              <button type="button" className="wl-primary" aria-label="Add customer"><G n="plus" /><span>Add customer</span></button>
            </div>
          </header>

          <div className="wl-ticker" tabIndex={0} role="region" aria-label="Service status">
            {STRIP.map((x) => (
              <span key={x.label} className="wl-tk">
                <span>{x.label}</span><b className="wl-num">{x.value}</b><small className={x.good ? "wl-upc" : "wl-downc"}>{x.change >= 0 ? "▲" : "▼"} {Math.abs(x.change).toFixed(x.change % 1 === 0 ? 0 : x.change < 0.1 && x.change > -0.1 ? 2 : 1)}%</small>
              </span>
            ))}
          </div>

          <main className="wl-main">
            <div className="wl-head">
              <div>
                <p className="wl-live"><i />Live <b>updated 2 min ago</b></p>
                <h1>Revenue overview</h1>
                <p className="wl-lede">Up 4.2% this month, led by two Scale upgrades.</p>
              </div>
              <div className="wl-net">
                <span>Monthly recurring revenue</span>
                <b className="wl-display"><CountUp value={METRICS[0].value} format={(n) => fmtGbp(n)} /></b>
                <small><G n="up" />£3,410 added this month</small>
              </div>
            </div>

            <div className="wl-grid">
              {METRICS.map((x, i) => (
                <button key={x.key} type="button" className={`wl-panel wl-card${sel === x.key ? " wl-sel" : ""}`} aria-pressed={sel === x.key} onClick={() => setSel(x.key)} style={{ gridColumn: i + 1 }}>
                  <span className="wl-card-h"><span className="wl-badge"><G n={i === 0 ? "card" : i === 1 ? "users" : "bolt"} /></span><span><small>{x.code}</small><b>{x.name}</b></span></span>
                  <span className="wl-card-p"><small>{x.key === "req" ? "So far today" : "Right now"}</small><b className="wl-display">{fmtKind(x.kind, x.value)}</b></span>
                  <span className="wl-card-c"><Pill v={x.change} /><small>{x.vs}</small></span>
                  <Spark pts={x.series["1M"]} up={x.change >= 0} id={x.key} />
                </button>
              ))}

              <QuoteCard />

              <section className="wl-panel wl-main-chart" aria-labelledby="wl-chart-h">
                <div className="wl-ph">
                  <div><h2 id="wl-chart-h">{m.name}</h2><p className="wl-sub"><span className="wl-num">{fmtKind(m.kind, m.value)}</span> · <span className={m.change >= 0 ? "wl-upc" : "wl-downc"}>{m.change >= 0 ? "+" : "−"}{Math.abs(m.change).toFixed(1)}%</span> {m.vs}</p></div>
                  <div className="wl-range" role="group" aria-label="Range">
                    {(["1D", "1W", "1M"] as const).map((r) => <button key={r} type="button" aria-pressed={range === r} onClick={() => setRange(r)}>{r}</button>)}
                  </div>
                </div>
                <PriceChart m={m} range={range} />
              </section>

              <div className="wl-tiles">
                {TILES.map((t) => (
                  <div key={t.key} className="wl-panel wl-tile">
                    <span className="wl-tile-h"><G n={tileIcon[t.key]} />{t.label}<i className="wl-tinfo"><G n="info" /></i></span>
                    <b><span className="wl-display">{t.value}</span>{t.unit && <small>{t.unit}</small>}</b>
                    <small className={t.good ? "wl-upc" : "wl-warnc"}>{t.delta}</small>
                  </div>
                ))}
              </div>

              <section className="wl-panel wl-orders" aria-labelledby="wl-orders-h">
                <div className="wl-ph">
                  <h2 id="wl-orders-h"><span className="wl-badge"><G n="card" /></span>Recent subscriptions <span className="wl-chip">{SUBS.length}</span></h2>
                  <button type="button" className="wl-ghost"><G n="cal" />Last 14 days<G n="chev" /></button>
                </div>
                <div className="wl-tablewrap" tabIndex={0} role="region" aria-label="Recent subscriptions">
                  <table>
                    <thead><tr>
                      <th>Customer</th><th>Plan</th>
                      <th aria-sort={aria("seats")} className="wl-r"><button type="button" onClick={() => sortBy("seats")}>Seats<G n={sort.k === "seats" && sort.dir === -1 ? "down" : "up"} /></button></th>
                      <th aria-sort={aria("mrr")} className="wl-r"><button type="button" onClick={() => sortBy("mrr")}>MRR<G n={sort.k === "mrr" && sort.dir === -1 ? "down" : "up"} /></button></th>
                      <th>Usage</th><th>Status</th>
                      <th aria-sort={aria("order")} className="wl-r"><button type="button" onClick={() => sortBy("order")}>Started<G n={sort.k === "order" && sort.dir === -1 ? "down" : "up"} /></button></th>
                    </tr></thead>
                    <tbody>
                      {rows.map((s) => (
                        <tr key={s.id}>
                          <td><span className="wl-cust"><span className="wl-mono-av" aria-hidden="true">{initials(s.company)}</span><span><b>{s.company}</b><small>{s.id}</small></span></span></td>
                          <td>{s.plan}</td>
                          <td className="wl-r wl-num">{s.seats}</td>
                          <td className="wl-r wl-num wl-strong">{gbp2(s.mrr).replace(".00", "")}</td>
                          <td><span className="wl-fill"><i className={s.usage > 85 ? "wl-fill-hot" : undefined} style={{ width: `${s.usage}%` }} /></span><small className="wl-num">{s.usage}%</small></td>
                          <td><span className={`wl-status ${STATUS_CLASS[s.status]}`}>{s.status}</span></td>
                          <td className="wl-r wl-mono">{s.started}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

              <Load pts={METRICS[2].series["1D"]} />
            </div>
          </main>
        </div>
      </div>
    </MotionConfig>
  );
}
