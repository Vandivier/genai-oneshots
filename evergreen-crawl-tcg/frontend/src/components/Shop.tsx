import {
  VStack,
  Heading,
  SimpleGrid,
  Box,
  Text,
  Button,
  Image,
  useToast,
} from "@chakra-ui/react";

interface Card {
  id: number;
  name: string;
  power_level: number;
  rarity: string;
  effect_description?: string;
}

const Shop = () => {
  const toast = useToast();

  const handlePurchase = (type: string) => {
    toast({
      title: "Purchase Successful",
      description: "You have purchased a new card!",
      status: "success",
      duration: 3000,
      isClosable: true,
    });
  };

  return (
    <VStack spacing={8}>
      <Heading>Card Shop</Heading>
      <SimpleGrid columns={[1, 2, 3]} spacing={8}>
        <Box
          p={5}
          shadow="md"
          borderWidth="1px"
          borderRadius="lg"
          bg="white"
          textAlign="center"
        >
          <Heading size="md" mb={4}>
            Featured Card
          </Heading>
          <Box
            bg="gray.100"
            w="full"
            h="200px"
            mb={4}
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <Text>Card Preview</Text>
          </Box>
          <Button
            colorScheme="blue"
            onClick={() => handlePurchase("featured")}
            w="full"
          >
            Buy for 100 Gold
          </Button>
        </Box>

        <Box
          p={5}
          shadow="md"
          borderWidth="1px"
          borderRadius="lg"
          bg="white"
          textAlign="center"
        >
          <Heading size="md" mb={4}>
            Random Card
          </Heading>
          <Box
            bg="gray.100"
            w="full"
            h="200px"
            mb={4}
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <Text>?</Text>
          </Box>
          <Button
            colorScheme="purple"
            onClick={() => handlePurchase("random")}
            w="full"
          >
            Buy for 50 Gold
          </Button>
        </Box>

        <Box
          p={5}
          shadow="md"
          borderWidth="1px"
          borderRadius="lg"
          bg="white"
          textAlign="center"
        >
          <Heading size="md" mb={4}>
            Card Pack
          </Heading>
          <Box
            bg="gray.100"
            w="full"
            h="200px"
            mb={4}
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <Text>5 Cards</Text>
          </Box>
          <Button
            colorScheme="green"
            onClick={() => handlePurchase("pack")}
            w="full"
          >
            Buy for 150 Gold
          </Button>
        </Box>
      </SimpleGrid>
    </VStack>
  );
};

export default Shop;
