import React, { useState, useRef, useEffect, useCallback } from 'react';
import type { GameMap, MapCell } from '../../types/mapTypes';
import type { PlayerCharacter } from '../../types/characterTypes';
import type { FogMap, FogCellState } from '../../types/fogTypes';

interface MapDisplayProps {
  gameMap: GameMap;
  player: PlayerCharacter;
  playerPosition: { x: number; y: number };
  fogMap: FogMap;
}

const TILE_SIZE = 32; // pixels

// Define max dimensions for the scrollable map viewport
const MAP_VIEWPORT_MAX_WIDTH = '80vw'; // e.g., 80% of viewport width
const MAP_VIEWPORT_MAX_HEIGHT = '70vh'; // e.g., 70% of viewport height
const RENDER_BUFFER = 2; // Render 2 extra tiles in each direction beyond viewport

interface TileDisplay {
  backgroundColor: string;
  opacity: number;
  emoji?: string;
}

interface VisibleTileRange {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}

const getTileDisplay = (cell: MapCell, fogCell: FogCellState): TileDisplay => {
  switch (fogCell.status) {
    case 'Unseen':
      return { backgroundColor: '#000000', opacity: 1, emoji: '' };
    case 'Explored': {
      let exploredOpacity = 0.5 - (fogCell.turnsSinceLastSeen / 10) * 0.3;
      exploredOpacity = Math.max(0.2, exploredOpacity);

      const baseDisplay = getBaseTerrainDisplay(cell);
      return {
        backgroundColor: baseDisplay.backgroundColor,
        opacity: exploredOpacity,
        emoji: baseDisplay.emoji ? ` ` : undefined,
      };
    }
    case 'Visible':
      break;
    default:
      return { backgroundColor: '#FF00FF', opacity: 1, emoji: '❓' };
  }

  return getBaseTerrainDisplay(cell);
};

const getBaseTerrainDisplay = (cell: MapCell): TileDisplay => {
  let display: TileDisplay = { backgroundColor: '#ECF0F1', opacity: 1 };

  switch (cell.terrain) {
    case 'grass':
      display = { backgroundColor: '#2ECC71', opacity: 1, emoji: '' };
      break;
    case 'forest':
      display = { backgroundColor: '#27AE60', opacity: 1, emoji: '🌲' };
      break;
    case 'water':
      display = { backgroundColor: '#3498DB', opacity: 1, emoji: '💧' };
      break;
    case 'mountain':
      display = { backgroundColor: '#7F8C8D', opacity: 1, emoji: '⛰️' };
      break;
    case 'town_floor':
      display = { backgroundColor: '#BDC3C7', opacity: 1 };
      break;
    case 'building_wall':
      display = { backgroundColor: '#A93226', opacity: 1, emoji: '🧱' };
      break;
    case 'building_door':
      display = { backgroundColor: '#D35400', opacity: 1, emoji: '🚪' };
      break;
    case 'road':
      display = { backgroundColor: '#B2BABB', opacity: 1 };
      break;
    case 'empty':
      display = { backgroundColor: '#566573', opacity: 1 };
      break;
    default:
      break;
  }

  if (cell.interaction?.type === 'npc') {
    display.emoji = '🧑';
  }
  return display;
};

// Simplified debounce function signature for browser environment
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

