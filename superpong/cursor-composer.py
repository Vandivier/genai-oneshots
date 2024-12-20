import pygame
import sys
import random

# Initialize Pygame
pygame.init()

# Constants
WIDTH, HEIGHT = 800, 600
BALL_RADIUS = 15
PADDLE_WIDTH, PADDLE_HEIGHT = 10, 100
PADDLE_SPEED = 5
BALL_SPEED_X, BALL_SPEED_Y = 5, 5
FONT_SIZE = 36
WINNING_SCORE = 5
POWERUP_SIZE = 20
POWERUP_SPAWN_TIME = 5000  # milliseconds

# Colors
WHITE = (255, 255, 255)
BLACK = (0, 0, 0)
GRAY = (100, 100, 100)
RED = (255, 0, 0)

# Set up the display
screen = pygame.display.set_mode((WIDTH, HEIGHT))
pygame.display.set_caption('Pong')

# Font
font = pygame.font.Font(None, FONT_SIZE)

def draw_text(text, font, color, surface, x, y):
    textobj = font.render(text, True, color)
    textrect = textobj.get_rect()
    textrect.topleft = (x, y)
    surface.blit(textobj, textrect)

def game_over_screen(winner):
    screen.fill(BLACK)
    game_over_text = "Game Over"
    winner_text = f"{winner} Wins!"
    draw_text(game_over_text, font, WHITE, screen, WIDTH // 2 - 100, HEIGHT // 2 - 50)
    draw_text(winner_text, font, WHITE, screen, WIDTH // 2 - 100, HEIGHT // 2)
    
    # Draw buttons
    restart_button = pygame.Rect(WIDTH // 2 - 100, HEIGHT // 2 + 50, 200, 50)
    exit_button = pygame.Rect(WIDTH // 2 - 100, HEIGHT // 2 + 120, 200, 50)
    pygame.draw.rect(screen, GRAY, restart_button)
    pygame.draw.rect(screen, GRAY, exit_button)
    draw_text("Restart", font, WHITE, screen, WIDTH // 2 - 50, HEIGHT // 2 + 60)
    draw_text("Exit Game", font, WHITE, screen, WIDTH // 2 - 70, HEIGHT // 2 + 130)
    
    pygame.display.flip()
    
    while True:
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                pygame.quit()
                sys.exit()
            if event.type == pygame.MOUSEBUTTONDOWN:
                if restart_button.collidepoint(event.pos):
                    return True
                if exit_button.collidepoint(event.pos):
                    pygame.quit()
                    sys.exit()

# Main game loop
def main():
    global BALL_SPEED_X, BALL_SPEED_Y
    ball = pygame.Rect(WIDTH // 2 - BALL_RADIUS, HEIGHT // 2 - BALL_RADIUS, BALL_RADIUS * 2, BALL_RADIUS * 2)
    player_paddle = pygame.Rect(WIDTH - PADDLE_WIDTH - 20, HEIGHT // 2 - PADDLE_HEIGHT // 2, PADDLE_WIDTH, PADDLE_HEIGHT)
    opponent_paddle = pygame.Rect(20, HEIGHT // 2 - PADDLE_HEIGHT // 2, PADDLE_WIDTH, PADDLE_HEIGHT)
    
    player_score = 0
    opponent_score = 0
    
    powerup = None
    powerup_timer = pygame.USEREVENT + 1
    pygame.time.set_timer(powerup_timer, POWERUP_SPAWN_TIME)
    
    clock = pygame.time.Clock()
    running = True
    while running:
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                pygame.quit()
                sys.exit()
            if event.type == powerup_timer:
                if not powerup:
                    powerup_x = random.randint(50, WIDTH - 50)
                    powerup_y = random.randint(50, HEIGHT - 50)
                    powerup = pygame.Rect(powerup_x, powerup_y, POWERUP_SIZE, POWERUP_SIZE)

        # Ball movement
        ball.x += BALL_SPEED_X
        ball.y += BALL_SPEED_Y

        # Ball collision with top and bottom
        if ball.top <= 0 or ball.bottom >= HEIGHT:
            BALL_SPEED_Y *= -1

        # Ball collision with paddles
        if ball.colliderect(player_paddle) or ball.colliderect(opponent_paddle):
            BALL_SPEED_X *= -1

        # Ball out of bounds
        if ball.left <= 0:
            player_score += 1
            ball.x, ball.y = WIDTH // 2 - BALL_RADIUS, HEIGHT // 2 - BALL_RADIUS
            BALL_SPEED_X *= -1
        if ball.right >= WIDTH:
            opponent_score += 1
            ball.x, ball.y = WIDTH // 2 - BALL_RADIUS, HEIGHT // 2 - BALL_RADIUS
            BALL_SPEED_X *= -1

        # Check for game over
        if player_score == WINNING_SCORE or opponent_score == WINNING_SCORE:
            winner = "Player" if player_score == WINNING_SCORE else "Opponent"
            if game_over_screen(winner):
                main()
            else:
                running = False

        # Player paddle movement
        keys = pygame.key.get_pressed()
        if keys[pygame.K_UP] and player_paddle.top > 0:
            player_paddle.y -= PADDLE_SPEED
        if keys[pygame.K_DOWN] and player_paddle.bottom < HEIGHT:
            player_paddle.y += PADDLE_SPEED

        # Opponent paddle movement (simple AI)
        if opponent_paddle.centery < ball.centery:
            opponent_paddle.y += PADDLE_SPEED
        if opponent_paddle.centery > ball.centery:
            opponent_paddle.y -= PADDLE_SPEED

        # Check for powerup collision
        if powerup and ball.colliderect(powerup):
            BALL_SPEED_X *= 1.5
            BALL_SPEED_Y *= 1.5
            powerup = None

        # Fill the screen with black
        screen.fill(BLACK)

        # Draw the ball and paddles
        pygame.draw.ellipse(screen, WHITE, ball)
        pygame.draw.rect(screen, WHITE, player_paddle)
        pygame.draw.rect(screen, WHITE, opponent_paddle)

        # Draw the scores
        player_text = font.render(f"{player_score}", True, WHITE)
        opponent_text = font.render(f"{opponent_score}", True, WHITE)
        target_score_text = font.render(f"Target Score: {WINNING_SCORE}", True, WHITE)
        screen.blit(player_text, (WIDTH - 50, 10))
        screen.blit(opponent_text, (30, 10))
        screen.blit(target_score_text, (WIDTH // 2 - 100, 10))

        # Draw the powerup
        if powerup:
            pygame.draw.rect(screen, RED, powerup)

        # Update the display
        pygame.display.flip()
        clock.tick(60)

main()