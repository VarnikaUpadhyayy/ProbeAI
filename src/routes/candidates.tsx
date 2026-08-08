import { createFileRoute, Link } from "@tanstack/react-router";
import { LiveBackground } from "@/components/LiveBackground";
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Briefcase,
  GraduationCap,
  Calendar,
  Zap,
  Target,
  Award,
  ChevronRight,
  Hexagon,
  Activity,
  ArrowLeft,
} from "lucide-react";
import { candidates, type Candidate } from "@/data/candidateData";

export const Route = createFileRoute("/candidates")({
  head: () => ({
    meta: [
      { title: "ProbeAI — Candidate Selection Matrix" },
      {
        name: "description",
        content:
          "Select a candidate from the interactive matrix to initialize a personalized AI probe session.",
      },
      {
        property: "og:title",
        content: "ProbeAI — Candidate Selection Matrix",
      },
      {
        property: "og:description",
        content:
          "Interactive hexagonal candidate grid — select, analyze telemetry, and launch a probe session.",
      },
    ],
  }),
  component: CandidatesPage,
});

// ── Helper: completion ratio → color ─────────────────────────
function getCompletionColor(rate: number): {
  ring: string;
  glow: string;
  label: string;
  bg: string;
} {
  if (rate >= 0.8)
    return {
      ring: "#34d399",
      glow: "rgba(52,211,153,0.45)",
      label: "text-emerald-400",
      bg: "bg-emerald-500/15",
    };
  if (rate >= 0.6)
    return {
      ring: "#fbbf24",
      glow: "rgba(251,191,36,0.40)",
      label: "text-amber-400",
      bg: "bg-amber-500/15",
    };
  return {
    ring: "#f87171",
    glow: "rgba(248,113,113,0.40)",
    label: "text-red-400",
    bg: "bg-red-500/15",
  };
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

// ── Main page ────────────────────────────────────────────────
function CandidatesPage() {
  const [selected, setSelected] = useState<Candidate | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-background">
      <LiveBackground />
      <div className="pointer-events-none fixed inset-0 aurora opacity-60" />
      <div className="pointer-events-none fixed inset-0 grid-lines" />

      <div className="relative">
        <CandidateNav />

        {/* Page title */}
        <section className="mx-auto max-w-7xl px-6 pt-6 pb-2">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            <p className="font-mono text-[11px] tracking-[0.35em] text-cyan/80">
              CANDIDATE SELECTION MATRIX
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
              <span className="text-gradient">Select a candidate</span>{" "}
              <span className="text-foreground/90">to probe.</span>
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
              Hover over hexagonal nodes to preview, click to inspect full
              telemetry, then initialize a personalized AI interview session.
            </p>
          </motion.div>
        </section>

        {/* Layout: Hex Grid + Telemetry */}
        <section className="mx-auto flex max-w-7xl flex-col gap-6 px-6 py-8 lg:flex-row">
          {/* Left: Hex Grid */}
          <div className="flex-1 min-w-0">
            <HexGrid
              candidates={candidates}
              selectedId={selected?.member.id ?? null}
              hoveredId={hoveredId}
              onSelect={setSelected}
              onHover={setHoveredId}
            />
          </div>

          {/* Right: Telemetry Panel */}
          <div className="w-full lg:w-[420px] shrink-0">
            <AnimatePresence mode="wait">
              {selected ? (
                <TelemetryPanel
                  key={selected.member.id}
                  candidate={selected}
                />
              ) : (
                <EmptyTelemetry key="empty" />
              )}
            </AnimatePresence>
          </div>
        </section>
      </div>
    </main>
  );
}

// ── Nav (reusing landing style) ──────────────────────────────
function CandidateNav() {
  return (
    <header className="mx-auto flex max-w-7xl items-center justify-between px-6 py-7">
      <Link to="/" className="group flex items-center gap-3">
        <span className="relative flex h-8 w-8 items-center justify-center rounded-full border border-white/15 transition group-hover:border-cyan/60">
          <span className="h-2 w-2 rounded-full bg-cyan shadow-[0_0_16px_4px_color-mix(in_oklab,var(--cyan)_60%,transparent)] transition group-hover:scale-150" />
        </span>
        <span className="font-mono text-xs tracking-[0.28em] text-muted-foreground transition group-hover:text-foreground">
          PROBEAI
        </span>
      </Link>
      <Link
        to="/"
        className="flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 font-mono text-xs text-muted-foreground transition hover:border-cyan/40 hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to Home
      </Link>
    </header>
  );
}

