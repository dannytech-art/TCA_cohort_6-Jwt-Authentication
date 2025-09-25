const { signUp, verifyUser, resendVerification, signIn, forgotPassword, resetPossword, changePassword } = require('../controllers/userController')

const router = require('express').Router()

router.post('/user', signUp)

router.get('/users/verify/:token', verifyUser)

router.post('/user/resend-verification', resendVerification)

router.post('/user/login', signIn)

router.post('/user/forgot/password', forgotPassword)

router.post('/users/reset/password/:token', resetPossword)

router.post('/users/change/password', changePassword)
module.exports = router