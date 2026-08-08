// ─────────────────────────────────────────────────────────────
// ProbeAI — Candidate Data Layer
// Each candidate maps an ABTalks AI Cohort member with their
// 31-day mission history and learning signals.
// ─────────────────────────────────────────────────────────────

export interface CandidateMember {
  id: string;
  name: string;
  jobRole: string;
  yearsExperience: number;
  education: string;
}

export interface CandidateMission {
  day: number;
  title: string;
  passed: boolean;
  skipped: boolean;
  attempts: number;
}

export interface CandidateSignals {
  commitDays: number;
  missionsCompleted: number;
  missionsFirstTry: number;
}

export interface Candidate {
  member: CandidateMember;
  missions: CandidateMission[];
  signals: CandidateSignals;
}

// ── Shared mission titles across all candidates ──────────────
const MISSION_TITLES: string[] = [
  "Python Foundations & Environment",
  "Data Structures for ML",
  "NumPy & Vectorization",
  "Pandas Data Wrangling",
  "Data Visualization & EDA",
  "Statistics & Probability",
  "Linear Algebra Essentials",
  "Intro to Machine Learning",
  "Supervised Learning — Regression",
  "Supervised Learning — Classification",
  "Model Evaluation & Metrics",
  "Feature Engineering",
  "Unsupervised Learning — Clustering",
  "Dimensionality Reduction",
  "Natural Language Processing Basics",
  "Text Preprocessing & Tokenization",
  "Word Embeddings (Word2Vec/GloVe)",
  "Sequence Models — RNNs & LSTMs",
  "Attention Mechanisms",
  "Transformer Architecture Deep-Dive",
  "Fine-Tuning Pre-Trained Models",
  "Prompt Engineering & LLM APIs",
  "Retrieval-Augmented Generation (RAG)",
  "Vector Databases & Embeddings Search",
  "LangChain Fundamentals",
  "Building AI Agents",
  "Multi-Agent Orchestration",
  "Evaluation & Guardrails",
  "Deployment & MLOps Basics",
  "Capstone — End-to-End AI Pipeline",
  "Final Review & Portfolio Prep",
];

// Helper: generate a realistic mission log for a candidate
function generateMissions(
  completionRate: number,
  skipRate: number,
  seed: number,
): CandidateMission[] {
  const missions: CandidateMission[] = [];
  // Simple seeded pseudo-random
  let s = seed;
  const rand = () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s & 0x7fffffff) / 0x7fffffff;
  };

  for (let day = 1; day <= 31; day++) {
    const r = rand();
    const passed = r < completionRate;
    const skipped = !passed && rand() < skipRate;
    const attempts = passed ? (rand() < 0.55 ? 1 : Math.ceil(rand() * 3) + 1) : skipped ? 0 : Math.ceil(rand() * 2);
    missions.push({
      day,
      title: MISSION_TITLES[day - 1]!,
      passed,
      skipped,
      attempts,
    });
  }
  return missions;
}

function deriveSignals(missions: CandidateMission[]): CandidateSignals {
  const completed = missions.filter((m) => m.passed).length;
  const firstTry = missions.filter((m) => m.passed && m.attempts === 1).length;
  // commitDays = days with at least one attempt (not skipped)
  const commitDays = missions.filter((m) => m.attempts > 0).length;
  return { commitDays, missionsCompleted: completed, missionsFirstTry: firstTry };
}

function createCandidate(
  id: string,
  name: string,
  jobRole: string,
  yearsExperience: number,
  education: string,
  completionRate: number,
  skipRate: number,
  seed: number,
): Candidate {
  const missions = generateMissions(completionRate, skipRate, seed);
  return {
    member: { id, name, jobRole, yearsExperience, education },
    missions,
    signals: deriveSignals(missions),
  };
}

// ── Candidate roster ─────────────────────────────────────────
export const candidates: Candidate[] = [
  createCandidate(
    "CAND-001",
    "Arjun Mehta",
    "ML Engineer",
    4,
    "M.Tech — IIT Delhi",
    0.90,
    0.3,
    42,
  ),
  createCandidate(
    "CAND-002",
    "Priya Sharma",
    "Data Scientist",
    3,
    "M.Sc Data Science — ISI Kolkata",
    0.82,
    0.4,
    137,
  ),
  createCandidate(
    "CAND-003",
    "Rahul Verma",
    "AI Research Intern",
    1,
    "B.Tech — NIT Trichy",
    0.65,
    0.5,
    256,
  ),
  createCandidate(
    "CAND-004",
    "Sneha Reddy",
    "Full-Stack + AI Dev",
    5,
    "B.E. — BITS Pilani",
    0.94,
    0.2,
    389,
  ),
  createCandidate(
    "CAND-005",
    "Vikram Singh",
    "NLP Engineer",
    3,
    "M.Tech NLP — IIIT Hyderabad",
    0.78,
    0.35,
    512,
  ),
  createCandidate(
    "CAND-006",
    "Ananya Gupta",
    "MLOps Engineer",
    2,
    "B.Tech — DTU Delhi",
    0.72,
    0.45,
    623,
  ),
  createCandidate(
    "CAND-007",
    "Karthik Nair",
    "AI Product Manager",
    6,
    "MBA + B.Tech — IIM-A / IIT-B",
    0.85,
    0.25,
    741,
  ),
  createCandidate(
    "CAND-008",
    "Diya Patel",
    "Computer Vision Eng",
    2,
    "M.Sc — IISC Bangalore",
    0.88,
    0.3,
    854,
  ),
];
