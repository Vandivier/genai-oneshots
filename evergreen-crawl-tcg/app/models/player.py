from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Table, JSON
from sqlalchemy.orm import relationship
from datetime import datetime, UTC
import json

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
    card_collection = Column(JSON, default=list)
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

    @property
    def cards_list(self):
        """Get the card collection as a Python list"""
        if isinstance(self.card_collection, str):
            return json.loads(self.card_collection)
        return self.card_collection or []

    @cards_list.setter
    def cards_list(self, value):
        """Set the card collection, ensuring it's stored as a list"""
        if isinstance(value, str):
            parsed = json.loads(value)
            if not isinstance(parsed, list):
                raise ValueError("Card collection must be a list")
            self.card_collection = parsed
        else:
            self.card_collection = value
