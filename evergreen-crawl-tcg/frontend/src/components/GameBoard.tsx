import {
  Box,
  Grid,
  GridItem,
  Text,
  VStack,
  HStack,
  Button,
} from "@chakra-ui/react";
import { useState } from "react";

interface Cell {
  x: number;
  y: number;
  type: string;
  isVisible: boolean;
  isVisited: boolean;
}

const GameBoard = () => {
  const [cells, setCells] = useState<Cell[]>([]);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const gridSize = 10;

  const getCellColor = (type: string) => {
    switch (type) {
      case "empty":
        return "gray.100";
      case "monster":
        return "red.200";
      case "treasure":
        return "yellow.200";
      case "trap":
        return "orange.200";
      case "merchant":
        return "blue.200";
      case "shrine":
        return "purple.200";
      case "miniboss":
        return "red.400";
      case "exit":
        return "green.400";
      default:
        return "gray.50";
    }
  };

  return (
    <VStack spacing={8}>
      <Text fontSize="2xl" fontWeight="bold">
        Dungeon Level 1
      </Text>
      <Grid templateColumns={`repeat(${gridSize}, 1fr)`} gap={1}>
        {Array.from({ length: gridSize * gridSize }).map((_, index) => {
          const x = index % gridSize;
          const y = Math.floor(index / gridSize);
          const cell = cells.find((c) => c.x === x && c.y === y);
          const isCurrentPosition = x === position.x && y === position.y;

          return (
            <GridItem
              key={index}
              w="50px"
              h="50px"
              bg={cell?.isVisible ? getCellColor(cell.type) : "gray.700"}
              border="1px"
              borderColor={isCurrentPosition ? "blue.500" : "gray.200"}
              borderWidth={isCurrentPosition ? "3px" : "1px"}
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              {cell?.isVisible && (
                <Text fontSize="xs" fontWeight="bold">
                  {cell.type.charAt(0).toUpperCase()}
                </Text>
              )}
            </GridItem>
          );
        })}
      </Grid>
      <HStack spacing={4}>
        <Button
          onClick={() =>
            setPosition((p) => ({ ...p, y: Math.max(0, p.y - 1) }))
          }
          isDisabled={position.y === 0}
        >
          Up
        </Button>
        <Button
          onClick={() =>
            setPosition((p) => ({ ...p, y: Math.min(gridSize - 1, p.y + 1) }))
          }
          isDisabled={position.y === gridSize - 1}
        >
          Down
        </Button>
        <Button
          onClick={() =>
            setPosition((p) => ({ ...p, x: Math.max(0, p.x - 1) }))
          }
          isDisabled={position.x === 0}
        >
          Left
        </Button>
        <Button
          onClick={() =>
            setPosition((p) => ({ ...p, x: Math.min(gridSize - 1, p.x + 1) }))
          }
          isDisabled={position.x === gridSize - 1}
        >
          Right
        </Button>
      </HStack>
    </VStack>
  );
};

export default GameBoard;
