const path = require("path");
const fs = require("fs");
const { DatabaseSync } = require("node:sqlite");

require("dotenv").config({ path: path.join(__dirname, "..", "..", ".env") });

const DB_DIR = path.join(__dirname, "..", "..", "data");
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

const DB_PATH = process.env.DB_PATH || path.join(DB_DIR, "university.db");

const db = new DatabaseSync(DB_PATH);
db.exec("PRAGMA foreign_keys = ON;");

module.exports = db;