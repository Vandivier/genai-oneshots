from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime, timedelta, UTC
from .database import Base
from .battler_card import Rarity


class Shop(Base):
    __tablename__ = "shops"

    id = Column(Integer, primary_key=True, index=True)
    featured_card_id = Column(Integer, ForeignKey("battler_cards.id"))
    featured_card = relationship("BattlerCard", foreign_keys=[featured_card_id])
    featured_card_price = Column(Integer, default=100)
    random_card_price = Column(Integer, default=50)
    pack_price = Column(Integer, default=150)
    last_refresh = Column(DateTime(timezone=True), default=lambda: datetime.now(UTC))

    def should_refresh(self) -> bool:
        """Check if the shop should refresh based on time since last refresh"""
        # Ensure both datetimes are timezone-aware
        now = datetime.now(UTC)
        last_refresh = (
            self.last_refresh.replace(tzinfo=UTC)
            if self.last_refresh.tzinfo is None
            else self.last_refresh
        )
        return now - last_refresh > timedelta(days=1)

    def refresh(self):
        """Update the last refresh time"""
        self.last_refresh = datetime.now(UTC)


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
