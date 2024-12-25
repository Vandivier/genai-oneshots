# Learn to Code

An interactive platform for learning JavaScript, HTML, and CSS with built-in code execution, flashcards, and LinkedIn-verified credentials.

## Features

- 🎯 Interactive JavaScript code editor and runner
- 📝 Comprehensive lessons and tutorials
- 💡 Flashcard system for JavaScript, HTML, and CSS concepts
- ✅ Quiz system with progress tracking
- 🏆 LinkedIn credential publishing upon quiz completion
- 👤 User authentication system
- 📊 Progress tracking with SQLite database

## Project Structure

/
├── client/ # Frontend React application
│ ├── src/
│ │ ├── components/ # Reusable UI components
│ │ ├── pages/ # Page components
│ │ └── contexts/ # React contexts
├── server/ # Backend Node.js application
│ ├── src/
│ │ ├── routes/ # API routes
│ │ ├── db/ # Database setup
│ │ └── middleware/ # Express middleware
└── database/ # SQLite database files

## Setup Instructions

First, install all dependencies:

```bash
npm run install:all
```

### Running the Application (Recommended Method)

Open two terminal windows:

Terminal 1 (Client):

```bash
cd client
npm run dev
```

Frontend will be available at <http://localhost:5173>

Terminal 2 (Server):

```bash
cd server
npm run dev
```

Backend API will be running at <http://localhost:3001>

### Alternative: Running Both Together

You can run both services in one terminal, but separate terminals are recommended for clearer logs:

```bash
npm run dev
```

## Tech Stack

### Frontend

- React with TypeScript
- Vite for build tooling
- CodeMirror for code editing
- React Router for navigation
- Axios for API requests

### Backend

- Node.js with Express
- SQLite for database
- JWT for authentication
- bcrypt for password hashing

## API Endpoints

- `POST /api/auth/register` - Create new user account
- `POST /api/auth/login` - User login
- `GET /api/flashcards` - Get flashcards
- `POST /api/quizzes/submit` - Submit quiz answers
- `POST /api/linkedin/publish` - Publish credentials to LinkedIn
