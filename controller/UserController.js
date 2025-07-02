const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../model/User');
const Otp = require('../model/Otp');
const { default: mongoose } = require('mongoose');

// Utility to generate random referral code
const generateReferralCode = () => Math.random().toString(36).substring(2, 8).toUpperCase();




exports.verifyOtpAndRegister = async (req, res) => {
    try {
        const { username, email, password, referralCode, enteredOtp } = req.body;

        const otpRecord = await Otp.findOne({ email });
        if (!otpRecord || otpRecord.otp !== enteredOtp) {
            return res.status(400).json({ message: 'Invalid or expired OTP' });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: 'User already exists' });

        const hashedPassword = await bcrypt.hash(password, 10);
        const newReferralCode = generateReferralCode();

        const newUser = new User({
            username,
            email,
            password: hashedPassword,
            referralCode: newReferralCode,
            referredBy: referralCode || null,
            coins: mongoose.Types.Decimal128.fromString("0.0010")
        });

        await newUser.save();
        await Otp.deleteMany({ email });

        const referralLink = `http://localhost:5000/api/user/register?ref=${newReferralCode}`; // replace with real domain

        res.status(201).json({
            message: 'User registered successfully',
            referralCode: newReferralCode,
            referralLink // send referral link to frontend
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};



exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: 'User not found' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

        const token = jwt.sign({ userId: user._id, type: "User" }, process.env.JWT_SECRET, { expiresIn: '30d' });

        res.status(200).json({
            token,
            user: {
                id: user._id,
                username: user.username,
                coins: user.coins,
                referralCode: user.referralCode,
                referredBy: user.referredBy
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};


exports.getCurrentUser = async (req, res) => {
    try {
        const user = await User.findById(req.userId).select('-password');
        if (!user) return res.status(404).json({ message: 'User not found' });

        res.status(200).json(user);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};


exports.updateUser = async (req, res) => {
    try {
        const { username, email } = req.body;

        const updatedUser = await User.findByIdAndUpdate(
            req.userId, // corrected from req.user_id
            { username, email },
            { new: true }
        ).select('-password');

        if (!updatedUser) return res.status(404).json({ message: 'User not found' });

        res.status(200).json({ message: 'User updated', user: updatedUser });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};


// Get count of users referred by a given referral code
exports.getReferralCount = async (req, res) => {
    try {
        const userId = req.userId;

        // 1. Get current user
        const currentUser = await User.findById(userId);
        if (!currentUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        // 2. Use current user's referralCode to find referred users
        const referredUsers = await User.find({ referredBy: currentUser.referralCode }).select('-password'); // Exclude password

        res.status(200).json({
            referralCode: currentUser.referralCode,
            referredUsersCount: referredUsers.length,
            referredUsers
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};



exports.getTopCoinUser = async (req, res) => {
    try {
        // Total user count
        const totalUsers = await User.countDocuments();

        // Top 20 users with only username and coins
        const topUsers = await User.find()
            .sort({ coins: -1 })
            .limit(20)
            .select('username coins'); // ✅ Only select needed fields

        res.status(200).json({
            totalUsers,
            topUsers,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};



