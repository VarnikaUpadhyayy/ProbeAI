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
  Clock,
  Shield,
  Sparkles,
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { candidates } from "@/data/candidateData";
import type { InterviewQuestion } from "@/data/interviewData";

export const Route = createFileRoute("/interview/$candidateId")({
  head: () => ({
    meta: [
      { title: "ProbeAI — AI Interview Chamber" },
      { name: "description", content: "Immersive AI-powered technical interview session." },
    ],
  }),
  component: InterviewPage,
});

const API_BASE = (import.meta as any).env?.VITE_API_BASE_URL || "http://localhost:8080";

type FeedbackPayload = {
  summary: string;
  strengths: string[];
  gaps: string[];
  next: string[];
};

type InterviewApiResponse = {
  reply: string;
  done: boolean;
  feedback?: FeedbackPayload | null;
  score?: number; // 🔥 Naya Backend Score
};

async function callInterviewApi(body: unknown): Promise<InterviewApiResponse> {
  const res = await fetch(`${API_BASE}/api/interview`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    let detail = `Request failed (${res.status})`;
    try {
      const errBody = await res.json();
      if (errBody?.detail) detail = errBody.detail;
    } catch {}
    throw new Error(detail);
  }
  return res.json();
}

type Phase = "entry" | "interview" | "ai-thinking" | "complete" | "feedback";
type AIState = "speaking" | "listening" | "analyzing" | "thinking";
type QuestionStatus = { num: number; status: "attempted" | "skipped" }; // 🔥 Naya History Tracker

const AI_STATE_CONFIG: Record<AIState, { label: string; color: string; glow: string }> = {
  speaking: { label: "SPEAKING", color: "text-emerald-400", glow: "rgba(52,211,153,0.5)" },
  listening: { label: "LISTENING", color: "text-cyan", glow: "rgba(34,211,238,0.5)" },
  analyzing: { label: "ANALYZING", color: "text-violet-400", glow: "rgba(167,139,250,0.5)" },
  thinking: { label: "AI THINKING", color: "text-amber-400", glow: "rgba(251,191,36,0.5)" },
};

const ANALYSIS_STEPS = [
  { text: "Analyzing Technical Knowledge...", duration: 1800 },
  { text: "Evaluating Reasoning Depth...", duration: 1500 },
  { text: "Measuring Communication Clarity...", duration: 1200 },
  { text: "Generating Personalized Report...", duration: 2000 },
];

const ESTIMATED_TOTAL_QUESTIONS = 8;

