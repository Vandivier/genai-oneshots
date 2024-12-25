const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const { initDb } = require("./db");
const auth = require("./routes/auth");
const flashcards = require("./routes/flashcards");

const app = express();
const PORT = process.env.PORT || 3001;

// Ensure database directory exists
const dbDir = path.join(__dirname, "..", "..", "database");
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

app.use(cors());
app.use(express.json());

// Initialize database
initDb().catch(console.error);

// Routes
app.use("/api/auth", auth);
app.use("/api/flashcards", flashcards);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
