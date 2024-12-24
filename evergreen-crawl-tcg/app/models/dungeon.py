from sqlalchemy import Column, Integer, String, JSON, ForeignKey, Enum
from sqlalchemy.orm import relationship
from enum import Enum as PyEnum
import json

from .database import Base


class CellType(str, PyEnum):
    EMPTY = "empty"
    MONSTER = "monster"
    TREASURE = "treasure"
    TRAP = "trap"
    EXIT = "exit"
    MERCHANT = "merchant"
    SHRINE = "shrine"
    MINIBOSS = "miniboss"
    SAFE = "safe"


class DungeonInstance(Base):
    __tablename__ = "dungeon_instances"

    id = Column(Integer, primary_key=True, index=True)
    player_id = Column(Integer, ForeignKey("players.id"))
    current_floor = Column(Integer, default=1)
    current_position = Column(JSON, default=lambda: json.dumps({"x": 0, "y": 0}))
    visited_cells = Column(JSON, default=list)
    grid_size = Column(Integer, default=10)
    layout = Column(JSON)  # Stores the dungeon layout as a 2D array

    # Relationships
    player = relationship("Player", back_populates="active_dungeon")

    def is_valid_move(self, x: int, y: int) -> bool:
        """Check if a move to position (x, y) is valid"""
        if not (0 <= x < self.grid_size and 0 <= y < self.grid_size):
            return False

        current = json.loads(self.current_position)
        # Can only move to adjacent cells
        return abs(x - current["x"]) + abs(y - current["y"]) == 1

    def get_visible_cells(self) -> list:
        """Get cells visible to the player (implements fog of war)"""
        current = json.loads(self.current_position)
        visible = []

        # Reveal adjacent cells
        for dx in [-1, 0, 1]:
            for dy in [-1, 0, 1]:
                x, y = current["x"] + dx, current["y"] + dy
                if 0 <= x < self.grid_size and 0 <= y < self.grid_size:
                    visible.append({"x": x, "y": y, "type": self.layout[y][x]})

        return visible


class DungeonEncounter(Base):
    __tablename__ = "dungeon_encounters"

    id = Column(Integer, primary_key=True, index=True)
    dungeon_id = Column(Integer, ForeignKey("dungeon_instances.id"))
    cell_type = Column(Enum(CellType))
    position_x = Column(Integer)
    position_y = Column(Integer)
    is_completed = Column(Boolean, default=False)

    # Store encounter-specific data (e.g., monster stats, treasure contents)
    data = Column(JSON)
