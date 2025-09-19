import "@radix-ui/themes/styles.css";
import {
  Theme,
  Flex,
  Box,
  Heading,
  Text,
  Select,
  Button,
  Link,
} from "@radix-ui/themes";
import * as React from "react";
import * as Toggle from "@radix-ui/react-toggle";
import { DOG_B64 } from "./wolfie.ts";
import { COUNTRIES } from "./countries.ts";

/* -------- design tokens -------- */
const PINK = "#ec4899";
const PINK_HOVER = "#db2777";
const GRAY_TRACK = "var(--gray-4)";
const NAV_HEIGHT = 64;

/* -------- helpers -------- */
const joinGroup = (items: string[], op: "AND" | "OR") =>
  items.length <= 1 ? items.join("") : `(${items.join(` ${op} `)})`;
const quote = (s: string) => `"${s.trim().replace(/"/g, '\\"')}"`;
const splitCsv = (csv: string) =>
  csv
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

const buildQuery = ({
  site,
  types,
  keywords,
  kwJoin,
  locations,
  excludes,
}: {
  site: string;
  types: string[];
  keywords: string[];
  kwJoin: "AND" | "OR";
  locations: string[];
  excludes: string[];
}) => {
  const sitePart = site.trim() ? `site:${site.trim()}` : "";
  const typePart = joinGroup(types.map(quote), "OR");
  const kwPart = joinGroup(keywords.map(quote), kwJoin);
  const locPart = locations.length ? joinGroup(locations.map(quote), "OR") : "";
  const excludePart = excludes.length
    ? `-${joinGroup(excludes.map(quote), "OR")}`
    : "";
  const positive = [sitePart, typePart, kwPart, locPart]
    .filter(Boolean)
    .join(" AND ");
  return [positive, excludePart].filter(Boolean).join(" ");
};

/* -------- presets -------- */
const PRESETS: Record<string, string[]> = {
  Frontend: ["react", "typescript", "angular", "vue", "next.js", "vite"],
  Backend: ["node", "java", "python", "golang", "django", "spring boot"],
  Mobile: ["react native", "flutter", "swift", "kotlin", "android", "ios"],
  DataAI: [
    "machine learning",
    "deep learning",
    "nlp",
    "pytorch",
    "tensorflow",
    "llm",
  ],
};

/** Site suggestions */
const SITE_SUGGESTIONS = [
  "github.com",
  "linkedin.com",
  "wellfound.com",
  "stackoverflow.com",
  "glassdoor.com",
  "indeed.com",
  "lever.co",
  "greenhouse.io",
  "hired.com",
  "monster.com",
  "ziprecruiter.com",
  "careerbuilder.com",
  "dribbble.com",
  "behance.net",
  "remoteok.com",
  "weworkremotely.com",
  "eurojobs.com",
  "jobsite.co.uk",
  "reed.co.uk",
  "stepstone.de",
  "jobs.ch",
  "irishjobs.ie",
];

/* -------- modern pill -------- */
const Chip: React.FC<{
  pressed: boolean;
  onPressedChange: (v: boolean) => void;
  children: React.ReactNode;
}> = ({ pressed, onPressedChange, children }) => {
  const base: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "10px 16px",
    borderRadius: 10,
    fontSize: 16,
    fontWeight: 700,
    cursor: "pointer",
    userSelect: "none",
    transition:
      "background 120ms ease, transform 80ms ease, color 120ms ease, border-color 120ms ease",
    background: pressed ? PINK : "var(--gray-2)",
    color: pressed ? "#fff" : "var(--gray-12)",
    margin: 6,
    border: pressed ? "1px solid transparent" : "1px solid var(--gray-5)",
  };
  return (
    <Toggle.Root
      pressed={pressed}
      onPressedChange={onPressedChange}
      style={base}
      onMouseEnter={(e) => {
        if (pressed)
          (e.currentTarget as HTMLElement).style.background = PINK_HOVER;
      }}
      onMouseLeave={(e) => {
        if (pressed) (e.currentTarget as HTMLElement).style.background = PINK;
      }}
    >
      {children}
    </Toggle.Root>
  );
};

/* -------- underline input -------- */
const UnderlineInput: React.FC<{
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}> = ({ value, onChange, placeholder }) => (
  <input
    value={value}
    onChange={(e) => onChange(e.target.value)}
    placeholder={placeholder}
    style={{
      width: "100%",
      maxWidth: 640,
      fontSize: 28,
      fontWeight: 700,
      padding: "14px 6px",
      border: "none",
      borderBottom: "2px solid var(--gray-6)",
      outline: "none",
      textAlign: "center",
      background: "transparent",
      fontFamily: "Montserrat, system-ui",
    }}
    onFocus={(e) => (e.currentTarget.style.borderBottomColor = PINK)}
    onBlur={(e) => (e.currentTarget.style.borderBottomColor = "var(--gray-6)")}
  />
);

