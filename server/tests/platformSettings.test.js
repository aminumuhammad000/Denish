const assert = require('assert');
const Settings = require('../models/Settings');
const { getPlatformSettings, placeOrder } = require('../controllers/customerController');
const { updateSettings } = require('../controllers/adminController');
const Vendor = require('../models/Vendor');
const Customer = require('../models/Customer');
const Order = require('../models/Order');

const runPlatformSettingsTests = async () => {
  console.log('\n=== RUNNING PLATFORM SETTINGS & FEE DYNAMICS TEST SUITE ===\n');
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

  let mockSettingsDoc = {
    platform: {
      platformName: "Denish Test",
      currency: "NGN",
      deliveryModel: "flat",
      baseFee: "150",
      serviceFee: "350",
      commission: "12",
      deliveryFeeCommission: "4"
    },
    toObject() {
      return { ...this };
    },
    set(newObj) {
      Object.assign(this, newObj);
    },
    async save() {
      return this;
    }
  };

  const origSettingsFindOne = Settings.findOne;
  Settings.findOne = async () => mockSettingsDoc;

  // Test 1: getPlatformSettings fetches real platform settings
  await test('1. getPlatformSettings returns real configured platform settings', async () => {
    let responseData = null;
    let statusCode = null;
    const req = {};
    const res = {
      status(code) {
        statusCode = code;
        return this;
      },
      json(data) {
        responseData = data;
        return this;
      }
    };

    await getPlatformSettings(req, res);
    assert.strictEqual(statusCode, 200);
    assert.strictEqual(responseData.success, true);
    assert.strictEqual(responseData.settings.serviceFee, 350);
    assert.strictEqual(responseData.settings.baseDeliveryFee, 150);
    assert.strictEqual(responseData.settings.commission, 12);
    assert.strictEqual(responseData.settings.currency, 'NGN');
  });

  // Test 2: serviceFee and baseDeliveryFee equal to 0 do NOT fall back to 200 or 500
  await test('2. Zero fees (₦0) are preserved accurately without falling back to demo 200/500', async () => {
    mockSettingsDoc.platform.serviceFee = "0";
    mockSettingsDoc.platform.baseFee = 0;

    let responseData = null;
    const req = {};
    const res = {
      status() { return this; },
      json(data) { responseData = data; return this; }
    };

    await getPlatformSettings(req, res);
    assert.strictEqual(responseData.settings.serviceFee, 0);
    assert.strictEqual(responseData.settings.baseDeliveryFee, 0);
  });

  // Test 3: updateSettings updates the platform configuration
  await test('3. updateSettings updates platform serviceFee and persists changes', async () => {
    const req = {
      body: {
        platform: {
          serviceFee: "450",
          baseFee: "700"
        }
      }
    };
    let responseData = null;
    const res = {
      status() { return this; },
      json(data) { responseData = data; return this; }
    };

    await updateSettings(req, res);
    assert.strictEqual(responseData.success, true);
    assert.strictEqual(mockSettingsDoc.platform.serviceFee, "450");
    assert.strictEqual(mockSettingsDoc.platform.baseFee, "700");

    // Re-verify getPlatformSettings sees updated fee
    let getResponse = null;
    await getPlatformSettings({}, {
      status() { return this; },
      json(data) { getResponse = data; return this; }
    });
    assert.strictEqual(getResponse.settings.serviceFee, 450);
    assert.strictEqual(getResponse.settings.baseDeliveryFee, 700);
  });

  // Test 4: placeOrder calculation applies real resolved fees
  await test('4. placeOrder uses configured platform service fee when calculating total', async () => {
    const origVendorFindById = Vendor.findById;
    const origVendorFindOne = Vendor.findOne;
    const origOrderCreate = Order.create;

    Vendor.findById = async () => ({
      _id: '507f1f77bcf86cd799439011',
      businessName: 'Mama Kitchen',
      deliveryFee: 600
    });
    Vendor.findOne = async () => ({
      _id: '507f1f77bcf86cd799439011',
      businessName: 'Mama Kitchen'
    });

    let createdOrder = null;
    Order.create = async (orderPayload) => {
      createdOrder = orderPayload;
      return orderPayload;
    };

    const req = {
      headers: {},
      body: {
        vendorId: '507f1f77bcf86cd799439011',
        items: [{ name: 'Rice', price: 2000, quantity: 2 }],
        subtotal: 4000,
        deliveryFee: 600,
        serviceFee: 450,
        total: 5050
      }
    };
    let responseData = null;
    const res = {
      status() { return this; },
      json(data) { responseData = data; return this; }
    };

    await placeOrder(req, res);
    assert.strictEqual(responseData.success, true);
    assert.strictEqual(createdOrder.serviceFee, 450);
    assert.strictEqual(createdOrder.deliveryFee, 600);
    assert.strictEqual(createdOrder.total, 5050);

    Vendor.findById = origVendorFindById;
    Vendor.findOne = origVendorFindOne;
    Order.create = origOrderCreate;
  });

  // Restore
  Settings.findOne = origSettingsFindOne;

  console.log(`\n=== PLATFORM SETTINGS TEST RESULTS: ${passed} passed, ${failed} failed ===\n`);
  if (failed > 0) {
    process.exit(1);
  }
};

runPlatformSettingsTests().catch(err => {
  console.error('Fatal platform settings test error:', err);
  process.exit(1);
});