const MapDisplay: React.FC<MapDisplayProps> = ({
  gameMap,
  player,
  playerPosition,
  fogMap,
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
  }, [gameMap]); // gameMap dependency for width/height

  // Debounced version for scroll events
  const debouncedCalculateVisibleTiles = useCallback(
    debounce(calculateAndUpdateVisibleTiles, 100),
    [calculateAndUpdateVisibleTiles],
  );

  // Effect for scrolling the player into view and initial/map change FoW calculation
  useEffect(() => {
    if (
      scrollContainerRef.current &&
      playerPosition &&
      gameMap &&
      gameMap.grid
    ) {
      const container = scrollContainerRef.current;
      const playerVisualCenterX = playerPosition.x * TILE_SIZE + TILE_SIZE / 2;
      const playerVisualCenterY = playerPosition.y * TILE_SIZE + TILE_SIZE / 2;
      const targetScrollLeft = playerVisualCenterX - container.offsetWidth / 2;
      const targetScrollTop = playerVisualCenterY - container.offsetHeight / 2;
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
      // Calculate visible tiles after centering or if map changes
      calculateAndUpdateVisibleTiles();
    }
  }, [playerPosition, gameMap, calculateAndUpdateVisibleTiles]);

  // Effect for scroll event listener on the container
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', debouncedCalculateVisibleTiles);
      // Initial calculation in case the map loaded before player position centering finished scrolling
      calculateAndUpdateVisibleTiles();
      return () =>
        container.removeEventListener('scroll', debouncedCalculateVisibleTiles);
    }
  }, [debouncedCalculateVisibleTiles, calculateAndUpdateVisibleTiles]);

  if (!gameMap || !gameMap.grid || !player || !playerPosition || !fogMap) {
    console.error('[MapDisplay.tsx] Critical props missing', {
      gameMap,
      player,
      playerPosition,
      fogMap,
    });
    return <div>Error: Essential map, player, or fog data missing.</div>;
  }

  const mapTotalWidth = gameMap.width * TILE_SIZE;
  const mapTotalHeight = gameMap.height * TILE_SIZE;

  // Tiles to render based on viewport
  const tilesToRender: React.ReactElement[] = [];
  if (visibleTilesRange) {
    for (let y = visibleTilesRange.minY; y <= visibleTilesRange.maxY; y++) {
      for (let x = visibleTilesRange.minX; x <= visibleTilesRange.maxX; x++) {
        // Boundary checks just in case, though range calculation should handle it
        if (y < 0 || y >= gameMap.height || x < 0 || x >= gameMap.width)
          continue;

        const cell = gameMap.grid[y]?.[x];
        const fogCellState = fogMap[y]?.[x];

        if (!cell || !fogCellState) {
          console.warn(`[MapDisplay] Missing cell or fog data for ${x},${y}`);
          // Render a placeholder or skip
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
              }}
            />,
          );
          continue;
        }
        const tileDisplay = getTileDisplay(cell, fogCellState);
        tilesToRender.push(
          <div
            key={`${x}-${y}`}
            style={{
              position: 'absolute',
              left: x * TILE_SIZE,
              top: y * TILE_SIZE,
              width: TILE_SIZE,
              height: TILE_SIZE,
              backgroundColor: tileDisplay.backgroundColor,
              opacity: tileDisplay.opacity,
              border: '1px solid #444',
              boxSizing: 'border-box',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: TILE_SIZE * 0.6,
              transition:
                'opacity 0.5s ease-in-out, background-color 0.5s ease-in-out',
            }}
          >
            {(fogCellState.status === 'Visible' ||
              (fogCellState.status === 'Explored' &&
                tileDisplay.emoji?.trim())) &&
              tileDisplay.emoji}
          </div>,
        );
      }
    }
  }

  return (
    <div
      ref={scrollContainerRef}
      style={{
        maxWidth: MAP_VIEWPORT_MAX_WIDTH,
        maxHeight: MAP_VIEWPORT_MAX_HEIGHT,
        // Important: Set actual width and height for the scroll container's content to be the total map size
        // The visible tiles will be absolutely positioned within this.
        width: `${mapTotalWidth}px`,
        height: `${mapTotalHeight}px`,
        overflow: 'auto',
        border: '2px solid #555',
        position: 'relative',
        backgroundColor: '#333',
      }}
      className="map-scroll-container"
    >
      {tilesToRender} {/* Render only the calculated visible tiles */}
      <div
        style={{
          position: 'absolute',
          left: playerPosition.x * TILE_SIZE + TILE_SIZE / 4,
          top: playerPosition.y * TILE_SIZE + TILE_SIZE / 4,
          width: TILE_SIZE / 2,
          height: TILE_SIZE / 2,
          backgroundColor: 'red',
          borderRadius: '50%',
          zIndex: 10,
          transition: 'left 0.1s linear, top 0.1s linear',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: TILE_SIZE * 0.3,
        }}
        title={player.name}
      >
        🦍
      </div>
    </div>
  );
};

export default MapDisplay;
