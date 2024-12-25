const sqlite3 = require("sqlite3");
const { open } = require("sqlite");
const path = require("path");

let db = null;

async function initDb() {
  if (!db) {
    const dbPath = path.join(
      __dirname,
      "..",
      "..",
      "database",
      "learn-to-code.db"
    );
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });

    // Create tables if they don't exist
    await db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE,
        password TEXT,
        email TEXT UNIQUE
      );

      CREATE TABLE IF NOT EXISTS flashcards (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        category TEXT,
        question TEXT,
        answer TEXT
      );

      CREATE TABLE IF NOT EXISTS quizzes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT,
        description TEXT,
        questions TEXT
      );

      CREATE TABLE IF NOT EXISTS progress (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        quiz_id INTEGER,
        score INTEGER,
        completed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id)
      );
    `);
  }
  return db;
}

async function getDb() {
  if (!db) {
    await initDb();
  }
  return db;
}

module.exports = {
  initDb,
  getDb,
};
