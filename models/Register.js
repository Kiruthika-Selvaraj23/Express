const mongoose = require("mongoose")

const RegisterSchema = mongoose.Schema({
    personId : {type: Number, required: true},
    name: { type: String, required: true },
    password: { type: String, required: true},
    email: { type: String, required: true, unique: true },
    contactNo: { type: Number, required: true, unique: true }
})    

const Register = mongoose.model("Enroll", RegisterSchema)

module.exports = Register