import os
from pydantic import BaseModel

class Settings(BaseModel):
    PROJECT_NAME: str = "AI Customer Support & Contact Center"
    VERSION: str = "1.0.0"
    API_V1_PREFIX: str = "/api"
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./contact_center.db")
    
    # AI Engine settings (defaults to built-in intelligent NLP classifier - no paid key needed)
    AI_MODE: str = os.getenv("AI_MODE", "builtin")  # "builtin" or "llm_simulator"
    
    # SLA thresholds in minutes by priority
    SLA_MINUTES_CRITICAL: int = 60
    SLA_MINUTES_HIGH: int = 180
    SLA_MINUTES_MEDIUM: int = 480
    SLA_MINUTES_LOW: int = 1440

settings = Settings()

