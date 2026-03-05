const mongoose = require("mongoose")

const OrderSchema = mongoose.Schema({
    orderId: { type: Number, required: true },
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required : true
    },
    totalPrice: { type: Number, required: true },
    totalQuantity: {type: Number, required: true }
})

const Order = mongoose.model("Order", OrderSchema)

module.exports = Order