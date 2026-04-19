const { Client } = require("pg");

const DB_URI =
  process.env.NODE_ENV === "test"
    ? "biztime_test"
    : "biztime";

const db = new Client({
  database: DB_URI
});

db.connect();

module.exports = db;