const express = require('express');
const cors = require('cors');
const path = require('path');
const { db } = require(path.join(__dirname, '..', 'firebase-config'));

const app = express();
app.use(express.json());
app.use(cors());

const COL = 'machines';
app.get('/machines', async (req, res) => {
    try {
        const snap = await db.collection(COL).get();
        const machines = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.json(machines);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
app.get('/machines/:id', async (req, res) => {
    try {
        const doc = await db.collection(COL).doc(req.params.id).get();
        if (!doc.exists) return res.status(404).json({ error: 'Machine not found' });
        res.json({ id: doc.id, ...doc.data() });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/machines', async (req, res) => {
    try {
        const newMachine = {
            name: req.body.name || '',
            location: req.body.location || '',
            status: req.body.status || 'Operational',
            interval: Number(req.body.interval) || 30,
            lastMaintenance: req.body.lastMaintenance || new Date().toISOString().split('T')[0],
            priority: req.body.priority || 'Medium',
            machine_id: String(Date.now())
        };
        const ref = await db.collection(COL).add(newMachine);
        res.status(201).json({ message: 'Machine Added', id: ref.id, machine: newMachine });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
app.put('/machines/:id', async (req, res) => {
    try {
        const doc = db.collection(COL).doc(req.params.id);
        const snap = await doc.get();
        if (!snap.exists) return res.status(404).json({ error: 'Machine not found' });
        await doc.update(req.body);
        res.json({ message: 'Machine Updated' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
app.delete('/machines/:id', async (req, res) => {
    try {
        await db.collection(COL).doc(req.params.id).delete();
        res.json({ message: 'Machine Deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(8001, () => console.log('Machine Service running on http://localhost:8001'));
