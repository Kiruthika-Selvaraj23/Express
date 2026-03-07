const mongoose = require("mongoose")

const RegisterSchema = mongoose.Schema({
    personId : {type: Number, required: true},
    name: { type: String, required: true },
    password: { type: String, required: true},
    email: { type: String, required: true, unique: true },
    contactNo: { type: Number, required: true, unique: true },
    role: { type: String, enum: ["admin", "seller", "user"], required: true, default: "user" },
    companyName : {type: String , required: false}
})    

const Register = mongoose.model("Enroll", RegisterSchema)

module.exports = Register