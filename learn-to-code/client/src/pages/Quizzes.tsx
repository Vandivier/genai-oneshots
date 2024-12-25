import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";

interface Question {
  id: number;
  text: string;
  options: string[];
  correctAnswer: number;
}

interface Quiz {
  id: number;
  title: string;
  description: string;
  questions: Question[];
}

const Quizzes: React.FC = () => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [currentQuiz, setCurrentQuiz] = useState<Quiz | null>(null);
  const [answers, setAnswers] = useState<number[]>([]);
  const [score, setScore] = useState<number | null>(null);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const response = await axios.get("http://localhost:3001/api/quizzes");
        setQuizzes(response.data);
      } catch (error) {
        console.error("Error fetching quizzes:", error);
      }
    };

    fetchQuizzes();
  }, []);

  const handleStartQuiz = (quiz: Quiz) => {
    setCurrentQuiz(quiz);
    setAnswers([]);
    setScore(null);
  };

  const handleAnswer = (questionIndex: number, answerIndex: number) => {
    const newAnswers = [...answers];
    newAnswers[questionIndex] = answerIndex;
    setAnswers(newAnswers);
  };

  const handleSubmit = async () => {
    if (!currentQuiz || !isAuthenticated) return;

    try {
      const response = await axios.post("/api/quizzes/submit", {
        quizId: currentQuiz.id,
        answers,
      });
      setScore(response.data.score);
    } catch (error) {
      console.error("Error submitting quiz:", error);
    }
  };

  if (!currentQuiz) {
    return (
      <div className="quizzes-page">
        <h1>Available Quizzes</h1>
        <div className="quiz-list">
          {quizzes.map((quiz) => (
            <div key={quiz.id} className="quiz-card">
              <h3>{quiz.title}</h3>
              <p>{quiz.description}</p>
              <button onClick={() => handleStartQuiz(quiz)}>Start Quiz</button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="quiz-page">
      <h1>{currentQuiz.title}</h1>
      {currentQuiz.questions.map((question, qIndex) => (
        <div key={question.id} className="question">
          <h3>{question.text}</h3>
          <div className="options">
            {question.options.map((option, oIndex) => (
              <label key={oIndex}>
                <input
                  type="radio"
                  name={`question-${qIndex}`}
                  checked={answers[qIndex] === oIndex}
                  onChange={() => handleAnswer(qIndex, oIndex)}
                />
                {option}
              </label>
            ))}
          </div>
        </div>
      ))}
      <button
        onClick={handleSubmit}
        disabled={
          !isAuthenticated || answers.length !== currentQuiz.questions.length
        }
      >
        Submit Quiz
      </button>
      {score !== null && (
        <div className="score">
          Your score: {score}/{currentQuiz.questions.length}
        </div>
      )}
    </div>
  );
};

export default Quizzes;
