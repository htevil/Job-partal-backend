//database.js
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.db');

db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        email TEXT UNIQUE,
        password TEXT,
        phone TEXT,
        age INTEGER,
        graduate_year INTEGER,
        degree TEXT,
        branch TEXT,
        college TEXT,
        interest TEXT,
        cv TEXT
    )`);
});

module.exports = db;