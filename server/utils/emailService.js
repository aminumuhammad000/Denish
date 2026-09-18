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

/**
 * Send an email notification to vendor when a customer places an order
 */
const sendVendorNewOrderEmail = async ({ vendorEmail, vendorName, order }) => {
    if (!vendorEmail) return null;
    const subject = `🍽️ New Order Received: #${order.orderId}`;
    const itemsListHtml = (order.items || []).map(it => `
        <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0; color: #333; font-weight: 500;">
                ${it.name} <span style="color: #888; font-size: 13px;">x${it.quantity || 1}</span>
            </td>
            <td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0; text-align: right; color: #333; font-weight: 600;">
                ₦${((it.price || 0) * (it.quantity || 1)).toLocaleString()}
            </td>
        </tr>
    `).join('');

    const html = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); border: 1px solid #eaeaea;">
        <div style="background: linear-gradient(135deg, #FF5E00 0%, #FF8C00 100%); padding: 32px 24px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 26px; letter-spacing: 1px;">New Order Received!</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 15px;">Order #${order.orderId}</p>
        </div>
        <div style="padding: 30px 24px; color: #333333; line-height: 1.6;">
            <h2 style="color: #111; margin-top: 0; font-size: 20px;">Hello ${vendorName || 'Vendor'},</h2>
            <p style="font-size: 15px; color: #555;">You have just received a new order on Denish. Please review the details below and begin preparation promptly.</p>
            
            <div style="background-color: #fcfcfc; border: 1px solid #eee; border-radius: 8px; padding: 18px; margin: 20px 0;">
                <h3 style="margin: 0 0 12px 0; font-size: 13px; text-transform: uppercase; color: #888; letter-spacing: 0.5px;">Customer & Delivery Details</h3>
                <p style="margin: 4px 0; font-size: 14px;"><strong>Customer:</strong> ${order.customerName || 'Anonymous'}</p>
                ${order.customerPhone ? `<p style="margin: 4px 0; font-size: 14px;"><strong>Phone:</strong> ${order.customerPhone}</p>` : ''}
                <p style="margin: 4px 0; font-size: 14px;"><strong>Delivery Address:</strong> ${order.deliveryAddress || order.address || 'Standard Delivery'}</p>
                <p style="margin: 4px 0; font-size: 14px;"><strong>Payment Method:</strong> ${order.paymentMethod || 'Online'}</p>
            </div>

            <div style="margin: 25px 0;">
                <h3 style="margin: 0 0 12px 0; font-size: 13px; text-transform: uppercase; color: #888; letter-spacing: 0.5px;">Items Ordered</h3>
                <table style="width: 100%; border-collapse: collapse;">
                    <tbody>
                        ${itemsListHtml}
                    </tbody>
                </table>
                <div style="margin-top: 15px; text-align: right;">
                    <p style="font-size: 18px; font-weight: 800; color: #FF5E00; margin: 0;">
                        Total: ₦${(order.totalAmount || order.total || 0).toLocaleString()}
                    </p>
                </div>
            </div>

            <div style="text-align: center; margin: 30px 0 10px 0;">
                <a href="${process.env.FRONTEND_URL || 'https://admin.denishng.com'}" style="background-color: #FF5E00; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 25px; font-weight: bold; font-size: 15px; display: inline-block;">Open Vendor Portal</a>
            </div>
        </div>
        <div style="background-color: #f9f9f9; padding: 18px; text-align: center; font-size: 12px; color: #999999; border-top: 1px solid #eeeeee;">
            <p style="margin: 0;">&copy; 2026 Denish Platform. Automated Vendor Notification.</p>
        </div>
    </div>
    `;

    return await sendEmail({
        to: vendorEmail,
        subject,
        html,
        text: `New order #${order.orderId} received from ${order.customerName} for total ₦${(order.totalAmount || order.total || 0).toLocaleString()}. Please check your vendor dashboard.`
    });
};

/**
 * Send an email notification to customer when order is being processed / prepared
 */
