const express = require('express');
const fs = require('fs');
const csv = require('csv-parser');
const app = express();
app.use(express.json());
let tasks = [];
const path = require('path');
fs.createReadStream(path.join(__dirname, 'tasks.csv'))
  .pipe(csv())
  .on('data', (row)=>{
      tasks.push({
          id: Number(row.task_id),
          machineId: Number(row.machine_id),
          description: row.task_description,
          scheduledDate: row.scheduled_date,
          status: row.status,
          completedOn: row.completed_on
      });
  })
  .on('end', ()=>{
      console.log('Tasks CSV loaded.');
  });
app.get('/tasks', (req,res)=>res.json(tasks));

app.post('/tasks', (req,res)=>{
    const newTask = { id: Date.now(), ...req.body };
    tasks.push(newTask);
    res.json({ message: "Task Scheduled", task: newTask });
});

app.put('/tasks/:id', (req,res)=>{
    let task = tasks.find(t=>t.id==req.params.id);
    Object.assign(task, req.body);
    res.json({ message: "Task Updated" });
});

app.listen(3002, ()=> console.log("Task Service running on 3002"));