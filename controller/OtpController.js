const Otp = require('../model/Otp'); // Adjust path
const nodemailer = require('nodemailer');
require('dotenv').config();

exports.sendOtp = async (req, res) => {
    const { email } = req.body;
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    await Otp.deleteMany({ email }); // remove previous OTPs

    const otp = new Otp({ email, otp: otpCode });
    await otp.save();

    // Send OTP by email (example with nodemailer)
    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL,
            pass: process.env.EMAIL_PASS
        },
    });

    await transporter.sendMail({
        // from: '"Crypto App" <your_email@gmail.com>',
        from: '"Crypto App" <your_email@gmail.com>',
        to: email,
        subject: 'Your OTP Code',
        text: `Your OTP is ${otpCode}`,
    });

    res.json({ message: 'OTP sent to email' });
};
