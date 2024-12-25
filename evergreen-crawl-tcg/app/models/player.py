from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Table
from sqlalchemy.orm import relationship
from datetime import datetime, UTC

from .database import Base

# Junction table for player's card collection
player_cards = Table(
    "player_cards",
    Base.metadata,
    Column("player_id", Integer, ForeignKey("players.id"), primary_key=True),
    Column("card_id", Integer, ForeignKey("battler_cards.id"), primary_key=True),
    Column("quantity", Integer, default=1),
)


class Player(Base):
    __tablename__ = "players"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    gold = Column(Float, default=100.0)
    last_gold_update = Column(DateTime, default=lambda: datetime.now(UTC))
    created_at = Column(DateTime, default=lambda: datetime.now(UTC))

    # Relationships
    cards = relationship("BattlerCard", secondary=player_cards)
    decks = relationship("Deck", back_populates="player")
    active_dungeon = relationship(
        "DungeonInstance", back_populates="player", uselist=False
    )

    def update_gold(self):
        """Update gold based on time passed (1 gold per 6 seconds)"""
        now = datetime.now(UTC)
        seconds_passed = (now - self.last_gold_update).total_seconds()
        gold_earned = seconds_passed / 6.0
        self.gold += gold_earned
        self.last_gold_update = now
