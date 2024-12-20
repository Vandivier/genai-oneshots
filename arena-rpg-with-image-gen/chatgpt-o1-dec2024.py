import pygame
import random
import sys

pygame.init()

# Window dimensions
WIDTH, HEIGHT = 800, 600
window = pygame.display.set_mode((WIDTH, HEIGHT))
pygame.display.set_caption("Procedural Arena RPG - Turn-Based Combat")

# --------------------------------------------------------------------------------
# Data and configuration
# --------------------------------------------------------------------------------

RACES = ["Human", "Elf", "Dwarf", "Orc"]
CLASSES = ["Fighter", "Ranger", "Wizard", "Rogue"]

MONSTER_TYPES = ["Beast", "Undead", "Dragonkin", "Insectoid"]

COLOR_PALETTES = [
    {"base": (220,180,140), "secondary": (60,60,60), "accent": (200,30,30)},
    {"base": (100,140,220), "secondary": (80,80,120), "accent": (220,200,60)},
    {"base": (140,220,100), "secondary": (50,100,50), "accent": (220,50,50)},
    {"base": (200,200,200), "secondary": (100,100,100), "accent": (255,215,0)},
]

HAIRSTYLES = ["Hair:Short", "Hair:Long", "Hair:Braid", "Hood"]
FACIAL_FEATURES = ["Eyes:Type1", "Eyes:Type2", "Mouth:Smile", "Mouth:Stern"]
ARMORS = ["Armor:Plate", "Armor:Leather", "Armor:Robe", "Armor:Tunic"]
WEAPONS = ["Sword", "Bow", "Staff", "Dagger"]

MONSTER_FEATURES = ["Horns", "Spikes", "Wings", "Stripes", "Spots"]

BASE_SIZE = (48, 64)
FEATURE_SIZE = (16, 16)

font_small = pygame.font.SysFont(None, 18)
font_medium = pygame.font.SysFont(None, 24)
font_large = pygame.font.SysFont(None, 32)

def random_color_variation(color):
    r, g, b = color
    delta = random.randint(-20, 20)
    nr = max(0, min(255, r + delta))
    ng = max(0, min(255, g + delta))
    nb = max(0, min(255, b + delta))
    return (nr, ng, nb)

