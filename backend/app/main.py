from contextlib import asynccontextmanager
import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import init_db
from app.routers import interview
from app.services.data_loader import load_data

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    load_data()
    init_db()
    if not settings.groq_api_key:
        logger.warning(
            "GROQ_API_KEY is not set — interview endpoints will fail until configured"
        )
    yield


app = FastAPI(
    title="AI Interview Agent",
    description="Personalized multi-turn technical interview backend",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://probe-ai-indol.vercel.app",
        "http://localhost:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(interview.router)


@app.get("/health")
def health_check() -> dict[str, str]:
    return {"status": "ok"}