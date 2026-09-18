const MenuItem = require('../models/MenuItem');
const Vendor = require('../models/Vendor');
const { getCurrentVendor } = require('./vendorController');

const getVendorMenu = async (req, res) => {
  try {
    const vendor = await getCurrentVendor(req);
    if (!vendor) return res.status(404).json({ success: false, error: 'Vendor not found' });

    // Strictly fetch only items belonging to this authenticated vendor
    const menuItems = await MenuItem.find({ vendorId: vendor._id }).sort({ createdAt: -1 });

    const defaultCategories = ['All', 'Rice', 'Soups', 'Grills', 'Drinks', 'Snacks', 'Desserts', 'Sides'];
    const itemCategories = menuItems.map(i => i.category).filter(Boolean);
    const combinedCategories = Array.from(new Set([...defaultCategories, ...itemCategories]));

    res.status(200).json({ 
      success: true, 
      data: { 
        items: menuItems, 
        categories: combinedCategories, 
        status: vendor.status,
        vendorName: vendor.businessName || vendor.name
      } 
    });
  } catch (error) {
    console.error('getVendorMenu error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

const getVendorMenuById = async (req, res) => {
  try {
    const vendorId = req.params.vendorId || req.query.vendorId || req.body?.vendorId;
    if (!vendorId) {
      return res.status(400).json({ success: false, error: 'Vendor id is required' });
    }

    let vendor = await Vendor.findById(vendorId);
    if (!vendor) {
      vendor = await Vendor.findOne({ businessName: vendorId }) || await Vendor.findOne({ name: vendorId });
    }

    if (!vendor) {
      return res.status(200).json({
        success: true,
        data: {
          vendor: { id: vendorId, name: 'Unknown Vendor' },
          items: [],
        },
      });
    }

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
    console.error('getVendorMenuById error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

const toggleMenuItem = async (req, res) => {
  try {
    const vendor = await getCurrentVendor(req);
    const item = await MenuItem.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Item not found' });
    
    // Verify item belongs to this vendor if vendor resolved
    if (vendor && item.vendorId && item.vendorId.toString() !== vendor._id.toString()) {
      return res.status(403).json({ success: false, error: 'Unauthorized to modify this menu item' });
    }

    item.available = !item.available;
    await item.save();

    res.status(200).json({ success: true, data: item });
  } catch (error) {
    console.error('toggleMenuItem error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

const addMenuItem = async (req, res) => {
  try {
    const vendor = await getCurrentVendor(req);
    if (!vendor) return res.status(404).json({ success: false, error: 'Vendor not found' });

    const { name, description, price, stock, category, image, available } = req.body;

    if (!name || name.trim() === '') {
      return res.status(400).json({ success: false, error: 'Item name is required' });
    }

    const parsedPrice = Number(price);
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      return res.status(400).json({ success: false, error: 'Valid price is required' });
    }

    const newItem = await MenuItem.create({
      vendorId: vendor._id,
      name: name.trim(),
      description: description ? description.trim() : '',
      price: parsedPrice,
      stock: stock !== undefined && !isNaN(Number(stock)) ? Number(stock) : 10,
      category: category ? category.trim() : 'Rice',
      image: image || '',
      available: available !== undefined ? Boolean(available) : true
    });

    res.status(201).json({ success: true, data: newItem });
  } catch (error) {
    console.error('addMenuItem error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

const updateMenuItem = async (req, res) => {
  try {
    const { id } = req.params;
    const vendor = await getCurrentVendor(req);
    if (!vendor) return res.status(404).json({ success: false, error: 'Vendor not found' });

    const item = await MenuItem.findById(id);
    if (!item) return res.status(404).json({ success: false, error: 'Item not found' });

    // Verify ownership
    if (item.vendorId && item.vendorId.toString() !== vendor._id.toString()) {
      return res.status(403).json({ success: false, error: 'Unauthorized to update this menu item' });
    }

    const { name, description, price, stock, category, image, available } = req.body;
    const updateData = {};
    if (name !== undefined) updateData.name = name.trim();
    if (description !== undefined) updateData.description = description.trim();
    if (price !== undefined && !isNaN(Number(price))) updateData.price = Number(price);
    if (stock !== undefined && !isNaN(Number(stock))) updateData.stock = Number(stock);
    if (category !== undefined) updateData.category = category.trim();
    if (image !== undefined) updateData.image = image;
    if (available !== undefined) updateData.available = Boolean(available);

    const updatedItem = await MenuItem.findByIdAndUpdate(id, updateData, { new: true });
    res.status(200).json({ success: true, data: updatedItem });
  } catch (error) {
    console.error('updateMenuItem error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

const deleteMenuItem = async (req, res) => {
  try {
    const { id } = req.params;
    const vendor = await getCurrentVendor(req);
    if (!vendor) return res.status(404).json({ success: false, error: 'Vendor not found' });

    const item = await MenuItem.findById(id);
    if (!item) return res.status(404).json({ success: false, error: 'Item not found' });

    // Verify item belongs to this vendor
    if (item.vendorId && item.vendorId.toString() !== vendor._id.toString()) {
      return res.status(403).json({ success: false, error: 'Unauthorized to delete this menu item' });
    }

    await MenuItem.findByIdAndDelete(id);
    res.status(200).json({ success: true, message: 'Menu item deleted successfully', id });
  } catch (error) {
    console.error('deleteMenuItem error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  getVendorMenu,
  getVendorMenuById,
  toggleMenuItem,
  addMenuItem,
  updateMenuItem,
  deleteMenuItem
};
