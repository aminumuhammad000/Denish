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

    // For demo/development purposes, if the vendor isn't found, we'll create the demo vendor login
    if (!vendor && cleanEmail === 'emeka@mamaskitchen.ng') {
       vendor = await Vendor.create({
          name: 'Emeka',
          email: 'emeka@mamaskitchen.ng',
          password: 'demo',
          businessName: "Mama's Kitchen",
       });
    }

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
    let UserModel;
    
    if (role === 'vendor') UserModel = Vendor;
    else if (role === 'driver') UserModel = Driver;
    else UserModel = Customer;

    const user = await UserModel.findOne({ email });

    if (!user) {
      // For security, don't reveal if user exists, but we'll return error here for simplicity in this demo
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Save this OTP to the database with an expiration (1 hour)
    user.resetPasswordOTP = otp;
    user.resetPasswordExpires = Date.now() + 3600000; 
    await user.save();

    await sendOTPEmail(email, otp);

    res.status(200).json({ success: true, message: 'OTP sent to your email' });
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
  forgotPassword
};