/* -------- greeting (GMT) -------- */
const getGmtGreeting = () => {
  const hour = new Date().getUTCHours(); // GMT
  if (hour >= 5 && hour < 12) return { emoji: "🌅", label: "Good morning" };
  if (hour >= 12 && hour < 18) return { emoji: "🌞", label: "Good afternoon" };
  return { emoji: "🌙", label: "Good evening" };
};

/* ========= Confetti (canvas / JS) ========= */
const Confetti: React.FC<{ active: boolean; durationMs?: number }> = ({
  active,
  durationMs = 3000,
}) => {
  const ref = React.useRef<HTMLCanvasElement | null>(null);

  React.useEffect(() => {
    if (!active || !ref.current) return;

    const canvas = ref.current;
    const ctx = canvas.getContext("2d")!;
    let w = (canvas.width = window.innerWidth);
    let h = (canvas.height = window.innerHeight);

    const onResize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", onResize);

    type Part = {
      x: number;
      y: number;
      r: number; // size
      vx: number;
      vy: number;
      rot: number;
      vr: number;
      color: string;
      shape: "rect" | "circle";
      dead: boolean;
      seed: number; // for per-particle wind variation
    };

    const colors = [
      "#ff3b30",
      "#ffcc00",
      "#34c759",
      "#0a84ff",
      "#bf5af2",
      "#ff9f0a",
      "#ff375f",
    ];

    const DENSITY = Math.round(Math.min(300, w / 5));
    const parts: Part[] = Array.from({ length: DENSITY }).map(() => ({
      x: Math.random() * w,
      y: -20 - Math.random() * h, // start above viewport
      r: 4 + Math.random() * 6,
      vx: -2 + Math.random() * 4,
      vy: 2 + Math.random() * 4,
      rot: Math.random() * Math.PI,
      vr: -0.2 + Math.random() * 0.4,
      color: colors[Math.floor(Math.random() * colors.length)],
      shape: Math.random() < 0.5 ? "rect" : "circle",
      dead: false,
      seed: Math.random() * 1000,
    }));

    const start = performance.now();
    let recycle = true; // while true, pieces that exit are recycled from top
    let raf = 0;

    const tick = (t: number) => {
      const elapsed = t - start;
      if (elapsed >= durationMs) recycle = false;

      // physics coefficients
      const gravity = 0.035; // downward accel
      const drag = 0.995; // air resistance
      const wind = (time: number, seed: number) =>
        Math.sin((time + seed) * 0.003) * 0.08; // subtle horizontal swish

      ctx.clearRect(0, 0, w, h);

      let alive = 0;

      for (const p of parts) {
        if (p.dead) continue;

        // integrate
        p.vy += gravity;
        p.vx += wind(t, p.seed);
        p.vx *= drag;
        p.vy *= drag;
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.vr;

        // draw
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;

        if (p.shape === "rect") {
          ctx.fillRect(-p.r, -p.r / 2, p.r * 2, p.r);
        } else {
          ctx.beginPath();
          ctx.arc(0, 0, p.r, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();

        // bounds
        const below = p.y > h + 40;
        const offLeft = p.x < -40;
        const offRight = p.x > w + 40;

        if (below || offLeft || offRight) {
          if (recycle) {
            // recycle from the top while show is active
            p.x = Math.random() * w;
            p.y = -20;
            p.vx = -2 + Math.random() * 4;
            p.vy = 2 + Math.random() * 3;
            p.rot = Math.random() * Math.PI;
          } else {
            // let it die; do not recycle after duration
            p.dead = true;
          }
        } else {
          alive++;
        }
      }

      // keep animating while there are live pieces or we're still recycling
      if (recycle || alive > 0) {
        raf = requestAnimationFrame(tick);
      } else {
        // cleanup when all have fallen offscreen
        ctx.clearRect(0, 0, w, h);
      }
    };

    raf = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("resize", onResize);
      cancelAnimationFrame(raf);
      if (canvas)
        canvas.getContext("2d")?.clearRect(0, 0, canvas.width, canvas.height);
    };
  }, [active, durationMs]);

  return (
    <canvas
      ref={ref}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 50,
        pointerEvents: "none",
      }}
    />
  );
};

/* ======== Time-of-day mode ======== */
const getTimeMode = () => {
  const h = new Date().getUTCHours();
  if (h >= 5 && h < 12) return "morning" as const;
  if (h >= 12 && h < 18) return "day" as const;
  return "evening" as const; // night
};

