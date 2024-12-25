import { CellType } from "./types";

export const GRID_SIZE = 10;
export const CELL_SIZE = 50;

export const CELL_COLORS: Record<CellType, number> = {
  [CellType.EMPTY]: 0xeeeeee,
  [CellType.MONSTER]: 0xff0000,
  [CellType.TREASURE]: 0xffd700,
  [CellType.TRAP]: 0xff6600,
  [CellType.EXIT]: 0x00ff00,
  [CellType.MERCHANT]: 0x0000ff,
  [CellType.SHRINE]: 0x800080,
  [CellType.MINIBOSS]: 0x8b0000,
  [CellType.SAFE]: 0x98fb98,
};

export const CELL_COUNTS = {
  [CellType.EXIT]: 1,
  [CellType.MONSTER]: 10,
  [CellType.TREASURE]: 5,
  [CellType.TRAP]: 3,
  [CellType.MERCHANT]: 2,
  [CellType.SHRINE]: 2,
  [CellType.MINIBOSS]: 1,
  [CellType.SAFE]: 3,
};
