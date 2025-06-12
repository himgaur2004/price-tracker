const nodemailer = require('nodemailer');

// Create transporter with Gmail
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

// Send price alert email
const sendPriceAlert = async (userEmail, productName, currentPrice, url) => {
    try {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: userEmail,
            subject: `Price Alert: ${productName}`,
            html: `
                <h2>Price Alert for ${productName}</h2>
                <p>The current price is: $${currentPrice}</p>
                <p>Check out the product here: <a href="${url}">${url}</a></p>
                <br>
                <p>Best regards,</p>
                <p>Your Price Tracker Team</p>
            `
        };

        await transporter.sendMail(mailOptions);
        console.log('Price alert email sent successfully to:', userEmail);
        return true;
    } catch (error) {
        console.error('Error sending price alert email:', error);
        throw error;
    }
};

// Send test email for verifying settings
const sendTestEmail = async (userEmail) => {
    try {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: userEmail,
            subject: 'Price Tracker: Email Settings Test',
            html: `
                <h2>Email Settings Test</h2>
                <p>This is a test email to confirm your email settings are working correctly.</p>
                <p>You will receive price alerts at this email address.</p>
                <br>
                <p>Best regards,</p>
                <p>Your Price Tracker Team</p>
            `
        };

        await transporter.sendMail(mailOptions);
        console.log('Test email sent successfully to:', userEmail);
        return true;
    } catch (error) {
        console.error('Error sending test email:', error);
        throw error;
    }
};

module.exports = {
    sendPriceAlert,
    sendTestEmail
}; 