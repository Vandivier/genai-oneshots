# Evergreen Alphasort

This is a bar-raising gacha game inspired by [Aria's Tale](https://www.ariastale.com/).

Aria's Tale is an emergent narrative world drawing on elements of fantasy, science fiction, and isekai.

This document compiles technical game design and mechanics to balance fun, simplicity, strategy, and replayability.

This document also compares and contrasts Evergreen Alphasort mechanics with other common game designs to highlight differentiation.

## Common Mechanics

Rarity: Evergreen Alphasort increases rarity diversity by describing rarity in terms of letters and stars. An AA rarity can also be called a 2A rarity and this is rarer than an A-rarity character. The maximum rarity is 9Z.

Default Character: Every player starts with a single A-rarity "Novice" character. This character can be upgraded into a swordsman, mage, or archer by upgrading.

Character Statistics: Character Statistics are greatly simplified in Evergreen Alphasort. Characters simply have power points and special abilities.

Parties: Parties in Evergreen Alphasort can be comprised of up to nine characters, increasing strategic depth compared to other games.

Parties are defined using a linear stack, simplifying mechanics like targeting compared to other games. In autobattle mode, the first character in each stack simply attacks the first character in the other party and abilities are always executed. Characters can activate abilities from any position in the stack, and characters are processed in linear order. Players can enable or disable autobattle at any time. In manual mode, players can change their party order before processing an attack.

Party power can simply be calculated by the sum of character power in a party.

Equipment: Equipment in Evergreen Alphasort also receives a rarity rating. Characters can be equipped with a weapon, armor, and a trinket. So, each character has three equipment slots.

Trait System: Characters can have arbitrary traits which include their class name, race, elemental affinity, and other string traits. These may be used for processing ability effects.

Abilities: Each character has between zero and nine abilities.

Character Leveling: Characters do not have levels in Evergreen Alphasort.

Evolution: Characters and items may be upgraded through merging other characters and items.

Game Progress Level: Parties will iteratively face progressively more powerful enemy mobs. Battles must be actively initiated by a player. There is no penalty for defeat. Success increments the player's Game Progress Level. Game features and narrative elements are unlocked over time based on the Game Progress Level.

Passive Rewards: Parties accrue rewards over time at a rate determined by the player's Game Progress Level.

Player Inventory: Players accrue all sorts of items in the player inventory. These items may be used for upgrades, events, recruitment, and crafting, but may not be involved in battle. The player inventory includes currency such as gold and gems.

Shops: There are a variety of shops which can be unlocked over time plus a standard shop which is enabled by default. The standard shop sells items for gold or gems and refreshes daily. A gem is worth about 100 gold. Shops have some probability of offering a discount, with larger discounts being rarer.

Recruitment: Like shops, there are a variety of recruitment methods including a standard mercenary recruitment which is enabled by default.

## Technical Requirements

Evergreen Alphasort requires web compatibility and leverages simple 2D graphics.

## Narrative Subtext

A key narrative subtext is the use of human or AI convenience resulting in unexpected, undesired, or seemingly arbitrary results.

One example is the fact that a B-rated character is stronger than an A-rated character. This is due to alphasorting, as hinted in the game title, but it's unexpected compared to traditional grading and rating schemes.

Another instance is the maximum of 9 characters in a party or 9 stars of rarity, as a larger number would require an extra character and therefore could be considered a convenience limit on data architecture.
