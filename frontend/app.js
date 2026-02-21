const GW = 'http://localhost:3000';
let allTasks = [];
const today = () => new Date().toISOString().split('T')[0];
const TAB_META = {
    dashboard: { title: 'Dashboard', subtitle: 'Real-time machine maintenance overview' },
    machines: { title: 'Machines', subtitle: 'Fleet management — view, add, update, delete machines' },
    tasks: { title: 'All Tasks', subtitle: 'Browse and manage all maintenance tasks' },
    schedule: { title: 'Schedule', subtitle: 'Schedule new tasks and register machines' },
    upcoming: { title: 'Upcoming Tasks', subtitle: 'Tasks due in the near future' },
    predict: { title: 'Risk Predictor', subtitle: 'Assess maintenance failure risk by interval or fleet' },
};

function switchTab(tab) {
    document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    document.getElementById(`tab-${tab}`).classList.add('active');
    document.getElementById(`nav-${tab}`).classList.add('active');
    document.getElementById('pageTitle').textContent = TAB_META[tab].title;
    document.getElementById('pageSubtitle').textContent = TAB_META[tab].subtitle;

    if (tab === 'tasks') renderTaskTable();
    if (tab === 'upcoming') loadUpcoming();
    if (tab === 'schedule') populateMachineSelect();
}
function toast(type, title, message) {
    const icons = { success: 'bi-check-circle-fill', error: 'bi-x-circle-fill', info: 'bi-info-circle-fill' };
    const container = document.getElementById('toast-container');
    const el = document.createElement('div');
    el.className = `toast ${type}`;
    el.innerHTML = `
        <i class="bi ${icons[type]} toast-icon"></i>
        <div><div class="toast-title">${title}</div><div class="toast-msg">${message}</div></div>`;
    container.appendChild(el);
    setTimeout(() => el.remove(), 4000);
}
function statusBadge(status) {
    const map = {
        'Operational': 'badge-green',
        'Completed': 'badge-green',
        'Needs Maintenance': 'badge-yellow',
        'Pending': 'badge-yellow',
        'Under Maintenance': 'badge-orange',
        'In Progress': 'badge-orange',
        'Scheduled': 'badge-blue',
        'Offline': 'badge-red',
        'Critical': 'badge-red',
    };
    return `<span class="badge ${map[status] || 'badge-gray'}">${status}</span>`;
}

