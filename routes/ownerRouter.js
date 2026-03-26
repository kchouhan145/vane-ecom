const express = require('express');
const router = express.Router();
// const app = express();
const ownerModel = require("../models/owner-model");
const bcrypt = require('bcrypt');

router.get("/",(req,res)=>{
    res.send("Welcome to owner route");
})

router.post("/create",async (req,res)=>{
    let {fullName,email,password,picture} = req.body;

    let passwordH = await bcrypt.hash(password,10);
    if(await ownerModel.findOne()){
        return  res.send("There is already a owener");
    }

    await ownerModel.create({
        fullName,
        email,
        password:passwordH,
        picture
    });

    res.status(201).send("Created the owner");
})

module.exports = router;