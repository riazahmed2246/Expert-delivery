// --- models/Verification.js ---
const mongoose = require('mongoose');

const VerificationSchema = new mongoose.Schema({
    verification_id: {
        type: String,
        required: true,
        unique: true,
    },
    method: {
        type: String,
        enum: ['phone', 'email'],
        required: true,
    },
    contact: {
        type: String,
        required: true,
    },
    otp: {
        type: String,
        required: true,
    },
    expires_at: {
        type: Date,
        required: true,
    },
    resend_after: {
        type: Date,
        required: true,
    },
    created_at: {
        type: Date,
        default: Date.now,
        expires: '10m', // OTP documents will be automatically deleted after 10 minutes
    },
});

module.exports = mongoose.model('Verification', VerificationSchema);
