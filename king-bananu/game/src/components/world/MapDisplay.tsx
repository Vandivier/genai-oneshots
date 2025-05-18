import React, { useRef, useEffect, useState, useCallback } from 'react';
import type { GameMap, MapCell } from '../../types/mapTypes';
import type { PlayerCharacter } from '../../types/characterTypes';
import type { PlayerPosition } from '../../types/gameTypes';
import type { FogMap } from '../../types/fogTypes';
import { TerrainType } from '../../types/mapTypes';

// Debounce function (simplified, consider lodash if available and preferred)
function debounce<F extends (...args: Parameters<F>) => ReturnType<F>>(
  func: F,
  delay: number,
): (...args: Parameters<F>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  return (...args: Parameters<F>) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      func(...args);
    }, delay);
  };
}

const TILE_SIZE = 32;
const FONT_SIZE = TILE_SIZE * 0.6;
const RENDER_BUFFER = 5; // Render N extra tiles around the viewport
const MAP_VIEWPORT_MAX_WIDTH = '90vw';
const MAP_VIEWPORT_MAX_HEIGHT = '50vh';

interface MapDisplayProps {
  gameMap: GameMap;
  player: PlayerCharacter;
  playerPosition: PlayerPosition;
  fogMap: FogMap;
  isCellSelectionModeActive?: boolean;
  onDebugCellSelect?: (cell: MapCell, x: number, y: number) => void;
}

interface VisibleTileRange {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}

const getTerrainIcon = (terrain: TerrainType): string => {
  switch (terrain) {
    case TerrainType.grass:
      return '🟩';
    case TerrainType.water:
      return '💧';
    case TerrainType.forest:
      return '🌲';
    case TerrainType.mountain:
      return '⛰️';
    case TerrainType.town_floor:
      return '🟫';
    case TerrainType.building_wall:
      return '🧱';
    case TerrainType.building_door:
      return '🚪';
    case TerrainType.city_marker:
      return '🏙️';
    case TerrainType.desert:
      return '🏜️';
    default:
      return '❓';
  }
};

