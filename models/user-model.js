const mongoose = require('mongoose');

// mongoose.connect("mongodb://localhost:27017/vane-ecom");

const userSchema = mongoose.Schema({
    fullName:{
        type:String,
        minLenght:3,
        trim:true,
    },
    email:String,
    password:String,
    cart:{
        type:Array,
        default:[]
    },
    isAdmin:Boolean,
    orders:{
        type:Array,
        default:[]
    },
    contact:Number,
    picture:String
});


module.exports = mongoose.model("user",userSchema);