import type { GameMap, MapCell, City } from '../../types/mapTypes';
import { TerrainType, PREVIOUS_MAP_SENTINEL } from '../../types/mapTypes';

// Helper function to create a basic row of MapCells
const createBasicRow = (
  terrain: TerrainType,
  walkable: boolean,
  blocksSight: boolean,
  width: number,
): MapCell[] => {
  return Array(width)
    .fill(null)
    .map(() => ({ terrain, walkable, blocksSight }));
};

// --- Port Pescado ---
// Narrative: A quiet village known for its resilient fisherfolk and salty tales.
// The scent of fish and sea hangs heavy in the air.
const portPescadoGrid: MapCell[][] = [
  // Row 0: Water edge
  Array(15)
    .fill(null)
    .map((_, x) => ({
      terrain: TerrainType.water,
      walkable: x > 12 || x < 2,
      blocksSight: false,
    })),
  // Row 1: Docks and water
  [
    { terrain: TerrainType.water, walkable: false, blocksSight: false },
    { terrain: TerrainType.road, walkable: true, blocksSight: false },
    { terrain: TerrainType.road, walkable: true, blocksSight: false },
    { terrain: TerrainType.water, walkable: false, blocksSight: false },
    { terrain: TerrainType.water, walkable: false, blocksSight: false },
    { terrain: TerrainType.road, walkable: true, blocksSight: false },
    { terrain: TerrainType.road, walkable: true, blocksSight: false },
    { terrain: TerrainType.road, walkable: true, blocksSight: false },
    { terrain: TerrainType.road, walkable: true, blocksSight: false },
    { terrain: TerrainType.water, walkable: false, blocksSight: false },
    { terrain: TerrainType.water, walkable: false, blocksSight: false },
    { terrain: TerrainType.road, walkable: true, blocksSight: false },
    { terrain: TerrainType.road, walkable: true, blocksSight: false },
    { terrain: TerrainType.water, walkable: false, blocksSight: false },
    { terrain: TerrainType.water, walkable: false, blocksSight: false },
  ],
  // Row 2: Main village path
  createBasicRow(TerrainType.road, true, false, 3)
    .concat(createBasicRow(TerrainType.town_floor, true, false, 9))
    .concat(createBasicRow(TerrainType.road, true, false, 3)),
  // Row 3: Buildings (Doors are explicitly defined MapCells)
  [
    { terrain: TerrainType.building_wall, walkable: false, blocksSight: true },
    {
      terrain: TerrainType.building_door,
      walkable: true,
      blocksSight: false,
      leadsTo: { mapId: 'pescado_house_1', targetX: 1, targetY: 1 },
    },
    { terrain: TerrainType.building_wall, walkable: false, blocksSight: true },
    { terrain: TerrainType.town_floor, walkable: true, blocksSight: false },
    { terrain: TerrainType.building_wall, walkable: false, blocksSight: true },
    { terrain: TerrainType.building_wall, walkable: false, blocksSight: true },
    {
      terrain: TerrainType.building_door,
      walkable: true,
      blocksSight: false,
      leadsTo: { mapId: 'pescado_house_2', targetX: 1, targetY: 1 },
    },
    { terrain: TerrainType.building_wall, walkable: false, blocksSight: true },
    { terrain: TerrainType.town_floor, walkable: true, blocksSight: false },
    { terrain: TerrainType.building_wall, walkable: false, blocksSight: true },
    { terrain: TerrainType.building_wall, walkable: false, blocksSight: true },
    {
      terrain: TerrainType.building_door,
      walkable: true,
      blocksSight: false,
      leadsTo: { mapId: 'pescado_shop', targetX: 1, targetY: 1 },
    },
    { terrain: TerrainType.building_wall, walkable: false, blocksSight: true },
    { terrain: TerrainType.town_floor, walkable: true, blocksSight: false },
    { terrain: TerrainType.town_floor, walkable: true, blocksSight: false },
  ],
  // Row 4: More buildings and path
  [
    { terrain: TerrainType.building_wall, walkable: false, blocksSight: true },
    { terrain: TerrainType.town_floor, walkable: true, blocksSight: false },
    { terrain: TerrainType.building_wall, walkable: false, blocksSight: true },
    { terrain: TerrainType.town_floor, walkable: true, blocksSight: false },
    { terrain: TerrainType.building_wall, walkable: false, blocksSight: true },
    { terrain: TerrainType.town_floor, walkable: true, blocksSight: false },
    { terrain: TerrainType.town_floor, walkable: true, blocksSight: false },
    { terrain: TerrainType.building_wall, walkable: false, blocksSight: true },
    { terrain: TerrainType.town_floor, walkable: true, blocksSight: false },
    { terrain: TerrainType.building_wall, walkable: false, blocksSight: true },
    { terrain: TerrainType.town_floor, walkable: true, blocksSight: false },
    { terrain: TerrainType.town_floor, walkable: true, blocksSight: false },
    { terrain: TerrainType.building_wall, walkable: false, blocksSight: true },
    { terrain: TerrainType.town_floor, walkable: true, blocksSight: false },
    { terrain: TerrainType.town_floor, walkable: true, blocksSight: false },
  ],
  // Row 5: Path and central area
  createBasicRow(TerrainType.town_floor, true, false, 15),
  // Row 6: Southern buildings
  [
    { terrain: TerrainType.building_wall, walkable: false, blocksSight: true },
    {
      terrain: TerrainType.building_door,
      walkable: true,
      blocksSight: false,
      leadsTo: { mapId: 'pescado_house_3', targetX: 1, targetY: 1 },
    },
    { terrain: TerrainType.building_wall, walkable: false, blocksSight: true },
    { terrain: TerrainType.building_wall, walkable: false, blocksSight: true },
    { terrain: TerrainType.town_floor, walkable: true, blocksSight: false },
    { terrain: TerrainType.building_wall, walkable: false, blocksSight: true },
    {
      terrain: TerrainType.building_door,
      walkable: true,
      blocksSight: false,
      leadsTo: { mapId: 'pescado_storage', targetX: 1, targetY: 1 },
    },
    { terrain: TerrainType.building_wall, walkable: false, blocksSight: true },
    { terrain: TerrainType.town_floor, walkable: true, blocksSight: false },
    { terrain: TerrainType.building_wall, walkable: false, blocksSight: true },
    { terrain: TerrainType.building_wall, walkable: false, blocksSight: true },
    { terrain: TerrainType.building_wall, walkable: false, blocksSight: true },
    { terrain: TerrainType.building_wall, walkable: false, blocksSight: true },
    { terrain: TerrainType.town_floor, walkable: true, blocksSight: false },
    { terrain: TerrainType.town_floor, walkable: true, blocksSight: false },
  ],
  // Row 7: Path
  createBasicRow(TerrainType.road, true, false, 15),
  // Row 8: Exit path (Main exit door is an explicitly defined MapCell)
  createBasicRow(TerrainType.road, true, false, 7)
    .concat([
      {
        terrain: TerrainType.building_door,
        walkable: true,
        blocksSight: false,
        leadsTo: { mapId: PREVIOUS_MAP_SENTINEL, targetX: 0, targetY: 0 },
      },
    ])
    .concat(createBasicRow(TerrainType.road, true, false, 7)),
  // Row 9: Edge of map
  createBasicRow(TerrainType.grass, false, true, 15),
];

