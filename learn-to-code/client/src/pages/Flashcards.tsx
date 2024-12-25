import React, { useState, useEffect } from "react";
import axios from "axios";

interface Flashcard {
  id: number;
  category: string;
  question: string;
  answer: string;
}

const Flashcards: React.FC = () => {
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [currentCard, setCurrentCard] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFlashcards = async () => {
      try {
        console.log("Fetching flashcards...");
        const response = await axios.get(
          "http://localhost:3001/api/flashcards"
        );
        console.log("Received response:", response.data);
        setFlashcards(response.data);
        setError(null);
      } catch (error) {
        console.error("Error fetching flashcards:", error);
        setError("Failed to load flashcards. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchFlashcards();
  }, []);

  if (loading) return <div className="text-center p-4">Loading...</div>;
  if (error) return <div className="text-red-500 p-4">{error}</div>;
  if (flashcards.length === 0) {
    return (
      <div className="text-center p-4">
        <p>No flashcards available.</p>
        <p className="text-sm text-muted-foreground">
          Make sure the server is running and the database is seeded.
        </p>
      </div>
    );
  }

  const card = flashcards[currentCard];

  const handleNext = () => {
    setCurrentCard((prev) => (prev + 1) % flashcards.length);
    setIsFlipped(false);
  };

  const handlePrevious = () => {
    setCurrentCard((prev) => (prev === 0 ? flashcards.length - 1 : prev - 1));
    setIsFlipped(false);
  };

  return (
    <div className="flex flex-col items-center p-8">
      <h1 className="text-2xl font-bold mb-8">JavaScript Flashcards</h1>
      <div
        className={`flashcard ${isFlipped ? "flipped" : ""}`}
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <div className="flashcard-inner">
          <div className="card-front">
            <h3 className="text-lg font-semibold mb-2">{card.category}</h3>
            <p className="text-lg">{card.question}</p>
          </div>
          <div className="card-back">
            <p className="text-lg whitespace-pre-line">{card.answer}</p>
          </div>
        </div>
      </div>
      <div className="flex gap-4 mt-8">
        <button onClick={handlePrevious} className="button">
          Previous
        </button>
        <button onClick={handleNext} className="button">
          Next
        </button>
      </div>
    </div>
  );
};

export default Flashcards;
