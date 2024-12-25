import { Scene } from "phaser";

export function setupAudio(scene: Scene) {
  const isMuted = localStorage.getItem("isMuted") === "true";
  scene.sound.setMute(isMuted);

  scene.game.events.on("mute", (muted: boolean) => {
    scene.sound.setMute(muted);
  });
}

export function playDescendingFootsteps(scene: Scene, onComplete: () => void) {
  let stepCount = 0;
  const playStep = () => {
    if (stepCount < 4) {
      scene.sound.play("footstep", { volume: 0.4 - stepCount * 0.1 });
      stepCount++;
      scene.time.delayedCall(200, playStep);
    } else {
      onComplete();
    }
  };
  playStep();
}
