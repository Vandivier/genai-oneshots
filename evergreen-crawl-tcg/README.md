# Evergreen Crawl TCG

A dungeon crawler trading card game where players navigate procedurally generated dungeons, collect and utilize battler cards, and strive to reach the dungeon's exit.

## Features

- Procedurally generated dungeons
- Strategic deck building
- Combat mechanics with special effects
- Fog of war exploration
- Multiple starter decks
- Tag-based card system

## Setup

1. Create a virtual environment:

```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:

```bash
pip install -r requirements.txt
```

3. Run the application:

```bash
uvicorn app.main:app --reload
```

4. Access the API documentation at:

```
http://localhost:8000/docs
```

## Project Structure

```
evergreen-crawl-tcg/
├── app/
│   ├── models/         # Database models
│   ├── schemas/        # Pydantic models
│   ├── routes/         # API endpoints
│   ├── services/       # Business logic
│   └── utils/          # Helper functions
├── tests/              # Test files
├── requirements.txt    # Project dependencies
└── README.md          # This file
```

## Development

- The project uses FastAPI for the backend API
- SQLAlchemy for database ORM
- Pydantic for data validation
- SQLite as the database (can be changed for production)

## Testing

Run tests using pytest:

```bash
pytest
```
