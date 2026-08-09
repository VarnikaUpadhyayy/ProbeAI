import { createFileRoute, Link } from "@tanstack/react-router";
import { LiveBackground } from "@/components/LiveBackground";
import { useState, useEffect, useRef } from "react";
import { motion, useSpring, useMotionValue, useTransform } from "framer-motion";
import {
  Brain,
  Code,
  Cpu,
  MessageSquare,
  Terminal,
  Volume2,
  Activity,
  Mic,
  ShieldCheck,
  Target,
  Smile,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ProbeAI — Adaptive AI Technical Interviewer" },
      {
        name: "description",
        content:
          "ProbeAI is an adaptive AI interviewer that understands your learning journey, challenges your thinking, and tells you where you actually stand.",
      },
      { property: "og:title", content: "ProbeAI — Adaptive AI Technical Interviewer" },
      {
        property: "og:description",
        content:
          "Don't prepare for interviews. Experience one. Personalized, adaptive, multi-turn technical interviews built on your 31-day AI cohort journey.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

const capabilities = [
  {
    tag: "PERSONALIZED",
    title: "Questions from your journey",
    body: "Reads completed missions, attempts, skipped topics and learning signals to build an interview only you could sit.",
  },
  {
    tag: "ADAPTIVE",
    title: "Difficulty moves with you",
    body: "A strong answer earns depth. A shaky one earns scaffolding. The agent recalibrates after every turn.",
  },
  {
    tag: "REALISTIC",
    title: "Multi-turn conversation",
    body: "Follow-ups, probes and pushback — a real technical dialogue, never a scripted questionnaire.",
  },
  {
    tag: "ACTIONABLE",
    title: "Know what to improve",
    body: "Structured feedback: per-topic scoring, evidence from your answers, and the exact gaps to close next.",
  },
];

const loop = [
  { n: "01", t: "Profile ingest", b: "Curriculum JSON + candidate profile are parsed into a skill graph of confidence and gaps." },
  { n: "02", t: "Question synthesis", b: "Retrieval over the 31-day curriculum grounds every question in what you actually built." },
  { n: "03", t: "Adaptive probing", b: "Each answer is scored live; the next turn targets the weakest defensible claim." },
  { n: "04", t: "Evaluation report", b: "A structured verdict — strengths, gaps, evidence, and a prioritised study path." },
];

function Landing() {
  return (
    <main className="relative min-h-screen overflow-x-hidden bg-background">
      <LiveBackground />
      <div className="pointer-events-none fixed inset-0 aurora opacity-80" />
      <div className="pointer-events-none fixed inset-0 grid-lines" />

      <div className="relative">
        <Nav />
        <Hero />
        <Capabilities />
        <Loop />
        <CTA />
        <Footer />
      </div>
    </main>
  );
}

function Nav() {
  return (
    <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-7">
      <div className="group flex items-center gap-3">
        <span className="relative flex h-8 w-8 items-center justify-center rounded-full border border-white/15 transition group-hover:border-cyan/60">
          <span className="h-2 w-2 rounded-full bg-cyan shadow-[0_0_16px_4px_color-mix(in_oklab,var(--cyan)_60%,transparent)] transition group-hover:scale-150" />
        </span>
        <span className="font-mono text-xs tracking-[0.28em] text-muted-foreground transition group-hover:text-foreground">
          PROBEAI
        </span>
      </div>
      <Link to="/candidates" className="btn-glow text-sm font-medium">
        Start Interview
        <span className="btn-arrow">→</span>
      </Link>
    </header>
  );
}

function CircularProgressBadge({ score }: { score: number }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setProgress(score);
    }, 150);
    return () => clearTimeout(timer);
  }, [score]);

  const radius = 13;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative flex h-9 w-9 shrink-0 items-center justify-center">
      <svg className="h-full w-full -rotate-90">
        <circle
          cx="18"
          cy="18"
          r={radius}
          stroke="rgba(102,178,214,0.22)"
          strokeWidth="2.5"
          fill="none"
        />
        <circle
          cx="18"
          cy="18"
          r={radius}
          stroke="#66B2D6"
          strokeWidth="2.5"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <span className="absolute font-mono text-[10px] font-extrabold text-white">
        {score}%
      </span>
    </div>
  );
}

