# Wizard Dude

## Overview

This is a game where you are a wizard dude.

You can declare your name on the opening screen. Your name determines your starting spells through a seeded random number generator, making each wizard's journey unique but reproducible.

## Game Mechanics

### Character Stats

- HP (Health Points): Your life force
- MP (Mana Points): Required for casting spells
- Experience: Gain XP by defeating enemies
- Level: Increases as you gain experience
- Attack: Determines base damage
- Defense: Reduces incoming damage

### Combat System

- Turn-based combat
- Actions:
  - Basic Attack: No MP cost
  - Spells: Powerful but consume MP
  - Items: Use potions and buffs

### Spells

- Each wizard starts with:
  - Magic Missile (basic attack spell)
  - Two random elemental spells
- Elements:
  - Fire
  - Ice
  - Lightning
  - Earth
- Chance to learn new spells on level up

### Enemies

- Enemies scale with player level
- Types (unlocked as you level):
  - Slime (Level 1+)
  - Goblin (Level 3+)
  - Skeleton (Level 4+)
  - Dark Wizard (Level 5+)
  - Dragon (Level 6+)

### Items

- Health Potions: Restore HP
- Mana Potions: Restore MP
- Buff Items: Temporary stat boosts
- Items can be found as drops from defeated enemies

### Progression

- Gain experience from defeating enemies
- Level up to increase stats
- Harder enemies appear as you level up
- Game ends when your HP reaches 0

## Tech Stack

- Next.js 13+ (App Router)
- Phaser 3
- TypeScript

## File Structure

- `src/`
  - `app/`: Next.js app router components
  - `phaser/`: Game logic and scene management
    - `GameScene.ts`: Main game scene
    - `PlayerManager.ts`: Player state and actions
    - `EnemyManager.ts`: Enemy generation and scaling
    - `types.ts`: Type definitions
- `public/`
  - `sprites/`
    - `wizard-dude.png`: Sprite sheet for the wizard character (2 frames: idle and attack)
