import Phaser from "phaser";
import { WorldGenerator } from "../services/WorldGenerator";
import type {
  WorldGenerationParams,
  TileData,
} from "../services/WorldGenerator";

export class GameScene extends Phaser.Scene {
  private player: Phaser.Physics.Arcade.Sprite | undefined;
  private cursors: Phaser.Types.Input.Keyboard.CursorKeys | undefined;
  private tilemap: Phaser.Tilemaps.Tilemap | undefined;

  // Define tile names as constants corresponding to PreloaderScene texture keys
  private static readonly TILE_SIZE = 32;
  private static readonly TILE_WATER = "tile_water";
  private static readonly TILE_LAND = "tile_land";
  private static readonly TILE_GRASS = "tile_grass";
  private static readonly TILE_FOREST = "tile_forest";
  private static readonly TILE_HILLS = "tile_hills";
  private static readonly TILE_MOUNTAINS = "tile_mountains";
  private static readonly TILE_ROAD = "tile_road"; // Though not procedurally generated yet

  // Map dimensions in tiles
  private static readonly MAP_WIDTH_TILES = 100;
  private static readonly MAP_HEIGHT_TILES = 100;

  constructor() {
    super("GameScene");
  }

  preload() {
    console.log("GameScene: preload");
    // Assets like player sprite would be loaded here or in PreloaderScene
    // For now, PreloaderScene handles tile texture generation.
  }

