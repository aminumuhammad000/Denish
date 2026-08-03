const Vendor = require('../models/Vendor');
const Driver = require('../models/Driver');
const Customer = require('../models/Customer');
const Order = require('../models/Order');
const Transaction = require('../models/Transaction');
const Dispute = require('../models/Dispute');
const Settings = require('../models/Settings');
const Banner = require('../models/Banner');
const Promotion = require('../models/Promotion');
const Admin = require('../models/Admin');
const Notification = require('../models/Notification');
const SystemContent = require('../models/SystemContent');
const jwt = require('jsonwebtoken');


const adminLogin = async (req, res) => {
  try {
    const { username, password } = req.body;
    const admin = await Admin.findOne({ email: username });
    
    if (!admin) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: admin._id, role: admin.role }, process.env.JWT_SECRET || 'secret', {
      expiresIn: '1d'
    });

    res.status(200).json({ success: true, token, admin: { id: admin._id, name: admin.name, email: admin.email } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};



const getDashboardStats = async (req, res) => {
  try {
    const [
      totalOrders,
      totalVendors,
      totalDrivers,
      totalCustomers,
      deliveredOrders,
      pendingVendors,
      openDisputes,
    ] = await Promise.all([
      Order.countDocuments(),
      Vendor.countDocuments(),
      Driver.countDocuments(),
      Customer.countDocuments(),
      Order.find({ status: 'delivered' }),
      Vendor.countDocuments({ status: 'pending' }),
      Dispute.countDocuments({ status: 'open' }),
    ]);

    const revenue = deliveredOrders.reduce((sum, order) => sum + (order.total || 0), 0);
    const activeOrders = await Order.countDocuments({ 
      status: { $nin: ['delivered', 'cancelled'] } 
    });

    res.status(200).json({
      success: true,
      stats: {
        totalOrders,
        totalVendors,
        totalDrivers,
        totalUsers: totalCustomers,
        revenue,
        activeOrders,
        completionRate: totalOrders > 0 ? (deliveredOrders.length / totalOrders) * 100 : 0,
        pendingApprovals: pendingVendors + openDisputes
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const getAllVendors = async (req, res) => {
  try {
    const vendors = await Vendor.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, vendors });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const getAllDrivers = async (req, res) => {
  try {
    const drivers = await Driver.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, drivers });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const customers = await Customer.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, users: customers });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const getAllTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, transactions });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const getAllDisputes = async (req, res) => {
  try {
    const disputes = await Dispute.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, disputes });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const updateVendorStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const vendor = await Vendor.findByIdAndUpdate(id, { status }, { new: true });
    res.status(200).json({ success: true, vendor });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const updateDriverStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, isWarned, isSuspended } = req.body;
    const updates = {};

    if (typeof status !== 'undefined') {
      updates.status = status === 'Suspended' ? 'Suspended' : (status === 'Pending' ? 'Pending' : 'Active');
    }
    if (typeof isWarned !== 'undefined') updates.isWarned = Boolean(isWarned);
    if (typeof isSuspended !== 'undefined') updates.isSuspended = Boolean(isSuspended);

    const driver = await Driver.findByIdAndUpdate(id, updates, { new: true });
    res.status(200).json({ success: true, driver });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, isWarned } = req.body;
    const updates = {};

    if (typeof status !== 'undefined') updates.status = status;
    if (typeof isWarned !== 'undefined') updates.isWarned = Boolean(isWarned);

    const customer = await Customer.findByIdAndUpdate(id, updates, { new: true });
    res.status(200).json({ success: true, user: customer });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const updateDisputeStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const dispute = await Dispute.findByIdAndUpdate(id, { status }, { new: true });
    res.status(200).json({ success: true, dispute });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const addTransaction = async (req, res) => {
  try {
    const newTransaction = new Transaction(req.body);
    await newTransaction.save();
    res.status(201).json({ success: true, transaction: newTransaction });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const updateOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedOrder = await Order.findByIdAndUpdate(id, req.body, { new: true });
    res.status(200).json({ success: true, order: updatedOrder });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const getSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings();
      await settings.save();
    }
    res.status(200).json({ success: true, settings });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const updateSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings();
    }

    const mergeDeep = (target, source) => {
      const output = { ...(target || {}) };
      Object.entries(source || {}).forEach(([key, value]) => {
        if (value && typeof value === 'object' && !Array.isArray(value) && output[key] && typeof output[key] === 'object' && !Array.isArray(output[key])) {
          output[key] = mergeDeep(output[key], value);
        } else {
          output[key] = value;
        }
      });
      return output;
    };

    const mergedSettings = mergeDeep(settings.toObject(), req.body);
    settings.set(mergedSettings);
    await settings.save();
    res.status(200).json({ success: true, settings });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const getBanners = async (req, res) => {
  try {
    const banners = await Banner.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, banners });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const addBanner = async (req, res) => {
  try {
    const banner = new Banner(req.body);
    await banner.save();
    res.status(201).json({ success: true, banner });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const updateBanner = async (req, res) => {
  try {
    const { id } = req.params;
    const banner = await Banner.findByIdAndUpdate(id, req.body, { new: true });
    res.status(200).json({ success: true, banner });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const deleteBanner = async (req, res) => {
  try {
    const { id } = req.params;
    await Banner.findByIdAndDelete(id);
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const getPromotions = async (req, res) => {
  try {
    const promotions = await Promotion.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, promotions });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const addPromotion = async (req, res) => {
  try {
    const promotion = new Promotion(req.body);
    await promotion.save();
    res.status(201).json({ success: true, promotion });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const updatePromotion = async (req, res) => {
  try {
    const { id } = req.params;
    const promotion = await Promotion.findByIdAndUpdate(id, req.body, { new: true });
    res.status(200).json({ success: true, promotion });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const deletePromotion = async (req, res) => {
  try {
    const { id } = req.params;
    await Promotion.findByIdAndDelete(id);
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const getAllData = async (req, res) => {
  try {
    const [
      orders, vendors, drivers, users, transactions, disputes, settings, banners, promotions
    ] = await Promise.all([
      Order.find().sort({ createdAt: -1 }),
      Vendor.find().sort({ createdAt: -1 }),
      Driver.find().sort({ createdAt: -1 }),
      Customer.find().sort({ createdAt: -1 }),
      Transaction.find().sort({ createdAt: -1 }),
      Dispute.find().sort({ createdAt: -1 }),
      Settings.findOne() || new Settings().save(),
      Banner.find().sort({ createdAt: -1 }),
      Promotion.find().sort({ createdAt: -1 })
    ]);

    res.status(200).json({
      success: true,
      data: {
        orders, vendors, drivers, users, transactions, disputes, settings, banners, promotions
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const getAdminProfile = async (req, res) => {
  try {
    const admin = await Admin.findOne({ email: 'admin@denish.com' }); // Find the main admin
    if (!admin) return res.status(404).json({ success: false, message: 'Admin not found' });
    res.status(200).json({ success: true, admin: { id: admin._id, name: admin.name, email: admin.email, image: admin.image } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const updateAdminProfile = async (req, res) => {
  try {
    const admin = await Admin.findOne({ email: 'admin@denish.com' });
    if (!admin) return res.status(404).json({ success: false, message: 'Admin not found' });

    const { name, email, password, image } = req.body;
    if (name) admin.name = name;
    if (email) admin.email = email;
    if (image) admin.image = image;
    if (password) admin.password = password;

    await admin.save();
    res.status(200).json({ success: true, admin: { id: admin._id, name: admin.name, email: admin.email, image: admin.image } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find().sort({ createdAt: -1 }).limit(20);
    res.status(200).json({ success: true, notifications });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const markNotificationAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    await Notification.findByIdAndUpdate(id, { read: true });
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const markAllNotificationsAsRead = async (req, res) => {
  try {
    await Notification.updateMany({ read: false }, { read: true });
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const getSystemContent = async (req, res) => {
  try {
    const { key } = req.params;
    let content = await SystemContent.findOne({ key });
    if (!content) {
      // Default fallbacks if key not seeded yet
      const defaults = {
        terms_of_service: { key: 'terms_of_service', title: 'Terms of Service', content: 'Welcome to Denish. By using our platform, you agree to comply with and be bound by the following terms of service...' },
        privacy_policy: { key: 'privacy_policy', title: 'Privacy Policy', content: 'Your privacy is important to us. Denish collects minimal data required to fulfill your orders securely...' },
        help_and_support: { key: 'help_and_support', title: 'Help & Support', content: 'Need assistance with an order or account? Our support team is available 24/7.', contactEmail: 'support@denish.com', contactPhone: '+234 800 336 4741' }
      };
      content = defaults[key] || { key, title: 'Information', content: 'Content unavailable.' };
    }
    res.status(200).json({ success: true, data: content });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const updateSystemContent = async (req, res) => {
  try {
    const { key } = req.params;
    const { title, content, contactEmail, contactPhone } = req.body;
    const updated = await SystemContent.findOneAndUpdate(
      { key },
      { key, title, content, contactEmail, contactPhone },
      { upsert: true, new: true }
    );
    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  getDashboardStats,
  getAllOrders,
  getAllVendors,
  getAllDrivers,
  getAllUsers,
  getAllTransactions,
  getAllDisputes,
  updateVendorStatus,
  updateDriverStatus,
  updateUserStatus,
  updateDisputeStatus,
  addTransaction,
  updateOrder,
  getSettings,
  updateSettings,
  getBanners,
  addBanner,
  updateBanner,
  deleteBanner,
  getPromotions,
  addPromotion,
  updatePromotion,
  deletePromotion,
  getAllData,
  adminLogin,
  getAdminProfile,
  updateAdminProfile,
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  getSystemContent,
  updateSystemContent
};


