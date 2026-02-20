const express = require('express');
const fs = require('fs');
const csv = require('csv-parser');
const app = express();
app.use(express.json());
let machines = [];
const path = require('path');
fs.createReadStream(path.join(__dirname, 'machines.csv'))
//fs.createReadStream('machines.csv')
  .pipe(csv())
  .on('data', (row) => {
      machines.push({
          id: Number(row.machine_id),
          name: row.name,
          location: row.location,
          lastMaintenance: row.last_main,
          interval: Number(row.maintenance_interval_days),
          status: row.status
      });
  })
  .on('end', () => {
      console.log('Machines CSV loaded.');
  });

app.get('/machines', (req,res)=>res.json(machines));
app.get('/machines/:id', (req,res)=>{
    const m = machines.find(m=>m.id==req.params.id);
    res.json(m);
});
app.post('/machines', (req,res)=>{
    const newMachine = { id: Date.now(), ...req.body };
    machines.push(newMachine);
    res.json({ message: "Machine Added", machine: newMachine });
});
app.delete('/machines/:id', (req,res)=>{
    machines = machines.filter(m=>m.id!=req.params.id);
    res.json({ message: "Machine Deleted" });
});

app.listen(3001, ()=> console.log("Machine Service running on 3001"));