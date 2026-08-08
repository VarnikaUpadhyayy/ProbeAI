import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { LiveBackground } from "@/components/LiveBackground";
import { DetailedFeedbackPage } from "@/components/DetailedFeedbackPage";
import { CinematicEntry } from "@/components/CinematicEntry";
import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mic,
  MicOff,
  Send,
  Keyboard,
  ChevronRight,
  Brain,
  Eye,
  Clock,
  Volume2,
  Wifi,
  Shield,
  Sparkles,
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Loader2,
  X,
  User,
  FileText,
} from "lucide-react";
import { candidates } from "@/data/candidateData";
import {
  selectQuestionsForCandidate,
  type InterviewQuestion,
} from "@/data/interviewData";

export const Route = createFileRoute("/interview/$candidateId")({
  head: () => ({
    meta: [
      { title: "ProbeAI — AI Interview Chamber" },
      {
        name: "description",
        content: "Immersive AI-powered technical interview session.",
      },
    ],
  }),
  component: InterviewPage,
});

// ── Types ────────────────────────────────────────────────────
type Phase = "entry" | "interview" | "ai-thinking" | "complete" | "feedback";
type AIState = "speaking" | "listening" | "analyzing" | "thinking";

const AI_STATE_CONFIG: Record<
  AIState,
  { label: string; color: string; icon: string; glow: string }
> = {
  speaking: {
    label: "SPEAKING",
    color: "text-emerald-400",
    icon: "●",
    glow: "rgba(52,211,153,0.5)",
  },
  listening: {
    label: "LISTENING",
    color: "text-cyan",
    icon: "●",
    glow: "rgba(34,211,238,0.5)",
  },
  analyzing: {
    label: "ANALYZING",
    color: "text-violet-400",
    icon: "◉",
    glow: "rgba(167,139,250,0.5)",
  },
  thinking: {
    label: "AI THINKING",
    color: "text-amber-400",
    icon: "◉",
    glow: "rgba(251,191,36,0.5)",
  },
};

// ── Entry text sequence ──────────────────────────────────────
const ENTRY_SEQUENCE = [
  "INITIALIZING PROBE SESSION...",
  "CONNECTING TO AI NEURAL CORE...",
  "CALIBRATING ADAPTIVE ENGINE...",
  "ENTERING INTERVIEW CHAMBER...",
];

// ── Completion analysis steps ────────────────────────────────
const ANALYSIS_STEPS = [
  { text: "Analyzing Technical Knowledge...", duration: 1800 },
  { text: "Evaluating Reasoning Depth...", duration: 1500 },
  { text: "Measuring Communication Clarity...", duration: 1200 },
  { text: "Generating Personalized Report...", duration: 2000 },
];

