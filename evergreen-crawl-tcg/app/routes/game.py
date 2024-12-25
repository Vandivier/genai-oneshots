from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import json
import logging
from datetime import datetime, UTC

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

# Set up logging
logger = logging.getLogger(__name__)

router = APIRouter()


def create_starter_deck(db: Session, player_id: int) -> Deck:
    """Create a starter deck for a new player"""
    try:
        starter_deck = Deck(
            name="Starter Deck",
            player_id=player_id,
            cards=json.dumps(
                [
                    # Add some basic starter cards here
                    {"id": 1, "name": "Basic Warrior", "attack": 2, "defense": 2},
                    {"id": 2, "name": "Basic Healer", "attack": 1, "defense": 3},
                    {"id": 3, "name": "Basic Mage", "attack": 3, "defense": 1},
                ]
            ),
        )
        db.add(starter_deck)
        db.commit()
        db.refresh(starter_deck)
        return starter_deck
    except Exception as e:
        logger.error(f"Failed to create starter deck: {str(e)}")
        db.rollback()
        raise


@router.post("/start", response_model=PlayerResponse)
async def start_game(player: PlayerCreate, db: Session = Depends(get_db)):
    """Start a new game and create a player"""
    try:
        # Check if username already exists
        existing_player = (
            db.query(Player).filter(Player.username == player.username).first()
        )
        if existing_player:
            logger.warning(f"Username {player.username} already exists")
            raise HTTPException(status_code=400, detail="Username already exists")

        logger.info(f"Creating new player with username: {player.username}")

        # Create new player with empty list for card_collection
        db_player = Player(
            username=player.username,
            gold=100,  # Starting gold
            card_collection=[],  # Initialize as empty list
            last_gold_update=datetime.now(UTC),
            created_at=datetime.now(UTC),
        )
        logger.debug(f"Player object created: {db_player.__dict__}")

        db.add(db_player)
        db.flush()  # Flush to get the player ID
        logger.info(f"Player added to database with ID: {db_player.id}")

        try:
            # Create starter deck
            logger.info(f"Creating starter deck for player {db_player.id}")
            starter_deck = create_starter_deck(db, db_player.id)
            logger.info(f"Starter deck created with ID: {starter_deck.id}")
        except Exception as deck_error:
            logger.error(f"Failed to create starter deck: {str(deck_error)}")
            raise

        db.commit()
        db.refresh(db_player)
        logger.info(
            f"Successfully created player {player.username} with ID {db_player.id}"
        )

        return db_player
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to create player: {str(e)}")
        logger.error(f"Error type: {type(e)}")
        logger.error(f"Error details: {e.__dict__}")
        db.rollback()
        raise HTTPException(
            status_code=500, detail=f"Failed to create player: {str(e)}"
        )


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


@router.delete("/player/{player_id}")
async def delete_player(player_id: int, db: Session = Depends(get_db)):
    """Delete a player and all associated data"""
    try:
        player = db.query(Player).filter(Player.id == player_id).first()
        if not player:
            raise HTTPException(status_code=404, detail="Player not found")

        # Delete associated data
        db.query(Deck).filter(Deck.player_id == player_id).delete()
        db.query(DungeonInstance).filter(
            DungeonInstance.player_id == player_id
        ).delete()
        db.delete(player)
        db.commit()

        return {"message": "Player deleted successfully"}
    except Exception as e:
        logger.error(f"Failed to delete player: {str(e)}")
        db.rollback()
        raise HTTPException(
            status_code=500, detail=f"Failed to delete player: {str(e)}"
        )


@router.put("/state/{player_id}")
async def save_game_state(
    player_id: int, state: GameState, db: Session = Depends(get_db)
):
    """Save the current game state"""
    try:
        player = db.query(Player).filter(Player.id == player_id).first()
        if not player:
            raise HTTPException(status_code=404, detail="Player not found")

        # Update player data
        player.gold = state.player.gold
        player.card_collection = json.dumps(state.collection)

        # Update or create dungeon instance
        if state.active_dungeon:
            dungeon = player.active_dungeon
            if not dungeon:
                dungeon = DungeonInstance(player_id=player_id)
                db.add(dungeon)

            dungeon.current_floor = state.active_dungeon.floor
            dungeon.current_position = json.dumps(state.active_dungeon.position)
            dungeon.visited_cells = json.dumps(
                [cell.dict() for cell in state.active_dungeon.visible_cells]
            )

        # Update decks
        for deck_state in state.decks:
            deck = (
                db.query(Deck)
                .filter(Deck.id == deck_state.id, Deck.player_id == player_id)
                .first()
            )
            if deck:
                deck.cards = json.dumps(deck_state.cards)

        db.commit()
        return {"message": "Game state saved successfully"}
    except Exception as e:
        logger.error(f"Failed to save game state: {str(e)}")
        db.rollback()
        raise HTTPException(
            status_code=500, detail=f"Failed to save game state: {str(e)}"
        )
