const express = require('express');
const PORT = 3000;
const app = express();


const cookieParser = require("cookie-parser");
const path = require("path");

app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname,"public")));
app.set("view engine","ejs");

app.get('/',(req,res)=>{
    res.send("Hello,Welcome to the Vane | Beyond the Trend,A premium place of premium bags");
});

app.listen(PORT,(req,res)=>{
    console.log(`Server is running at ${PORT}`);
});