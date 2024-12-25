import { CellType } from "./types";

export const GRID_SIZE = 10;
export const CELL_SIZE = 64;

export const CELL_COLORS: Record<CellType, number> = {
  [CellType.EMPTY]: 0x333333, // Dark gray
  [CellType.MONSTER]: 0xff0000, // Bright red
  [CellType.TREASURE]: 0xffd700, // Gold
  [CellType.TRAP]: 0xff00ff, // Magenta
  [CellType.EXIT]: 0x00ff00, // Bright green
  [CellType.MERCHANT]: 0x0000ff, // Bright blue
  [CellType.SHRINE]: 0x800080, // Purple
  [CellType.MINIBOSS]: 0xff4500, // Orange red
  [CellType.SAFE]: 0x808080, // Gray
} as const;

export const CELL_COUNTS = {
  monster: 10,
  treasure: 5,
  trap: 5,
  merchant: 2,
  shrine: 2,
  miniboss: 1,
} as const;
