from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Table, select
from sqlalchemy.orm import relationship
from datetime import datetime, UTC
from sqlalchemy.orm.session import Session

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
    level = Column(Integer, default=1, nullable=False)
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
        if not self.last_gold_update.tzinfo:
            # Convert naive datetime to UTC if needed
            self.last_gold_update = self.last_gold_update.replace(tzinfo=UTC)
        now = datetime.now(UTC)
        seconds_passed = (now - self.last_gold_update).total_seconds()
        gold_earned = seconds_passed / 6.0
        self.gold += gold_earned
        self.last_gold_update = now

    def add_card(self, card, db: Session):
        """Add a card to the player's collection or increment its quantity"""
        if card not in self.cards:
            self.cards.append(card)
        else:
            # Fix the select syntax
            stmt = select(player_cards.c.quantity).where(
                player_cards.c.player_id == self.id,
                player_cards.c.card_id == card.id
            )
            result = db.execute(stmt).scalar()
            if result:
                stmt = player_cards.update().where(
                    player_cards.c.player_id == self.id,
                    player_cards.c.card_id == card.id
                ).values(quantity=result + 1)
                db.execute(stmt)

    @property
    def cards_list(self):
        """Get the cards as a list of dictionaries for API responses"""
        from sqlalchemy.orm.session import object_session
        
        db = object_session(self)
        if not db:
            return [
                {
                    "id": card.id,
                    "name": card.name,
                    "power_level": card.power_level,
                    "rarity": card.rarity,
                    "quantity": 1,
                }
                for card in self.cards
            ]
            
        result = []
        for card in self.cards:
            stmt = select(player_cards.c.quantity).where(
                player_cards.c.player_id == self.id,
                player_cards.c.card_id == card.id
            )
            quantity = db.execute(stmt).scalar() or 1
            result.append({
                "id": card.id,
                "name": card.name,
                "power_level": card.power_level,
                "rarity": card.rarity,
                "quantity": quantity,
            })
        return result
