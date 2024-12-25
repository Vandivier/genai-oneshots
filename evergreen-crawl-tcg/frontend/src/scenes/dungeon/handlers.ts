import { Cell, CellType, PlayerProgress } from "./types";
import { Scene } from "phaser";
import { CELL_SIZE } from "./constants";

export function handleCombat(scene: Scene, cell: Cell) {
  scene.scene.pause();
  scene.scene.launch("CombatScene", {
    enemyType: cell.type,
    onComplete: (result: boolean) => {
      scene.scene.resume();
      if (result) {
        cell.type = CellType.EMPTY;
        // Refresh grid display will be handled by the main scene
      }
    },
  });
}

export function handleTreasure(
  scene: Scene,
  cell: Cell,
  playerX: number,
  playerY: number
) {
  const progress = getProgress();
  const goldAmount = cell.data?.treasureAmount || Phaser.Math.Between(10, 50);
  progress.playerStats.gold = (progress.playerStats.gold || 0) + goldAmount;
  saveProgress(progress);

  showFloatingText(scene, playerX, playerY, `+${goldAmount} Gold!`, "#ffd700");
  scene.sound.play("coins", { volume: 0.4 });
  cell.type = CellType.EMPTY;
}

export function handleTrap(
  scene: Scene,
  cell: Cell,
  playerX: number,
  playerY: number
) {
  const progress = getProgress();
  const damage = cell.data?.trapDamage || Phaser.Math.Between(5, 15);
  progress.playerStats.health = Math.max(
    0,
    (progress.playerStats.health || 100) - damage
  );
  saveProgress(progress);

  showFloatingText(scene, playerX, playerY, `-${damage} HP!`, "#ff0000");
  cell.type = CellType.EMPTY;

  if (progress.playerStats.health <= 0) {
    scene.scene.start("GameOverScene");
  }
}

export function handleShrine(
  scene: Phaser.Scene,
  data: any,
  x: number,
  y: number
) {
  // Get grid coordinates
  const gridX = Math.floor(x / CELL_SIZE);
  const gridY = Math.floor(y / CELL_SIZE);
  const cell = (scene as any).cells[gridY][gridX];

  // If shrine has been used, show different message and return
  if (cell.isUsed) {
    const text = scene.add
      .text(x, y - 20, "Shrine has already been used", {
        fontSize: "16px",
        color: "#888888",
      })
      .setOrigin(0.5);

    scene.tweens.add({
      targets: text,
      y: y - 40,
      alpha: 0,
      duration: 1500,
      onComplete: () => text.destroy(),
    });
    return;
  }

  // Mark shrine as used
  cell.isUsed = true;

  // Handle shrine effect
  const effectText =
    data.type === "heal"
      ? `Healed ${data.amount} HP`
      : data.type === "maxhp"
      ? `Max HP increased by ${data.amount}`
      : `Gained ${data.amount} Gold`;

  const text = scene.add
    .text(x, y - 20, effectText, {
      fontSize: "16px",
      color: "#44ff44",
    })
    .setOrigin(0.5);

  scene.tweens.add({
    targets: text,
    y: y - 40,
    alpha: 0,
    duration: 1500,
    onComplete: () => text.destroy(),
  });

  // Update cell appearance to show it's been used
  const cellObjects = scene.children.list.filter(
    (obj): obj is Phaser.GameObjects.Rectangle =>
      obj instanceof Phaser.GameObjects.Rectangle &&
      obj.getData("isCell") &&
      obj.getData("gridX") === gridX &&
      obj.getData("gridY") === gridY
  );

  cellObjects.forEach((obj) => {
    // Darken the shrine color to indicate it's been used
    obj.setFillStyle(0x400040);
  });
}

function getRandomShrineEffect() {
  const effects = [
    { type: "heal", amount: 30 },
    { type: "maxhp", amount: 10 },
    { type: "gold", amount: 100 },
  ] as const;
  return Phaser.Utils.Array.GetRandom(effects);
}

function showFloatingText(
  scene: Scene,
  x: number,
  y: number,
  text: string,
  color: string
) {
  scene.add
    .text(x, y - 20, text, {
      fontSize: "16px",
      color: color,
    })
    .setOrigin(0.5)
    .setDepth(3);
}

function getProgress(): PlayerProgress {
  return JSON.parse(
    localStorage.getItem("gameProgress") ||
      '{"playerStats":{"health":100,"maxHealth":100,"gold":0,"experience":0},"inventory":{"cards":[],"items":[]}}'
  );
}

function saveProgress(progress: PlayerProgress) {
  localStorage.setItem("gameProgress", JSON.stringify(progress));
}