def draw_labeled_rect(surface, rect, color, label):
    pygame.draw.rect(surface, color, rect)
    text = font_small.render(label, True, (0,0,0))
    text_rect = text.get_rect(center=(rect[0]+rect[2]//2, rect[1]+rect[3]//2))
    surface.blit(text, text_rect)

def generate_character_surface(race, char_class):
    palette = random.choice(COLOR_PALETTES)

    surf = pygame.Surface((64, 96), pygame.SRCALPHA)

    # Base
    base_rect = (8, 16, BASE_SIZE[0], BASE_SIZE[1])
    draw_labeled_rect(surf, base_rect, palette["base"], race)

    # Facial features
    eyes_label = random.choice([f for f in FACIAL_FEATURES if f.startswith("Eyes")])
    eyes_rect = (12, 28, FEATURE_SIZE[0], FEATURE_SIZE[1])
    draw_labeled_rect(surf, eyes_rect, palette["accent"], eyes_label)

    mouth_label = random.choice([f for f in FACIAL_FEATURES if f.startswith("Mouth")])
    mouth_rect = (12, 46, FEATURE_SIZE[0], FEATURE_SIZE[1])
    draw_labeled_rect(surf, mouth_rect, palette["secondary"], mouth_label)

    # Hair/Hood
    hair_label = random.choice(HAIRSTYLES)
    hair_rect = (8, 4, BASE_SIZE[0], 12)
    draw_labeled_rect(surf, hair_rect, random_color_variation(palette["secondary"]), hair_label)

    # Armor
    armor_label = random.choice(ARMORS)
    armor_rect = (8, 50, BASE_SIZE[0], 30)
    draw_labeled_rect(surf, armor_rect, random_color_variation(palette["secondary"]), armor_label)

    # Weapon
    weapon_label = random.choice(WEAPONS)
    weapon_rect = (0, 30, 8, 24)
    draw_labeled_rect(surf, weapon_rect, random_color_variation(palette["accent"]), weapon_label)

    # Class label
    class_text = font_small.render(char_class, True, (255,255,255))
    surf.blit(class_text, (8, 0))

    return surf

def generate_monster_surface(monster_type):
    palette = random.choice(COLOR_PALETTES)
    surf = pygame.Surface((64, 96), pygame.SRCALPHA)

    # Base silhouette
    base_rect = (8, 16, BASE_SIZE[0], BASE_SIZE[1])
    draw_labeled_rect(surf, base_rect, palette["base"], monster_type)

    # Monster features
    num_features = random.randint(1, 3)
    chosen_features = random.sample(MONSTER_FEATURES, num_features)
    start_y = 4
    for feature in chosen_features:
        f_rect = (8, start_y, FEATURE_SIZE[0], FEATURE_SIZE[1])
        draw_labeled_rect(surf, f_rect, random_color_variation(palette["accent"]), feature)
        start_y += 20

    return surf

def generate_character():
    race = random.choice(RACES)
    char_class = random.choice(CLASSES)

    # For simplicity, assign stats randomly or based on class/race:
    # HP: 70-100, SP:2-5, Attack:5-10, Defense:1-5
    hp = random.randint(70, 100)
    sp = random.randint(2, 5)
    attack = random.randint(5, 10)
    defense = random.randint(1, 5)

    surf = generate_character_surface(race, char_class)

    return {
        "name": f"{race} {char_class}",
        "race": race,
        "class": char_class,
        "hp": hp,
        "sp": sp,
        "attack": attack,
        "defense": defense,
        "image": surf,
        "defending": False
    }

def generate_monster():
    monster_type = random.choice(MONSTER_TYPES)
    hp = random.randint(60, 90)
    sp = 0  # Monster might not use SP in this basic example
    attack = random.randint(4, 8)
    defense = random.randint(1, 4)

    surf = generate_monster_surface(monster_type)

    return {
        "name": monster_type,
        "hp": hp,
        "sp": sp,
        "attack": attack,
        "defense": defense,
        "image": surf,
        "defending": False
    }

def damage_calculation(attacker, defender, skill=False):
    base_damage = attacker["attack"]
    if skill:
        base_damage *= 2  # skill attack is double damage for demonstration

    # If defender is defending, reduce damage further
    damage = base_damage - defender["defense"]
    if defender["defending"]:
        damage = damage // 2

    if damage < 1:
        damage = 1

    return damage

def monster_action(monster, player, message_log):
    # Simple AI: Monster always attacks
    damage = damage_calculation(monster, player)
    player["hp"] -= damage
    message_log.append(f"{monster['name']} attacked {player['name']} for {damage} damage.")

def reset_entities():
    player = generate_character()
    monster = generate_monster()
    return player, monster

def draw_stats(player, monster, message_log):
    # Player Stats
    p_text = f"{player['name']} - HP: {player['hp']} | SP: {player['sp']}"
    player_stats = font_medium.render(p_text, True, (255,255,255))
    window.blit(player_stats, (20, 20))

    # Monster Stats
    m_text = f"{monster['name']} - HP: {monster['hp']}"
    monster_stats = font_medium.render(m_text, True, (255,255,255))
    window.blit(monster_stats, (WIDTH - monster_stats.get_width() - 20, 20))

    # Message log (show last 3 messages)
    y = 60
    for msg in message_log[-3:]:
        line_surf = font_small.render(msg, True, (255,255,255))
        window.blit(line_surf, (20, y))
        y += 20

def main():
    clock = pygame.time.Clock()

    player, monster = reset_entities()
    # Positions
    char_pos = (WIDTH//3 - player["image"].get_width()//2, HEIGHT//2 - player["image"].get_height()//2)
    monster_pos = (2*WIDTH//3 - monster["image"].get_width()//2, HEIGHT//2 - monster["image"].get_height()//2)

    message_log = ["A new challenger appears!", f"You face a {monster['name']}!"]
    player_turn = True  # Player starts

    running = True
    while running:
        # Event Handling
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                running = False
            if event.type == pygame.KEYDOWN:
                # Handle R to reset at any time
                if event.key == pygame.K_r:
                    player, monster = reset_entities()
                    message_log = ["Combat reset!", f"You face a {monster['name']}!"]
                    player_turn = True

                # Handle player actions only if it's the player's turn and the game is not over
                if player_turn and player["hp"] > 0 and monster["hp"] > 0:
                    if event.key == pygame.K_a:
                        # Attack
                        player["defending"] = False
                        dmg = damage_calculation(player, monster)
                        monster["hp"] -= dmg
                        message_log.append(f"{player['name']} attacked {monster['name']} for {dmg} damage.")
                        player_turn = False
                    elif event.key == pygame.K_d:
                        # Defend
                        player["defending"] = True
                        message_log.append(f"{player['name']} is defending.")
                        player_turn = False
                    elif event.key == pygame.K_s:
                        # Skill Attack (if SP > 0)
                        if player["sp"] > 0:
                            player["defending"] = False
                            dmg = damage_calculation(player, monster, skill=True)
                            monster["hp"] -= dmg
                            player["sp"] -= 1
                            message_log.append(f"{player['name']} used a skill attack on {monster['name']} for {dmg} damage!")
                            player_turn = False
                        else:
                            message_log.append("Not enough SP!")


        # Check for end of combat
        if monster["hp"] <= 0:
            # Player wins
            message_log.append(f"{monster['name']} is defeated! You win!")
            # Press R to reset
        elif player["hp"] <= 0:
            # Player loses
            message_log.append(f"{player['name']} has fallen! Game Over.")
            # Press R to reset

        # Monster turn
        if not player_turn and monster["hp"] > 0 and player["hp"] > 0:
            # Monster acts
            monster["defending"] = False
            monster_action(monster, player, message_log)
            player_turn = True

        window.fill((20, 20, 30))
        # Arena floor
        pygame.draw.rect(window, (50, 50, 70), (0, HEIGHT-100, WIDTH, 100))

        # Draw combatants
        window.blit(player["image"], char_pos)
        window.blit(monster["image"], monster_pos)

        draw_stats(player, monster, message_log)

        # If combat ended, show a hint to reset
        if player["hp"] <= 0 or monster["hp"] <= 0:
            end_msg = "Press R to start a new combat."
            end_text = font_large.render(end_msg, True, (255,255,255))
            window.blit(end_text, (WIDTH//2 - end_text.get_width()//2, HEIGHT//2 - end_text.get_height()//2 - 100))

        # Instructions
        instructions = "Player Turn: A = Attack, D = Defend, S = Skill Attack (if SP>0), R = Reset"
        inst_text = font_small.render(instructions, True, (255,255,255))
        window.blit(inst_text, (20, HEIGHT - 30))

        pygame.display.flip()
        clock.tick(30)

    pygame.quit()
    sys.exit()

if __name__ == "__main__":
    main()
