import { Cell, CellType, PlayerProgress } from "./types";
import { Scene } from "phaser";

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
  scene: Scene,
  cell: Cell,
  playerX: number,
  playerY: number
) {
  const progress = getProgress();
  const effect = cell.data?.shrineEffect || getRandomShrineEffect();

  switch (effect.type) {
    case "heal":
      progress.playerStats.health = Math.min(
        progress.playerStats.maxHealth,
        (progress.playerStats.health || 100) + effect.amount
      );
      showFloatingText(
        scene,
        playerX,
        playerY,
        `Healed for ${effect.amount} HP!`,
        "#00ff00"
      );
      break;
    case "maxhp":
      progress.playerStats.maxHealth =
        (progress.playerStats.maxHealth || 100) + effect.amount;
      progress.playerStats.health = progress.playerStats.maxHealth;
      showFloatingText(
        scene,
        playerX,
        playerY,
        `Max HP increased by ${effect.amount}!`,
        "#00ffff"
      );
      break;
    case "gold":
      progress.playerStats.gold =
        (progress.playerStats.gold || 0) + effect.amount;
      showFloatingText(
        scene,
        playerX,
        playerY,
        `Found ${effect.amount} Gold!`,
        "#ffd700"
      );
      break;
  }

  saveProgress(progress);
  cell.type = CellType.EMPTY;
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
