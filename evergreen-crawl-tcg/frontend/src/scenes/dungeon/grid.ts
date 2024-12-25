import { Cell, CellType } from "./types";
import { CELL_COUNTS, GRID_SIZE } from "./constants";
import { Scene } from "phaser";

export function initializeGrid(): Cell[][] {
  // Initialize empty grid
  const cells = Array(GRID_SIZE)
    .fill(null)
    .map(() =>
      Array(GRID_SIZE)
        .fill(null)
        .map((_, colIndex) => ({
          type: CellType.EMPTY,
          isVisible: false,
          isVisited: false,
          x: colIndex,
          y: 0,
        }))
    );

  // Update cell coordinates
  for (let y = 0; y < GRID_SIZE; y++) {
    for (let x = 0; x < GRID_SIZE; x++) {
      cells[y][x] = {
        ...cells[y][x],
        x: x,
        y: y,
        type: CellType.EMPTY,
        isVisible: false,
        isVisited: false,
      };
    }
  }

  // Place special cells
  Object.entries(CELL_COUNTS).forEach(([type, count]) => {
    placeCellType(cells, type as CellType, count);
  });

  // Make starting area safe
  cells[0][0].type = CellType.SAFE;
  cells[0][0].isVisible = true;
  cells[0][0].isVisited = true;

  return cells;
}

function placeCellType(cells: Cell[][], type: CellType, count: number) {
  for (let i = 0; i < count; i++) {
    let placed = false;
    while (!placed) {
      const x = Phaser.Math.Between(0, GRID_SIZE - 1);
      const y = Phaser.Math.Between(0, GRID_SIZE - 1);
      // Don't place anything in the starting area (0,0)
      if (cells[y][x].type === CellType.EMPTY && !(x === 0 && y === 0)) {
        cells[y][x].type = type;
        placed = true;
      }
    }
  }
}

export function updateVisibility(
  scene: Scene,
  cells: Cell[][],
  playerGridX: number,
  playerGridY: number
) {
  // Get all fog rectangles
  const fogRectangles = scene.children.list.filter(
    (obj): obj is Phaser.GameObjects.Rectangle =>
      obj instanceof Phaser.GameObjects.Rectangle &&
      obj !== scene.data.get("player") &&
      obj.getData("x") !== undefined
  );

  fogRectangles.forEach((fog) => {
    const fogX = fog.getData("x");
    const fogY = fog.getData("y");

    // Check if coordinates are valid
    if (
      fogX === undefined ||
      fogY === undefined ||
      fogX < 0 ||
      fogX >= GRID_SIZE ||
      fogY < 0 ||
      fogY >= GRID_SIZE ||
      !cells[fogY] ||
      !cells[fogY][fogX]
    ) {
      return;
    }

    const distance = Phaser.Math.Distance.Between(
      playerGridX,
      playerGridY,
      fogX,
      fogY
    );

    // Make starting position and adjacent cells always visible
    if (
      (fogX === 0 && fogY === 0) ||
      (fogX === 1 && fogY === 0) ||
      (fogX === 0 && fogY === 1)
    ) {
      fog.setAlpha(0);
      cells[fogY][fogX].isVisible = true;
      cells[fogY][fogX].isVisited = true;
      return;
    }

    if (distance <= 1.5) {
      fog.setAlpha(0);
      cells[fogY][fogX].isVisible = true;
      cells[fogY][fogX].isVisited = true;
    } else if (cells[fogY][fogX].isVisited) {
      fog.setAlpha(0.7);
    } else {
      fog.setAlpha(1);
    }
  });
}
