from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from typing import List
import json
import logging
from datetime import datetime, UTC
from pydantic import BaseModel

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
from ..services.game_service import (
    create_starter_deck,
    generate_dungeon_layout,
    handle_cell_event,
    refresh_shop,
    purchase_featured_card,
    purchase_random_card,
    purchase_card_pack,
)

# Set up logging
logger = logging.getLogger(__name__)

router = APIRouter()


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

        # Create new player
        db_player = Player(
            username=player.username,
            gold=100,  # Starting gold
            level=1,   # Starting level
            last_gold_update=datetime.now(UTC),
            created_at=datetime.now(UTC),
        )
        logger.debug(f"Player object created: {db_player.__dict__}")

        db.add(db_player)
        db.flush()  # Flush to get the player ID
        logger.info(f"Player added to database with ID: {db_player.id}")

        try:
            # Create starter deck and initialize player's collection
            logger.info(f"Creating starter deck for player {db_player.id}")
            starter_deck = create_starter_deck(db, db_player.id)
            logger.info(f"Starter deck created with ID: {starter_deck.id}")

            # Refresh player to get updated cards
            db.refresh(db_player)
            logger.info(
                f"Player cards initialized with {len(db_player.cards_list)} cards"
            )
        except Exception as deck_error:
            logger.error(f"Failed to create starter deck: {str(deck_error)}")
            raise

        db.commit()
        logger.info(
            f"Successfully created player {player.username} with ID {db_player.id}"
        )

        # Return player data as a dictionary
        return {
            "id": db_player.id,
            "username": db_player.username,
            "gold": db_player.gold,
            "created_at": db_player.created_at,
            "cards": db_player.cards_list,
        }
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

    return {
        "id": player.id,
        "username": player.username,
        "gold": player.gold,
        "level": player.level,
        "created_at": player.created_at,
        "cards": player.cards_list,
    }


@router.get("/shop/{player_id}", response_model=ShopResponse)
async def get_shop(player_id: int, db: Session = Depends(get_db)):
    """Get shop information"""
    shop = db.query(Shop).first()
    if not shop:
        # Create shop if it doesn't exist
        shop = Shop(
            featured_card_price=100,
            random_card_price=50,
            pack_price=150,
            last_refresh=datetime.now(UTC),
        )
        db.add(shop)
        db.commit()
        db.refresh(shop)

    # Check if shop needs refresh and has no featured card
    if shop.should_refresh() or not shop.featured_card:
        refresh_shop(db, shop)
        db.refresh(shop)

    # Convert featured card to dictionary format
    featured_card_dict = None
    if shop.featured_card:
        featured_card_dict = {
            "id": shop.featured_card.id,
            "name": shop.featured_card.name,
            "power_level": shop.featured_card.power_level,
            "rarity": shop.featured_card.rarity.value,
        }

    return {
        "featured_card": featured_card_dict
        or {},  # Return empty dict if no featured card
        "featured_card_price": shop.featured_card_price,
        "random_card_price": shop.random_card_price,
        "pack_price": shop.pack_price,
    }


