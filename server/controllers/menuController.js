const MenuItem = require('../models/MenuItem');
const Vendor = require('../models/Vendor');

const getVendorMenu = async (req, res) => {
  try {
    let vendor = await Vendor.findOne();
    if (!vendor) return res.status(404).json({ success: false, error: 'Vendor not found' });

    let menuItems = await MenuItem.find({ vendorId: vendor._id });

    if (menuItems.length === 0) {
      const demoItems = [
        { vendorId: vendor._id, name: 'Suya Platter', description: 'Spicy grilled beef skewers with onions', price: 3500, stock: 8, available: true, category: 'Grills', image: 'https://res.cloudinary.com/dq4mxuz72/image/upload/v1717410000/suya.jpg' },
        { vendorId: vendor._id, name: 'Pepper Soup', description: 'Hot and spicy beef pepper soup', price: 3500, stock: 0, available: false, category: 'Soups', image: 'https://res.cloudinary.com/dq4mxuz72/image/upload/v1717410000/soup.jpg' },
        { vendorId: vendor._id, name: 'Jollof Rice', description: 'Classic Nigerian Jollof', price: 4500, stock: 20, available: true, category: 'Rice', image: 'https://res.cloudinary.com/dq4mxuz72/image/upload/v1717410000/jollof.jpg' },
        { vendorId: vendor._id, name: 'Fried Rice', description: 'Savory fried rice with mixed veggies', price: 4000, stock: 15, available: true, category: 'Rice', image: 'https://res.cloudinary.com/dq4mxuz72/image/upload/v1717410000/fried_rice.jpg' },
        { vendorId: vendor._id, name: 'Puff Puff (6pcs)', description: 'Sweet, fluffy fried dough', price: 1000, stock: 3, available: true, category: 'Snacks', image: 'https://res.cloudinary.com/dq4mxuz72/image/upload/v1717410000/puff_puff.jpg' },
      ];
      menuItems = await MenuItem.insertMany(demoItems);
    }


    const categories = ['All', 'Rice', 'Soups', 'Grills', 'Drinks', 'Snacks'];

    res.status(200).json({ success: true, data: { items: menuItems, categories, status: vendor.status } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const getVendorMenuById = async (req, res) => {
  try {
    const { vendorId } = req.params;
    const vendor = await Vendor.findById(vendorId);
    if (!vendor) return res.status(404).json({ success: false, error: 'Vendor not found' });

    const menuItems = await MenuItem.find({ vendorId: vendor._id }).sort({ category: 1, name: 1 });
    res.status(200).json({
      success: true,
      data: {
        vendor: {
          id: vendor._id,
          name: vendor.businessName || vendor.name,
        },
        items: menuItems,
      },
    });
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

const addMenuItem = async (req, res) => {
  try {
    const vendor = await Vendor.findOne(); // In real app, get from auth token
    const { name, description, price, stock, category, image, available } = req.body;

    const newItem = await MenuItem.create({
      vendorId: vendor._id,
      name,
      description,
      price,
      stock,
      category,
      image,
      available
    });

    res.status(201).json({ success: true, data: newItem });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const updateMenuItem = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedItem = await MenuItem.findByIdAndUpdate(id, req.body, { new: true });
    
    if (!updatedItem) return res.status(404).json({ success: false, error: 'Item not found' });

    res.status(200).json({ success: true, data: updatedItem });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  getVendorMenu,
  getVendorMenuById,
  toggleMenuItem,
  addMenuItem,
  updateMenuItem
};

