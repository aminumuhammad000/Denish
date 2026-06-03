const Vendor = require('../models/Vendor');
const Order = require('../models/Order');

// Get vendor dashboard data
const getVendorDashboard = async (req, res) => {
  try {
    let vendor = await Vendor.findOne();
    if (!vendor) {
      // Create default vendor if missing
      vendor = await Vendor.create({
        name: 'Demo Vendor',
        email: 'demo@vendor.com',
        businessName: "Mama's Kitchen",
        status: 'Approved'
      });
    }

    // Fetch real stats from orders
    const allOrders = await Order.find({ vendorId: vendor._id });
    
    const stats = {
      new: allOrders.filter(o => o.status === 'new').length,
      cooking: allOrders.filter(o => o.status === 'preparing').length,
      ready: allOrders.filter(o => o.status === 'ready').length
    };

    const totalRevenue = allOrders.reduce((sum, order) => sum + order.amount, 0);
    const deliveredCount = allOrders.filter(o => o.status === 'delivered').length;
    const avgOrderValue = allOrders.length > 0 ? totalRevenue / allOrders.length : 0;

    const customData = {
       ...vendor.toObject(),
       storeOpen: vendor.status === 'Approved',
       earnings: {
         availableBalance: totalRevenue * 0.85, // 15% commission example
         weeklyRevenue: totalRevenue,
         totalOrders: allOrders.length,
         avgOrders: Math.round(avgOrderValue)
       },
       stats,
       todayRevenue: totalRevenue, // Should be filtered by date in production
       delivered: deliveredCount,
       lowStock: 0,
       liveOrders: allOrders.filter(o => o.status !== 'delivered')
    };

    res.status(200).json({ success: true, data: customData });

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const updateVendorProfile = async (req, res) => {
  try {
    let vendor = await Vendor.findOne();
    if (!vendor) return res.status(404).json({ success: false, error: 'Vendor not found' });
    
    // We are mocking this update to apply onto the demo vendor
    const { businessName, address, phone, openingHours, payoutAccount } = req.body;
    
    if (businessName) vendor.businessName = businessName;
    if (address) vendor.address = address; // Note: Add address etc. to schema if not present
    // You'd typically update fields like phone, hours, and payoutAccount directly on the document here.

    await vendor.save();
    res.status(200).json({ success: true, data: vendor });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  getVendorDashboard,
  updateVendorProfile
};
