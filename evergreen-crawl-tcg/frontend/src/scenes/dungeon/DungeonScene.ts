import Phaser from "phaser";
import { Cell, CellType } from "./types";
import { CELL_COLORS, CELL_SIZE, GRID_SIZE } from "./constants";
import { initializeGrid, updateVisibility } from "./grid";
import {
  handleCombat,
  handleShrine,
  handleTrap,
  handleTreasure,
} from "./handlers";
import { loadAssets } from "./assets";
import { createPlayer, setupPlayerInput, movePlayer } from "./player";
import { playDescendingFootsteps, setupAudio } from "./audio";
import { gameAPI } from "../../services/api";

// Define depths as a constant at module level
const DEPTHS = {
  GRID: 0,
  CELLS: 1,
  FOG: 2,
  PLAYER: 3,
} as const;

export class DungeonScene extends Phaser.Scene {
  private player!: Phaser.GameObjects.Container;
  private cells: Cell[][] = [];
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private canMove: boolean = true;
  private playerId: number;

  constructor(config: { playerId: number }) {
    super({ key: "DungeonScene" });
    this.playerId = config.playerId;
  }

  preload() {
    loadAssets(this);
  }

  async create() {
    try {
      // Start a new dungeon instance on the server
      await gameAPI.startDungeon(this.playerId);

      // Get initial game state
      const gameState = await gameAPI.getGameState(this.playerId);

      // Initialize grid with server data
      if (gameState.active_dungeon) {
        this.cells = initializeGrid();
        this.createGrid();

        // Initialize fog of war
        this.initializeFog();

        // Create player and store reference
        this.player = createPlayer(this);
        this.player.setDepth(DEPTHS.PLAYER);
        this.data.set("player", this.player);

        // Set player position from server
        const { x, y } = gameState.active_dungeon.position;
        this.player.setPosition(
          x * CELL_SIZE + CELL_SIZE / 2,
          y * CELL_SIZE + CELL_SIZE / 2
        );

        // Update visibility immediately
        this.updateVisibility();

        // Set up input
        this.cursors = setupPlayerInput(this, this.player, async (dx, dy) => {
          if (this.canMove) {
            this.canMove = false;
            const newGridX = Math.floor(
              (this.player.x + dx * CELL_SIZE) / CELL_SIZE
            );
            const newGridY = Math.floor(
              (this.player.y + dy * CELL_SIZE) / CELL_SIZE
            );

            try {
              // Send move to server
              const result = await gameAPI.moveInDungeon(
                this.playerId,
                newGridX,
                newGridY
              );

              // Update local state with server response
              movePlayer(this, this.player, dx, dy, () => {
                this.canMove = true;
                this.updateVisibility();
                if (result.event) {
                  this.handleCellEvent(result.event);
                }
              });
            } catch (error) {
              console.error("Failed to move:", error);
              this.canMove = true;
            }
          }
        });

        // Setup audio
        setupAudio(this);

        // Ensure player is visible and on top
        if (this.player) {
          this.player.setDepth(DEPTHS.PLAYER);
          this.player.setVisible(true);
          this.children.bringToTop(this.player);
        }
      }
    } catch (error) {
      console.error("Failed to initialize dungeon:", error);
    }
  }

  private createGrid() {
    // Create a container for grid elements
    const gridContainer = this.add.container(0, 0);
    gridContainer.setDepth(DEPTHS.GRID);

    // Clear existing grid graphics
    this.children.list
      .filter(
        (obj): obj is Phaser.GameObjects.Rectangle =>
          obj instanceof Phaser.GameObjects.Rectangle && !obj.getData("isFog")
      )
      .forEach((obj) => obj.destroy());

    const graphics = this.add.graphics();
    graphics.lineStyle(1, 0x000000, 0.5);

    // Draw grid lines
    for (let x = 0; x <= GRID_SIZE; x++) {
      graphics.moveTo(x * CELL_SIZE, 0);
      graphics.lineTo(x * CELL_SIZE, GRID_SIZE * CELL_SIZE);
    }
    for (let y = 0; y <= GRID_SIZE; y++) {
      graphics.moveTo(0, y * CELL_SIZE);
      graphics.lineTo(GRID_SIZE * CELL_SIZE, y * CELL_SIZE);
    }
    graphics.strokePath();

    gridContainer.add(graphics);

    // Draw cell backgrounds
    for (let y = 0; y < GRID_SIZE; y++) {
      for (let x = 0; x < GRID_SIZE; x++) {
        const cell = this.cells[y][x];
        const rect = this.add.rectangle(
          x * CELL_SIZE + CELL_SIZE / 2,
          y * CELL_SIZE + CELL_SIZE / 2,
          CELL_SIZE - 2,
          CELL_SIZE - 2,
          CELL_COLORS[cell.type]
        );
        rect.setData("cellData", cell);
        rect.setDepth(DEPTHS.CELLS);
        gridContainer.add(rect);
      }
    }
  }

  private initializeFog() {
    // Create a container for fog elements
    const fogContainer = this.add.container(0, 0);
    fogContainer.setDepth(DEPTHS.FOG);

    for (let y = 0; y < GRID_SIZE; y++) {
      for (let x = 0; x < GRID_SIZE; x++) {
        const fog = this.add.rectangle(
          x * CELL_SIZE + CELL_SIZE / 2,
          y * CELL_SIZE + CELL_SIZE / 2,
          CELL_SIZE,
          CELL_SIZE,
          0x000000
        );
        fog.setData("x", x);
        fog.setData("y", y);
        fog.setData("isVisible", false);
        fog.setData("isFog", true);
        fog.setAlpha(1);
        fogContainer.add(fog);
      }
    }
  }

  private updateVisibility() {
    if (!this.player) return;
    const playerGridX = Math.floor(this.player.x / CELL_SIZE);
    const playerGridY = Math.floor(this.player.y / CELL_SIZE);
    updateVisibility(this, this.cells, playerGridX, playerGridY);
  }

  private handleCellEvent(event: any) {
    switch (event.type) {
      case "combat":
        handleCombat(this, event.data);
        break;
      case "treasure":
        handleTreasure(this, event.data, this.player.x, this.player.y);
        this.createGrid();
        break;
      case "trap":
        handleTrap(this, event.data, this.player.x, this.player.y);
        this.createGrid();
        break;
      case "merchant":
        this.scene.pause();
        this.scene.launch("ShopScene", { playerId: this.playerId });
        break;
      case "shrine":
        handleShrine(this, event.data, this.player.x, this.player.y);
        this.createGrid();
        break;
      case "exit":
        playDescendingFootsteps(this, () => this.nextLevel());
        break;
    }
  }

  private async nextLevel() {
    try {
      // Get updated game state from server
      const gameState = await gameAPI.getGameState(this.playerId);

      // Navigate to shop between levels
      window.location.href = "/shop";
    } catch (error) {
      console.error("Failed to proceed to next level:", error);
    }
  }
}