function InterviewPage() {
  const { candidateId } = useParams({ from: "/interview/$candidateId" });
  const candidate = useMemo(() => candidates.find((c) => c.member.id === candidateId), [candidateId]);
  const sessionIdRef = useRef<string>(
    typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `session-${Date.now()}`
  );
  const hasStartedRef = useRef(false);
  const isSubmittingRef = useRef(false);

  const [phase, setPhase] = useState<Phase>("entry");
  const [questionText, setQuestionText] = useState<string>("");
  const [questionNum, setQuestionNum] = useState(1);
  const [questionHistory, setQuestionHistory] = useState<QuestionStatus[]>([]); // 🔥 Questions state
  const [aiState, setAiState] = useState<AIState>("speaking");
  const [difficulty, setDifficulty] = useState(2);
  const [inputMode, setInputMode] = useState<"voice" | "type">("type"); // 🔥 Type default pehle
  const [answer, setAnswer] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [timer, setTimer] = useState(0);
  const [metrics, setMetrics] = useState({ techDepth: 10, clarity: 10, reasoning: 10 }); // Default starting scores
  const [completionStep, setCompletionStep] = useState(-1);
  const [reportReady, setReportReady] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackPayload | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  useEffect(() => {
    if (phase !== "interview") return;
    const id = setInterval(() => setTimer((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, [phase]);

  const runCompletionSequence = useCallback(() => {
    ANALYSIS_STEPS.forEach((step, i) => {
      const delay = ANALYSIS_STEPS.slice(0, i).reduce((sum, s) => sum + s.duration, 0);
      setTimeout(() => setCompletionStep(i), delay);
    });
    setTimeout(() => setReportReady(true), ANALYSIS_STEPS.reduce((sum, s) => sum + s.duration, 0) + 500);
  }, []);

  const startInterview = useCallback(async () => {
    if (!candidate || hasStartedRef.current) return;
    hasStartedRef.current = true;
    setApiError(null);
    setAiState("thinking");
    try {
      const data = await callInterviewApi({ sessionId: sessionIdRef.current, candidate });
      setQuestionText(data.reply);
      setPhase("interview");
      setAiState("speaking");
      setTimeout(() => setAiState("listening"), 3000);
    } catch (err) {
      hasStartedRef.current = false;
      setApiError(err instanceof Error ? err.message : "Failed to start the interview.");
    }
  }, [candidate]);

  const handleSubmitAnswer = useCallback(async () => {
    if (isSubmittingRef.current) return;
    if (!answer.trim() && inputMode === "type") return;
    isSubmittingRef.current = true;
    setApiError(null);
    setAiState("analyzing");
    setIsRecording(false);
    setPhase("ai-thinking");

    // 🔥 Check if skipped
    const isSkipped = answer === "SKIPPED_QUESTION_FLAG";
    const actualAnswer = isSkipped ? "I don't know the answer. Skip this question." : answer;

    try {
      const data = await callInterviewApi({
        sessionId: sessionIdRef.current,
        message: actualAnswer,
      });

      // 🔥 Update history for left panel
      setQuestionHistory((prev) => [...prev, { num: questionNum, status: isSkipped ? "skipped" : "attempted" }]);

      setAiState("thinking");
      setTimeout(() => {
        isSubmittingRef.current = false;
        if (data.done) {
          setFeedback(data.feedback ?? null);
          setPhase("complete");
          runCompletionSequence();
          return;
        }

        setQuestionText(data.reply);
        setQuestionNum((n) => n + 1);
        setAnswer("");
        setDifficulty((d) => Math.min(4, d + (Math.random() > 0.4 ? 1 : -1)));
        
        // 🔥 Real Score update (Sirf badhega jab sahi ho, ghatega jab galat)
        if (data.score !== undefined) {
          setMetrics((m) => ({
            techDepth: Math.max(0, Math.min(100, m.techDepth + data.score!)),
            clarity: Math.max(0, Math.min(100, m.clarity + data.score!)),
            reasoning: Math.max(0, Math.min(100, m.reasoning + data.score!)),
          }));
        }

        setPhase("interview");
        setAiState("speaking");
        setTimeout(() => setAiState("listening"), 2500);
      }, 1200);
    } catch (err) {
      isSubmittingRef.current = false;
      setApiError(err instanceof Error ? err.message : "Something went wrong.");
      setPhase("interview");
      setAiState("listening");
    }
  }, [answer, inputMode, runCompletionSequence, questionNum]);

  const handleNextQuestion = useCallback(() => {
    if (isRecording) setIsRecording(false);
    setAnswer("SKIPPED_QUESTION_FLAG"); // 🔥 Skip flag
    setTimeout(() => handleSubmitAnswer(), 50);
  }, [isRecording, handleSubmitAnswer]);

  const handleDirectSubmitFeedback = useCallback(() => {
    if (isRecording) setIsRecording(false);
    setPhase("feedback");
  }, [isRecording]);

  const handleToggleRecording = useCallback(() => {
    if (isRecording) {
      setIsRecording(false);
      setAnswer("(Voice response captured)");
      setTimeout(() => handleSubmitAnswer(), 500);
    } else {
      setIsRecording(true);
      setAiState("listening");
    }
  }, [isRecording, handleSubmitAnswer]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  };

  if (!candidate) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-muted-foreground">Candidate not found.</p>
        <Link to="/candidates" className="ml-4 text-cyan underline">Go back</Link>
      </div>
    );
  }

  const currentQuestion: InterviewQuestion | null = questionText
    ? ({ id: `q-${questionNum}`, text: questionText, topic: "AI ENGINEERING", category: "TECHNICAL", difficulty: difficulty <= 1 ? "EASY" : difficulty <= 3 ? "MEDIUM" : "HARD" } as InterviewQuestion)
    : null;

  const totalQuestionsDisplay = Math.max(questionNum, ESTIMATED_TOTAL_QUESTIONS);

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
        {phase === "entry" && <CinematicEntry key="entry" onComplete={() => startInterview()} />}
        {(phase === "interview" || phase === "ai-thinking") && (
          <motion.div key="room" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }} className="relative flex min-h-screen flex-col">
            <TopHUD questionNum={questionNum} totalQuestions={totalQuestionsDisplay} time={formatTime(timer)} candidateName={candidate.member.name} onSubmitInterview={handleDirectSubmitFeedback} />

            {apiError && <div className="mx-4 mt-3 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2 font-mono text-xs text-red-300 sm:mx-8">{apiError}</div>}

            <div className="flex w-full flex-1 flex-col gap-5 px-4 py-4 sm:px-6 sm:py-5 lg:flex-row lg:px-8 min-h-[calc(100vh-70px)]">
              {/* 🔥 Left: Naya Question Progress Panel */}
              <div className="w-full lg:w-[260px] xl:w-[280px] shrink-0 flex flex-col">
                <QuestionProgressPanel currentNum={questionNum} total={totalQuestionsDisplay} history={questionHistory} />
              </div>

              {/* Center: Question + Interaction */}
              <div className="flex flex-1 flex-col gap-5 min-w-0 h-full">
                {currentQuestion && <HolographicQuestion question={currentQuestion} questionNum={questionNum} totalQuestions={totalQuestionsDisplay} />}
                
                {/* 🔥 Interaction Zone - Type First & Voice Second */}
                <InteractionZone inputMode={inputMode} setInputMode={setInputMode} answer={answer} setAnswer={setAnswer} isRecording={isRecording} onToggleRecording={handleToggleRecording} onSubmit={handleSubmitAnswer} candidateName={candidate.member.name} isLastQuestion={false} onNextQuestion={handleNextQuestion} onSubmitInterview={handleDirectSubmitFeedback} />
              </div>

              {/* Right: Observation */}
              <div className="w-full lg:w-[320px] xl:w-[360px] shrink-0 flex flex-col">
                <ObservationPanel metrics={metrics} difficulty={difficulty} />
              </div>
            </div>

            <AnimatePresence>{phase === "ai-thinking" && <AIThinkingOverlay aiState={aiState} />}</AnimatePresence>
          </motion.div>
        )}

        {phase === "complete" && <CompletionFlow key="complete" completionStep={completionStep} reportReady={reportReady} candidateName={candidate.member.name} metrics={metrics} onViewFeedback={() => setPhase("feedback")} />}
        
        {phase === "feedback" && (
          <DetailedFeedbackPage key="feedback" candidateName={candidate.member.name} date="AUG 8, 2026" duration={formatTime(timer)} onStartAnother={() => window.location.href = "/candidates"} onBackToDashboard={() => window.location.href = "/candidates"} />
        )}
      </AnimatePresence>
    </main>
  );
}

