
const { Pool } = require("pg");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

async function initializeDatabase() {
    const sql = fs.readFileSync(
        path.join(__dirname, "db", "init.sql"),
        "utf8"
    );

    await pool.query(sql);
    console.log("PostgreSQL tasks table is ready.");
}

initializeDatabase().catch((error) => {
    console.error("Database initialization failed:", error.message);
});

module.exports = pool;

