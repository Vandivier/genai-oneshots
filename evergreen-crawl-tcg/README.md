# Evergreen Crawl TCG

A dungeon crawler trading card game where players navigate procedurally generated dungeons, collect and utilize battler cards, and strive to reach the dungeon's exit.

## Features

- Procedurally generated dungeons
- Strategic deck building
- Combat mechanics with special effects
- Fog of war exploration
- Multiple starter decks
- Tag-based card system

## Tech Stack

### Backend

- FastAPI for the REST API
- SQLAlchemy for ORM
- SQLite for database
- Pydantic for data validation
- UV for Python package management

### Frontend

- React with TypeScript
- Vite for build tooling
- Tailwind CSS for styling
- shadcn/ui for UI components
- Phaser.js for game engine
- React Query for data fetching

## Setup

### Backend Setup

1. Install uv (if not already installed):

```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
```

2. Create and activate a virtual environment:

```bash
cd backend
uv venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
```

3. Install dependencies:

```bash
uv pip install .
```

4. Run the backend:

```bash
uvicorn app.main:app --reload
```

The API will be available at `http://localhost:8000`

### Frontend Setup

1. Install Node.js dependencies:

```bash
cd frontend
npm install
```

2. Run the development server:

```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`

## Project Structure

```
evergreen-crawl-tcg/
├── app/                    # Backend application
│   ├── models/            # Database models
│   ├── schemas/           # Pydantic schemas
│   ├── routes/            # API endpoints
│   ├── services/          # Business logic
│   └── utils/             # Helper functions
├── frontend/              # Frontend application
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── scenes/        # Phaser game scenes
│   │   ├── game/          # Game configuration
│   │   └── lib/           # Utility functions
│   └── public/            # Static assets
├── tests/                 # Test files
├── pyproject.toml         # Python project configuration
└── README.md             # This file
```

## Development

### API Documentation

- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

### Game Controls

- Arrow keys for movement
- Space bar for interaction
- ESC for menu

## Testing

Run backend tests:

```bash
pytest
```

Run frontend tests:

```bash
cd frontend
npm test
```
