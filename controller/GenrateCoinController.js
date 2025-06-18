const User = require('../model/User');


exports.startSession = async (req, res) => {
    try {
        const userId = req.userId;  // from your middleware
        console.log(userId);
        
        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized: No user ID' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.activeSession = true;
        user.sessionStartTime = new Date();
        user.lastMultiplyTime = null;
        user.multiplierStep = 0;

        await user.save();

        res.status(200).json({
            message: 'Session started successfully',
            activeSession: user.activeSession,
            sessionStartTime: user.sessionStartTime
        });
    } catch (error) {
        console.error('Error starting session:', error);
        res.status(500).json({ message: 'Server error' });
    }
};




exports.startCoinSession = async (req, res) => {
    try {
        const userId = req.userId;  // from your middleware
        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized: No user ID' });
        }

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        if (user.activeSession) {
            const now = new Date();
            const diffHours = (now - user.sessionStartTime) / (1000 * 60 * 60);
            if (diffHours < 24) {
                return res.status(400).json({ message: 'Coin generation session already active.' });
            } else {
                // Reset session
                user.activeSession = false;
                user.sessionStartTime = null;
                user.lastMultiplyTime = null;
                user.coins = 0;
                await user.save();
            }
        }

        // Start new session
        user.coins = 1;
        user.activeSession = true;
        user.sessionStartTime = new Date();
        user.lastMultiplyTime = new Date();

        await user.save();

        res.status(200).json({ message: 'Coin generation session started.', coins: user.coins });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};
