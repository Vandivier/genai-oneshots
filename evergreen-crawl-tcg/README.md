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
- Each card has a power level and special effects
- Players can build decks with collected cards
- Cards can be obtained through the shop or dungeon rewards

### Dungeon System

- Procedurally generated grid-based dungeons
- Different tile types:
  - Combat encounters
  - Treasure rooms
  - Traps
  - Merchants
  - Shrines
  - Minibosses
  - Safe zones
- Fog of war exploration
- Turn-based movement

### Shop System

- Featured cards that rotate periodically
- Random card purchases
- Card packs with rarity weights
- Gold earned over time and through dungeon exploration

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## License

MIT License
