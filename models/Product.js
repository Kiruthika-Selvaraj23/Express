const mongoose = require("mongoose")

const ProductSchema = mongoose.Schema({
    productId: { type: Number, required: true },
    sellerCompanyName: {type: String, required: true},
    brandName: {type: String, required: true},
    name: { type: String, required: true},
    price: { type: String, required: true },
    originalPrice: {type: String, required: true},
    desc: { type: String, required: true},
    quantity: { type: String, required: true },
    discount: { type: Number, required: true },
    image: {
        fileName: { type: String },
        filePath: {type: String}
    }
})

const Product = mongoose.model("Product", ProductSchema)

module.exports = Product