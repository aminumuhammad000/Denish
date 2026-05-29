const Vendor = require('../models/Vendor');

// Get vendor dashboard data
const getVendorDashboard = async (req, res) => {
  try {
    // For demo purposes, we fetch the first vendor, or create one if it doesn't exist
    let vendor = await Vendor.findOne();
    
    if (!vendor) {
      vendor = await Vendor.create({
        name: 'Demo Vendor',
        email: 'demo@vendor.com',
        businessName: "Mama's Kitchen",
        earnings: {
          availableBalance: 248500,
          weeklyRevenue: 289000,
          totalOrders: 97,
          avgOrders: 2979
        },
        dailyBreakdown: [
          { day: 'Monday', orders: 8, amount: 24000 },
          { day: 'Tuesday', orders: 11, amount: 32000 },
          { day: 'Wednesday', orders: 9, amount: 28000 },
          { day: 'Thursday', orders: 14, amount: 41000 },
          { day: 'Friday', orders: 19, amount: 56000 },
          { day: 'Saturday', orders: 23, amount: 68000 },
          { day: 'Sunday', orders: 13, amount: 38000 },
        ],
        barData: [18, 24, 28, 14, 20, 22, 17]
      });
    }

    const customData = {
       ...vendor.toObject(),
       storeOpen: true,
       stats: {
           new: 2,
           cooking: 2,
           ready: 1
       },
       todayRevenue: 17000,
       delivered: 2,
       lowStock: 1,
       liveOrders: [
         { id: 'ORD-2451', customer: 'Aisha Mohammed', items: '2 items', amount: '₦10,000', status: 'new' },
         { id: 'ORD-2452', customer: 'Chidi Okafor', items: '3 items', amount: '₦10,000', status: 'new' },
         { id: 'ORD-2448', customer: 'Fatima Bello', items: '2 items', amount: '₦10,000', status: 'preparing' },
         { id: 'ORD-2431', customer: 'Aisha Mohammed', items: '2 items', amount: '₦10,000', status: 'new' },
       ]
    }

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
