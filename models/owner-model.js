const mongoose = require('mongoose');

// mongoose.connect("mongodb://localhost:27017/Vane-ecom");

const ownerSchema = mongoose.Schema({
    fullName:{
        type:String,
        minLenght:3,
        trim:true,
    },
    email:String,
    password:String,
    products : {
        type:Array,
        default:[]
    },
    picture:String
});


module.exports = mongoose.model("owner",ownerSchema);