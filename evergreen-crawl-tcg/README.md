# Evergreen Crawl TCG

A dungeon crawler trading card game where players explore procedurally generated dungeons, collect cards, and build decks.

## Features

- Procedurally generated dungeons with various tile types (combat, treasure, traps, etc.)
- Card collection and deck building system
- Shop system with different card rarities
- Gold accumulation over time
- Save/load game state
- Modern React frontend with Phaser.js for game rendering
- FastAPI backend with SQLite database

## Tech Stack

### Backend

- Python 3.12+
- FastAPI
- SQLAlchemy
- SQLite
- Pydantic
- Alembic for migrations

### Frontend

- React 18+
- TypeScript
- Vite
- Phaser.js
- Tailwind CSS
- shadcn/ui components

## Development Setup

### Backend

1. Create and activate a virtual environment:

```bash
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
```

2. Install dependencies:

```bash
pip install -e .
```

3. Run the FastAPI server:

```bash
uvicorn app.main:app --reload
```

The API will be available at http://localhost:8000
API documentation is available at http://localhost:8000/docs

### Frontend

1. Navigate to the frontend directory:

```bash
cd frontend
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm run dev
```

The frontend will be available at http://localhost:5173

## Testing

Run the test suite:

```bash
pytest
```

## Project Structure

```
evergreen-crawl-tcg/
├── app/                    # Backend application
│   ├── models/            # SQLAlchemy models
│   ├── routes/            # FastAPI route handlers
│   ├── schemas/           # Pydantic schemas
│   └── services/          # Business logic
├── frontend/              # Frontend application
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── scenes/        # Phaser game scenes
│   │   └── services/      # API services
├── tests/                 # Test suite
└── alembic/               # Database migrations
```

## Game Mechanics

### Card System

- Cards have different rarities (Common, Uncommon, Rare, Legendary)
- Each card has a power level that affects combat effectiveness
- Players start with a basic starter deck
- Additional cards can be obtained through:
  - Shop purchases
  - Dungeon rewards
  - Card packs

### Dungeon System

- Procedurally generated 10x10 grid-based dungeons
- Visibility system:
  - Players can see adjacent cells
  - Visited cells remain partially visible
  - Unexplored areas are hidden
- Tile Types:
  - Safe (·): Basic traversable tile
  - Monster (M): Initiates combat encounter
  - Treasure (T): Contains gold or card rewards
  - Trap (X): Deals damage to the player
  - Merchant ($): Opens the shop interface
  - Shrine (S): One-time use for beneficial effects
  - Miniboss (B): Challenging combat encounter
  - Exit (E): Proceeds to next level
- Movement:
  - Turn-based grid movement using arrow keys
  - Can move one tile at a time
  - Cannot move diagonally

### Shop System

- Accessible through merchant tiles in dungeons
- Three purchase options:
  - Featured Card: A specific card that changes daily (100 gold)
  - Random Card: A random card from the collection (50 gold)
  - Card Pack: Multiple cards with rarity weights (150 gold)
- Rarity Distribution in Card Packs:
  - Common: 60% chance
  - Uncommon: 30% chance
  - Rare: 8% chance
  - Legendary: 2% chance
- Shop refreshes every 24 hours with new featured cards

### Progress System

- Players earn gold through:
  - Treasure rooms
  - Shrine bonuses
  - Time-based accumulation
- Game state is automatically saved, including:
  - Player position
  - Dungeon state
  - Card collection
  - Gold amount
- Multiple save slots available through different usernames

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## License

MIT License
