const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: process.env.EMAIL_PORT == 465, // true for 465, false for other ports
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

// Verify connection configuration (only if not using placeholders)
if (process.env.EMAIL_USER && process.env.EMAIL_USER !== 'your-email@gmail.com') {
    transporter.verify(function (error, success) {
        if (error) {
            console.log('Email configuration error:', error);
        } else {
            console.log('Server is ready to take our messages');
        }
    });
} else {
    console.log('Email service skipped: Please configure EMAIL_USER and EMAIL_PASS in .env');
}

module.exports = transporter;
