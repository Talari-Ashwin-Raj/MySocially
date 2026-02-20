const { db, initDb } = require('./database');
const fs = require('fs');
const path = require('path');

function seed() {
    initDb();

    const dataPath = path.resolve(__dirname, '../analytics/summary_data.json');
    if (!fs.existsSync(dataPath)) {
        console.error("Summary data not found! Run Part A first.");
        return;
    }

    const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

    // Clear existing data
    db.prepare('DELETE FROM channels').run();
    db.prepare('DELETE FROM monthly_performance').run();
    db.prepare('DELETE FROM campaigns').run();
    db.prepare('DELETE FROM insights').run();
    db.prepare('DELETE FROM summary').run();

    // Seed Channels
    const insertChannel = db.prepare(`
        INSERT INTO channels (name, spend, impressions, clicks, conversions, revenue, ctr, cpc, roas, cpa, cvr)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const ch of data.channels) {
        insertChannel.run(ch.channel, ch.spend, ch.impressions, ch.clicks, ch.conversions, ch.revenue, ch.ctr, ch.cpc, ch.roas, ch.cpa, ch.cvr);
    }

    // Seed Monthly Performance
    const insertMonthly = db.prepare(`
        INSERT INTO monthly_performance (month, spend, revenue, conversions)
        VALUES (?, ?, ?, ?)
    `);

    for (const m of data.monthly_performance) {
        insertMonthly.run(m.month, m.spend, m.revenue, m.conversions);
    }

    // Seed Campaigns
    const insertCampaign = db.prepare(`
        INSERT INTO campaigns (channel, campaign_name, spend, impressions, clicks, conversions, revenue, roas, cpa)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const camp of data.campaigns) {
        insertCampaign.run(camp.channel, camp.campaign_name, camp.spend, camp.impressions, camp.clicks, camp.conversions, camp.revenue, camp.roas, camp.cpa);
    }

    // Seed Insights
    const insertInsight = db.prepare('INSERT INTO insights (content) VALUES (?)');
    for (const insight of data.insights) {
        insertInsight.run(insight);
    }

    // Seed Summary
    const s = data.total_metrics;
    db.prepare(`
        INSERT INTO summary (id, total_spend, total_revenue, total_conversions, overall_roas)
        VALUES (1, ?, ?, ?, ?)
    `).run(s.total_spend, s.total_revenue, s.total_conversions, s.overall_roas);

    console.log("Seeding complete.");
}

seed();