@router.post("/shop/{player_id}/buy")
async def buy_shop_item(
    player_id: int,
    item_type: str = Body(..., embed=True),  # Change from Query to Body
    db: Session = Depends(get_db)
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
async def start_dungeon(
    player_id: int, seed: int = None, db: Session = Depends(get_db)
):
    """Start a new dungeon instance

    Args:
        player_id: The ID of the player
        seed: Optional seed for reproducible dungeon generation
    """
    try:
        logger.info(f"Starting dungeon for player {player_id} with seed {seed}")

        player = db.query(Player).filter(Player.id == player_id).first()
        if not player:
            logger.error(f"Player {player_id} not found")
            raise HTTPException(status_code=404, detail="Player not found")

        # Delete any existing dungeon instance
        db.query(DungeonInstance).filter(
            DungeonInstance.player_id == player_id
        ).delete()

        # Create new dungeon instance
        dungeon = DungeonInstance(
            player_id=player_id,
            current_floor=1,
            current_position=json.dumps({"x": 0, "y": 0}),
            visited_cells=json.dumps([{"x": 0, "y": 0}]),
        )
        logger.info("Created new dungeon instance")

        # Add dungeon to database first to get its ID
        db.add(dungeon)
        db.flush()
        logger.info(f"Added dungeon to database with ID: {dungeon.id}")

        # Generate the dungeon layout with optional seed
        generate_dungeon_layout(dungeon, seed)
        logger.info(f"Generated dungeon layout with seed: {seed}")

        # Commit changes and refresh the instance
        db.commit()
        db.refresh(dungeon)
        logger.info("Saved dungeon to database")

        # Get visible cells
        visible_cells = dungeon.get_visible_cells()
        logger.info(f"Returning {len(visible_cells)} visible cells")
        return visible_cells

    except Exception as e:
        logger.error(f"Error starting dungeon: {str(e)}")
        db.rollback()
        raise HTTPException(
            status_code=500, detail=f"Failed to start dungeon: {str(e)}"
        )


class MoveRequest(BaseModel):
    x: int
    y: int


@router.post("/dungeon/{player_id}/move")
async def move_in_dungeon(
    player_id: int, move: MoveRequest, db: Session = Depends(get_db)
):
    """Move to a new position in the dungeon and get updated cell data"""
    logger.info(f"Moving player {player_id} to position ({move.x}, {move.y})")

    dungeon = (
        db.query(DungeonInstance).filter(DungeonInstance.player_id == player_id).first()
    )

    if not dungeon:
        logger.error(f"No active dungeon found for player {player_id}")
        raise HTTPException(status_code=404, detail="No active dungeon")

    if not dungeon.is_valid_move(move.x, move.y):
        logger.error(
            f"Invalid move to ({move.x}, {move.y}) from current position {dungeon.current_position}"
        )
        raise HTTPException(status_code=400, detail="Invalid move")

    # Update position and handle cell event
    dungeon.current_position = json.dumps({"x": move.x, "y": move.y})
    visited = json.loads(dungeon.visited_cells)
    visited.append({"x": move.x, "y": move.y})
    dungeon.visited_cells = json.dumps(visited)

    db.commit()

    # Get only the cells that are newly visible
    layout = json.loads(dungeon.layout)
    newly_visible_cells = []
    for dy in [-1, 0, 1]:
        for dx in [-1, 0, 1]:
            x, y = move.x + dx, move.y + dy
            if 0 <= x < dungeon.grid_size and 0 <= y < dungeon.grid_size:
                newly_visible_cells.append(
                    {
                        "x": x,
                        "y": y,
                        "type": layout[y][x],
                        "is_visible": True,
                        "is_visited": {"x": x, "y": y} in visited,
                    }
                )

    # Get the event for the new cell
    event = handle_cell_event(dungeon, move.x, move.y)
    logger.info(
        f"Move successful, returning {len(newly_visible_cells)} newly visible cells"
    )

    return {
        "cells": newly_visible_cells,
        "event": event,
        "position": {"x": move.x, "y": move.y},
    }


@router.get("/state/{player_id}", response_model=GameState)
async def export_game_state(player_id: int, db: Session = Depends(get_db)):
    """Export the full game state"""
    player = db.query(Player).filter(Player.id == player_id).first()
    if not player:
        raise HTTPException(status_code=404, detail="Player not found")

    # Format active dungeon data if it exists
    active_dungeon_data = None
    if player.active_dungeon:
        current_pos = json.loads(player.active_dungeon.current_position)
        active_dungeon_data = {
            "floor": player.active_dungeon.current_floor,
            "position": {"x": current_pos["x"], "y": current_pos["y"]},
            "visible_cells": player.active_dungeon.get_visible_cells(),
            "player_stats": {
                "health": 100,  # Default stats, can be expanded later
                "gold": player.gold,
            },
        }

    # Format deck data
    formatted_decks = []
    for deck in player.decks:
        try:
            cards = (
                json.loads(deck.cards) if isinstance(deck.cards, str) else deck.cards
            )
            formatted_decks.append(
                {
                    "id": deck.id,
                    "name": deck.name,
                    "card_count": len(cards),
                    "cards": cards,
                }
            )
        except (json.JSONDecodeError, TypeError):
            logger.error(f"Failed to decode cards for deck {deck.id}")
            formatted_decks.append(
                {"id": deck.id, "name": deck.name, "card_count": 0, "cards": []}
            )

    return {
        "player": {
            "id": player.id,
            "username": player.username,
            "gold": player.gold,
            "created_at": player.created_at,
            "cards": player.cards_list,
        },
        "decks": formatted_decks,
        "active_dungeon": active_dungeon_data,
        "collection": player.cards_list,
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
            dungeon.current_position = json.dumps(
                {
                    "x": state.active_dungeon.position.x,
                    "y": state.active_dungeon.position.y,
                }
            )
            dungeon.visited_cells = json.dumps(
                [
                    {
                        "x": cell.x,
                        "y": cell.y,
                        "type": cell.type,
                        "is_visible": cell.is_visible,
                        "is_visited": cell.is_visited,
                    }
                    for cell in state.active_dungeon.visible_cells
                ]
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
