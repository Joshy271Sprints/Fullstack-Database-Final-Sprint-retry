const Pool = require("pg").Pool;

const pool = new Pool({
  user: "postgres",
  password: "Gosthatsit2",
  database: "FinalSprintCars",
  host: "localhost",
  port: 5432,
});

pool
  .connect()
  .then((client) => {
    console.log("Connected to the database");
    client.release();
  })
  .catch((error) => {
    console.error("Error connecting to database:", error);
  });

module.exports = pool;
