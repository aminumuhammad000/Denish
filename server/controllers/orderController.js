const Order = require('../models/Order');
const Vendor = require('../models/Vendor');

const getVendorOrders = async (req, res) => {
  try {
    let vendor = await Vendor.findOne();
    if (!vendor) {
      return res.status(404).json({ success: false, error: 'Vendor not found' });
    }

    let orders = await Order.find({ vendorId: vendor._id }).sort({ createdAt: -1 });

    if (orders.length === 0) {
      // Seed some demo orders for demo purposes if empty
      const demoOrders = [
        { orderId: 'ORD-2451', vendorId: vendor._id, customerName: 'Aisha Mohammed', itemsCount: 2, amount: 10000, status: 'new' },
        { orderId: 'ORD-2452', vendorId: vendor._id, customerName: 'Chidi Okafor', itemsCount: 3, amount: 10000, status: 'new' },
        { orderId: 'ORD-2448', vendorId: vendor._id, customerName: 'Fatima Bello', itemsCount: 2, amount: 10000, status: 'preparing' },
        { orderId: 'ORD-2431', vendorId: vendor._id, customerName: 'Emeka Obi', itemsCount: 1, amount: 5000, status: 'ready' },
        { orderId: 'ORD-2430', vendorId: vendor._id, customerName: 'Ngozi Eze', itemsCount: 4, amount: 14000, status: 'delivered' },
      ];
      orders = await Order.insertMany(demoOrders);
    }

    res.status(200).json({ success: true, count: orders.length, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  getVendorOrders
};
