const transporter = require('../config/email');

/**
 * Send an email using the configured transporter
 * @param {Object} options - Email options (to, subject, html, text)
 */
const sendEmail = async (options) => {
    const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent: %s', info.messageId);
        return info;
    } catch (error) {
        console.error('Error sending email:', error);
        throw error;
    }
};

/**
 * Send a welcome email to a new user
 * @param {string} email - User's email
 * @param {string} name - User's name
 */
const sendWelcomeEmail = async (email, name) => {
    const subject = 'Welcome to Denish - Your Culinary Journey Begins!';
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const html = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
        <div style="background-color: #FF5E00; padding: 40px 20px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px; text-transform: uppercase; letter-spacing: 2px;">Welcome to Denish</h1>
        </div>
        <div style="padding: 40px 30px; color: #333333; line-height: 1.6;">
            <h2 style="color: #FF5E00; margin-top: 0;">Hi ${name},</h2>
            <p style="font-size: 16px;">We're absolutely thrilled to have you join our community! Denish is your premium gateway to the finest culinary experiences, right at your fingertips.</p>
            <p style="font-size: 16px;">Whether you're looking for a quick bite or a gourmet feast, we've got you covered. Get started by exploring the best restaurants in your area.</p>
            <div style="text-align: center; margin: 40px 0;">
                <a href="${frontendUrl}" style="background-color: #FF5E00; color: #ffffff; padding: 15px 35px; text-decoration: none; border-radius: 30px; font-weight: bold; font-size: 16px; display: inline-block; transition: background-color 0.3s;">Explore Now</a>
            </div>
            <p style="font-size: 14px; color: #777777;">If you have any questions, our support team is always here to help.</p>
        </div>
        <div style="background-color: #f9f9f9; padding: 20px; text-align: center; font-size: 12px; color: #999999;">
            <p>&copy; 2026 Denish Platform. All rights reserved.</p>
            <p>You received this email because you signed up for Denish.</p>
        </div>
    </div>
    `;

    return await sendEmail({
        to: email,
        subject,
        html,
        text: `Welcome to Denish, ${name}! We're thrilled to have you join us.`
    });
};

/**
 * Send an OTP email for password reset
 * @param {string} email - User's email
 * @param {string} otp - The OTP code
 */
const sendOTPEmail = async (email, otp) => {
    const subject = 'Your Denish Security Code';
    const html = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
        <div style="background-color: #FF5E00; padding: 30px 20px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Security Verification</h1>
        </div>
        <div style="padding: 40px 30px; color: #333333; line-height: 1.6; text-align: center;">
            <p style="font-size: 16px; margin-bottom: 25px;">Please use the code below to complete your verification. For your security, this code will expire shortly.</p>
            <div style="background-color: #FFF0E6; border: 2px dashed #FF5E00; padding: 20px; border-radius: 8px; display: inline-block;">
                <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #FF5E00;">${otp}</span>
            </div>
            <p style="font-size: 14px; color: #777777; margin-top: 30px;">If you didn't request this code, please ignore this email or contact support if you have concerns.</p>
        </div>
        <div style="background-color: #f9f9f9; padding: 20px; text-align: center; font-size: 12px; color: #999999;">
            <p>&copy; 2026 Denish Platform. All rights reserved.</p>
        </div>
    </div>
    `;

    return await sendEmail({
        to: email,
        subject,
        html,
        text: `Your Denish security code is: ${otp}`
    });
};

module.exports = {
    sendEmail,
    sendWelcomeEmail,
    sendOTPEmail
};
