const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const { initDb } = require("./db");
const auth = require("./routes/auth");
const flashcards = require("./routes/flashcards");

const app = express();
const PORT = process.env.PORT || 3001;

// Configure CORS more explicitly
app.use(
  cors({
    origin: "http://localhost:5173", // Vite's default port
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.use(express.json());

// Ensure database directory exists
const dbDir = path.join(__dirname, "..", "..", "database");
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// Initialize database
initDb().catch(console.error);

// Routes
app.use("/api/auth", auth);
app.use("/api/flashcards", flashcards);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
