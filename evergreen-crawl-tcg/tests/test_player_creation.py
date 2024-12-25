import pytest
from sqlalchemy.orm import Session
from fastapi.testclient import TestClient
from datetime import datetime, UTC

from app.main import app, init_required_data
from app.models.player import Player
from app.models.battler_card import BattlerCard, Rarity
from app.services.game_service import create_starter_deck


def test_create_player_with_empty_collection(test_db: Session):
    """Test creating a player with an empty card collection"""
    # Initialize required data first
    init_required_data()

    player = Player(
        username="test_user",
        gold=100,
        card_collection=[],
        last_gold_update=datetime.now(UTC),
        created_at=datetime.now(UTC),
    )
    test_db.add(player)
    test_db.commit()
    test_db.refresh(player)

    assert player.id is not None
    assert player.username == "test_user"
    assert isinstance(player.card_collection, list)
    assert len(player.card_collection) == 0


def test_create_player_with_starter_deck(test_db: Session):
    """Test creating a player and adding starter deck cards"""
    # Initialize required data first
    init_required_data()

    # Create initial player
    player = Player(
        username="test_user_2",
        gold=100,
        card_collection=[],
        last_gold_update=datetime.now(UTC),
        created_at=datetime.now(UTC),
    )
    test_db.add(player)
    test_db.flush()

    # Create starter deck
    starter_deck = create_starter_deck(test_db, player.id)
    test_db.commit()
    test_db.refresh(player)

    assert player.id is not None
    assert isinstance(player.card_collection, list)
    assert len(player.card_collection) > 0

    # Verify card collection structure
    for card in player.card_collection:
        assert isinstance(card, dict)
        assert "id" in card
        assert "name" in card
        assert "quantity" in card
        assert "power_level" in card
        assert "rarity" in card


def test_api_create_player(client: TestClient, test_db: Session):
    """Test player creation through the API endpoint"""
    # Initialize required data first
    init_required_data()

    response = client.post("/api/game/start", json={"username": "test_api_user"})

    assert response.status_code == 200
    data = response.json()

    assert "id" in data
    assert data["username"] == "test_api_user"
    assert isinstance(data["card_collection"], list)
    assert len(data["card_collection"]) > 0  # Should have starter cards


def test_duplicate_username(client: TestClient, test_db: Session):
    """Test attempting to create a player with a duplicate username"""
    # Initialize required data first
    init_required_data()

    # Create first player
    response1 = client.post("/api/game/start", json={"username": "duplicate_user"})
    assert response1.status_code == 200

    # Attempt to create second player with same username
    response2 = client.post("/api/game/start", json={"username": "duplicate_user"})
    assert response2.status_code == 400
    assert "Username already exists" in response2.json()["detail"]
