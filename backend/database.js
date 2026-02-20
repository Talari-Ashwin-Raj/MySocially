const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.resolve(__dirname, 'marketing.db');
const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

function initDb() {
    console.log("Initializing database schema...");

    // Channels table
    db.prepare(`
        CREATE TABLE IF NOT EXISTS channels (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT UNIQUE,
            spend REAL,
            impressions INTEGER,
            clicks INTEGER,
            conversions INTEGER,
            revenue REAL,
            ctr REAL,
            cpc REAL,
            roas REAL,
            cpa REAL,
            cvr REAL
        )
    `).run();

    // Monthly Performance table
    db.prepare(`
        CREATE TABLE IF NOT EXISTS monthly_performance (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            month TEXT UNIQUE,
            spend REAL,
            revenue REAL,
            conversions INTEGER
        )
    `).run();

    // Campaigns table
    db.prepare(`
        CREATE TABLE IF NOT EXISTS campaigns (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            channel TEXT,
            campaign_name TEXT,
            spend REAL,
            impressions INTEGER,
            clicks INTEGER,
            conversions INTEGER,
            revenue REAL,
            roas REAL,
            cpa REAL
        )
    `).run();

    // Insights table
    db.prepare(`
        CREATE TABLE IF NOT EXISTS insights (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            content TEXT
        )
    `).run();

    // Summary Metadata table
    db.prepare(`
        CREATE TABLE IF NOT EXISTS summary (
            id INTEGER PRIMARY KEY CHECK (id = 1),
            total_spend REAL,
            total_revenue REAL,
            total_conversions INTEGER,
            overall_roas REAL
        )
    `).run();

    console.log("Database schema ready.");
}

module.exports = { db, initDb };
