import { CellType } from "./types";

export const GRID_SIZE = 10;
export const CELL_SIZE = 64;

export const CELL_COLORS = {
  empty: 0x333333, // Dark gray
  monster: 0xff4444, // Red
  treasure: 0xffdd44, // Gold
  trap: 0xff00ff, // Magenta
  exit: 0x44ff44, // Green
  merchant: 0x4444ff, // Blue
  shrine: 0xaa44ff, // Purple
  miniboss: 0xff6600, // Orange
  safe: 0x666666, // Medium gray
  fog: 0x000000, // Black
} as const;

export const CELL_COUNTS = {
  monster: 10,
  treasure: 5,
  trap: 5,
  merchant: 2,
  shrine: 2,
  miniboss: 1,
} as const;