const portPescado: GameMap = {
  id: 'port_pescado',
  name: 'Port Pescado - A Humble Fishing Hamlet',
  seed: 'fixed_seed_port_pescado',
  width: 15,
  height: 10,
  grid: portPescadoGrid,
  type: 'interior',
};

// --- Gorillagrad Capital ---
const gorillagradGrid: MapCell[][] = [
  createBasicRow(TerrainType.building_wall, false, true, 25),
  ...Array(4)
    .fill(null)
    .map((_row, rowIndex) =>
      createBasicRow(
        rowIndex % 2 === 0 ? TerrainType.road : TerrainType.town_floor,
        true,
        false,
        25,
      ),
    ),
  createBasicRow(TerrainType.building_wall, false, true, 5)
    .concat(createBasicRow(TerrainType.town_floor, true, false, 15))
    .concat(createBasicRow(TerrainType.building_wall, false, true, 5)),
  ...Array(5)
    .fill(null)
    .map(() => {
      // Removed unused rowIndex
      const row = createBasicRow(TerrainType.town_floor, true, false, 25);
      // Explicitly define the door cell
      row[12] = {
        terrain: TerrainType.building_door,
        walkable: true,
        blocksSight: false,
        leadsTo: {
          mapId: 'gorillagrad_palace_entrance',
          targetX: 5,
          targetY: 18,
        },
      };
      return row;
    }),
  ...Array(8)
    .fill(null)
    .map((_row, rowIndex) =>
      createBasicRow(
        rowIndex % 2 === 0 ? TerrainType.road : TerrainType.town_floor,
        true,
        false,
        25,
      ),
    ),
  (() => {
    const row = createBasicRow(TerrainType.building_wall, false, true, 25);
    // Explicitly define the exit door cell
    row[12] = {
      terrain: TerrainType.building_door,
      walkable: true,
      blocksSight: false,
      leadsTo: { mapId: PREVIOUS_MAP_SENTINEL, targetX: 0, targetY: 0 },
    };
    return row;
  })(),
];
const gorillagrad: GameMap = {
  id: 'gorillagrad_capital',
  name: 'Gorillagrad - The Majestic Ape Capital',
  seed: 'fixed_seed_gorillagrad',
  width: 25,
  height: 20,
  grid: gorillagradGrid,
  type: 'interior',
};

