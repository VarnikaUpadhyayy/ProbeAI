# ProbeAI

# The Interview Agent

Build the interviewer, not the interview.

## The Situation

The ABTalks AI Cohort is a 31-day enterprise AI engineering program covering modern AI topics including:

- Retrieval-Augmented Generation (RAG)
- Vector Databases
- Prompt Engineering
- Agentic AI
- Model Context Protocol (MCP)
- AI Deployment
- Production AI Systems

After completing the cohort, learners should be able to confidently explain the systems they built and the engineering decisions behind them.

However, preparing for technical interviews and effectively communicating this knowledge remains one of the biggest challenges.

Our task was to build an AI Interview Agent that conducts personalized technical interviews based on a candidate's learning journey throughout the cohort.

## Our Solution

We designed and built an AI agent capable of conducting a realistic, multi-turn technical interview.

The interview:

- Assesses the candidate's understanding of the concepts they have completed.
- Adapts naturally throughout the conversation.
- Asks intelligent follow-up questions.
- Maintains context across the interview.
- Provides actionable feedback at the end.

The overall experience resembles a real technical interview rather than a scripted questionnaire.

## What We Were Given

Each team received the following resources:

**Curriculum**
A structured JSON containing the complete 31-day AI Cohort curriculum, including:
- Modules
- Daily topics
- Learning objectives
- Tools used throughout the program

**Candidate Profiles**
A collection of candidate profiles describing each participant's progress through the cohort, including:
- Completed missions
- Attempts
- Skipped topics
- Learning signals

**Technical Specification**
A separate document defining:
- Required API contract
- Submission requirements
- Request/response formats

## Minimum Requirements

Our solution:

- Conducts a conversational technical interview.
- Asks a minimum of 8 questions covering at least 4 different curriculum days.
- Generates follow-up questions based on previous responses.
- Maintains conversation context throughout the interview.
- Produces structured feedback at the end of the interview.
- Exposes the required HTTP endpoint defined in the Technical Specification.

## Out of Scope

The following were not required:

- Voice interaction
- User authentication
- Persistent user accounts
- Long-term conversation history
- Mobile applications

## Notes

All curriculum and candidate data provided for this challenge are synthetic and intended solely for the hackathon.

## Built By Us

This project was designed and built by our team from scratch.

## Development

To run this project locally, you need Node.js and npm installed.

```bash
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
