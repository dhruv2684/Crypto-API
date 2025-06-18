const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const mongoose = require('mongoose');

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
const DB_URI = process.env.DB_LINK.replace('1NGhkT7i3Do4YRAs', process.env.DB_PASS);
mongoose.connect(DB_URI, {
  dbName: process.env.DB_NAME,
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('✅ MongoDB connected'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

// Import your multiplyCoins function
const { multiplyCoins } = require('./utility/SessionStart'); // <- update path

// Routes
const adminRoutes = require('./routes/AdminRoute');
const userRoutes = require('./routes/UserRoute');

app.use('/api/admin', adminRoutes);
app.use('/api/user', userRoutes);

app.get('/', (req, res) => {
  res.send('Server is running...CRYPTO');
});

// Start the multiplyCoins function to run every 3 seconds
// setInterval(() => {
//   multiplyCoins().catch(err => console.error('multiplyCoins error:', err));
// }, 3000);

app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
