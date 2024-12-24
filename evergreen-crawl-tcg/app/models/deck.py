from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, Table
from sqlalchemy.orm import relationship
from sqlalchemy.sql import text

from .database import Base

# Junction table for deck cards
deck_cards = Table(
    "deck_cards",
    Base.metadata,
    Column("deck_id", Integer, ForeignKey("decks.id"), primary_key=True),
    Column("card_id", Integer, ForeignKey("battler_cards.id"), primary_key=True),
    Column("quantity", Integer, default=1),
)


class Deck(Base):
    __tablename__ = "decks"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    player_id = Column(Integer, ForeignKey("players.id"))
    is_starter = Column(Boolean, default=False)

    # Relationships
    player = relationship("Player", back_populates="decks")
    cards = relationship("BattlerCard", secondary=deck_cards)

    @property
    def card_count(self):
        """Get total number of cards in deck"""
        result = 0
        for card in self.cards:
            for deck_card in card.deck_cards:
                if deck_card.deck_id == self.id:
                    result += deck_card.quantity
        return result

    def is_valid(self):
        """Check if deck meets game rules"""
        count = self.card_count
        return 13 <= count <= 104
