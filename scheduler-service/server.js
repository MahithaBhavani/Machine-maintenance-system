const express = require('express');
const app = express();
app.use(express.json());
let scheduled = [];
app.post('/schedule', (req,res)=>{
    scheduled.push(req.body);
    res.json({ message: "Scheduled Successfully" });
});
app.get('/upcoming', (req,res)=>res.json(scheduled));
app.get('/predict/:interval', (req,res)=>{
    let interval = req.params.interval;
    if(interval < 20) res.json({ alert: "High Failure Risk 🔴" });
    else if(interval < 35) res.json({ alert: "Moderate Risk 🟠" });
    else res.json({ alert: "Low Risk 🟢" });
});

app.listen(3003, ()=>console.log("Scheduler Service running on 3003"));