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
    "Sarah Johnson",
    "Senior Data Engineer",
    9,
    "MS Computer Science",
    0.90,
    0.3,
    42,
  ),
  createCandidate(
    "CAND-002",
    "Alex Turner",
    "Backend Software Engineer",
    5,
    "B.Tech Computer Science",
    0.82,
    0.4,
    137,
  ),
  createCandidate(
    "CAND-003",
    "Emily Chen",
    "AI Engineer",
    6,
    "MS Artificial Intelligence",
    0.65,
    0.5,
    256,
  ),
  createCandidate(
    "CAND-004",
    "David Miller",
    "Business Analyst",
    8,
    "MBA",
    0.94,
    0.2,
    389,
  ),
  createCandidate(
    "CAND-005",
    "Michael Brown",
    "DevOps Engineer",
    10,
    "B.Tech Information Technology",
    0.78,
    0.35,
    512,
  ),
  createCandidate(
    "CAND-006",
    "Wendy Foster",
    "Marketing Manager",
    12,
    "BA Marketing",
    0.72,
    0.45,
    623,
  ),
  createCandidate(
    "CAND-007",
    "Ethan Brooks",
    "Computer Science Intern",
    0,
    "BS Computer Science",
    0.85,
    0.25,
    741,
  ),
  createCandidate(
    "CAND-008",
    "Harold Whitfield",
    "Distinguished Engineer",
    28,
    "BS Computer Science",
    0.88,
    0.3,
    854,
  ),
  createCandidate(
    "CAND-009",
    "Robert Jenkins",
    "AI Engineer",
    3,
    "BS Computer Science",
    0.89,
    0.2,
    912,
  ),
  createCandidate(
    "CAND-010",
    "Maria Garcia",
    "Data Analyst",
    2,
    "BS Statistics",
    0.75,
    0.3,
    1024,
  ),
  createCandidate(
    "CAND-011",
    "Steven Ross",
    "Deep Learning Specialist",
    4,
    "MS Computer Science",
    0.50,
    0.15,
    1150,
  ),
  createCandidate(
    "CAND-012",
    "Patricia Scott",
    "AI Ethics Researcher",
    5,
    "PhD Computer Science",
    0.86,
    0.25,
    1280,
  ),
  createCandidate(
    "CAND-013",
    "Anthony Adams",
    "Backend & AI Engineer",
    3,
    "BS Computer Science",
    0.79,
    0.35,
    1410,
  ),
  createCandidate(
    "CAND-014",
    "Natalie King",
    "Computer Vision Eng",
    2,
    "MS Computer Science",
    0.83,
    0.3,
    1540,
  ),
  createCandidate(
    "CAND-015",
    "Thomas Vance",
    "Prompt Engineer",
    2,
    "BS Software Engineering",
    0.77,
    0.4,
    1670,
  ),
  createCandidate(
    "CAND-016",
    "Rachel Stone",
    "Generative AI Dev",
    3,
    "MS Data Science",
    0.88,
    0.2,
    1800,
  ),
  createCandidate(
    "CAND-017",
    "Mark Phillips",
    "Robotics & AI Dev",
    4,
    "BS Mechanical Eng",
    0.80,
    0.3,
    1930,
  ),
  createCandidate(
    "CAND-018",
    "Irene Baker",
    "Data Engineer",
    3,
    "BS Information Systems",
    0.74,
    0.4,
    2060,
  ),
  createCandidate(
    "CAND-019",
    "Victor Campbell",
    "ML Platform Engineer",
    5,
    "MS Computer Science",
    0.45,
    0.15,
    2190,
  ),
  createCandidate(
    "CAND-020",
    "Samantha Knight",
    "AI Solutions Architect",
    6,
    "BS Computer Science",
    0.87,
    0.2,
    2320,
  ),
];
