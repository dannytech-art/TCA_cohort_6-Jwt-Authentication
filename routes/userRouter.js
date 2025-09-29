const { signUp, verifyUser, resendVerification, signIn, forgotPassword, resetPossword, changePassword, getAll } = require('../controllers/userController')
const { authenticate } = require('../middleware/Authenticate')

const router = require('express').Router()

router.post('/user', signUp)

router.get('/users/verify/:token', verifyUser)

router.post('/user/resend-verification', resendVerification)

router.post('/user/login', signIn)

router.post('/user/forgot/password', forgotPassword)

router.post('/users/reset/password/:token', resetPossword)

router.get('/users', authenticate, getAll)

router.patch('/users/change/password',authenticate, changePassword)
module.exports = router