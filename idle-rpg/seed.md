# app generation seed instructions: Idle RPG

Below is a detailed plan for creating the idle RPG, including the environment choice, features, and code structure, as well as the final implementation example.

## Overview

We will create an idle RPG using **Phaser.js** and a single HTML file. The game will run in a browser and feature:

1. **Idle Mechanics:**  
   Every few seconds, an event occurs automatically:
   - Chance to encounter enemies.
   - Chance to encounter a shop.
   - Otherwise, the player continues traveling (doing nothing special).

2. **Player Stats and Progression:**
   - The player has Level, XP, Gold, HP, Max HP, and Attack.
   - Defeating enemies grants XP and Gold.
   - Gaining enough XP levels up the player, increasing stats and fully restoring HP.

3. **Enemies and Rarity:**
   - Enemies have rarities that adjust their HP and Attack.
   - Rarity also affects XP/Gold rewards.
   - Enemy ASCII art and color indicate rarity.

4. **Shops:**
   - Randomly appear.
   - Offer upgrades (Attack, Max HP, Healing) for Gold.

5. **Clicker Mechanics:**
   - A button to Heal 1 HP on demand (also revives if HP ≤ 0).
   - A button to deal +1 bonus damage to the enemy during battle.

6. **ASCII Art:**
   - A simple ASCII art representation of the player character.
   - A simple ASCII art representation of the enemy when encountered, tinted by rarity color.

## Technology Choice

**Phaser.js** is chosen for:

- Easy web deployment.
- Rich community and ecosystem.
- Quick iteration and shareability via a simple URL.

## Implementation Details

**Structure:**

- A single `index.html` file.
- Include Phaser via CDN.
- All game logic in a single `<script>` tag.

**Core Steps:**

1. **Initialize Player Data:**  
   Set player stats, level, XP, etc.

2. **Main Loop with Timed Events:**  
   Use Phaser’s `update` function and a timer to trigger events every few seconds.

3. **Random Events:**
   - Enemy Encounter (20%): Start a battle.
   - Shop Encounter (10%): Offer upgrades.
   - Otherwise, just show a traveling message.

4. **Battle Mechanics:**
   - On encounter, choose enemy rarity based on weighted chances.
   - Scale enemy stats by rarity multipliers.
   - Display enemy ASCII art in rarity color.
   - Each timed cycle (every few seconds), run a “battle round”:
     - Player attacks enemy automatically.
     - If enemy still alive, enemy attacks player.
   - Player can click an Attack button at any time to deal +1 bonus damage.
   - If player dies, they remain dead until healed.

5. **Shop Mechanics:**
   - When shop encountered, automatically purchase the best available upgrade.

6. **Heal and Revive:**
   - A Heal button increases player HP by 1.
   - If player is dead, healing revives them at 1 HP.

7. **UI:**
   - Display player stats on the left.
   - Display messages and updates below the stats.
   - Display player ASCII art in the center.
   - Display enemy ASCII art on the right side during battles.
   - Two clickable text buttons: Heal and Attack.

8. **Leveling Up:**
   - When XP reaches the threshold, increase level, improve stats, and fully heal player.
