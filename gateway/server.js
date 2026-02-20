const express = require('express');
const app = express();
const fetch = (...args) => import('node-fetch').then(({default: fetch})=>fetch(...args));
app.use(express.json());

app.get('/machines', async(req,res)=>{
    const data = await fetch("http://localhost:3001/machines");
    res.json(await data.json());
});

app.post('/tasks', async(req,res)=>{
    const response = await fetch("http://localhost:3002/tasks",{
        method:"POST",
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify(req.body)
    });
    res.json(await response.json());
});

app.get('/tasks', async(req,res)=>{
    const data = await fetch("http://localhost:3002/tasks");
    res.json(await data.json());
});

app.get('/upcoming', async(req,res)=>{
    const data = await fetch("http://localhost:3003/upcoming");
    res.json(await data.json());
});

app.get('/predict/:interval', async(req,res)=>{
    const data = await fetch(`http://localhost:3003/predict/${req.params.interval}`);
    res.json(await data.json());
});

app.listen(3000, ()=>console.log("API Gateway running on 3000"));