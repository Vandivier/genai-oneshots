# Evergreen Crawl TCG Frontend

The frontend application for Evergreen Crawl TCG, built with React, TypeScript, and Phaser.js.

## Tech Stack

- React 18+
- TypeScript
- Vite
- Phaser.js for game rendering
- Tailwind CSS for styling
- shadcn/ui for UI components
- Axios for API communication

## Development Setup

1. Install dependencies:

```bash
npm install
```

2. Start the development server:

```bash
npm run dev
```

The application will be available at http://localhost:5173

## Project Structure

```
src/
├── components/           # React components
│   ├── ui/              # shadcn/ui components
│   └── game/            # Game-specific components
├── scenes/              # Phaser game scenes
│   ├── dungeon/         # Dungeon-related scenes and logic
│   └── combat/          # Combat-related scenes and logic
├── services/            # API services and game logic
├── assets/             # Game assets and resources
└── config/             # Game configuration
```

## Game Controls

- Arrow keys or WASD for movement
- Space to interact with tiles
- M to toggle audio
- ESC to pause/menu

## Features

### Game Board

- Grid-based movement
- Fog of war exploration
- Different tile types with unique interactions
- Audio feedback for actions

### Combat System

- Turn-based card combat
- Card selection and playing
- Combat animations and effects
- Health and status tracking

### UI Components

- Setup screen for game creation/loading
- Deck builder interface
- Shop interface
- Game menu and settings
- Combat UI with card display

## Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Asset Credits

Game assets are provided by Kenney (www.kenney.nl) under the CC0 license:

- 1-Bit Pack
- RPG Urban Pack
- RPG Audio
- Interface Sounds

Audio from https://freesound.org/ (CC0 license)
