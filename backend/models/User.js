// --- models/User.js ---
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    phone: {
        type: String,
        unique: true,
        sparse: true,
    },
    email: {
        type: String,
        unique: true,
        sparse: true,
    },
    password: {
        type: String,
    },
    is_verified: {
        type: Boolean,
        default: false,
    },
    created_at: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('User', UserSchema);