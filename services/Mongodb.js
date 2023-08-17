const { MongoClient } = require("mongodb");

const mongoConnectionUri =
  "mongodb+srv://JoshuaHayward:Gosthatsit2@cluster0.oevvccf.mongodb.net/FinalSprintCars";

let client;
let db; // Add this line

async function connectToMongoDB() {
  try {
    client = new MongoClient(mongoConnectionUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    await client.connect();
    console.log("Connected to MongoDB");

    db = client.db("FinalSprintCars"); // Assign the 'db' object
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
}

function getDb() {
  return db;
}

module.exports = { connectToMongoDB, getDb };
