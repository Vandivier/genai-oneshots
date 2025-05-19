-- Clear existing card definitions to avoid conflicts if script is run multiple times
TRUNCATE TABLE public.card_definitions RESTART IDENTITY CASCADE;

-- Standard Playing Cards (Ace, King, Queen, Jack, 10, 7, 2 for each suit)
-- Total 28 standard cards

-- CLUBS (Close range, double power in combat)
INSERT INTO public.card_definitions (id, name, suit, rank, base_power, description, rules_metadata)
VALUES
  ('ace_of_clubs', 'Ace of Clubs', 'CLUBS', 'A', 14, 'A powerful close-range attacker.', '{"range": "close", "effect": "double_power_in_combat"}'),
  ('king_of_clubs', 'King of Clubs', 'CLUBS', 'K', 13, 'A formidable close-range unit.', '{"range": "close", "effect": "double_power_in_combat"}'),
  ('queen_of_clubs', 'Queen of Clubs', 'CLUBS', 'Q', 12, 'A strong close-range fighter.', '{"range": "close", "effect": "double_power_in_combat"}'),
  ('jack_of_clubs', 'Jack of Clubs', 'CLUBS', 'J', 11, 'A reliable close-range combatant.', '{"range": "close", "effect": "double_power_in_combat"}'),
  ('10_of_clubs', '10 of Clubs', 'CLUBS', '10', 10, 'A standard close-range unit.', '{"range": "close", "effect": "double_power_in_combat"}'),
  ('7_of_clubs', '7 of Clubs', 'CLUBS', '7', 7, 'A common close-range soldier.', '{"range": "close", "effect": "double_power_in_combat"}'),
  ('2_of_clubs', '2 of Clubs', 'CLUBS', '2', 2, 'A basic close-range defender.', '{"range": "close", "effect": "double_power_in_combat"}');

-- SPADES (Long range)
INSERT INTO public.card_definitions (id, name, suit, rank, base_power, description, rules_metadata)
VALUES
  ('ace_of_spades', 'Ace of Spades', 'SPADES', 'A', 14, 'A deadly long-range sniper.', '{"range": "long"}'),
  ('king_of_spades', 'King of Spades', 'SPADES', 'K', 13, 'A commanding long-range artillery unit.', '{"range": "long"}'),
  ('queen_of_spades', 'Queen of Spades', 'SPADES', 'Q', 12, 'A precise long-range attacker.', '{"range": "long"}'),
  ('jack_of_spades', 'Jack of Spades', 'SPADES', 'J', 11, 'A skilled long-range marksman.', '{"range": "long"}'),
  ('10_of_spades', '10 of Spades', 'SPADES', '10', 10, 'A standard long-range archer.', '{"range": "long"}'),
  ('7_of_spades', '7 of Spades', 'SPADES', '7', 7, 'A common long-range scout.', '{"range": "long"}'),
  ('2_of_spades', '2 of Spades', 'SPADES', '2', 2, 'A basic long-range watchman.', '{"range": "long"}');

-- HEARTS (Can heal instead of attacking)
INSERT INTO public.card_definitions (id, name, suit, rank, base_power, description, rules_metadata)
VALUES
  ('ace_of_hearts', 'Ace of Hearts', 'HEARTS', 'A', 14, 'A powerful unit that can choose to heal allies.', '{"specialAction": "heal_instead_of_attack"}'),
  ('king_of_hearts', 'King of Hearts', 'HEARTS', 'K', 13, 'A resilient unit capable of healing.', '{"specialAction": "heal_instead_of_attack"}'),
  ('queen_of_hearts', 'Queen of Hearts', 'HEARTS', 'Q', 12, 'A supportive unit with healing abilities.', '{"specialAction": "heal_instead_of_attack"}'),
  ('jack_of_hearts', 'Jack of Hearts', 'HEARTS', 'J', 11, 'A versatile unit that can opt to heal.', '{"specialAction": "heal_instead_of_attack"}'),
  ('10_of_hearts', '10 of Hearts', 'HEARTS', '10', 10, 'A standard unit with a healing option.', '{"specialAction": "heal_instead_of_attack"}'),
  ('7_of_hearts', '7 of Hearts', 'HEARTS', '7', 7, 'A common unit that can provide healing.', '{"specialAction": "heal_instead_of_attack"}'),
  ('2_of_hearts', '2 of Hearts', 'HEARTS', '2', 2, 'A basic unit with a minor healing capability.', '{"specialAction": "heal_instead_of_attack"}');

