from sqlalchemy.orm import Session
from sqlalchemy.sql import func
from fastapi import HTTPException
import random
import json
from typing import List, Dict
from datetime import datetime, UTC

from ..models.player import Player
from ..models.deck import Deck
from ..models.battler_card import BattlerCard, Rarity
from ..models.dungeon import DungeonInstance, CellType
from ..models.shop import Shop, CardPack


def create_starter_deck(db: Session, player_id: int) -> Deck:
    """Create a starter deck for new players"""
    try:
        # Get the player
        player = db.query(Player).filter(Player.id == player_id).first()
        if not player:
            raise ValueError("Player not found")

        # Get or create starter cards
        starter_cards = []
        card_data = [
            {"name": "Basic Warrior", "power_level": 3, "rarity": Rarity.COMMON},
            {"name": "Basic Mage", "power_level": 2, "rarity": Rarity.COMMON},
            {"name": "Basic Healer", "power_level": 2, "rarity": Rarity.COMMON},
        ]

        for data in card_data:
            card = (
                db.query(BattlerCard).filter(BattlerCard.name == data["name"]).first()
            )
            if not card:
                card = BattlerCard(**data)
                db.add(card)
                db.flush()
            starter_cards.append(card)

        # Create the deck
        deck = Deck(
            name="Starter Deck",
            player_id=player_id,
            is_starter=True,
            cards=[
                {
                    "id": card.id,
                    "name": card.name,
                    "power_level": card.power_level,
                    "rarity": card.rarity,
                    "quantity": 1,
                }
                for card in starter_cards
            ],
        )
        db.add(deck)

        # Add cards to player's collection
        for card in starter_cards:
            player.cards.append(card)

        db.commit()
        return deck
    except Exception as e:
        db.rollback()
        raise


def refresh_shop(db: Session, shop: Shop) -> None:
    """Refresh the shop with a new featured card"""
    # Get a random card to feature
    all_cards = db.query(BattlerCard).all()
    if not all_cards:
        raise ValueError("No cards available in the database")

    featured_card = random.choice(all_cards)
    shop.featured_card_id = featured_card.id
    shop.last_refresh = datetime.now(UTC)
    db.commit()
    db.refresh(shop)


def purchase_featured_card(db: Session, player: Player, shop: Shop):
    """Purchase the featured card from the shop"""
    if not shop.featured_card:
        raise HTTPException(status_code=400, detail="No featured card available")
    
    if player.gold < shop.featured_card_price:
        raise HTTPException(status_code=400, detail="Not enough gold")
    
    # Deduct gold
    player.gold -= shop.featured_card_price
    
    # Add card to player's collection
    player.add_card(shop.featured_card, db)
    
    db.commit()
    
    return {
        "success": True,
        "cards_received": [shop.featured_card],
        "gold_remaining": player.gold,
        "player_data": {
            "id": player.id,
            "username": player.username,
            "gold": player.gold,
            "level": player.level,
            "created_at": player.created_at,
            "cards": player.cards_list,
        }
    }


def purchase_random_card(db: Session, player: Player):
    """Purchase a random card from the shop"""
    if player.gold < 50:  # Random card price from main.py
        raise HTTPException(status_code=400, detail="Not enough gold")
    
    # Get a random card
    all_cards = db.query(BattlerCard).all()
    if not all_cards:
        raise HTTPException(status_code=500, detail="No cards available")
    
    random_card = random.choice(all_cards)
    
    # Deduct gold
    player.gold -= 50
    
    # Add card to player's collection
    player.add_card(random_card, db)
    
    db.commit()
    
    return {
        "success": True,
        "cards_received": [random_card],
        "gold_remaining": player.gold,
        "player_data": {
            "id": player.id,
            "username": player.username,
            "gold": player.gold,
            "level": player.level,
            "created_at": player.created_at,
            "cards": player.cards_list,
        }
    }


