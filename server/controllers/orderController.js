const Order = require('../models/Order');
const Vendor = require('../models/Vendor');

const getVendorOrders = async (req, res) => {
  try {
    let vendor = await Vendor.findOne();
    if (!vendor) {
      return res.status(404).json({ success: false, error: 'Vendor not found' });
    }

    const orders = await Order.find({ vendorId: vendor._id }).sort({ createdAt: -1 });
    
    const formattedOrders = orders.map(o => {
      const itemsList = Array.isArray(o.items) ? o.items : [];
      const itemsCount = itemsList.length;
      const itemsSummary = itemsList.map(i => `${i.quantity || 1}x ${i.name || 'Item'}`).join(', ');

      return {
        _id: o._id,
        id: o.orderId || o._id.toString(),
        orderId: o.orderId || o._id.toString(),
        customerName: o.customerName || 'Customer',
        customerPhone: o.customerPhone || '',
        customerEmail: o.customerEmail || '',
        deliveryAddress: o.deliveryAddress || o.address || 'Standard Delivery',
        amount: o.totalAmount || o.total || 0,
        total: o.totalAmount || o.total || 0,
        status: o.status || 'pending',
        createdAt: o.createdAt,
        updatedAt: o.updatedAt,
        paymentMethod: o.paymentMethod || 'Card',
        itemsCount: itemsCount,
        itemsSummary: itemsSummary || `${itemsCount} items`,
        items: itemsList,
      };
    });

    res.status(200).json({ success: true, count: formattedOrders.length, data: formattedOrders });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  getVendorOrders
};
