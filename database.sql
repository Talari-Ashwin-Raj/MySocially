-- Database Schema for MySocially Marketing Dashboard

-- Channels Performance Table
CREATE TABLE channels (
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
);

-- Monthly Trends Table
CREATE TABLE monthly_performance (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    month TEXT UNIQUE,
    spend REAL,
    revenue REAL,
    conversions INTEGER
);

-- Detailed Campaigns Table
CREATE TABLE campaigns (
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
);

-- Strategy Insights Table
CREATE TABLE insights (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    content TEXT
);

-- Aggregated Summary Metadata
CREATE TABLE summary (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    total_spend REAL,
    total_revenue REAL,
    total_conversions INTEGER,
    overall_roas REAL
);
