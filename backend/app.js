// --- app.js ---
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');

require('dotenv').config();

const app = express();

// Connect to database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/auth', authRoutes);

app.use((err, req, res, next) => {
    console.error(err.stack);
    const timestamp = new Date().toISOString();
    res.status(500).json({
        success: false,
        error: {
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Something went wrong!',
        },
        timestamp: timestamp,
        request_id: `req_${crypto.randomBytes(6).toString('hex')}`,
    });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));