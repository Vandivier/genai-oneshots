// src/labyrinthos.d.ts
declare module 'labyrinthos' {
  interface LabyTileMapOptions {
    width: number;
    height: number;
    // Add other options if known, e.g., depth, is3D
  }

  interface LabyTileMap {
    data: number[]; // Or number[][] if it can be 3D and structured that way directly
    width: number;
    height: number;
    // Add other properties/methods if known, e.g., fill(), get(), set()
  }

  interface LabyPerlinOptions {
    seed?: number;
    // Add other Perlin noise options if known
  }

  interface LabyrinthosStatic {
    TileMap: new (options: LabyTileMapOptions) => LabyTileMap;
    terrains: {
      PerlinNoise: (map: LabyTileMap, options?: LabyPerlinOptions) => void; // Assuming it modifies map in place
      // Add other terrain algorithms if known
    };
    // Add other categories like mazes, biomes, etc. if known
  }

  const LABY: LabyrinthosStatic;
  export default LABY;
}
