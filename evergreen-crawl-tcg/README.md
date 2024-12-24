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

1. Install uv (if not already installed):

```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
```

2. Create and activate a virtual environment:

```bash
uv venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
```

3. Install dependencies:

```bash
# Install main dependencies
uv pip install -r pyproject.toml
```

4. Run the application:

```bash
uvicorn app.main:app --reload
```

5. Access the API documentation at:

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
├── pyproject.toml      # Project configuration and dependencies
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

## Package Management

This project uses [uv](https://github.com/astral-sh/uv) for dependency management. Some useful commands:

```bash
# Update dependencies
uv pip compile pyproject.toml

# Add a new dependency
uv pip install package_name
uv pip freeze > requirements.txt  # If you need requirements.txt for compatibility

# List installed packages
uv pip list

# Check for outdated packages
uv pip list --outdated
```
