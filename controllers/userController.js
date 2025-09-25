const usermodel = require("../models/userModel");
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt');
const { signUpTemp, verifyTemp, resetPasswordTemp } = require("../utils/emailTemplates");
const emailSender = require("../middleware/nodemailer");

exports.signUp = async (req,res)=>{
    try {
        const { firstName, lastName, email, password } = req.body
        
        const userExist = await usermodel.findOne({ email: email.toLowerCase() })
    if (userExist) {
      return res.status(400).json({ message: `User already exists` })
    }
    const saltedRounds = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, saltedRounds)

    // instantiate user data
    const user = new usermodel({ 
        firstName, 
        lastName, 
        email: email.toLowerCase(), 
        password: hashedPassword
    })
    
    await user.save()

    // generate token for the user
    const token = jwt.sign({
        id: user._id,
        email: user.email
    },process.env.JWT_SECRET,{expiresIn: '1h'})

    const link = `${req.protocol}://${req.get('host')}/users/verify/${token}`
// email options for sending email
    const emailOption = {
        email: user.email,
        subject: 'Graduation note',
        html: signUpTemp(link,user.firstName)
    }
// send the email to the user

      await emailSender(emailOption)
        res.status(201).json({
            message: `user registered successfully`,
            data: user
        })
    } catch (error) {
        res.status(500).json({
            message: error.message
        })
    }
}
exports.verifyUser = async (req,res)=>{
    try {
        const {token} = req.params
    if (!token) {
        return res.status(404).json({
          message: `token not found`
        })
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = await usermodel.findById(decoded.id)
    if (!user) {
        return res.status(404).json({
          message: `user not found`
        })
    }
    if(user.isVerified){
        res.status(200).json({
          message: `user already verified please proceed to login`
        })
    }
    user.isVerified = true
        res.status(200).json({
          message: `user verified successfully`
        })
    } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
        return res.status(500).json({
            message: `Session expitred, please resend verification`
        })
    }
        res.status(404).json({
          Error: error
        })
    }
}
exports.resendVerification = async (req,res)=>{
    try {
        const {email} = req.body;
        const user = await usermodel.findOne({email: email.toLowerCase()})
      if (!user) {
        return res.status(404).json({
            message: `user not found `
        })
      }
      
      const token = jwt.sign({
        email: user.email,
        id: user._id
      },process.env.JWT_SECRET,{expiresIn: '30mins'})
      const link =`${req.protocol}://${req.get('host')}/users/verify/${token}`
      const options ={
        email: user.email,
        subject: `verification link`,
        html: verifyTemp(link,user.firstName)
      }
      await emailSender(options)
       res.status(200).json({
          message: `verification link sent successfully`
        })
    } catch (error) {
        res.status(404).json({
          Error: error.message
        })
    }
}
exports.signIn = async (req,res)=>{
    try {
        const {email, password} = req.body;
        const user = await usermodel.findOne({email: email.toLowerCase()})
        if (!user) {
            return res.status(404).json({
                message: `user not found, please sign up`
            })
        } 
        const passwordCorrect = await bcrypt.compare(password, user.password)
        if (passwordCorrect === false) {
            return res.status(400).json({
                message: `invalid credentials`
            })
        }    
        const token = jwt.sign({
            id: user._id,
            email: user.email
        },process.env.JWT_SECRET,{expiresIn: '1h'})
        res.status(200).json({
            message: `user signed in successfully`,
            data: user,
            token
        }) 
      }  catch (error) {
        res.status(500).json({
            message: error.message
        })
    }
}
exports.forgotPassword = async (req,res)=>{
    try {
        const {email} = req.body;
        const user = await usermodel.findOne({email: email.toLowerCase()})
        if(!user){
            return res.status(404).json({
                message: `user not found`
            })
        }
        // generate token and link for the user
    const token = jwt.sign({
        id: user._id,
        email: user.email
    },process.env.JWT_SECRET,{expiresIn: '10m'})

      const link = `${req.protocol}://${req.get('host')}/users/reset/password/${token}`
      const options = {
        email: user.email,
        subject: `reset password`,
        html: resetPasswordTemp(link, user.firstName)
      }
       await emailSender(options)
       res.status(200).json({
            message: `reset password request successfull`
        })
    } catch (error) {
        res.status(500).json({
            message: error.message
        })
    }
}
exports.resetPossword = async (req,res) =>{
    
    try {
        // get token for reset password
     const {token} = req.params
        const {newPassword, confirmPassword} = req.body
        // verify the token with jwt
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    
    // find the user decoded
      const user = await usermodel.findById(decoded.id)
    //   check if the user is in the database
    if (!user) {
        return res.status(404).json({
            message: `user not found`
        })
    }

    if (newPassword !== confirmPassword) {
        return res.status(400).json({
            message: `password does not match`
        })
    }
    // encrypt new password
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(newPassword, salt)
    // update the user password to the new password
    user.password = hashedPassword
    await user.save()
    res.status(200).json({
            message: `password reset successfull`
        })
    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            res.status(400).json({
            message: `request for a new link`
        })
        }
        res.status(500).json({
            message: error.message
        })
    }
}
exports.changePassword = async (req, res) => {
    try {
        const {token, currentPassword, newPassword, confirmPassword} = req.body
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = await usermodel.findById(decoded.id)
    if (!user) {
        return res.status(400).json({
            message: `user not found`
        })
    }

    const passwordCorrect = await bcrypt.compare(currentPassword, user.password)
        if (passwordCorrect === false) {
            return res.status(400).json({
                message: `invalid credentials`
            })
        }
    if (newPassword !== confirmPassword) {
        return res.status(400).json({
            message: `password does not match`
        })
    }
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(newPassword, salt)
    user.password = hashedPassword
    await user.save()
    res.status(200).json({
        message: `password changed successfully`
    })  

    } catch (error) {
        res.status(500).json({
            message: error.message
        })
    }
}