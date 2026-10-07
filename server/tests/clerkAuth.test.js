const assert = require('assert');
const mongoose = require('mongoose');
const Customer = require('../models/Customer');
const Driver = require('../models/Driver');
const Vendor = require('../models/Vendor');
const Admin = require('../models/Admin');
const { googleAuth } = require('../controllers/authController');

const runClerkAuthTests = async () => {
  console.log('\n=== RUNNING CLERK AUTHENTICATION TEST SUITE ===\n');
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

  // Mock In-Memory DB
  const mockDb = {
    customers: [],
    drivers: [],
    vendors: [],
    admins: []
  };

  const origCustomerFindOne = Customer.findOne;
  const origCustomerCreate = Customer.create;
  const origDriverFindOne = Driver.findOne;
  const origDriverCreate = Driver.create;
  const origVendorFindOne = Vendor.findOne;
  const origVendorCreate = Vendor.create;
  const origAdminFindOne = Admin.findOne;

  const matchEmailOrPhone = (list, q) => {
    if (!q) return null;
    if (q.email) {
      const email = q.email;
      const regex = email?.$regex || (email instanceof RegExp ? email : null);
      if (regex) {
        return list.find(c => regex.test(c.email)) || null;
      }
      if (typeof email === 'string') {
        return list.find(c => c.email.toLowerCase() === email.toLowerCase()) || null;
      }
    }
    if (q.$or) {
      for (const cond of q.$or) {
        if (cond.email) {
          const email = cond.email;
          const regex = email?.$regex || (email instanceof RegExp ? email : null);
          if (regex) {
            const match = list.find(c => regex.test(c.email));
            if (match) return match;
          }
          if (typeof email === 'string') {
            const match = list.find(c => c.email.toLowerCase() === email.toLowerCase());
            if (match) return match;
          }
        }
        if (cond.phone) {
          const phone = cond.phone;
          const match = list.find(c => c.phone === phone);
          if (match) return match;
        }
      }
      return null;
    }
    return null;
  };

  Customer.findOne = async (q) => matchEmailOrPhone(mockDb.customers, q);
  Customer.create = async (doc) => {
    const record = { ...doc, _id: new mongoose.Types.ObjectId() };
    mockDb.customers.push(record);
    return record;
  };

  Driver.findOne = async (q) => matchEmailOrPhone(mockDb.drivers, q);
  Driver.create = async (doc) => {
    const record = { ...doc, _id: new mongoose.Types.ObjectId() };
    mockDb.drivers.push(record);
    return record;
  };

  Vendor.findOne = async (q) => matchEmailOrPhone(mockDb.vendors, q);
  Vendor.create = async (doc) => {
    const record = { ...doc, _id: new mongoose.Types.ObjectId() };
    mockDb.vendors.push(record);
    return record;
  };

  Admin.findOne = async (q) => matchEmailOrPhone(mockDb.admins, q);

  const createMockRes = () => {
    const res = {
      statusCode: 200,
      jsonData: null,
      status: function(code) { this.statusCode = code; return this; },
      json: function(data) { this.jsonData = data; return this; }
    };
    return res;
  };

  try {
    // 1. Missing Token/Email Validation
    await test('1. Rejects request when token and clerkEmail are missing', async () => {
      const req = { body: { role: 'customer' } };
      const res = createMockRes();
      await googleAuth(req, res);
      assert.strictEqual(res.statusCode, 400);
      assert.strictEqual(res.jsonData.success, false);
      assert(res.jsonData.error.includes('Token or user details required'));
    });

    // 2. Missing Role Validation
    await test('2. Rejects request when role is missing', async () => {
      const req = { body: { email: 'user@gmail.com', isClerk: true } };
      const res = createMockRes();
      await googleAuth(req, res);
      assert.strictEqual(res.statusCode, 400);
      assert.strictEqual(res.jsonData.success, false);
      assert(res.jsonData.error.includes('Role is required'));
    });

    // 3. New Customer Sign-Up via Clerk
    let createdCustomerId = null;
    await test('3. New customer sign-up via Clerk auto-creates account with referral code', async () => {
      const req = {
        body: {
          isClerk: true,
          email: 'fatima@gmail.com',
          name: 'Fatima Adamu',
          picture: 'https://img.clerk.com/avatar.jpg',
          clerkId: 'user_clerk_123',
          role: 'customer'
        }
      };
      const res = createMockRes();
      await googleAuth(req, res);
      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.jsonData.success, true);
      assert(res.jsonData.token.startsWith('cust-token-'));
      assert.strictEqual(res.jsonData.user.email, 'fatima@gmail.com');
      assert.strictEqual(res.jsonData.user.name, 'Fatima Adamu');
      assert(res.jsonData.user.referralCode, 'Referral code should be generated');
      createdCustomerId = res.jsonData.user._id.toString();
    });

    // 4. Existing Customer Login via Clerk
    await test('4. Existing customer logging in returns existing profile without duplicate creation', async () => {
      const req = {
        body: {
          isClerk: true,
          email: 'fatima@gmail.com',
          name: 'Fatima Adamu',
          clerkId: 'user_clerk_123',
          role: 'customer'
        }
      };
      const res = createMockRes();
      await googleAuth(req, res);
      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.jsonData.success, true);
      assert.strictEqual(res.jsonData.user._id.toString(), createdCustomerId);
      assert.strictEqual(mockDb.customers.length, 1, 'Should not create duplicate customer record');
    });

    // 5. New Driver Sign-Up via Clerk
    await test('5. New driver sign-up via Clerk creates driver profile with default vehicle', async () => {
      const req = {
        body: {
          isClerk: true,
          email: 'driver.musa@gmail.com',
          name: 'Musa Ibrahim',
          picture: 'https://img.clerk.com/musa.jpg',
          clerkId: 'user_clerk_456',
          role: 'driver'
        }
      };
      const res = createMockRes();
      await googleAuth(req, res);
      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.jsonData.success, true);
      assert(res.jsonData.token.startsWith('driver-token-'));
      assert.strictEqual(res.jsonData.user.email, 'driver.musa@gmail.com');
      assert.strictEqual(res.jsonData.user.vehicleType, 'Motorcycle');
      assert.strictEqual(res.jsonData.user.status, 'Pending');
    });

    // 6. New Vendor Sign-Up via Clerk
    await test('6. New vendor sign-up via Clerk creates vendor profile with Pending status', async () => {
      const req = {
        body: {
          isClerk: true,
          email: 'amala.spot@gmail.com',
          name: 'Amala Spot Kitchen',
          picture: 'https://img.clerk.com/vendor.jpg',
          clerkId: 'user_clerk_789',
          role: 'vendor'
        }
      };
      const res = createMockRes();
      await googleAuth(req, res);
      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.jsonData.success, true);
      assert(res.jsonData.token.startsWith('fake-jwt-token-for-'));
      assert.strictEqual(res.jsonData.user.email, 'amala.spot@gmail.com');
      assert.strictEqual(res.jsonData.user.businessName, 'Amala Spot Kitchen');
      assert.strictEqual(res.jsonData.user.status, 'Pending');
    });

    // 7. Cross-Role Conflict Detection
    await test('7. Prevents user from registering as driver with an email already taken by a customer', async () => {
      const req = {
        body: {
          isClerk: true,
          email: 'fatima@gmail.com', // already registered as customer
          name: 'Fatima Adamu',
          role: 'driver'
        }
      };
      const res = createMockRes();
      await googleAuth(req, res);
      assert.strictEqual(res.statusCode, 400);
      assert.strictEqual(res.jsonData.success, false);
      assert(res.jsonData.error.includes('already registered as a Customer'));
    });

  } finally {
    Customer.findOne = origCustomerFindOne;
    Customer.create = origCustomerCreate;
    Driver.findOne = origDriverFindOne;
    Driver.create = origDriverCreate;
    Vendor.findOne = origVendorFindOne;
    Vendor.create = origVendorCreate;
    Admin.findOne = origAdminFindOne;
  }

  console.log(`\n=== TEST RESULTS: ${passed} passed, ${failed} failed ===\n`);
  if (failed > 0) {
    process.exit(1);
  }
};

runClerkAuthTests().catch((e) => {
  console.error('Fatal Clerk test error:', e);
  process.exit(1);
});
