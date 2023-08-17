const fs = require("fs");
const path = require("path");

const logFilePath = path.join(__dirname, "query_log.txt");

function logQuery(userId, query, dataSource) {
  const timestamp = new Date().toISOString();
  const logEntry = `${timestamp} | User ID: ${userId} | Data Source: ${dataSource} | Query: ${query}\n`;

  try {
    fs.writeFileSync(logFilePath, logEntry, { flag: "a" }); // Use 'a' flag for append
    console.log("Query logged:", logEntry);
  } catch (err) {
    console.error("Error logging query:", err);
  }
}

module.exports = logQuery;