// --- Gribble's Nook (Goblin Hideaway) ---
const gribblesNookGrid: MapCell[][] = [
  createBasicRow(TerrainType.building_wall, false, true, 20),
  ...Array(13)
    .fill(null)
    .map((_row, rIndex) => {
      const rowCells: MapCell[] = createBasicRow(
        TerrainType.empty,
        true,
        false,
        20,
      );
      for (let i = 0; i < 5; i++) {
        const wallPos = Math.floor(Math.random() * 18) + 1;
        rowCells[wallPos] = {
          terrain: TerrainType.building_wall,
          walkable: false,
          blocksSight: true,
        };
        // Explicitly define door cell if created
        if (
          Math.random() > 0.8 &&
          wallPos > 0 &&
          rowCells[wallPos - 1]?.walkable
        ) {
          rowCells[wallPos - 1] = {
            terrain: TerrainType.building_door,
            walkable: true,
            blocksSight: false,
            leadsTo: {
              mapId: `goblin_shack_${rIndex}_${i}`,
              targetX: 1,
              targetY: 1,
            },
          };
        }
      }
      return rowCells;
    }),
  (() => {
    const row = createBasicRow(TerrainType.building_wall, false, true, 20);
    // Explicitly define the exit door cell
    row[10] = {
      terrain: TerrainType.building_door,
      walkable: true,
      blocksSight: false,
      leadsTo: { mapId: PREVIOUS_MAP_SENTINEL, targetX: 0, targetY: 0 },
    };
    return row;
  })(),
];
const gribblesNook: GameMap = {
  id: 'gribbles_nook',
  name: "Gribble's Nook - A Stinky Goblin Hideout",
  seed: 'fixed_seed_gribbles_nook',
  width: 20,
  height: 15,
  grid: gribblesNookGrid,
  type: 'interior',
  entryPoints: {
    main: { x: 10, y: 13 }, // Example exit point
  },
};