// ── Top HUD ──────────────────────────────────────────────────
function TopHUD({ questionNum, totalQuestions, time, candidateName, onSubmitInterview }: any) {
  return (
    <div className="hud-bar relative z-30">
      <div className="flex w-full items-center justify-between px-6 py-3.5">
        <div className="flex items-center gap-4">
          <Shield className="h-4 w-4 text-cyan" />
          <span className="font-mono text-xs font-bold text-cyan">AI INTERVIEW</span>
          <span className="text-foreground/90 font-mono text-xs">{candidateName.toUpperCase()}</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="font-mono text-xs font-medium text-foreground/90">
            Q <span className="text-cyan font-bold">{String(questionNum).padStart(2, "0")}</span>/{String(totalQuestions).padStart(2, "0")}
          </span>
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span className="font-mono text-sm font-semibold">{time}</span>
          <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_2px_rgba(52,211,153,0.5)]" />
          <span className="font-mono text-xs font-bold text-emerald-400">LIVE</span>
        </div>
      </div>
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-cyan/30 to-transparent" />
    </div>
  );
}

// ── 🔥 NAYA QUESTION PROGRESS PANEL (Left Side) ──────────────
function QuestionProgressPanel({ currentNum, total, history }: { currentNum: number; total: number; history: QuestionStatus[] }) {
  return (
    <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }} className="holo-frame rounded-2xl p-5 sm:p-6 h-full flex flex-col">
      <p className="font-mono text-xs font-bold tracking-[0.2em] text-cyan/90 mb-5">QUESTION TRACKER</p>
      <div className="flex flex-col gap-3 overflow-y-auto">
        {Array.from({ length: total }).map((_, i) => {
          const qNum = i + 1;
          const hist = history.find((h) => h.num === qNum);
          
          let bgClass = "bg-white/[0.02] border-white/[0.05] text-muted-foreground/40"; 
          let statusText = "PENDING";
          let dotColor = "bg-white/20";

          if (hist) {
            if (hist.status === "attempted") {
              bgClass = "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"; // Attempted = Green
              statusText = "ATTEMPTED";
              dotColor = "bg-emerald-400";
            } else if (hist.status === "skipped") {
              bgClass = "bg-white/[0.05] border-white/[0.1] text-muted-foreground"; // Skipped = No Color
              statusText = "SKIPPED";
              dotColor = "bg-muted-foreground";
            }
          } else if (qNum === currentNum) {
            bgClass = "bg-cyan/10 border-cyan/40 text-cyan shadow-[0_0_15px_rgba(34,211,238,0.15)]";
            statusText = "IN PROGRESS";
            dotColor = "bg-cyan animate-pulse";
          }

          return (
            <div key={qNum} className={`flex items-center justify-between rounded-xl border px-4 py-3 transition-all ${bgClass}`}>
              <div className="flex items-center gap-3">
                <span className={`h-2 w-2 rounded-full ${dotColor}`} />
                <span className="font-mono text-sm font-bold tracking-wider">Q{String(qNum).padStart(2, "0")}</span>
              </div>
              <span className="font-mono text-[9px] uppercase tracking-wider opacity-80">{statusText}</span>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}

// ── Holographic Question ─────────────────────────────────────
function HolographicQuestion({ question, questionNum, totalQuestions }: any) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="holo-frame relative overflow-hidden rounded-2xl p-6 sm:p-8">
      <div className="flex items-center justify-between">
        <span className="font-mono text-xs sm:text-sm font-semibold tracking-[0.2em] text-cyan/90">
          QUESTION {String(questionNum).padStart(2, "0")}/{String(totalQuestions).padStart(2, "0")}
        </span>
        <Sparkles className="h-4 w-4 text-cyan/50" />
      </div>
      <h2 className="mt-4 text-lg font-medium leading-relaxed tracking-tight text-foreground sm:text-xl">"{question.text}"</h2>
    </motion.div>
  );
}

// ── Interaction Zone ─────────────────────────────────────────
function InteractionZone({ inputMode, setInputMode, answer, setAnswer, isRecording, onToggleRecording, onSubmit, isLastQuestion, onNextQuestion, onSubmitInterview }: any) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="holo-frame rounded-2xl p-5 sm:p-6 flex-1 flex flex-col justify-between min-h-[340px]">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 rounded-full border border-cyan/30 bg-cyan/[0.08] px-3.5 py-1">
          <span className="relative flex h-2 w-2"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" /><span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" /></span>
          <span className="font-mono text-xs font-semibold tracking-wider text-cyan">CANDIDATE • LIVE</span>
        </div>

        {/* 🔥 Mode toggle - Type is First Now */}
        <div className="flex rounded-lg border border-white/[0.08] bg-white/[0.03] p-1">
          <button onClick={() => setInputMode("type")} className={`flex items-center gap-1.5 rounded-md px-3.5 py-1.5 font-mono text-xs font-semibold transition-all ${inputMode === "type" ? "bg-cyan/20 text-cyan border border-cyan/30" : "text-muted-foreground hover:text-foreground"}`}>
            <Keyboard className="h-3.5 w-3.5" /> TYPE
          </button>
          <button onClick={() => setInputMode("voice")} className={`flex items-center gap-1.5 rounded-md px-3.5 py-1.5 font-mono text-xs font-semibold transition-all ${inputMode === "voice" ? "bg-cyan/20 text-cyan border border-cyan/30" : "text-muted-foreground hover:text-foreground"}`}>
            <Mic className="h-3.5 w-3.5" /> VOICE
          </button>
        </div>
      </div>

      {/* 🔥 Type Mode rendered natively first */}
      {inputMode === "type" && (
        <div className="relative flex-1 flex flex-col mt-2">
          <textarea value={answer} onChange={(e) => setAnswer(e.target.value)} placeholder="Type your answer here..." className="w-full h-full resize-none rounded-xl border border-white/[0.08] bg-white/[0.02] px-4 py-3 font-sans text-sm text-foreground placeholder:text-muted-foreground/30 focus:border-cyan/30 focus:outline-none focus:ring-1 focus:ring-cyan/20" />
          <button onClick={onSubmit} disabled={!answer.trim()} className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-lg bg-cyan/20 px-4 py-2 font-mono text-xs font-bold tracking-wider text-cyan transition-all hover:bg-cyan/40 disabled:opacity-30 disabled:cursor-not-allowed">
            <Send className="h-3.5 w-3.5" /> SUBMIT
          </button>
        </div>
      )}

      {/* Voice Mode */}
      {inputMode === "voice" && (
        <div className="flex flex-col items-center justify-center flex-1 gap-6">
          <motion.button onClick={onToggleRecording} className={`relative flex h-16 w-16 items-center justify-center rounded-full border-2 transition-all ${isRecording ? "border-red-500/60 bg-red-500/20 text-red-400" : "border-cyan/40 bg-cyan/10 text-cyan hover:border-cyan/60"}`}>
            {isRecording ? <MicOff className="h-7 w-7" /> : <Mic className="h-7 w-7" />}
          </motion.button>
          <p className="font-mono text-xs font-semibold tracking-wider text-foreground">{isRecording ? "RECORDING... TAP TO SUBMIT" : "TAP TO SPEAK"}</p>
        </div>
      )}

      {/* Footer Navigation */}
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.06] pt-4">
        <span className="rounded-full border border-cyan/30 bg-cyan/10 px-3 py-1 font-mono text-xs font-semibold text-cyan">{isLastQuestion ? "FINAL QUESTION" : "IN PROGRESS"}</span>
        <div className="flex items-center gap-2.5">
          {!isLastQuestion && <button onClick={onNextQuestion} className="btn-glow flex items-center gap-2 px-5 py-2.5 font-mono text-xs font-semibold">Skip Question <ChevronRight className="h-4 w-4" /></button>}
          <button onClick={onSubmitInterview} className="flex items-center gap-2 rounded-full bg-[#66B2D6] px-5 py-2.5 font-mono text-xs font-bold text-[#111318]">Submit Interview <CheckCircle2 className="h-4 w-4" /></button>
        </div>
      </div>
    </motion.div>
  );
}

