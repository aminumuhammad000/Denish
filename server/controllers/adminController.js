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
        totalUsers: totalCustomers + totalVendors + totalDrivers,
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

    const tosContent = `TERMS OF SERVICE AND PRIVACY POLICY
Effective Date: August 14, 2026
Company Legal Name: Denish Limited (RC: 9462857)
Registered Address: Plot 3 Block B, ADP Premises Agric GRA, Ilorin,
Kwara State, Nigeria
Brand/App Name: Denish
Website/App URL: https://denishng.com
Support Contact: support@denishng.com / 08036301983
Data Protection Officer (DPO) Email: denishlimited@gmail.com

PART I: TERMS OF SERVICE

1. Introduction & Acceptance of Terms
Welcome to Denish ("we", "us", or "our"). These Terms of Service ("Terms")
govern your access to and use of the Denish mobile application, website
(https://denishng.com), and all related logistics, delivery, and marketplace
services.
By creating an account, accessing, or using the platform as a Buyer, Vendor,
or Rider, you explicitly agree to be bound by these Terms. If you do not
agree with any part of these Terms, you must discontinue use of the platform
immediately.

2. Platform Overview & User Eligibility
. Marketplace Model: Denish operates as an online marketplace
connecting Buyers with independent/partner Vendors (offering Food,
Grocery, Pharmacy, and Retail categories) and Riders to facilitate
local commerce, pickup, and logistics services.
Inventory Disclaimer: We do not own or stock the inventory of
products sold by third-party vendors. Vendors are independently
responsible for the quality, safety, and legality of their goods.
Age Limit & Capacity: Users must meet the legal age requirements
mandated under the laws of the Federal Republic of Nigeria to
register and execute transactions on the platform.

3. Account Registration, Security, & KYC
Account Creation: Users may register using traditional credentials
or via third-party login protocols including Google OAuth and Apple
login.
Mandatory KYC: To ensure platform security and compliance, users
(particularly Vendors and Riders) must complete Know Your
Customer (KYC) verification, which includes submitting a valid ID and
Selfie, Bank Verification Number (BVN), and National Identification
Number (NIN).
Security Responsibility: You are entirely responsible for
maintaining the confidentiality of your account credentials and for all
activities that occur under your account.

4. Financial Terms: Payments, Settlement, & Fees
Accepted Payment Methods: We support multiple payment
channels including Cards, Bank Transfers, Digital Wallets, and Cash
on Delivery (COD).
Payment Collection: Payments are processed securely through
integrated third-party payment gateways.
Settlement Cycle: Payouts to Vendors and Riders are processed
according to the designated settlement cycle (T+X schedule) directly
to their designated bank accounts.
Fees: Delivery fees, service fees, and platform fees are calculated
and displayed to users prior to order confirmation.

5. Orders, Cancellations, & Refunds
. Order Modifications & Cancellations: Cancellation windows are
strictly enforced according to system parameters. Unauthorized
cancellations after order processing has commenced may incur
penalty charges.
. Non-Refundable Items: Due to safety, hygiene, and custom
nature, items classified under Food, Pharmacy, and Custom orders
are strictly non-refundable.
Refund Processing: Approved refunds are credited instantly to the
user's Denish Wallet, whereas card-based refunds are subject to
standard banking processing timelines.

6. Vendor & Rider Rules and SLAS
Vendor Service Level Agreements (SLAs): Vendors are required
to accept orders and complete food preparation or retail packaging
within designated timeframes to maintain active status.
• Rider Guidelines: Riders must utilize approved vehicles
(Bikes/Cars) equipped with valid vehicle insurance and adhere strictly
to traffic and safety regulations.
. Grounds for Deactivation: Any breach of platform safety
guidelines, fraudulent activities, poor delivery ratings, or violation of
KYC rules will result in immediate account deactivation.

PART III: GENERAL PROVISIONS

1. Limitation of Liability & Loss Allocation
Denish Limited acts strictly as an intermediary digital marketplace. We bear
no direct liability for third-party vendor product defects, delayed logistics
caused by unforeseen external factors, or independent rider misconduct
beyond our reasonable operational control. Liability caps per order are
enforced per internal operational guidelines.

2. Governing Law & Dispute Resolution
These Terms and Privacy Policy shall be governed by, and construed in
accordance with, the laws of the Federal Republic of Nigeria. Any
disputes, controversies, or claims arising out of or relating to these terms
shall be settled via binding arbitration in Nigeria.

3. Contact Information
For any questions, complaints, or privacy-related inquiries regarding these
terms or data handling practices, please contact us:
•
Support Email: support@denishng.com
DPO Direct Email: denishlimited@gmail.com
Phone: 08036301983`;

    const privacyContent = `TERMS OF SERVICE AND PRIVACY POLICY
Effective Date: August 14, 2026
Company Legal Name: Denish Limited (RC: 9462857)
Registered Address: Plot 3 Block B, ADP Premises Agric GRA, Ilorin,
Kwara State, Nigeria
Brand/App Name: Denish
Website/App URL: https://denishng.com
Support Contact: support@denishng.com / 08036301983
Data Protection Officer (DPO) Email: denishlimited@gmail.com

PART II: PRIVACY POLICY

1. Information We Collect
To provide a seamless multi-sided marketplace experience, we collect and
process the following categories of personal data:
Identification & Contact Data: Name, Phone number, Email
address, and Physical address.
Location Data: Real-time GPS location data from Buyers, Vendors,
and Riders to optimize route mapping and delivery tracking.
Verification Data: National Identification Number (NIN) and Bank
Verification Number (BVN).
• Payment Data: Transaction history and records (note: sensitive
health prescriptions and raw card details are not directly collected or
stored on our servers).

2. How We Store & Protect Your Data
. Storage Location: Personal data is stored securely on servers
located both within Nigeria and abroad through our hosting provider,
Hostinger.
.
Data Retention Period: We retain user personal data for a period
of 1 year following formal account deletion, after which it is securely
anonymized or permanently deleted, unless retention is required for
legal or regulatory compliance.

3. Disclosure of Information to Third Parties
We share necessary information with trusted third parties strictly to
facilitate operational fulfillment:
•
. Payment Gateways: To process secure financial transactions.
Mapping Services: To enable real-time tracking and location
routing.
Authentication Providers: Google and Apple OAuth for
streamlined login.
Marketplace Participants: Relevant details are shared between
Buyers, Vendors, and Riders solely to complete service fulfillment
(e.g., delivery addresses and contact numbers).

4. Cookies and Tracking Technologies
The platform utilizes essential operational cookies and performance
analytics to monitor app performance and enhance user experience.

PART III: GENERAL PROVISIONS

1. Limitation of Liability & Loss Allocation
Denish Limited acts strictly as an intermediary digital marketplace. We bear
no direct liability for third-party vendor product defects, delayed logistics
caused by unforeseen external factors, or independent rider misconduct
beyond our reasonable operational control. Liability caps per order are
enforced per internal operational guidelines.

2. Governing Law & Dispute Resolution
These Terms and Privacy Policy shall be governed by, and construed in
accordance with, the laws of the Federal Republic of Nigeria. Any
disputes, controversies, or claims arising out of or relating to these terms
shall be settled via binding arbitration in Nigeria.

3. Contact Information
For any questions, complaints, or privacy-related inquiries regarding these
terms or data handling practices, please contact us:
•
Support Email: support@denishng.com
DPO Direct Email: denishlimited@gmail.com
Phone: 08036301983`;

    const supportContent = `TERMS OF SERVICE AND PRIVACY POLICY
Effective Date: August 14, 2026
Company Legal Name: Denish Limited (RC: 9462857)
Registered Address: Plot 3 Block B, ADP Premises Agric GRA, Ilorin,
Kwara State, Nigeria
Brand/App Name: Denish
Website/App URL: https://denishng.com
Support Contact: support@denishng.com / 08036301983
Data Protection Officer (DPO) Email: denishlimited@gmail.com

If you need support, have questions, or require assistance with using the Denish app or your account, please reach out to us using our contact information below.

Support Email: support@denishng.com
DPO Direct Email: denishlimited@gmail.com
Phone: 08036301983`;

    const defaults = {
      terms_of_service: { key: 'terms_of_service', title: 'Terms of Service', content: tosContent },
      privacy_policy: { key: 'privacy_policy', title: 'Privacy Policy', content: privacyContent },
      help_and_support: { key: 'help_and_support', title: 'Help & Support', content: supportContent, contactEmail: 'support@denishng.com', contactPhone: '08036301983' }
    };

    let content = await SystemContent.findOne({ key });
    if (content) {
      // Self-healing database check: if the database has outdated legal contents, overwrite it live
      if (!content.content || !content.content.includes("RC: 9462857")) {
        const matchingDefault = defaults[key];
        if (matchingDefault) {
          content.content = matchingDefault.content;
          content.title = matchingDefault.title;
          content.contactEmail = matchingDefault.contactEmail || 'support@denishng.com';
          content.contactPhone = matchingDefault.contactPhone || '08036301983';
          await content.save();
        }
      }
    } else {
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

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.query;

    if (role === 'Vendor') {
      await Vendor.findByIdAndDelete(id);
    } else if (role === 'Driver') {
      await Driver.findByIdAndDelete(id);
    } else {
      await Customer.findByIdAndDelete(id);
    }

    res.status(200).json({ success: true, message: 'User deleted successfully' });
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
  updateSystemContent,
  deleteUser
};


