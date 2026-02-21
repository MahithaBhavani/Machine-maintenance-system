const express = require('express');
const cors = require('cors');
const app = express();
app.use(express.json());
app.use(cors());
const MACHINE_SVC = 'http://localhost:8001';
const TASK_SVC = 'http://localhost:3002';
const SCHEDULER_SVC = 'http://localhost:3003';
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const proxy = async (res, promiseFn) => {
    try {
        const r = await promiseFn();
        const data = await r.json();
        res.status(r.status).json(data);
    } catch (err) {
        res.status(502).json({ error: 'Service unavailable', detail: err.message });
    }
};
app.get('/machines', (req, res) =>
    proxy(res, () => fetch(`${MACHINE_SVC}/machines`)));

app.get('/machines/:id', (req, res) =>
    proxy(res, () => fetch(`${MACHINE_SVC}/machines/${req.params.id}`)));

app.post('/machines', (req, res) =>
    proxy(res, () => fetch(`${MACHINE_SVC}/machines`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(req.body)
    })));

app.put('/machines/:id', (req, res) =>
    proxy(res, () => fetch(`${MACHINE_SVC}/machines/${req.params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(req.body)
    })));

app.delete('/machines/:id', (req, res) =>
    proxy(res, () => fetch(`${MACHINE_SVC}/machines/${req.params.id}`, { method: 'DELETE' })));
app.get('/tasks', (req, res) =>
    proxy(res, () => fetch(`${TASK_SVC}/tasks`)));

app.get('/tasks/upcoming', (req, res) =>
    proxy(res, () => fetch(`${TASK_SVC}/tasks/upcoming`)));

app.get('/tasks/overdue', (req, res) =>
    proxy(res, () => fetch(`${TASK_SVC}/tasks/overdue`)));

app.get('/tasks/machine/:machineId', (req, res) =>
    proxy(res, () => fetch(`${TASK_SVC}/tasks/machine/${req.params.machineId}`)));

app.get('/tasks/:id', (req, res) =>
    proxy(res, () => fetch(`${TASK_SVC}/tasks/${req.params.id}`)));

app.post('/tasks', (req, res) =>
    proxy(res, () => fetch(`${TASK_SVC}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(req.body)
    })));

app.put('/tasks/:id', (req, res) =>
    proxy(res, () => fetch(`${TASK_SVC}/tasks/${req.params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(req.body)
    })));

app.delete('/tasks/:id', (req, res) =>
    proxy(res, () => fetch(`${TASK_SVC}/tasks/${req.params.id}`, { method: 'DELETE' })));
app.get('/predict/:interval', (req, res) =>
    proxy(res, () => fetch(`${SCHEDULER_SVC}/predict/${req.params.interval}`)));

app.post('/assess', (req, res) =>
    proxy(res, () => fetch(`${SCHEDULER_SVC}/assess`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(req.body)
    })));

app.get('/health', (req, res) =>
    res.json({ status: 'ok', service: 'API Gateway', port: 3000, timestamp: new Date().toISOString() }));

app.listen(3000, () => {
    console.log(' API Gateway running on http://localhost:3000');
    console.log('   → Machine Service : http://localhost:8001');
    console.log('   → Task Service    : http://localhost:3002');
    console.log('   → Scheduler Svc   : http://localhost:3003');
});
