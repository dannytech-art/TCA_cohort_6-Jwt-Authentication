const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        require: true
    },
    lastName: {
        type: String,
        require: true
    },
    email: {
        type: String,
        require: true,
        unique: true
    },
    password: {
        type: String,
        require: true
    },
    isVerified: {
        type: Boolean,
        default: false
    },
},{timestamps: true})

const usermodel = mongoose.model('users', userSchema)

module.exports = usermodel