from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routes import game
from .models.database import engine, Base, init_db
from .models.shop import Shop
from .models.battler_card import BattlerCard, Rarity
from datetime import datetime, UTC

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Frontend development server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# Initialize database
init_db()

# Initialize shop if it doesn't exist
from sqlalchemy.orm import Session
from .models.database import SessionLocal


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_data():
    db = SessionLocal()
    try:
        # Initialize shop
        shop = db.query(Shop).first()
        if not shop:
            shop = Shop(last_refresh=datetime.now(UTC))
            db.add(shop)

        # Initialize cards
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
        db.close()


# Initialize required data
init_data()

# Include routers
app.include_router(game.router, prefix="/api/game", tags=["game"])
