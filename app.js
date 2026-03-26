const express = require('express');
const PORT = 3000;
const app = express();
require('./config/mongoose-connection');
const userRouter = require("./routes/usersRouter");
const ownersRouter = require("./routes/ownerRouter");
const productRouter = require("./routes/productsRouter");


const cookieParser = require("cookie-parser");
const path = require("path");
 
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname,"public")));
app.set("view engine","ejs");

app.get('/',(_req,res)=>{
    // res.send("Hello,Welcome to the Vane | Beyond the Trend,A premium place of premium bags");
    res.render("index");
});

app.use("/users",userRouter);
app.use("/products",productRouter);
app.use("/owners",ownersRouter);



app.listen(PORT,()=>{
    console.log(`Server is running at ${PORT}`);
});