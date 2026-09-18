const Vendor = require('../models/Vendor');
const Customer = require('../models/Customer');
const Driver = require('../models/Driver');
const Admin = require('../models/Admin');
const axios = require('axios');
const { sendWelcomeEmail, sendOTPEmail } = require('../utils/emailService');

/**
 * Validates that an email or phone number is unique across ALL roles in the system
 * (Customer, Vendor, Driver, and Admin) so a vendor email cannot be used as a customer, etc.
 */
const checkEmailAndPhoneAcrossAllRoles = async ({ email, phone, currentId = null }) => {
  const cleanEmail = email ? email.trim().toLowerCase() : '';
  const cleanPhone = phone ? phone.trim() : '';

  const emailRegex = cleanEmail ? new RegExp(`^${cleanEmail.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') : null;

  // 1. Check Admin
  if (cleanEmail) {
    const adminExists = await Admin.findOne({ email: emailRegex });
    if (adminExists) {
      return {
        exists: true,
        role: 'Admin',
        error: 'This email is reserved for administrative access. Please use a different email address.'
      };
    }
  }

  // 2. Check Customer, Vendor, Driver in parallel
  const [customer, vendor, driver] = await Promise.all([
    (cleanEmail || cleanPhone) ? Customer.findOne({
      $or: [
        ...(emailRegex ? [{ email: emailRegex }] : []),
        ...(cleanPhone ? [{ phone: cleanPhone }] : [])
      ]
    }) : null,
    (cleanEmail || cleanPhone) ? Vendor.findOne({
      $or: [
        ...(emailRegex ? [{ email: emailRegex }] : []),
        ...(cleanPhone ? [{ phone: cleanPhone }] : [])
      ]
    }) : null,
    (cleanEmail || cleanPhone) ? Driver.findOne({
      $or: [
        ...(emailRegex ? [{ email: emailRegex }] : []),
        ...(cleanPhone ? [{ phone: cleanPhone }] : [])
      ]
    }) : null,
  ]);

  if (vendor && (!currentId || vendor._id.toString() !== currentId.toString())) {
    const isEmailMatch = emailRegex && vendor.email && vendor.email.toLowerCase() === cleanEmail;
    return {
      exists: true,
      role: 'Vendor',
      error: isEmailMatch
        ? `This email is already registered as a Vendor (${vendor.businessName || vendor.name}). Each account must have a unique email address across roles. Please log in as a Vendor or use a different email.`
        : 'This phone number is already registered with a Vendor account.'
    };
  }

  if (customer && (!currentId || customer._id.toString() !== currentId.toString())) {
    const isEmailMatch = emailRegex && customer.email && customer.email.toLowerCase() === cleanEmail;
    return {
      exists: true,
      role: 'Customer',
      error: isEmailMatch
        ? `This email is already registered as a Customer (${customer.name}). Each account must have a unique email address across roles. Please log in as a Customer or use a different email.`
        : 'This phone number is already registered with a Customer account.'
    };
  }

  if (driver && (!currentId || driver._id.toString() !== currentId.toString())) {
    const isEmailMatch = emailRegex && driver.email && driver.email.toLowerCase() === cleanEmail;
    return {
      exists: true,
      role: 'Driver',
      error: isEmailMatch
        ? `This email is already registered as a Driver / Rider (${driver.name}). Each account must have a unique email address across roles. Please log in as a Driver or use a different email.`
        : 'This phone number is already registered with a Driver account.'
    };
  }

  return { exists: false };
};

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
    const cleanEmail = email ? email.trim() : '';
    const cleanPhone = phone ? phone.trim() : '';

    if (!cleanEmail) {
      return res.status(400).json({ success: false, error: 'Email is required' });
    }

    // Check unique across all roles
    const check = await checkEmailAndPhoneAcrossAllRoles({ email: cleanEmail, phone: cleanPhone });
    if (check.exists) {
      return res.status(400).json({ success: false, error: check.error });
    }

    const vendor = await Vendor.create({ 
      name: name ? name.trim() : '', 
      email: cleanEmail, 
      phone: cleanPhone, 
      password,
      businessName: name ? name.trim() : '',
      category: 'Local dishes',
      address: '',
      about: '',
      logoUrl: '',
      coverUrl: '',
      status: 'Pending'
    });
    
    // Send welcome email in the background
    sendWelcomeEmail(cleanEmail, name).catch(err => console.error('Error sending welcome email to vendor:', err));

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
    const cleanEmail = email ? email.trim() : '';
    const cleanPhone = phone ? phone.trim() : '';

    if (!cleanEmail) {
      return res.status(400).json({ success: false, error: 'Email is required' });
    }

    // Check unique across all roles (Customer, Vendor, Driver, Admin)
    const check = await checkEmailAndPhoneAcrossAllRoles({ email: cleanEmail, phone: cleanPhone });
    if (check.exists) {
      return res.status(400).json({ success: false, error: check.error });
    }

    const cleanName = (name || 'DENISH').replace(/[^a-zA-Z]/g, '').slice(0, 5).toUpperCase() || 'DENISH';
    const codeSuffix = cleanPhone ? cleanPhone.slice(-3) : Math.floor(100 + Math.random() * 900);
    const referralCode = `${cleanName}${codeSuffix}`;

    const customer = await Customer.create({ 
      name: name ? name.trim() : 'Customer', 
      email: cleanEmail, 
      phone: cleanPhone, 
      password, 
      referralCode 
    });

    // Send welcome email in the background
    sendWelcomeEmail(cleanEmail, name).catch(err => console.error('Error sending welcome email to customer:', err));

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
    const cleanEmail = email ? email.trim() : '';
    const cleanPhone = phone ? phone.trim() : '';

    if (!cleanEmail) {
      return res.status(400).json({ success: false, error: 'Email is required' });
    }

    // Check unique across all roles (Customer, Vendor, Driver, Admin)
    const check = await checkEmailAndPhoneAcrossAllRoles({ email: cleanEmail, phone: cleanPhone });
    if (check.exists) {
      return res.status(400).json({ success: false, error: check.error });
    }

    const driver = await Driver.create({ 
      name: name ? name.trim() : 'Driver', 
      email: cleanEmail, 
      phone: cleanPhone, 
      password, 
      vehicleType: vehicleType || 'Motorcycle' 
    });

    // Send welcome email in the background
    sendWelcomeEmail(cleanEmail, name).catch(err => console.error('Error sending welcome email to driver:', err));

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
      return res.status(400).json({ success: false, error: 'Email or phone number is required' });
    }

    const searchRegex = new RegExp(`^${cleanEmail.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i');
    const searchFilter = {
      $or: [
        { email: searchRegex },
        { phone: cleanEmail }
      ]
    };

    let user = null;
    let targetRole = role || 'customer';

    // Check specified role first
    if (role === 'vendor') {
      user = await Vendor.findOne(searchFilter);
    } else if (role === 'driver') {
      user = await Driver.findOne(searchFilter);
    } else if (role === 'customer') {
      user = await Customer.findOne(searchFilter);
    }

    // If not found in preferred role, fallback search across all roles
    if (!user) {
      const [cUser, vUser, dUser] = await Promise.all([
        Customer.findOne(searchFilter),
        Vendor.findOne(searchFilter),
        Driver.findOne(searchFilter),
      ]);
      if (cUser) { user = cUser; targetRole = 'customer'; }
      else if (vUser) { user = vUser; targetRole = 'vendor'; }
      else if (dUser) { user = dUser; targetRole = 'driver'; }
    }

    if (!user) {
      return res.status(404).json({ success: false, error: 'No account found with this email or phone number' });
    }

    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Save this OTP to the database with an expiration (1 hour)
    user.resetPasswordOTP = otp;
    user.resetPasswordExpires = Date.now() + 3600000; 
    await user.save();

    let emailSent = false;
    if (user.email) {
      try {
        await sendOTPEmail(user.email, otp);
        emailSent = true;
      } catch (emailErr) {
        console.error('Error sending OTP email via SMTP:', emailErr.message);
        console.log(`[DEV OTP LOG] Verification code for ${user.email}: ${otp}`);
      }
    }

    res.status(200).json({ 
      success: true, 
      message: emailSent 
        ? 'OTP verification code sent to your email.' 
        : `OTP code: ${otp} (Email delivery offline; verification code provided).`, 
      role: targetRole,
      devOtp: otp
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
    const searchFilter = {
      $or: [
        { email: searchRegex },
        { phone: cleanEmail }
      ]
    };
    let user = null;

    if (role === 'vendor') user = await Vendor.findOne(searchFilter);
    else if (role === 'driver') user = await Driver.findOne(searchFilter);
    else if (role === 'customer') user = await Customer.findOne(searchFilter);

    if (!user) {
      user = await Customer.findOne(searchFilter) ||
             await Vendor.findOne(searchFilter) ||
             await Driver.findOne(searchFilter);
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
    const searchFilter = {
      $or: [
        { email: searchRegex },
        { phone: cleanEmail }
      ]
    };
    let user = null;

    if (role === 'vendor') {
      user = await Vendor.findOne(searchFilter);
    } else if (role === 'driver') {
      user = await Driver.findOne(searchFilter);
    } else if (role === 'customer') {
      user = await Customer.findOne(searchFilter);
    }

    if (!user) {
      user = await Customer.findOne(searchFilter) ||
             await Vendor.findOne(searchFilter) ||
             await Driver.findOne(searchFilter);
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

    // Ensure the new password is different from the current password
    let isSamePassword = false;
    if (user.password) {
      if (user.password === cleanPassword) {
        isSamePassword = true;
      } else if (user.password.startsWith('$2a$') || user.password.startsWith('$2b$')) {
        const bcrypt = require('bcryptjs');
        isSamePassword = await bcrypt.compare(cleanPassword, user.password);
      }
    }

    if (isSamePassword) {
      return res.status(400).json({ 
        success: false, 
        error: 'New password must be different from your current password' 
      });
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

const googleAuth = async (req, res) => {
  try {
    const { token, role, isAccessToken } = req.body;
    if (!token) {
      return res.status(400).json({ success: false, error: 'Token is required' });
    }
    if (!role) {
      return res.status(400).json({ success: false, error: 'Role is required' });
    }

    let email, name, picture, googleId;

    if (isAccessToken) {
      const response = await axios.get(`https://www.googleapis.com/oauth2/v3/userinfo`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      email = response.data.email;
      name = response.data.name;
      picture = response.data.picture;
      googleId = response.data.sub;
    } else {
      const response = await axios.get(`https://oauth2.googleapis.com/tokeninfo?id_token=${token}`);
      email = response.data.email;
      name = response.data.name;
      picture = response.data.picture;
      googleId = response.data.sub;
    }

    if (!email) {
      return res.status(400).json({ success: false, error: 'Could not retrieve email from Google' });
    }

    let user = null;
    let Model = null;
    let tokenPrefix = '';

    if (role === 'customer') {
      Model = Customer;
      tokenPrefix = 'cust-token-';
    } else if (role === 'vendor') {
      Model = Vendor;
      tokenPrefix = 'fake-jwt-token-for-';
    } else if (role === 'driver') {
      Model = Driver;
      tokenPrefix = 'driver-token-';
    } else {
      return res.status(400).json({ success: false, error: 'Invalid role' });
    }

    user = await Model.findOne({ email: { $regex: new RegExp(`^${email.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') } });

    if (!user) {
      // Check if this Google email is already registered in another role
      const check = await checkEmailAndPhoneAcrossAllRoles({ email: email.trim() });
      if (check.exists) {
        return res.status(400).json({ success: false, error: check.error });
      }

      const placeholderPhone = `google-${googleId}`;
      const placeholderPassword = Math.random().toString(36).slice(-10);

      const createData = {
        name: name || 'User',
        email: email.trim(),
        phone: placeholderPhone,
        password: placeholderPassword,
        profilePic: picture,
      };

      if (role === 'driver') {
        createData.vehicleType = 'Motorcycle';
        createData.status = 'Pending';
      } else if (role === 'vendor') {
        createData.logoUrl = picture;
        createData.businessName = name || 'Vendor Business';
        createData.status = 'Pending';
      } else if (role === 'customer') {
        const cleanName = (name || 'DENISH').replace(/[^a-zA-Z]/g, '').slice(0, 5).toUpperCase() || 'DENISH';
        createData.referralCode = `${cleanName}${Math.floor(100 + Math.random() * 900)}`;
      }

      user = await Model.create(createData);

      sendWelcomeEmail(email, name).catch(err => console.error('Error sending welcome email:', err));
    }

    res.status(200).json({
      success: true,
      token: tokenPrefix + user._id,
      user
    });

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
  resetPassword,
  googleAuth
};
