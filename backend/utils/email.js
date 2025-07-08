const nodemailer = require('nodemailer');
require('dotenv').config();

const sendEmail = async (options) => {
    // 1. Create a transporter
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    // 2. Define the email options
    const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: options.email,
        subject: options.subject,
        text: options.message,
        // html: can be used for richer email templates
    };

    // 3. Actually send the email
    try {
        await transporter.sendMail(mailOptions);
        console.log(`Email sent successfully to ${options.email}`);
    } catch (error) {
        console.error(`Error sending email to ${options.email}:`, error);
        throw new Error('There was an error sending the verification email.');
    }
};

module.exports = sendEmail;