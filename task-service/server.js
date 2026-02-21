const express = require('express');
const cors = require('cors');
const path = require('path');
const { db } = require(path.join(__dirname, '..', 'firebase-config'));
const app = express();
app.use(express.json());
app.use(cors());
const COL = 'tasks';
const today = () => new Date().toISOString().split('T')[0];
app.get('/tasks', async (req, res) => {
    try {
        const snap = await db.collection(COL).get();
        const tasks = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.json(tasks);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
app.get('/tasks/upcoming', async (req, res) => {
    try {
        const snap = await db.collection(COL).get();
        const upcoming = snap.docs
            .map(doc => ({ id: doc.id, ...doc.data() }))
            .filter(t =>
                t.scheduledDate >= today() &&
                t.status !== 'Completed'
            )
            .sort((a, b) => a.scheduledDate.localeCompare(b.scheduledDate));
        res.json(upcoming);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
app.get('/tasks/overdue', async (req, res) => {
    try {
        const snap = await db.collection(COL).get();
        const overdue = snap.docs
            .map(doc => ({ id: doc.id, ...doc.data() }))
            .filter(t =>
                t.scheduledDate < today() &&
                t.status !== 'Completed'
            )
            .sort((a, b) => a.scheduledDate.localeCompare(b.scheduledDate));
        res.json(overdue);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
app.get('/tasks/machine/:machineId', async (req, res) => {
    try {
        const snap = await db.collection(COL)
            .where('machineId', '==', req.params.machineId)
            .get();
        const tasks = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.json(tasks);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
app.get('/tasks/:id', async (req, res) => {
    try {
        const doc = await db.collection(COL).doc(req.params.id).get();
        if (!doc.exists) return res.status(404).json({ error: 'Task not found' });
        res.json({ id: doc.id, ...doc.data() });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/tasks', async (req, res) => {
    try {
        const newTask = {
            machineId: String(req.body.machineId || ''),
            description: req.body.description || '',
            scheduledDate: req.body.scheduledDate || today(),
            status: req.body.status || 'Scheduled',
            priority: req.body.priority || 'Medium',
            completedOn: req.body.completedOn || '',
            notes: req.body.notes || '',
            createdAt: today()
        };
        const ref = await db.collection(COL).add(newTask);
        res.status(201).json({ message: 'Task Scheduled', id: ref.id, task: { id: ref.id, ...newTask } });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
app.put('/tasks/:id', async (req, res) => {
    try {
        const doc = db.collection(COL).doc(req.params.id);
        const snap = await doc.get();
        if (!snap.exists) return res.status(404).json({ error: 'Task not found' });
        // Auto-set completedOn when marking Completed
        if (req.body.status === 'Completed' && !req.body.completedOn) {
            req.body.completedOn = today();
        }
        await doc.update(req.body);
        res.json({ message: 'Task Updated' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
app.delete('/tasks/:id', async (req, res) => {
    try {
        await db.collection(COL).doc(req.params.id).delete();
        res.json({ message: 'Task Deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(3002, () => console.log('Task Service running on http://localhost:3002'));
