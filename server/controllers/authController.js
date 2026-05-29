const Vendor = require('../models/Vendor');

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
  res.status(200).json({ success: true, token: 'cust-token', user: { name: 'Customer' } });
};

const driverLogin = async (req, res) => {
  res.status(200).json({ success: true, token: 'driver-token', user: { name: 'Driver' } });
};

module.exports = {
  vendorLogin,
  vendorSignup,
  customerLogin,
  driverLogin
};
