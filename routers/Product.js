const express = require("express")
const Product = require("../models/Product")
const ProductRouter = express.Router()

const multer = require("multer")
const path = require("path")
const fs = require("fs")

const isAuth = require("../middleware/Auth")

const upload = "upload"
if (!fs.existsSync(upload)) {
    fs.mkdirSync(upload)
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, upload)
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + "-" + Date.now() + path.extname(file.originalname))
    }
})

const uploadFile = multer({
    storage: storage,
    limits: 5*1024*1024
})

ProductRouter.get("/getProducts", async (req, res) => {
    try {
        const productsData = await Product.find()
        if (!productsData) {
            return res.send({ success: true, message: "There is no products" })
        }
        return res.send({ success: true, message: "Products Data fetched successfully", productDetails: productsData })
    }
    catch (err) {
        console.log("Error in getting products", err)
    }
})

ProductRouter.get("/getProductDetails/:id", async (req, res) => {
    try {
        const id = req.params.id
        if (!id) {
            return res.send({success: false, message: "Id is missing"})
        }
        const productDetails = await Product.find({ productId: id })
        if (!productDetails) {
            return res.send({ success: false, message: "There is no Product" })
        }
        return res.send({ success: true, message: "Product details fetched successfully", detailedProduct: productDetails })
    }
    catch (err) {
        console.log("Error in getting particular product details", err)
    }
})

ProductRouter.post("/product", isAuth , uploadFile.single("product") ,async (req, res) => {
    try {
        const role = req.session.UserDetails.role
        if (role === "admin" || role === "seller"){
            const { sellerCompanyName, brandName, productName, productOriginalPrice, currentPrice, productDesc, productQuantity, discount } = req.body
            const imagePath = req.file

            if (!sellerCompanyName || !brandName || !productName || !productOriginalPrice || !currentPrice || !productDesc || !productQuantity || !discount || !imagePath) {
                return res.send({ success: false, message: "All fields are require" })
            }

            const lastProductId = await Product.findOne({}).sort({ productId: -1 })
            const lastId = lastProductId ? lastProductId.productId + 1 : 1

            let imageFile;
            if (imagePath) {
                imageFile = {
                    fileName: imagePath.fieldname,
                    filePath: imagePath.path.replace( /\\/g ,"/")
                }
            }

            const createProduct = await Product({
                productId: lastId,
                sellerCompanyName: sellerCompanyName,
                brandName: brandName,
                name: productName,
                originalPrice: productOriginalPrice,
                price: currentPrice,
                desc: productDesc,
                quantity: productQuantity,
                discount: discount,
                image: imageFile
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

ProductRouter.put("/updateProduct/:id", isAuth, uploadFile.single("product"),async (req, res) => {
    try {
        const role = req.session.UserDetails.role
        if (role === "admin" || role === "seller") {
            const id = req.params.id
            if (!id) {
                return res.send({ success: false, message: "Id is missing" })
            }
            const { productName, productPrice, productDesc, productQuantity } = req.body
            const imagePath = req.file

            if (!productName || !productPrice || !productDesc || !productQuantity || !imagePath) {
                return res.send({ success: false, message: "All fields are require" })
            }

            let imageFile;
            if (imagePath) {
                imageFile = {
                    fileName: imagePath.fieldname,
                    filePath: imagePath.path.replace(/\\/g, "/")
                }
            }

            const updateProduct = await Product.updateOne({ productId: id }, {
                $set: {
                    name: productName,
                    price: productPrice,
                    desc: productDesc,
                    quantity: productQuantity,
                    image: imageFile
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