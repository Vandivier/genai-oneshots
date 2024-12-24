from sqlalchemy import Column, Integer, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime, timedelta

from .database import Base
from .battler_card import Rarity


class Shop(Base):
    __tablename__ = "shops"

    id = Column(Integer, primary_key=True, index=True)
    featured_card_id = Column(Integer, ForeignKey("battler_cards.id"))
    last_refresh = Column(DateTime, default=datetime.utcnow)

    # Relationships
    featured_card = relationship("BattlerCard")

    # Price constants
    FEATURED_CARD_PRICE = 100.0
    RANDOM_CARD_PRICE = 50.0
    PACK_PRICE = 150.0

    def should_refresh(self):
        """Check if shop should refresh (every 24 hours)"""
        return datetime.utcnow() - self.last_refresh > timedelta(days=1)


class CardPack(Base):
    __tablename__ = "card_packs"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)

    # Pack contents configuration
    CARDS_PER_PACK = 5
    RARITY_WEIGHTS = {
        Rarity.COMMON: 0.6,
        Rarity.UNCOMMON: 0.3,
        Rarity.RARE: 0.08,
        Rarity.LEGENDARY: 0.02,
    }
