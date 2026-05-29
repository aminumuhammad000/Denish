const MenuItem = require('../models/MenuItem');
const Vendor = require('../models/Vendor');

const getVendorMenu = async (req, res) => {
  try {
    let vendor = await Vendor.findOne();
    if (!vendor) return res.status(404).json({ success: false, error: 'Vendor not found' });

    let menuItems = await MenuItem.find({ vendorId: vendor._id });

    if (menuItems.length === 0) {
      const demoItems = [
        { vendorId: vendor._id, name: 'Suya Platter', description: 'Spicy grilled beef skewers with onions', price: 3500, stock: 8, available: true, category: 'Grills' },
        { vendorId: vendor._id, name: 'Pepper Soup', description: 'Hot and spicy beef pepper soup', price: 3500, stock: 0, available: false, category: 'Soups' },
        { vendorId: vendor._id, name: 'Jollof Rice', description: 'Classic Nigerian Jollof', price: 4500, stock: 20, available: true, category: 'Rice' },
        { vendorId: vendor._id, name: 'Fried Rice', description: 'Savory fried rice with mixed veggies', price: 4000, stock: 15, available: true, category: 'Rice' },
        { vendorId: vendor._id, name: 'Puff Puff (6pcs)', description: 'Sweet, fluffy fried dough', price: 1000, stock: 3, available: true, category: 'Snacks' },
      ];
      menuItems = await MenuItem.insertMany(demoItems);
    }

    const categories = ['All', 'Rice', 'Soups', 'Grills', 'Drinks', 'Snacks'];

    res.status(200).json({ success: true, data: { items: menuItems, categories } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const toggleMenuItem = async (req, res) => {
  try {
    const item = await MenuItem.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Item not found' });
    
    item.available = !item.available;
    await item.save();

    res.status(200).json({ success: true, data: item });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  getVendorMenu,
  toggleMenuItem
};
