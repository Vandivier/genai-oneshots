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
  PLAYER: 2,
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
      console.log("Initializing dungeon for player:", this.playerId);

      // Get initial game state
      console.log("Getting game state...");
      const gameState = await gameAPI.getGameState(this.playerId);
      console.log("Game state received:", gameState);

      // Initialize grid with server data
      if (!gameState.active_dungeon) {
        console.error("No active dungeon found in game state");
        this.game.events.emit(
          "dungeonError",
          new Error("No active dungeon found")
        );
        return;
      }

      // Initialize grid with visible cells from server
      console.log("Initializing grid...");
      this.cells = initializeGrid();

      // Update cells with server data
      console.log(
        "Updating cells with server data:",
        gameState.active_dungeon.visible_cells
      );
      gameState.active_dungeon.visible_cells.forEach((cell) => {
        if (
          cell.x >= 0 &&
          cell.x < GRID_SIZE &&
          cell.y >= 0 &&
          cell.y < GRID_SIZE
        ) {
          console.log(`Setting cell (${cell.x}, ${cell.y}):`, {
            type: cell.type,
            isVisible: cell.is_visible,
            isVisited: cell.is_visited,
          });
          this.cells[cell.y][cell.x] = {
            type: cell.type as CellType,
            isVisible: cell.is_visible,
            isVisited: cell.is_visited,
            x: cell.x,
            y: cell.y,
          };
        }
      });

      // Create grid and fog
      console.log("Creating grid and fog...");
      this.createGrid();

      // Create player and store reference
      console.log("Creating player sprite...");
      this.player = createPlayer(this);
      this.player.setDepth(DEPTHS.PLAYER);
      this.data.set("player", this.player);

      // Set player position from server
      const { x, y } = gameState.active_dungeon.position;
      console.log("Setting player position:", { x, y });
      this.player.setPosition(
        x * CELL_SIZE + CELL_SIZE / 2,
        y * CELL_SIZE + CELL_SIZE / 2
      );

      // Update visibility immediately
      this.updateVisibility();

      // Set up input
      console.log("Setting up input handlers...");
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

            // Update only the newly visible cells
            result.cells.forEach((cell) => {
              if (
                cell.x >= 0 &&
                cell.x < GRID_SIZE &&
                cell.y >= 0 &&
                cell.y < GRID_SIZE
              ) {
                this.cells[cell.y][cell.x] = {
                  type: cell.type as CellType,
                  isVisible: cell.is_visible,
                  isVisited: cell.is_visited,
                  x: cell.x,
                  y: cell.y,
                };
              }
            });

            // Update local state with server response
            movePlayer(this, this.player, dx, dy, () => {
              this.canMove = true;
              this.createGrid(); // Recreate grid to update cell colors
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
      console.log("Setting up audio...");
      setupAudio(this);

      // Ensure player is visible and on top
      if (this.player) {
        this.player.setDepth(DEPTHS.PLAYER);
        this.player.setVisible(true);
        this.children.bringToTop(this.player);
      }

      console.log("Dungeon initialization complete!");
    } catch (error) {
      console.error("Failed to initialize dungeon:", error);
      // Return to setup screen on error
      this.game.events.emit("dungeonError", error);
    }
  }

  private createGrid() {
    console.log("Creating grid with cells:", this.cells);
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

        // Set the appropriate color based on visibility
        const cellColor =
          cell.isVisible || cell.isVisited ? CELL_COLORS[cell.type] : 0x000000;
        console.log(`Cell (${x}, ${y}):`, {
          type: cell.type,
          isVisible: cell.isVisible,
          isVisited: cell.isVisited,
          color: cellColor.toString(16),
        });

        const rect = this.add.rectangle(
          x * CELL_SIZE + CELL_SIZE / 2,
          y * CELL_SIZE + CELL_SIZE / 2,
          CELL_SIZE - 2,
          CELL_SIZE - 2,
          cellColor
        );
        rect.setData("cellData", cell);
        rect.setData("gridX", x);
        rect.setData("gridY", y);
        rect.setData("isCell", true);
        rect.setDepth(DEPTHS.CELLS);
        rect.setVisible(true);
        rect.setAlpha(cell.isVisible ? 1 : cell.isVisited ? 0.5 : 0);
        gridContainer.add(rect);

        // Add cell type indicator text only for visible or visited cells
        if (cell.isVisible || cell.isVisited) {
          const text = this.add.text(
            x * CELL_SIZE + CELL_SIZE / 2,
            y * CELL_SIZE + CELL_SIZE / 2,
            this.getCellSymbol(cell.type),
            {
              fontSize: "16px",
              color: "#ffffff",
            }
          );
          text.setOrigin(0.5, 0.5);
          text.setDepth(DEPTHS.CELLS);
          text.setData("isText", true);
          text.setData("gridX", x);
          text.setData("gridY", y);
          text.setVisible(true);
          text.setAlpha(cell.isVisible ? 1 : cell.isVisited ? 0.5 : 0);
          gridContainer.add(text);
        }
      }
    }
  }

  private getCellSymbol(type: CellType): string {
    switch (type) {
      case CellType.MONSTER:
        return "M";
      case CellType.TREASURE:
        return "T";
      case CellType.TRAP:
        return "X";
      case CellType.EXIT:
        return "E";
      case CellType.MERCHANT:
        return "$";
      case CellType.SHRINE:
        return "S";
      case CellType.MINIBOSS:
        return "B";
      case CellType.SAFE:
        return "·";
      default:
        return "";
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

    // Get all cell rectangles and text
    const cellObjects = this.children.list.filter(
      (obj): obj is Phaser.GameObjects.Rectangle | Phaser.GameObjects.Text =>
        (obj instanceof Phaser.GameObjects.Rectangle &&
          obj.getData("isCell")) ||
        (obj instanceof Phaser.GameObjects.Text && obj.getData("isText"))
    );

    // Update visibility of cells and text
    cellObjects.forEach((obj) => {
      const x = obj.getData("gridX");
      const y = obj.getData("gridY");
      if (x === undefined || y === undefined) return;

      const cell = this.cells[y][x];
      const distance = Phaser.Math.Distance.Between(
        playerGridX,
        playerGridY,
        x,
        y
      );

      // Cell is adjacent to player (currently visible)
      if (distance <= 1.5) {
        obj.setVisible(true);
        obj.setAlpha(1);
        cell.isVisible = true;
        cell.isVisited = true;

        // Update cell color if it's a rectangle
        if (obj instanceof Phaser.GameObjects.Rectangle) {
          obj.setFillStyle(CELL_COLORS[cell.type]);
        }
      }
      // Cell has been visited before
      else if (cell.isVisited) {
        obj.setVisible(true);
        obj.setAlpha(0.5);
        cell.isVisible = false;

        // Update cell color if it's a rectangle
        if (obj instanceof Phaser.GameObjects.Rectangle) {
          obj.setFillStyle(CELL_COLORS[cell.type]);
        }
      }
      // Unexplored cell
      else {
        obj.setVisible(true);
        obj.setAlpha(0);
        cell.isVisible = false;

        // Set black color for unexplored cells if it's a rectangle
        if (obj instanceof Phaser.GameObjects.Rectangle) {
          obj.setFillStyle(0x000000);
        }
      }
    });

    // Update fog layer
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
