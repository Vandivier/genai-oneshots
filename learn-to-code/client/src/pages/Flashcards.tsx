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

  useEffect(() => {
    const fetchFlashcards = async () => {
      try {
        const response = await axios.get(
          "http://localhost:3001/api/flashcards"
        );
        setFlashcards(response.data);
      } catch (error) {
        console.error("Error fetching flashcards:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFlashcards();
  }, []);

  const handleNext = () => {
    setCurrentCard((prev) => (prev + 1) % flashcards.length);
    setIsFlipped(false);
  };

  const handlePrevious = () => {
    setCurrentCard((prev) => (prev === 0 ? flashcards.length - 1 : prev - 1));
    setIsFlipped(false);
  };

  if (loading) return <div>Loading...</div>;
  if (flashcards.length === 0) return <div>No flashcards available.</div>;

  const card = flashcards[currentCard];

  return (
    <div className="flashcards-page">
      <h1>JavaScript Flashcards</h1>
      <div
        className={`flashcard ${isFlipped ? "flipped" : ""}`}
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <div className="card-inner">
          <div className="card-front">
            <h3>{card.category}</h3>
            <p>{card.question}</p>
          </div>
          <div className="card-back">
            <p>{card.answer}</p>
          </div>
        </div>
      </div>
      <div className="controls">
        <button onClick={handlePrevious}>Previous</button>
        <button onClick={handleNext}>Next</button>
      </div>
    </div>
  );
};

export default Flashcards;