def purchase_card_pack(db: Session, player: Player):
    """Purchase a pack of cards"""
    if player.gold < 150:  # Pack price from main.py
        raise HTTPException(status_code=400, detail="Not enough gold")
    
    # Deduct gold
    player.gold -= 150
    
    # Get cards based on rarity distribution from README
    cards_received = []
    for _ in range(5):  # Assume 5 cards per pack
        roll = random.random() * 100
        if roll < 60:
            rarity = Rarity.COMMON
        elif roll < 90:
            rarity = Rarity.UNCOMMON
        elif roll < 98:
            rarity = Rarity.RARE
        else:
            rarity = Rarity.LEGENDARY
            
        possible_cards = db.query(BattlerCard).filter(BattlerCard.rarity == rarity).all()
        if possible_cards:
            card = random.choice(possible_cards)
            cards_received.append(card)
            player.add_card(card, db)
    
    db.commit()
    
    return {
        "success": True,
        "cards_received": cards_received,
        "gold_remaining": player.gold,
        "player_data": {
            "id": player.id,
            "username": player.username,
            "gold": player.gold,
            "level": player.level,
            "created_at": player.created_at,
            "cards": player.cards_list,
        }
    }


def generate_dungeon_layout(dungeon: DungeonInstance, seed: int = None) -> None:
    """Generate a new dungeon layout

    Args:
        dungeon: The dungeon instance to generate a layout for
        seed: Optional seed for reproducible dungeon generation
    """
    # Create a new random state for this dungeon generation
    rng = random.Random(seed) if seed is not None else random.Random()

    size = dungeon.grid_size
    layout = [[CellType.EMPTY.value for _ in range(size)] for _ in range(size)]

    # Place exit
    exit_x, exit_y = size - 1, size - 1
    layout[exit_y][exit_x] = CellType.EXIT.value

    # Place other elements
    cell_types = [
        (CellType.MONSTER, 0.3),
        (CellType.TREASURE, 0.1),
        (CellType.TRAP, 0.1),
        (CellType.MERCHANT, 0.05),
        (CellType.SHRINE, 0.05),
        (CellType.MINIBOSS, 0.02),
        (CellType.SAFE, 0.05),
    ]

    for y in range(size):
        for x in range(size):
            if layout[y][x] == CellType.EMPTY.value:
                for cell_type, prob in cell_types:
                    if rng.random() < prob:
                        layout[y][x] = cell_type.value
                        break

    # Ensure starting position is safe
    layout[0][0] = CellType.SAFE.value
    dungeon.layout = json.dumps(layout)


def handle_cell_event(dungeon: DungeonInstance, x: int, y: int) -> Dict:
    """Handle events when moving to a new cell"""
    layout = json.loads(dungeon.layout)
    cell_type = layout[y][x]

    if cell_type == CellType.MONSTER.value:
        return {"type": "combat", "data": generate_combat_encounter()}
    elif cell_type == CellType.TREASURE.value:
        return {"type": "treasure", "data": generate_treasure()}
    elif cell_type == CellType.TRAP.value:
        return {"type": "trap", "data": generate_trap()}
    elif cell_type == CellType.MERCHANT.value:
        return {"type": "merchant", "data": generate_merchant_inventory()}
    elif cell_type == CellType.SHRINE.value:
        return {"type": "shrine", "data": generate_shrine_effect()}
    elif cell_type == CellType.MINIBOSS.value:
        return {"type": "miniboss", "data": generate_miniboss_encounter()}
    elif cell_type == CellType.EXIT.value:
        return {"type": "exit", "data": {"message": "Level complete!"}}
    else:
        return {"type": "empty", "data": None}


# Helper functions for generating specific encounters
def generate_combat_encounter() -> Dict:
    """Generate a random combat encounter"""
    return {"enemy": {"name": "Random Monster", "power_level": random.randint(2, 8)}}


def generate_treasure() -> Dict:
    """Generate random treasure"""
    return {"gold": random.randint(10, 50)}


def generate_trap() -> Dict:
    """Generate random trap effect"""
    return {"damage": random.randint(1, 3)}


def generate_merchant_inventory() -> Dict:
    """Generate merchant's inventory"""
    return {
        "items": [
            {"name": "Health Potion", "cost": 20},
            {"name": "Power Boost", "cost": 30},
        ]
    }


def generate_shrine_effect() -> Dict:
    """Generate random shrine effect"""
    effects = ["Temporary power boost", "Heal wounds", "Reveal nearby cells"]
    return {"effect": random.choice(effects)}


def generate_miniboss_encounter() -> Dict:
    """Generate miniboss encounter"""
    return {
        "enemy": {
            "name": "Miniboss",
            "power_level": random.randint(8, 12),
            "special_ability": "Power Strike",
        }
    }
