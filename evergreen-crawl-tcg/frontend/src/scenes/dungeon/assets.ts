import { playerSprite, tileSprite } from "../../assets/base64Assets";
import { Scene } from "phaser";

export function loadAssets(scene: Scene) {
  // Create temporary canvas for base64 images
  const playerImg = new Image();
  playerImg.src = playerSprite;
  const playerCanvas = document.createElement("canvas");
  playerCanvas.width = 16;
  playerCanvas.height = 16;
  const playerCtx = playerCanvas.getContext("2d")!;
  playerImg.onload = () => {
    playerCtx.drawImage(playerImg, 0, 0);
  };

  const tilesImg = new Image();
  tilesImg.src = tileSprite;
  const tilesCanvas = document.createElement("canvas");
  tilesCanvas.width = 16;
  tilesCanvas.height = 16;
  const tilesCtx = tilesCanvas.getContext("2d")!;
  tilesImg.onload = () => {
    tilesCtx.drawImage(tilesImg, 0, 0);
  };

  // Add textures once loaded
  scene.textures.addCanvas("player", playerCanvas);
  scene.textures.addCanvas("tiles", tilesCanvas);

  // Load Kenney's audio assets
  scene.load.audio(
    "footstep",
    "src/assets/kenney_rpg-audio/Audio/footstep06.ogg"
  );
  scene.load.audio(
    "coins",
    "src/assets/kenney_rpg-audio/Audio/handleCoins.ogg"
  );
}
