const Vendor = require('../models/Vendor');
const MenuItem = require('../models/MenuItem');

const getRestaurantDetails = async (req, res) => {
  try {
    const vendorId = req.params.id;
    
    // In demo, we might just get the first vendor if ID is "demo"
    let vendor;
    if (vendorId === 'demo') {
      vendor = await Vendor.findOne();
    } else {
      vendor = await Vendor.findById(vendorId);
    }
    
    if (!vendor) return res.status(404).json({ success: false, error: 'Restaurant not found' });

    // Fetch the menu items for this vendor
    const items = await MenuItem.find({ vendorId: vendor._id, available: true });

    // Group items by category for the mobile UI
    const menuByCategory = items.reduce((acc, item) => {
      const cat = item.category || 'Other';
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(item);
      return acc;
    }, {});

    const menu = Object.keys(menuByCategory).map(key => ({
      category: key,
      data: menuByCategory[key]
    }));

    res.status(200).json({ 
      success: true, 
      data: {
        vendor,
        menu
      }
    });

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const Order = require('../models/Order');

const placeOrder = async (req, res) => {
  try {
    const { vendorId, items, totalAmount, customerName, customerPhone, deliveryAddress } = req.body;
    
    // In a real app we'd compute the total server-side for security.
    
    const newOrder = await Order.create({
      vendorId: vendorId,
      customerId: "mock-customer-id-123", // Real app uses req.user._id
      customerName: customerName,
      deliveryAddress: deliveryAddress,
      items: items,
      totalAmount: totalAmount,
      status: 'pending'
    });

    res.status(201).json({ success: true, data: newOrder });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  getRestaurantDetails,
  placeOrder
};
