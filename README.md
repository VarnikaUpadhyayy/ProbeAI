# AI Interview Agent — Backend

FastAPI backend that conducts personalized, multi-turn technical interviews based on a candidate's cohort progress, powered by Claude (`claude-sonnet-4-6`).

## Features

- **Candidate-aware interviews** — prioritizes skipped missions and high-attempt days (weak areas), probes depth on first-try passes (strengths)
- **Dynamic follow-ups** — each follow-up is generated from the candidate's actual answer, not a script
- **Persistent state** — SQLite via SQLAlchemy; sessions survive server restarts
- **Structured feedback** — validated JSON with summary, strengths, gaps, and next steps
- **Debug endpoints** — list sessions and fetch full transcripts

## Project Structure

```
app/
├── main.py                  # FastAPI app + startup
├── config.py                # Settings (.env)
├── database.py              # SQLAlchemy engine + session
├── models/
│   ├── pydantic_models.py   # API request/response schemas
│   └── sqlalchemy_models.py # DB tables
├── routers/
│   └── interview.py         # POST + GET endpoints
└── services/
    ├── data_loader.py       # curriculum.json + candidates.json
    ├── candidate_analyzer.py
    ├── llm.py               # Anthropic Claude wrapper
    ├── feedback.py          # Structured feedback generation
    └── interview.py         # Orchestration logic
curriculum.json
candidates.json
requirements.txt
.env
```

## Setup

### 1. Create a virtual environment

```bash
python -m venv .venv

# Windows
.venv\Scripts\activate

# macOS / Linux
source .venv/bin/activate
```

### 2. Install dependencies

```bash
pip install -r requirements.txt
```

### 3. Configure environment

```bash
cp .env.example .env
```

Edit `.env` and set your Anthropic API key:

```
ANTHROPIC_API_KEY=sk-ant-...
DATABASE_URL=sqlite:///./interview.db
```

### 4. Run the server

```bash
uvicorn app.main:app --reload --port 8000
```

Health check: `GET http://localhost:8000/health`

API docs: `http://localhost:8000/docs`

## API Contract

### Start interview

`POST /api/interview`

```bash
curl -X POST http://localhost:8000/api/interview \
  -H "Content-Type: application/json" \
  -d @- <<'EOF'
{
  "sessionId": "demo-session-001",
  "candidate": {
    "member": {
      "id": "CAND-001",
      "name": "Sarah Johnson",
      "jobRole": "Senior Data Engineer",
      "yearsExperience": 9,
      "education": "MS Computer Science",
      "status": "COMPLETED"
    },
    "missions": [
      { "day": 7, "title": "Embeddings Explained", "passed": true, "attempts": 1 },
      { "day": 12, "title": "Prompt Engineering Fundamentals", "passed": true, "attempts": 4 },
      { "day": 29, "title": "Monitoring, Logging & Observability", "skipped": true }
    ],
    "signals": { "commitDays": 28, "missionsCompleted": 30, "missionsFirstTry": 20 }
  }
}
EOF
```

Response:

```json
{
  "reply": "Hello Sarah, welcome to your technical interview...",
  "done": false
}
```

### Continue interview (turn)

```bash
curl -X POST http://localhost:8000/api/interview \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "demo-session-001",
    "message": "Embeddings are dense vector representations of text that capture semantic meaning..."
  }'
```

Response:

```json
{
  "reply": "Good explanation. Can you describe how you would choose between cosine similarity and dot product when comparing embeddings?",
  "done": false
}
```

Repeat turn requests until `"done": true`.

### End state (after 8+ questions across 4+ curriculum days)

```json
{
  "reply": "Interview completed.",
  "done": true,
  "feedback": {
    "summary": "Sarah demonstrated strong understanding of embeddings and RAG...",
    "strengths": [
      "Clear grasp of vector similarity metrics",
      "Solid prompt engineering intuition"
    ],
    "gaps": [
      "Monitoring and observability concepts need reinforcement",
      "Prompt iteration strategy could be more systematic"
    ],
    "next": [
      "Complete Day 29 mission on monitoring and logging",
      "Practice designing evaluation harnesses for RAG pipelines"
    ]
  }
}
```

## Debug Endpoints

### List all sessions

```bash
curl http://localhost:8000/api/interview
```

### Get session detail (transcript + feedback)

```bash
curl http://localhost:8000/api/interview/demo-session-001
```

## Interview Logic

| Signal | Source | Interview behavior |
|--------|--------|--------------------|
| Skipped mission | `missions[].skipped` | Probe whether the candidate understands the topic |
| High attempts (≥3) | `missions[].attempts` | Test foundational understanding |
| First-try pass | `attempts == 1` | Ask deeper, scenario-based questions |

**Completion criteria:** minimum 8 questions asked across at least 4 distinct curriculum days. After the candidate answers the final question, the next turn triggers structured feedback generation.

## Database

SQLite file (`interview.db` by default) with three tables:

- `interview_sessions` — session metadata, progress counters
- `conversation_messages` — full turn-by-turn transcript
- `interview_feedback` — final JSON feedback per completed session

Delete `interview.db` to reset all state.

## Notes

- No authentication — sessions are keyed by client-provided `sessionId`
- Reusing an active `sessionId` resumes from DB history
- Each LLM call uses `claude-sonnet-4-6` via the Anthropic SDK
- `curriculum.json` and `candidates.json` are loaded into memory at startup