// --- Whispering Woods Enclave ---
const whisperingWoodsGrid: MapCell[][] = [
  createBasicRow(TerrainType.forest, false, true, 20),
  ...Array(18)
    .fill(null)
    .map((_row, rIndex) => {
      // Create a base row, then modify specific cells for homes/doors
      const rowCells: MapCell[] = Array(20)
        .fill(null)
        .map(() => ({
          terrain:
            Math.random() > 0.6 ? TerrainType.forest : TerrainType.town_floor,
          walkable: true,
          blocksSight: Math.random() > 0.9 ? true : false,
        }));
      if (rIndex > 2 && rIndex < 17 && rIndex % 4 === 0) {
        const homePos = Math.floor(Math.random() * 15) + 2;
        if (homePos + 3 < 20) {
          // Ensure space for the home
          rowCells[homePos] = {
            terrain: TerrainType.building_wall,
            walkable: false,
            blocksSight: true,
          };
          rowCells[homePos + 1] = {
            terrain: TerrainType.building_wall,
            walkable: false,
            blocksSight: true,
          };
          // Explicitly define the door cell
          rowCells[homePos + 2] = {
            terrain: TerrainType.building_door,
            walkable: true,
            blocksSight: false,
            leadsTo: { mapId: `tree_home_${rIndex}`, targetX: 1, targetY: 1 },
          };
          rowCells[homePos + 3] = {
            terrain: TerrainType.building_wall,
            walkable: false,
            blocksSight: true,
          };
        }
      }
      return rowCells;
    }),
  (() => {
    const row = createBasicRow(TerrainType.forest, true, false, 20);
    // Explicitly define the exit door cell
    row[10] = {
      terrain: TerrainType.building_door,
      walkable: true,
      blocksSight: false,
      leadsTo: { mapId: PREVIOUS_MAP_SENTINEL, targetX: 0, targetY: 0 },
    };
    for (let i = 0; i < 20; i++) {
      if (i < 9 || i > 11)
        row[i] = {
          terrain: TerrainType.forest,
          walkable: false,
          blocksSight: true,
        };
    }
    return row;
  })(),
];
const whisperingWoodsEnclave: GameMap = {
  id: 'whispering_woods_enclave',
  name: 'Whispering Woods Enclave - An Elven Sanctuary',
  seed: 'fixed_seed_whispering_woods',
  width: 30,
  height: 25,
  grid: whisperingWoodsGrid,
  type: 'interior',
  entryPoints: {
    main: { x: 15, y: 23 },
    secret_grove: { x: 2, y: 2 },
  },
};

export const predefinedCityMaps: { [key: string]: GameMap } = {
  port_pescado: portPescado,
  gorillagrad_capital: gorillagrad,
  gribbles_nook: gribblesNook,
  whispering_woods_enclave: whisperingWoodsEnclave,
};

// Metadata for predefined cities to be placed on the world map
export const predefinedCitiesMetadata: City[] = [
  {
    id: 'city_port_pescado',
    name: 'Port Pescado',
    x: 10, // Placeholder world map X
    y: 10, // Placeholder world map Y
    population: 300,
    race: 'Humans',
    religion: 'Sea Gods',
    // mapId: portPescado.id, // Reference to the GameMap ID for the city interior
  },
  {
    id: 'city_gorillagrad',
    name: 'Gorillagrad',
    x: 50, // Placeholder world map X
    y: 50, // Placeholder world map Y
    population: 5000,
    race: 'Gorillas',
    religion: 'Ancestor Veneration',
    // mapId: gorillagrad.id,
  },
  {
    id: 'city_gribbles_nook',
    name: "Gribble's Nook",
    x: 20, // Placeholder world map X
    y: 70, // Placeholder world map Y
    population: 150,
    race: 'Goblins',
    religion: 'Shiny Things',
    // mapId: gribblesNook.id,
  },
  {
    id: 'city_whispering_woods',
    name: 'Whispering Woods Enclave',
    x: 75, // Placeholder world map X
    y: 25, // Placeholder world map Y
    population: 800,
    race: 'Elves',
    religion: 'Nature Spirits',
    // mapId: whisperingWoodsEnclave.id,
  },
];

// Helper to get a specific predefined map (used by mapManager)
export function getPredefinedMap(mapId: string): GameMap | undefined {
  return predefinedCityMaps[mapId];
}
