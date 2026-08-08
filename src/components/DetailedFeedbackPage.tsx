import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "@tanstack/react-router";
import {
  CheckCircle2,
  Flag,
  ArrowRight,
  ChevronRight,
  Download,
  RotateCcw,
  Brain,
  Sparkles,
  Eye,
  Zap,
  Target,
  Compass,
  Award,
  Layers,
  Activity,
  Check,
} from "lucide-react";
import { LiveBackground } from "@/components/LiveBackground";

export interface FeedbackItem {
  id: string;
  text: string;
  whyItMatters: string;
  dayTag: string;
}

export interface FeedbackData {
  summary?: string;
  strengths?: (string | FeedbackItem)[];
  gaps?: (string | FeedbackItem)[];
  next?: (string | FeedbackItem)[];
}

export interface DetailedFeedbackPageProps {
  candidateName?: string;
  date?: string;
  duration?: string;
  feedback?: FeedbackData;
  onStartAnother?: () => void;
  onBackToDashboard?: () => void;
  onDownloadReport?: () => void;
}

// ── Question Journey Data ──────────────────────────────────────
interface QuestionNode {
  id: string;
  label: string;
  topic: string;
  score: number;
  status: "strong" | "average" | "excellent";
  summary: string;
  aiObservation: string;
}

const QUESTION_JOURNEY: QuestionNode[] = [
  {
    id: "q1",
    label: "Q1",
    topic: "RAG Architecture & Embeddings",
    score: 92,
    status: "excellent",
    summary: "Clear explanation of hybrid dense-sparse retrieval vector indexing.",
    aiObservation: "Showed deep mastery of HNSW graph construction trade-offs.",
  },
  {
    id: "q2",
    label: "Q2",
    topic: "Vector Search Indexing (HNSW)",
    score: 88,
    status: "strong",
    summary: "Articulated sub-linear vector search scaling precision accurately.",
    aiObservation: "Strong technical clarity on distance metrics (Cosine vs L2).",
  },
  {
    id: "q3",
    label: "Q3",
    topic: "MCP Tool Execution & Fallbacks",
    score: 72,
    status: "average",
    summary: "Initial tool call syntax had retry gaps under network failures.",
    aiObservation: "Needs structured error schema validation for tool return payloads.",
  },
  {
    id: "q4",
    label: "Q4",
    topic: "Prompt Engineering & JSON Schema",
    score: 90,
    status: "excellent",
    summary: "Flawless structured output formatting with low token overhead.",
    aiObservation: "Excellent use of system prompt guardrails and zero-shot examples.",
  },
  {
    id: "q5",
    label: "Q5",
    topic: "Context Window Trade-offs",
    score: 84,
    status: "strong",
    summary: "Good rationale between chunked summarization and direct packing.",
    aiObservation: "Understands latency/cost curve for long-context models.",
  },
  {
    id: "q6",
    label: "Q6",
    topic: "Multi-Agent Memory Persistence",
    score: 74,
    status: "average",
    summary: "Mentioned Redis state, but skipped long-term vector memory synchronization.",
    aiObservation: "Expand on agent session persistence across multi-turn workflows.",
  },
  {
    id: "q7",
    label: "Q7",
    topic: "Evaluation & Guardrails (Ragas)",
    score: 89,
    status: "excellent",
    summary: "Comprehensive automated evaluation framework proposal.",
    aiObservation: "Strong grasp of faithfulness and context relevance metrics.",
  },
  {
    id: "q8",
    label: "Q8",
    topic: "Fine-Tuning & LoRA Adaptations",
    score: 86,
    status: "strong",
    summary: "Precise estimation of low-rank matrix rank selection and compute budgets.",
    aiObservation: "Demonstrated clear understanding of catastrophic forgetting mitigation.",
  },
  {
    id: "q9",
    label: "Q9",
    topic: "Real-Time Agentic Tool Routing",
    score: 94,
    status: "excellent",
    summary: "Exceptional dynamic tool selection under tight response latency SLA.",
    aiObservation: "High confidence and optimal execution pathing for complex queries.",
  },
  {
    id: "q10",
    label: "Q10",
    topic: "Distributed Inference & KV Caching",
    score: 85,
    status: "strong",
    summary: "Solid breakdown of PagedAttention memory management across GPU clusters.",
    aiObservation: "Good architectural grasp of high-throughput enterprise serving.",
  },
];

