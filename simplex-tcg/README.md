# Simplex War TCG

## Background and Comparison to Traditional War

Simplex War TCG is a card game inspired by the card game [War](https://bicyclecards.com/how-to-play/war). The [simplex](https://en.wikipedia.org/wiki/Simplex_noise) name modifier refers to the concept of simplex noise, a useful tool in procedural generation. Simplex War is intended to be more complex, strategic, and engaging than traditional War while also being simpler than a full-fledged procedurally generated open world RPG.

The game can be understood as War with the following in-order modifications:

1. Each player gets their own deck, instead of one deck being shared.  
2. Players begin by drawing three cards and choosing how to play them, instead of automatically playing a random card, introducing a layer of strategy.  
   1. Cards can be played face-up or face-down.  
   2. Cards attack selectively rather than automatically.  
   3. The player can discard a card to play an additional card, creating interesting tradeoffs from the first round onward.  
3. A field concept is introduced, enabling another level of strategy.  
   1. Cards can be played at close range, long range, or in the remote zone, representing activity far away from the battlefield.  
4. Cards gain special effects depending on their suit, and players can compose decks ranging from a half-deck of 26 cards to a double-deck of 104 cards, enabling further strategic complexity.  
   1. Clubs attack and defend with a power level double their face value and they must be played at close range.  
   2. Spades can be played at long range.  
   3. Hearts can choose to heal instead of attacking.  
   4. Diamonds can attack and defend in the remote zone, and each present diamond card allows the player to draw an extra card at the start of their turn.  
5. Custom cards are introduced, allowing a range of effects which can be triggered in a variety of ways, not merely through the attack phase.  
   1. No deck may have more than two traditional cards. For instance, a valid deck cannot include more than two copies of the Ace of Hearts. There is no such general restriction on custom cards.  
6. Because player choices are interdependent, simultaneous play is no longer feasible and we introduce a high-card mechanic to decide the first mover. To decide who goes first, players shuffle their decks and reveal the top card continuously until all ties are broken. The winner decides whether they will play first.

## Turn Phases

1. Draw Phase: The player draws one card  
2. Preparation Phase:  
   1. The player chooses whether to play or discard any cards  
   2. For each card discarded, the player may choose to play one extra card  
   3. Any card on the field can be flipped once  
3. Battle Phase: The player chooses whether any face-up cards will attack  
   1. When a card attacks a card with a lower power level, the weaker card is destroyed.  
   2. Close-range units guard long-range units. A close-range unit can attack a long-range unit if and only if the opponent has no close-range cards on the battlefield.  
   3. When a long-range unit attacks a short-range unit, it cannot be destroyed by ordinary combat. Special effects or game conditions may modify this behavior.  
   4. When attacking an opponent with an empty battlefield, the defender must discard the top card of their deck.  
4. End Phase: Some cards have post-battle effects. The player can activate these if possible and otherwise declare their turn to be over.

## Victory Condition

The game ends when either player has no cards on the battlefield or in their deck. Cards in the hand, discard pile, or played in the remote zone are ignored for a determination of victory.
