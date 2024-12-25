from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from app.models.database import init_db, engine, SessionLocal
from app.models import Base
from app.routes import game
from app.models.shop import Shop
from app.models.battler_card import BattlerCard, Rarity
from datetime import datetime, UTC

app = FastAPI()

# Configure CORS with more specific settings
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Vite dev server
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=600,  # Cache preflight requests for 10 minutes
)

# Initialize database and create all tables
Base.metadata.create_all(bind=engine)


# Initialize required data
def init_required_data(db=None):
    """Initialize required data."""
    if db is None:
        db = SessionLocal()
    try:
        # Create initial shop if it doesn't exist
        if not db.query(Shop).first():
            shop = Shop(last_refresh=datetime.now(UTC))
            db.add(shop)

        # Create initial cards if they don't exist
        if not db.query(BattlerCard).first():
            starter_cards = [
                {"name": "Basic Warrior", "power_level": 3, "rarity": Rarity.COMMON},
                {"name": "Basic Mage", "power_level": 2, "rarity": Rarity.COMMON},
                {"name": "Basic Healer", "power_level": 2, "rarity": Rarity.COMMON},
                {"name": "Elite Guard", "power_level": 4, "rarity": Rarity.UNCOMMON},
                {"name": "Fire Mage", "power_level": 4, "rarity": Rarity.UNCOMMON},
                {"name": "High Priest", "power_level": 4, "rarity": Rarity.UNCOMMON},
                {"name": "Dragon Knight", "power_level": 6, "rarity": Rarity.RARE},
                {"name": "Archmage", "power_level": 6, "rarity": Rarity.RARE},
                {"name": "Divine Healer", "power_level": 6, "rarity": Rarity.RARE},
                {
                    "name": "Ancient Dragon",
                    "power_level": 8,
                    "rarity": Rarity.LEGENDARY,
                },
                {
                    "name": "Supreme Wizard",
                    "power_level": 8,
                    "rarity": Rarity.LEGENDARY,
                },
                {
                    "name": "Angel of Light",
                    "power_level": 8,
                    "rarity": Rarity.LEGENDARY,
                },
            ]
            for card_data in starter_cards:
                card = BattlerCard(**card_data)
                db.add(card)

        db.commit()
    except Exception as e:
        print(f"Error initializing data: {e}")
        db.rollback()
    finally:
        if db != SessionLocal():
            db.close()


# Initialize required data
init_required_data()

# Include routers
app.include_router(game.router, prefix="/api/game", tags=["game"])
