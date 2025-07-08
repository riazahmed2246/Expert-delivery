// --- controllers/authController.js ---

const User = require('../models/User');
const Verification = require('../models/Verification');
const { generateOtp, sendOtp } = require('../utils/otp');
const sendEmail = require('../utils/email'); // Import the email utility
const crypto = require('crypto');

exports.initiateRegistration = async (req, res) => {
    const { phone, email, verification_method } = req.body;
    const timestamp = new Date().toISOString();
    const request_id = `req_${crypto.randomBytes(6).toString('hex')}`;

    if (!verification_method || (verification_method !== 'phone' && verification_method !== 'email')) {
        return res.status(400).json({
            success: false,
            error: {
                code: 'VALIDATION_ERROR',
                message: 'A verification method of "phone" or "email" is required.',
                details: { field: 'verification_method', value: verification_method },
            },
            timestamp,
            request_id,
        });
    }

    try {
        let existingUser;
        let contact;

        if (verification_method === 'phone') {
            if (!phone) {
                return res.status(400).json({
                    success: false,
                    error: {
                        code: 'VALIDATION_ERROR',
                        message: 'Phone number is required for phone verification.',
                        details: {
                            field: 'phone',
                            value: phone,
                        },
                    },
                    timestamp: timestamp,
                    request_id: `req_${crypto.randomBytes(6).toString('hex')}`,
                });
            }
            const phoneRegex = /^\+8801[3-9]\d{8}$/;
            if (!phoneRegex.test(phone)) {
                return res.status(400).json({
                    success: false,
                    error: {
                        code: 'VALIDATION_ERROR',
                        message: 'Invalid Bangladeshi phone number format. Use E.164 format (e.g., +8801712345678).',
                        details: {
                            field: 'phone',
                            value: phone,
                        },
                    },
                    timestamp: timestamp,
                    request_id: `req_${crypto.randomBytes(6).toString('hex')}`,
                });
            }
            existingUser = await User.findOne({ phone });
            contact = phone;
        } else { // verification_method === 'email'
            if (!email) {
                return res.status(400).json({
                    success: false,
                    error: {
                        code: 'VALIDATION_ERROR',
                        message: 'Email is required for email verification.',
                        details: { field: 'email', value: email },
                    },
                    timestamp,
                    request_id,
                });
            }
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                return res.status(400).json({
                    success: false,
                    error: {
                        code: 'VALIDATION_ERROR',
                        message: 'Invalid email address format.',
                        details: { field: 'email', value: email },
                    },
                    timestamp,
                    request_id,
                });
            }
            existingUser = await User.findOne({ email });
            contact = email;
        }

        if (existingUser) {
            return res.status(409).json({
                success: false,
                error: {
                    code: 'CONFLICT_ERROR',
                    message: `${verification_method.charAt(0).toUpperCase() + verification_method.slice(1)} already registered.`,
                    details: { field: verification_method, value: contact },
                },
                timestamp,
                request_id,
            });
        }

        const otp = generateOtp();
        const verification_id = `ver_${crypto.randomBytes(12).toString('hex')}`;
        const now = new Date();
        const expires_at = new Date(now.getTime() + 5 * 60 * 1000); // Expires in 5 minutes
        const resend_after = new Date(now.getTime() + 1 * 60 * 1000); // Resend after 1 minute

        const verification = new Verification({
            verification_id,
            method: verification_method,
            contact,
            otp,
            expires_at,
            resend_after,
        });
        await verification.save();

        if (verification_method === 'phone') {
            await sendOtp(phone, otp);
        } else {
            // Use the new email utility to send the OTP
            await sendEmail({
                email: email,
                subject: 'Your Verification Code',
                message: `Your account verification code is ${otp}. It will expire in 5 minutes.`,
            });
        }

        const masked_contact = verification_method === 'phone'
            ? `${phone.substring(0, 7)}****${phone.substring(11)}`
            : `${email.split('@')[0].substring(0, 3)}****@${email.split('@')[1]}`;

        return res.status(200).json({
            success: true,
            data: {
                verification_id,
                method: verification_method,
                masked_contact,
                expires_at: expires_at.toISOString(),
                resend_after: resend_after.toISOString(),
            },
            message: 'OTP sent successfully',
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_SERVER_ERROR',
                message: 'An unexpected error occurred.',
                details: error.message, // Provide more detail in development/logs
            },
            timestamp,
            request_id,
        });
    }
};