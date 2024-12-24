from pydantic import BaseModel, Field
from typing import List, Optional, Dict
from datetime import datetime
from enum import Enum


class PlayerCreate(BaseModel):
    username: str


class PlayerResponse(BaseModel):
    id: int
    username: str
    gold: float
    created_at: datetime

    class Config:
        from_attributes = True


class DeckCreate(BaseModel):
    name: str
    cards: List[int] = Field(description="List of card IDs")


class DeckResponse(BaseModel):
    id: int
    name: str
    card_count: int
    cards: List[Dict]  # Will include card details

    class Config:
        from_attributes = True


class ShopResponse(BaseModel):
    featured_card: Dict
    featured_card_price: float
    random_card_price: float
    pack_price: float


class PurchaseResponse(BaseModel):
    success: bool
    cards_received: List[Dict]
    gold_remaining: float


class Position(BaseModel):
    x: int
    y: int


class DungeonCell(BaseModel):
    x: int
    y: int
    type: str
    is_visible: bool = False
    is_visited: bool = False


class DungeonState(BaseModel):
    floor: int
    position: Position
    visible_cells: List[DungeonCell]
    player_stats: Dict


class GameState(BaseModel):
    """Full game state for import/export"""

    player: PlayerResponse
    decks: List[DeckResponse]
    active_dungeon: Optional[DungeonState]
    collection: List[Dict]