const sendOrderProcessingEmail = async ({ customerEmail, customerName, order }) => {
    if (!customerEmail) return null;
    const subject = `🍳 Your Denish Order #${order.orderId} is Being Prepared!`;
    const itemsListHtml = (order.items || []).map(it => `
        <tr>
            <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0; color: #444; font-size: 14px;">
                ${it.name} <span style="color: #888; font-size: 12px;">x${it.quantity || 1}</span>
            </td>
            <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0; text-align: right; color: #444; font-weight: 600; font-size: 14px;">
                ₦${((it.price || 0) * (it.quantity || 1)).toLocaleString()}
            </td>
        </tr>
    `).join('');

    const html = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); border: 1px solid #eaeaea;">
        <div style="background: linear-gradient(135deg, #FF5E00 0%, #FFA033 100%); padding: 32px 24px; text-align: center;">
            <div style="font-size: 40px; margin-bottom: 8px;">🍳</div>
            <h1 style="color: #ffffff; margin: 0; font-size: 24px; letter-spacing: 1px;">Order in the Kitchen!</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 6px 0 0 0; font-size: 14px;">Order #${order.orderId}</p>
        </div>
        <div style="padding: 30px 24px; color: #333333; line-height: 1.6;">
            <h2 style="color: #111; margin-top: 0; font-size: 19px;">Hi ${customerName || 'there'},</h2>
            <p style="font-size: 15px; color: #555;">Great news! <strong>${order.vendorName || 'The restaurant'}</strong> has accepted your order and is now preparing your meal with care.</p>
            
            <div style="background: #FFF7ED; border-left: 4px solid #FF5E00; padding: 14px 18px; border-radius: 0 8px 8px 0; margin: 20px 0;">
                <p style="margin: 0; font-size: 14px; color: #9A3412; font-weight: 600;">Status: Preparing your order</p>
                <p style="margin: 4px 0 0 0; font-size: 13px; color: #C2410C;">A dispatch partner will pick it up as soon as it's fresh and ready.</p>
            </div>

            <div style="margin: 22px 0;">
                <h3 style="margin: 0 0 10px 0; font-size: 13px; text-transform: uppercase; color: #888; letter-spacing: 0.5px;">Order Summary</h3>
                <table style="width: 100%; border-collapse: collapse;">
                    <tbody>
                        ${itemsListHtml}
                    </tbody>
                </table>
                <div style="margin-top: 14px; text-align: right;">
                    <p style="font-size: 16px; font-weight: 700; color: #FF5E00; margin: 0;">
                        Total: ₦${(order.totalAmount || order.total || 0).toLocaleString()}
                    </p>
                </div>
            </div>

            <div style="background-color: #F8FAFC; border-radius: 8px; padding: 14px 18px; margin: 20px 0;">
                <p style="margin: 0; font-size: 13px; color: #64748B;"><strong>Delivering to:</strong> ${order.deliveryAddress || order.address || 'Your saved address'}</p>
            </div>

            <p style="font-size: 14px; color: #777; text-align: center; margin-top: 25px;">You can track your rider and view live updates in real time on the Denish App.</p>
        </div>
        <div style="background-color: #f9f9f9; padding: 18px; text-align: center; font-size: 12px; color: #999999; border-top: 1px solid #eeeeee;">
            <p style="margin: 0;">&copy; 2026 Denish Platform. Thank you for choosing Denish!</p>
        </div>
    </div>
    `;

    return await sendEmail({
        to: customerEmail,
        subject,
        html,
        text: `Hi ${customerName}, your order #${order.orderId} is being prepared by ${order.vendorName}. Total: ₦${(order.totalAmount || order.total || 0).toLocaleString()}. Track live in the Denish app!`
    });
};

/**
 * Send an email notification to customer when order has arrived / delivered
 */
const sendOrderDeliveredEmail = async ({ customerEmail, customerName, order }) => {
    if (!customerEmail) return null;
    const subject = `🎉 Your Denish Order #${order.orderId} Has Arrived!`;

    const html = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); border: 1px solid #eaeaea;">
        <div style="background: linear-gradient(135deg, #10B981 0%, #059669 100%); padding: 36px 24px; text-align: center;">
            <div style="font-size: 42px; margin-bottom: 8px;">🎉</div>
            <h1 style="color: #ffffff; margin: 0; font-size: 24px; letter-spacing: 1px;">Your Order Has Arrived!</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 6px 0 0 0; font-size: 14px;">Order #${order.orderId}</p>
        </div>
        <div style="padding: 30px 24px; color: #333333; line-height: 1.6;">
            <h2 style="color: #111; margin-top: 0; font-size: 19px;">Enjoy your meal, ${customerName || 'Foodie'}!</h2>
            <p style="font-size: 15px; color: #555;">Your order from <strong>${order.vendorName || 'Denish Restaurant'}</strong> has arrived at your destination:</p>
            
            <div style="background-color: #F0FDF4; border: 1px solid #BBF7D0; border-radius: 8px; padding: 14px 18px; margin: 18px 0;">
                <p style="margin: 0; font-size: 14px; color: #166534; font-weight: 600;">📍 Delivered to:</p>
                <p style="margin: 4px 0 0 0; font-size: 13px; color: #15803D;">${order.deliveryAddress || order.address || 'Your specified address'}</p>
            </div>

            <p style="font-size: 15px; color: #555;">We hope everything is delicious and satisfies your cravings! Your feedback helps us make Denish better every day.</p>

            <div style="text-align: center; margin: 30px 0 15px 0;">
                <p style="font-size: 14px; color: #888; margin-bottom: 12px;">How was your experience?</p>
                <span style="font-size: 28px; letter-spacing: 6px;">⭐⭐⭐⭐⭐</span>
            </div>

            <p style="font-size: 13px; color: #777; text-align: center; margin-top: 20px;">Open the Denish App to leave a quick rating for the restaurant and driver.</p>
        </div>
        <div style="background-color: #f9f9f9; padding: 18px; text-align: center; font-size: 12px; color: #999999; border-top: 1px solid #eeeeee;">
            <p style="margin: 0;">&copy; 2026 Denish Platform. Bon Appétit!</p>
        </div>
    </div>
    `;

    return await sendEmail({
        to: customerEmail,
        subject,
        html,
        text: `Your Denish order #${order.orderId} from ${order.vendorName} has arrived at ${order.deliveryAddress || order.address}! Enjoy your meal.`
    });
};

