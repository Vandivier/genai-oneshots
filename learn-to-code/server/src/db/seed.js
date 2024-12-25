const { getDb } = require("../db");
const seedFlashcards = require("./seeds/flashcards");

async function seedDatabase() {
  const db = await getDb();

  try {
    await seedFlashcards(db);
    console.log("Database seeded successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}

seedDatabase();
