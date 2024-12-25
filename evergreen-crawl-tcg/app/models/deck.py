from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, JSON
from sqlalchemy.orm import relationship
import json

from .database import Base


class Deck(Base):
    __tablename__ = "decks"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    player_id = Column(Integer, ForeignKey("players.id"))
    cards = Column(JSON, default=list)
    is_starter = Column(Boolean, default=False)

    # Relationships
    player = relationship("Player", back_populates="decks")

    @property
    def card_count(self) -> int:
        """Get the number of cards in the deck"""
        if isinstance(self.cards, str):
            return len(json.loads(self.cards))
        return len(self.cards or [])

    @property
    def cards_list(self):
        """Get the cards as a Python list"""
        if isinstance(self.cards, str):
            return json.loads(self.cards)
        return self.cards or []

    @cards_list.setter
    def cards_list(self, value):
        """Set the cards, ensuring it's stored as a list"""
        if isinstance(value, str):
            parsed = json.loads(value)
            if not isinstance(parsed, list):
                raise ValueError("Cards must be a list")
            self.cards = parsed
        else:
            self.cards = value
