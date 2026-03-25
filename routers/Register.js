const express = require("express")
const RegisterRouter = express.Router()
const nodemailer = require('nodemailer')

const Register = require("../models/Register")
const isAuth = require("../middleware/Auth")

RegisterRouter.get("/api/getUsers", async (req, res) => {
    try {
        const role = req.session.UserDetails.role
        if (role === "admin") {
            const userData = await Register.find()
            if (!userData) {
                return res.send({ success: true, message: "There is no user enrolled get" })
            }
            return res.send({ success: true, message: "User details fetched successfully", userDetails: userData })
        }
        return res.send({ success: false, message: "Access denied" })
    }
    catch (err) {
        console.log("Error in getting users", err)
    }
})

RegisterRouter.post("/api/enroll", async (req, res) => {
    try {
        const { userName, pwd, emailId, mobileNo, role, companyName } = req.body
        if (!userName || !pwd || !emailId || !mobileNo) {
            return res.send({ success: false, message: "All fields are require" })
        }

        const lastUserId = await Register.findOne({}).sort({ personId: -1 })
        const userId = lastUserId ? lastUserId.personId + 1 : 1

        const createrUser = await Register({
            personId: userId,
            name: userName,
            password: pwd,
            email: emailId,
            contactNo: mobileNo,
            role: role,
        })

        if (role === "seller") {
            createrUser.companyName = companyName
        }

        const newUser = await createrUser.save()
        if (!newUser) {
            return res.send({ success: false, message: "Registration failed, Try again!" })
        }
        return res.send({ success: true, message: "Congrats!!, Regsitered Successfully" })
    }
    catch (err) {
        console.log("Error in Regsiter", err)
        return res.send({ success: false, message: "Server error, Try again!" })
    }
})

RegisterRouter.post("/api/login", async (req, res) => {
    try {
        const { userMailId, pwd } = req.body
        if (!userMailId || !pwd) {
            return res.send({ success: false, message: "All fields are required" })
        }

        const userData = await Register.findOne({ email: userMailId })
        if (!userData) {
            return res.send({ success: false, message: "Please Register and Login or Invalid Email" })
        }

        if (userData.password !== pwd) {
            return res.send({ success: false, message: "Incorrect Password" })
        }

        req.session.UserDetails = {
            name: userData.name,
            emailId: userData.email,
            contactNo: userData.contactNo,
            role: userData.role
        }

        if (userData.role === "seller") {
            req.session.UserDetails.companyName = userData.companyName
        }

        let transporter = nodemailer.createTransport({
            service: 'gmail', // e.g., Gmail
            auth: {
                user: process.env.EmailId, // your Gmail address
                pass: process.env.Password // use an App Password if 2FA is enabled
            }
        });

        // 3. Set up email data
        let mailOptions = {
            from: process.env.EmailId, // sender address
            to: userData.email,          // list of receivers
            subject: 'Hello world',           // Subject line
            html: '<b>This is an sample email</b>'       // HTML body
        };

        // 4. Send email
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                return console.log('Error:', error);
            }
            console.log('Email sent:', info.response);
        });

        return res.send({ success: true, message: "Login Successfull", UserData: req.session.UserDetails })
    }
    catch (err) {
        console.log("Error in Login", err)
    }
})

RegisterRouter.get("/api/me", async (req, res) => {
    try {
        const user = req.session.UserDetails
        if (!user)
            return res.send({ success: false, message: "Login and Try again!" })
        return res.send({ success: true, message: "User Details fetched successfully" , user: user})
    }
    catch (err) {
        console.log("Err in getting user details", err)
    }
})


RegisterRouter.put("/api/updateUser/:id", isAuth, async (req, res) => {
    try {
        const id = req.params.id
        if (!id) {
            return res.send({ success: false, message: "Id is missing" })
        }
        const { userName, pwd, emailId, mobileNo } = req.body
        if (!userName || !pwd || !emailId || !mobileNo) {
            return res.send({ success: false, message: "All fields are require" })
        }

        const updateUser = await Register.updateOne({ personId: id }, {
            $set: {
                name: userName,
                password: pwd,
                email: emailId,
                contactNo: mobileNo
            }
        })

        if (updateUser.modifiedCount === 0) {
            return res.send({ success: false, message: "There is no update in the user details" })
        }
        return res.send({ success: true, message: "User details updated successfully" })
    }
    catch (err) {
        console.log("Error in Update", err)
    }
})

RegisterRouter.delete("/api/deleteUser/:id", isAuth, async (req, res) => {
    try {
        const role = req.session.UserDetails.role
        if (role === "admin") {
            const id = req.params.id
            if (!id) {
                return res.send({ success: false, message: "Id is missing" })
            }

            const deleteUser = await Register.deleteOne({ personId: id })
            if (deleteUser.deletedCount === 0) {
                return res.send({ success: false, message: "User details is not deleted" })
            }

            return res.send({ success: true, message: "User details deleted successfully" })
        }
        return res.send({ success: false, message: "Access denied" })
    }
    catch (err) {
        console.log("Error in deleting user", err)
    }
})

RegisterRouter.delete("/api/logout", isAuth, async (req, res) => {
    try {
        if (!req.session.UserDetails) {
            return res.send({ success: false, message: "Login and Try again" })
        }

        req.session.destroy(err => {
            if (err) {
                console.log("Error in destroying Session", err)
                return res.send({ success: false, message: "Trouble in Logout, Try again" })
            }
            return res.send({ success: true, message: "Logout Successfully" })
        })
    }
    catch (err) {
        console.log("Error in Logout", err)
    }
})

module.exports = RegisterRouter