-- DIAMONDS (Remote zone, draw bonus)
INSERT INTO public.card_definitions (id, name, suit, rank, base_power, description, rules_metadata)
VALUES
  ('ace_of_diamonds', 'Ace of Diamonds', 'DIAMONDS', 'A', 14, 'A master operative in the remote zone, grants significant card draw.', '{"range": "remote", "onFieldEffect": "draw_bonus_per_diamond"}'),
  ('king_of_diamonds', 'King of Diamonds', 'DIAMONDS', 'K', 13, 'A key asset in the remote zone, boosts card draw.', '{"range": "remote", "onFieldEffect": "draw_bonus_per_diamond"}'),
  ('queen_of_diamonds', 'Queen of Diamonds', 'DIAMONDS', 'Q', 12, 'An influential figure in the remote zone, aids card draw.', '{"range": "remote", "onFieldEffect": "draw_bonus_per_diamond"}'),
  ('jack_of_diamonds', 'Jack of Diamonds', 'DIAMONDS', 'J', 11, 'A resourceful agent in the remote zone, helps with card draw.', '{"range": "remote", "onFieldEffect": "draw_bonus_per_diamond"}'),
  ('10_of_diamonds', '10 of Diamonds', 'DIAMONDS', '10', 10, 'A standard operative in the remote zone, provides card draw.', '{"range": "remote", "onFieldEffect": "draw_bonus_per_diamond"}'),
  ('7_of_diamonds', '7 of Diamonds', 'DIAMONDS', '7', 7, 'A common asset in the remote zone, contributes to card draw.', '{"range": "remote", "onFieldEffect": "draw_bonus_per_diamond"}'),
  ('2_of_diamonds', '2 of Diamonds', 'DIAMONDS', '2', 2, 'A basic resource in the remote zone, offers minor card draw.', '{"range": "remote", "onFieldEffect": "draw_bonus_per_diamond"}');

-- Custom Cards (13 cards)
INSERT INTO public.card_definitions (id, name, suit, rank, base_power, description, rules_metadata)
VALUES
  -- Elven Archers
  ('elven_archer_squad', 'Elven Archer Squad', 'CUSTOM', 'Archer', 7, 'A squad of precise long-range archers. Can attack twice if not damaged this turn.', '{"range": "long", "effect": "double_attack_if_undamaged", "tags": ["elf", "archer"]}'),
  ('elven_sharpshooter', 'Elven Sharpshooter', 'CUSTOM', 'Elite Archer', 9, 'Ignores range restrictions when attacking. Can target any enemy unit.', '{"range": "any", "effect": "ignore_range_restrictions", "tags": ["elf", "archer", "elite"]}'),
  
  -- Trolls
  ('stone_troll_bruiser', 'Stone Troll Bruiser', 'CUSTOM', 'Bruiser', 10, 'A hulking close-range fighter. Regenerates 2 power at the start of your turn if on the field.', '{"range": "close", "onTurnStartEffect": "regenerate_2_power", "tags": ["troll", "monster"]}'),
  ('troll_shaman', 'Troll Shaman', 'CUSTOM', 'Shaman', 6, 'Can be played at long range. Once per game, can return one destroyed non-custom card from your discard to your hand.', '{"range": "long", "specialAction": "once_per_game_retrieve_card", "tags": ["troll", "shaman", "magic"]}'),

  -- Witches
  ('swamp_witch', 'Swamp Witch', 'CUSTOM', 'Witch', 5, 'When played, target opponent discards one random card from their hand.', '{"range": "any", "onPlayEffect": "opponent_discard_random", "tags": ["witch", "magic"]}'),
  ('healing_witch', 'Healing Witch', 'CUSTOM', 'Healer', 4, 'Can be played at long range. At the end of your turn, if this card is face-up, heal one of your units on the field for 3 power (cannot exceed base power).', '{"range": "long", "onTurnEndEffect": "heal_unit_3_power", "tags": ["witch", "healer", "magic"]}'),
  
  -- Architects
  ('master_architect', 'Master Architect', 'CUSTOM', 'Architect', 3, 'Play in Remote Zone. While this card is face-up in the remote zone, your close-range units gain +2 power.', '{"range": "remote", "auraEffect": "buff_close_range_units_power_2", "tags": ["architect", "support"]}'),
  ('fortification_expert', 'Fortification Expert', 'CUSTOM', 'Engineer', 4, 'Play in Remote Zone. Once per turn, you can choose one of your units. That unit cannot be destroyed by battle this turn (still takes damage/effects).', '{"range": "remote", "specialAction": "make_unit_indestructible_by_battle_1_turn", "tags": ["architect", "engineer", "support"]}'),

  -- More!
  ('goblin_raiding_party', 'Goblin Raiding Party', 'CUSTOM', 'Raider', 6, 'Close range. If this card destroys an enemy unit by battle, draw a card.', '{"range": "close", "onBattleVictoryEffect": "draw_card", "tags": ["goblin", "raider"]}'),
  ('spectral_knight', 'Spectral Knight', 'CUSTOM', 'Knight', 8, 'Close range. Cannot be targeted by opponent''s custom card effects.', '{"range": "close", "passiveEffect": "immune_to_custom_card_effects", "tags": ["undead", "knight"]}'),
  ('time_mage', 'Time Mage', 'CUSTOM', 'Mage', 5, 'Long range. On play, you may choose to skip your opponent''s next draw phase.', '{"range": "long", "onPlayEffect": "skip_opponent_draw_phase", "tags": ["mage", "magic", "control"]}'),
  ('shadow_assassin', 'Shadow Assassin', 'CUSTOM', 'Assassin', 7, 'Close range. If played face-down and flipped up to attack, gains +3 power for that attack.', '{"range": "close", "onFlipAttackEffect": "gain_3_power", "tags": ["assassin", "stealth"]}'),
  ('celestial_guardian', 'Celestial Guardian', 'CUSTOM', 'Guardian', 12, 'Long range. Cannot attack. Your other units cannot be targeted for attacks if this card is on the field and face-up.', '{"range": "long", "passiveEffect": "protect_other_units_from_attack", "cannotAttack": true, "tags": ["celestial", "guardian", "defender"]}'); 