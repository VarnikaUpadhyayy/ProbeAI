from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

BASE_DIR = Path(__file__).resolve().parent.parent


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=BASE_DIR / ".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    groq_api_key: str = ""
    database_url: str = f"sqlite:///{BASE_DIR / 'interview.db'}"
    groq_model: str = "llama-3.1-8b-instant"
    min_questions: int = 8
    min_days: int = 4


settings = Settings()