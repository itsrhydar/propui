"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { AnimatePresence, MotionConfig, motion, useReducedMotion, useSpring } from "motion/react";

import { funnel, garamond, geist, geistMono, instrument, instrumentSerif } from "./fonts";
import { CATALOGUE, LOGOS, MODELS, NEXT_DRAFTS, SHOP, THREADS, VOICE, type Draft, type Look, type Thread } from "./data";

import "./post.css";

const EASE = [0.2, 0.7, 0.2, 1] as const;
const SPRING = { type: "spring", stiffness: 210, damping: 28 } as const;

/* ---------- small marks ---------- */

// Tessel: four tiles, one of them turned, like a catalogue being rearranged.
function Mark() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true">
      <rect x="2.5" y="2.5" width="6.5" height="6.5" rx="1.6" fill="currentColor" />
      <rect x="11" y="2.5" width="6.5" height="6.5" rx="1.6" fill="currentColor" opacity="0.55" />
      <rect x="2.5" y="11" width="6.5" height="6.5" rx="1.6" fill="currentColor" opacity="0.55" />
      <rect x="11.6" y="11.6" width="5.6" height="5.6" rx="1.4" fill="currentColor" transform="rotate(45 14.4 14.4)" />
    </svg>
  );
}

const I: Record<string, ReactNode> = {
  chev: <path d="m5 7.5 5 5 5-5" />,
  arrow: <path d="M3.5 10h12M11 5.5l4.5 4.5-4.5 4.5" />,
  up: <path d="M10 15.5v-11M5.5 9 10 4.5 14.5 9" />,
  user: <><circle cx="10" cy="7" r="3" /><path d="M4 16.5c.8-3 3.2-4.5 6-4.5s5.2 1.5 6 4.5" /></>,
  studio: <><path d="M4 15.5 13.5 6l1.5 1.5L5.5 17H4Z" /><path d="m12 4 1-2 1 2 2 1-2 1-1 2-1-2-2-1Z" /></>,
  catalogue: <><rect x="3.5" y="3.5" width="5.5" height="5.5" rx="1" /><rect x="11" y="3.5" width="5.5" height="5.5" rx="1" /><rect x="3.5" y="11" width="5.5" height="5.5" rx="1" /><rect x="11" y="11" width="5.5" height="5.5" rx="1" /></>,
  reviews: <><path d="M4 4.5h12v8.5H8l-4 3Z" /><path d="m7.5 8.8 1.8 1.7 3.4-3.5" /></>,
  voice: <><path d="M5 8v4M8 5.5v9M11 7v6M14 4.5v11" /></>,
  globe: <><circle cx="10" cy="10" r="6.5" /><path d="M3.5 10h13M10 3.5c2 2 2.8 4.2 2.8 6.5s-.8 4.5-2.8 6.5c-2-2-2.8-4.2-2.8-6.5s.8-4.5 2.8-6.5Z" /></>,
  plug: <><path d="M7 3.5v4M13 3.5v4M5 7.5h10v2.5a5 5 0 0 1-10 0Z" /><path d="M10 15v2" /></>,
  card: <><rect x="3" y="5" width="14" height="10" rx="1.5" /><path d="M3 8.5h14" /></>,
  team: <><circle cx="7.5" cy="7.5" r="2.5" /><path d="M3 16c.6-2.6 2.4-4 4.5-4s3.9 1.4 4.5 4" /><circle cx="14" cy="8" r="2" /><path d="M13 12.2c2 .1 3.4 1.4 4 3.8" /></>,
  panel: <><rect x="3" y="4" width="14" height="12" rx="2" /><path d="M8 4v12" /></>,
  plus: <path d="M10 4.5v11M4.5 10h11" />,
  clip: <path d="m14.5 9.5-5.2 5.2a3 3 0 0 1-4.3-4.3l6-6a2 2 0 0 1 2.9 2.9l-5.8 5.8a1 1 0 0 1-1.5-1.5l5.1-5.1" />,
  at: <><circle cx="10" cy="10" r="2.8" /><path d="M12.8 10v1.2a1.8 1.8 0 0 0 3.6 0V10a6.4 6.4 0 1 0-2.6 5.2" /></>,
  thread: <path d="M4.5 5h11v7.5H9l-3 2.5v-2.5H4.5Z" />,
  doc: <><path d="M5.5 3.5h6l3 3v10h-9Z" /><path d="M11.5 3.5v3h3" /></>,
  check: <path d="m5 10.5 3 3 7-7" />,
};
function Ic({ n, className = "ts-ic" }: { n: keyof typeof I; className?: string }) {
  return <svg className={className} viewBox="0 0 20 20" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">{I[n]}</svg>;
}

