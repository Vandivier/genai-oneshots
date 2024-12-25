import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "../hooks/useTheme";

const Navigation: React.FC = () => {
  const { isAuthenticated, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <nav className="navigation">
      <div className="container mx-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <Link to="/" className="text-xl font-bold text-primary">
              Learn to Code
            </Link>
            <div className="nav-list">
              <Link to="/learn" className="nav-link">
                Learn
              </Link>
              <Link to="/flashcards" className="nav-link">
                Flashcards
              </Link>
              <Link to="/quizzes" className="nav-link">
                Quizzes
              </Link>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-muted"
            >
              {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            {isAuthenticated ? (
              <>
                <Link to="/profile" className="nav-link">
                  Profile
                </Link>
                <button onClick={logout} className="button">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="nav-link">
                  Login
                </Link>
                <Link to="/register" className="button">
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