  create() {
    console.log("GameScene: create");

    // 1. World Generation
    const worldGenParams: WorldGenerationParams = {
      width: GameScene.MAP_WIDTH_TILES,
      height: GameScene.MAP_HEIGHT_TILES,
      seed: "king bananu", // Themed seed!
      scale: 60, // Larger scale = larger features
      octaves: 4,
      persistence: 0.5,
      lacunarity: 2.0,
      waterThreshold: 0.3, // < 0.3 is water
      landThreshold: 0.38, // 0.3 to 0.38 is land (beaches/barren)
      grassThreshold: 0.6, // 0.38 to 0.6 is grass
      hillsThreshold: 0.8, // 0.6 to 0.8 is hills
      // > 0.8 is mountains
      forestScale: 30, // Scale for forest feature noise
      forestThreshold: 0.4, // Lower values = more forests on suitable land/grass
    };
    const generator = new WorldGenerator(worldGenParams);
    const worldData: TileData[][] = generator.generateWorld();

    // SANITY CHECKS for worldData
    console.log(
      `WorldGenerator returned worldData. Expected dimensions: ${GameScene.MAP_HEIGHT_TILES}x${GameScene.MAP_WIDTH_TILES}`
    );
    if (!worldData) {
      console.error("worldData is null or undefined!");
      return;
    }
    console.log(`Actual worldData rows: ${worldData.length}`);
    if (worldData.length > 0) {
      console.log(
        `Actual worldData columns in first row: ${
          worldData[0] ? worldData[0].length : "N/A (first row undefined)"
        }`
      );
      // Check a sample point
      if (worldData[0] && worldData[0][0]) {
        console.log("Sample worldData[0][0]:", JSON.stringify(worldData[0][0]));
      } else {
        console.error("worldData[0][0] is not accessible.");
      }
    } else {
      console.error("worldData has no rows.");
      return; // Stop if worldData is empty
    }
    if (
      worldData.length !== GameScene.MAP_HEIGHT_TILES ||
      (worldData.length > 0 &&
        worldData[0].length !== GameScene.MAP_WIDTH_TILES)
    ) {
      console.error("CRITICAL: worldData dimensions mismatch!");
      // Potentially return here or handle error, as loops below will fail
    }

    // 2. Create Tilemap from generated data
    this.tilemap = this.make.tilemap({
      tileWidth: GameScene.TILE_SIZE,
      tileHeight: GameScene.TILE_SIZE,
      width: GameScene.MAP_WIDTH_TILES,
      height: GameScene.MAP_HEIGHT_TILES,
    });

    if (!this.tilemap) {
      console.error("Failed to create tilemap object!");
      return;
    }

    // Add each texture as an individual tileset to the Tilsemap object.
    // The name of the tileset will be the same as the texture key.
    this.tilemap.addTilesetImage(
      GameScene.TILE_WATER,
      GameScene.TILE_WATER,
      GameScene.TILE_SIZE,
      GameScene.TILE_SIZE,
      0,
      0,
      0
    ); // GID for TILE_WATER will start at 0+1=1
    this.tilemap.addTilesetImage(
      GameScene.TILE_LAND,
      GameScene.TILE_LAND,
      GameScene.TILE_SIZE,
      GameScene.TILE_SIZE,
      0,
      0,
      1
    ); // GID for TILE_LAND will start at 1+1=2
    this.tilemap.addTilesetImage(
      GameScene.TILE_GRASS,
      GameScene.TILE_GRASS,
      GameScene.TILE_SIZE,
      GameScene.TILE_SIZE,
      0,
      0,
      2
    ); // GID for TILE_GRASS will start at 2+1=3
    this.tilemap.addTilesetImage(
      GameScene.TILE_FOREST,
      GameScene.TILE_FOREST,
      GameScene.TILE_SIZE,
      GameScene.TILE_SIZE,
      0,
      0,
      3
    ); // GID for TILE_FOREST will start at 3+1=4
    this.tilemap.addTilesetImage(
      GameScene.TILE_HILLS,
      GameScene.TILE_HILLS,
      GameScene.TILE_SIZE,
      GameScene.TILE_SIZE,
      0,
      0,
      4
    ); // GID for TILE_HILLS will start at 4+1=5
    this.tilemap.addTilesetImage(
      GameScene.TILE_MOUNTAINS,
      GameScene.TILE_MOUNTAINS,
      GameScene.TILE_SIZE,
      GameScene.TILE_SIZE,
      0,
      0,
      5
    ); // GID for TILE_MOUNTAINS will start at 5+1=6
    this.tilemap.addTilesetImage(
      GameScene.TILE_ROAD,
      GameScene.TILE_ROAD,
      GameScene.TILE_SIZE,
      GameScene.TILE_SIZE,
      0,
      0,
      6
    ); // GID for TILE_ROAD will start at 6+1=7
    // NOTE: The 7th arg (firstgid) for addTilesetImage is the GID. Phaser GIDs are 1-indexed.
    // So, if worldData[y][x].tileIndex is 0 (water), we need to putTileAt(1, ...)
    // If worldData[y][x].tileIndex is 1 (land), we need to putTileAt(2, ...)
    // etc.

    // Create the layer. The array of texture keys tells the layer which tilesets to use.
    const layer = this.tilemap.createBlankLayer("worldLayer", [
      GameScene.TILE_WATER,
      GameScene.TILE_LAND,
      GameScene.TILE_GRASS,
      GameScene.TILE_FOREST,
      GameScene.TILE_HILLS,
      GameScene.TILE_MOUNTAINS,
      GameScene.TILE_ROAD,
    ]);

    if (!layer) {
      console.error("Failed to create tilemap layer!");
      return;
    }

    console.log("Attempting to populate tilemap layer...");
    for (let y = 0; y < GameScene.MAP_HEIGHT_TILES; y++) {
      for (let x = 0; x < GameScene.MAP_WIDTH_TILES; x++) {
        if (!worldData[y] || worldData[y][x] === undefined) {
          console.error(
            `Data error: worldData[${y}][${x}] is undefined before putTileAt! Skipping.`
          );
          continue;
        }
        // Adjust tileIndex to be 1-based for GID
        const gid = worldData[y][x].tileIndex + 1;
        layer.putTileAt(gid, x, y);
      }
    }
    console.log("Finished populating tilemap layer.");

    // Collision: GIDs for water(1), hills(5), mountains(6), road(7) are collidable.
    // Walkable GIDs: land(2), grass(3), forest(4).
    layer.setCollision([1, 5, 6, 7]);

    // 3. Player Setup
    // Find a walkable tile to place the player
    let startPos = this.findWalkableTile(worldData);
    if (!startPos) {
      console.warn(
        "No walkable tile found for player start! Placing at default."
      );
      startPos = {
        x: (GameScene.MAP_WIDTH_TILES / 2) * GameScene.TILE_SIZE,
        y: (GameScene.MAP_HEIGHT_TILES / 2) * GameScene.TILE_SIZE,
      };
    }

    this.player = this.physics.add.sprite(
      startPos.x,
      startPos.y,
      "player-placeholder"
    );
    if (!this.textures.exists("player-placeholder")) {
      const graphics = this.add.graphics();
      graphics.fillStyle(0xff0000, 1); // Red for visibility
      graphics.fillRect(
        0,
        0,
        GameScene.TILE_SIZE * 0.8,
        GameScene.TILE_SIZE * 0.8
      );
      graphics.generateTexture(
        "player-placeholder",
        Math.floor(GameScene.TILE_SIZE * 0.8),
        Math.floor(GameScene.TILE_SIZE * 0.8)
      );
      graphics.destroy();
      this.player.setTexture("player-placeholder");
    }
    this.player.setCollideWorldBounds(true);
    this.physics.add.collider(this.player, layer); // Add collision between player and world layer

    // 4. Camera and World Bounds Setup
    const mapPixelWidth = GameScene.MAP_WIDTH_TILES * GameScene.TILE_SIZE;
    const mapPixelHeight = GameScene.MAP_HEIGHT_TILES * GameScene.TILE_SIZE;

    this.cameras.main.setBounds(0, 0, mapPixelWidth, mapPixelHeight);
    this.physics.world.setBounds(0, 0, mapPixelWidth, mapPixelHeight);
    this.cameras.main.startFollow(this.player, true, 0.08, 0.08);

    // 5. Input
    this.cursors = this.input.keyboard?.createCursorKeys();
    this.input.keyboard?.on("keydown-ESC", () => {
      this.scene.start("MainMenuScene");
    });

    // UI Text
    this.add
      .text(10, 10, "GameScene - Procedural World", {
        font: "16px Arial",
        color: "#ffffff",
      })
      .setScrollFactor(0);
    this.add
      .text(10, this.cameras.main.height - 60, "Controls: Arrow Keys to Move", {
        font: "14px Arial",
        color: "#ffffff",
      })
      .setScrollFactor(0);
    this.add
      .text(10, this.cameras.main.height - 40, "ESC: Main Menu", {
        font: "14px Arial",
        color: "#ffffff",
      })
      .setScrollFactor(0);
  }