/* ---------- site nav ---------- */

const MENUS: { id: string; label: string; items: [string, string][] }[] = [
  { id: "product", label: "Product", items: [["Studio", "Prompt, review, publish"], ["Brand voice", "Rules your copy keeps"], ["Translate", "14 languages, one voice"]] },
  { id: "use", label: "Use cases", items: [["New ranges", "Copy for a launch in an afternoon"], ["Rewrites", "Old pages in your current voice"], ["Marketplaces", "Titles that fit each channel"]] },
  { id: "connect", label: "Integrations", items: [["Shopify", "Sync products both ways"], ["WooCommerce", "Drafts land as revisions"], ["CSV", "Upload, rewrite, download"]] },
  { id: "learn", label: "Resources", items: [["Guides", "Writing for product pages"], ["Changelog", "What shipped this month"], ["Help", "Answers from the team"]] },
];

function SiteNav() {
  const [open, setOpen] = useState<string | null>(null);
  const [sheet, setSheet] = useState(false);
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    if (!open && !sheet) return;
    const onKey = (e: globalThis.KeyboardEvent) => { if (e.key === "Escape") { setOpen(null); setSheet(false); } };
    const onDown = (e: PointerEvent) => { if (!ref.current?.contains(e.target as Node)) { setOpen(null); setSheet(false); } };
    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerdown", onDown);
    return () => { window.removeEventListener("keydown", onKey); window.removeEventListener("pointerdown", onDown); };
  }, [open, sheet]);
  return (
    <header className="ts-nav" ref={ref}>
      <a href="#" className="ts-word" aria-label="Tessel home"><Mark /><span translate="no">tessel</span></a>
      <nav aria-label="Main" className="ts-menus">
        {MENUS.map((m) => (
          <div key={m.id} className="ts-menu">
            <button type="button" aria-expanded={open === m.id} aria-controls={`ts-dd-${m.id}`} onClick={() => setOpen((o) => (o === m.id ? null : m.id))}>
              {m.label}<Ic n="chev" className="ts-chev" />
            </button>
            <div id={`ts-dd-${m.id}`} className="ts-dd" data-open={open === m.id} inert={open !== m.id || undefined}>
              {m.items.map(([t, d]) => (
                <a key={t} href="#" onClick={() => setOpen(null)}><b>{t}</b><span>{d}</span></a>
              ))}
            </div>
          </div>
        ))}
        <a href="#" className="ts-plain">Pricing</a>
      </nav>
      <div className="ts-navr">
        <a href="#" className="ts-login"><Ic n="user" />Log in</a>
        <a href="#" className="ts-btn ts-btn-line ts-btn-sm ts-hide-sm">Book a walkthrough</a>
        <a href="#" className="ts-btn ts-btn-ink ts-btn-sm">Start free</a>
        <button type="button" className="ts-burger" aria-label="Menu" aria-expanded={sheet} aria-controls="ts-sheet" onClick={() => setSheet((s) => !s)}>
          <svg viewBox="0 0 20 20" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d={sheet ? "m5 5 10 10M15 5 5 15" : "M3.5 7h13M3.5 13h13"} /></svg>
        </button>
      </div>
      <div id="ts-sheet" className="ts-sheet" data-open={sheet} inert={!sheet || undefined}>
        {MENUS.map((m) => <a key={m.id} href="#" onClick={() => setSheet(false)}>{m.label}</a>)}
        <a href="#" onClick={() => setSheet(false)}>Pricing</a>
        <a href="#" className="ts-sheet-sub" onClick={() => setSheet(false)}>Log in</a>
      </div>
    </header>
  );
}

