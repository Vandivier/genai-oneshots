from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .models import database
from .models.battler_card import Base

# Create database tables
Base.metadata.create_all(bind=database.engine)

app = FastAPI(title="Evergreen Crawl TCG")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    return {"message": "Welcome to Evergreen Crawl TCG API"}