function priorityBadge(p) {
    const map = { Critical: 'badge-red', High: 'badge-orange', Medium: 'badge-yellow', Low: 'badge-gray' };
    return `<span class="badge ${map[p] || 'badge-gray'}">${p || 'Medium'}</span>`;
}
async function apiFetch(path, opts = {}) {
    const res = await fetch(`${GW}${path}`, {
        headers: { 'Content-Type': 'application/json' },
        ...opts
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
}
async function refreshAll() {
    checkConnection();
    await Promise.all([loadMachines(), loadAllTasks()]);
    renderDashboard();
}

async function loadMachines() {
    try {
        allMachines = await apiFetch('/machines');
        renderMachineTable();
    } catch (e) {
        console.error('Machine load failed:', e);
    }
}

async function loadAllTasks() {
    try {
        allTasks = await apiFetch('/tasks');
        renderTaskTable();
    } catch (e) {
        console.error('Task load failed:', e);
    }
}
function renderDashboard() {
    const pending = allTasks.filter(t => t.status === 'Pending' || t.status === 'Scheduled' || t.status === 'In Progress').length;
    const overdue = allTasks.filter(t => t.scheduledDate < today() && t.status !== 'Completed').length;
    const completed = allTasks.filter(t => t.status === 'Completed').length;

    document.getElementById('stat-machines').textContent = allMachines.length;
    document.getElementById('stat-pending').textContent = pending;
    document.getElementById('stat-overdue').textContent = overdue;
    document.getElementById('stat-completed').textContent = completed;
    const cutoff = new Date(); cutoff.setDate(cutoff.getDate() + 30);
    const cutoffStr = cutoff.toISOString().split('T')[0];
    const upcoming = allTasks
        .filter(t => t.scheduledDate >= today() && t.scheduledDate <= cutoffStr && t.status !== 'Completed')
        .sort((a, b) => a.scheduledDate.localeCompare(b.scheduledDate))
        .slice(0, 8);

    document.getElementById('dash-upcoming-table').innerHTML = upcoming.length
        ? upcoming.map(t => `
            <tr>
                <td>${getMachineName(t.machineId)}</td>
                <td>${t.description}</td>
                <td>${t.scheduledDate}</td>
                <td>${priorityBadge(t.priority)}</td>
            </tr>`).join('')
        : `<tr><td colspan="4"><div class="empty-state"><i class="bi bi-calendar-check"></i><p>No upcoming tasks in 30 days</p></div></td></tr>`;
    const overdueList = allTasks
        .filter(t => t.scheduledDate < today() && t.status !== 'Completed')
        .sort((a, b) => a.scheduledDate.localeCompare(b.scheduledDate))
        .slice(0, 8);

    document.getElementById('dash-overdue-table').innerHTML = overdueList.length
        ? overdueList.map(t => `
            <tr class="overdue-row">
                <td>${getMachineName(t.machineId)}</td>
                <td>${t.description}</td>
                <td style="color:var(--red)">${t.scheduledDate}</td>
                <td>${statusBadge(t.status)}</td>
            </tr>`).join('')
        : `<tr><td colspan="4"><div class="empty-state"><i class="bi bi-check-circle"></i><p>No overdue tasks 🎉</p></div></td></tr>`;
}

function getMachineName(machineId) {
    const m = allMachines.find(m => m.id === machineId || m.machine_id === machineId);
    return m ? m.name : `Machine ${machineId}`;
}
function renderMachineTable() {
    const tbody = document.getElementById('machine-table');
    if (!allMachines.length) {
        tbody.innerHTML = `<tr><td colspan="6"><div class="empty-state"><i class="bi bi-cpu"></i><p>No machines found</p></div></td></tr>`;
        return;
    }
    tbody.innerHTML = allMachines.map(m => {
        const safeName = m.name.replace(/'/g, "\\'");
        return `
        <tr>
            <td><strong>${m.name}</strong></td>
            <td><span style="color:var(--text-muted)">${m.location || '—'}</span></td>
            <td>${m.interval || '—'} days</td>
            <td>${m.lastMaintenance || '—'}</td>
            <td>${statusBadge(m.status)}</td>
            <td>
                <button class="btn btn-ghost btn-sm" onclick="viewMachine('${m.id}')">
                    <i class="bi bi-eye"></i>
                </button>
                <button class="btn btn-danger btn-sm" style="margin-left:6px" onclick="deleteMachine('${m.id}','${safeName}')">
                    <i class="bi bi-trash3"></i>
                </button>
            </td>
        </tr>`;
    }).join('');
}

async function addMachine() {
    const name = document.getElementById('new-mach-name').value.trim();
    const location = document.getElementById('new-mach-loc').value.trim();
    const interval = document.getElementById('new-mach-interval').value;
    const status = document.getElementById('new-mach-status').value;
    const last = document.getElementById('new-mach-last').value || today();

    if (!name || !location || !interval) {
        toast('error', 'Validation Error', 'Name, location, and interval are required.');
        return;
    }

    try {
        await apiFetch('/machines', {
            method: 'POST',
            body: JSON.stringify({ name, location, interval: Number(interval), status, lastMaintenance: last })
        });
        toast('success', 'Machine Added', `${name} added to the fleet.`);
        ['new-mach-name', 'new-mach-loc', 'new-mach-interval', 'new-mach-last'].forEach(id => document.getElementById(id).value = '');
        await loadMachines();
    } catch (e) {
        toast('error', 'Error', 'Could not add machine. Is the gateway running?');
    }
}

async function deleteMachine(id, name) {
    if (!confirm(`Delete machine "${name}"? This cannot be undone.`)) return;
    try {
        await apiFetch(`/machines/${id}`, { method: 'DELETE' });
        toast('success', 'Deleted', `${name} removed from fleet.`);
        await refreshAll();
    } catch (e) {
        toast('error', 'Error', 'Could not delete machine.');
    }
}

async function viewMachine(id) {
    const m = allMachines.find(x => x.id === id);
    if (!m) return;
    const tasks = allTasks.filter(t => t.machineId === id || t.machineId === m.machine_id);
    const pending = tasks.filter(t => t.status !== 'Completed').length;

    document.getElementById('modal-machine-title').textContent = m.name;
    document.getElementById('modal-machine-body').innerHTML = `
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:20px">
            <div><div style="color:var(--text-muted);font-size:0.73rem;margin-bottom:4px">LOCATION</div><div style="font-weight:600">${m.location || '—'}</div></div>
            <div><div style="color:var(--text-muted);font-size:0.73rem;margin-bottom:4px">STATUS</div>${statusBadge(m.status)}</div>
            <div><div style="color:var(--text-muted);font-size:0.73rem;margin-bottom:4px">INTERVAL</div><div style="font-weight:600">${m.interval} days</div></div>
            <div><div style="color:var(--text-muted);font-size:0.73rem;margin-bottom:4px">LAST MAINTENANCE</div><div style="font-weight:600">${m.lastMaintenance || '—'}</div></div>
        </div>
        <div style="margin-bottom:14px;font-size:0.82rem;color:var(--text-muted)">${pending} pending task(s) | ${tasks.length} total task(s)</div>
        <table style="width:100%;font-size:0.82rem;border-collapse:collapse">
            <thead><tr>
                <th style="padding:8px 10px;text-align:left;border-bottom:1px solid var(--border);color:var(--text-muted);font-size:0.7rem">TASK</th>
                <th style="padding:8px 10px;text-align:left;border-bottom:1px solid var(--border);color:var(--text-muted);font-size:0.7rem">DATE</th>
                <th style="padding:8px 10px;text-align:left;border-bottom:1px solid var(--border);color:var(--text-muted);font-size:0.7rem">STATUS</th>
            </tr></thead>
            <tbody>${tasks.length
            ? tasks.map(t => `<tr>
                    <td style="padding:8px 10px;border-bottom:1px solid var(--border)">${t.description}</td>
                    <td style="padding:8px 10px;border-bottom:1px solid var(--border)">${t.scheduledDate}</td>
                    <td style="padding:8px 10px;border-bottom:1px solid var(--border)">${statusBadge(t.status)}</td>
                  </tr>`).join('')
            : '<tr><td colspan="3" style="padding:20px;text-align:center;color:var(--text-muted)">No tasks yet</td></tr>'
        }</tbody>
        </table>`;
    document.getElementById('machineModal').classList.add('show');
}

function showAddMachineModal() {
    switchTab('schedule');
    document.getElementById('nav-schedule').scrollIntoView();
}
function renderTaskTable() {
    const filter = document.getElementById('taskFilterStatus')?.value || '';
    const tasks = filter ? allTasks.filter(t => t.status === filter) : allTasks;
    const tbody = document.getElementById('task-table');

    if (!tasks.length) {
        tbody.innerHTML = `<tr><td colspan="6"><div class="empty-state"><i class="bi bi-list-check"></i><p>No tasks found</p></div></td></tr>`;
        return;
    }

    tbody.innerHTML = tasks.map(t => {
        const isOverdue = t.scheduledDate < today() && t.status !== 'Completed';
        return `
        <tr class="${isOverdue ? 'overdue-row' : ''}">
            <td>${getMachineName(t.machineId)}</td>
            <td>${t.description}</td>
            <td style="${isOverdue ? 'color:var(--red)' : ''}">${t.scheduledDate}</td>
            <td>${priorityBadge(t.priority)}</td>
            <td>${statusBadge(t.status)}</td>
            <td>
                <button class="btn btn-ghost btn-sm" onclick="openEditTask('${t.id}','${t.status}','${t.notes || ''}')">
                    <i class="bi bi-pencil-square"></i>
                </button>
                <button class="btn btn-danger btn-sm" style="margin-left:6px" onclick="deleteTask('${t.id}')">
                    <i class="bi bi-trash3"></i>
                </button>
            </td>
        </tr>`}).join('');
}

function filterTasks() { renderTaskTable(); }

async function deleteTask(id) {
    if (!confirm('Delete this task?')) return;
    try {
        await apiFetch(`/tasks/${id}`, { method: 'DELETE' });
        toast('success', 'Deleted', 'Task removed.');
        await loadAllTasks();
    } catch (e) {
        toast('error', 'Error', 'Could not delete task.');
    }
}

function openEditTask(id, status, notes) {
    document.getElementById('edit-task-id').value = id;
    document.getElementById('edit-task-status').value = status;
    document.getElementById('edit-task-notes').value = notes !== 'undefined' ? notes : '';
    document.getElementById('taskModal').classList.add('show');
}

async function saveTaskUpdate() {
    const id = document.getElementById('edit-task-id').value;
    const status = document.getElementById('edit-task-status').value;
    const notes = document.getElementById('edit-task-notes').value;
    try {
        await apiFetch(`/tasks/${id}`, {
            method: 'PUT',
            body: JSON.stringify({ status, notes })
        });
        toast('success', 'Updated', 'Task status saved.');
        closeModal('taskModal');
        await loadAllTasks();
        renderDashboard();
    } catch (e) {
        toast('error', 'Error', 'Could not update task.');
    }
}
async function scheduleTask() {
    const machineId = document.getElementById('sch-machine').value;
    const desc = document.getElementById('sch-desc').value.trim();
    const date = document.getElementById('sch-date').value;
    const priority = document.getElementById('sch-priority').value;
    const notes = document.getElementById('sch-notes').value.trim();

    if (!machineId || !desc || !date) {
        toast('error', 'Validation Error', 'Machine, description, and date are required.');
        return;
    }

    try {
        await apiFetch('/tasks', {
            method: 'POST',
            body: JSON.stringify({ machineId, description: desc, scheduledDate: date, priority, notes, status: 'Scheduled' })
        });
        toast('success', 'Task Scheduled', `"${desc}" scheduled for ${date}.`);
        ['sch-desc', 'sch-notes'].forEach(id => document.getElementById(id).value = '');
        document.getElementById('sch-date').value = today();  // reset to today, not empty
        document.getElementById('sch-machine').value = '';
        document.getElementById('sch-priority').value = 'Medium';
        await loadAllTasks();
        renderDashboard();
    } catch (e) {
        toast('error', 'Error', 'Could not schedule task. Is the gateway running?');
    }
}

function populateMachineSelect() {
    const sel = document.getElementById('sch-machine');
    const cur = sel.value;
    sel.innerHTML = '<option value="">Select machine...</option>' +
        allMachines.map(m => `<option value="${m.id}" ${m.id === cur ? 'selected' : ''}>${m.name} (${m.location})</option>`).join('');
}
async function loadUpcoming() {
    const tbody = document.getElementById('upcoming-table');
    try {
        const upcoming = await apiFetch('/tasks/upcoming');
        document.getElementById('upcoming-count').textContent = `${upcoming.length} task(s)`;
        tbody.innerHTML = upcoming.length
            ? upcoming.map(t => `
                <tr>
                    <td>${getMachineName(t.machineId)}</td>
                    <td>${t.description}</td>
                    <td>${t.scheduledDate}</td>
                    <td>${priorityBadge(t.priority)}</td>
                    <td>${statusBadge(t.status)}</td>
                    <td>
                        <button class="btn btn-ghost btn-sm" onclick="openEditTask('${t.id}','${t.status}','${t.notes || ''}')">
                            <i class="bi bi-pencil-square"></i>
                        </button>
                    </td>
                </tr>`).join('')
            : `<tr><td colspan="6"><div class="empty-state"><i class="bi bi-calendar-check"></i><p>No upcoming tasks</p></div></td></tr>`;
    } catch (e) {
        tbody.innerHTML = `<tr><td colspan="6" style="color:var(--red);text-align:center;padding:30px">Could not load upcoming tasks.</td></tr>`;
    }
}
async function checkRisk() {
    const interval = document.getElementById('pred-interval').value;
    const resultEl = document.getElementById('risk-result');
    if (!interval || interval <= 0) {
        toast('error', 'Invalid', 'Enter a positive interval in days.');
        return;
    }
    try {
        const data = await apiFetch(`/predict/${interval}`);
        const colors = { Critical: 'var(--red)', High: 'var(--orange)', Moderate: 'var(--yellow)', Low: 'var(--green)' };
        resultEl.innerHTML = `
            <div class="risk-level" style="color:${colors[data.level] || 'var(--text-primary)'}">${data.emoji} ${data.level} Risk</div>
            <div class="risk-message">${data.message}</div>
            <div style="margin-top:10px;font-size:0.78rem;color:var(--text-dim)">Interval: ${data.interval} days</div>`;
        resultEl.className = 'risk-result show';
    } catch (e) {
        toast('error', 'Error', 'Could not reach scheduler service.');
    }
}

async function assessFleet() {
    const report = document.getElementById('fleet-report');
    report.innerHTML = '<div style="color:var(--text-muted);font-size:0.83rem">Assessing all machines...</div>';
    try {
        const payload = allMachines.map(m => ({
            id: m.id, name: m.name,
            interval: m.interval || 30,
            lastMaintenance: m.lastMaintenance || today()
        }));
        const results = await apiFetch('/assess', {
            method: 'POST',
            body: JSON.stringify({ machines: payload })
        });
        const colors = { Critical: 'var(--red)', High: 'var(--orange)', Moderate: 'var(--yellow)', Low: 'var(--green)' };
        report.innerHTML = results.map(r => `
            <div style="display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid var(--border)">
                <div>
                    <div style="font-weight:600;font-size:0.85rem">${r.name}</div>
                    <div style="font-size:0.75rem;color:var(--text-muted)">${r.daysUntilDue >= 0 ? `Due in ${r.daysUntilDue} day(s)` : `Overdue by ${Math.abs(r.daysUntilDue)} day(s)`}</div>
                </div>
                <span class="badge" style="background:${colors[r.risk]}22;color:${colors[r.risk]};border-color:${colors[r.risk]}44">${r.risk}</span>
            </div>`).join('');
    } catch (e) {
        report.innerHTML = '<div style="color:var(--red);font-size:0.83rem">Could not assess fleet.</div>';
    }
}

function closeModal(id) {
    document.getElementById(id).classList.remove('show');
}

document.addEventListener('click', e => {
    if (e.target.classList.contains('modal-overlay')) {
        e.target.classList.remove('show');
    }
});
async function checkConnection() {
    const dot = document.getElementById('connectionDot');
    const txt = document.getElementById('connectionStatus');
    try {
        await fetch(`${GW}/health`);
        dot.style.background = 'var(--green)'; dot.style.boxShadow = '0 0 6px var(--green)';
        txt.textContent = 'Gateway Online';
    } catch {
        dot.style.background = 'var(--red)'; dot.style.boxShadow = '0 0 6px var(--red)';
        txt.textContent = 'Gateway Offline';
    }
}
(async () => {
    // Set default date in schedule form
    document.getElementById('sch-date').value = today();
    await refreshAll();
})();
