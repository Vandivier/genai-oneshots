# Simplex War TCG Implementation Plan (Vercel + Supabase Realtime)

## Phase 1: Core Game Logic Definition & Supabase Schema

1. **Define Data Structures (as Postgres Tables in Supabase):**
    * `games`: Stores active game session details (`id`, `current_turn_player_id` (references `auth.users` or a `profiles` table), `turn_phase` (e.g., "DRAW", "PREPARATION", "BATTLE", "END"), `status` (e.g., 'lobby', 'active', 'finished'), `winner_id` (references `auth.users` or `profiles` table), `created_at`, `updated_at`).
    * `game_players`: Links users to games and stores player-specific game state (`id`, `game_id` (references `games`), `user_id` (references `auth.users` or a `profiles` table), `player_order` (e.g., 1 or 2 for turn order), `health` (if applicable, or handled by card presence)).
    * `player_cards`: Manages cards in all locations for all players in a game.
        * `id`: Unique ID for this instance of a card in a game.
        * `game_id`: (references `games`).
        * `owner_player_id`: (references `game_players` `id` or `user_id` directly).
        * `card_definition_id`: (references `card_definitions`).
        * `current_location`: Enum/Text (e.g., 'deck', 'hand', 'discard', 'field_close', 'field_long', 'field_remote').
        * `is_face_up`: Boolean.
        * `location_index`: Integer (for ordering in hand or on field if necessary).
        * `current_power`: Integer (can be modified by effects).
    * `card_definitions`: Master list of all possible cards.
        * `id`: Unique ID for a type of card (e.g., "ace_of_spades", "custom_fireball").
        * `name`: Text (e.g., "Ace of Spades", "Fireball Scroll").
        * `suit`: Enum/Text (e.g., 'CLUBS', 'SPADES', 'HEARTS', 'DIAMONDS', 'CUSTOM').
        * `rank`: Text (e.g., 'A', 'K', 'Q', 'J', '10', ..., '2', or custom rank).
        * `base_power`: Integer.
        * `description`: Text (for rules and special effects).
        * `image_url`: Text (optional).
        * `rules_metadata`: JSONB (to store structured rule information like range restrictions, effect triggers, etc.).
            * Example: `{"range": "close", "onPlayEffect": "draw_card", "attackModifier": "double_power_if_club"}`
    * `game_log`: Records key game events for replay or display.
        * `id`: Unique log entry ID.
        * `game_id`: (references `games`).
        * `timestamp`: Timestamp of the event.
        * `event_type`: Text (e.g., "CARD_PLAYED", "ATTACK", "CARD_DESTROYED", "TURN_ENDED").
        * `event_details`: JSONB (e.g., `{ "player_id": "...", "card_id": "...", "target_card_id": "..." }`).
    * `profiles`: (Recommended, to augment `auth.users`)
        * `user_id`: (references `auth.users`, primary key).
        * `username`: Text.
        * `elo_rating`: Integer (optional for future).
    * _Plan and implement Row Level Security (RLS) for all tables to ensure players can only see and modify data relevant to them and their games._

2. **Outline Core Game Mechanics to be Implemented in Supabase Edge Functions:**
    * **`create_game(opponent_user_id)`:**
        * Called by a player to initiate a game with another.
        * Creates a new entry in `games` table with status 'lobby'.
        * Creates two entries in `game_players` linking both players to the game.
        * Returns the `game_id`.
    * **`join_game(game_id)`:**
        * Called by the opponent to accept. (Or auto-join if not needed).
    * **`initialize_game_state(game_id)`:**
        * Can be called after players are confirmed or as part of `create_game` if playing with predefined decks.
        * Populates `player_cards` for each player's deck based on chosen/default decks from `card_definitions`.
        * Implements high-card draw:
            * Each player reveals top card from their `player_cards` (deck location).
            * Update `games` table with `current_turn_player_id` based on winner.
        * Deals initial 3 cards to each player (updates `player_cards` location to 'hand').
        * Sets `games` status to 'active' and `turn_phase` to 'DRAW' for the first player.
    * **`player_action(game_id, action_type, payload)`:** This is the main Edge Function for in-game moves.
        * `action_type`: Enum/Text (e.g., 'DRAW_PHASE_DRAW', 'PREP_PLAY_CARD', 'PREP_DISCARD_CARD', 'PREP_FLIP_CARD', 'BATTLE_DECLARE_ATTACK', 'BATTLE_HEAL', 'END_TURN').
        * `payload`: JSONB (e.g., `{ "card_id": "...", "target_zone": "...", "target_card_id": "..." }`).
        * **Common Logic:**
            * Verify it's the calling player's turn (`games.current_turn_player_id`).
            * Verify current game phase (`games.turn_phase`) allows the action.
            * Fetch current game state (relevant `player_cards`, `game_players`, `games` entry).
        * **Specific Action Logic:**
            * **'DRAW_PHASE_DRAW'**: Move card(s) from 'deck' to 'hand' for the current player (consider Diamond bonus). Transition to 'PREPARATION' phase.
            * **'PREP_PLAY_CARD'**: Move `card_id` from 'hand' to `target_zone` ('field_close', 'field_long', 'field_remote'). Set `is_face_up` based on `payload`. Apply card-specific rules from `card_definitions.rules_metadata`.
            * **'PREP_DISCARD_CARD'**: Move `card_id` from 'hand' to 'discard'. Grant player an "extra play token" (managed in `game_players` or `games` state).
            * **'PREP_FLIP_CARD'**: Toggle `is_face_up` for `card_id` on the field. (Ensure only one flip per turn as per rules).
            * **'BATTLE_DECLARE_ATTACK'**:
                * Validate attacker and defender `card_id`.
                * Check range rules (close guards long, long vs short immunity).
                * Compare `current_power`.
                * Update `player_cards` (move loser to 'discard').
                * If defender's field empty, move card from their 'deck' to 'discard'.
            * **'BATTLE_HEAL'**: (For Hearts) Implement healing logic (details TBD - e.g., restore a card from discard? Prevent destruction?).
            * **'END_TURN'**:
                * Trigger any "End Phase" effects.
                * Check victory conditions (no cards on battlefield or deck for opponent). If so, update `games.status` and `games.winner_id`.
                * Update `games.current_turn_player_id` to the next player.
                * Update `games.turn_phase` to 'DRAW'.
        * **After any state change:** All updates to Postgres tables will trigger Supabase Realtime.

