import { Box, Flex, Button, Heading, Spacer } from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";

const Navigation = () => {
  return (
    <Box bg="teal.500" px={4} py={4}>
      <Flex maxW="container.xl" mx="auto" alignItems="center">
        <Heading size="md" color="white">
          Evergreen Crawl TCG
        </Heading>
        <Spacer />
        <Flex gap={4}>
          <Button
            as={RouterLink}
            to="/"
            colorScheme="teal"
            variant="ghost"
            color="white"
            _hover={{ bg: "teal.600" }}
          >
            Game
          </Button>
          <Button
            as={RouterLink}
            to="/shop"
            colorScheme="teal"
            variant="ghost"
            color="white"
            _hover={{ bg: "teal.600" }}
          >
            Shop
          </Button>
          <Button
            as={RouterLink}
            to="/deck-builder"
            colorScheme="teal"
            variant="ghost"
            color="white"
            _hover={{ bg: "teal.600" }}
          >
            Deck Builder
          </Button>
        </Flex>
      </Flex>
    </Box>
  );
};

export default Navigation;
