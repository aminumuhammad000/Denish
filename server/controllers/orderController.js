const Order = require('../models/Order');
const Vendor = require('../models/Vendor');

const getVendorOrders = async (req, res) => {
  try {
    let vendor = await Vendor.findOne();
    if (!vendor) {
      return res.status(404).json({ success: false, error: 'Vendor not found' });
    }

    const orders = await Order.find({ vendorId: vendor._id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: orders.length, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  getVendorOrders
};