/**
 * Dispatch helper: notify vendor when order is placed
 */
const notifyVendorOrderPlaced = async (order, vendorDoc = null) => {
    try {
        let vendorEmail = order.vendorEmail;
        let vendorName = order.vendorName;

        if (!vendorEmail && (vendorDoc || order.vendorId)) {
            if (!vendorDoc && order.vendorId) {
                const Vendor = require('../models/Vendor');
                vendorDoc = await Vendor.findById(order.vendorId);
            }
            if (vendorDoc) {
                vendorEmail = vendorDoc.email;
                vendorName = vendorDoc.businessName || vendorDoc.name || vendorName;
            }
        }

        if (vendorEmail) {
            await sendVendorNewOrderEmail({ vendorEmail, vendorName, order });
            console.log(`[EmailNotification] Vendor notified for order ${order.orderId} at ${vendorEmail}`);
        } else {
            console.log(`[EmailNotification] Vendor email not found for order ${order.orderId}`);
        }
    } catch (err) {
        console.warn(`[EmailNotification] Error notifying vendor for order ${order?.orderId}:`, err.message);
    }
};

/**
 * Dispatch helper: notify customer when order is in processing/preparing
 */
const notifyCustomerOrderProcessing = async (order) => {
    try {
        if (order.processingEmailSent) return;

        let customerEmail = order.customerEmail;
        let customerName = order.customerName;

        if (!customerEmail && order.customerId) {
            const Customer = require('../models/Customer');
            const cust = await Customer.findById(order.customerId);
            if (cust) {
                customerEmail = cust.email;
                customerName = cust.name || customerName;
            }
        }

        if (customerEmail) {
            order.processingEmailSent = true;
            if (order.save) await order.save();

            await sendOrderProcessingEmail({ customerEmail, customerName, order });
            console.log(`[EmailNotification] Customer notified for order ${order.orderId} processing at ${customerEmail}`);
        } else {
            console.log(`[EmailNotification] Customer email not found for order ${order.orderId}`);
        }
    } catch (err) {
        console.warn(`[EmailNotification] Error notifying customer for order ${order?.orderId} processing:`, err.message);
    }
};

/**
 * Dispatch helper: notify customer when order has arrived/delivered
 */
const notifyCustomerOrderDelivered = async (order) => {
    try {
        if (order.deliveredEmailSent) return;

        let customerEmail = order.customerEmail;
        let customerName = order.customerName;

        if (!customerEmail && order.customerId) {
            const Customer = require('../models/Customer');
            const cust = await Customer.findById(order.customerId);
            if (cust) {
                customerEmail = cust.email;
                customerName = cust.name || customerName;
            }
        }

        if (customerEmail) {
            order.deliveredEmailSent = true;
            if (order.save) await order.save();

            await sendOrderDeliveredEmail({ customerEmail, customerName, order });
            console.log(`[EmailNotification] Customer notified for order ${order.orderId} delivery at ${customerEmail}`);
        } else {
            console.log(`[EmailNotification] Customer email not found for order ${order.orderId}`);
        }
    } catch (err) {
        console.warn(`[EmailNotification] Error notifying customer for order ${order?.orderId} delivery:`, err.message);
    }
};

module.exports = {
    sendEmail,
    sendWelcomeEmail,
    sendOTPEmail,
    sendVendorNewOrderEmail,
    sendOrderProcessingEmail,
    sendOrderDeliveredEmail,
    notifyVendorOrderPlaced,
    notifyCustomerOrderProcessing,
    notifyCustomerOrderDelivered
};
