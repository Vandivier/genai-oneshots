# Evergreen Crawl TCG

A roguelike deck-building game where you explore dungeons, collect cards, and battle monsters.

## Tech Stack

- Backend: FastAPI (Python)
- Frontend: React + Vite + TypeScript
- Game Engine: Phaser.js
- UI Components: shadcn/ui + Tailwind CSS
- Database: SQLite

## Features

- Procedurally generated dungeons
- Turn-based card combat
- Fog of war exploration
- Shop system between levels
- Deck building mechanics

## Setup

### Backend

1. Install Python dependencies:

```bash
pip install -r requirements.txt
```

2. Run the FastAPI server:

```bash
uvicorn app.main:app --reload
```

### Frontend

1. Install Node.js dependencies:

```bash
cd frontend
npm install
```

2. Run the development server:

```bash
npm run dev
```

## Game Controls

- Arrow keys for movement
- Click cards to play them in combat
- End Turn button to finish your turn
- Flee button to attempt escape from combat

## Credits

### Assets

Game assets are provided by Kenney (www.kenney.nl) under the CC0 license:

- 1-Bit Pack
- RPG Urban Pack
- RPG Audio
- Interface Sounds

These assets are licensed under Creative Commons Zero (CC0) and can be used in personal and commercial projects.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Attributions

Some audio from https://freesound.org/home/bookmarks/category/293700/
