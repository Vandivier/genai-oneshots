interface GameStateChangedEvent extends CustomEvent {
  detail: {
    type: "playerUpdate";
    data: PlayerResponse;
  };
}

interface WindowEventMap {
  gameStateChanged: GameStateChangedEvent;
} 