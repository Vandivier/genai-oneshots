# King Bananu - Development Phases

This document outlines the step-by-step implementation plan for the King Bananu game. Each phase represents a significant milestone in the development process.

## Phase 1: Project Setup & Core Mechanics

1. **Project Initialization:**
    * Create the main project directory.
    * Initialize `package.json` (e.g., `npm init -y` or `yarn init -y`).
    * Set up TypeScript: Install `typescript` and `ts-node` as dev dependencies, create `tsconfig.json`.
    * Choose and install a frontend framework (e.g., React with Create React App + TypeScript, Next.js, Vite + React/Vue/Svelte + TypeScript).
    * Install basic linting/formatting tools (e.g., ESLint, Prettier).
2. **Core TypeScript Types:**
    * Define initial types for `PlayerCharacter`, `Enemy`, `Item`, `Ability`, `MapCell`, `GameSave`.
    * Location: `src/types/`
3. **World Generation & Map System:**
    * Implement seeded procedural generation for the world map.
    * Develop functions to generate/load town maps and dungeon maps.
    * Define map data structures.
    * Location: `src/core/map/`
4. **Basic Character Movement & Display:**
    * Implement rendering of the current map (tile-based or other).
    * Implement player character movement on the map (e.g., grid-based).
    * Ensure movement controls are visible and functional.
    * Location: `src/components/world/`, `src/features/player/`
5. **Leveling & Experience System:**
    * Implement a system for characters to gain experience points (XP).
    * Define level-up mechanics (stat increases, new abilities).
    * Location: `src/core/systems/experience.ts`

## Phase 2: Game Screens & UI

1. **Main Menu & Save/Load System:**
    * Implement the "New Game" and "Load Saved Game" screen.
    * Implement functionality to save game state to one of five slots (initially localStorage or a simple file, to be integrated with Supabase later).
    * Implement functionality to load game state from a save slot.
    * Location: `src/components/menu/`, `src/core/saveLoad.ts`
2. **RPG UI Elements:**
    * Design and implement UI for:
        * Displaying safe town maps.
        * Displaying the world map.
        * Displaying dungeon maps.
        * Equipment screen (viewing and changing equipped items).
    * Location: `src/components/ui/`, `src/features/inventory/`
3. **Battle Screen UI:**
    * Design the split-panel battle screen UI (player/enemy stats, action menus, battle log).
    * Implement basic rendering of characters in battle positions.
    * Location: `src/components/battle/`

## Phase 3: Battle System & Initial Content

1. **Turn-Based Battle Mechanics:**
    * Implement the core turn-based battle logic (e.g., initiative, player turn, enemy turn).
    * Implement basic actions: Attack, Defend, Use Ability, Use Item.
    * Calculate damage, apply status effects.
    * Handle win/loss conditions for battles.
    * Location: `src/core/battle/`
2. **Define Characters & Abilities:**
    * Define stats, abilities, and sprites/appearances for King Bananu.
    * Implement "Bananu Rage Magic" as a special ability.
    * Define stats, abilities, and sprites/appearances for initial enemy types (e.g., "Human Soldier").
    * Location: `src/data/characters/`, `src/data/abilities/`
3. **First Battle Scene Implementation:**
    * Create the trigger and setup for the first battle: King Bananu vs. 100 Human Soldiers.
    * Integrate this battle into the initial game flow.

## Phase 4: Authentication & Monetization Backend

1. **Supabase Integration:**
    * Set up a Supabase project.
    * Configure Prisma ORM to connect to the Supabase database.
    * Create `.env` and `.env.template` for Supabase URL and anon key.
    * Modify save/load system to use Supabase for storing game saves tied to user accounts.
    * Location: `prisma/schema.prisma`, `src/server/db/`