// ── Hex Grid ─────────────────────────────────────────────────

// Hex grid offset positions for a honeycomb pattern
const HEX_POSITIONS = [
  { row: 0, col: 0 },
  { row: 0, col: 1 },
  { row: 0, col: 2 },
  { row: 0, col: 3 },
  { row: 1, col: 0 },
  { row: 1, col: 1 },
  { row: 1, col: 2 },
  { row: 1, col: 3 },
];

function HexGrid({
  candidates: cands,
  selectedId,
  hoveredId,
  onSelect,
  onHover,
}: {
  candidates: Candidate[];
  selectedId: string | null;
  hoveredId: string | null;
  onSelect: (c: Candidate) => void;
  onHover: (id: string | null) => void;
}) {
  return (
    <div className="relative">
      {/* Cybernetic grid background */}
      <div className="pointer-events-none absolute inset-0 rounded-3xl opacity-30">
        <svg width="100%" height="100%" className="absolute inset-0">
          <defs>
            <pattern
              id="cyber-grid"
              width="60"
              height="60"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 60 0 L 0 0 0 60"
                fill="none"
                stroke="rgba(139,92,246,0.08)"
                strokeWidth="0.5"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#cyber-grid)" />
        </svg>
      </div>

      {/* Hex matrix */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 justify-items-center py-4">
        {cands.map((c, i) => {
          const pos = HEX_POSITIONS[i] ?? { row: 0, col: 0 };
          const completionRate =
            c.signals.missionsCompleted / c.missions.length;
          const colors = getCompletionColor(completionRate);
          const isSelected = selectedId === c.member.id;
          const isHovered = hoveredId === c.member.id;

          return (
            <motion.div
              key={c.member.id}
              initial={{ opacity: 0, scale: 0.7, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{
                duration: 0.6,
                delay: i * 0.08,
                ease: [0.16, 1, 0.3, 1],
              }}
              style={{
                animationDelay: `${i * 0.3}s`,
                // Offset odd rows for honeycomb feel
                marginTop: pos.row % 2 !== 0 ? "0" : undefined,
              }}
              className="animate-node-float"
            >
              <HexNode
                candidate={c}
                completionRate={completionRate}
                colors={colors}
                isSelected={isSelected}
                isHovered={isHovered}
                onSelect={() => onSelect(c)}
                onHover={(h) => onHover(h ? c.member.id : null)}
              />
            </motion.div>
          );
        })}
      </div>

      {/* Floating orbit decoration */}
      <div className="pointer-events-none absolute -top-8 -right-8 h-64 w-64 animate-hex-orbit opacity-10">
        <Hexagon className="h-full w-full text-violet-500" strokeWidth={0.3} />
      </div>
      <div className="pointer-events-none absolute -bottom-8 -left-8 h-48 w-48 animate-hex-orbit opacity-[0.07]" style={{ animationDirection: "reverse", animationDuration: "30s" }}>
        <Hexagon className="h-full w-full text-emerald-500" strokeWidth={0.3} />
      </div>
    </div>
  );
}

// ── Single Hex Node ──────────────────────────────────────────
function HexNode({
  candidate,
  completionRate,
  colors,
  isSelected,
  isHovered,
  onSelect,
  onHover,
}: {
  candidate: Candidate;
  completionRate: number;
  colors: ReturnType<typeof getCompletionColor>;
  isSelected: boolean;
  isHovered: boolean;
  onSelect: () => void;
  onHover: (h: boolean) => void;
}) {
  const { member, signals } = candidate;

  return (
    <motion.button
      onClick={onSelect}
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => onHover(false)}
      whileHover={{
        scale: 1.05,
        rotateX: 4,
        rotateY: -4,
        transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] },
      }}
      whileTap={{ scale: 0.97 }}
      className="group relative cursor-pointer focus:outline-none pt-[44px]"
      style={{ perspective: "1200px", transformStyle: "preserve-3d" }}
    >
      {/* Outer glow — centered on avatar */}
      <div
        className="absolute left-1/2 top-0 h-[88px] w-[88px] -translate-x-1/2 rounded-full opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background: `radial-gradient(circle, ${colors.glow}, transparent 70%)`,
        }}
      />

      {/* Avatar circle + SVG ring — centered above the hex, NOT clipped */}
      <div className="absolute left-1/2 top-0 z-20 -translate-x-1/2 flex flex-col items-center">
        {/* SVG radial ring */}
        <div className="relative h-[88px] w-[88px]">
          <svg
            className="absolute inset-0 h-full w-full"
            viewBox="0 0 88 88"
          >
            {/* Background track */}
            <circle
              cx="44"
              cy="44"
              r="40"
              fill="none"
              stroke="rgba(255,255,255,0.06)"
              strokeWidth="2.5"
            />
            {/* Completion arc */}
            <circle
              cx="44"
              cy="44"
              r="40"
              fill="none"
              stroke={colors.ring}
              strokeWidth="3"
              strokeDasharray={`${completionRate * 251.3} ${251.3 - completionRate * 251.3}`}
              strokeLinecap="round"
              transform="rotate(-90 44 44)"
              className="transition-all duration-700"
              style={{
                filter: `drop-shadow(0 0 6px ${colors.glow})`,
              }}
            />
          </svg>
          {/* Avatar initials — centered inside ring */}
          <div
            className="absolute left-1/2 top-1/2 z-10 flex h-[60px] w-[60px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 text-xl font-semibold transition-all duration-500 group-hover:border-white/25"
            style={{
              background: `radial-gradient(circle at 30% 30%, ${colors.glow}, transparent)`,
              color: colors.ring,
              textShadow: `0 0 12px ${colors.glow}`,
            }}
          >
            {getInitials(member.name)}
          </div>
        </div>
      </div>

      {/* Hex body — text content only, circle floats above */}
      <div
        className={`hex-node relative flex h-36 w-44 flex-col items-center justify-center transition-all duration-500 sm:h-40 sm:w-48 ${
          isSelected
            ? "brightness-110"
            : ""
        }`}
        style={
          {
            "--hex-glow-color": colors.glow,
          } as React.CSSProperties
        }
      >
        {/* Push content down to sit below the circle overlay zone */}
        <div className="flex flex-col items-center pt-6">
          {/* ID Badge */}
          <p className="font-mono text-xs font-semibold tracking-wider text-muted-foreground transition group-hover:text-foreground">
            {member.id}
          </p>

          {/* Job role pill */}
          <span
            className={`mt-1.5 inline-block rounded-full px-2.5 py-0.5 font-mono text-xs font-semibold uppercase tracking-wider ${colors.bg} ${colors.label} border border-current/20`}
          >
            {member.jobRole}
          </span>

          {/* Completion percentage */}
          <p
            className={`mt-1.5 font-mono text-xs font-bold ${colors.label}`}
          >
            {Math.round(completionRate * 100)}% MISSIONS
          </p>
        </div>
      </div>

      {/* Selection indicator */}
      {isSelected && (
        <motion.div
          layoutId="hex-selection"
          className="absolute left-0 right-0 bottom-0 h-36 sm:h-40 border-2 border-violet-400/50"
          style={{
            clipPath:
              "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
          }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        />
      )}
    </motion.button>
  );
}

