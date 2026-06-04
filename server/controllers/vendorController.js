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

    // Compute bar chart data and daily breakdown by day-of-week
    const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const dayTotals = { Monday: 0, Tuesday: 0, Wednesday: 0, Thursday: 0, Friday: 0, Saturday: 0, Sunday: 0 };
    const dayOrders = { Monday: 0, Tuesday: 0, Wednesday: 0, Thursday: 0, Friday: 0, Saturday: 0, Sunday: 0 };

    allOrders.forEach(order => {
      const dayName = DAYS[new Date(order.createdAt).getDay() === 0 ? 6 : new Date(order.createdAt).getDay() - 1];
      dayTotals[dayName] = (dayTotals[dayName] || 0) + order.amount;
      dayOrders[dayName] = (dayOrders[dayName] || 0) + 1;
    });

    // Use demo values if no real orders yet
    const hasRealData = allOrders.length > 0;
    const demoBarData     = [24000, 30000, 28000, 18000, 35000, 28000, 31000];
    const demoDailyData   = [
      { day: 'Monday', orders: 8, amount: 24000 },
      { day: 'Tuesday', orders: 11, amount: 32000 },
      { day: 'Wednesday', orders: 9, amount: 28000 },
      { day: 'Thursday', orders: 14, amount: 41000 },
      { day: 'Friday', orders: 19, amount: 56000 },
      { day: 'Saturday', orders: 23, amount: 68000 },
      { day: 'Sunday', orders: 13, amount: 38000 },
    ];

    const barData = hasRealData ? DAYS.map(d => dayTotals[d]) : demoBarData;
    const dailyBreakdown = hasRealData
      ? DAYS.map(d => ({ day: d, orders: dayOrders[d], amount: dayTotals[d] }))
      : demoDailyData;

    const customData = {
       ...vendor.toObject(),
       storeOpen: vendor.status === 'Approved',
       earnings: {
         availableBalance: hasRealData ? Math.round(totalRevenue * 0.85) : 248500,
         weeklyRevenue: hasRealData ? totalRevenue : 289000,
         totalOrders: hasRealData ? allOrders.length : 97,
         avgOrders: hasRealData ? Math.round(avgOrderValue) : 2979
       },
       stats,
       todayRevenue: totalRevenue,
       delivered: deliveredCount,
       lowStock: 0,
       barData,
       dailyBreakdown,
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
    
    // Update fields from the demo/currently logged in vendor
    const { 
      businessName, address, phone, category, about,
      openingHours, payoutAccount, deliveryLocations, notifications,
      logoUrl, coverUrl
    } = req.body;
    
    if (businessName) vendor.businessName = businessName;
    if (address) vendor.address = address;
    if (phone) vendor.phone = phone;
    if (category) vendor.category = category;
    if (about) vendor.about = about;
    if (openingHours) vendor.openingHours = openingHours;
    if (payoutAccount) vendor.payoutAccount = payoutAccount;
    if (deliveryLocations) vendor.deliveryLocations = deliveryLocations;
    if (notifications) vendor.notifications = notifications;
    if (logoUrl) vendor.logoUrl = logoUrl;
    if (coverUrl) vendor.coverUrl = coverUrl;

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
