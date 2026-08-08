// ─────────────────────────────────────────────────────────────
// ProbeAI — Interview Question Bank
// Questions mapped to the 31-day AI Cohort curriculum.
// ─────────────────────────────────────────────────────────────

export type QuestionDifficulty = "EASY" | "MEDIUM" | "HARD";
export type QuestionCategory = "TECHNICAL" | "CONCEPTUAL" | "APPLIED";

export interface InterviewQuestion {
  id: string;
  text: string;
  topic: string;
  category: QuestionCategory;
  difficulty: QuestionDifficulty;
  dayRef: number; // which curriculum day this maps to
  followUp?: string; // harder follow-up if answer is strong
  hint?: string; // simpler prompt if answer is weak
}

export const QUESTION_BANK: InterviewQuestion[] = [
  // ── Python & Foundations (Days 1-4) ─────────────────────────
  {
    id: "Q-001",
    text: "Explain the difference between a list and a tuple in Python. When would you choose one over the other in an ML pipeline?",
    topic: "Python",
    category: "TECHNICAL",
    difficulty: "EASY",
    dayRef: 1,
    followUp: "How does immutability of tuples affect hashability and dictionary keys in data preprocessing?",
    hint: "Think about mutability — can you change items after creation?",
  },
  {
    id: "Q-002",
    text: "What is the time complexity of lookup in a Python dictionary vs a list? Why does this matter for feature stores?",
    topic: "Data Structures",
    category: "TECHNICAL",
    difficulty: "EASY",
    dayRef: 2,
    followUp: "Describe how hash collisions are handled in Python's dict implementation.",
    hint: "Consider how dictionaries use hashing internally.",
  },
  {
    id: "Q-003",
    text: "Why is NumPy vectorization faster than Python for-loops for numerical computation? Explain with an example.",
    topic: "NumPy",
    category: "TECHNICAL",
    difficulty: "MEDIUM",
    dayRef: 3,
    followUp: "How does NumPy's memory layout (C-contiguous vs Fortran-contiguous) impact performance?",
    hint: "Think about what happens at the CPU/memory level when you iterate vs vectorize.",
  },
  {
    id: "Q-004",
    text: "How would you handle missing values in a Pandas DataFrame before feeding it to a model? Compare at least three strategies.",
    topic: "Pandas",
    category: "APPLIED",
    difficulty: "MEDIUM",
    dayRef: 4,
    followUp: "When would imputation introduce data leakage, and how do you prevent it?",
    hint: "Consider: dropping rows, filling with mean/median, or using model-based imputation.",
  },

  // ── ML Fundamentals (Days 8-14) ─────────────────────────────
  {
    id: "Q-005",
    text: "Explain the bias-variance tradeoff. How does it manifest when you increase model complexity?",
    topic: "Machine Learning",
    category: "CONCEPTUAL",
    difficulty: "MEDIUM",
    dayRef: 8,
    followUp: "Derive why the expected test error decomposes into bias², variance, and irreducible noise.",
    hint: "Bias = underfitting, Variance = overfitting. What happens as you add more parameters?",
  },
  {
    id: "Q-006",
    text: "You have a highly imbalanced dataset (98% negative, 2% positive). What metrics would you use instead of accuracy, and why?",
    topic: "Model Evaluation",
    category: "APPLIED",
    difficulty: "MEDIUM",
    dayRef: 11,
    followUp: "Explain the relationship between the ROC AUC and Precision-Recall AUC. When is PR-AUC preferred?",
    hint: "Think about precision, recall, F1-score, and why accuracy is misleading here.",
  },
  {
    id: "Q-007",
    text: "What is feature engineering? Give three concrete examples of engineered features for a time-series forecasting problem.",
    topic: "Feature Engineering",
    category: "APPLIED",
    difficulty: "EASY",
    dayRef: 12,
    followUp: "How would you use target encoding for high-cardinality categorical features without leakage?",
    hint: "Think about creating lag features, rolling averages, or day-of-week indicators.",
  },
  {
    id: "Q-008",
    text: "Compare K-Means and DBSCAN. In what scenarios would DBSCAN outperform K-Means?",
    topic: "Clustering",
    category: "TECHNICAL",
    difficulty: "MEDIUM",
    dayRef: 13,
    followUp: "Explain the concept of core points, border points, and noise in DBSCAN. How do eps and minPts affect results?",
    hint: "Think about cluster shapes — does K-Means handle non-spherical clusters well?",
  },

  // ── NLP & Deep Learning (Days 15-20) ────────────────────────
  {
    id: "Q-009",
    text: "Explain the attention mechanism in Transformers. Why is it called 'self-attention' and what problem does it solve?",
    topic: "Attention & Transformers",
    category: "CONCEPTUAL",
    difficulty: "HARD",
    dayRef: 19,
    followUp: "Walk through the computation of scaled dot-product attention: Q, K, V matrices, scaling factor, and softmax.",
    hint: "Attention helps the model focus on relevant parts of the input. How does it weight different tokens?",
  },
  {
    id: "Q-010",
    text: "What are word embeddings? Compare Word2Vec (Skip-gram) and contextual embeddings like BERT. Why was BERT a breakthrough?",
    topic: "Embeddings",
    category: "CONCEPTUAL",
    difficulty: "MEDIUM",
    dayRef: 17,
    followUp: "Explain how BERT's masked language modeling objective differs from GPT's autoregressive objective.",
    hint: "Word2Vec gives one vector per word. BERT gives different vectors based on context.",
  },
  {
    id: "Q-011",
    text: "Describe the Transformer architecture end-to-end: encoder, decoder, multi-head attention, positional encoding, and feed-forward layers.",
    topic: "Transformer Architecture",
    category: "TECHNICAL",
    difficulty: "HARD",
    dayRef: 20,
    followUp: "Why do modern LLMs like GPT use decoder-only architecture? What are the tradeoffs vs encoder-decoder?",
    hint: "Start with how input tokens are embedded, then trace through attention layers.",
  },

  // ── LLMs & Agents (Days 21-28) ──────────────────────────────
  {
    id: "Q-012",
    text: "What is fine-tuning a pre-trained model? Compare full fine-tuning, LoRA, and prompt tuning. When would you use each?",
    topic: "Fine-Tuning",
    category: "APPLIED",
    difficulty: "HARD",
    dayRef: 21,
    followUp: "Explain how LoRA achieves parameter-efficient fine-tuning through low-rank decomposition.",
    hint: "Fine-tuning = adapting a pre-trained model to your specific task. LoRA does this efficiently.",
  },
  {
    id: "Q-013",
    text: "What is prompt engineering? Describe at least three prompting techniques and when each is most effective.",
    topic: "Prompt Engineering",
    category: "APPLIED",
    difficulty: "EASY",
    dayRef: 22,
    followUp: "Explain chain-of-thought prompting with self-consistency. How does it improve reasoning accuracy?",
    hint: "Think about zero-shot, few-shot, chain-of-thought prompting.",
  },
  {
    id: "Q-014",
    text: "Explain Retrieval-Augmented Generation (RAG). Why is it preferred over fine-tuning for knowledge-intensive tasks?",
    topic: "RAG",
    category: "CONCEPTUAL",
    difficulty: "MEDIUM",
    dayRef: 23,
    followUp: "How would you evaluate RAG quality? Discuss retrieval precision, answer faithfulness, and hallucination detection.",
    hint: "RAG retrieves relevant documents first, then generates answers grounded in that context.",
  },
  {
    id: "Q-015",
    text: "What are vector databases? How do they enable semantic search, and what indexing algorithms make them fast?",
    topic: "Vector Databases",
    category: "TECHNICAL",
    difficulty: "MEDIUM",
    dayRef: 24,
    followUp: "Compare HNSW, IVF-Flat, and Product Quantization indexing strategies. What are the recall-speed tradeoffs?",
    hint: "Vector DBs store embeddings and find similar ones using approximate nearest neighbor search.",
  },
  {
    id: "Q-016",
    text: "What is an AI agent? Describe the ReAct pattern and how it combines reasoning with action.",
    topic: "AI Agents",
    category: "CONCEPTUAL",
    difficulty: "MEDIUM",
    dayRef: 26,
    followUp: "Design a multi-agent system where agents specialize and delegate tasks. How do you handle coordination?",
    hint: "Agents can reason, use tools, and take actions in a loop: Think → Act → Observe → Repeat.",
  },
  {
    id: "Q-017",
    text: "How would you build an end-to-end multi-agent orchestration system? What are the key challenges?",
    topic: "Multi-Agent Systems",
    category: "APPLIED",
    difficulty: "HARD",
    dayRef: 27,
    followUp: "How do you handle agent failure, retry logic, and state management in production?",
    hint: "Think about task decomposition, agent communication, and result aggregation.",
  },

  // ── MLOps & Deployment (Days 29-31) ─────────────────────────
  {
    id: "Q-018",
    text: "What is MLOps? Describe the key stages of an ML pipeline from data ingestion to model monitoring.",
    topic: "MLOps",
    category: "CONCEPTUAL",
    difficulty: "EASY",
    dayRef: 29,
    followUp: "How do you detect and handle model drift in production? Describe data drift vs concept drift.",
    hint: "MLOps = DevOps for ML. Think about training, versioning, deploying, and monitoring.",
  },
  {
    id: "Q-019",
    text: "You need to deploy an LLM-based chatbot to production. Walk through your architecture decisions: serving, scaling, latency, and cost.",
    topic: "Deployment",
    category: "APPLIED",
    difficulty: "HARD",
    dayRef: 29,
    followUp: "How would you implement A/B testing for two different LLM versions in production?",
    hint: "Consider: API gateway, model serving (vLLM, TGI), caching, rate limiting, auto-scaling.",
  },
  {
    id: "Q-020",
    text: "What are guardrails for LLMs? How would you implement safety checks to prevent harmful or off-topic outputs?",
    topic: "Evaluation & Guardrails",
    category: "APPLIED",
    difficulty: "MEDIUM",
    dayRef: 28,
    followUp: "Design a multi-layer guardrail system: input validation, output filtering, and semantic boundary checking.",
    hint: "Guardrails = constraints on input/output to keep the model safe and on-topic.",
  },
];