/* ======== Night sky (stars) backdrop ======== */
// JS port of the SCSS multiple-box-shadow() + :after clone + animStar
const NightBackdrop: React.FC = () => {
  const WIDTH = 2000; // match the SCSS random(2000)
  const HEIGHT = 2000;

  const makeShadows = React.useCallback((n: number) => {
    const pts: string[] = [];
    for (let i = 0; i < n; i++) {
      const x = Math.floor(Math.random() * WIDTH);
      const y = Math.floor(Math.random() * HEIGHT);
      pts.push(`${x}px ${y}px #FFF`);
    }
    return pts.join(", ");
  }, []);

  // memo to keep the starfield stable across re-renders
  const shadowsSmall = React.useMemo(() => makeShadows(700), [makeShadows]);
  const shadowsMed = React.useMemo(() => makeShadows(200), [makeShadows]);
  const shadowsBig = React.useMemo(() => makeShadows(100), [makeShadows]);

  return (
    <>
      <style>{`
        @keyframes animStar {
          from { transform: translateY(0); }
          to   { transform: translateY(-2000px); }
        }
      `}</style>
      <div
        aria-hidden
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 0,
          pointerEvents: "none",
          overflow: "hidden",
          // SCSS: radial-gradient(ellipse at bottom, #1B2735 0%, #090A0F 100%)
          background:
            "radial-gradient(ellipse at bottom, #1B2735 0%, #090A0F 100%)",
        }}
      >
        {/* Layer 1: tiny stars */}
        <div
          style={{
            position: "absolute",
            width: 1,
            height: 1,
            background: "transparent",
            boxShadow: shadowsSmall,
            animation: "animStar 50s linear infinite",
          }}
        />
        {/* :after clone (placed as real node) */}
        <div
          style={{
            position: "absolute",
            top: 2000,
            width: 1,
            height: 1,
            background: "transparent",
            boxShadow: shadowsSmall,
            animation: "animStar 50s linear infinite",
          }}
        />

        {/* Layer 2: medium stars */}
        <div
          style={{
            position: "absolute",
            width: 2,
            height: 2,
            background: "transparent",
            boxShadow: shadowsMed,
            animation: "animStar 100s linear infinite",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 2000,
            width: 2,
            height: 2,
            background: "transparent",
            boxShadow: shadowsMed,
            animation: "animStar 100s linear infinite",
          }}
        />

        {/* Layer 3: big stars */}
        <div
          style={{
            position: "absolute",
            width: 3,
            height: 3,
            background: "transparent",
            boxShadow: shadowsBig,
            animation: "animStar 150s linear infinite",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 2000,
            width: 3,
            height: 3,
            background: "transparent",
            boxShadow: shadowsBig,
            animation: "animStar 150s linear infinite",
          }}
        />
      </div>
    </>
  );
};

/* ======== Placeholders for later ======== */
/* ======== Morning (sun + grass + cycling sky) backdrop ======== */
const MorningBackdrop: React.FC<{ durationSec?: number }> = ({
  durationSec = 10,
}) => {
  return (
    <>
      <style>{`
        .morning-backdrop {
          position: fixed;
          inset: 0;
          z-index: 0;
          pointer-events: none;       /* don't block the UI */
          animation: cycleskycolors ${durationSec}s linear infinite;
          overflow: hidden;
        }

        .morning-sun {
          position: absolute;
          width: 18vmin;              /* responsive ~200px on desktop */
          height: 18vmin;
          border-radius: 50%;
          background: #f1c40f;
          transform-origin: center;
          will-change: transform, background-color;
          animation: sunmotion ${durationSec}s linear infinite forwards;
        }

        .morning-grass {
          position: fixed;
          left: 0; right: 0; bottom: 0;
          height: 14vh;               /* responsive grass height */
          background: #2ecc71;
        }

        @keyframes sunmotion {
          /* Just below horizon on the left */
          0% {
            transform: translate(-20vw, 80vh);
            background: #d35400;
          }

          /* Rising */
          25% {
            transform: translate(17vw, 50vh);
            background: #f39c12;
          }

          /* Highest point (noon-ish) */
          50% {
            transform: translate(50vw, 20vh);
            background: #f1c40f;
          }

          /* Descending */
          75% {
            transform: translate(83vw, 50vh);
            background: #f39c12;
          }

          /* Below horizon on the right */
          100% {
            transform: translate(120vw, 80vh);
            background: #e74c3c;
          }
        }

        @keyframes cycleskycolors {
          0%   { background: #2c3e50; }
          10%  { background: pink; }
          30%  { background: #3498db; }
          70%  { background: #3498db; }
          90%  { background: pink; }
          100% { background: #2c3e50; }
        }
      `}</style>

      <div className="morning-backdrop" aria-hidden>
        <div className="morning-sun" />
        <div className="morning-grass" />
      </div>
    </>
  );
};