const MapDisplay: React.FC<MapDisplayProps> = React.memo(
  ({
    gameMap,
    player,
    playerPosition,
    fogMap,
    isCellSelectionModeActive,
    onDebugCellSelect,
  }) => {
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [visibleTilesRange, setVisibleTilesRange] =
      useState<VisibleTileRange | null>(null);

    const calculateAndUpdateVisibleTiles = useCallback(() => {
      if (!scrollContainerRef.current || !gameMap) return;
      const container = scrollContainerRef.current;
      const { scrollLeft, scrollTop, offsetWidth, offsetHeight } = container;
      const newMinX = Math.max(
        0,
        Math.floor(scrollLeft / TILE_SIZE) - RENDER_BUFFER,
      );
      const newMaxX = Math.min(
        gameMap.width - 1,
        Math.ceil((scrollLeft + offsetWidth) / TILE_SIZE) + RENDER_BUFFER - 1,
      );
      const newMinY = Math.max(
        0,
        Math.floor(scrollTop / TILE_SIZE) - RENDER_BUFFER,
      );
      const newMaxY = Math.min(
        gameMap.height - 1,
        Math.ceil((scrollTop + offsetHeight) / TILE_SIZE) + RENDER_BUFFER - 1,
      );
      setVisibleTilesRange({
        minX: newMinX,
        maxX: newMaxX,
        minY: newMinY,
        maxY: newMaxY,
      });
    }, [gameMap]);

    const debouncedCalculateVisibleTiles = useCallback(
      debounce(calculateAndUpdateVisibleTiles, 100),
      [calculateAndUpdateVisibleTiles],
    );

    useEffect(() => {
      if (scrollContainerRef.current && playerPosition && gameMap?.grid) {
        const container = scrollContainerRef.current;
        const playerVisualCenterX =
          playerPosition.x * TILE_SIZE + TILE_SIZE / 2;
        const playerVisualCenterY =
          playerPosition.y * TILE_SIZE + TILE_SIZE / 2;
        const targetScrollLeft =
          playerVisualCenterX - container.offsetWidth / 2;
        const targetScrollTop =
          playerVisualCenterY - container.offsetHeight / 2;
        try {
          container.scrollTo({
            left: targetScrollLeft,
            top: targetScrollTop,
            behavior: 'smooth',
          });
        } catch {
          container.scrollLeft = targetScrollLeft;
          container.scrollTop = targetScrollTop;
        }
        calculateAndUpdateVisibleTiles();
      }
    }, [playerPosition, gameMap, calculateAndUpdateVisibleTiles]);

    useEffect(() => {
      const container = scrollContainerRef.current;
      if (container) {
        container.addEventListener('scroll', debouncedCalculateVisibleTiles);
        calculateAndUpdateVisibleTiles(); // Initial calculation
        return () =>
          container.removeEventListener(
            'scroll',
            debouncedCalculateVisibleTiles,
          );
      }
    }, [debouncedCalculateVisibleTiles, calculateAndUpdateVisibleTiles]);

    const handleTileClick = (
      x: number,
      y: number,
      cell: MapCell | undefined,
    ) => {
      if (isCellSelectionModeActive && onDebugCellSelect && cell) {
        onDebugCellSelect(cell, x, y);
        // The reducer will turn off isCellSelectionModeActive
        return;
      }
      // Normal click logic (if any) - currently movement is via buttons/keys
      console.log(`Tile clicked (normal mode): ${x}, ${y}`, cell);
    };

    if (!gameMap || !gameMap.grid || !player || !playerPosition || !fogMap) {
      return <div>Error: Essential map, player, or fog data missing.</div>;
    }

    const mapTotalWidth = gameMap.width * TILE_SIZE;
    const mapTotalHeight = gameMap.height * TILE_SIZE;
    const tilesToRender: React.ReactElement[] = [];

    if (visibleTilesRange) {
      for (let y = visibleTilesRange.minY; y <= visibleTilesRange.maxY; y++) {
        for (let x = visibleTilesRange.minX; x <= visibleTilesRange.maxX; x++) {
          if (y < 0 || y >= gameMap.height || x < 0 || x >= gameMap.width)
            continue;
          const cell = gameMap.grid[y]?.[x];
          const fogCellState = fogMap[y]?.[x];

          if (!cell || !fogCellState) {
            tilesToRender.push(
              <div
                key={`${x}-${y}-error`}
                style={{
                  position: 'absolute',
                  left: x * TILE_SIZE,
                  top: y * TILE_SIZE,
                  width: TILE_SIZE,
                  height: TILE_SIZE,
                  backgroundColor: '#FF00FF',
                  zIndex: 0,
                }}
              />,
            );
            continue;
          }

          let displayContent = getTerrainIcon(cell.terrain);
          let tileColor = 'transparent';
          let opacity = 1;
          let zIndex = 0;

          switch (fogCellState.status) {
            case 'Unseen':
              tileColor = '#111';
              displayContent = ' ';
              opacity = 1;
              break;
            case 'Explored':
              tileColor = '#555';
              opacity =
                0.6 +
                0.4 * (1 - Math.min(1, fogCellState.turnsSinceLastSeen / 10));
              break;
            case 'Visible':
              tileColor = 'transparent';
              opacity = 1;
              break;
          }

          if (x === playerPosition.x && y === playerPosition.y) {
            displayContent = '🦍';
            zIndex = 2;
            tileColor = 'transparent';
            opacity = 1;
          } else if (cell.interaction?.type === 'city_entrance') {
            displayContent = '🏙️';
            zIndex = 1;
          }

          tilesToRender.push(
            <div
              key={`${x}-${y}`}
              className="map-tile"
              style={{
                position: 'absolute',
                left: x * TILE_SIZE,
                top: y * TILE_SIZE,
                width: TILE_SIZE,
                height: TILE_SIZE,
                backgroundColor: tileColor,
                opacity: opacity,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: FONT_SIZE,
                zIndex: zIndex,
                cursor:
                  isCellSelectionModeActive && cell ? 'crosshair' : 'default',
                transition:
                  'opacity 0.5s ease-in-out, background-color 0.5s ease-in-out',
              }}
              onClick={() => handleTileClick(x, y, cell)}
            >
              {displayContent}
            </div>,
          );
        }
      }
    }

    return (
      <div
        ref={scrollContainerRef}
        className="map-scroll-container"
        style={{
          width: '100%',
          height: '100%',
          maxWidth: MAP_VIEWPORT_MAX_WIDTH,
          maxHeight: MAP_VIEWPORT_MAX_HEIGHT,
          overflow: 'auto',
          position: 'relative',
          backgroundColor: '#333',
          border: '2px solid #666',
          borderRadius: '8px',
          margin: '0 auto',
        }}
      >
        <div
          className="map-content"
          style={{
            width: `${mapTotalWidth}px`,
            height: `${mapTotalHeight}px`,
            position: 'relative',
          }}
        >
          {tilesToRender}
        </div>
      </div>
    );
  },
);
export default MapDisplay;
