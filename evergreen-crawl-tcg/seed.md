# Evergreen Crawl TCG Technical Specification

## 1. Game Overview

Evergreen Crawl TCG is a dungeon crawler trading card game where players navigate procedurally generated dungeons, collect and utilize battler cards, and strive to reach the dungeon's exit. The game combines exploration, strategic deck building, combat mechanics, and fog of war for an engaging gameplay experience.

## 2. Core Components

### Battler Cards

- **Required Attributes:**

  - Name: Unique identifier
  - Power Level: Numerical strength indicator
  - BattlerTags: Array of attributes/tags
  - Rarity: Common, Uncommon, Rare, or Legendary
  - Effects (Optional): Special abilities or modifiers

- **Effect Types:**
  - Speed-based effects (e.g., "Speed 5: Counter target attack")
  - Energy/Mana accumulation effects
  - Conditional effects (e.g., "When played with another Water battler...")
  - Interrupt abilities
  - Counter abilities
  - Early attack abilities

### Deck Construction

- **Deck Size:**
  - Minimum: 13 cards
  - Maximum: 104 cards
- **No class/element restrictions:**
  - Players can mix any BattlerTags
  - Hybrid combinations achieved through multiple tags
  - No inherent energy/mana system at deck level

### Starter Decks

Create 4 distinct starter decks:

1. Fire Fury
2. Mystic Waters
3. Earth Guardians
4. Shadow Assassins

Each starter deck should:

- Contain exactly 52 cards
- Follow rarity distribution guidelines
- Include thematic hybrid cards

## 3. Dungeon Design

### Map Structure

- Multiple floor levels
- Base grid size: 10x10 per floor
- Branching paths with risk/reward choices
- Special rooms requiring specific BattlerTags
- Checkpoint system between floors

### Cell Types

1. **Standard Cells:**

   - Empty (Draw opportunity)
   - Monster (Combat)
   - Treasure (Card acquisition)
   - Trap (Negative effects)
   - Exit (Level completion)

2. **Special Rooms:**
   - Merchant's Shop (Card trading)
   - Shrine (Temporary buffs)
   - Mini-boss Chamber
   - Tag-restricted Areas
   - Safe Rooms (Checkpoints)

### Environmental Features

- Floor-specific hazards
- Theme-based challenges
- Interactive elements
- Hidden passages
- Emergency exits

## 4. Combat System

### Core Mechanics

1. **Initiative:**

   - Die roll determines right of surprise
   - Winner chooses to go first or second
   - No inherent speed stats

2. **Battle Resolution:**

   - Compare total power levels
   - Apply card effects in order of Speed rating (if applicable)
   - Resolve any counters or interrupts

3. **Tag Interactions:**
   - Multiple tags enable strategic combinations
   - No inherent tag advantages
   - Tag synergies through card effects only

## 5. Event System

### Standard Events

- Card draws
- Combat encounters
- Treasure discovery
- Trap activation
- Exit reaching

### Enhanced Events

1. **Merchant Encounters:**

   - Card trading
   - Rare card purchases
   - Card upgrades
   - Tag modifications

2. **Shrine Rooms:**

   - Temporary power boosts
   - Tag additions
   - Special abilities
   - Deck modifications

3. **Environmental Events:**

   - Floor-specific challenges
   - Tag-based obstacles
   - Time-limited challenges
   - Group events

4. **Mini-boss Encounters:**
   - Unique combat rules
   - Special rewards
   - Multiple-phase battles
   - Tag-specific challenges

## 6. Database Schema

### Core Tables

1. **Players**

   - PlayerID (PK)
   - Username
   - Progress data
   - Statistics

2. **BattlerCards**

   - CardID (PK)
   - Name
   - Power Level
   - Rarity
   - Effect Description
   - Creation Date

3. **Tags**

   - TagID (PK)
   - TagName
   - Description

4. **CardTags** (Junction)

   - CardID (FK)
   - TagID (FK)

5. **Dungeons**

   - DungeonID (PK)
   - Layout (CSV)
   - Floor Number
   - Creation Date
   - Difficulty

6. **Events**
   - EventID (PK)
   - EventType
   - Description
   - Requirements
   - Rewards

### Relationship Tables

1. **PlayerDecks**

   - DeckID (PK)
   - PlayerID (FK)
   - Creation Date
   - Last Modified

2. **DeckCards**

   - DeckID (FK)
   - CardID (FK)
   - Quantity

3. **PlayerProgress**
   - PlayerID (FK)
   - DungeonID (FK)
   - CurrentPosition
   - VisitedCells
   - Checkpoints
   - Status

## 7. Implementation Requirements

### Card Effect System

- Effect resolution order based on Speed ratings
- Clear timing system for interrupts and counters
- Stack-based effect resolution
- State tracking for energy/mana accumulation

### Dungeon Generation

- Ensure valid paths between entrance and exit
- Balanced distribution of event types
- Multiple valid routes through each floor
- Proper checkpoint placement
- Tag-restricted area validation

### Combat Resolution

- Clear order of operations
- Proper effect timing
- Initiative system implementation
- Power level calculations
- Effect resolution queue

### Event Processing

- Event trigger validation
- Reward distribution
- Merchant inventory generation
- Shrine effect application
- Environmental effect management

## 8. Technical Considerations

### Performance

- Efficient dungeon generation
- Optimized combat calculations
- Quick event resolution
- Minimal database queries

### Scalability

- Support for new card types
- Expandable event system
- Additional dungeon features
- New game modes

### Security

- Secure card trading
- Valid deck verification
- Anti-cheat measures
- Progress validation

## 9. Future Expansion Considerations

### Content Additions

- New card sets
- Additional dungeon types
- Expanded event possibilities
- New game modes

### Multiplayer Features

- Trading system
- Cooperative dungeons
- Competitive modes
- Social features

### Achievement System

- Progress tracking
- Special rewards
- Unique challenges
- Leaderboards