// ── AI Skill Nodes (Constellation) ────────────────────────────
interface SkillNode {
  id: string;
  name: string;
  score: number;
  x: number; // percentage offset in constellation map
  y: number;
  description: string;
}

const SKILL_NODES: SkillNode[] = [
  {
    id: "tech",
    name: "Technical Knowledge",
    score: 88,
    x: 50,
    y: 12,
    description: "Deep understanding of AI systems, RAG architecture, and vector embeddings.",
  },
  {
    id: "problem",
    name: "Problem Solving",
    score: 85,
    x: 82,
    y: 34,
    description: "Methodical approach to complex algorithmic trade-offs and edge cases.",
  },
  {
    id: "adapt",
    name: "Adaptability",
    score: 84,
    x: 18,
    y: 34,
    description: "Quick pivot under follow-up probes and adaptive prompt constraints.",
  },
  {
    id: "conf",
    name: "Confidence",
    score: 81,
    x: 74,
    y: 78,
    description: "Steady execution under pressure with clear architectural decisions.",
  },
  {
    id: "comm",
    name: "Communication",
    score: 76,
    x: 26,
    y: 78,
    description: "Good clarity, but explanation of complex trade-offs can be simplified.",
  },
];

export function DetailedFeedbackPage({
  candidateName = "Alex Rivera",
  date = "AUG 8, 2026",
  duration = "14:32",
  onStartAnother,
  onBackToDashboard,
  onDownloadReport,
}: DetailedFeedbackPageProps) {
  const [downloadToast, setDownloadToast] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<QuestionNode>(
    QUESTION_JOURNEY[0]!
  );
  const [activeSkill, setActiveSkill] = useState<SkillNode | null>(
    SKILL_NODES[0]!
  );

  // Derived dynamic accent styles for selectedQuestion:
  const activeBorderStyle =
    selectedQuestion.status === "excellent"
      ? "border-[#4ADE80] shadow-[0_0_30px_rgba(74,222,128,0.3)] bg-gradient-to-b from-[#4ADE80]/[0.12] via-[#111318]/90 to-black/80"
      : selectedQuestion.status === "strong"
      ? "border-[#66B2D6] shadow-[0_0_30px_rgba(102,178,214,0.3)] bg-gradient-to-b from-[#66B2D6]/[0.12] via-[#111318]/90 to-black/80"
      : "border-[#F5B942] shadow-[0_0_30px_rgba(245,185,66,0.3)] bg-gradient-to-b from-[#F5B942]/[0.12] via-[#111318]/90 to-black/80";

  const activePillStyle =
    selectedQuestion.status === "excellent"
      ? "border-[#4ADE80]/60 bg-[#4ADE80]/20 text-[#4ADE80] shadow-[0_0_12px_rgba(74,222,128,0.4)]"
      : selectedQuestion.status === "strong"
      ? "border-[#66B2D6]/60 bg-[#66B2D6]/20 text-[#66B2D6] shadow-[0_0_12px_rgba(102,178,214,0.4)]"
      : "border-[#F5B942]/60 bg-[#F5B942]/20 text-[#F5B942] shadow-[0_0_12px_rgba(245,185,66,0.4)]";

  const activeTextColor =
    selectedQuestion.status === "excellent"
      ? "text-[#4ADE80]"
      : selectedQuestion.status === "strong"
      ? "text-[#66B2D6]"
      : "text-[#F5B942]";

  const handleDownload = () => {
    if (onDownloadReport) {
      onDownloadReport();
    } else {
      const dataStr =
        "data:text/json;charset=utf-8," +
        encodeURIComponent(
          JSON.stringify(
            {
              candidateName,
              date,
              duration,
              readinessScore: "82%",
              identity: "THE ANALYTICAL PROBLEM SOLVER",
              skills: SKILL_NODES,
              journey: QUESTION_JOURNEY,
            },
            null,
            2
          )
        );
      const downloadAnchor = document.createElement("a");
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute(
        "download",
        `ProbeAI_Feedback_${candidateName.replace(/\s+/g, "_")}.json`
      );
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    }

    setDownloadToast(true);
    setTimeout(() => setDownloadToast(false), 4000);
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0A0A0A] font-sans text-foreground selection:bg-[#66B2D6]/30">
      {/* Background Particle Mesh & Grid */}
      <LiveBackground />
      <div className="pointer-events-none fixed inset-0 bg-[#0A0A0A]/75" />
      <div className="pointer-events-none fixed inset-0 neural-bg opacity-60" />
      <div className="pointer-events-none fixed inset-0 grid-lines opacity-30" />

      {/* Main Container */}
      <div className="relative z-10 mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-10">
        
        {/* ── HEADER & BRANDING ────────────────────────────────── */}
        <motion.header
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-white/[0.08] pb-6"
        >
          <div className="space-y-1.5">
            {/* ProbeAI Wordmark + Status Badge */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="relative flex h-5 w-5 items-center justify-center rounded-full border border-[#66B2D6]/40 bg-[#66B2D6]/10">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#66B2D6] shadow-[0_0_8px_#66B2D6]" />
                </span>
                <span className="font-mono text-xs font-bold tracking-[0.25em] text-[#66B2D6]">
                  PROBEAI
                </span>
              </div>
              <span className="h-3 w-px bg-white/15" />
              <div className="flex items-center gap-1.5 rounded-full border border-[#66B2D6]/30 bg-[#66B2D6]/10 px-3 py-0.5 shadow-[0_0_12px_rgba(102,178,214,0.2)]">
                <Sparkles className="h-3.5 w-3.5 text-[#66B2D6]" />
                <span className="font-mono text-xs font-semibold tracking-wider text-[#66B2D6]">
                  AI ANALYSIS COMPLETE
                </span>
              </div>
            </div>

            {/* Candidate Metadata */}
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Candidate Performance Evaluation
            </h1>
            <p className="font-mono text-xs sm:text-sm tracking-wider text-muted-foreground">
              <span className="text-foreground font-semibold">
                {candidateName.toUpperCase()}
              </span>{" "}
              · {date} · {duration} SESSION DURATION
            </p>
          </div>

          {/* Action Buttons Header */}
          <div className="flex flex-wrap items-center gap-3 self-start sm:self-center">
            <button
              onClick={handleDownload}
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 font-mono text-xs font-semibold tracking-wider text-muted-foreground transition hover:border-[#66B2D6]/40 hover:bg-white/[0.08] hover:text-foreground"
            >
              <Download className="h-3.5 w-3.5 text-[#66B2D6]" />
              Export Report JSON
            </button>

            {onBackToDashboard ? (
              <button
                onClick={onBackToDashboard}
                className="inline-flex items-center gap-1.5 rounded-xl border border-transparent bg-white/[0.04] px-4 py-2.5 font-mono text-xs font-semibold tracking-wider text-muted-foreground transition hover:border-white/10 hover:bg-white/[0.08] hover:text-foreground"
              >
                ← Dashboard
              </button>
            ) : (
              <Link
                to="/candidates"
                className="inline-flex items-center gap-1.5 rounded-xl border border-transparent bg-white/[0.04] px-4 py-2.5 font-mono text-xs font-semibold tracking-wider text-muted-foreground transition hover:border-white/10 hover:bg-white/[0.08] hover:text-foreground"
              >
                ← Dashboard
              </Link>
            )}
          </div>
        </motion.header>

        {/* Download Toast Notification */}
        <AnimatePresence>
          {downloadToast && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="flex items-center justify-between rounded-xl border border-[#66B2D6]/40 bg-[#111318] px-4 py-3 shadow-[0_0_20px_rgba(102,178,214,0.25)]"
            >
              <div className="flex items-center gap-2.5">
                <Sparkles className="h-4 w-4 text-[#66B2D6]" />
                <span className="font-mono text-xs sm:text-sm font-semibold text-[#66B2D6]">
                  Full Detailed Report JSON downloaded successfully!
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── SECTION 1: 3D AI CONSTELLATION & CORE ───────────────────── */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="relative overflow-hidden rounded-3xl border border-[#1F232C] bg-[#111318]/90 p-6 sm:p-10 backdrop-blur-2xl shadow-2xl"
        >
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
            <div className="flex items-center gap-2.5">
              <Brain className="h-5 w-5 text-[#66B2D6]" />
              <h2 className="font-mono text-xs sm:text-sm font-bold tracking-[0.2em] text-[#66B2D6] uppercase">
                AI SKILL CONSTELLATION & READINESS CORE
              </h2>
            </div>
            <span className="font-mono text-xs text-muted-foreground/70 hidden sm:block">
              Hover/click nodes for skill breakdown
            </span>
          </div>

          <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* CONSTELLATION MAP (Left 7 Cols) */}
            <div className="lg:col-span-7 relative flex min-h-[380px] sm:min-h-[420px] w-full items-center justify-center rounded-2xl border border-white/[0.04] bg-black/40 p-4 overflow-hidden">
              
              {/* SVG Connecting Lines between Center Core and Nodes */}
              <svg className="absolute inset-0 h-full w-full pointer-events-none">
                {SKILL_NODES.map((node) => (
                  <line
                    key={node.id}
                    x1="50%"
                    y1="50%"
                    x2={`${node.x}%`}
                    y2={`${node.y}%`}
                    stroke="rgba(102, 178, 214, 0.25)"
                    strokeWidth="1.5"
                    strokeDasharray="4 4"
                  />
                ))}
              </svg>

              {/* CENTER 3D READINESS CORE */}
              <div className="relative z-20 flex flex-col items-center justify-center">
                <motion.div
                  animate={{
                    rotate: [0, 360],
                    scale: [1, 1.04, 1],
                  }}
                  transition={{
                    rotate: { duration: 20, ease: "linear", repeat: Infinity },
                    scale: { duration: 3, repeat: Infinity, ease: "easeInOut" },
                  }}
                  className="relative flex h-36 w-36 sm:h-44 sm:w-44 items-center justify-center rounded-full border border-[#66B2D6]/40 bg-[#111318]"
                  style={{
                    boxShadow:
                      "0 0 60px 15px rgba(102, 178, 214, 0.35), inset 0 0 30px rgba(102, 178, 214, 0.2)",
                  }}
                >
                  {/* Orbiting core ring */}
                  <div className="absolute inset-1 rounded-full border border-dashed border-[#66B2D6]/50 animate-spin-slow" />
                  
                  {/* Inner text container */}
                  <div className="flex flex-col items-center justify-center text-center p-2 z-10">
                    <span className="text-4xl sm:text-5xl font-extrabold tracking-tight text-foreground drop-shadow-[0_0_20px_rgba(102,178,214,0.8)]">
                      82%
                    </span>
                    <span className="mt-1 font-mono text-[10px] sm:text-xs font-bold tracking-[0.2em] text-[#66B2D6]">
                      INTERVIEW READINESS
                    </span>
                  </div>
                </motion.div>
              </div>

              {/* RADIAL SKILL NODES */}
              {SKILL_NODES.map((node) => {
                const isSelected = activeSkill?.id === node.id;
                // Higher score = larger & brighter node!
                const scaleFactor = 0.85 + (node.score / 100) * 0.35; // 0.85 to 1.2x

                return (
                  <div
                    key={node.id}
                    onClick={() => setActiveSkill(node)}
                    style={{
                      left: `${node.x}%`,
                      top: `${node.y}%`,
                    }}
                    className="absolute z-30 flex cursor-pointer -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1.5"
                  >
                    {/* Node Circle */}
                    <div
                      className={`relative flex items-center justify-center rounded-full border transition-all duration-300 origin-center ${
                        isSelected
                          ? "scale-125 border-[#66B2D6] bg-[#66B2D6]/35 text-foreground shadow-[0_0_28px_rgba(102,178,214,0.85)] z-10"
                          : "scale-100 hover:scale-110 border-[#66B2D6]/50 bg-[#111318]/90 text-foreground/90 hover:border-[#66B2D6] hover:bg-[#66B2D6]/25 hover:shadow-[0_0_18px_rgba(102,178,214,0.5)]"
                      }`}
                      style={{
                        width: `${44 * scaleFactor}px`,
                        height: `${44 * scaleFactor}px`,
                        boxShadow: isSelected
                          ? `0 0 28px rgba(102, 178, 214, 0.85)`
                          : `0 0 ${node.score * 0.3}px rgba(102, 178, 214, ${
                              node.score / 100
                            })`,
                      }}
                    >
                      <span className="font-mono text-xs sm:text-sm font-bold">
                        {node.score}%
                      </span>

                      {/* Beacon Ping */}
                      <span
                        className={`absolute -inset-1 rounded-full border border-[#66B2D6]/40 pointer-events-none ${
                          isSelected ? "animate-ping opacity-60" : "animate-ping opacity-25"
                        }`}
                      />
                    </div>

                    {/* Node Label */}
                    <span
                      className={`whitespace-nowrap rounded-md border px-2 py-0.5 font-mono text-[10px] sm:text-xs font-semibold tracking-wider transition-all duration-300 origin-center ${
                        isSelected
                          ? "scale-105 border-[#66B2D6] bg-[#66B2D6]/30 text-white shadow-lg font-bold"
                          : "scale-100 hover:scale-105 border-white/10 bg-[#111318]/90 text-[#66B2D6] shadow-md hover:border-[#66B2D6]/60 hover:text-white"
                      }`}
                    >
                      {node.name}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* SKILL DETAIL FOCUS CARD (Right 5 Cols) */}
            <div className="lg:col-span-5 flex flex-col justify-center">
              <AnimatePresence mode="wait">
                {activeSkill && (
                  <motion.div
                    key={activeSkill.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="rounded-2xl border border-[#66B2D6]/40 bg-[#111318] p-6 shadow-[0_0_30px_rgba(102,178,214,0.15)] space-y-4"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold tracking-[0.2em] text-[#66B2D6] uppercase">
                        SKILL METRIC BREAKDOWN
                      </span>
                      <span className="rounded-full border border-[#66B2D6]/40 bg-[#66B2D6]/10 px-3 py-1 font-mono text-xs font-bold text-[#66B2D6]">
                        SCORE: {activeSkill.score}%
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-foreground">
                      {activeSkill.name}
                    </h3>

                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {activeSkill.description}
                    </p>

                    {/* Progress Bar */}
                    <div className="space-y-1.5 pt-2">
                      <div className="flex justify-between font-mono text-xs text-muted-foreground">
                        <span>PROFICIENCY BENCHMARK</span>
                        <span className="text-[#66B2D6] font-semibold">
                          {activeSkill.score} / 100
                        </span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${activeSkill.score}%` }}
                          transition={{ duration: 0.8, ease: "easeOut" }}
                          className="h-full bg-[#66B2D6] shadow-[0_0_12px_#66B2D6]"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.section>

        {/* ── SECTION 2: AI CANDIDATE PROFILE ──────────────────────────── */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="relative overflow-hidden rounded-3xl border border-[#1F232C] border-l-4 border-l-[#66B2D6] bg-[#111318]/90 p-6 sm:p-8 backdrop-blur-2xl shadow-xl"
        >
          <div className="flex items-center gap-2.5">
            <Target className="h-5 w-5 text-[#66B2D6]" />
            <p className="font-mono text-xs font-bold tracking-[0.25em] text-[#66B2D6] uppercase">
              PERSONALIZED AI CANDIDATE PROFILE
            </p>
          </div>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground bg-gradient-to-r from-foreground via-foreground to-[#66B2D6] bg-clip-text">
              THE ANALYTICAL PROBLEM SOLVER
            </h2>

            {/* Trait Pills */}
            <div className="flex flex-wrap gap-2">
              {["Analytical", "Curious", "Methodical"].map((trait) => (
                <span
                  key={trait}
                  className="rounded-full border border-[#66B2D6]/30 bg-[#66B2D6]/10 px-3.5 py-1 font-mono text-xs font-semibold tracking-wider text-[#66B2D6]"
                >
                  {trait}
                </span>
              ))}
            </div>
          </div>

          <blockquote className="mt-4 border-t border-white/[0.06] pt-4 text-base sm:text-lg leading-relaxed font-sans font-medium text-foreground/90">
            “Strong technical foundation with good problem-solving ability. Improve communication clarity and explanation of complexity.”
          </blockquote>
        </motion.section>

        {/* ── SECTION 3: HOLOGRAPHIC MINIMAL INSIGHTS ─────────────────── */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          className="space-y-4"
        >
          <div className="flex items-center gap-2.5">
            <Layers className="h-5 w-5 text-[#66B2D6]" />
            <h2 className="font-mono text-xs sm:text-sm font-bold tracking-[0.2em] text-[#66B2D6] uppercase">
              AI HOLOGRAPHIC INSIGHTS
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {/* STRENGTH INSIGHT */}
            <div className="relative overflow-hidden rounded-2xl border border-[#1F232C] border-l-4 border-l-[#4ADE80] bg-[#111318]/90 p-5 backdrop-blur-xl shadow-lg transition-all hover:border-[#4ADE80]/40">
              <div className="flex items-center gap-2.5 border-b border-white/[0.06] pb-3">
                <CheckCircle2 className="h-5 w-5 text-[#4ADE80]" />
                <span className="font-mono text-xs font-bold tracking-[0.2em] text-[#4ADE80]">
                  STRENGTH
                </span>
              </div>
              <p className="mt-3 text-sm sm:text-base font-medium leading-relaxed text-foreground/95">
                Strong problem-solving approach.
              </p>
            </div>

            {/* OBSERVATION INSIGHT */}
            <div className="relative overflow-hidden rounded-2xl border border-[#1F232C] border-l-4 border-l-[#66B2D6] bg-[#111318]/90 p-5 backdrop-blur-xl shadow-lg transition-all hover:border-[#66B2D6]/40">
              <div className="flex items-center gap-2.5 border-b border-white/[0.06] pb-3">
                <Eye className="h-5 w-5 text-[#66B2D6]" />
                <span className="font-mono text-xs font-bold tracking-[0.2em] text-[#66B2D6]">
                  OBSERVATION
                </span>
              </div>
              <p className="mt-3 text-sm sm:text-base font-medium leading-relaxed text-foreground/95">
                Good technical understanding.
              </p>
            </div>

            {/* IMPROVEMENT INSIGHT */}
            <div className="relative overflow-hidden rounded-2xl border border-[#1F232C] border-l-4 border-l-[#F5B942] bg-[#111318]/90 p-5 backdrop-blur-xl shadow-lg transition-all hover:border-[#F5B942]/40">
              <div className="flex items-center gap-2.5 border-b border-white/[0.06] pb-3">
                <Flag className="h-5 w-5 text-[#F5B942]" />
                <span className="font-mono text-xs font-bold tracking-[0.2em] text-[#F5B942]">
                  IMPROVEMENT
                </span>
              </div>
              <p className="mt-3 text-sm sm:text-base font-medium leading-relaxed text-foreground/95">
                Explain reasoning and complexity more clearly.
              </p>
            </div>
          </div>
        </motion.section>

        {/* ── SECTION 4: INTERVIEW JOURNEY TIMELINE ───────────────────── */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="rounded-3xl border border-[#1F232C] bg-[#111318]/90 p-6 sm:p-8 backdrop-blur-2xl shadow-2xl space-y-7"
        >
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-5 mb-2">
            <div className="flex items-center gap-2.5">
              <Activity className="h-5 w-5 text-[#66B2D6]" />
              <h2 className="font-mono text-xs sm:text-sm font-bold tracking-[0.2em] text-[#66B2D6] uppercase">
                INTERVIEW JOURNEY TIMELINE
              </h2>
            </div>
            <span className="font-mono text-xs text-muted-foreground/70">
              Click a question node to reveal AI feedback
            </span>
          </div>

          {/* GLOWING QUESTION TIMELINE NODES (WITH EXTRA HEADROOM FOR CIRCLES) */}
          <div className="relative flex items-center justify-between px-3 sm:px-6 pt-7 pb-5 overflow-x-auto">
            {/* Horizontal Line connecting nodes */}
            <div className="absolute left-6 right-6 top-1/2 h-0.5 -translate-y-1/2 bg-gradient-to-r from-[#4ADE80] via-[#66B2D6] to-[#F5B942] opacity-40 pointer-events-none" />

            {QUESTION_JOURNEY.map((q) => {
              const isSelected = selectedQuestion.id === q.id;
              const statusColor =
                q.status === "excellent"
                  ? "border-[#4ADE80] bg-[#4ADE80]/20 text-[#4ADE80] shadow-[0_0_15px_#4ADE80]"
                  : q.status === "strong"
                  ? "border-[#66B2D6] bg-[#66B2D6]/20 text-[#66B2D6] shadow-[0_0_15px_#66B2D6]"
                  : "border-[#F5B942] bg-[#F5B942]/20 text-[#F5B942] shadow-[0_0_15px_#F5B942]";

              const activeTextColor =
                q.status === "excellent"
                  ? "text-[#4ADE80]"
                  : q.status === "strong"
                  ? "text-[#66B2D6]"
                  : "text-[#F5B942]";

              return (
                <button
                  key={q.id}
                  onClick={() => setSelectedQuestion(q)}
                  className={`relative z-10 flex flex-col items-center gap-2 cursor-pointer group transition-all duration-300 ${
                    isSelected ? "scale-125 -translate-y-1" : "hover:scale-105 opacity-80 hover:opacity-100"
                  }`}
                >
                  <div
                    className={`flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-full border-2 font-mono text-xs sm:text-sm font-bold transition-all ${statusColor} ${
                      isSelected ? "ring-4 ring-white/10" : ""
                    }`}
                  >
                    {q.label}
                  </div>
                  <span
                    className={`font-mono text-[10px] sm:text-xs font-bold tracking-wider transition-colors ${
                      isSelected
                        ? activeTextColor
                        : "text-muted-foreground group-hover:text-foreground"
                    }`}
                  >
                    {q.score}%
                  </span>
                </button>
              );
            })}
          </div>

          {/* DYNAMIC QUESTION FEEDBACK DRAWER (BRIGHT ACCENT THEMED) */}
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedQuestion.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className={`rounded-2xl border-2 p-5 sm:p-7 space-y-4 backdrop-blur-2xl transition-all duration-300 ${activeBorderStyle}`}
            >
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.08] pb-4">
                <div className="flex items-center gap-2.5">
                  <span className={`rounded-full border px-4 py-1.5 font-mono text-xs font-bold tracking-wider ${activePillStyle}`}>
                    {selectedQuestion.label} · {selectedQuestion.topic}
                  </span>
                </div>
                <span className={`font-mono text-xs sm:text-sm font-extrabold tracking-wider ${activeTextColor}`}>
                  AI EVALUATION SCORE: {selectedQuestion.score}%
                </span>
              </div>

              <p className="text-base sm:text-lg font-semibold leading-relaxed text-foreground tracking-tight">
                "{selectedQuestion.summary}"
              </p>

              <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-4 backdrop-blur-md">
                <p className={`font-mono text-xs font-bold tracking-widest uppercase ${activeTextColor}`}>
                  AI OBSERVATION DETAIL
                </p>
                <p className="mt-1.5 text-xs sm:text-sm text-foreground/90 font-medium leading-relaxed">
                  {selectedQuestion.aiObservation}
                </p>
              </div>
            </motion.div>
          </AnimatePresence>
        </motion.section>

        {/* ── SECTION 5: PERSONALIZED AI PATH & CTA ───────────────────── */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="rounded-3xl border border-[#1F232C] bg-[#111318]/90 p-6 sm:p-8 backdrop-blur-2xl shadow-2xl space-y-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-white/[0.06] pb-4 gap-2">
            <div className="flex items-center gap-2.5">
              <Compass className="h-5 w-5 text-[#66B2D6]" />
              <h2 className="font-mono text-xs sm:text-sm font-bold tracking-[0.2em] text-[#66B2D6] uppercase">
                YOUR NEXT STEP — PERSONALIZED AI GROWTH PATH
              </h2>
            </div>
            <span className="font-mono text-xs font-semibold tracking-wider text-muted-foreground">
              Strengthen → Improve → Challenge
            </span>
          </div>

          {/* 3 Growth Step Cards */}
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {/* Step 1: STRENGTHEN */}
            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5 space-y-3 transition-all hover:border-[#66B2D6]/40">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#66B2D6]/20 font-mono text-xs font-bold text-[#66B2D6]">
                  1
                </span>
                <span className="font-mono text-xs font-bold tracking-wider text-muted-foreground uppercase">
                  STRENGTHEN
                </span>
              </div>
              <h4 className="text-base font-bold text-foreground">
                Practice medium/advanced DSA
              </h4>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Refine graph retrieval and vector index algorithmic edge cases under strict latency limits.
              </p>
            </div>

            {/* Step 2: IMPROVE */}
            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5 space-y-3 transition-all hover:border-[#66B2D6]/40">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#66B2D6]/20 font-mono text-xs font-bold text-[#66B2D6]">
                  2
                </span>
                <span className="font-mono text-xs font-bold tracking-wider text-muted-foreground uppercase">
                  IMPROVE
                </span>
              </div>
              <h4 className="text-base font-bold text-foreground">
                Improve explanation clarity
              </h4>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Structure technical answers with clear tradeoffs, system impact, and fallback strategies.
              </p>
            </div>

            {/* Step 3: CHALLENGE */}
            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5 space-y-3 transition-all hover:border-[#66B2D6]/40">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#66B2D6]/20 font-mono text-xs font-bold text-[#66B2D6]">
                  3
                </span>
                <span className="font-mono text-xs font-bold tracking-wider text-muted-foreground uppercase">
                  CHALLENGE
                </span>
              </div>
              <h4 className="text-base font-bold text-foreground">
                Try another adaptive AI interview
              </h4>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Test your gains in a higher difficulty Agentic AI & MCP session with real-time probes.
              </p>
            </div>
          </div>

          {/* PRIMARY CTA BUTTON */}
          <div className="flex items-center justify-center pt-4">
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={handleDownload}
              className="flex items-center gap-3 rounded-2xl bg-[#66B2D6] px-8 py-4 font-mono text-sm sm:text-base font-extrabold tracking-wider text-[#111318] shadow-[0_0_35px_rgba(102,178,214,0.5)] transition-all hover:shadow-[0_0_50px_rgba(102,178,214,0.8)] hover:brightness-110"
            >
              <Download className="h-5 w-5" />
              DOWNLOAD FEEDBACK PROBE →
            </motion.button>
          </div>
        </motion.section>

      </div>
    </div>
  );
}
