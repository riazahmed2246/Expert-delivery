// --- utils/otp.js ---
const twilio = require('twilio');
require('dotenv').config();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

const client = twilio(accountSid, authToken);

const generateOtp = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

const sendOtp = async (to, otp) => {
    try {
        await client.messages.create({
            body: `Your verification code is ${otp}`,
            from: twilioPhoneNumber,
            to: to,
        });
        console.log(`OTP sent to ${to}`);
    } catch (error) {
        console.error(`Error sending OTP to ${to}:`, error);
        throw new Error('Failed to send OTP');
    }
};

module.exports = {
    generateOtp,
    sendOtp,
};