/* ======== Day (afternoon) glow backdrop ======== */
const DayBackdrop: React.FC = () => {
  const glowRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    const glow = glowRef.current;
    if (!glow) return;

    let raf = 0;
    const onMove = (e: MouseEvent) => {
      const x = e.clientX;
      const y = e.clientY;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        // Follow cursor; keep same offset trick as original (center the circle)
        glow.style.left = `${x}px`;
        glow.style.top = `${y}px`;
        glow.style.marginLeft = "-50%";
        glow.style.marginTop = "-50vh";
      });
    };

    window.addEventListener("mousemove", onMove);
    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <>
      {/* Minimal CSS port of the provided styles */}
      <style>{`
        .day-backdrop {
          position: fixed;
          inset: 0;
          z-index: 0;
          pointer-events: none; /* don't block the UI */
          overflow: hidden;
          background: rgb(252, 141, 120); /* warm afternoon base */
          transition: background 2s cubic-bezier(1, 1, 1, 1);
        }
        .day-circle {
          position: absolute;
          inset: 0;
          display: flex;
          justify-content: center;
          align-items: center;
        }
        .day-glow {
          position: absolute;
          width: 80vw;
          height: 80vw;
          background: radial-gradient(
            circle closest-side,
            rgb(245, 207, 103) 60%,
            rgba(245, 207, 103, 0)
          );
          transition: background 0.5s cubic-bezier(1, 1, 1, 1);
        }
      `}</style>

      <div className="day-backdrop" aria-hidden>
        <div className="day-circle">
          <div ref={glowRef} className="day-glow" />
        </div>
      </div>
    </>
  );
};

/* ========= Clock (drop-in) ========= */
const Clock: React.FC<{
  useUTC?: boolean;
  hour12?: boolean;
  showSeconds?: boolean;
  className?: string;
  style?: React.CSSProperties;
}> = ({
  useUTC = true,
  hour12 = true,
  showSeconds = true,
  className,
  style,
}) => {
  const [now, setNow] = React.useState(() => new Date());

  React.useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const pad = (n: number) => n.toString().padStart(2, "0");

  const h24 = useUTC ? now.getUTCHours() : now.getHours();
  const m = useUTC ? now.getUTCMinutes() : now.getMinutes();
  const s = useUTC ? now.getUTCSeconds() : now.getSeconds();
  const ampm = h24 >= 12 ? "PM" : "AM";
  const hh = hour12 ? h24 % 12 || 12 : h24;

  const dateStr = now.toLocaleDateString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    ...(useUTC ? { timeZone: "UTC" } : {}),
  });

  return (
    <div
      className={className}
      style={{ textAlign: "center", lineHeight: 1.1, ...style }}
      aria-label={`Current ${useUTC ? "UTC" : "local"} time`}
    >
      <div style={{ opacity: 0.7, fontWeight: 500, marginBottom: 6 }}>
        {dateStr}
        {useUTC ? " (UTC)" : ""}
      </div>
      <div
        style={{
          fontWeight: 300,
          letterSpacing: "-0.02em",
          fontSize: "clamp(28px, 6vw, 56px)",
          fontVariantNumeric: "tabular-nums",
        }}
      >
        <span>{pad(hh)}</span>
        <span>:</span>
        <span>{pad(m)}</span>
        {showSeconds && (
          <>
            <span>:</span>
            <span>{pad(s)}</span>
          </>
        )}
        {hour12 && (
          <span
            style={{
              fontSize: "0.38em",
              marginLeft: 8,
              verticalAlign: "middle",
              opacity: 0.85,
              fontWeight: 600,
            }}
          >
            {ampm}
          </span>
        )}
      </div>
    </div>
  );
};

