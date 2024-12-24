from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import json

from ..models.database import get_db
from ..models.player import Player
from ..models.deck import Deck
from ..models.shop import Shop, CardPack
from ..models.dungeon import DungeonInstance
from ..schemas.game import (
    PlayerCreate,
    PlayerResponse,
    DeckCreate,
    DeckResponse,
    ShopResponse,
    PurchaseResponse,
    GameState,
    DungeonState,
)

router = APIRouter()


@router.post("/start", response_model=PlayerResponse)
async def start_game(player: PlayerCreate, db: Session = Depends(get_db)):
    """Start a new game and create a player"""
    db_player = Player(username=player.username)
    db.add(db_player)
    db.commit()
    db.refresh(db_player)

    # Create starter deck
    starter_deck = create_starter_deck(db, db_player.id)
    return db_player


@router.get("/player/{player_id}", response_model=PlayerResponse)
async def get_player(player_id: int, db: Session = Depends(get_db)):
    """Get player information and update gold"""
    player = db.query(Player).filter(Player.id == player_id).first()
    if not player:
        raise HTTPException(status_code=404, detail="Player not found")

    player.update_gold()
    db.commit()
    return player


@router.get("/shop/{player_id}", response_model=ShopResponse)
async def get_shop(player_id: int, db: Session = Depends(get_db)):
    """Get shop information"""
    shop = db.query(Shop).first()
    if shop.should_refresh():
        refresh_shop(db, shop)
    return shop


@router.post("/shop/{player_id}/buy", response_model=PurchaseResponse)
async def buy_item(
    player_id: int,
    item_type: str,  # "featured", "random", or "pack"
    db: Session = Depends(get_db),
):
    """Purchase an item from the shop"""
    player = db.query(Player).filter(Player.id == player_id).first()
    if not player:
        raise HTTPException(status_code=404, detail="Player not found")

    player.update_gold()
    shop = db.query(Shop).first()

    if item_type == "featured":
        return purchase_featured_card(db, player, shop)
    elif item_type == "random":
        return purchase_random_card(db, player)
    elif item_type == "pack":
        return purchase_card_pack(db, player)
    else:
        raise HTTPException(status_code=400, detail="Invalid item type")


@router.post("/deck", response_model=DeckResponse)
async def create_deck(deck: DeckCreate, db: Session = Depends(get_db)):
    """Create a new deck"""
    db_deck = Deck(name=deck.name)
    db.add(db_deck)
    db.commit()
    db.refresh(db_deck)
    return db_deck


@router.post("/dungeon/{player_id}/start")
async def start_dungeon(player_id: int, db: Session = Depends(get_db)):
    """Start a new dungeon instance"""
    player = db.query(Player).filter(Player.id == player_id).first()
    if not player:
        raise HTTPException(status_code=404, detail="Player not found")

    # Create new dungeon instance
    dungeon = DungeonInstance(player_id=player_id)
    generate_dungeon_layout(dungeon)
    db.add(dungeon)
    db.commit()
    return dungeon.get_visible_cells()


@router.post("/dungeon/{player_id}/move")
async def move_in_dungeon(
    player_id: int, x: int, y: int, db: Session = Depends(get_db)
):
    """Move to a new position in the dungeon"""
    dungeon = (
        db.query(DungeonInstance).filter(DungeonInstance.player_id == player_id).first()
    )

    if not dungeon:
        raise HTTPException(status_code=404, detail="No active dungeon")

    if not dungeon.is_valid_move(x, y):
        raise HTTPException(status_code=400, detail="Invalid move")

    # Update position and handle cell event
    dungeon.current_position = json.dumps({"x": x, "y": y})
    visited = json.loads(dungeon.visited_cells)
    visited.append({"x": x, "y": y})
    dungeon.visited_cells = json.dumps(visited)

    db.commit()
    return {
        "cells": dungeon.get_visible_cells(),
        "event": handle_cell_event(dungeon, x, y),
    }


@router.get("/state/{player_id}", response_model=GameState)
async def export_game_state(player_id: int, db: Session = Depends(get_db)):
    """Export the full game state"""
    player = db.query(Player).filter(Player.id == player_id).first()
    if not player:
        raise HTTPException(status_code=404, detail="Player not found")

    return {
        "player": player,
        "decks": player.decks,
        "active_dungeon": player.active_dungeon,
        "collection": [
            {"card": card, "quantity": quantity}
            for card, quantity in player.cards.items()
        ],
    }


@router.post("/state/import")
async def import_game_state(state: GameState, db: Session = Depends(get_db)):
    """Import a game state"""
    # Implementation would need careful validation and security checks
    pass
