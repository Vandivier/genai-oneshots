import {
  VStack,
  HStack,
  Box,
  Heading,
  Text,
  Button,
  Input,
  SimpleGrid,
  useToast,
} from "@chakra-ui/react";
import { useState } from "react";

interface Card {
  id: number;
  name: string;
  power_level: number;
  rarity: string;
  effect_description?: string;
}

const DeckBuilder = () => {
  const [deckName, setDeckName] = useState("");
  const [selectedCards, setSelectedCards] = useState<Card[]>([]);
  const toast = useToast();

  const handleSaveDeck = () => {
    if (selectedCards.length < 13) {
      toast({
        title: "Invalid Deck",
        description: "Deck must contain at least 13 cards",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    toast({
      title: "Deck Saved",
      description: `Deck "${deckName}" has been saved`,
      status: "success",
      duration: 3000,
      isClosable: true,
    });
  };

  return (
    <VStack spacing={8}>
      <Heading>Deck Builder</Heading>
      <HStack w="full" spacing={8}>
        {/* Collection */}
        <Box flex={1}>
          <Heading size="md" mb={4}>
            Collection
          </Heading>
          <SimpleGrid columns={[2, 3, 4]} spacing={4}>
            {/* Placeholder for collection cards */}
            {Array.from({ length: 8 }).map((_, i) => (
              <Box
                key={i}
                p={4}
                bg="white"
                borderWidth="1px"
                borderRadius="lg"
                cursor="pointer"
                onClick={() => {
                  // Add card to deck logic
                }}
              >
                <Text>Card {i + 1}</Text>
                <Text fontSize="sm" color="gray.500">
                  Power: {Math.floor(Math.random() * 5) + 1}
                </Text>
              </Box>
            ))}
          </SimpleGrid>
        </Box>

        {/* Current Deck */}
        <Box flex={1}>
          <VStack align="stretch" spacing={4}>
            <Heading size="md">Current Deck</Heading>
            <Input
              placeholder="Deck Name"
              value={deckName}
              onChange={(e) => setDeckName(e.target.value)}
            />
            <Text>Cards: {selectedCards.length} / 104 (Minimum: 13)</Text>
            <Box
              borderWidth="1px"
              borderRadius="lg"
              p={4}
              minH="400px"
              bg="white"
            >
              {selectedCards.length === 0 ? (
                <Text color="gray.500">No cards selected</Text>
              ) : (
                <SimpleGrid columns={[2, 3]} spacing={2}>
                  {selectedCards.map((card, i) => (
                    <Box
                      key={i}
                      p={2}
                      bg="gray.100"
                      borderRadius="md"
                      fontSize="sm"
                    >
                      {card.name}
                    </Box>
                  ))}
                </SimpleGrid>
              )}
            </Box>
            <Button
              colorScheme="blue"
              onClick={handleSaveDeck}
              isDisabled={!deckName || selectedCards.length < 13}
            >
              Save Deck
            </Button>
          </VStack>
        </Box>
      </HStack>
    </VStack>
  );
};

export default DeckBuilder;
