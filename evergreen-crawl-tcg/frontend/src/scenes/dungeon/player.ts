import { Scene } from "phaser";
import { CELL_SIZE, GRID_SIZE } from "./constants";

export function createPlayer(scene: Scene) {
  // Create a container at the initial position
  const container = scene.add.container(CELL_SIZE / 2, CELL_SIZE / 2);

  // Create border and player rectangles as children of the container
  const border = scene.add.rectangle(
    0,
    0,
    CELL_SIZE * 0.9,
    CELL_SIZE * 0.9,
    0x000000
  );

  const player = scene.add.rectangle(
    0,
    0,
    CELL_SIZE * 0.8,
    CELL_SIZE * 0.8,
    0x4444ff
  );

  // Add rectangles to container
  container.add([border, player]);
  container.setDepth(3);

  return container;
}

export function setupPlayerInput(
  scene: Scene,
  player: Phaser.GameObjects.Container,
  onMove: (dx: number, dy: number) => void
) {
  const cursors = scene.input.keyboard.createCursorKeys();

  scene.input.keyboard.on("keyup", (event: KeyboardEvent) => {
    let dx = 0;
    let dy = 0;

    switch (event.code) {
      case "ArrowLeft":
        dx = -1;
        break;
      case "ArrowRight":
        dx = 1;
        break;
      case "ArrowUp":
        dy = -1;
        break;
      case "ArrowDown":
        dy = 1;
        break;
      default:
        return;
    }

    onMove(dx, dy);
  });

  return cursors;
}

export function movePlayer(
  scene: Scene,
  player: Phaser.GameObjects.Container,
  dx: number,
  dy: number,
  onComplete: () => void
) {
  const newX = player.x + dx * CELL_SIZE;
  const newY = player.y + dy * CELL_SIZE;
  const newGridX = Math.floor(newX / CELL_SIZE);
  const newGridY = Math.floor(newY / CELL_SIZE);

  if (
    newGridX >= 0 &&
    newGridX < GRID_SIZE &&
    newGridY >= 0 &&
    newGridY < GRID_SIZE
  ) {
    scene.tweens.add({
      targets: player,
      x: newX,
      y: newY,
      duration: 200,
      ease: "Power2",
      onComplete,
    });
  }
}

export function getPlayerProgress() {
  return {
    level: getCurrentLevel(),
    playerStats: getPlayerStats(),
    inventory: getInventory(),
  };
}

function getCurrentLevel(): number {
  const progress = localStorage.getItem("gameProgress");
  if (progress) {
    return JSON.parse(progress).level + 1;
  }
  return 1;
}

function getPlayerStats() {
  return {
    health: 100,
    maxHealth: 100,
    gold: 0,
    experience: 0,
  };
}

function getInventory() {
  return {
    cards: [],
    items: [],
  };
}
