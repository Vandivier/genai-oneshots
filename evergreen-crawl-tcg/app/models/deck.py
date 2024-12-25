from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, JSON, DateTime
from sqlalchemy.orm import relationship
import json
from datetime import datetime, UTC

from .database import Base


class Deck(Base):
    __tablename__ = "decks"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    player_id = Column(Integer, ForeignKey("players.id"))
    is_starter = Column(Boolean, default=False)
    cards = Column(JSON, default=list)  # Stores a list of card IDs and quantities
    created_at = Column(DateTime, default=lambda: datetime.now(UTC))

    # Relationships
    player = relationship("Player", back_populates="decks")

    @property
    def card_count(self) -> int:
        """Get the total number of cards in the deck"""
        if not self.cards:
            return 0
        try:
            cards = (
                json.loads(self.cards) if isinstance(self.cards, str) else self.cards
            )
            return len(cards)
        except (json.JSONDecodeError, TypeError):
            return 0

    @property
    def cards_list(self) -> list:
        """Get the cards as a list for API responses"""
        if not self.cards:
            return []
        try:
            return json.loads(self.cards) if isinstance(self.cards, str) else self.cards
        except (json.JSONDecodeError, TypeError):
            return []
