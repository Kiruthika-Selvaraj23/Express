const express = require("express")
const Order = require("../models/Orders")
const Product = require("../models/Product")
const OrderRouter = express.Router()

const Auth = require("../middleware/Auth")

OrderRouter.get("/getOrders", Auth, async (req, res) => {
    try {
        const orderData = await Order.find().populate("product")
        if (!orderData) {
            return res.send({ success: true, message: "There is no user enrolled get" })
        }
        return res.send({ success: true, message: "User details fetched successfully", orderDetails: orderData })
    }
    catch (err) {
        console.log("Error in getting users", err)
    }
})


OrderRouter.post("/order", Auth, async (req, res) => {
    try {
        const role = req.session.UserDetails.role
        if (role === "user") {
            const { productId, productQuantity } = req.body
            if (!productId || !productQuantity) {
                return res.send({ success: false, message: "Product detail is mandatory" })
            }

            const product = await Product.findOne({ productId: productId })
            if (!product || Number(product.quantity) < productQuantity) {
                return res.send({ success: false, message: "The product is out of stock" })
            }

            const lastOrderId = await Order.findOne({}).sort({ orderId: -1 })
            const lastId = lastOrderId ? lastOrderId.orderId + 1 : 1
            const priceNum = parseFloat(product.price.replace(/[^0-9.]/g, ""));
            //parseFoat => converts string to num , //g => replace globally , ^ => matches all that is not listed for example: comma, string,etc.. 

            const createOrder = await Order({
                orderId: lastId,
                product: product._id,
                totalQuantity: productQuantity,
                totalPrice: priceNum * productQuantity
            })
            const newOrder = await createOrder.save()
            if (!newOrder) {
                return res.send({ success: false, message: "Order is not placed, Try again!!" })
            }
            return res.send({ success: true, message: "Order places successfully!!" })
        }
        
        return res.send({ success: false, message: "Access denied" })

    }
    catch (err) {
        console.log("Error in placing order", err)
    }
})

OrderRouter.put("/updateOrder/:id", Auth, async (req, res) => {
    try {
        const role = req.session.UserDetails.role
        if (role === "admin") {
            const id = req.params.id
            if (!id) {
                return res.send({ success: false, message: "Id is missing" })
            }

            const { productId, productQuantity } = req.body
            if (!productId || !productQuantity) {
                return res.send({ success: false, message: "Product detail is mandatory" })
            }

            const product = await Product.findOne({ productId: productId })
            if (!product || Number(product.quantity) < productQuantity) {
                return res.send({ success: false, message: "The product is out of stock" })
            }

            const priceNum = parseFloat(product.price.replace(/[^0-9.]/g, ""));
            const updateOrder = await Order.updateOne({ orderId: id }, {
                $set: {
                    product: product._id,
                    totalQuantity: productQuantity,
                    totalPrice: priceNum * productQuantity
                }
            })

            if (updateOrder.modifiedCount === 0) {
                return res.send({ success: false, message: "There is no update in the order" })
            }
            return res.send({ success: true, message: "Order updated Successfully" })
        }

        return res.send({ success: false, message: "Access denied" })
        }
    catch (err) {
        console.log("Error in updating order", err)
    }
})

OrderRouter.delete("/deleteOrder/:id", Auth , async (req, res) => {
    try {
        const role = req.session.UserDetails.role
        if (role === "admin") {
            const id = req.params.id
            if (!id) {
                return res.send({ success: false, message: "Id is missing" })
            }

            const deleteOrder = await Order.deleteOne({ orderId: id })
            if (deleteOrder.deletedCount === 0) {
                return res.send({ success: false, message: "Order is not deleted, try again" })
            }
            return res.send({ success: true, message: "Order cancelled successfully!!" })
        }

        return res.send({ success: false, message: "Access denied" })
        }
    catch (err) {
        console.log("Error in deleting order", err)
    }
})

module.exports= OrderRouter