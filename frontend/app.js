function getStatusBadge(status){
    switch(status.toLowerCase()){
        case "operational": return '<span class="badge bg-success badge-status">Operational</span>';
        case "needs maintenance": return '<span class="badge bg-warning badge-status">Needs Maintenance</span>';
        case "under maintenance": return '<span class="badge bg-danger badge-status">Under Maintenance</span>';
        case "scheduled": return '<span class="badge bg-info badge-status">Scheduled</span>';
        case "pending": return '<span class="badge bg-warning badge-status">Pending</span>';
        case "completed": return '<span class="badge bg-success badge-status">Completed</span>';
        case "in progress": return '<span class="badge bg-primary badge-status">In Progress</span>';
        default: return `<span class="badge bg-secondary badge-status">${status}</span>`;
    }
}

async function loadMachines(){
    let res = await fetch("http://localhost:3000/machines");
    let data = await res.json();

    const table = document.getElementById("machineTable");
    table.innerHTML = "";

    let highRiskCount = 0;
    data.forEach(m=>{
        const risk = m.interval < 20 ? '⚠' : '';
        if(risk) highRiskCount++;

        table.innerHTML += `
        <tr>
            <td>${m.id}</td>
            <td>${m.name}</td>
            <td>${getStatusBadge(m.status)} ${risk}</td>
            <td>
                <button class="btn btn-sm btn-danger" onclick="deleteMachine(${m.id})">Delete</button>
            </td>
        </tr>`;
    });

    document.getElementById("totalMachines").innerText = data.length;
    document.getElementById("highRiskMachines").innerText = highRiskCount;
}

async function addMachine(){
    const name = document.getElementById("newMachineName").value;
    const location = document.getElementById("newMachineLocation").value;
    const status = document.getElementById("newMachineStatus").value;
    const interval = document.getElementById("newMachineInterval").value;
    if(!name||!location||!status||!interval) return alert("Fill all fields");

    await fetch("http://localhost:3000/machines",{
        method:"POST",
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({name, location, status, interval})
    });
    alert("Machine Added!");
    loadMachines();
}

async function deleteMachine(id){
    await fetch(`http://localhost:3000/machines/${id}`,{ method:"DELETE" });
    alert("Machine Deleted!");
    loadMachines();
}

async function loadTasks(){
    let res = await fetch("http://localhost:3000/tasks");
    let data = await res.json();
    const table = document.getElementById("taskTable");
    table.innerHTML = "";

    let pending = 0;
    data.forEach(t=>{
        if(t.status.toLowerCase() === "pending" || t.status.toLowerCase() === "scheduled") pending++;
        table.innerHTML += `
        <tr>
            <td>${t.machineId}</td>
            <td>${t.description}</td>
            <td>${t.scheduledDate}</td>
            <td>${getStatusBadge(t.status)}</td>
        </tr>`;
    });

    document.getElementById("totalTasks").innerText = data.length;
    document.getElementById("pendingTasks").innerText = pending;
}

async function schedule(){
    const machine = document.getElementById("taskMachine").value;
    const description = document.getElementById("taskDescription").value;
    const date = document.getElementById("taskDate").value;
    if(!machine||!description||!date) return alert("Fill all fields");

    await fetch("http://localhost:3000/tasks",{
        method:"POST",
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ id: Date.now(), machineId: machine, description, scheduledDate: date, status:"Scheduled" })
    });
    alert("Task Scheduled!");
    loadTasks();
}

async function predict(){
    const val = document.getElementById("interval").value;
    if(!val) return alert("Enter interval");
    const res = await fetch(`http://localhost:3000/predict/${val}`);
    const data = await res.json();
    document.getElementById("riskResult").innerHTML = `<strong>${data.alert}</strong>`;
}

loadMachines();
loadTasks();