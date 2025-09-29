const jwt = require('jsonwebtoken')
const usermodel = require('../models/userModel')
exports.authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization
        const token = authHeader.split(' ')[1]
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        const user = await usermodel.findById(decoded.id)
        if (!user) {
            return res.status(404).json({
                message: `Authentication failed: user not found`
            })
        }

        req.user = user

        next()
    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            return res.status(500).json({
                message: `Session expired, please login again`
            })
        }
        res.status(500).json({
            message: error.message
        })
    }
}