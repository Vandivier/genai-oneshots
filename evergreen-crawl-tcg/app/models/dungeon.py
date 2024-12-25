from sqlalchemy import Boolean, Column, Integer, JSON, ForeignKey, Enum
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
        if not self.layout:
            return []

        layout = json.loads(self.layout)
        visited = json.loads(self.visited_cells) if self.visited_cells else []
        visible = []

        # Get all cells in the grid
        for y in range(self.grid_size):
            for x in range(self.grid_size):
                # Check if cell is adjacent to current position
                is_adjacent = abs(x - current["x"]) <= 1 and abs(y - current["y"]) <= 1
                # Check if cell has been visited
                is_visited = {"x": x, "y": y} in visited

                # Cell is visible if it's adjacent or has been visited
                if is_adjacent or is_visited:
                    visible.append(
                        {
                            "x": x,
                            "y": y,
                            "type": layout[y][x],
                            "is_visible": True,
                            "is_visited": is_visited,
                        }
                    )
                else:
                    # Add non-visible cells as fog
                    visible.append(
                        {
                            "x": x,
                            "y": y,
                            "type": "fog",
                            "is_visible": False,
                            "is_visited": False,
                        }
                    )

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