// ── Main Page ────────────────────────────────────────────────
function InterviewPage() {
  const { candidateId } = useParams({ from: "/interview/$candidateId" });
  const candidate = useMemo(
    () => candidates.find((c) => c.member.id === candidateId),
    [candidateId],
  );
  const questions = useMemo(
    () => (candidate ? selectQuestionsForCandidate(candidate.missions) : []),
    [candidate],
  );

  const [phase, setPhase] = useState<Phase>("entry");
  const [currentQ, setCurrentQ] = useState(0);
  const [aiState, setAiState] = useState<AIState>("speaking");
  const [difficulty, setDifficulty] = useState(2); // 0-4
  const [inputMode, setInputMode] = useState<"voice" | "type">("voice");
  const [answer, setAnswer] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [timer, setTimer] = useState(0);
  const [metrics, setMetrics] = useState({
    techDepth: 0,
    clarity: 0,
    reasoning: 0,
  });
  const [completionStep, setCompletionStep] = useState(-1);
  const [reportReady, setReportReady] = useState(false);

  // Timer
  useEffect(() => {
    if (phase !== "interview") return;
    const id = setInterval(() => setTimer((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, [phase]);

  // Entry sequence → interview
  useEffect(() => {
    if (phase !== "entry") return;
    const timeout = setTimeout(() => {
      setPhase("interview");
      // AI starts by "speaking" the question
      setAiState("speaking");
      setTimeout(() => setAiState("listening"), 3000);
    }, ENTRY_SEQUENCE.length * 2000 + 500);
    return () => clearTimeout(timeout);
  }, [phase]);

  // Simulate AI state cycle when thinking
  useEffect(() => {
    if (phase !== "ai-thinking") return;
    setAiState("analyzing");
    const t1 = setTimeout(() => setAiState("thinking"), 1500);
    const t2 = setTimeout(() => {
      // Advance question
      if (currentQ >= questions.length - 1) {
        setPhase("complete");
        runCompletionSequence();
      } else {
        setCurrentQ((q) => q + 1);
        setPhase("interview");
        setAiState("speaking");
        setAnswer("");
        setIsRecording(false);
        // Adjust difficulty based on simulated performance
        setDifficulty((d) => Math.min(4, d + (Math.random() > 0.4 ? 1 : -1)));
        // Update metrics gradually
        setMetrics((m) => ({
          techDepth: Math.min(100, m.techDepth + 8 + Math.random() * 5),
          clarity: Math.min(100, m.clarity + 7 + Math.random() * 6),
          reasoning: Math.min(100, m.reasoning + 6 + Math.random() * 7),
        }));
        setTimeout(() => setAiState("listening"), 3000);
      }
    }, 3500);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [phase, currentQ, questions.length]);

  const runCompletionSequence = useCallback(() => {
    ANALYSIS_STEPS.forEach((step, i) => {
      const delay = ANALYSIS_STEPS.slice(0, i).reduce(
        (sum, s) => sum + s.duration,
        0,
      );
      setTimeout(() => setCompletionStep(i), delay);
    });
    const totalDelay = ANALYSIS_STEPS.reduce(
      (sum, s) => sum + s.duration,
      0,
    );
    setTimeout(() => setReportReady(true), totalDelay + 500);
  }, []);

  const handleSubmitAnswer = useCallback(() => {
    if (!answer.trim() && inputMode === "type") return;
    setAiState("analyzing");
    setIsRecording(false);
    setTimeout(() => setPhase("ai-thinking"), 800);
  }, [answer, inputMode]);

  const handleNextQuestion = useCallback(() => {
    if (isRecording) {
      setIsRecording(false);
    }
    setAiState("analyzing");
    setTimeout(() => setPhase("ai-thinking"), 400);
  }, [isRecording]);

  const handleDirectSubmitFeedback = useCallback(() => {
    if (isRecording) {
      setIsRecording(false);
    }
    setPhase("feedback");
  }, [isRecording]);

  const handleSubmitInterview = useCallback(() => {
    if (isRecording) {
      setIsRecording(false);
    }
    setPhase("feedback");
  }, [isRecording]);

  const handleToggleRecording = useCallback(() => {
    if (isRecording) {
      setIsRecording(false);
      setAnswer("(Voice response captured)");
      setTimeout(() => {
        setAiState("analyzing");
        setTimeout(() => setPhase("ai-thinking"), 800);
      }, 500);
    } else {
      setIsRecording(true);
      setAiState("listening");
    }
  }, [isRecording]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  };

  if (!candidate) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-muted-foreground">Candidate not found.</p>
        <Link to="/candidates" className="ml-4 text-cyan underline">
          Go back
        </Link>
      </div>
    );
  }

  const currentQuestion = questions[currentQ];
  const isLastQuestion = currentQ >= (questions.length > 0 ? questions.length - 1 : 0);

  const handleEntryComplete = useCallback(() => {
    setPhase("interview");
    setAiState("speaking");
    setTimeout(() => setAiState("listening"), 3000);
  }, []);

  return (
    <main className="relative min-h-screen overflow-hidden bg-background">
      {phase !== "feedback" && (
        <>
          <LiveBackground />
          <div className="pointer-events-none fixed inset-0 neural-bg opacity-70" />
          <div className="pointer-events-none fixed inset-0 grid-lines opacity-40" />
        </>
      )}

      <AnimatePresence mode="wait">
        {phase === "entry" && (
          <CinematicEntry key="entry" onComplete={handleEntryComplete} />
        )}

        {(phase === "interview" || phase === "ai-thinking") && (
          <motion.div
            key="room"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
            className="relative flex min-h-screen flex-col"
          >
            {/* Top HUD */}
            <TopHUD
              questionNum={currentQ + 1}
              totalQuestions={questions.length}
              time={formatTime(timer)}
              candidateName={candidate.member.name}
              onSubmitInterview={handleDirectSubmitFeedback}
            />

            {/* Main interview area */}
            <div className="flex w-full flex-1 flex-col gap-5 px-4 py-4 sm:px-6 sm:py-5 lg:flex-row lg:px-8 min-h-[calc(100vh-70px)]">
              {/* Left: AI Agent */}
              <div className="w-full lg:w-[300px] xl:w-[340px] shrink-0 flex flex-col">
                <AIAgentPanel aiState={aiState} />
              </div>

              {/* Center: Question + Interaction */}
              <div className="flex flex-1 flex-col gap-5 min-w-0 h-full">
                {currentQuestion && (
                  <HolographicQuestion
                    question={currentQuestion}
                    questionNum={currentQ + 1}
                    totalQuestions={questions.length}
                  />
                )}

                {/* Interaction Zone */}
                <InteractionZone
                  inputMode={inputMode}
                  setInputMode={setInputMode}
                  answer={answer}
                  setAnswer={setAnswer}
                  isRecording={isRecording}
                  onToggleRecording={handleToggleRecording}
                  onSubmit={handleSubmitAnswer}
                  aiState={aiState}
                  candidateName={candidate.member.name}
                  isLastQuestion={isLastQuestion}
                  onNextQuestion={handleNextQuestion}
                  onSubmitInterview={handleDirectSubmitFeedback}
                />
              </div>

              {/* Right: Observation */}
              <div className="w-full lg:w-[320px] xl:w-[360px] shrink-0 flex flex-col">
                <ObservationPanel
                  metrics={metrics}
                  difficulty={difficulty}
                />
              </div>
            </div>

            {/* AI Thinking Overlay */}
            <AnimatePresence>
              {phase === "ai-thinking" && (
                <AIThinkingOverlay aiState={aiState} />
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {phase === "complete" && (
          <CompletionFlow
            key="complete"
            completionStep={completionStep}
            reportReady={reportReady}
            candidateName={candidate.member.name}
            metrics={metrics}
            onViewFeedback={() => setPhase("feedback")}
          />
        )}

        {phase === "feedback" && (
          <DetailedFeedbackPage
            key="feedback"
            candidateName={candidate.member.name}
            date="AUG 8, 2026"
            duration={formatTime(timer)}
            onStartAnother={() => {
              setCurrentQ(0);
              setAnswer("");
              setTimer(0);
              setPhase("entry");
            }}
            onBackToDashboard={() => {
              window.location.href = "/candidates";
            }}
          />
        )}
      </AnimatePresence>
    </main>
  );
}

// ── Top HUD ──────────────────────────────────────────────────
function TopHUD({
  questionNum,
  totalQuestions,
  time,
  candidateName,
  onSubmitInterview,
}: {
  questionNum: number;
  totalQuestions: number;
  time: string;
  candidateName: string;
  onSubmitInterview?: () => void;
}) {
  return (
    <div className="hud-bar relative z-30">
      <div className="flex w-full items-center justify-between px-6 sm:px-8 py-3.5">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-cyan/80" />
            <span className="font-mono text-xs font-bold tracking-[0.2em] text-cyan">
              AI INTERVIEW
            </span>
          </div>
          <span className="h-3.5 w-px bg-white/15" />
          <span className="font-mono text-xs font-semibold tracking-wider text-foreground/90">
            {candidateName.toUpperCase()}
          </span>
        </div>

        <div className="flex items-center gap-4">
          <span className="font-mono text-xs font-medium tracking-wider text-foreground/90">
            QUESTION{" "}
            <span className="text-cyan font-bold">
              {String(questionNum).padStart(2, "0")}
            </span>
            /{String(totalQuestions).padStart(2, "0")}
          </span>
          <span className="h-3.5 w-px bg-white/15" />
          <div className="flex items-center gap-1.5">
            <Clock className="h-4 w-4 text-muted-foreground/70" />
            <span className="font-mono text-xs sm:text-sm font-semibold tabular-nums text-foreground/90">
              {time}
            </span>
          </div>
          <span className="h-3.5 w-px bg-white/15" />
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_2px_rgba(52,211,153,0.5)]" />
            <span className="font-mono text-xs font-bold tracking-wider text-emerald-400">
              LIVE
            </span>
          </div>
          {onSubmitInterview && (
            <>
              <span className="h-3.5 w-px bg-white/15" />
              <button
                onClick={onSubmitInterview}
                className="flex items-center gap-1.5 rounded-full border border-[#66B2D6]/50 bg-[#66B2D6]/10 px-3.5 py-1.5 font-mono text-xs font-semibold tracking-wider text-[#66B2D6] transition hover:bg-[#66B2D6] hover:text-[#111318] shadow-[0_0_12px_rgba(102,178,214,0.3)]"
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                SUBMIT INTERVIEW
              </button>
            </>
          )}
        </div>
      </div>
      {/* Glow line */}
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-cyan/30 to-transparent" />
    </div>
  );
}

// ── AI Agent Panel ───────────────────────────────────────────
function AIAgentPanel({ aiState }: { aiState: AIState }) {
  const config = AI_STATE_CONFIG[aiState];

  return (
    <motion.div
      initial={{ opacity: 0, x: -30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="holo-frame animate-holo-flicker rounded-2xl p-5 sm:p-6 h-full flex flex-col justify-between"
    >
      <p className="font-mono text-xs font-bold tracking-[0.2em] text-cyan/90">
        AI INTERVIEWER
      </p>

      {/* AI Avatar with neural core */}
      <div className="relative mx-auto mt-4 flex h-32 w-32 items-center justify-center">
        {/* Pulsing rings */}
        {[100, 120].map((size) => (
          <motion.div
            key={size}
            className="absolute rounded-full border"
            style={{
              width: size,
              height: size,
              borderColor: config.glow,
              opacity: 0.2,
            }}
            animate={{ scale: [1, 1.1, 1], opacity: [0.15, 0.3, 0.15] }}
            transition={{ duration: 3, repeat: Infinity }}
          />
        ))}

        {/* Core */}
        <div
          className="relative z-10 flex h-20 w-20 items-center justify-center rounded-full border border-white/10"
          style={{
            background: `radial-gradient(circle at 30% 30%, ${config.glow}, rgba(15,15,20,0.9))`,
            boxShadow: `0 0 40px -8px ${config.glow}`,
          }}
        >
          <Brain className="h-8 w-8 text-white/80" />
        </div>
      </div>

      {/* State indicator */}
      <div className="mt-4 flex items-center justify-center gap-2">
        <motion.span
          className={`text-base ${config.color}`}
          animate={{ opacity: [1, 0.5, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          {config.icon}
        </motion.span>
        <span
          className={`font-mono text-xs font-bold tracking-[0.2em] ${config.color}`}
        >
          {config.label}
        </span>
      </div>

      {/* Pen/writing animation for analyzing/thinking */}
      <AnimatePresence>
        {(aiState === "analyzing" || aiState === "thinking") && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-3 overflow-hidden"
          >
            <div className="flex items-center justify-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2">
              <FileText className="h-4 w-4 text-muted-foreground/70" />
              <div className="flex gap-0.5">
                {[0, 1, 2].map((i) => (
                  <motion.span
                    key={i}
                    className="inline-block h-1.5 w-1.5 rounded-full bg-current text-muted-foreground/70"
                    animate={{ opacity: [0.2, 1, 0.2], y: [0, -4, 0] }}
                    transition={{
                      duration: 1.4,
                      repeat: Infinity,
                      delay: i * 0.2,
                    }}
                  />
                ))}
              </div>
              <span className="font-mono text-xs font-semibold tracking-wider text-muted-foreground">
                TAKING NOTES
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Connection status */}
      <div className="mt-4 flex items-center justify-center gap-2 border-t border-white/[0.06] pt-3">
        <Wifi className="h-3.5 w-3.5 text-emerald-400" />
        <span className="font-mono text-xs font-semibold tracking-wider text-emerald-400/90">
          NEURAL LINK ACTIVE
        </span>
      </div>
    </motion.div>
  );
}

// ── Holographic Question ─────────────────────────────────────
function HolographicQuestion({
  question,
  questionNum,
  totalQuestions,
}: {
  question: InterviewQuestion;
  questionNum: number;
  totalQuestions: number;
}) {
  return (
    <motion.div
      key={question.id}
      initial={{ opacity: 0, y: 20, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="holo-frame animate-holo-flicker relative overflow-hidden rounded-2xl p-6 sm:p-8"
    >
      {/* Scan line effect */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-[0.04]">
        <div className="animate-scan-line absolute inset-x-0 h-12 bg-gradient-to-b from-transparent via-cyan to-transparent" />
      </div>

      {/* Corner accents */}
      <div className="absolute left-0 top-0 h-6 w-6 border-l-2 border-t-2 border-cyan/30 rounded-tl-lg" />
      <div className="absolute right-0 top-0 h-6 w-6 border-r-2 border-t-2 border-cyan/30 rounded-tr-lg" />
      <div className="absolute bottom-0 left-0 h-6 w-6 border-b-2 border-l-2 border-cyan/30 rounded-bl-lg" />
      <div className="absolute bottom-0 right-0 h-6 w-6 border-b-2 border-r-2 border-cyan/30 rounded-br-lg" />

      {/* Question header */}
      <div className="flex items-center justify-between">
        <span className="font-mono text-xs sm:text-sm font-semibold tracking-[0.2em] text-cyan/90">
          QUESTION {String(questionNum).padStart(2, "0")}/
          {String(totalQuestions).padStart(2, "0")}
        </span>
        <Sparkles className="h-4 w-4 text-cyan/50" />
      </div>

      {/* Question text */}
      <h2 className="mt-4 text-lg font-medium leading-relaxed tracking-tight text-foreground sm:text-xl">
        "{question.text}"
      </h2>

      {/* Topic pills */}
      <div className="mt-5 flex flex-wrap gap-2">
        <span className="rounded-full border border-cyan/30 bg-cyan/[0.1] px-3.5 py-1 font-mono text-xs font-semibold tracking-wider text-cyan">
          {question.topic.toUpperCase()}
        </span>
        <span className="rounded-full border border-violet-500/30 bg-violet-500/[0.1] px-3.5 py-1 font-mono text-xs font-semibold tracking-wider text-violet-400">
          {question.category}
        </span>
        <span
          className={`rounded-full border px-3.5 py-1 font-mono text-xs font-semibold tracking-wider ${
            question.difficulty === "EASY"
              ? "border-emerald-500/30 bg-emerald-500/[0.1] text-emerald-400"
              : question.difficulty === "MEDIUM"
                ? "border-amber-500/30 bg-amber-500/[0.1] text-amber-400"
                : "border-red-500/30 bg-red-500/[0.1] text-red-400"
          }`}
        >
          {question.difficulty}
        </span>
      </div>
    </motion.div>
  );
}

// ── Interaction Zone ─────────────────────────────────────────
function InteractionZone({
  inputMode,
  setInputMode,
  answer,
  setAnswer,
  isRecording,
  onToggleRecording,
  onSubmit,
  aiState,
  candidateName,
  isLastQuestion,
  onNextQuestion,
  onSubmitInterview,
}: {
  inputMode: "voice" | "type";
  setInputMode: (m: "voice" | "type") => void;
  answer: string;
  setAnswer: (a: string) => void;
  isRecording: boolean;
  onToggleRecording: () => void;
  onSubmit: () => void;
  aiState: AIState;
  candidateName: string;
  isLastQuestion: boolean;
  onNextQuestion: () => void;
  onSubmitInterview: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="holo-frame rounded-2xl p-5 sm:p-6 flex-1 flex flex-col justify-between min-h-[340px]"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Candidate live indicator */}
          <div className="flex items-center gap-2 rounded-full border border-cyan/30 bg-cyan/[0.08] px-3.5 py-1">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
            </span>
            <span className="font-mono text-xs font-semibold tracking-wider text-cyan">
              CANDIDATE • LIVE
            </span>
          </div>
        </div>

        {/* Mode toggle */}
        <div className="flex rounded-lg border border-white/[0.08] bg-white/[0.03] p-1">
          <button
            onClick={() => setInputMode("voice")}
            className={`flex items-center gap-1.5 rounded-md px-3.5 py-1.5 font-mono text-xs font-semibold transition-all ${
              inputMode === "voice"
                ? "bg-cyan/20 text-cyan border border-cyan/30"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Mic className="h-3.5 w-3.5" />
            VOICE
          </button>
          <button
            onClick={() => setInputMode("type")}
            className={`flex items-center gap-1.5 rounded-md px-3.5 py-1.5 font-mono text-xs font-semibold transition-all ${
              inputMode === "type"
                ? "bg-cyan/20 text-cyan border border-cyan/30"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Keyboard className="h-3.5 w-3.5" />
            TYPE
          </button>
        </div>
      </div>

      {/* Voice Mode */}
      {inputMode === "voice" && (
        <div className="mt-5">
          <div className="flex flex-col items-center gap-4">
            {/* Waveform visualization */}
            <div className="flex h-16 w-full items-center justify-center gap-[3px] rounded-xl border border-white/[0.04] bg-white/[0.01] px-6">
              {Array.from({ length: 40 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="w-[3px] rounded-full bg-cyan/60"
                  style={{ originY: 1 }}
                  animate={
                    isRecording
                      ? {
                          scaleY: [
                            0.2 + Math.random() * 0.3,
                            0.5 + Math.random() * 0.5,
                            0.2 + Math.random() * 0.3,
                          ],
                          height: [8, 28 + Math.random() * 16, 8],
                        }
                      : { scaleY: 0.3, height: 6 }
                  }
                  transition={{
                    duration: 0.4 + Math.random() * 0.4,
                    repeat: Infinity,
                    delay: i * 0.02,
                  }}
                />
              ))}
            </div>

            {/* Record button */}
            <div className="flex items-center gap-4">
              <motion.button
                onClick={onToggleRecording}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`relative flex h-14 w-14 items-center justify-center rounded-full border-2 transition-all duration-300 ${
                  isRecording
                    ? "border-red-500/60 bg-red-500/20 text-red-400"
                    : "border-cyan/40 bg-cyan/10 text-cyan hover:border-cyan/60"
                }`}
                style={{
                  boxShadow: isRecording
                    ? "0 0 30px -4px rgba(239,68,68,0.4)"
                    : "0 0 30px -4px rgba(34,211,238,0.3)",
                }}
              >
                {isRecording ? (
                  <MicOff className="h-6 w-6" />
                ) : (
                  <Mic className="h-6 w-6" />
                )}
                {isRecording && (
                  <motion.span
                    className="absolute -inset-1 rounded-full border border-red-500/30"
                    animate={{ scale: [1, 1.3, 1], opacity: [0.6, 0, 0.6] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                )}
              </motion.button>
              <div>
                <p className="font-mono text-xs font-semibold tracking-wider text-foreground">
                  {isRecording ? "RECORDING..." : "SPEAK YOUR ANSWER"}
                </p>
                <p className="mt-0.5 font-mono text-xs text-muted-foreground">
                  {isRecording
                    ? "Tap to stop & submit"
                    : "Tap the microphone to begin"}
                </p>
              </div>
            </div>

            {/* Simulated transcription */}
            {isRecording && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="w-full rounded-lg border border-white/[0.08] bg-white/[0.03] p-3"
              >
                <p className="font-mono text-xs font-semibold tracking-wider text-muted-foreground">
                  REAL-TIME TRANSCRIPTION
                </p>
                <div className="mt-1 flex items-center gap-1">
                  <span className="text-sm text-foreground/80 font-sans">
                    Listening to response
                  </span>
                  <motion.span
                    className="inline-block h-3.5 w-0.5 bg-cyan"
                    animate={{ opacity: [1, 0, 1] }}
                    transition={{ duration: 0.8, repeat: Infinity }}
                  />
                </div>
              </motion.div>
            )}
          </div>
        </div>
      )}

      {/* Type Mode */}
      {inputMode === "type" && (
        <div className="mt-5">
          <div className="relative">
            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Type your answer here..."
              rows={4}
              className="w-full resize-none rounded-xl border border-white/[0.08] bg-white/[0.02] px-4 py-3 font-sans text-sm text-foreground placeholder:text-muted-foreground/30 backdrop-blur-sm transition-all focus:border-cyan/30 focus:outline-none focus:ring-1 focus:ring-cyan/20"
            />
            <button
              onClick={onSubmit}
              disabled={!answer.trim()}
              className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-lg bg-cyan/20 px-3 py-1.5 font-mono text-xs tracking-wider text-cyan transition-all hover:bg-cyan/30 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <Send className="h-3.5 w-3.5" />
              SUBMIT
            </button>
          </div>
        </div>
      )}

      {/* Navigation Bar: Next Question & Submit Interview side-by-side */}
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.06] pt-4">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-semibold tracking-wider text-muted-foreground">
            QUESTION PROGRESS
          </span>
          <span className="rounded-full border border-cyan/30 bg-cyan/10 px-3 py-0.5 font-mono text-xs font-semibold text-cyan">
            {isLastQuestion ? "FINAL QUESTION" : "IN PROGRESS"}
          </span>
        </div>

        <div className="flex items-center gap-2.5">
          {!isLastQuestion && (
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.96 }}
              onClick={onNextQuestion}
              className="btn-glow flex items-center gap-2 px-5 py-2.5 font-mono text-xs font-semibold tracking-wider"
            >
              Next Question
              <ChevronRight className="h-4 w-4" />
            </motion.button>
          )}

          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={onSubmitInterview}
            className="flex items-center gap-2 rounded-full bg-[#66B2D6] px-5 py-2.5 font-mono text-xs font-bold tracking-wider text-[#111318] shadow-[0_0_25px_rgba(102,178,214,0.4)] transition-all hover:shadow-[0_0_35px_rgba(102,178,214,0.7)] hover:brightness-110"
          >
            Submit Interview
            <CheckCircle2 className="h-4 w-4" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

// ── Observation Panel ────────────────────────────────────────
function ObservationPanel({
  metrics,
  difficulty,
}: {
  metrics: { techDepth: number; clarity: number; reasoning: number };
  difficulty: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, delay: 0.4 }}
      className="holo-frame animate-holo-flicker rounded-2xl p-5 sm:p-6 h-full flex flex-col justify-between"
    >
      <p className="font-mono text-xs font-semibold tracking-[0.2em] text-cyan/90">
        AI OBSERVATION
      </p>

      {/* Metric bars */}
      <div className="mt-5 space-y-4">
        <MetricBar label="Technical Depth" value={metrics.techDepth} color="bg-cyan" />
        <MetricBar label="Clarity" value={metrics.clarity} color="bg-emerald-400" />
        <MetricBar
          label="Reasoning"
          value={metrics.reasoning}
          color="bg-violet-400"
        />
      </div>

      {/* Divider */}
      <div className="my-5 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      {/* Adaptive Engine */}
      <div>
        <p className="font-mono text-xs font-semibold tracking-[0.2em] text-cyan/90">
          ADAPTIVE ENGINE
        </p>
        <div className="mt-3">
          <div className="flex items-center justify-between font-mono text-xs font-medium text-muted-foreground/80">
            <span>EASY</span>
            <span>HARD</span>
          </div>
          <div className="relative mt-2 h-2 rounded-full bg-white/[0.08]">
            <motion.div
              className="absolute top-1/2 h-3.5 w-3.5 -translate-y-1/2 rounded-full border border-cyan bg-cyan/40 shadow-[0_0_12px_2px_rgba(34,211,238,0.5)]"
              animate={{ left: `${(difficulty / 4) * 100}%` }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              style={{ marginLeft: -7 }}
            />
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-500/50 via-amber-500/50 to-red-500/50"
            />
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="my-5 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      {/* Interview insights */}
      <div>
        <p className="font-mono text-xs font-semibold tracking-[0.2em] text-cyan/90">
          SESSION INSIGHTS
        </p>
        <div className="mt-3 space-y-2.5">
          {[
            { label: "Response Pattern", value: "Analytical" },
            { label: "Confidence Level", value: "High" },
            { label: "Knowledge Depth", value: "Intermediate+" },
          ].map((insight) => (
            <div
              key={insight.label}
              className="flex items-center justify-between"
            >
              <span className="font-mono text-xs text-muted-foreground/80">
                {insight.label}
              </span>
              <span className="font-mono text-xs font-semibold text-foreground/90">
                {insight.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// ── Metric Bar ───────────────────────────────────────────────
function MetricBar({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <span className="font-mono text-xs font-medium text-foreground/80">
          {label}
        </span>
        <span className="font-mono text-xs font-semibold text-foreground">
          {Math.round(value)}%
        </span>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/[0.08]">
        <motion.div
          className={`h-full rounded-full ${color}`}
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          style={{
            boxShadow: `0 0 12px -2px currentColor`,
          }}
        />
      </div>
    </div>
  );
}

// ── AI Thinking Overlay ──────────────────────────────────────
function AIThinkingOverlay({ aiState }: { aiState: AIState }) {
  const config = AI_STATE_CONFIG[aiState];
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-40 flex items-center justify-center bg-background/80 backdrop-blur-md"
    >
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        className="flex flex-col items-center"
      >
        {/* Neural core animation */}
        <div className="relative h-24 w-24">
          {[80, 96].map((size) => (
            <motion.div
              key={size}
              className="absolute left-1/2 top-1/2 rounded-full border border-cyan/15"
              style={{
                width: size,
                height: size,
                marginLeft: -size / 2,
                marginTop: -size / 2,
              }}
              animate={{ rotate: 360 }}
              transition={{
                duration: 6 + (size - 80),
                ease: "linear",
                repeat: Infinity,
              }}
            />
          ))}
          <motion.div
            className="absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full"
            style={{
              background: `radial-gradient(circle, ${config.glow}, transparent)`,
              boxShadow: `0 0 60px -10px ${config.glow}`,
            }}
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Brain className="h-7 w-7 text-white/80" />
          </motion.div>
        </div>

        <motion.p
          className={`mt-6 font-mono text-sm tracking-[0.3em] ${config.color}`}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          {config.label === "ANALYZING"
            ? "ANALYZING RESPONSE..."
            : "AI IS THINKING..."}
        </motion.p>

        {/* Neural particles */}
        <div className="mt-4 flex gap-1">
          {[0, 1, 2, 3, 4].map((i) => (
            <motion.span
              key={i}
              className="h-1 w-1 rounded-full bg-cyan/50"
              animate={{ opacity: [0.2, 1, 0.2], y: [0, -6, 0] }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay: i * 0.15,
              }}
            />
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Completion Flow ──────────────────────────────────────────
function CompletionFlow({
  completionStep,
  reportReady,
  candidateName,
  metrics,
  onViewFeedback,
}: {
  completionStep: number;
  reportReady: boolean;
  candidateName: string;
  metrics: { techDepth: number; clarity: number; reasoning: number };
  onViewFeedback?: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-background"
    >
      <div className="pointer-events-none fixed inset-0 neural-bg opacity-50" />
      <div className="relative flex flex-col items-center px-6 text-center">
        <AnimatePresence mode="wait">
          {!reportReady ? (
            <motion.div
              key="analyzing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center"
            >
              {/* Header */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-10"
              >
                <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-400/80" />
                <p className="mt-4 font-mono text-sm tracking-[0.3em] text-emerald-400/80">
                  FINAL RESPONSE RECEIVED
                </p>
              </motion.div>

              {/* Analysis steps */}
              <div className="w-full max-w-md space-y-4">
                {ANALYSIS_STEPS.map((step, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={
                      completionStep >= i
                        ? { opacity: 1, x: 0 }
                        : { opacity: 0.2, x: 0 }
                    }
                    transition={{ duration: 0.5 }}
                    className="flex items-center gap-3"
                  >
                    {completionStep > i ? (
                      <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400" />
                    ) : completionStep === i ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                      >
                        <Loader2 className="h-5 w-5 shrink-0 text-cyan" />
                      </motion.div>
                    ) : (
                      <div className="h-5 w-5 shrink-0 rounded-full border border-white/10" />
                    )}
                    <span
                      className={`font-mono text-xs tracking-[0.15em] ${
                        completionStep >= i
                          ? "text-foreground/80"
                          : "text-muted-foreground/30"
                      }`}
                    >
                      {step.text}
                    </span>
                  </motion.div>
                ))}
              </div>

              {/* Progress bar */}
              <div className="mt-8 h-[2px] w-64 overflow-hidden rounded-full bg-white/[0.06]">
                <motion.div
                  className="h-full bg-gradient-to-r from-cyan to-emerald-400"
                  animate={{
                    width: `${((completionStep + 1) / ANALYSIS_STEPS.length) * 100}%`,
                  }}
                  transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                />
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="ready"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col items-center"
            >
              {/* Glow core */}
              <div className="relative mb-8">
                <motion.div
                  className="h-24 w-24 rounded-full"
                  style={{
                    background:
                      "radial-gradient(circle, rgba(52,211,153,0.5), rgba(34,211,238,0.2) 60%, transparent)",
                    boxShadow:
                      "0 0 100px 30px rgba(52,211,153,0.2)",
                  }}
                  animate={{ scale: [1, 1.15, 1] }}
                  transition={{ duration: 3, repeat: Infinity }}
                />
                <BarChart3 className="absolute left-1/2 top-1/2 h-10 w-10 -translate-x-1/2 -translate-y-1/2 text-emerald-400" />
              </div>

              <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                <span className="text-gradient">Your Interview Report</span>
                <br />
                <span className="text-foreground/90">Is Ready.</span>
              </h1>

              <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-muted-foreground">
                The AI has completed its analysis of {candidateName}'s
                technical interview across all {10} questions.
              </p>

              {/* Quick metrics preview */}
              <div className="mt-8 grid grid-cols-3 gap-4">
                {[
                  {
                    label: "Technical",
                    value: Math.round(metrics.techDepth),
                    color: "text-cyan",
                  },
                  {
                    label: "Clarity",
                    value: Math.round(metrics.clarity),
                    color: "text-emerald-400",
                  },
                  {
                    label: "Reasoning",
                    value: Math.round(metrics.reasoning),
                    color: "text-violet-400",
                  },
                ].map((m) => (
                  <div
                    key={m.label}
                    className="holo-frame rounded-xl px-5 py-4 text-center"
                  >
                    <p className={`text-2xl font-bold ${m.color}`}>
                      {m.value}%
                    </p>
                    <p className="mt-1 font-mono text-[8px] uppercase tracking-[0.2em] text-muted-foreground/50">
                      {m.label}
                    </p>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mt-10 flex flex-col items-center gap-3 sm:flex-row"
              >
                {onViewFeedback ? (
                  <motion.button
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={onViewFeedback}
                    className="flex items-center gap-2 rounded-full bg-[#66B2D6] px-8 py-3 font-mono text-xs font-semibold tracking-wider text-[#111318] shadow-[0_0_25px_rgba(102,178,214,0.4)] transition-all hover:shadow-[0_0_35px_rgba(102,178,214,0.7)] hover:brightness-110"
                  >
                    View Detailed Feedback Page
                    <ArrowRight className="h-4 w-4" />
                  </motion.button>
                ) : (
                  <Link
                    to="/candidates"
                    className="btn-emerald-glow px-8 py-3 text-sm"
                  >
                    View Full Performance Report
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                )}
              </motion.div>

              <Link
                to="/candidates"
                className="mt-6 font-mono text-[10px] tracking-[0.2em] text-muted-foreground/50 transition hover:text-foreground/70"
              >
                RETURN TO DASHBOARD
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
