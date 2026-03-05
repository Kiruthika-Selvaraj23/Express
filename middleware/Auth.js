const Register = require("../models/Register")

const isAuth = async (req, res, next) => {
    try {
        if (!req.session) {
            return res.send({ success: false, message: "Please login and Try again" })
        } 
        const fetchUser = await Register.findOne({ email: req.session.UserDetails.emailId })
        if (!fetchUser) {
            return res.send({ success: false, message: "Please login and Try again" })
        }
        next()
    }
    catch (err) {
        console.log("Error in Auth", err)
    }
}

module.exports = isAuth