function AnalyzingBadge() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setProgress(78);
    }, 200);
    return () => clearTimeout(timer);
  }, []);

  const radius = 14;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="absolute -right-2 top-3 z-30 flex items-center gap-2 rounded-xl border border-[#66B2D6]/45 bg-[#0D1420]/95 px-2.5 py-1.5 backdrop-blur-md shadow-[0_0_20px_rgba(102,178,214,0.4)]">
      <div className="relative flex h-8 w-8 shrink-0 items-center justify-center">
        <svg className="h-full w-full -rotate-90">
          <circle
            cx="16"
            cy="16"
            r={radius}
            stroke="rgba(102,178,214,0.25)"
            strokeWidth="2.5"
            fill="none"
          />
          <circle
            cx="16"
            cy="16"
            r={radius}
            stroke="#66B2D6"
            strokeWidth="2.5"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <span className="absolute font-mono text-[9px] font-extrabold text-white">
          78%
        </span>
      </div>
      <div className="flex flex-col pr-1">
        <span className="font-mono text-[9px] font-extrabold text-[#66B2D6] tracking-wider uppercase">
          ANALYZING
        </span>
        <span className="text-[9px] font-bold text-white">
          Real-time
        </span>
      </div>
    </div>
  );
}

function Hero3DVisual() {
  return (
    <div className="relative flex min-h-[580px] sm:min-h-[640px] w-full items-center justify-center select-none overflow-hidden rounded-3xl border border-[#66B2D6]/25 bg-[#0A0D14]/95 p-4 sm:p-6 pb-7 sm:pb-9 shadow-[0_0_55px_rgba(0,0,0,0.85)] backdrop-blur-2xl">
      {/* Subtle Background Watermark Text */}
      <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 font-mono text-7xl sm:text-8xl font-black text-[#66B2D6]/[0.04] select-none tracking-tighter uppercase">
        PROBE
      </div>

      {/* Background Ambient Neon Glows */}
      <div className="pointer-events-none absolute -top-12 -left-12 h-72 w-72 rounded-full bg-[#66B2D6]/18 blur-[90px]" />
      <div className="pointer-events-none absolute -bottom-12 -right-12 h-72 w-72 rounded-full bg-[#8B5CF6]/18 blur-[90px]" />

      {/* Subtle Grid Overlay */}
      <div className="pointer-events-none absolute inset-0 opacity-20 bg-[radial-gradient(#66B2D6_1px,transparent_1px)] [background-size:20px_20px]" />

      {/* Ambient Floating Particles */}
      <div className="pointer-events-none absolute inset-0 opacity-35">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute h-1.5 w-1.5 rounded-full bg-[#66B2D6] shadow-[0_0_8px_#66B2D6]"
            style={{
              left: `${12 + i * 15}%`,
              bottom: "10%",
            }}
          />
        ))}
      </div>

      {/* CARD CONTAINER */}
      <div className="relative flex h-full w-full flex-col justify-between gap-5 py-2">
        {/* MAIN STAGE: LEFT COLUMN | CENTER OVAL MIRROR | RIGHT COLUMN */}
        <div className="grid w-full grid-cols-1 lg:grid-cols-12 gap-3.5 sm:gap-4.5 items-center">
          {/* ── LEFT COLUMN (4 COLS) ── */}
          <div className="lg:col-span-4 flex flex-col gap-3.5 z-20 min-w-0">
            {/* HEADLINE & TAGLINE */}
            <div className="space-y-1">
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white drop-shadow-[0_0_14px_rgba(102,178,214,0.8)]">
                AI MIRROR
              </h2>
              <div className="text-xs sm:text-sm font-extrabold leading-snug">
                <span className="text-white/95">Beyond Answers.</span>{" "}
                <span className="text-[#66B2D6] drop-shadow-[0_0_8px_rgba(102,178,214,0.5)]">
                  Real Insights.
                </span>
              </div>
            </div>

            <div className="h-px w-full bg-gradient-to-r from-[#66B2D6]/50 to-transparent" />

            {/* 3 STACKED INFO CARDS */}
            {/* CARD 1: LIVE INTERVIEW */}
            <div className="rounded-xl border border-[#66B2D6]/35 bg-[#0D1420]/90 p-3.5 backdrop-blur-md shadow-md transition duration-300 hover:border-[#66B2D6]/80">
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex h-7.5 w-7.5 shrink-0 items-center justify-center rounded-lg bg-[#66B2D6]/25 text-[#66B2D6]">
                  <Mic className="h-4 w-4" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-mono text-xs font-extrabold text-white tracking-wider truncate">
                    LIVE INTERVIEW
                  </span>
                  <span className="text-xs text-[#66B2D6] font-semibold truncate mt-0.5">
                    AI is listening...
                  </span>
                </div>
              </div>
              {/* Waveform Strip */}
              <div className="mt-2.5 flex h-3.5 items-center gap-0.5">
                {[40, 85, 55, 100, 70, 45, 90].map((h, idx) => (
                  <div
                    key={idx}
                    className="w-1 rounded-full bg-[#66B2D6]"
                    style={{ height: `${h}%` }}
                  />
                ))}
              </div>
            </div>

            {/* CARD 2: REAL TIME ANALYSIS */}
            <div className="rounded-xl border border-[#66B2D6]/35 bg-[#0D1420]/90 p-3.5 backdrop-blur-md shadow-md transition duration-300 hover:border-[#66B2D6]/80">
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex h-7.5 w-7.5 shrink-0 items-center justify-center rounded-lg bg-[#66B2D6]/25 text-[#66B2D6]">
                  <Brain className="h-4 w-4" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-mono text-xs font-extrabold text-white tracking-wider truncate">
                    REAL TIME ANALYSIS
                  </span>
                  <span className="text-xs text-slate-300 font-semibold leading-tight truncate mt-0.5">
                    Understanding your responses deeply
                  </span>
                </div>
              </div>
            </div>

            {/* CARD 3: 100% SECURE */}
            <div className="rounded-xl border border-[#66B2D6]/35 bg-[#0D1420]/90 p-3.5 backdrop-blur-md shadow-md transition duration-300 hover:border-[#66B2D6]/80">
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex h-7.5 w-7.5 shrink-0 items-center justify-center rounded-lg bg-emerald-500/25 text-emerald-400">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-mono text-xs font-extrabold text-white tracking-wider truncate">
                    100% SECURE
                  </span>
                  <span className="text-xs text-emerald-300/90 font-semibold leading-tight truncate mt-0.5">
                    Your data is safe and confidential
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ── CENTER OVAL MIRROR (4 COLS - COMPACT NO OVERLAP) ── */}
          <div className="lg:col-span-4 flex flex-col items-center justify-center relative z-10 py-2">
            {/* OVERLAPPING "ANALYZING 78%" BADGE */}
            <AnalyzingBadge />

            {/* OVAL MIRROR CAPSULE */}
            <div className="relative flex h-[315px] sm:h-[355px] w-[185px] sm:w-[210px] items-center justify-center rounded-[50%/40%] border-[2.5px] border-[#66B2D6] bg-gradient-to-b from-[#111827] via-[#0A0D14] to-[#0A0D14] shadow-[0_0_40px_rgba(102,178,214,0.45),inset_0_0_22px_rgba(102,178,214,0.25)] overflow-hidden">
              {/* Laser Scan Line moving up and down */}
              <div className="pointer-events-none absolute left-0 right-0 z-30 h-0.5 bg-gradient-to-r from-transparent via-[#66B2D6] to-transparent shadow-[0_0_12px_#66B2D6]" />

              {/* Glass Glare Reflection Beam */}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent z-20" />

              {/* Faint Background Radial Dot Grid inside Mirror */}
              <svg className="absolute inset-0 h-full w-full opacity-20 pointer-events-none">
                <pattern id="mirror-dot-grid" width="16" height="16" patternUnits="userSpaceOnUse">
                  <circle cx="2" cy="2" r="1" fill="#66B2D6" />
                </pattern>
                <rect width="100%" height="100%" fill="url(#mirror-dot-grid)" />
              </svg>

              {/* ── ETHEREAL GLOWING PARTICLE SILHOUETTE FIGURE ── */}
              <div className="relative z-10 flex items-center justify-center">
                <svg
                  viewBox="0 0 200 240"
                  className="h-44 sm:h-52 w-36 sm:w-44 drop-shadow-[0_0_20px_rgba(56,189,248,0.6)]"
                >
                  <defs>
                    {/* Soft Radial Mass for Glowing Silhouette Body */}
                    <radialGradient id="headSoftMass" cx="50%" cy="38%" r="45%">
                      <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.85" />
                      <stop offset="50%" stopColor="#66B2D6" stopOpacity="0.5" />
                      <stop offset="85%" stopColor="#66B2D6" stopOpacity="0.15" />
                      <stop offset="100%" stopColor="#66B2D6" stopOpacity="0" />
                    </radialGradient>

                    <linearGradient id="bodyMass" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#66B2D6" stopOpacity="0.6" />
                      <stop offset="100%" stopColor="#38BDF8" stopOpacity="0.1" />
                    </linearGradient>

                    <filter id="softGlowBlur" x="-20%" y="-20%" width="140%" height="140%">
                      <feGaussianBlur stdDeviation="6" result="blur" />
                      <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                  </defs>

                  {/* Soft Blurred Silhouette Base Mass */}
                  <ellipse cx="100" cy="70" rx="35" ry="42" fill="url(#headSoftMass)" filter="url(#softGlowBlur)" />
                  <path d="M 45 160 Q 100 135 155 160 L 175 230 L 25 230 Z" fill="url(#bodyMass)" filter="url(#softGlowBlur)" />

                  {/* Layered Particle Mesh Overlay Points */}
                  {[
                    [100, 32],
                    [82, 38],
                    [118, 38],
                    [70, 52],
                    [130, 52],
                    [64, 72],
                    [136, 72],
                    [68, 94],
                    [132, 94],
                    [78, 112],
                    [122, 112],
                    [100, 120],
                    [90, 134],
                    [110, 134],
                    [60, 155],
                    [140, 155],
                    [38, 172],
                    [162, 172],
                    [22, 200],
                    [178, 200],
                  ].map(([cx, cy], idx) => (
                    <circle
                      key={idx}
                      cx={cx}
                      cy={cy}
                      r={idx % 2 === 0 ? "2.2" : "1.6"}
                      fill="#38BDF8"
                      opacity={0.9}
                    />
                  ))}

                  {/* Facial Reticle & Keypoint Alignments */}
                  <circle cx="86" cy="72" r="3" fill="#FFFFFF" />
                  <circle cx="114" cy="72" r="3" fill="#FFFFFF" />
                  <line
                    x1="80"
                    y1="72"
                    x2="120"
                    y2="72"
                    stroke="#66B2D6"
                    strokeWidth="1"
                    strokeDasharray="3 2"
                  />
                  <line
                    x1="100"
                    y1="50"
                    x2="100"
                    y2="105"
                    stroke="#66B2D6"
                    strokeWidth="0.8"
                    strokeDasharray="3 2"
                    opacity="0.6"
                  />
                </svg>
              </div>

              {/* BOTTOM HUD OVERLAY BAR INSIDE MIRROR */}
              <div className="absolute bottom-2.5 inset-x-2.5 z-20 flex flex-col items-center rounded-xl border border-[#66B2D6]/40 bg-[#0A0D14]/90 p-2 backdrop-blur-md shadow-lg">
                <span className="font-mono text-xs font-black text-white tracking-wider">
                  AI INTERVIEWER
                </span>
                <span className="text-[10px] text-[#66B2D6] font-bold mt-0.5">Listening...</span>

                {/* Waveform Bars */}
                <div className="mt-1 flex h-3 items-center gap-0.5">
                  {[30, 75, 100, 50, 85, 60, 95, 40, 80, 45, 90].map((h, idx) => (
                    <div
                      key={idx}
                      className="w-0.5 rounded-full bg-[#66B2D6]"
                      style={{ height: `${h}%` }}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* GROUNDING REFLECTION POOL SHADOW */}
            <div className="mt-2.5 h-3.5 w-44 rounded-[100%] bg-gradient-to-r from-transparent via-[#66B2D6]/50 to-transparent blur-md shadow-[0_0_20px_#66B2D6]" />
          </div>

          {/* ── RIGHT COLUMN (4 COLS) ("ANALYZING KEY AREAS") ── */}
          <div className="lg:col-span-4 flex flex-col gap-2.5 z-20 min-w-0">
            <span className="font-mono text-xs font-extrabold tracking-wider text-[#66B2D6] uppercase drop-shadow-[0_0_8px_rgba(102,178,214,0.4)]">
              ANALYZING KEY AREAS
            </span>

            {/* 5 NORMALIZED FULL-WIDTH STAT ROWS (NON-OVERLAPPING) */}
            {[
              {
                title: "VOICE",
                subtext: "Tone · Clarity · Pace",
                score: 85,
                icon: Volume2,
              },
              {
                title: "CONFIDENCE",
                subtext: "Expression · Body Language",
                score: 72,
                icon: Target,
              },
              {
                title: "SKILLS",
                subtext: "Technical · Problem Solving",
                score: 88,
                icon: Brain,
              },
              {
                title: "EMOTION",
                subtext: "Mood · Sentiment · Reaction",
                score: 75,
                icon: Smile,
              },
              {
                title: "COMMUNICATION",
                subtext: "Fluency · Structure · Logic",
                score: 80,
                icon: MessageSquare,
              },
            ].map((item) => {
              const IconComponent = item.icon;
              return (
                <div
                  key={item.title}
                  className="flex items-center justify-between gap-3 rounded-xl border border-[#66B2D6]/35 bg-[#0D1420]/90 px-3.5 py-2.5 backdrop-blur-md shadow-md transition duration-300 hover:border-[#66B2D6]/80"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="flex h-7.5 w-7.5 shrink-0 items-center justify-center rounded-full bg-[#66B2D6]/25 text-[#66B2D6]">
                      <IconComponent className="h-4 w-4" />
                    </div>
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="font-mono text-xs font-extrabold text-white tracking-wider truncate">
                        {item.title}
                      </span>
                      <span className="text-xs font-mono font-medium text-slate-300 truncate mt-0.5">
                        {item.subtext}
                      </span>
                    </div>
                  </div>

                  {/* Circular Score Badge Strictly Anchored Right */}
                  <div className="shrink-0 ml-auto">
                    <CircularProgressBadge score={item.score} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── BOTTOM DOCK FOOTER BAR ── */}
        <div className="w-full rounded-2xl border border-[#66B2D6]/40 bg-[#0D1420]/95 px-4 sm:px-6 py-2.5 backdrop-blur-md shadow-[0_0_25px_rgba(102,178,214,0.18)] flex items-center justify-around z-20 text-xs font-mono text-[#66B2D6] -translate-y-3 mb-2">
          <div className="flex items-center gap-1.5">
            <Volume2 className="h-4 w-4 text-[#66B2D6]" />
            <span className="text-white font-extrabold">Voice</span>
          </div>
          <span className="text-white/40">•</span>
          <div className="flex items-center gap-1.5">
            <Target className="h-4 w-4 text-[#66B2D6]" />
            <span className="text-white font-extrabold">Confidence</span>
          </div>
          <span className="text-white/40">•</span>
          <div className="flex items-center gap-1.5">
            <Brain className="h-4 w-4 text-[#66B2D6]" />
            <span className="text-white font-extrabold">Skills</span>
          </div>
          <span className="text-white/40">•</span>
          <div className="flex items-center gap-1.5">
            <Smile className="h-4 w-4 text-[#66B2D6]" />
            <span className="text-white font-extrabold">Emotion</span>
          </div>
          <span className="text-white/40">•</span>
          <div className="flex items-center gap-1.5">
            <MessageSquare className="h-4 w-4 text-[#66B2D6]" />
            <span className="text-white font-extrabold">Communication</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function Hero() {
  return (
    <section className="mx-auto flex min-h-[85vh] max-w-7xl lg:max-w-[1360px] items-center justify-between px-6 pb-20 pt-8 lg:pt-14">
      <div className="grid w-full items-center gap-10 lg:grid-cols-12">
        {/* LEFT COLUMN: Copy & Actions (Left-Aligned) */}
        <div className="animate-rise flex flex-col items-start text-left lg:col-span-6">
          <p className="font-mono text-[11px] tracking-[0.35em] text-cyan/80">
            ABTALKS AI COHORT · 31 DAYS · ENTERPRISE AI ENGINEERING
          </p>
          <h1 className="mt-6 text-5xl font-semibold leading-[1.02] tracking-tight sm:text-6xl lg:text-7xl">
            <span className="text-gradient">Don't prepare</span>
            <br />
            <span className="text-foreground/95">for interviews.</span>
            <br />
            <span className="text-gradient">Experience one.</span>
          </h1>
          <p className="mt-7 max-w-lg text-lg leading-relaxed text-muted-foreground">
            ProbeAI is an adaptive AI interviewer that understands your learning journey, challenges
            your thinking, and tells you where you actually stand.
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Link id="start" to="/candidates" className="btn-glow text-sm font-medium">
              Start Interview
              <span className="btn-arrow">→</span>
            </Link>
            <span className="font-mono text-xs tracking-widest text-muted-foreground">
              8+ QUESTIONS · 4+ CURRICULUM DAYS
            </span>
          </div>

          <dl className="mt-14 grid w-full max-w-md grid-cols-3 gap-6 border-t border-white/10 pt-7">
            {[
              ["31", "days mapped"],
              ["7", "core modules"],
              ["∞", "follow-ups"],
            ].map(([v, l]) => (
              <div key={l} className="group cursor-default">
                <dt className="text-3xl font-semibold text-foreground transition group-hover:text-cyan">
                  {v}
                </dt>
                <dd className="mt-1 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                  {l}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        {/* RIGHT COLUMN: 3D Animated AI Centerpiece Visual */}
        <div className="w-full lg:col-span-6 flex justify-center lg:justify-end">
          <Hero3DVisual />
        </div>
      </div>
    </section>
  );
}

function Capabilities() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-20">
      <div className="grid gap-5 sm:grid-cols-2">
        {capabilities.map((c) => (
          <article key={c.tag} className="glass tilt-card group rounded-2xl p-7">
            <p className="font-mono text-[10px] tracking-[0.3em] text-cyan/85">{c.tag}</p>
            <h3 className="mt-4 text-xl font-medium text-foreground transition group-hover:text-cyan">
              {c.title}
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{c.body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function Loop() {
  return (
    <section id="loop" className="mx-auto max-w-6xl px-6 py-20">
      <h2 className="max-w-xl text-3xl font-semibold tracking-tight sm:text-4xl">
        An interviewer that <span className="text-gradient">listens, thinks, adapts</span> and
        probes deeper.
      </h2>
      <div className="mt-12 grid gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/[0.06] md:grid-cols-4">
        {loop.map((s) => (
          <div
            key={s.n}
            className="group relative bg-background/70 p-7 backdrop-blur-xl transition duration-500 hover:bg-cyan/[0.07]"
          >
            <span className="font-mono text-xs text-cyan">{s.n}</span>
            <h3 className="mt-4 text-base font-medium transition group-hover:translate-x-1">
              {s.t}
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{s.b}</p>
            <span className="absolute inset-x-0 bottom-0 h-px scale-x-0 bg-cyan/70 transition-transform duration-500 group-hover:scale-x-100" />
          </div>
        ))}
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-24">
      <div className="glass relative overflow-hidden rounded-3xl px-8 py-16 text-center">
        <div className="pointer-events-none absolute inset-0 aurora opacity-60" />
        <div className="relative">
          <h2 className="mx-auto max-w-2xl text-3xl font-semibold tracking-tight sm:text-5xl">
            Find out where you <span className="text-gradient">actually stand.</span>
          </h2>
          <Link to="/candidates" className="btn-glow mt-10 text-sm font-medium">
            Start Interview
            <span className="btn-arrow">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}

const footerLinks = {
  Product: [
    { label: "Start Interview", href: "/candidates" },
    { label: "How It Works", href: "#loop" },
    { label: "Capabilities", href: "#capabilities" },
    { label: "Pricing", href: "#" },
  ],
  Resources: [
    { label: "Documentation", href: "#" },
    { label: "API Reference", href: "#" },
    { label: "Blog", href: "#" },
    { label: "Changelog", href: "#" },
  ],
  Company: [
    { label: "About", href: "#" },
    { label: "Careers", href: "#" },
    { label: "Contact", href: "#" },
    { label: "Press Kit", href: "#" },
  ],
  Legal: [
    { label: "Privacy Policy", href: "#" },
    { label: "Terms of Service", href: "#" },
    { label: "Cookie Policy", href: "#" },
  ],
};

const socialLinks = [
  {
    label: "Twitter",
    href: "#",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    label: "GitHub",
    href: "#",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
        <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
      </svg>
    ),
  },
  {
    label: "LinkedIn",
    href: "#",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
  },
  {
    label: "Discord",
    href: "#",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
        <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189z" />
      </svg>
    ),
  },
  {
    label: "YouTube",
    href: "#",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
        <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    ),
  },
];

const techStack = ["React", "TypeScript", "TanStack", "Vite", "Tailwind CSS"];

function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const currentYear = new Date().getFullYear();

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail("");
      setTimeout(() => setSubscribed(false), 3000);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="relative border-t border-white/10">
      {/* Aurora accent for footer */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan/50 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-cyan/[0.03] to-transparent" />

      <div className="relative mx-auto max-w-6xl px-6">
        {/* Main footer grid */}
        <div className="grid gap-12 py-16 md:grid-cols-6 lg:grid-cols-12">
          {/* Brand + Newsletter column */}
          <div className="md:col-span-6 lg:col-span-4">
            <div className="group flex items-center gap-3">
              <span className="relative flex h-9 w-9 items-center justify-center rounded-full border border-white/15 transition duration-500 group-hover:border-cyan/60 group-hover:shadow-[0_0_20px_4px_color-mix(in_oklab,var(--cyan)_40%,transparent)]">
                <span className="h-2.5 w-2.5 rounded-full bg-cyan shadow-[0_0_16px_4px_color-mix(in_oklab,var(--cyan)_60%,transparent)] transition duration-500 group-hover:scale-150" />
              </span>
              <span className="font-mono text-sm tracking-[0.28em] text-foreground transition group-hover:text-cyan">
                PROBEAI
              </span>
            </div>
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-muted-foreground">
              An adaptive AI interviewer built on your learning journey. Personalized,
              multi-turn technical interviews that reveal where you actually stand.
            </p>

            {/* Newsletter */}
            <div className="mt-8">
              <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-cyan/80">
                Stay updated
              </p>
              <form onSubmit={handleSubscribe} className="mt-3 flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@email.com"
                    className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 font-mono text-xs text-foreground placeholder:text-muted-foreground/50 backdrop-blur-sm transition-all duration-300 focus:border-cyan/50 focus:outline-none focus:ring-1 focus:ring-cyan/30 focus:shadow-[0_0_20px_-5px_color-mix(in_oklab,var(--cyan)_40%,transparent)]"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="group/btn relative overflow-hidden rounded-xl border border-cyan/30 bg-cyan/10 px-4 py-2.5 font-mono text-[10px] uppercase tracking-[0.2em] text-cyan transition-all duration-300 hover:border-cyan/60 hover:bg-cyan/20 hover:shadow-[0_0_24px_-4px_color-mix(in_oklab,var(--cyan)_60%,transparent)] active:scale-95"
                >
                  <span className={`transition-all duration-300 ${subscribed ? 'opacity-0 scale-75' : 'opacity-100 scale-100'}`}>
                    Subscribe
                  </span>
                  {subscribed && (
                    <span className="absolute inset-0 flex items-center justify-center text-cyan animate-rise">
                      ✓
                    </span>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title} className="md:col-span-3 lg:col-span-2">
              <h4 className="font-mono text-[10px] uppercase tracking-[0.3em] text-foreground/60">
                {title}
              </h4>
              <ul className="mt-4 space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="group/link relative inline-flex items-center text-sm text-muted-foreground transition-all duration-300 hover:text-foreground hover:translate-x-1"
                    >
                      <span className="absolute -left-3 h-px w-0 bg-cyan transition-all duration-300 group-hover/link:w-2" />
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Social + Tech divider */}
        <div className="border-t border-white/[0.06] py-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            {/* Social icons */}
            <div className="flex items-center gap-1">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="group/social relative flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-all duration-300 hover:bg-white/[0.06] hover:text-cyan hover:shadow-[0_0_16px_-4px_color-mix(in_oklab,var(--cyan)_40%,transparent)]"
                >
                  {social.icon}
                  <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-card/90 px-2 py-1 font-mono text-[9px] text-muted-foreground opacity-0 backdrop-blur-sm transition-all duration-300 group-hover/social:opacity-100 group-hover/social:-translate-y-1 pointer-events-none">
                    {social.label}
                  </span>
                </a>
              ))}
            </div>

            {/* Tech stack badges */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="mr-1 font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground/50">
                Built with
              </span>
              {techStack.map((tech) => (
                <span
                  key={tech}
                  className="rounded-md border border-white/[0.06] bg-white/[0.02] px-2.5 py-1 font-mono text-[9px] text-muted-foreground/70 transition-all duration-300 hover:border-cyan/30 hover:bg-cyan/[0.06] hover:text-cyan/80 cursor-default"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col gap-4 border-t border-white/[0.06] py-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-[10px] tracking-[0.15em] text-muted-foreground/60">
            <span>© {currentYear} PROBEAI</span>
            <span className="hidden sm:inline">·</span>
            <span>BUILT FOR THE ABTALKS AI COHORT</span>
            <span className="hidden sm:inline">·</span>
            <span>ALL RIGHTS RESERVED</span>
          </div>

          {/* Back to top */}
          <button
            onClick={scrollToTop}
            className="group/top inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground/50 transition-all duration-300 hover:text-cyan self-start sm:self-auto"
          >
            Back to top
            <span className="flex h-7 w-7 items-center justify-center rounded-full border border-white/10 transition-all duration-300 group-hover/top:border-cyan/40 group-hover/top:bg-cyan/10 group-hover/top:-translate-y-0.5 group-hover/top:shadow-[0_0_16px_-4px_color-mix(in_oklab,var(--cyan)_50%,transparent)]">
              <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-3 w-3 transition-transform duration-300 group-hover/top:-translate-y-0.5">
                <path d="M6 9V3M3.5 5.5L6 3l2.5 2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          </button>
        </div>
      </div>
    </footer>
  );
}
