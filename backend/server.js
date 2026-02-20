const express = require('express');
const cors = require('cors');
const { db } = require('./database');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

// 1. GET /api/summary - Aggregate metrics
app.get('/api/summary', (req, res) => {
    try {
        const summary = db.prepare('SELECT * FROM summary WHERE id = 1').get();
        res.json(summary);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 2. GET /api/channels - Channel-level data with sorting
app.get('/api/channels', (req, res) => {
    try {
        const { sort_by = 'roas', order = 'DESC' } = req.query;

        // Validate sort_by to prevent SQL injection
        const allowedColumns = ['name', 'spend', 'impressions', 'clicks', 'conversions', 'revenue', 'ctr', 'cpc', 'roas', 'cpa', 'cvr'];
        const sortColumn = allowedColumns.includes(sort_by) ? sort_by : 'roas';
        const sortOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

        const channels = db.prepare(`SELECT * FROM channels ORDER BY ${sortColumn} ${sortOrder}`).all();
        res.json(channels);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 3. GET /api/monthly - Monthly trend data
app.get('/api/monthly', (req, res) => {
    try {
        const trends = db.prepare('SELECT * FROM monthly_performance ORDER BY month ASC').all();
        res.json(trends);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 4. GET /api/campaigns - Campaign-level data with filters
app.get('/api/campaigns', (req, res) => {
    try {
        const { channel, min_roas } = req.query;
        let query = 'SELECT * FROM campaigns';
        let params = [];
        let conditions = [];

        if (channel) {
            conditions.push('channel = ?');
            params.push(channel);
        }
        if (min_roas) {
            conditions.push('roas >= ?');
            params.push(parseFloat(min_roas));
        }

        if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
        }

        query += ' ORDER BY roas DESC';

        const campaigns = db.prepare(query).all(...params);
        res.json(campaigns);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 5. GET /api/insights - AI-generated recommendations
app.get('/api/insights', (req, res) => {
    try {
        const insights = db.prepare('SELECT content FROM insights').all();
        res.json(insights.map(i => i.content));
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
