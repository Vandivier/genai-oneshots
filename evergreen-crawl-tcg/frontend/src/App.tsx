import { ChakraProvider, Box, Container } from "@chakra-ui/react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "react-query";
import GameBoard from "./components/GameBoard";
import Shop from "./components/Shop";
import DeckBuilder from "./components/DeckBuilder";
import Navigation from "./components/Navigation";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ChakraProvider>
        <Router>
          <Box minH="100vh" bg="gray.100">
            <Navigation />
            <Container maxW="container.xl" py={8}>
              <Routes>
                <Route path="/" element={<GameBoard />} />
                <Route path="/shop" element={<Shop />} />
                <Route path="/deck-builder" element={<DeckBuilder />} />
              </Routes>
            </Container>
          </Box>
        </Router>
      </ChakraProvider>
    </QueryClientProvider>
  );
}

export default App;
