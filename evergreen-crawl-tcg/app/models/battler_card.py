from sqlalchemy import Column, Integer, String, Enum, DateTime, Table, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from enum import Enum as PyEnum
from typing import List

from .database import Base


class Rarity(str, PyEnum):
    COMMON = "Common"
    UNCOMMON = "Uncommon"
    RARE = "Rare"
    LEGENDARY = "Legendary"


# Junction table for cards and tags
card_tags = Table(
    "card_tags",
    Base.metadata,
    Column("card_id", Integer, ForeignKey("battler_cards.id"), primary_key=True),
    Column("tag_id", Integer, ForeignKey("tags.id"), primary_key=True),
)


class BattlerCard(Base):
    __tablename__ = "battler_cards"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    power_level = Column(Integer)
    rarity = Column(Enum(Rarity))
    effect_description = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    tags = relationship("Tag", secondary=card_tags, back_populates="cards")
    effects = relationship("CardEffect", back_populates="card")