/**
 * Select 10 questions for a candidate based on their mission data.
 * Prioritizes topics from passed missions (testing depth) and
 * includes a few from skipped/failed missions (testing breadth).
 */
export function selectQuestionsForCandidate(
  missions: { day: number; passed: boolean; skipped: boolean }[],
): InterviewQuestion[] {
  const passedDays = new Set(missions.filter((m) => m.passed).map((m) => m.day));
  const weakDays = new Set(
    missions.filter((m) => !m.passed || m.skipped).map((m) => m.day),
  );

  // Score each question by relevance to the candidate
  const scored = QUESTION_BANK.map((q) => {
    let score = 0;
    if (passedDays.has(q.dayRef)) score += 3; // test depth on passed topics
    if (weakDays.has(q.dayRef)) score += 2; // probe weak areas
    // Add variety bonus based on difficulty
    if (q.difficulty === "MEDIUM") score += 1;
    if (q.difficulty === "HARD") score += 0.5;
    // Small random factor for variety
    score += Math.random() * 0.5;
    return { q, score };
  });

  scored.sort((a, b) => b.score - a.score);

  // Pick top 10, ensuring difficulty spread
  const selected: InterviewQuestion[] = [];
  const diffCount = { EASY: 0, MEDIUM: 0, HARD: 0 };
  const maxPerDiff = { EASY: 3, MEDIUM: 4, HARD: 3 };

  for (const { q } of scored) {
    if (selected.length >= 10) break;
    if (diffCount[q.difficulty] < maxPerDiff[q.difficulty]) {
      selected.push(q);
      diffCount[q.difficulty]++;
    }
  }

  // Fill remaining if needed
  for (const { q } of scored) {
    if (selected.length >= 10) break;
    if (!selected.includes(q)) {
      selected.push(q);
    }
  }

  // Sort by difficulty: EASY → MEDIUM → HARD (ramp up)
  const diffOrder = { EASY: 0, MEDIUM: 1, HARD: 2 };
  selected.sort((a, b) => diffOrder[a.difficulty] - diffOrder[b.difficulty]);

  return selected.slice(0, 10);
}
