const express = require('express');
const cors = require('cors');
const app = express();
app.use(express.json());
app.use(cors());

/**
 * Risk Predictor — returns maintenance risk tier based on interval (days)
 * Intervals: < 10 = Critical, < 20 = High, < 35 = Moderate, >= 35 = Low
 */
app.get('/predict/:interval', (req, res) => {
    const interval = Number(req.params.interval);
    if (isNaN(interval) || interval <= 0) {
        return res.status(400).json({ error: 'Invalid interval. Must be a positive number.' });
    }

    let risk;
    if (interval < 10) {
        risk = { level: 'Critical', emoji: '🔴', message: 'Critical Failure Risk — Immediate maintenance required!', color: 'danger' };
    } else if (interval < 20) {
        risk = { level: 'High', emoji: '🟠', message: 'High Failure Risk — Schedule maintenance urgently.', color: 'warning' };
    } else if (interval < 35) {
        risk = { level: 'Moderate', emoji: '🟡', message: 'Moderate Risk — Plan maintenance soon.', color: 'info' };
    } else {
        risk = { level: 'Low', emoji: '🟢', message: 'Low Risk — Machine is within safe maintenance window.', color: 'success' };
    }

    res.json({ interval, ...risk });
});

/**
 * Bulk risk assessment — returns all machines with risk scores
 * Accepts: POST /assess with body { machines: [{id, name, interval, lastMaintenance}] }
 */
app.post('/assess', (req, res) => {
    const { machines } = req.body;
    if (!Array.isArray(machines)) {
        return res.status(400).json({ error: 'Body must contain a machines array' });
    }

    const today = new Date();
    const results = machines.map(m => {
        const last = new Date(m.lastMaintenance);
        const daysSince = Math.floor((today - last) / (1000 * 60 * 60 * 24));
        const daysUntilDue = (m.interval || 30) - daysSince;

        let risk = 'Low';
        if (daysUntilDue <= 0) risk = 'Critical';
        else if (daysUntilDue <= 5) risk = 'High';
        else if (daysUntilDue <= 14) risk = 'Moderate';

        return { id: m.id, name: m.name, daysSince, daysUntilDue, risk };
    });

    res.json(results);
});

app.listen(3003, () => console.log(' Scheduler Service running on http://localhost:3003'));
