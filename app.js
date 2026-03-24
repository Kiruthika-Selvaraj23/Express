const express = require("express")
require("dotenv").config()
const mongoose = require("mongoose")
const cors = require("cors")
const session = require("express-session")
const MongoDbSession = require("connect-mongodb-session")(session)

const RegisterRouter = require("./routers/Register")
const ProductRouter = require("./routers/Product")
const OrderRouter = require("./routers/Order")

const app = express()
const port = process.env.PORT
console.log("app is running")

app.use(express.json())

app.use(express.urlencoded({ extended: true }))
// app.use("/upload", express.static("upload"))
app.use("/upload", express.static("/tmp/upload"))


mongoose.connect(process.env.MongoDb)
    .then(() => console.log("MongoDb connected successfully"))
    .catch((err) => console.log("Err in connecting MongoDb", err))


app.use(cors({
    origin: ['http://localhost:3000','https://e-cart-murex-two.vercel.app'],
    credentials: true
}))    


const Store = new MongoDbSession({
    uri: process.env.MongoDb,
    collection: "EcartSession"
}) 

app.use(session({
    secret: process.env.SecretKey,
    resave: false,
    saveUninitialized: false,
    store: Store,
    cookie: {
        secure: true,
        httpOnly: true,
        sameSite: "none"
    }
}))


app.use(RegisterRouter)
app.use(ProductRouter)
app.use(OrderRouter)

// app.listen(port, () => {
//     console.log("Listening", port)
// })

app.get("/", (req, res) => {
    res.send("API is running 🚀");
});

module.exports = app;
