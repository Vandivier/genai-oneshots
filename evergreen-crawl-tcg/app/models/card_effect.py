from sqlalchemy import Column, Integer, String, Enum, ForeignKey
from sqlalchemy.orm import relationship
from enum import Enum as PyEnum

from .database import Base


class EffectType(str, PyEnum):
    SPEED = "Speed"
    ENERGY = "Energy"
    CONDITIONAL = "Conditional"
    INTERRUPT = "Interrupt"
    COUNTER = "Counter"
    EARLY_ATTACK = "EarlyAttack"


class CardEffect(Base):
    __tablename__ = "card_effects"

    id = Column(Integer, primary_key=True, index=True)
    card_id = Column(Integer, ForeignKey("battler_cards.id"))
    effect_type = Column(Enum(EffectType))
    speed_value = Column(Integer, nullable=True)  # For speed-based effects
    description = Column(String)
    trigger_condition = Column(String, nullable=True)  # For conditional effects

    # Relationship back to card
    card = relationship("BattlerCard", back_populates="effects")