export default function App() {
  // Steps: 0=Intro, 1=Site, 2=Type, 3=Keywords, 4=Locations, 5=Exclude, 6=Preview
  const [step, setStep] = React.useState<0 | 1 | 2 | 3 | 4 | 5 | 6>(0);

  const [copied, setCopied] = React.useState(false);
  const copy = async () => {
    if (!query) return;
    await navigator.clipboard.writeText(query);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  const isNightIntro = step === 0 && getTimeMode() === "evening";

  const [site, setSite] = React.useState("github.com");
  const TYPE_OPTIONS = [
    "frontend",
    "backend",
    "fullstack",
    "devops",
    "mobile",
    "data engineer",
    "data scientist",
    "machine learning engineer",
    "ai engineer",
    "mlops engineer",
    "research scientist",
    "analytics engineer",
    "llm engineer",
    "nlp engineer",
    "computer vision",
    "platform engineer",
    "sre",
    "security engineer",
  ];
  const [types, setTypes] = React.useState<string[]>(["frontend"]);

  const [kwJoin, setKwJoin] = React.useState<"AND" | "OR">("OR");
  const [selectedPreset, setSelectedPreset] = React.useState<
    Record<string, Set<string>>
  >(() => {
    const initial: Record<string, Set<string>> = {};
    Object.keys(PRESETS).forEach((k) => (initial[k] = new Set<string>()));
    initial.Frontend.add("react");
    initial.Frontend.add("typescript");
    return initial;
  });
  const [extraCsv, setExtraCsv] = React.useState("");

  // Locations — start empty (UK/London deselected)
  const [selectedCountries, setSelectedCountries] = React.useState<Set<string>>(
    new Set()
  );
  const [selectedCities, setSelectedCities] = React.useState<Set<string>>(
    new Set()
  );

  // Excludes
  const [excludesCsv, setExcludesCsv] = React.useState("");

  // Derived
  const keywords = React.useMemo(() => {
    const fromPresets = Object.values(selectedPreset).flatMap((set) =>
      Array.from(set)
    );
    const fromCsv = splitCsv(extraCsv);
    return Array.from(new Set([...fromPresets, ...fromCsv]));
  }, [selectedPreset, extraCsv]);

  const locations = React.useMemo(() => {
    const countryNames = COUNTRIES.filter((c) =>
      selectedCountries.has(c.code)
    ).map((c) => c.name.toLowerCase());
    return Array.from(
      new Set([...countryNames, ...Array.from(selectedCities)])
    );
  }, [selectedCountries, selectedCities]);

  const excludes = React.useMemo(() => splitCsv(excludesCsv), [excludesCsv]);

  const query = React.useMemo(
    () => buildQuery({ site, types, keywords, kwJoin, locations, excludes }),
    [site, types, keywords, kwJoin, locations, excludes]
  );
  const googleHref = query
    ? `https://www.google.com/search?q=${encodeURIComponent(query)}`
    : "#";

  const hasQuery = !!query && query.trim().length > 0;

  // Actions
  const toggleType = (name: string, pressed: boolean) =>
    setTypes((prev) =>
      pressed ? [...new Set([...prev, name])] : prev.filter((t) => t !== name)
    );

  const togglePresetKeyword = (group: string, term: string, pressed: boolean) =>
    setSelectedPreset((prev) => {
      const next = { ...prev, [group]: new Set(prev[group]) };
      if (pressed) next[group].add(term);
      else next[group].delete(term);
      return next;
    });

  const toggleCountry = (code: string, pressed: boolean) =>
    setSelectedCountries((prev) => {
      const next = new Set(prev);
      if (pressed) next.add(code);
      else {
        next.delete(code);
        const country = COUNTRIES.find((c) => c.code === code);
        if (country) {
          setSelectedCities((cities) => {
            const copy = new Set(cities);
            country.cities.forEach((ct) => copy.delete(ct));
            return copy;
          });
        }
      }
      return next;
    });

  const toggleCity = (name: string, pressed: boolean) =>
    setSelectedCities((prev) => {
      const next = new Set(prev);
      if (pressed) next.add(name);
      else next.delete(name);
      return next;
    });

  // Step controls — location not mandatory, so Next always allowed
  const canNext =
    step === 0 ||
    step === 1 ||
    step === 2 ||
    step === 3 ||
    step === 4 ||
    step === 5 ||
    step === 6;

  const next = () =>
    setStep((s) => Math.min(6, s + 1) as 0 | 1 | 2 | 3 | 4 | 5 | 6);
  const back = () =>
    setStep((s) => Math.max(0, s - 1) as 0 | 1 | 2 | 3 | 4 | 5 | 6);

  // Keyboard: Enter / Esc / ← / →
  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const k = e.key;
      if (k === "Enter" || k === "ArrowRight") {
        e.preventDefault();
        if (step === 6 && query) {
          window.open(googleHref, "_blank", "noopener,noreferrer");
          return;
        }
        if (canNext) next();
        return;
      }
      if (k === "Escape" || k === "ArrowLeft") {
        e.preventDefault();
        back();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [canNext, step, query, googleHref]);

  // Progress: 7 steps (0..6) → 6 intervals
  const progress = (step / 6) * 100;

  const { emoji, label } = getGmtGreeting();
  const greeting = `${emoji} ${label} Jane!`;

  /* ========= styles for animations ========= */
  const styles = (
    <style>{`
      @keyframes stepIn {
        from { opacity: 0; transform: translate3d(0, 14px, 0); }
        to   { opacity: 1; transform: translate3d(0, 0, 0); }
      }
      @keyframes dogLift {
        0% { transform: translateY(16px); }
        100% { transform: translateY(0); }
      }
      @keyframes titleBounce {
        0% { transform: scale(0.35); opacity: 0; }
        55% { transform: scale(1.25); opacity: 1; }
        75% { transform: scale(0.92); }
        100% { transform: scale(1); }
      }
      @keyframes cornerPop {
        0%   { transform: translate(-80px, 100px) rotate(15deg) scale(0.6); opacity: 0; }
        60%  { transform: translate(8px, -14px) rotate(52deg) scale(2.7); opacity: 1; }
        80%  { transform: translate(-2px, 4px) rotate(46deg) scale(2.48); }
        100% { transform: translate(0, 0) rotate(45deg) scale(2.5); }
      }
      .animate-step-in { animation: stepIn 220ms ease-out both; }
      .animate-title { animation: titleBounce 800ms cubic-bezier(.2,.7,.3,1.35) both; }
      .animate-corner { animation: cornerPop 560ms cubic-bezier(.2,.8,.2,1.4) 0.6s both; }
      .dog-lift { animation: dogLift 600ms ease-out 150ms both; }
    `}</style>
  );

  return (
    <Theme
      appearance="light"
      accentColor="indigo"
      style={{ fontFamily: "Montserrat, system-ui", minHeight: "70dvh" }}
    >
      {styles}
      {/* Intro pattern backdrop */}
      {/* Intro backdrop (night only for now) */}
      {step === 0 && getTimeMode() === "evening" && <NightBackdrop />}
      {step === 0 && getTimeMode() === "morning" && <MorningBackdrop />}
      {step === 0 && getTimeMode() === "day" && <DayBackdrop />}

      {/* Top nav with bottom border */}
      <Box
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          height: NAV_HEIGHT,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 20px",
          background: "var(--color-panel-solid)",
          borderBottom: `1px solid ${GRAY_TRACK}`,
          zIndex: 20,
        }}
      >
        <Flex align="center" gap="2">
          <img
            src={`data:image/png;base64,${DOG_B64}`}
            alt="Mascot"
            width={32}
            height={28}
            style={{ borderRadius: 6 }}
          />
          <Heading
            size="3"
            style={{ fontWeight: 700 }}
            onClick={() => setStep(0)}
          >
            Janey Briggs' Talent Search
          </Heading>
        </Flex>

        {/* Square Google icon button */}
        <Link
          href={googleHref}
          target="_blank"
          rel="noreferrer"
          aria-label="Open in Google"
          style={{
            width: 36,
            height: 36,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#fff",
            borderRadius: 8,
            boxShadow: "0 4px 12px rgba(0,0,0,0.14)",
            opacity: query ? 1 : 0.5,
            pointerEvents: query ? "auto" : "none",
          }}
        >
          <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
            <path
              fill="#FFC107"
              d="M43.6 20.5H42V20H24v8h11.3C33.7 32.4 29.3 36 24 36c-6.6 0-12-5.4-12-12S17.4 12 24 12c3 0 5.7 1.1 7.8 3l5.7-5.7C34 5.7 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20c10.4 0 19-8 19-20 0-1.3-.1-2.2-.4-3.5z"
            />
            <path
              fill="#FF3D00"
              d="M6.3 14.7l6.6 4.8C14.9 16.3 18.9 12 24 12c3 0 5.7 1.1 7.8 3l5.7-5.7C34 5.7 29.3 4 24 4 15.3 4 7.9 9.2 6.3 14.7z"
            />
            <path
              fill="#4CAF50"
              d="M24 44c5.2 0 9.9-1.7 13.5-4.7l-6.2-5.1C29.2 35.4 26.8 36 24 36c-5.2 0-9.6-3.3-11.2-7.9l-6.6 5.1C8 38.8 15.4 44 24 44z"
            />
            <path
              fill="#1976D2"
              d="M43.6 20.5H42V20H24v8h11.3c-1.2 3.4-4.5 6-8.3 6-5.2 0-9.6-3.3-11.2-7.9l-6.6 5.1C8 38.8 15.4 44 24 44c10.4 0 19-8 19-20 0-1.3-.1-2.2-.4-3.5z"
            />
          </svg>
        </Link>
      </Box>
      {/* Progress */}
      {step > 0 && (
        <Box
          style={{
            position: "fixed",
            top: NAV_HEIGHT + 36,
            left: 0,
            right: 0,
            display: "flex",
            justifyContent: "center",
            background: "var(--color-panel-solid)",
            zIndex: 19,
            padding: "14px 0",
          }}
        >
          <div
            style={{
              width: 520,
              height: 12,
              background: GRAY_TRACK,
              borderRadius: 999,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${progress}%`,
                height: "100%",
                background: PINK,
                transition: "width 240ms ease",
              }}
            />
          </div>
        </Box>
      )}
      {/* Content */}
      <Box style={{ marginTop: NAV_HEIGHT + 110, padding: "28px 20px 48px" }}>
        {/* Step 0: Greeting + big mascot (dog lifts) */}
        {step === 0 && (
          <Flex
            className="animate-step-in"
            direction="column"
            align="center"
            gap="5"
            style={{ textAlign: "center", position: "relative", zIndex: 1 }}
          >
            <img
              src={`data:image/png;base64,${DOG_B64}`}
              alt="Mascot"
              width={220}
              height={220}
              className="dog-lift"
              style={{
                objectFit: "contain",
                filter: "drop-shadow(0px 8px 24px rgba(0,0,0,0.15))",
                borderRadius: 16,
              }}
            />
            <Heading
              size="8"
              style={{
                fontWeight: 800,
                color: isNightIntro ? "#fff" : undefined,
                textShadow: isNightIntro
                  ? "0 2px 14px rgba(0,0,0,0.35)"
                  : undefined,
              }}
            >
              {greeting}
            </Heading>

            <div style={{ color: isNightIntro ? "#fff" : undefined }}>
              <Clock useUTC={true} hour12={true} showSeconds={true} />
            </div>

            <Text
              size="3"
              // keep Radix gray in the day; force white at night
              color={isNightIntro ? undefined : "gray"}
              style={{
                color: isNightIntro ? "#fff" : undefined,
                textShadow: isNightIntro
                  ? "0 1px 10px rgba(0,0,0,0.35)"
                  : undefined,
              }}
            >
              Ready to build a powerful boolean search? Press{" "}
              <strong>Enter</strong> or click the arrow to begin.
            </Text>
          </Flex>
        )}

        {/* Step 1: Site + Suggestions */}
        {step === 1 && (
          <Flex
            className="animate-step-in"
            direction="column"
            align="center"
            gap="4"
          >
            <Text size="2" color="gray">
              Choose a site to search
            </Text>
            <UnderlineInput
              value={site}
              onChange={setSite}
              placeholder="e.g. github.com"
            />
            <Flex
              wrap="wrap"
              justify="center"
              style={{ marginTop: 10, maxWidth: 880 }}
            >
              {SITE_SUGGESTIONS.map((s) => (
                <Chip
                  key={s}
                  pressed={site.trim().toLowerCase() === s}
                  onPressedChange={() => setSite(s)}
                >
                  {s}
                </Chip>
              ))}
            </Flex>
          </Flex>
        )}

        {/* Step 2: Types */}
        {step === 2 && (
          <Flex
            className="animate-step-in"
            direction="column"
            align="center"
            gap="3"
          >
            <Text size="2" color="gray" style={{ textAlign: "center" }}>
              Choose a profession
            </Text>
            <Flex
              wrap="wrap"
              justify="center"
              style={{ maxWidth: 1000, margin: "0 auto" }}
            >
              {TYPE_OPTIONS.map((t) => (
                <Chip
                  key={t}
                  pressed={types.includes(t)}
                  onPressedChange={(p) => toggleType(t, p)}
                >
                  {t}
                </Chip>
              ))}
            </Flex>
          </Flex>
        )}

        {/* Step 3: Keywords + floating AND/OR */}
        {step === 3 && (
          <Flex
            className="animate-step-in"
            direction="column"
            align="center"
            gap="5"
          >
            <Box style={{ maxWidth: 1100, width: "100%", textAlign: "center" }}>
              {Object.entries(PRESETS).map(([group, terms]) => (
                <Box key={group} style={{ margin: "10px 0 6px" }}>
                  <Text size="2" color="gray" style={{ textAlign: "center" }}>
                    {group}
                  </Text>
                  <Flex wrap="wrap" justify="center">
                    {terms.map((term) => (
                      <Chip
                        key={term}
                        pressed={selectedPreset[group].has(term)}
                        onPressedChange={(p) =>
                          togglePresetKeyword(group, term, p)
                        }
                      >
                        {term}
                      </Chip>
                    ))}
                  </Flex>
                </Box>
              ))}
            </Box>

            <UnderlineInput
              value={extraCsv}
              onChange={setExtraCsv}
              placeholder='Add custom keywords (comma-separated), e.g. "design systems", accessibility'
            />

            {/* Floating AND/OR control */}
            <Box
              style={{
                position: "fixed",
                right: 16,
                bottom: 16,
                zIndex: 30,
                background: "#fff",
                borderRadius: 10,
                border: "1px solid var(--gray-5)",
                padding: 6,
              }}
            >
              <Flex align="center" gap="2">
                <Text size="2" color="gray">
                  Join
                </Text>
                <Select.Root
                  value={kwJoin}
                  onValueChange={(v) => setKwJoin(v as "AND" | "OR")}
                >
                  <Select.Trigger />
                  <Select.Content>
                    <Select.Item value="AND">AND</Select.Item>
                    <Select.Item value="OR">OR</Select.Item>
                  </Select.Content>
                </Select.Root>
              </Flex>
            </Box>
          </Flex>
        )}

        {/* Step 4: Locations */}
        {step === 4 && (
          <Flex
            className="animate-step-in"
            direction="column"
            align="center"
            gap="5"
          >
            <Text
              size="2"
              color="gray"
              style={{ textAlign: "center", display: "block" }}
            >
              Choose countries and (optionally) top cities
            </Text>
            <Flex wrap="wrap" justify="center" style={{ maxWidth: 1000 }}>
              {COUNTRIES.map((c) => {
                const pressed = selectedCountries.has(c.code);
                return (
                  <Chip
                    key={c.code}
                    pressed={pressed}
                    onPressedChange={(p) => toggleCountry(c.code, p)}
                  >
                    <span style={{ marginRight: 8 }}>{c.flag}</span>
                    {c.name}
                  </Chip>
                );
              })}
            </Flex>

            {Array.from(selectedCountries).length > 0 && (
              <Box
                style={{
                  maxWidth: 1100,
                  marginTop: 10,
                  width: "100%",
                  textAlign: "center",
                }}
              >
                {COUNTRIES.filter((c) => selectedCountries.has(c.code)).map(
                  (c) => (
                    <Box key={c.code} style={{ margin: "10px 0 6px" }}>
                      <Text
                        size="2"
                        color="gray"
                        style={{
                          textAlign: "center",
                          display: "block",
                          marginBottom: 20,
                        }}
                      >
                        {c.flag} {c.name} — Top cities
                      </Text>
                      <Flex wrap="wrap" justify="center">
                        {c.cities.map((city) => (
                          <Chip
                            key={`${c.code}-${city}`}
                            pressed={selectedCities.has(city)}
                            onPressedChange={(p) => toggleCity(city, p)}
                          >
                            {city}
                          </Chip>
                        ))}
                      </Flex>
                    </Box>
                  )
                )}
              </Box>
            )}
          </Flex>
        )}

        {/* Step 5: Excludes */}
        {step === 5 && (
          <Flex
            className="animate-step-in"
            direction="column"
            align="center"
            gap="5"
          >
            <Text size="2" color="gray">
              Maybe there&apos;s some keywords you want to exclude?
            </Text>
            <UnderlineInput
              value={excludesCsv}
              onChange={setExcludesCsv}
              placeholder="remote only, meta..."
            />
            <Text size="1" color="gray">
              These will be grouped and negated: -("recruiter" OR "hiring")
            </Text>
          </Flex>
        )}

        {/* Step 6: Final actions + animations */}
        {step === 6 && (
          <>
            {hasQuery && <Confetti active={true} />}
            <Flex
              className="animate-step-in"
              direction="column"
              align="center"
              gap="5"
              style={{ textAlign: "center" }}
            >
              <Heading
                size="8"
                className="animate-title"
                style={{ fontWeight: 800, fontSize: "100px", lineHeight: 1.05 }}
              >
                {hasQuery ? "🎉 Success!" : "😫 Oh noooo!"}
              </Heading>

              <Text size="3" color="gray">
                {hasQuery
                  ? "Open in Google or copy the boolean search term"
                  : "Looks like you didn't select any filters!"}
              </Text>

              {hasQuery && (
                <Flex gap="3" align="center" justify="center">
                  <Button asChild disabled={!query}>
                    <Link href={googleHref} target="_blank" rel="noreferrer">
                      Open in Google
                    </Link>
                  </Button>

                  <Button onClick={copy} disabled={!query} variant="surface">
                    {copied ? "Copied!" : "Copy search term"}
                  </Button>
                </Flex>
              )}

              {hasQuery && (
                <Text size="1" color="gray">
                  Tip: Press <strong>Enter</strong> to open Google.
                </Text>
              )}
            </Flex>

            {/* Bottom-left image with delayed pop & bounce */}
            <img
              src="jney2.png"
              alt="Mascot"
              width={220}
              height={220}
              className="animate-corner"
              style={{
                position: "fixed",
                left: 40,
                bottom: 50,
                pointerEvents: "none",
                userSelect: "none",
                objectFit: "contain",
                filter: "drop-shadow(0 8px 24px rgba(0,0,0,0.18))",
                zIndex: 15,
                mixBlendMode: "multiply",
                scale: 2,
                transform: "rotate(45deg)",
                willChange: "transform",
              }}
            />
          </>
        )}
      </Box>
      {/* Side arrows: black icons, larger, no background */}
      {step > 0 && (
        <button
          aria-label="Back"
          onClick={back}
          style={{
            position: "fixed",
            top: "50%",
            left: 16,
            transform: "translateY(-50%)",
            width: 64,
            height: 64,
            borderRadius: 10,
            border: "none",
            background: "transparent",
            cursor: "pointer",
            zIndex: 21,
            transition: "transform 120ms ease",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.transform =
              "translateY(-52%)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.transform =
              "translateY(-50%)";
          }}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
            <path
              d="M15 18l-6-6 6-6"
              stroke="#111"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      )}
      {step < 6 && canNext && (
        <button
          aria-label="Next"
          onClick={next}
          style={{
            position: "fixed",
            top: "50%",
            right: 16,
            transform: "translateY(-50%)",
            width: 64,
            height: 64,
            borderRadius: 10,
            border: "none",
            background: "transparent",
            cursor: "pointer",
            zIndex: 21,
            transition: "transform 120ms ease",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.transform =
              "translateY(-52%)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.transform =
              "translateY(-50%)";
          }}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
            <path
              d="M9 6l6 6-6 6"
              stroke="#111"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      )}
    </Theme>
  );
}
