const Driver = require('../models/Driver');

// ─── GET Driver Profile ───────────────────────────────────────────────────────
const getDriverProfile = async (req, res) => {
  try {
    // In production: use req.user._id from JWT middleware.
    // For now, find the first driver that exists (demo mode).
    let driver = await Driver.findOne().select('-password -resetPasswordOTP -resetPasswordExpires');

    if (!driver) {
      // Seed a demo driver so the screen never breaks
      driver = await Driver.create({
        name: 'Bayo Adeyemi',
        email: 'bayo@denish.ng',
        phone: '08012345678',
        password: 'demo',
        vehicleType: 'Motorcycle',
        vehicle: { type: 'Motorcycle', make: 'Honda CB500', plate: 'LAG-234-BA', color: 'Red' },
        bank: { name: 'GTBank', accountName: 'Bayo Adeyemi', accountNumber: '0123456789' },
        status: 'Active',
      });
    }

    res.status(200).json({ success: true, data: driver });
  } catch (error) {
    console.error('getDriverProfile error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ─── UPDATE Driver Profile ────────────────────────────────────────────────────
const updateDriverProfile = async (req, res) => {
  try {
    let driver = await Driver.findOne();
    if (!driver) return res.status(404).json({ success: false, error: 'Driver not found' });

    const { name, email, phone, vehicle, bank } = req.body;

    if (name)   driver.name = name;
    if (email)  driver.email = email;
    if (phone)  driver.phone = phone;

    if (vehicle) {
      driver.vehicle = {
        type:  vehicle.type  || driver.vehicle?.type  || '',
        make:  vehicle.make  || driver.vehicle?.make  || '',
        plate: vehicle.plate || driver.vehicle?.plate || '',
        color: vehicle.color || driver.vehicle?.color || '',
      };
      // Keep top-level vehicleType in sync
      if (vehicle.type) driver.vehicleType = vehicle.type;
    }

    if (bank) {
      driver.bank = {
        name:          bank.name          || driver.bank?.name          || '',
        accountName:   bank.accountName   || driver.bank?.accountName   || '',
        accountNumber: bank.accountNumber || driver.bank?.accountNumber || '',
      };
    }

    await driver.save();
    const updated = driver.toObject();
    delete updated.password;
    res.status(200).json({ success: true, message: 'Profile updated successfully', data: updated });
  } catch (error) {
    console.error('updateDriverProfile error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ─── GET Driver Earnings ──────────────────────────────────────────────────────
const getDriverEarnings = async (req, res) => {
  try {
    const driver = await Driver.findOne();
    if (!driver) return res.status(404).json({ success: false, error: 'Driver not found' });

    // Demo earnings data – in production this would come from a Delivery model
    const earningsData = {
      availableBalance: driver.earnings?.availableBalance || 62500,
      totalEarned:      driver.earnings?.totalEarned      || 248000,
      totalTrips:       driver.earnings?.totalTrips       || 97,
      weeklyData: [
        { day: 'Mon', amount: 8500  },
        { day: 'Tue', amount: 12000 },
        { day: 'Wed', amount: 9800  },
        { day: 'Thu', amount: 15000 },
        { day: 'Fri', amount: 7200  },
        { day: 'Sat', amount: 6500  },
        { day: 'Sun', amount: 3500  },
      ],
      recentTransactions: [
        { id: 'TXN-001', type: 'delivery', amount: 850,  description: 'Delivery – Spice Avenue',  date: 'Today, 2:34 PM',   status: 'completed' },
        { id: 'TXN-002', type: 'delivery', amount: 750,  description: 'Delivery – Mbadiwe Axis',  date: 'Today, 11:15 AM',  status: 'completed' },
        { id: 'TXN-003', type: 'withdrawal', amount: -25000, description: 'Withdrawal – GTBank', date: 'Yesterday',         status: 'completed' },
        { id: 'TXN-004', type: 'delivery', amount: 1250, description: 'Delivery – Ojokwu Ave',    date: 'Jun 3, 4:00 PM',   status: 'completed' },
      ],
    };

    res.status(200).json({ success: true, data: earningsData });
  } catch (error) {
    console.error('getDriverEarnings error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ─── WITHDRAW Earnings ────────────────────────────────────────────────────────
const withdrawEarnings = async (req, res) => {
  try {
    const { amount } = req.body;
    const driver = await Driver.findOne();
    if (!driver) return res.status(404).json({ success: false, error: 'Driver not found' });

    const balance = driver.earnings?.availableBalance || 0;
    if (amount > balance) {
      return res.status(400).json({ success: false, error: 'Insufficient balance' });
    }

    driver.earnings.availableBalance = balance - amount;
    await driver.save();

    res.status(200).json({
      success: true,
      message: `₦${amount.toLocaleString()} withdrawal initiated to ${driver.bank?.name || 'your bank'}.`,
      newBalance: driver.earnings.availableBalance,
    });
  } catch (error) {
    console.error('withdrawEarnings error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ─── GET Driver Deliveries ────────────────────────────────────────────────────
const getDriverDeliveries = async (req, res) => {
  try {
    // Demo data – in production pull from Orders collection where driverId matches
    const deliveries = {
      available: [
        { id: 'ORD-2458', restaurant: 'Spice Avenue', customer: 'Aisha Mohammed', pickupAddress: '9 Street name, Ikoyi', dropoffAddress: '22 Ozumba Mbadiwe, VI', distance: '4.2 km', amount: 850, items: 3 },
        { id: 'ORD-2461', restaurant: 'Mama\'s Kitchen', customer: 'Chidi Okeke', pickupAddress: '5 Marina Road, Lagos Island', dropoffAddress: '12 Akin Adesola, VI', distance: '6.1 km', amount: 1100, items: 2 },
      ],
      active: [
        { id: 'ORD-2451', restaurant: 'Spice Avenue', customer: 'Kola Adeleke', pickupAddress: '9 Street name, Ikoyi', dropoffAddress: '22 Ozumba Mbadiwe, VI', status: 'En route to customer', amount: 750 },
      ],
      completed: [
        { id: 'ORD-2450', restaurant: 'Spice Avenue', customer: 'Bunmi Okafor', amount: 750, date: 'Today, 2:34 PM' },
        { id: 'ORD-2449', restaurant: 'Mbadiwe Axis', customer: 'Tunde Bello', amount: 550, date: 'Today, 11:15 AM' },
        { id: 'ORD-2448', restaurant: 'Ojokwu Avenue', customer: 'Ngozi Eze', amount: 1250, date: 'Yesterday, 4:00 PM' },
      ],
    };
    res.status(200).json({ success: true, data: deliveries });
  } catch (error) {
    console.error('getDriverDeliveries error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  getDriverProfile,
  updateDriverProfile,
  getDriverEarnings,
  withdrawEarnings,
  getDriverDeliveries,
};
