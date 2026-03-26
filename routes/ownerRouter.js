const express = require('express');
const router = express.Router();
// const app = express();

router.get("/",(req,res)=>{
    res.send("Welcome to owner route");
})

module.exports = router;