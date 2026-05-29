const Vendor = require('../models/Vendor');
const Customer = require('../models/Customer');
const Driver = require('../models/Driver');

const vendorLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    let vendor = await Vendor.findOne({ email });

    // For demo/development purposes, if the vendor isn't found, we'll create the demo vendor login
    if (!vendor && email === 'emeka@mamaskitchen.ng') {
       vendor = await Vendor.create({
          name: 'Emeka',
          email: 'emeka@mamaskitchen.ng',
          password: 'demo', // Mocking unhashed password
          businessName: "Mama's Kitchen",
       });
    }

    if (!vendor) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    // In a real app we would check hashed password. 
    // We are mocking a successful response here.
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
    res.status(201).json({ success: true, token: 'fake-jwt-token-for-' + vendor._id, vendor });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const customerLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const customer = await Customer.findOne({ email });

    if (!customer || customer.password !== password) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
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
    res.status(201).json({ success: true, token: 'cust-token-' + customer._id, user: customer });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const driverLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const driver = await Driver.findOne({ email });

    if (!driver || driver.password !== password) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
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
    res.status(201).json({ success: true, token: 'driver-token-' + driver._id, user: driver });
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
  driverSignup
};
