/**
 * seed.js — One-time Firestore seeder
 * Run: node seed.js
 * Populates 'machines' and 'tasks' collections with expanded sample data.
 */

const { db } = require('./firebase-config');

const machines = [
    { machine_id: '1', name: 'Press 101', location: 'Plant 1-S', lastMaintenance: '2025-11-01', interval: 30, status: 'Operational' },
    { machine_id: '2', name: 'Press 102', location: 'Plant 1-S', lastMaintenance: '2025-10-15', interval: 30, status: 'Needs Maintenance' },
    { machine_id: '3', name: 'Conveyor Belt A', location: 'Plant 2-P', lastMaintenance: '2025-12-20', interval: 7, status: 'Operational' },
    { machine_id: '4', name: 'Pump X7', location: 'Plant 1-B', lastMaintenance: '2025-12-01', interval: 90, status: 'Under Maintenance' },
    { machine_id: '5', name: 'Generator G1', location: 'Plant 2-P', lastMaintenance: '2025-07-01', interval: 180, status: 'Operational' },
    { machine_id: '6', name: 'CNC Machine M3', location: 'Plant 3-C', lastMaintenance: '2025-12-10', interval: 14, status: 'Operational' },
    { machine_id: '7', name: 'Lathe L2', location: 'Plant 3-C', lastMaintenance: '2025-11-20', interval: 21, status: 'Operational' },
    { machine_id: '8', name: 'Compressor C1', location: 'Plant 1-B', lastMaintenance: '2025-09-01', interval: 60, status: 'Needs Maintenance' },
    { machine_id: '9', name: 'Robot Arm RA5', location: 'Plant 2-P', lastMaintenance: '2026-01-05', interval: 30, status: 'Operational' },
    { machine_id: '10', name: 'Forklift F11', location: 'Plant 1-S', lastMaintenance: '2025-12-28', interval: 45, status: 'Operational' },
    { machine_id: '11', name: 'Welding Unit W9', location: 'Plant 3-C', lastMaintenance: '2025-10-01', interval: 30, status: 'Offline' },
    { machine_id: '12', name: 'Chiller Unit CU2', location: 'Plant 1-B', lastMaintenance: '2025-11-15', interval: 90, status: 'Operational' },
];

const tasks = [
    { task_id: '1', machineId: '1', description: 'Replace hydraulic oil', scheduledDate: '2025-09-30', status: 'Completed', completedOn: '2025-10-01', priority: 'High' },
    { task_id: '2', machineId: '1', description: 'General inspection', scheduledDate: '2025-12-01', status: 'Completed', completedOn: '2025-12-01', priority: 'Medium' },
    { task_id: '3', machineId: '1', description: 'Replace coolant filter', scheduledDate: '2026-01-05', status: 'Scheduled', completedOn: '', priority: 'High' },
    { task_id: '4', machineId: '2', description: 'Lubrication check', scheduledDate: '2025-12-15', status: 'Pending', completedOn: '', priority: 'Medium' },
    { task_id: '5', machineId: '2', description: 'Inspect safety guards', scheduledDate: '2025-09-15', status: 'Completed', completedOn: '2025-09-15', priority: 'High' },
    { task_id: '6', machineId: '3', description: 'Weekly belt alignment', scheduledDate: '2025-12-20', status: 'Completed', completedOn: '2025-12-20', priority: 'Low' },
    { task_id: '7', machineId: '3', description: 'Motor temperature check', scheduledDate: '2026-03-01', status: 'Scheduled', completedOn: '', priority: 'Medium' },
    { task_id: '8', machineId: '4', description: 'Replace valve seals', scheduledDate: '2026-02-25', status: 'In Progress', completedOn: '', priority: 'High' },
    { task_id: '9', machineId: '4', description: 'Pressure test', scheduledDate: '2026-03-15', status: 'Scheduled', completedOn: '', priority: 'High' },
    { task_id: '10', machineId: '5', description: 'Inspect generator coils', scheduledDate: '2025-07-01', status: 'Completed', completedOn: '2025-07-01', priority: 'Medium' },
    { task_id: '11', machineId: '5', description: 'Change oil filter', scheduledDate: '2026-03-15', status: 'Scheduled', completedOn: '', priority: 'Medium' },
    { task_id: '12', machineId: '6', description: 'Calibrate CNC spindle', scheduledDate: '2026-02-24', status: 'Scheduled', completedOn: '', priority: 'High' },
    { task_id: '13', machineId: '6', description: 'Clean coolant reservoir', scheduledDate: '2026-03-10', status: 'Scheduled', completedOn: '', priority: 'Low' },
    { task_id: '14', machineId: '7', description: 'Sharpen cutting tools', scheduledDate: '2026-02-21', status: 'Pending', completedOn: '', priority: 'Medium' },
    { task_id: '15', machineId: '8', description: 'Check air filter', scheduledDate: '2026-02-22', status: 'Scheduled', completedOn: '', priority: 'High' },
    { task_id: '16', machineId: '8', description: 'Inspect pressure relief valve', scheduledDate: '2026-03-05', status: 'Scheduled', completedOn: '', priority: 'High' },
    { task_id: '17', machineId: '9', description: 'Grease joint actuators', scheduledDate: '2026-02-28', status: 'Scheduled', completedOn: '', priority: 'Medium' },
    { task_id: '18', machineId: '10', description: 'Brake system check', scheduledDate: '2026-03-12', status: 'Scheduled', completedOn: '', priority: 'High' },
    { task_id: '19', machineId: '11', description: 'Inspect welding nozzle', scheduledDate: '2026-02-25', status: 'Scheduled', completedOn: '', priority: 'High' },
    { task_id: '20', machineId: '12', description: 'Clean condenser coils', scheduledDate: '2026-03-20', status: 'Scheduled', completedOn: '', priority: 'Low' },
    { task_id: '21', machineId: '2', description: 'Hydraulic pressure test', scheduledDate: '2026-03-01', status: 'Scheduled', completedOn: '', priority: 'High' },
    { task_id: '22', machineId: '3', description: 'Replace conveyor belt', scheduledDate: '2026-03-27', status: 'Scheduled', completedOn: '', priority: 'Medium' },
];

async function seed() {
    console.log(' Seeding Firestore...\n');
    const machinesCol = db.collection('machines');
    for (const m of machines) {
        await machinesCol.doc(m.machine_id).set(m);
        console.log(`  Machine: ${m.name}`);
    }
    const tasksCol = db.collection('tasks');
    for (const t of tasks) {
        await tasksCol.doc(t.task_id).set(t);
        console.log(`  Task: ${t.description} (Machine ${t.machineId})`);
    }

    console.log(`\n Seeding complete! ${machines.length} machines and ${tasks.length} tasks added.`);
    process.exit(0);
}

seed().catch(err => {
    console.error(' Seed failed:', err.message);
    process.exit(1);
});
