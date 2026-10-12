const assert = require('assert');
const mongoose = require('mongoose');
const Customer = require('../models/Customer');
const Vendor = require('../models/Vendor');
const Driver = require('../models/Driver');
const Notification = require('../models/Notification');
const { getCustomerNotifications } = require('../controllers/customerController');
const { getVendorNotifications } = require('../controllers/vendorController');
const { getDriverNotifications } = require('../controllers/driverController');

const runNotificationScopingTests = async () => {
  console.log('\n=== RUNNING NOTIFICATION PRIVACY & SCOPING TEST SUITE ===\n');
  let passed = 0;
  let failed = 0;

  const test = async (name, fn) => {
    try {
      await fn();
      console.log(`✅ PASS: ${name}`);
      passed++;
    } catch (err) {
      console.error(`❌ FAIL: ${name}`);
      console.error(err);
      failed++;
    }
  };

  const customerAId = new mongoose.Types.ObjectId();
  const customerBId = new mongoose.Types.ObjectId();
  const vendorId = new mongoose.Types.ObjectId();
  const driverId = new mongoose.Types.ObjectId();

  const customerA = {
    _id: customerAId,
    name: 'Customer A',
    email: 'customera@test.com',
    phone: '08011111111',
    walletBalance: 5000
  };

  const customerB = {
    _id: customerBId,
    name: 'Customer B',
    email: 'customerb@test.com',
    phone: '08022222222',
    walletBalance: 0
  };

  const vendor = {
    _id: vendorId,
    name: 'Vendor One',
    businessName: 'Super Bites',
    email: 'vendor@test.com'
  };

  const driver = {
    _id: driverId,
    name: 'Driver Bayo',
    email: 'driver@test.com'
  };

  const mockNotifications = [
    {
      _id: new mongoose.Types.ObjectId(),
      title: 'Wallet Funded 💳',
      message: 'Your wallet has been credited with ₦5,000 via Flutterwave. Available balance: ₦5,000.',
      type: 'payment',
      recipient: 'customer',
      userId: customerAId,
      read: false,
      createdAt: new Date()
    },
    {
      _id: new mongoose.Types.ObjectId(),
      title: 'Welcome Promo 🎉',
      message: 'Use code FEAST20 for 20% off your next meal!',
      type: 'promo',
      recipient: 'all',
      userId: null,
      read: false,
      createdAt: new Date()
    },
    {
      _id: new mongoose.Types.ObjectId(),
      title: 'Vendor Payout Initiated ⏳',
      message: 'Payout of ₦50,000 initiated.',
      type: 'payout',
      recipient: 'vendor',
      userId: vendorId,
      read: false,
      createdAt: new Date()
    }
  ];

  // Mock models
  const origCustFindById = Customer.findById;
  const origCustFindOne = Customer.findOne;
  const origVendFindById = Vendor.findById;
  const origVendFindOne = Vendor.findOne;
  const origDriverFindById = Driver.findById;
  const origDriverFindOne = Driver.findOne;
  const origNotifFind = Notification.find;

  Customer.findById = async (id) => {
    if (String(id) === String(customerAId)) return customerA;
    if (String(id) === String(customerBId)) return customerB;
    return null;
  };
  Customer.findOne = async (q) => {
    if (q && q.email) {
      if (typeof q.email === 'string' && q.email.includes('customera')) return customerA;
      if (q.email.$regex && q.email.$regex.test && q.email.$regex.test('customera@test.com')) return customerA;
      if (typeof q.email === 'string' && q.email.includes('customerb')) return customerB;
      if (q.email.$regex && q.email.$regex.test && q.email.$regex.test('customerb@test.com')) return customerB;
    }
    return null;
  };

  Vendor.findById = async (id) => (String(id) === String(vendorId) ? vendor : null);
  Vendor.findOne = async () => vendor;

  Driver.findById = async (id) => (String(id) === String(driverId) ? driver : null);
  Driver.findOne = async () => driver;

  Notification.find = (query) => {
    return {
      sort: () => ({
        limit: () => {
          // In-memory matcher simulating MongoDB $or query
          return mockNotifications.filter(item => {
            if (!query.$or) return true;
            return query.$or.some(clause => {
              // 1. Check recipient
              if (clause.recipient) {
                if (clause.recipient.$in) {
                  if (!clause.recipient.$in.includes(item.recipient)) return false;
                } else if (item.recipient !== clause.recipient) {
                  return false;
                }
              }

              // 2. Check userId
              if (clause.userId !== undefined) {
                if (clause.userId === null) {
                  if (item.userId !== null && item.userId !== undefined) return false;
                } else if (clause.userId.$in) {
                  const itemUserIdStr = String(item.userId);
                  const matched = clause.userId.$in.some(id => String(id) === itemUserIdStr);
                  if (!matched) return false;
                } else if (String(item.userId) !== String(clause.userId)) {
                  return false;
                }
              }

              // 3. Check type
              if (clause.type) {
                if (clause.type.$nin && clause.type.$nin.includes(item.type)) return false;
                if (clause.type.$ne && item.type === clause.type.$ne) return false;
              }

              // 4. Check title
              if (clause.title && clause.title.$not && clause.title.$not.test(item.title)) {
                return false;
              }

              // 5. Check message
              if (clause.message && clause.message.$not && clause.message.$not.test(item.message)) {
                return false;
              }

              return true;
            });
          });
        }
      })
    };
  };

  try {
    await test('Customer A can view their own wallet credit notification', async () => {
      const req = {
        headers: { 'x-user-id': String(customerAId) }
      };
      let resJson = null;
      const res = {
        status: () => ({
          json: (data) => { resJson = data; }
        })
      };
      await getCustomerNotifications(req, res);
      assert(resJson && resJson.success, 'Request should succeed');
      const hasWallet = resJson.data.some(n => n.title.includes('Wallet Funded'));
      assert(hasWallet, 'Customer A must see their own wallet notification');
    });

    await test('Customer B does NOT see Customer A wallet credit notification', async () => {
      const req = {
        headers: { 'x-user-id': String(customerBId) }
      };
      let resJson = null;
      const res = {
        status: () => ({
          json: (data) => { resJson = data; }
        })
      };
      await getCustomerNotifications(req, res);
      assert(resJson && resJson.success, 'Request should succeed');
      const hasWallet = resJson.data.some(n => n.title.includes('Wallet Funded'));
      assert(!hasWallet, 'Customer B must NEVER see Customer A wallet notification');
      const hasPromo = resJson.data.some(n => n.title.includes('Welcome Promo'));
      assert(hasPromo, 'Customer B should still see general broadcast promo');
    });

    await test('Vendor does NOT see Customer A wallet credit notification', async () => {
      const req = {
        headers: { 'x-vendor-id': String(vendorId) }
      };
      let resJson = null;
      const res = {
        status: () => ({
          json: (data) => { resJson = data; }
        })
      };
      await getVendorNotifications(req, res);
      assert(resJson && resJson.success, 'Request should succeed');
      const hasWallet = resJson.data.some(n => /wallet/i.test(n.title));
      assert(!hasWallet, 'Vendor must NEVER see customer wallet credit notification');
    });

    await test('Driver does NOT see Customer A wallet credit notification', async () => {
      const req = {
        headers: { 'x-user-id': String(driverId) }
      };
      let resJson = null;
      const res = {
        status: () => ({
          json: (data) => { resJson = data; }
        })
      };
      await getDriverNotifications(req, res);
      assert(resJson && resJson.success, 'Request should succeed');
      const hasWallet = resJson.data.some(n => /wallet/i.test(n.title));
      assert(!hasWallet, 'Driver must NEVER see customer wallet credit notification');
    });

    await test('Unauthenticated/guest user does NOT see Customer A wallet credit notification', async () => {
      const req = { headers: {} };
      let resJson = null;
      const res = {
        status: () => ({
          json: (data) => { resJson = data; }
        })
      };
      await getCustomerNotifications(req, res);
      assert(resJson && resJson.success, 'Request should succeed');
      const hasWallet = resJson.data.some(n => /wallet/i.test(n.title));
      assert(!hasWallet, 'Unauthenticated user must NEVER see customer wallet credit notification');
      const hasPromo = resJson.data.some(n => n.title.includes('Welcome Promo'));
      assert(hasPromo, 'Unauthenticated user should see general broadcast promo');
    });

  } finally {
    // Restore originals
    Customer.findById = origCustFindById;
    Customer.findOne = origCustFindOne;
    Vendor.findById = origVendFindById;
    Vendor.findOne = origVendFindOne;
    Driver.findById = origDriverFindById;
    Driver.findOne = origDriverFindOne;
    Notification.find = origNotifFind;
  }

  console.log(`\n=== NOTIFICATION TEST RESULTS: ${passed} passed, ${failed} failed ===\n`);
  if (failed > 0) {
    process.exit(1);
  }
};

runNotificationScopingTests().catch(err => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
