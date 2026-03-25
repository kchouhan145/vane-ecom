const express = require('express');
const PORT = 3000;
const app = express();

app.get('/',(req,res)=>{
    res.send("Hello,Welcome to the Vane | Beyond the Trend,A premium place of premium bags");
});

app.listen(PORT,(req,res)=>{
    console.log(`Server is running at ${PORT}`);
});