  private findWalkableTile(
    worldData: TileData[][]
  ): { x: number; y: number } | null {
    const walkableTileIndices = [1, 2, 3]; // Land (0-idx 1), Grass (0-idx 2), Forest (0-idx 3)
    for (let i = 0; i < 100; i++) {
      // Try 100 times to find a random spot
      const y = Phaser.Math.Between(0, GameScene.MAP_HEIGHT_TILES - 1);
      const x = Phaser.Math.Between(0, GameScene.MAP_WIDTH_TILES - 1);
      if (walkableTileIndices.includes(worldData[y][x].tileIndex)) {
        return {
          x: x * GameScene.TILE_SIZE + GameScene.TILE_SIZE / 2,
          y: y * GameScene.TILE_SIZE + GameScene.TILE_SIZE / 2,
        };
      }
    }
    // Fallback: scan from center
    for (
      let r = 0;
      r < Math.max(GameScene.MAP_WIDTH_TILES, GameScene.MAP_HEIGHT_TILES) / 2;
      r++
    ) {
      for (
        let y = Math.floor(GameScene.MAP_HEIGHT_TILES / 2) - r;
        y <= Math.floor(GameScene.MAP_HEIGHT_TILES / 2) + r;
        y++
      ) {
        for (
          let x = Math.floor(GameScene.MAP_WIDTH_TILES / 2) - r;
          x <= Math.floor(GameScene.MAP_WIDTH_TILES / 2) + r;
          x++
        ) {
          if (
            y >= 0 &&
            y < GameScene.MAP_HEIGHT_TILES &&
            x >= 0 &&
            x < GameScene.MAP_WIDTH_TILES
          ) {
            if (walkableTileIndices.includes(worldData[y][x].tileIndex)) {
              return {
                x: x * GameScene.TILE_SIZE + GameScene.TILE_SIZE / 2,
                y: y * GameScene.TILE_SIZE + GameScene.TILE_SIZE / 2,
              };
            }
          }
        }
      }
    }
    return null; // Should be rare if map has walkable areas
  }

  update(time: number, delta: number) {
    if (!this.player || !this.cursors) {
      return;
    }

    const speed = 160;
    this.player.setVelocity(0);

    if (this.cursors.left?.isDown) {
      this.player.setVelocityX(-speed);
    } else if (this.cursors.right?.isDown) {
      this.player.setVelocityX(speed);
    }

    if (this.cursors.up?.isDown) {
      this.player.setVelocityY(-speed);
    } else if (this.cursors.down?.isDown) {
      this.player.setVelocityY(speed);
    }
  }
}
