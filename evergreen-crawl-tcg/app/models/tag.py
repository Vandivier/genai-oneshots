from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship

from .database import Base
from .battler_card import card_tags


class Tag(Base):
    __tablename__ = "tags"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    description = Column(String)

    # Relationship back to cards
    cards = relationship("BattlerCard", secondary=card_tags, back_populates="tags")
