require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const Vendor = require('./models/Vendor');
const Driver = require('./models/Driver');
const Customer = require('./models/Customer');
const Order = require('./models/Order');
const Dispute = require('./models/Dispute');
const Transaction = require('./models/Transaction');
const Notification = require('./models/Notification');

const seedDashboard = async () => {
  try {
    await connectDB();

    // Clear existing data
    await Promise.all([
      Vendor.deleteMany({}),
      Driver.deleteMany({}),
      Customer.deleteMany({}),
      Order.deleteMany({}),
      Dispute.deleteMany({}),
      Transaction.deleteMany({}),
      Notification.deleteMany({})
    ]);

    console.log('Cleared existing data.');

    // 1. Seed Vendors
    const vendors = await Vendor.insertMany([
      { name: 'John Doe', businessName: "Mama's Kitchen", email: 'mama@kitchen.com', status: 'Approved', category: 'Local dishes', phone: '08130000001', password: 'password123' },
      { name: 'Jane Smith', businessName: "Burger King", email: 'bk@burger.com', status: 'Approved', category: 'Fast food', phone: '08130000002', password: 'password123' },
      { name: 'Bolu Wat', businessName: "Spicy Chops", email: 'spicy@chops.com', status: 'Pending', category: 'Snacks', phone: '08130000003', password: 'password123' }
    ]);

    // 2. Seed Drivers
    const drivers = await Driver.insertMany([
      { name: 'Aliu Musa', email: 'aliu@driver.com', phone: '08010000001', status: 'Active', vehicleType: 'Motorcycle', password: 'password123' },
      { name: 'Sanni Obi', email: 'sanni@driver.com', phone: '08010000002', status: 'Active', vehicleType: 'Bicycle', password: 'password123' },
      { name: 'Kelechi Azu', email: 'kelechi@driver.com', phone: '08010000003', status: 'Suspended', vehicleType: 'Motorcycle', password: 'password123' }
    ]);

    // 3. Seed Customers
    const customers = await Customer.insertMany([
      { name: 'Aisha Mohammed', email: 'aisha@gmail.com', phone: '07010000001', password: 'password123' },
      { name: 'Chidi Okoro', email: 'chidi@gmail.com', phone: '07010000002', password: 'password123' },
      { name: 'Tunde Bakare', email: 'tunde@gmail.com', phone: '07010000003', password: 'password123' }
    ]);

    // 4. Seed Orders
    const orders = await Order.insertMany([
      { 
        orderId: 'ORD-001', 
        customerName: 'Aisha Mohammed', 
        address: '123 Victoria Island, Lagos', 
        vendorId: vendors[0]._id, 
        vendorName: vendors[0].businessName,
        total: 15500,
        status: 'delivered',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
      },
      { 
        orderId: 'ORD-002', 
        customerName: 'Chidi Okoro', 
        address: '45 Lekki Phase 1, Lagos', 
        vendorId: vendors[1]._id, 
        vendorName: vendors[1].businessName,
        total: 8200,
        status: 'on the way',
        createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000)
      },
      { 
        orderId: 'ORD-003', 
        customerName: 'Aisha Mohammed', 
        address: '123 Victoria Island, Lagos', 
        vendorId: vendors[0]._id, 
        vendorName: vendors[0].businessName,
        total: 4500,
        status: 'preparing',
        createdAt: new Date()
      }
    ]);

    // 5. Seed Disputes
    await Dispute.insertMany([
      { 
        title: 'Delayed Delivery',
        description: 'Customer complained about order being 2 hours late.',
        priority: 'medium',
        status: 'open',
        complaintId: 'DISP-001',
        orderId: 'ORD-001',
        from: 'Aisha Mohammed',
        against: "Mama's Kitchen"
      }
    ]);

    // 6. Seed Transactions
    await Transaction.insertMany([
      { 
        reference: 'TXN-101', 
        type: 'Order Payment', 
        amount: 15500, 
        status: 'Completed', 
        from: 'Aisha Mohammed',
        to: 'Denish Wallet',
        method: 'Card'
      },
      { 
        reference: 'TXN-102', 
        type: 'Vendor Payout', 
        amount: 45000, 
        status: 'Pending', 
        from: 'Denish Wallet',
        to: "Mama's Kitchen",
        method: 'Bank Transfer'
      }
    ]);
    
    // 7. Seed Notifications
    await Notification.insertMany([
      { title: 'New Order Received', message: 'Order #ORD-1002 has been placed by Chidi', read: false },
      { title: 'Vendor Application', message: 'New vendor "Green Grill" is awaiting approval', read: false },
      { title: 'Dispute Filed', message: 'A new dispute has been opened for Order #ORD-001', read: true },
      { title: 'Payment Success', message: 'Payout of ₦45,000 to Mama\'s Kitchen was successful', read: true }
    ]);

    console.log('Successfully seeded all dashboard data.');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding dashboard data:', error);
    process.exit(1);
  }
};

seedDashboard();
