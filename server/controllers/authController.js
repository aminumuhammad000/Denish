const Vendor = require('../models/Vendor');
const Customer = require('../models/Customer');
const Driver = require('../models/Driver');
const { sendWelcomeEmail, sendOTPEmail } = require('../utils/emailService');

const vendorLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const cleanEmail = email ? email.trim() : '';
    const cleanPassword = password ? password.trim() : '';

    let vendor = await Vendor.findOne({
      $or: [
        { email: { $regex: new RegExp(`^${cleanEmail.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') } },
        { phone: cleanEmail }
      ]
    });

    if (!vendor || (vendor.password && vendor.password !== cleanPassword)) {
      return res.status(401).json({ success: false, error: 'Invalid email/phone or password' });
    }

    res.status(200).json({ success: true, token: 'fake-jwt-token-for-' + vendor._id, vendor });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const vendorSignup = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;
    
    // Check if exists
    const existingEmail = await Vendor.findOne({ email });
    if (existingEmail) {
       return res.status(400).json({ success: false, error: 'Email already in use' });
    }

    const existingPhone = await Vendor.findOne({ phone });
    if (existingPhone) {
       return res.status(400).json({ success: false, error: 'Phone number already in use' });
    }

    const vendor = await Vendor.create({ name, email, phone, password });
    
    // Send welcome email in the background
    sendWelcomeEmail(email, name).catch(err => console.error('Error sending welcome email to vendor:', err));

    res.status(201).json({ success: true, token: 'fake-jwt-token-for-' + vendor._id, vendor });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const customerLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const cleanEmail = email ? email.trim() : '';
    const cleanPassword = password ? password.trim() : '';

    const customer = await Customer.findOne({
      $or: [
        { email: { $regex: new RegExp(`^${cleanEmail.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') } },
        { phone: cleanEmail }
      ]
    });

    if (!customer || customer.password !== cleanPassword) {
      return res.status(401).json({ success: false, error: 'Invalid email/phone or password' });
    }

    res.status(200).json({ success: true, token: 'cust-token-' + customer._id, user: customer });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const customerSignup = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;
    
    const existing = await Customer.findOne({ $or: [{ email }, { phone }] });
    if (existing) {
      return res.status(400).json({ success: false, error: 'Email or phone number already in use' });
    }

    const customer = await Customer.create({ name, email, phone, password });

    // Send welcome email in the background
    sendWelcomeEmail(email, name).catch(err => console.error('Error sending welcome email to customer:', err));

    res.status(201).json({ success: true, token: 'cust-token-' + customer._id, user: customer });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const driverLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const cleanEmail = email ? email.trim() : '';
    const cleanPassword = password ? password.trim() : '';

    const driver = await Driver.findOne({
      $or: [
        { email: { $regex: new RegExp(`^${cleanEmail.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') } },
        { phone: cleanEmail }
      ]
    });

    if (!driver || driver.password !== cleanPassword) {
      return res.status(401).json({ success: false, error: 'Invalid email/phone or password' });
    }

    res.status(200).json({ success: true, token: 'driver-token-' + driver._id, user: driver });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const driverSignup = async (req, res) => {
  try {
    const { name, email, phone, password, vehicleType } = req.body;
    
    const existing = await Driver.findOne({ $or: [{ email }, { phone }] });
    if (existing) {
      return res.status(400).json({ success: false, error: 'Email or phone number already in use' });
    }

    const driver = await Driver.create({ name, email, phone, password, vehicleType });

    // Send welcome email in the background
    sendWelcomeEmail(email, name).catch(err => console.error('Error sending welcome email to driver:', err));

    res.status(201).json({ success: true, token: 'driver-token-' + driver._id, user: driver });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email, role } = req.body; // role: 'customer', 'vendor', or 'driver'
    const cleanEmail = email ? email.trim() : '';
    if (!cleanEmail) {
      return res.status(400).json({ success: false, error: 'Email is required' });
    }

    const searchRegex = new RegExp(`^${cleanEmail.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i');
    let user = null;
    let targetRole = role || 'vendor';

    // Check specified role first
    if (role === 'vendor') {
      user = await Vendor.findOne({ email: searchRegex });
    } else if (role === 'driver') {
      user = await Driver.findOne({ email: searchRegex });
    } else if (role === 'customer') {
      user = await Customer.findOne({ email: searchRegex });
    }

    // If not found in preferred role, fallback search across all roles
    if (!user) {
      const [cUser, vUser, dUser] = await Promise.all([
        Customer.findOne({ email: searchRegex }),
        Vendor.findOne({ email: searchRegex }),
        Driver.findOne({ email: searchRegex }),
      ]);
      if (cUser) { user = cUser; targetRole = 'customer'; }
      else if (vUser) { user = vUser; targetRole = 'vendor'; }
      else if (dUser) { user = dUser; targetRole = 'driver'; }
    }

    if (!user) {
      return res.status(404).json({ success: false, error: 'No account found with this email address' });
    }

    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Save this OTP to the database with an expiration (1 hour)
    user.resetPasswordOTP = otp;
    user.resetPasswordExpires = Date.now() + 3600000; 
    await user.save();

    let emailSent = false;
    try {
      await sendOTPEmail(user.email, otp);
      emailSent = true;
    } catch (emailErr) {
      console.error('Error sending OTP email via SMTP:', emailErr.message);
      console.log(`[DEV OTP LOG] Verification code for ${user.email}: ${otp}`);
    }

    res.status(200).json({ 
      success: true, 
      message: 'OTP verification code sent to your email.', 
      role: targetRole,
      devOtp: process.env.NODE_ENV !== 'production' ? otp : undefined
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const verifyOTP = async (req, res) => {
  try {
    const { email, otp, role } = req.body;
    const cleanEmail = email ? email.trim() : '';
    const cleanOTP = otp ? otp.trim() : '';

    if (!cleanEmail || !cleanOTP) {
      return res.status(400).json({ success: false, error: 'Email and OTP code are required' });
    }

    const searchRegex = new RegExp(`^${cleanEmail.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i');
    let user = null;

    if (role === 'vendor') user = await Vendor.findOne({ email: searchRegex });
    else if (role === 'driver') user = await Driver.findOne({ email: searchRegex });
    else if (role === 'customer') user = await Customer.findOne({ email: searchRegex });

    if (!user) {
      user = await Customer.findOne({ email: searchRegex }) ||
             await Vendor.findOne({ email: searchRegex }) ||
             await Driver.findOne({ email: searchRegex });
    }

    if (!user) {
      return res.status(404).json({ success: false, error: 'User account not found' });
    }

    if (!user.resetPasswordOTP || String(user.resetPasswordOTP).trim() !== cleanOTP) {
      return res.status(400).json({ success: false, error: 'Invalid OTP code. Please check and try again.' });
    }

    if (!user.resetPasswordExpires || user.resetPasswordExpires < Date.now()) {
      return res.status(400).json({ success: false, error: 'OTP code has expired. Please request a new one.' });
    }

    res.status(200).json({ success: true, message: 'OTP verified successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword, role } = req.body;
    const cleanEmail = email ? email.trim() : '';
    const cleanOTP = otp ? otp.trim() : '';
    const cleanPassword = newPassword ? newPassword.trim() : '';

    if (!cleanEmail || !cleanOTP || !cleanPassword) {
      return res.status(400).json({ success: false, error: 'Email, OTP code, and new password are required' });
    }

    if (cleanPassword.length < 6) {
      return res.status(400).json({ success: false, error: 'Password must be at least 6 characters long' });
    }

    const searchRegex = new RegExp(`^${cleanEmail.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i');
    let user = null;

    if (role === 'vendor') {
      user = await Vendor.findOne({ email: searchRegex });
    } else if (role === 'driver') {
      user = await Driver.findOne({ email: searchRegex });
    } else if (role === 'customer') {
      user = await Customer.findOne({ email: searchRegex });
    }

    if (!user) {
      user = await Customer.findOne({ email: searchRegex }) ||
             await Vendor.findOne({ email: searchRegex }) ||
             await Driver.findOne({ email: searchRegex });
    }

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    if (!user.resetPasswordOTP || String(user.resetPasswordOTP).trim() !== cleanOTP) {
      return res.status(400).json({ success: false, error: 'Invalid OTP code. Please check and try again.' });
    }

    if (!user.resetPasswordExpires || user.resetPasswordExpires < Date.now()) {
      return res.status(400).json({ success: false, error: 'OTP code has expired. Please request a new one.' });
    }

    user.password = cleanPassword;
    user.resetPasswordOTP = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.status(200).json({ success: true, message: 'Password reset successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  vendorLogin,
  vendorSignup,
  customerLogin,
  customerSignup,
  driverLogin,
  driverSignup,
  forgotPassword,
  verifyOTP,
  resetPassword
};
