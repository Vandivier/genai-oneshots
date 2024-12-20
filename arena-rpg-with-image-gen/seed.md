# Instructions for Creating a Procedural Arena RPG with Turn-Based Combat

Below are step-by-step instructions for creating a procedural arena RPG using Python and Pygame. These instructions are intended to be given to an AI Agent capable of generating code and implementing the described features.

## Overview

You will create a turn-based arena RPG where:

1. Player characters and monsters are procedurally generated.
2. Characters and monsters are represented by layered, placeholder graphics drawn directly in Pygame.
3. Basic combat mechanics, including attacks, defense actions, skill usage, health points (HP), and skill points (SP), are implemented.
4. The game is displayed in a Pygame window, with player actions taken via keyboard input.

## Steps to Implement

1. **Set Up the Project:**
   - Use Python 3.
   - Install Pygame (`pip install pygame`).
   - Create a Python file (e.g., `main.py`) where all logic will reside.

2. **Initialize Pygame:**
   - Set up a Pygame window of fixed dimensions (e.g., 800x600).
   - Initialize fonts and create surfaces for drawing.

3. **Data Structures and Assets:**
   - Define lists of character races, classes, and monster types.
   - Define arrays for feature sets (e.g., hairstyles, facial features, armors, weapons).
   - Define color palettes.
   - Since you do not have actual images, represent each character and monster feature by drawing rectangles and labeling them (for demonstration).
   - Implement a function to create and return a player character dictionary with:
     - Name (generated from race and class)
     - HP, SP, Attack, Defense
     - A Pygame surface (image) representing the character
   - Implement a function to create and return a monster dictionary with:
     - Name (monster type)
     - HP, Attack, Defense (SP may not be used by monsters initially)
     - A Pygame surface (image) representing the monster

4. **Procedural Generation Functions:**
   - `generate_character()`: Randomly select a race and class, assign random stats within defined ranges, and call a helper function to create the graphical representation.
   - `generate_monster()`: Randomly select a monster type, assign random stats within defined ranges, and call a helper function to create the graphical representation.

5. **Drawing and Rendering:**
   - Implement a simple drawing function for placeholders: draw rectangles and text labels representing different layers of the character and monster.
   - Store generated surfaces in the character and monster dictionaries.

6. **Combat Logic:**
   - Store `hp`, `sp`, `attack`, `defense` in both player and monster dictionaries.
   - Implement turn-based logic:
     - Player Turn: The player chooses an action by pressing a key (A to Attack, D to Defend, S for Skill Attack if SP > 0).
     - Monster Turn: The monster automatically attacks.
   - Calculate damage based on:
     - `damage = attacker_attack - defender_defense`
     - If `damage < 1`, set `damage = 1`.
     - If the defender is defending, halve the damage.
     - For skill attacks, double the base damage and consume 1 SP if available.

7. **Game States and Message Log:**
   - Maintain a `message_log` list to show recent combat events.
   - Display player and monster stats at the top of the window.
   - After each action, append relevant messages (e.g., "Player attacked Monster for X damage").
   - Check if the player or monster's HP is 0 or less. If yes, display a victory or defeat message.
   - Allow pressing `R` at any time to reset the combatants and start a new battle.

8. **Defending Action:**
   - If the player chooses to defend, mark the player as `defending = True`. This reduces incoming damage on the monster's next turn.
   - Reset `defending` status on the following turn.

9. **Skill Attack Action:**
   - If the player has SP > 0 and chooses a skill attack, double the damage calculation and reduce SP by 1.

10. **Resetting Combat:**
    - Implement a function `reset_entities()` that calls `generate_character()` and `generate_monster()` to create new combatants and reset the message log.
    - Allow pressing `R` to call `reset_entities()` at any point, even after a match is over.

11. **Testing and Interactions:**
    - Test pressing `A`, `D`, and `S` on the player's turn and verify damage and defense calculations.
    - Test what happens when HP of either party reaches zero.
    - Test pressing `R` at different points to ensure the game resets properly.

12. **Improvements (Optional):**
    - Integrate actual image files instead of drawing rectangles.
    - Add more classes, monster types, and complexities like elemental damage or multiple skills.
    - Implement a state machine to handle different game states (e.g., menu, combat, game over).

## Example

Refer to the code examples in the previous dialogue steps to understand how to structure this. The final code should include:

- Initial setup with `pygame.init()`.
- Creation of the main game loop.
- Event handling for player inputs.
- Rendering logic for player, monster, and UI elements.
- Combat logic as described above.

## Delivery

At the end of these instructions, you should provide:

- A Python script (`main.py`) that, when run, opens a Pygame window and allows the player to engage in a procedural turn-based battle against a randomly generated monster.
- Code should be well-commented and structured so it can be easily extended.
