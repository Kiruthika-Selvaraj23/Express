const express = require("express")
const Product = require("../models/Product")
const ProductRouter = express.Router()

const isAuth = require("../middleware/Auth")

ProductRouter.get("/getProducts", async (req, res) => {
    try {
        const productsData = await Product.find()
        if (!productsData) {
            return res.send({ success: true, message: "There is no user enrolled get" })
        }
        return res.send({ success: true, message: "User details fetched successfully", productDetails: productsData })
    }
    catch (err) {
        console.log("Error in getting products", err)
    }
})

ProductRouter.post("/product", isAuth , async (req, res) => {
    try {
        const role = req.session.UserDetails.role
        if (role === "admin" || role === "seller"){
            const { productName, productPrice, productDesc, productQuantity } = req.body
            if (!productName || !productPrice || !productDesc || !productQuantity) {
                return res.send({ success: false, message: "All fields are require" })
            }

            const lastProductId = await Product.findOne({}).sort({ productId: -1 })
            const lastId = lastProductId ? lastProductId.productId + 1 : 1

            const createProduct = await Product({
                productId: lastId,
                name: productName,
                price: productPrice,
                desc: productDesc,
                quantity: productQuantity
            })
            const newProduct = await createProduct.save()
            if (!newProduct) {
                return res.send({ success: false, message: "Posting the product failed, Try again!" })
            }
            return res.send({ success: true, message: "Congrats!!, Product posted successfully" })
        } 
       return res.send({success: false, message: "Access denied"})
    }
    catch (err) {
        console.log("Error in Posting Products", err)
    }
})

ProductRouter.put("/updateProduct/:id", isAuth, async (req, res) => {
    try {
        const role = req.session.UserDetails.role
        if (role === "admin" || role === "seller") {
            const id = req.params.id
            if (!id) {
                return res.send({ success: false, message: "Id is missing" })
            }
            const { productName, productPrice, productDesc, productQuantity } = req.body
            if (!productName || !productPrice || !productDesc || !productQuantity) {
                return res.send({ success: false, message: "All fields are require" })
            }

            const updateProduct = await Product.updateOne({ productId: id }, {
                $set: {
                    name: productName,
                    price: productPrice,
                    desc: productDesc,
                    quantity: productQuantity
                }
            })
            if (updateProduct.modifiedCount === 0) {
                return res.send({ success: false, message: "There is no update in the product details" })
            }
            return res.send({ success: true, message: "Product details updated successfully" })
        }
        return res.send({ success: false, message: "Access denied" })
    }
    catch (err) {
        console.log("Error in updating products", err)
    }
})

ProductRouter.delete("/deleteProduct/:id", isAuth, async (req, res) => {
    try {
        const role = req.session.UserDetails.role
        if (role === "admin" || role === "seller") {
            const id = req.params.id
            if (!id) {
                return res.send({ success: false, message: "Id is missing" })
            }

            const deleteProduct = await Product.deleteOne({ productId: id })
            if (deleteProduct.deletedCount === 0) {
                return res.send({ success: false, message: "Product details are not deleted" })
            }

            return res.send({ success: true, message: "Product details deleted successfully" })
        }
        return res.send({ success: false, message: "Access denied" })
    }
    catch (err) {
        console.log("Error in deleting Product", err)
    }
})

module.exports = ProductRouter