2. **User Authentication:**
    * Integrate Supabase Auth.
    * Implement "Sign In with Google".
    * Implement email/password sign-up and login forms.
    * Display these options appropriately (e.g., Google Sign-In above email/password form).
    * Implement mock authentication for `localhost` development (e.g., a toggle in UI or environment variable to bypass actual Supabase calls and use a mock user).
    * Location: `src/features/auth/`, `src/components/auth/`
3. **Movement Energy System:**
    * Add `movementEnergy` field to the user/player data model.
    * Implement logic:
        * New users start with 1000 energy.
        * Free tier users gain 100 energy per day (requires a cron job or daily login check).
        * Consume 1 energy for: map steps, talking to an NPC, starting a battle.
    * Location: `src/core/systems/energy.ts`, `src/server/api/user.ts`
4. **Stripe Integration (Monetization):**
    * Set up a Stripe account.
    * Create `.env` and `.env.template` for Stripe API keys (publishable and secret).
    * Integrate Stripe Checkout or Payment Links for:
        * Premium subscription (details of premium benefits TBD).
        * Purchasing `movement energy` packs.
    * Create webhook endpoints to handle successful payments and update user accounts (e.g., grant premium status, add energy).
    * Location: `src/features/monetization/`, `src/server/api/stripe.ts`

## Phase 5: Story, World Building & Content Expansion

1. **Initial Story Implementation:**
    * Script and implement the introductory sequence:
        * King Bananu's town assaulted.
        * Loss of family and comrades.
        * Triggering of Bananu Rage.
        * Leading into the first battle against 100 men.
    * Use dialogue boxes, cutscene-like sequences (can be simple initially).
    * Location: `src/story/chapter1/`
2. **NPCs and Dialogue System:**
    * Implement a basic Non-Player Character (NPC) system.
    * Develop a dialogue system to display text from NPCs.
    * Add initial friendly/neutral NPCs in the first safe area.
    * Location: `src/features/npc/`, `src/components/ui/DialogueBox.tsx`
3. **Expand World Content:**
    * Design and implement more:
        * Towns (with unique shops, NPCs, quests).
        * Dungeons (with puzzles, traps, unique enemies, bosses).
        * Overworld areas and points of interest.
    * Location: `src/data/maps/`, `src/data/npcs/`
4. **Enemy Variety:**
    * Design and implement the other enemy factions mentioned:
        * 100 Americans (different abilities/stats than generic "men").
        * 100 British people (again, unique characteristics).
        * Aliens.
        * Predators.
        * Vampires.
        * Werewolves.
        * Zombies.
    * Ensure each faction feels distinct in terms of gameplay.
    * Location: `src/data/characters/enemies/`

## Phase 6: Polish, Testing & Deployment

1. **Testing and Quality Assurance:**
    * Comprehensive playthroughs to identify bugs and gameplay issues.
    * Write unit tests for core logic (battle system, procedural generation, etc.).
    * Consider integration tests for key user flows.
    * Gather user feedback if possible (e.g., from a small group of testers).
2. **UI/UX Refinements:**
    * Improve visual appeal and user-friendliness based on feedback and testing.
    * Ensure consistent design language.
    * Optimize for different screen sizes if targeting web responsiveness.
3. **Performance Optimization:**
    * Profile game performance (rendering, calculations).
    * Optimize critical code paths.
    * Reduce asset sizes where possible.
4. **Sound & Music (Optional but Recommended):**
    * Integrate a sound system.
    * Add sound effects for actions (attacks, movement, UI interactions).
    * Compose or source background music for different areas/situations (world map, town, battle).
    * Location: `src/assets/audio/`, `src/core/audio.ts`
5. **Build & Deployment:**
    * Set up build scripts for production.
    * Choose a hosting platform (e.g., Vercel, Netlify, GitHub Pages for frontend; a serverful or serverless platform for backend if needed beyond Supabase functions).
    * Configure CI/CD pipeline for automated builds and deployments.

This phased approach allows for iterative development and makes the overall task more manageable. We can adjust the details within each phase as we progress.
