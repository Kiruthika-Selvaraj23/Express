const mongoose = require("mongoose")

const ProductSchema = mongoose.Schema({
    productId: { type: Number, required: true },
    name: { type: String, required: true},
    price: { type: String, required: true},
    desc: { type: String, required: true},
    quantity: { type: String, required: true},
})

const Product = mongoose.model("Product", ProductSchema)

module.exports = Product