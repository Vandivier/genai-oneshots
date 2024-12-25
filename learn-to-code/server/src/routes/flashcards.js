const express = require("express");
const router = express.Router();
const { getDb } = require("../db");

router.get("/", async (req, res) => {
  const db = await getDb();
  try {
    const flashcards = await db.all("SELECT * FROM flashcards");
    res.json(flashcards);
  } catch (error) {
    res.status(500).json({ error: "Error fetching flashcards" });
  }
});

router.post("/", async (req, res) => {
  const { category, question, answer } = req.body;
  const db = await getDb();

  try {
    const result = await db.run(
      "INSERT INTO flashcards (category, question, answer) VALUES (?, ?, ?)",
      [category, question, answer]
    );
    res.status(201).json({ id: result.lastID });
  } catch (error) {
    res.status(500).json({ error: "Error creating flashcard" });
  }
});

module.exports = router;