## Phase 2: Backend (Supabase) & Frontend Foundation

3. **Set up Supabase Project:**
    * Create a new Supabase project.
    * Enable Supabase Authentication. Configure providers (e.g., email/password).
    * Define the Postgres schema (tables from Phase 1) in the Supabase dashboard or via migrations.
    * Implement Row Level Security (RLS) policies meticulously.
    * Enable Supabase Realtime for `games`, `game_players`, and `player_cards` tables (and `game_log` if live updates are desired).
4. **Develop and Deploy Supabase Edge Functions:**
    * Set up the Supabase CLI.
    * Write the TypeScript/JavaScript code for the Edge Functions (`create_game`, `initialize_game_state`, `player_action`) outlined in Phase 1.
    * Test functions locally.
    * Deploy functions to Supabase.
5. **Set up Frontend Project (e.g., React with Next.js for Vercel):**
    * `npx create-next-app simplex-tcg-app`
    * Install Supabase client library: `npm install @supabase/supabase-js`
    * Set up basic project structure (components, pages, styles).
    * Configure environment variables for Supabase URL and anon key.

## Phase 3: Frontend (Client-Side) Implementation

6. **Implement User Authentication Flow:**
    * Create pages/components for Sign Up, Login, Logout using `supabase-js`.
    * Protect routes/features that require authentication.
    * Display user information from `profiles` table.
7. **Game Lobby and Initialization:**
    * UI for players to see available games or initiate new ones (calling `create_game` Edge Function).
    * UI for joining a game.
    * Once a game is joined/ready, call `initialize_game_state` (if not handled by `create_game`).
8. **Implement Realtime Subscriptions using `supabase-js`:**
    * On the game board page, subscribe to changes on the `games` table for the current `game_id`.
    * Subscribe to changes on `game_players` table for the current `game_id`.
    * Subscribe to changes on `player_cards` table, filtered for the current `game_id`.
    * Subscribe to `game_log` for displaying game events.
9. **Develop UI Components for Gameplay:**
    * `CardView`: Renders a card (face-up/down, suit, rank, power, effects).
    * `PlayerHandView`: Displays the current player's hand.
    * `FieldZoneView`: Displays cards in `field_close`, `field_long`, `field_remote` for both players.
    * `DeckView` & `DiscardPileView`: Show card counts, maybe top card.
    * `GameInfoPanel`: Displays current player, turn phase, game log messages, prompts for actions.
    * `ActionButtons`: Contextual buttons for "Play Card," "Attack," "Heal," "Flip Card," "End Turn," etc.
10. **Frontend Game Logic & Interaction:**
    * When UI components receive new data from Supabase Realtime subscriptions, re-render to reflect the current state.
    * Handle user interactions (clicking cards, buttons).
    * On user action, call the main `player_action` Supabase Edge Function with the appropriate `action_type` and `payload`.
    * Provide clear visual feedback for actions, card movements, and state changes.
    * Implement client-side validation for user inputs where helpful (though authoritative validation is in Edge Functions).
11. **Implement Game Rules Display & Card Effects Visibility:**
    * Ensure card descriptions and effects are clearly visible.
    * Provide a way for players to understand the active effects and rules (e.g., tooltips, highlighted text).

## Phase 4: Initial Game Flow, Polish & Deployment

12. **Complete Game Start-to-Finish Flow:**
    * Ensure a full game can be played from setup, through all phases, to victory condition.
13. **Basic Deck Management (if not using fixed decks initially):**
    * Simple UI for players to view standard deck compositions. (Full custom deck builder is a later phase).
14. **Styling and UX:**
    * Apply CSS to make the game visually appealing.
    * Ensure the user experience is intuitive.
    * Add animations/transitions for better feel.
15. **Testing:**
    * Test Edge Function logic thoroughly.
    * Test frontend interactions and Realtime updates.
    * Test RLS policies.
    * Play through many game scenarios.
16. **Deployment to Vercel:**
    * Connect GitHub repository to Vercel.
    * Configure Vercel environment variables for Supabase.
    * Deploy!

## Phase 5: Expansion (Post-MVP)

17. **Custom Card Implementation:**
    * Expand `card_definitions.rules_metadata` to support a wider variety of effects.
    * Update `player_action` Edge Function to interpret and execute these new effects.
18. **Deck Builder UI:**
    * Allow players to create and save custom decks to their `profiles` or a new `user_decks` table.
    * Ensure deck validation rules (size limits, 2-of-traditional-card rule) are enforced.
19. **AI Opponent (Optional):**
    * If desired, create Edge Functions that simulate player actions for an AI.
20. **Advanced Features:**
    * Player accounts (profiles, avatars).
    * Persistent stats and ELO/leaderboards.
    * Spectator mode.
    * Chat.
    * More sophisticated game log/replay system.