// ── Empty Telemetry placeholder ──────────────────────────────
function EmptyTelemetry() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="telemetry-panel flex h-[600px] flex-col items-center justify-center rounded-2xl p-8"
    >
      <div className="relative mb-6">
        <Hexagon className="h-20 w-20 text-violet-500/20" strokeWidth={0.8} />
        <Activity className="absolute left-1/2 top-1/2 h-8 w-8 -translate-x-1/2 -translate-y-1/2 text-violet-500/40" />
      </div>
      <h3 className="text-lg font-medium text-foreground/60">
        Telemetry Offline
      </h3>
      <p className="mt-2 max-w-[240px] text-center font-mono text-xs leading-relaxed text-muted-foreground/60">
        Select a candidate node from the hexagonal matrix to view their mission
        intelligence and learning signals.
      </p>
      <div className="mt-6 flex items-center gap-2">
        <span className="h-1.5 w-1.5 rounded-full bg-violet-500/40 animate-pulse-ring" />
        <span className="font-mono text-[9px] tracking-[0.3em] text-violet-500/50">
          AWAITING INPUT
        </span>
      </div>
    </motion.div>
  );
}

// ── Telemetry Panel ──────────────────────────────────────────
function TelemetryPanel({ candidate }: { candidate: Candidate }) {
  const { member, missions, signals } = candidate;
  const completionRate = signals.missionsCompleted / missions.length;
  const skipCount = missions.filter((m) => m.skipped).length;
  const colors = getCompletionColor(completionRate);

  return (
    <motion.div
      initial={{ opacity: 0, x: 40, scale: 0.97 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: -20, scale: 0.97 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="telemetry-panel rounded-2xl p-6 sm:p-7"
    >
      {/* Header: Profile */}
      <div className="flex items-start gap-4">
        <div
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-white/10 text-lg font-bold"
          style={{
            background: `linear-gradient(135deg, ${colors.glow}, transparent)`,
            color: colors.ring,
            textShadow: `0 0 16px ${colors.glow}`,
          }}
        >
          {getInitials(member.name)}
        </div>
        <div className="min-w-0">
          <p className="font-mono text-[9px] tracking-[0.3em] text-violet-400/80">
            {member.id}
          </p>
          <h2 className="mt-1 text-xl font-semibold tracking-tight text-foreground">
            {member.name}
          </h2>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full border border-violet-500/20 bg-violet-500/10 px-2.5 py-0.5 font-mono text-[10px] text-violet-400">
              <Briefcase className="h-3 w-3" />
              {member.jobRole}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-0.5 font-mono text-[10px] text-muted-foreground">
              <Calendar className="h-3 w-3" />
              {member.yearsExperience} yrs
            </span>
          </div>
        </div>
      </div>

      {/* Education */}
      <div className="mt-4 flex items-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2">
        <GraduationCap className="h-4 w-4 shrink-0 text-cyan/60" />
        <span className="font-mono text-[10px] text-muted-foreground">
          {member.education}
        </span>
      </div>

      {/* Divider */}
      <div className="my-5 h-px bg-gradient-to-r from-transparent via-violet-500/20 to-transparent" />

      {/* Mission Matrix — Circular Progress Ring */}
      <div>
        <p className="font-mono text-[10px] tracking-[0.3em] text-cyan/70">
          MISSION MATRIX
        </p>
        <div className="mt-4 flex items-center gap-6">
          <MissionRing
            completed={signals.missionsCompleted}
            total={missions.length}
            skipped={skipCount}
            color={colors.ring}
            glow={colors.glow}
          />
          <div className="grid grid-cols-2 gap-x-6 gap-y-3">
            <MiniStat label="Passed" value={signals.missionsCompleted} color="text-emerald-400" />
            <MiniStat label="Skipped" value={skipCount} color="text-amber-400" />
            <MiniStat label="Total Days" value={missions.length} color="text-foreground/80" />
            <MiniStat
              label="Pass Rate"
              value={`${Math.round(completionRate * 100)}%`}
              color={colors.label}
            />
          </div>
        </div>
      </div>

      {/* Mission heatmap strip */}
      <div className="mt-5">
        <p className="mb-2 font-mono text-[9px] tracking-[0.2em] text-muted-foreground/60">
          31-DAY MISSION LOG
        </p>
        <div className="flex flex-wrap gap-[3px]">
          {missions.map((m) => (
            <div
              key={m.day}
              className="group/cell relative"
            >
              <div
                className="h-[14px] w-[14px] rounded-[3px] border border-white/[0.04] transition-all duration-300 hover:scale-150 hover:border-white/20"
                style={{
                  backgroundColor: m.passed
                    ? `rgba(52,211,153,${0.3 + (m.attempts === 1 ? 0.5 : 0.25)})`
                    : m.skipped
                      ? "rgba(251,191,36,0.25)"
                      : "rgba(248,113,113,0.2)",
                }}
                title={`Day ${m.day}: ${m.title} — ${m.passed ? `Passed (${m.attempts} attempt${m.attempts !== 1 ? "s" : ""})` : m.skipped ? "Skipped" : "Failed"}`}
              />
              {/* Tooltip on hover */}
              <div className="pointer-events-none absolute -top-14 left-1/2 z-50 -translate-x-1/2 whitespace-nowrap rounded-lg border border-white/10 bg-card/95 px-2.5 py-1.5 text-center font-mono text-[8px] leading-relaxed text-muted-foreground opacity-0 backdrop-blur-sm transition-opacity duration-200 group-hover/cell:opacity-100">
                <span className="text-foreground">D{m.day}</span>{" "}
                {m.title.slice(0, 22)}
                {m.title.length > 22 ? "…" : ""}
                <br />
                <span
                  className={
                    m.passed
                      ? "text-emerald-400"
                      : m.skipped
                        ? "text-amber-400"
                        : "text-red-400"
                  }
                >
                  {m.passed
                    ? `✓ ${m.attempts} attempt${m.attempts !== 1 ? "s" : ""}`
                    : m.skipped
                      ? "⊘ Skipped"
                      : "✗ Failed"}
                </span>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-2 flex items-center gap-3 font-mono text-[8px] text-muted-foreground/50">
          <span className="flex items-center gap-1">
            <span className="inline-block h-2 w-2 rounded-sm bg-emerald-400/60" />
            Passed (1st)
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block h-2 w-2 rounded-sm bg-emerald-400/35" />
            Passed
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block h-2 w-2 rounded-sm bg-amber-400/30" />
            Skipped
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block h-2 w-2 rounded-sm bg-red-400/25" />
            Failed
          </span>
        </div>
      </div>

      {/* Divider */}
      <div className="my-5 h-px bg-gradient-to-r from-transparent via-violet-500/20 to-transparent" />

      {/* Learning Signals HUD */}
      <div>
        <p className="font-mono text-[10px] tracking-[0.3em] text-cyan/70">
          LEARNING SIGNALS HUD
        </p>
        <div className="mt-3 grid grid-cols-3 gap-3">
          <SignalBadge
            icon={<Calendar className="h-4 w-4" />}
            value={signals.commitDays}
            label="Commit Days"
            color="text-cyan"
            delay={0}
          />
          <SignalBadge
            icon={<Zap className="h-4 w-4" />}
            value={signals.missionsFirstTry}
            label="First Try"
            color="text-emerald-400"
            delay={0.1}
          />
          <SignalBadge
            icon={<Target className="h-4 w-4" />}
            value={signals.missionsCompleted}
            label="Completed"
            color="text-violet-400"
            delay={0.2}
          />
        </div>
      </div>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="mt-6"
      >
        <Link to="/interview/$candidateId" params={{ candidateId: member.id }} className="btn-emerald-glow w-full py-3 text-center text-sm">
          Initialize Probe Session with {member.name.split(" ")[0]}
          <ChevronRight className="h-4 w-4" />
        </Link>
      </motion.div>
    </motion.div>
  );
}

// ── Mission Ring (SVG circular progress) ─────────────────────
function MissionRing({
  completed,
  total,
  skipped,
  color,
  glow,
}: {
  completed: number;
  total: number;
  skipped: number;
  color: string;
  glow: string;
}) {
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const passedOffset = circumference * (1 - completed / total);
  const skippedArc = circumference * (skipped / total);

  return (
    <div className="relative h-[130px] w-[130px] shrink-0">
      <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
        {/* Background track */}
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.05)"
          strokeWidth="6"
        />
        {/* Skipped arc */}
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke="rgba(251,191,36,0.25)"
          strokeWidth="6"
          strokeDasharray={`${skippedArc} ${circumference - skippedArc}`}
          strokeDashoffset={-circumference * (completed / total)}
          strokeLinecap="round"
        />
        {/* Completed arc */}
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="7"
          strokeDasharray={circumference}
          strokeDashoffset={passedOffset}
          strokeLinecap="round"
          className="animate-ring-fill"
          style={{
            "--ring-circumference": circumference,
            filter: `drop-shadow(0 0 8px ${glow})`,
          } as React.CSSProperties}
        />
      </svg>
      {/* Center label */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className="text-2xl font-bold"
          style={{ color, textShadow: `0 0 16px ${glow}` }}
        >
          {completed}
        </span>
        <span className="font-mono text-[8px] tracking-[0.2em] text-muted-foreground/60">
          / {total} PASSED
        </span>
      </div>
    </div>
  );
}

// ── Mini stat ────────────────────────────────────────────────
function MiniStat({
  label,
  value,
  color,
}: {
  label: string;
  value: number | string;
  color: string;
}) {
  return (
    <div>
      <p className={`text-lg font-semibold ${color}`}>{value}</p>
      <p className="font-mono text-[8px] uppercase tracking-[0.2em] text-muted-foreground/50">
        {label}
      </p>
    </div>
  );
}

// ── Signal Badge ─────────────────────────────────────────────
function SignalBadge({
  icon,
  value,
  label,
  color,
  delay,
}: {
  icon: React.ReactNode;
  value: number;
  label: string;
  color: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 + delay, duration: 0.5 }}
      className="group flex flex-col items-center rounded-xl border border-white/[0.06] bg-white/[0.02] px-2 py-3 transition-all duration-300 hover:border-white/15 hover:bg-white/[0.05]"
    >
      <span className={`${color} mb-1 opacity-60 transition group-hover:opacity-100`}>
        {icon}
      </span>
      <span className={`text-xl font-bold ${color}`}>{value}</span>
      <span className="mt-0.5 text-center font-mono text-[7px] uppercase tracking-[0.15em] text-muted-foreground/50">
        {label}
      </span>
    </motion.div>
  );
}
