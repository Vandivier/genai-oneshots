# Game Instructions for AI Agent: Rune Weaver's Descent

**Game Description:**

Rune Weaver's Descent is a procedurally generated roguelite dungeon crawler. The AI Agent will control a procedurally generated character exploring a procedurally generated grid-based dungeon, battling procedurally generated enemies. The goal is to descend as far as possible through the dungeon.

**Core Game Mechanics:**

* **Grid-Based Movement:** The agent can move one tile at a time in four cardinal directions: Up, Down, Left, Right.
* **Procedural Generation:** The map layout, player character attributes, and enemy attributes are randomized at the start of each run.
* **Combat:** Combat occurs when the agent and an enemy occupy the same tile. The specifics of combat (attack damage, health) will need to be inferred from the game state or provided as explicit data.
* **Runes (Abilities):** The player character starts with a set of randomized Runes, which represent special abilities. The effects of these runes will need to be inferred or provided.
* **Perma-death:** If the agent's character reaches 0 health, the run ends.

**Game State:**

The AI Agent will receive the following information about the current game state:

* **Map:** A 2D grid representing the dungeon. Each cell will contain information about the tile type:
  * `floor`:  Traversable space.
  * `wall`: Impassable obstacle.
  * `start`: The player's starting position.
  * `end`: The descent point to the next level.
  * `enemy`: An enemy is present at this location.
  * `player`: The AI Agent's character is present at this location.
  * `treasure`: A treasure item is present.
* **Player Character:**
  * `position`: The current grid coordinates (x, y) of the player.
  * `health`: The player's current health points.
  * `runes`: A list of the player's current runes and their properties (if applicable). The specific effects of runes will need to be learned or provided.
* **Enemies:** A list of all enemies in the current level, with the following information for each:
  * `position`: The current grid coordinates (x, y) of the enemy.
  * `health`: The enemy's current health points.
  * `attack`: The enemy's attack damage (if applicable).
* **Game Level:** The current level of the dungeon (starts at 1).

**Actions:**

The AI Agent can perform the following actions:

* `move_up`: Move the player character one tile up.
* `move_down`: Move the player character one tile down.
* `move_left`: Move the player character one tile left.
* `move_right`: Move the player character one tile right.
* `use_rune`: Activate a specific rune. This action will require specifying the rune to use (e.g., `use_rune: "fireball"`). The availability and cooldown of runes may need to be tracked.

**Rewards and Objectives:**

* **Primary Objective:** Descend as far as possible through the dungeon.
* **Rewards:**
  * **Level Completion:**  A positive reward for reaching the 'end' tile and progressing to the next level.
  * **Enemy Defeat:** A smaller positive reward for defeating an enemy.
  * **Treasure Collection:** A positive reward for collecting treasure.
* **Penalties:**
  * **Taking Damage:** A negative reward for losing health.
  * **Death:** A large negative reward for the player character reaching 0 health.

**Learning Considerations:**

* **Exploration:** The AI Agent needs to learn to explore the procedurally generated maps to find the 'end' tile.
* **Combat Strategy:** The AI Agent needs to learn effective combat strategies to defeat enemies while minimizing damage. This includes understanding enemy attack patterns and utilizing player runes effectively.
* **Resource Management (Implicit):**  While not explicitly defined, the AI Agent might need to learn to manage its health and rune usage.

**Example Game State (Simplified):**

```json
{
  "map": [
    ["wall", "wall", "wall", "wall", "wall"],
    ["wall", "start", "floor", "enemy", "wall"],
    ["wall", "floor", "wall", "floor", "wall"],
    ["wall", "floor", "treasure", "end", "wall"],
    ["wall", "wall", "wall", "wall", "wall"]
  ],
  "player": {
    "position": { "x": 1, "y": 1 },
    "health": 100,
    "runes": ["basic_attack", "minor_heal"]
  },
  "enemies": [
    {
      "position": { "x": 3, "y": 1 },
      "health": 50,
      "attack": 10
    }
  ],
  "game_level": 1
}
