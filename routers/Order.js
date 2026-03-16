const express = require("express")
const Order = require("../models/Orders")
const Product = require("../models/Product")
const OrderRouter = express.Router()

const isAuth = require("../middleware/Auth")

OrderRouter.get("/getOrders", isAuth, async (req, res) => {
    try {
        const orderData = await Order.find().populate("product")
        if (!orderData) {
            return res.send({ success: false, message: "There is no orders yet" })
        }
        return res.send({ success: true, message: "Orders details fetched successfully", orderDetails: orderData })
    }
    catch (err) {
        console.log("Error in getting orders", err)
    }
})

OrderRouter.get("/getParticularCompanyOrders", isAuth, async (req, res) => {
    try {
        const companyName = req.session.UserDetails.companyName
        if (!companyName) {
            return res.send({ success: false, message: "Company name is missing" })
        }
        // const orderData = await Order.find().populate({ path: "product", match: { sellerCompanyName: companyName } })
        // const filterOrder = orderData.filter(order => order.product !== null)
        const orderData = await Order.find().populate("product")
        const filterOrder = orderData.filter(order => order.product.sellerCompanyName === companyName )

        if (!orderData) {
            return res.send({ success: false, message: "There is no orders yet" })
        }
        return res.send({ success: true, message: "Company order details fetched successfully", orderDetails: filterOrder })

    }
    catch (err) {
        console.log("Error in getting particular company orders", err)
    }
})

OrderRouter.get("/getParticularUserOrder", isAuth, async (req, res) => {
    try {
        const emailId = req.session.UserDetails.emailId
        if (!emailId) {
            return res.send({ success: false, message: "Email Id is missing" })
        }
        const getOrders = await Order.find({ userEmailId: emailId }).populate("product")
        if (!getOrders) {
            return res.send({ success: false, message: "There is no orders yet!" })
        }
        return res.send({ success: true, message: "Orders fetched successfully", orderedProducts: getOrders })
    }
    catch (err) {
        console.log("Error in getting particular user orders", err)
    }
})


OrderRouter.post("/order", isAuth, async (req, res) => {
    try {
        const role = req.session.UserDetails.role
        if (role === "user") {
            const { productId, productQuantity } = req.body
            if (!productId || !productQuantity) {
                return res.send({ success: false, message: "Product detail is mandatory" })
            }

            const emailId = req.session.UserDetails.emailId
            if (!emailId) {
                return res.send({ success: false, message: "Email Id is missing" })
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
                userEmailId: emailId,
                product: product._id,
                totalQuantity: productQuantity,
                totalPrice: priceNum * productQuantity
            })
            const newOrder = await createOrder.save()
            if (!newOrder) {
                return res.send({ success: false, message: "Order is not placed, Try again!!" })
            }
            return res.send({ success: true, message: "Congrats, Your order is placed successfully!!" })
        }

        return res.send({ success: false, message: "Access denied" })

    }
    catch (err) {
        console.log("Error in placing order", err)
    }
})

OrderRouter.put("/updateOrder/:id", isAuth, async (req, res) => {
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

OrderRouter.delete("/deleteOrder/:id", isAuth, async (req, res) => {
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

module.exports = OrderRouter