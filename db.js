/** Database setup for BizTime. */

const { Client } = require("pg");

const db = new Client({
  database: "biztime"
});

db.connect();

module.exports = db;