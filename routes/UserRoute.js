const express = require('express');
const router = express.Router();

const userController = require('../controller/UserController');
const genrateCoinController = require('../controller/GenrateCoinController');
const OtpController = require('../controller/OtpController');
const verifyToken = require('../middleware/UserTokenCheck');

// OTP
router.post('/send-otp', OtpController.sendOtp);

// Public routes
router.post('/register', userController.verifyOtpAndRegister);
router.post('/login', userController.login);

// Protected routes (require valid token)
router.get('/get', verifyToken, userController.getCurrentUser);
router.put('/update', verifyToken, userController.updateUser);

// 
router.post('/start-session', verifyToken,genrateCoinController.startSession);
router.post('/coins', verifyToken, genrateCoinController.startCoinSession);

router.get('/get-refer-user', verifyToken, userController.getReferralCount);





















module.exports = router;
