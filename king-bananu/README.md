# King Bananu RPG README

This oneshot attempt was initialized in May 2025 with a goal of understanding whether Rosebud, a game-focused vibe coding tool, could enable rapid game development.

## Learnings

1. Phaser 4 isn't ready yet
2. simplex-noise package worked very well!
3. Rosebud was good at "hey I just uploaded this spearman image from chatgpt can you flash it on screen when a spearman class attacks" a la fire emblem. rosebud was also good at sound and visual effect generation (eg flames and sparks) in FPS and TTRPG POCs.
4. Cursor with Gemini 2.5 pro obliterated lovable + Rosebud for the 2d RPG development case
5. Rosebud did pretty well with 3d FPS, so genre matters
6. spriteless maps got pretty far on lovable - using css tiles + emojis. in fact, you could probably go ahead and make a game this way if you want.
7. seeded random everything totally works
8. multi-stage worldbuilding seemed to work best:
    1. generate base geography with simplex noise in one pass
    2. then add procedurally generated or spawned special stuff like cities in a second pass.
    3. You can allocate or swap-in premade cities, NPCs, and so on as you go through the procedural generation step. Eg if you have a special dwarven mountain kingdom and one is generated, you can use the premade one instead of the random one. This "generate and replace" logic works well here because you should have "generate and validate" anyway so you will multipass for each inserted cell following this logic.
9. pygame in the browser is still a no-go
10. lots of people online said they want to help vibe code a game but 0% of them contributed or even tried out the game

## Open Questions

1. Should we split out the rendering engine from the game engine? Will Phaser 4 take care of everything or are we better off using Three.js, d3.js, or pixi.js, which focus on rendering, and handle game logic ourselves?
2. Dreamlab could help: <https://dreamlab.gg/>

## Resources

Next time, wwe might want to make use of some of these:

1. <https://chatgpt.com/share/682a60ce-ecfc-800d-a922-6fe3e1e1931d>
2. <https://www.mapeditor.org/> or <https://phaser.io/editor>
3. Phaser 4
