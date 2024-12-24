from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from .models import Base
from .models.database import engine
from .routes import game

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Evergreen Crawl TCG",
    description="A dungeon crawler trading card game",
    version="1.0.0",
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(game.router, prefix="/api/game", tags=["game"])


@app.get("/")
async def root():
    return {
        "message": "Welcome to Evergreen Crawl TCG API",
        "docs_url": "/docs",
        "redoc_url": "/redoc",
    }
