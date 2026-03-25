const mongoose = require('mongoose');

const productSchema = mongoose.Schema({
    imgae: String,
    name: String,
    price: Number,
    discount: {
        type: Number,
        defaul: 0
    },
    bgcolor: String,
    panelcolor: String,
    textcolor: String
});

module.exports = mongoose.model("product", productSchema);