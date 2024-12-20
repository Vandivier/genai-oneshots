
# app generation seed instructions

You are tasked with building the classic arcade game Pong using JavaScript and the Phaser 3 game framework. The game should have the following features:

Game Setup:

The game canvas should be 800 pixels wide and 600 pixels high.

The background should be black.

Use Arcade physics for the game.

Game Elements:

Paddles:

Two vertical paddles, one on the left and one on the right side of the screen.

Each paddle should be a white rectangle, 20 pixels wide and 100 pixels high.

The left paddle should be positioned at x = 50, and the right paddle at x = 750.

Paddles should be static/immovable when colliding with the ball.

Paddles should not move off-screen.

Ball:

A white circle with a radius of 10 pixels.

The ball should start at the center of the canvas (x = 400, y = 300).

The ball should have an initial velocity (e.g., 200 in the x direction, and a random value between -100 to 100 in the y direction).

The ball should bounce off the top and bottom walls with a perfect bounce (no loss of energy).

Score:

Display the score for each player at the top of the screen.

The left player's score should be displayed on the left side, and the right player's score on the right.

Use a white, 32-pixel font to display the score.

Game Logic:

Player Control:

Player 1 (left paddle) should be controlled using the 'W' (up) and 'S' (down) keys.

Player 2 (right paddle) should be controlled using the Up Arrow (up) and Down Arrow (down) keys.

Paddle Movement:

When a player presses their up key, the corresponding paddle should move up with a constant velocity (e.g., 300).

When a player presses their down key, the paddle should move down with the same velocity.

When no movement key is pressed, the paddle should stop.

Collision Detection:

Implement collisions between the ball and the paddles.

When the ball hits a paddle:

Increase the ball's horizontal speed slightly (e.g., by 5%).

Add a small amount of vertical "spin" to the ball based on where it hits the paddle (the further from the center, the more spin).

Scoring:

When the ball goes past the left edge of the screen, the right player scores a point.

When the ball goes past the right edge of the screen, the left player scores a point.

Update the score display after each point.

Ball Reset:

After a point is scored, reset the ball to the center of the screen.

Give the ball a new random velocity, with the horizontal direction determined randomly (either left or right).

Code Structure:

Organize your code using Phaser's scene methods: preload, create, and update.

You do not need to preload any external assets; create the paddles and ball using Phaser's built-in graphics functions.

Additional Notes:

Provide the complete HTML and JavaScript code necessary to run the game.

You can use this CDN link for Phaser 3: <https://cdn.jsdelivr.net/npm/phaser@3.55.2/dist/phaser.min.js>

Make the game playable directly in a web browser.

Prioritize accurate game logic and collision detection.

How this Prompt Helps:

Clear Requirements: It clearly outlines the visual and functional requirements of the game.

Specific Details: It provides specific dimensions, colors, positions, and behaviors.

Phaser 3 Guidance: It explicitly mentions Phaser 3 and its scene methods.

Game Logic Breakdown: It breaks down the game logic into manageable steps (player control, collisions, scoring, etc.).

CDN Link: Provides a direct link to the Phaser library.

This prompt is well-structured to guide another AI language model in creating a functional Pong game that closely matches your original implementation. Remember that you might need to make minor adjustments or provide further clarification depending on the specific AI model you use.

# step 2: end screen instructions

Add the following:

1. add the ability to score points when the ball goes past the left or right edge of the screen
2. give the non-player-character some AI movement logic
3. display a target score
4. once a player reaches the target score, show a Game Over screen with the winner name and a restart button