// ── Observation Panel & Visuals (Truncated visual filler for snippet) ────────
function ObservationPanel({ metrics, difficulty }: any) {
  return (
    <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} className="holo-frame rounded-2xl p-5 h-full flex flex-col justify-between">
      <p className="font-mono text-xs font-semibold tracking-[0.2em] text-cyan/90">AI OBSERVATION</p>
      <div className="mt-5 space-y-4">
        <MetricBar label="Technical Depth" value={metrics.techDepth} color="bg-cyan" />
        <MetricBar label="Clarity" value={metrics.clarity} color="bg-emerald-400" />
        <MetricBar label="Reasoning" value={metrics.reasoning} color="bg-violet-400" />
      </div>
    </motion.div>
  );
}

function MetricBar({ label, value, color }: any) {
  return (
    <div>
      <div className="flex items-center justify-between"><span className="font-mono text-xs font-medium text-foreground/80">{label}</span><span className="font-mono text-xs font-semibold text-foreground">{Math.round(value)} XP</span></div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/[0.08]"><motion.div className={`h-full rounded-full ${color}`} initial={{ width: 0 }} animate={{ width: `${Math.min(100, value)}%` }} /></div>
    </div>
  );
}

function AIThinkingOverlay({ aiState }: any) {
  return (
    <motion.div className="fixed inset-0 z-40 flex items-center justify-center bg-background/80 backdrop-blur-md">
      <div className="flex flex-col items-center"><Brain className="h-10 w-10 text-cyan animate-pulse" /><p className="mt-4 font-mono text-sm text-cyan tracking-widest">ANALYZING...</p></div>
    </motion.div>
  );
}

function CompletionFlow({ completionStep, reportReady, metrics, onViewFeedback }: any) {
  return (
    <motion.div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
      <div className="text-center">
        {reportReady ? (
          <div><h1 className="text-3xl text-emerald-400 font-bold mb-6">Interview Complete</h1><button onClick={onViewFeedback} className="btn-glow px-8 py-3">View Detailed Feedback</button></div>
        ) : (
          <p className="font-mono text-cyan tracking-widest animate-pulse">GENERATING REPORT...</p>
        )}
      </div>
    </motion.div>
  );
}