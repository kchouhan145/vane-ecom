const express = require('express');
const router = express.Router();
const bcrypt = require("bcrypt");
const userModel = require('../models/user-model');

router.get('/', (req, res) => {
	res.send('Welcome to users route');
});

router.post("/create", async (req,res) => {
	
	let {fullName,email,password,contact,picture} = req.body;

	let passwordH = await bcrypt.hash(password,10);

	if(await userModel.findOne({email}))
	{
		return res.send("Email is already register with another user");
	}

	await userModel.create({
		fullName,
		email,
		password:passwordH,
		contact,
		picture
	})

	res.status(201).send("User Created!");

})

module.exports = router;