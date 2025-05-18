export interface FogCellState {
  status: 'Unseen' | 'Visible' | 'Explored';
  turnsSinceLastSeen: number; // Counter for fading memory
}

export type FogMap = FogCellState[][];

export interface AllFogData {
  [mapId: string]: FogMap | undefined; // Undefined if a map's fog hasn't been initialized yet
}