/* ---------- product looks: drawn, not photographed ---------- */

// A knitted swatch (stocking stitch, a cable down the middle, or a rib) or a glazed surface, lit from the top left.
function Product({ look }: { look: Look }) {
  const uid = useId().replace(/:/g, "");
  if (look.kind === "glaze") {
    const [base, deep, light] = look.glaze;
    return (
      <svg className="ts-look" viewBox="0 0 240 120" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <defs>
          <linearGradient id={`${uid}g`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={light} /><stop offset="0.55" stopColor={base} /><stop offset="1" stopColor={deep} />
          </linearGradient>
          <radialGradient id={`${uid}s`} cx="28%" cy="18%" r="70%"><stop offset="0" stopColor="#fff" stopOpacity="0.55" /><stop offset="0.5" stopColor="#fff" stopOpacity="0" /></radialGradient>
          <filter id={`${uid}n`}><feTurbulence type="fractalNoise" baseFrequency="1.6" numOctaves="1" seed="4" /><feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.16 0" /></filter>
        </defs>
        <rect width="240" height="120" fill={`url(#${uid}g)`} />
        {/* glaze pooling in drips from the rim */}
        <path d="M0 0h240v34c-14 0-14 18-28 18s-12-12-26-12-14 26-30 26-14-20-30-20-14 14-30 14-16-22-32-22-14 30-30 30-14-18-28-18S0 46 0 46Z" fill={light} opacity="0.55" />
        <rect width="240" height="120" fill={`url(#${uid}s)`} />
        <rect width="240" height="120" filter={`url(#${uid}n)`} />
      </svg>
    );
  }
  const [base, shade, light] = look.yarn;
  return (
    <svg className="ts-look" viewBox="0 0 240 120" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <pattern id={`${uid}v`} width="12" height="11" patternUnits="userSpaceOnUse">
          <rect width="12" height="11" fill={shade} />
          <ellipse cx="3.4" cy="5.5" rx="2.6" ry="5" fill={base} transform="rotate(-28 3.4 5.5)" />
          <ellipse cx="8.6" cy="5.5" rx="2.6" ry="5" fill={base} transform="rotate(28 8.6 5.5)" />
          <ellipse cx="3" cy="4" rx="1" ry="2.4" fill={light} opacity="0.55" transform="rotate(-28 3 4)" />
        </pattern>
        <pattern id={`${uid}r`} width="24" height="11" patternUnits="userSpaceOnUse">
          <rect width="24" height="11" fill={shade} />
          <ellipse cx="3.4" cy="5.5" rx="2.6" ry="5" fill={base} transform="rotate(-28 3.4 5.5)" />
          <ellipse cx="8.6" cy="5.5" rx="2.6" ry="5" fill={base} transform="rotate(28 8.6 5.5)" />
          <rect x="13" width="9" height="11" fill={shade} opacity="0.7" />
        </pattern>
        <pattern id={`${uid}c`} width="56" height="40" patternUnits="userSpaceOnUse">
          <rect width="56" height="40" fill={shade} />
          <path d="M8 0C8 14 34 14 34 20S8 26 8 40" fill="none" stroke={base} strokeWidth="13" strokeLinecap="round" />
          <path d="M48 0C48 14 22 14 22 20S48 26 48 40" fill="none" stroke={light} strokeWidth="13" strokeLinecap="round" opacity="0.92" />
          <path d="M48 0C48 14 22 14 22 20" fill="none" stroke={base} strokeWidth="9" strokeLinecap="round" />
        </pattern>
        <radialGradient id={`${uid}l`} cx="22%" cy="10%" r="100%">
          <stop offset="0" stopColor="#fff" stopOpacity="0.3" /><stop offset="0.55" stopColor="#fff" stopOpacity="0" /><stop offset="1" stopColor="#000" stopOpacity="0.22" />
        </radialGradient>
      </defs>
      <rect width="240" height="120" fill={`url(#${uid}${look.stitch === "rib" ? "r" : "v"})`} />
      {look.stitch === "cable" && (
        <>
          <rect x="92" width="56" height="120" fill={`url(#${uid}c)`} />
          <rect x="88" width="4" height="120" fill={shade} opacity="0.8" />
          <rect x="148" width="4" height="120" fill={shade} opacity="0.8" />
        </>
      )}
      <rect width="240" height="120" fill={`url(#${uid}l)`} />
    </svg>
  );
}

/* ---------- the app: drafts that stream in ---------- */

// Text that writes itself once, quickly, when a card finishes; instant under reduced motion.
function Typed({ text }: { text: string }) {
  const reduced = useReducedMotion();
  const [n, setN] = useState(reduced ? text.length : 0);
  useEffect(() => {
    if (reduced) return;
    let raf = 0;
    const t0 = performance.now();
    const tick = (t: number) => {
      const k = Math.min(1, (t - t0) / 900);
      setN(Math.round(text.length * k));
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [text, reduced]);
  return <>{text.slice(0, reduced ? text.length : n)}</>;
}

type Phase = 0 | 1 | 2; // waiting, writing, done

function DraftCard({ d, phase, approved, onApprove, fresh }: { d: Draft; phase: Phase; approved: boolean; onApprove: () => void; fresh: boolean }) {
  return (
    <motion.li className={`ts-draft ${phase < 2 ? "ts-draft-wait" : ""} ${approved ? "ts-draft-ok" : ""}`} layout="position" transition={SPRING}>
      <AnimatePresence mode="popLayout" initial={false}>
        {phase < 2 ? (
          <motion.div key="w" className="ts-writing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
            <i className="ts-skl ts-skl-look" />
            <span className="ts-wlabel">{phase === 1 ? <><b className="ts-pen" aria-hidden="true" />Writing</> : "Queued"}</span>
            <i className="ts-skl" /><i className="ts-skl" /><i className="ts-skl" style={{ width: "58%" }} />
          </motion.div>
        ) : (
          <motion.div key="d" className="ts-done" initial={{ opacity: 0, filter: "blur(3px)" }} animate={{ opacity: 1, filter: "blur(0px)" }} transition={{ duration: 0.35, ease: EASE }}>
            <div className="ts-lookbox">
              <Product look={d.look} />
              <AnimatePresence>
                {approved && (
                  <motion.span key="stamp" className="ts-stamp" aria-hidden="true" initial={{ opacity: 0, scale: 1.6, rotate: -14 }} animate={{ opacity: 1, scale: 1, rotate: -8 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ type: "spring", stiffness: 420, damping: 22 }}>
                    <Ic n="check" />Approved
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
            <p className="ts-dt"><span>{d.title}</span><em aria-label={`Brand voice match ${d.voice}%`}>{d.voice}%</em></p>
            {d.before && <p className="ts-before"><s>{d.before}</s></p>}
            {/* clamped to three lines on purpose: the hidden lines still measure as overlapping text */}
            <p className="ts-db" data-qa-allow="overlap clip">{fresh ? <Typed text={d.body} /> : d.body}</p>
            <div className="ts-dfoot">
              <span className="ts-lang">{d.lang}</span>
              <span>{d.words} {d.lang === "NL" ? "woorden" : "words"}</span>
              <button type="button" className={`ts-approve ${approved ? "ts-approved" : ""}`} aria-pressed={approved} onClick={onApprove}>
                {approved ? <><Ic n="check" />Approved</> : "Approve"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.li>
  );
}

// The composer: a textarea with a highlighted mirror behind it, so an @mention shows in blue as you type.
function Mirror({ text }: { text: string }) {
  const parts = text.split(/(@[A-Za-z][\w ]*?v\d+|@[A-Za-z][\w-]*)/g);
  return <>{parts.map((p, i) => (p.startsWith("@") ? <mark key={i}>{p}</mark> : <span key={i}>{p}</span>))}{"​"}</>;
}

type View = "studio" | "catalogue" | "reviews" | "voice";
const VIEWS: { id: View; label: string; icon: keyof typeof I; badge?: string }[] = [
  { id: "studio", label: "Studio", icon: "studio" },
  { id: "catalogue", label: "Catalogue", icon: "catalogue" },
  { id: "reviews", label: "Reviews", icon: "reviews", badge: "12" },
  { id: "voice", label: "Brand voice", icon: "voice" },
];

function App() {
  const reduced = useReducedMotion();
  const [view, setView] = useState<View>("studio");
  const [threads, setThreads] = useState<Thread[]>(THREADS);
  const [active, setActive] = useState(THREADS[0].id);
  // Card phases per thread: the first thread opens with its last card still writing.
  const [phases, setPhases] = useState<Record<string, Phase[]>>({ "knit-nl": [2, 2, 1], "cer-titles": [2, 2, 2], "gift-intros": [2, 2, 2] });
  // Cards that finish while you watch type themselves out; the ones already done on load are just there.
  const [fresh, setFresh] = useState<Record<string, boolean>>({});
  const [approved, setApproved] = useState<Record<string, boolean>>({});
  const [model, setModel] = useState(MODELS[0]);
  const [picker, setPicker] = useState(false);
  const [formats, setFormats] = useState<Record<string, boolean>>({ page: true, lang: true, short: true, warm: false });
  const [text, setText] = useState("Write the winter accessories range for the UK store, using @Brand voice v3");
  const timers = useRef<number[]>([]);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const pickRef = useRef<HTMLDivElement>(null);

  // Writes the cards of a thread one after another: each is "Writing…" for a beat, then fills.
  const stream = (id: string, from: Phase[]) => {
    const step = reduced ? 0 : 1100;
    let p = [...from];
    const next = () => {
      const i = p.findIndex((x) => x < 2);
      if (i < 0) return;
      if (p[i] === 0) p[i] = 1;
      else { p[i] = 2; if (p[i + 1] === 0) p[i + 1] = 1; setFresh((s) => ({ ...s, [`${id}:${i}`]: true })); }
      p = [...p];
      setPhases((s) => ({ ...s, [id]: p }));
      if (p.some((x) => x < 2)) timers.current.push(window.setTimeout(next, step));
    };
    timers.current.push(window.setTimeout(next, reduced ? 0 : 1600));
  };

  useEffect(() => {
    stream("knit-nl", [2, 2, 1]);
    const t = timers.current;
    return () => t.forEach((x) => window.clearTimeout(x));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!picker) return;
    const onDown = (e: PointerEvent) => { if (!pickRef.current?.contains(e.target as Node)) setPicker(false); };
    window.addEventListener("pointerdown", onDown);
    return () => window.removeEventListener("pointerdown", onDown);
  }, [picker]);

  const send = () => {
    const prompt = text.trim();
    if (!prompt) return;
    const n = threads.length;
    const id = `new-${n}`;
    const t: Thread = { id, title: prompt.replace(/,? using @.*$/, "").slice(0, 40), when: "Now", prompt, intro: "Three of 16 products, in your voice.", drafts: NEXT_DRAFTS.map((d) => ({ ...d, id: `${d.id}-${n}` })) };
    setThreads((s) => [t, ...s]);
    setActive(id);
    setView("studio");
    setPhases((s) => ({ ...s, [id]: [1, 0, 0] }));
    setText("");
    stream(id, [1, 0, 0]);
  };
  const onKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
  };

  const th = threads.find((x) => x.id === active)!;
  const ph = phases[th.id] ?? [2, 2, 2];
  const writing = ph.some((x) => x < 2);
  const current = VIEWS.find((v) => v.id === view)!;

  return (
    <div className="ts-app">
      <aside className="ts-side" aria-label="Tessel">
        <div className="ts-dots" aria-hidden="true"><i /><i /><i /></div>
        <div className="ts-aword"><Mark /><span>tessel</span><Ic n="panel" className="ts-ic ts-dim" /></div>
        <nav className="ts-anav" aria-label="App">
          {VIEWS.map((v) => (
            <button key={v.id} type="button" aria-current={view === v.id ? "page" : undefined} onClick={() => setView(v.id)}>
              {view === v.id && <motion.span layoutId="ts-anav-on" layoutDependency={view} className="ts-anav-on" transition={SPRING} />}
              <Ic n={v.icon} /><span>{v.label}</span>{v.badge && <em>{v.badge}</em>}
            </button>
          ))}
          <a href="#"><Ic n="globe" /><span>Languages</span></a>
          <a href="#"><Ic n="plug" /><span>Integrations</span></a>
        </nav>
        <div className="ts-aset">
          <p>Settings</p>
          <a href="#"><Ic n="card" /><span>Billing</span></a>
          <a href="#"><Ic n="team" /><span>Team</span></a>
        </div>
      </aside>

      <div className="ts-threads">
        <div className="ts-thead">
          <Ic n="panel" className="ts-ic ts-dim" />
          <button type="button" aria-label="New prompt" onClick={() => { setView("studio"); inputRef.current?.focus(); }}><Ic n="plus" /></button>
        </div>
        <p className="ts-tlabel">Today</p>
        <ul>
          {threads.map((t) => (
            <li key={t.id}>
              <button type="button" aria-current={view === "studio" && active === t.id ? "true" : undefined} onClick={() => { setActive(t.id); setView("studio"); }}>
                <Ic n="thread" /><span>{t.title}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      <section className="ts-main" aria-label={current.label}>
        <div className="ts-crumb">
          <span>{SHOP.name}</span><i>/</i><b>{current.label}</b>
          <span className="ts-me" aria-hidden="true">{SHOP.initials}</span>
        </div>

        <AnimatePresence mode="popLayout" initial={false}>
          <motion.div key={view === "studio" ? `studio-${th.id}` : view} className="ts-pane" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18, ease: EASE }}>
            {view === "studio" && (
              <div className="ts-studio">
                <div className="ts-ask"><p>{th.prompt.split(/(@Brand voice v3)/).map((p, i) => (p.startsWith("@") ? <mark key={i}>{p}</mark> : p))}</p><span aria-hidden="true">{SHOP.initials}</span></div>
                <div className="ts-reply">
                  <span className="ts-rmark"><Mark /></span>
                  <div>
                    <p className="ts-status">{writing ? <>Writing<span className="ts-ell">…</span></> : "Done"} <em>{model.name}</em></p>
                    <p className="ts-intro">{th.intro}</p>
                  </div>
                </div>
                <ul className="ts-grid" aria-live="polite">
                  {th.drafts.map((d, i) => (
                    <DraftCard key={d.id} d={d} phase={ph[i]} fresh={!!fresh[`${th.id}:${i}`]} approved={!!approved[d.id]} onApprove={() => setApproved((s) => ({ ...s, [d.id]: !s[d.id] }))} />
                  ))}
                </ul>
              </div>
            )}

            {view === "catalogue" && (
              <table className="ts-table">
                <thead><tr><th>Product</th><th>Status</th><th>Languages</th><th>Updated</th></tr></thead>
                <tbody>
                  {CATALOGUE.map((r) => (
                    <tr key={r.name}><td>{r.name}</td><td><span className={`ts-st ts-st-${r.status.split(" ")[0].toLowerCase()}`}>{r.status}</span></td><td className="ts-mono">{r.langs}</td><td>{r.updated}</td></tr>
                  ))}
                </tbody>
              </table>
            )}

            {view === "reviews" && (
              <ul className="ts-rev">
                {threads.flatMap((t) => t.drafts).slice(0, 6).map((d) => (
                  <li key={d.id}>
                    <span className="ts-lang">{d.lang}</span>
                    <p><b>{d.title}</b><span>{d.body}</span></p>
                    <button type="button" className={`ts-approve ${approved[d.id] ? "ts-approved" : ""}`} aria-pressed={!!approved[d.id]} onClick={() => setApproved((s) => ({ ...s, [d.id]: !s[d.id] }))}>
                      {approved[d.id] ? <><Ic n="check" />Approved</> : "Approve"}
                    </button>
                  </li>
                ))}
              </ul>
            )}

            {view === "voice" && (
              <div className="ts-voicepane">
                <p className="ts-vh">Brand voice v3 <span>used on every draft</span></p>
                <ol>
                  {VOICE.map((v) => <li key={v.rule}><b>{v.rule}</b>{v.eg && <span>{v.eg}</span>}</li>)}
                </ol>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="ts-compose">
          <div className="ts-box">
            <div className="ts-field">
              <div className="ts-mirror" aria-hidden="true"><Mirror text={text} /></div>
              <textarea ref={inputRef} rows={2} aria-label="Ask Tessel" placeholder="Ask for copy, titles or translations…" value={text} onChange={(e) => setText(e.target.value)} onKeyDown={onKey} />
            </div>
            <div className="ts-tools">
              <button type="button" className="ts-round" aria-label="Attach a file"><Ic n="clip" /></button>
              <button type="button" className="ts-round" aria-label="Mention" onClick={() => { setText((t) => (t.includes("@Brand voice v3") ? t : `${t}${t && !t.endsWith(" ") ? " " : ""}@Brand voice v3`)); inputRef.current?.focus(); }}><Ic n="at" /></button>
              <div className="ts-pick" ref={pickRef}>
                <button type="button" className="ts-model" aria-haspopup="listbox" aria-expanded={picker} onClick={() => setPicker((p) => !p)}>{model.name}<Ic n="chev" className="ts-chev" /></button>
                <AnimatePresence>
                  {picker && (
                    <motion.ul role="listbox" aria-label="Model" className="ts-models" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 4 }} transition={{ duration: 0.16, ease: EASE }}>
                      {MODELS.map((m) => (
                        <li key={m.id} role="option" aria-selected={m.id === model.id}>
                          <button type="button" onClick={() => { setModel(m); setPicker(false); }}><b>{m.name}</b><span>{m.note}</span></button>
                        </li>
                      ))}
                    </motion.ul>
                  )}
                </AnimatePresence>
              </div>
              <button type="button" className="ts-send" aria-label="Send" disabled={!text.trim()} onClick={send}><Ic n="up" /></button>
            </div>
          </div>
          <div className="ts-formats" role="group" aria-label="Format">
            {([["page", "Product page", "doc"], ["lang", "EN, NL", "globe"], ["short", "Under 90 words", "voice"], ["warm", "Warm", "studio"]] as const).map(([k, l, ic]) => (
              <button key={k} type="button" aria-pressed={!!formats[k]} onClick={() => setFormats((f) => ({ ...f, [k]: !f[k] }))}><Ic n={ic} />{l}</button>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

/* ---------- the painted light: soft pigment that orbits and leans toward the pointer ---------- */

function Pigment() {
  const ref = useRef<HTMLDivElement>(null);
  const lx = useSpring(0, { stiffness: 40, damping: 18 }), ly = useSpring(0, { stiffness: 40, damping: 18 });
  // Pause the drift while the panel is off screen.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => { el.dataset.paused = e.isIntersecting ? "" : "1"; });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  // A slight lean toward the pointer, on mouse devices only.
  useEffect(() => {
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    const move = (e: globalThis.PointerEvent) => {
      lx.set((e.clientX / window.innerWidth - 0.5) * 40);
      ly.set((e.clientY / window.innerHeight - 0.5) * 30);
    };
    window.addEventListener("pointermove", move);
    return () => window.removeEventListener("pointermove", move);
  }, [lx, ly]);
  return (
    <div className="ts-pigment" ref={ref} aria-hidden="true">
      <motion.div className="ts-blobs" style={{ x: lx, y: ly }}>
        <i /><i /><i /><i /><i /><i /><i />
      </motion.div>
    </div>
  );
}

// Small invented marks so each wordmark reads as its own shop.
const GLYPHS: (ReactNode | null)[] = [
  null,
  <svg key="g1" viewBox="0 0 20 20" aria-hidden="true" className="ts-gl"><path d="M3 15c3-8 11-8 14 0" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" /><circle cx="10" cy="6" r="2" fill="currentColor" /></svg>,
  <span key="g2" aria-hidden="true" className="ts-o" />,
  <svg key="g3" viewBox="0 0 20 20" aria-hidden="true" className="ts-gl"><path d="M4 16V7l6-4 6 4v9" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" /><path d="M8 16v-5h4v5" fill="none" stroke="currentColor" strokeWidth="1.8" /></svg>,
  <svg key="g4" viewBox="0 0 20 20" aria-hidden="true" className="ts-gl"><path d="M2 12c2.5-3 5.5-3 8 0s5.5 3 8 0M2 7c2.5-3 5.5-3 8 0s5.5 3 8 0" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>,
  null,
  <svg key="g6" viewBox="0 0 20 20" aria-hidden="true" className="ts-gl"><path d="M10 2 18 18H2Z" fill="currentColor" /></svg>,
];

/* ---------- the hero ---------- */

export default function TesselHero() {
  return (
    <MotionConfig reducedMotion="user">
      <div className={`ts ${instrument.variable} ${geist.variable} ${geistMono.variable} ${funnel.variable} ${garamond.variable} ${instrumentSerif.variable}`}>
        <a href="#" className="ts-strip">
          <span className="ts-long">Tessel now writes in 14 languages, Polish and Finnish included.</span><span className="ts-short">Tessel now writes in 14 languages</span>
          <u><span className="ts-long">See what changed</span> <Ic n="arrow" /></u>
        </a>
        <SiteNav />

        <section className="ts-hero" aria-labelledby="ts-h">
          <motion.p className="ts-eyebrow" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: EASE }}><i aria-hidden="true" /><b>New</b>Catalogue studio, now in 14 languages</motion.p>
          <h1 id="ts-h">Every product page,<br />rewritten by morning.</h1>
          <motion.div className="ts-under" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1, ease: EASE }}>
            <p className="ts-lede">Tessel reads your catalogue, your brand guide and the pages that already sell, then drafts new copy for every product in every language you ship to. Nothing goes live until someone on your team approves it.</p>
            <div className="ts-ctas">
              <a href="#" className="ts-btn ts-btn-line">See a sample rewrite</a>
              <a href="#" className="ts-btn ts-btn-ink">Start free<Ic n="arrow" className="ts-ic ts-go" /></a>
            </div>
          </motion.div>

          <motion.div className="ts-paint" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.15, ease: EASE }}>
            <Pigment />
            {/* the app rises into the light once, then hands over */}
            <motion.div className="ts-window" initial={{ opacity: 0, y: 48 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.1, delay: 0.45, ease: EASE }}><App /></motion.div>
          </motion.div>
        </section>

        <section className="ts-proof" aria-label="Shops using Tessel">
          <p>Shops that rewrote their catalogues with Tessel this season</p>
          <ul>
            {LOGOS.map((l, i) => <li key={l} className={`ts-logo ts-logo-${i}`}>{GLYPHS[i]}{l}</li>)}
          </ul>
        </section>
      </div>
    </MotionConfig>
  );
}
