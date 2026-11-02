const assert = require('assert');
const mongoose = require('mongoose');
const Order = require('../models/Order');
const Vendor = require('../models/Vendor');
const Driver = require('../models/Driver');
const { submitOrderReview, getOrderReview } = require('../controllers/customerController');

const runReviewTests = async () => {
  console.log('\n=== RUNNING ORDER RATE & REVIEW TEST SUITE ===\n');
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

  const validOrderId = new mongoose.Types.ObjectId().toString();
  const validVendorId = new mongoose.Types.ObjectId().toString();
  const validDriverId = new mongoose.Types.ObjectId().toString();

  // Mock Vendor
  const mockVendorDoc = {
    _id: validVendorId,
    businessName: 'Spicy Delight',
    rating: 4.0,
    ratingsCount: 2,
    reviews: [
      { rating: 4, comment: 'Nice', customerName: 'Alice', createdAt: new Date() }
    ],
    async save() { return this; }
  };

  // Mock Driver
  const mockDriverDoc = {
    _id: validDriverId,
    name: 'Sani Musa',
    rating: 4.5,
    ratingsCount: 2,
    async save() { return this; }
  };

  // Mock Order
  let mockOrderDoc = {
    _id: validOrderId,
    orderId: 'ORD-789',
    vendorId: mockVendorDoc,
    driverId: validDriverId,
    customerName: 'Bello',
    isReviewed: false,
    rating: null,
    review: null,
    driverRating: null,
    driverReview: null,
    async save() { return this; }
  };

  const origOrderFindById = Order.findById;
  const origOrderFindOne = Order.findOne;
  const origVendorFindById = Vendor.findById;
  const origDriverFindById = Driver.findById;

  const makeQuery = (result) => ({
    populate: () => Promise.resolve(result),
    then: (resolve) => resolve(result)
  });

  Order.findById = (id) => makeQuery(id.toString() === validOrderId ? mockOrderDoc : null);
  Order.findOne = (query) => makeQuery(query.orderId === 'ORD-789' ? mockOrderDoc : null);
  Vendor.findById = async (id) => (id.toString() === validVendorId ? mockVendorDoc : null);
  Driver.findById = async (id) => (id.toString() === validDriverId ? mockDriverDoc : null);

  const mockRes = () => {
    const res = {};
    res.statusCode = 200;
    res.status = function(code) {
      res.statusCode = code;
      return res;
    };
    res.json = function(payload) {
      res.data = payload;
      return res;
    };
    return res;
  };

  // Test 1: Reject invalid rating (< 1 or > 5)
  await test('1. Rejects rating below 1 or above 5 with 400', async () => {
    const req = { params: { id: validOrderId }, body: { rating: 6, review: 'Too high' } };
    const res = mockRes();
    await submitOrderReview(req, res);
    assert.strictEqual(res.statusCode, 400);
    assert.strictEqual(res.data.success, false);
  });

  // Test 2: Successfully submit valid review
  await test('2. Submits valid rating & review, updates Order, Vendor and Driver', async () => {
    const req = {
      params: { id: validOrderId },
      body: {
        rating: 5,
        review: 'Delicious jollof rice!',
        driverRating: 5,
        driverReview: 'Fast and courteous driver.'
      }
    };
    const res = mockRes();
    await submitOrderReview(req, res);

    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.data.success, true);
    assert.strictEqual(mockOrderDoc.isReviewed, true);
    assert.strictEqual(mockOrderDoc.rating, 5);
    assert.strictEqual(mockOrderDoc.review, 'Delicious jollof rice!');
    assert.strictEqual(mockOrderDoc.driverRating, 5);
    assert.strictEqual(mockOrderDoc.driverReview, 'Fast and courteous driver.');

    // Vendor average recalculated: (4 + 5) / 2 = 4.5
    assert.strictEqual(mockVendorDoc.ratingsCount, 2);
    assert.strictEqual(mockVendorDoc.rating, 4.5);
    assert.strictEqual(mockVendorDoc.reviews.length, 2);

    // Driver average recalculated: (4.5 * 2 + 5) / 3 = 4.7
    assert.strictEqual(mockDriverDoc.ratingsCount, 3);
    assert.strictEqual(mockDriverDoc.rating, 4.7);
  });

  // Test 3: getOrderReview fetches the review details
  await test('3. getOrderReview retrieves reviewed state and data', async () => {
    const req = { params: { id: validOrderId } };
    const res = mockRes();
    await getOrderReview(req, res);

    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.data.success, true);
    assert.strictEqual(res.data.data.isReviewed, true);
    assert.strictEqual(res.data.data.rating, 5);
    assert.strictEqual(res.data.data.review, 'Delicious jollof rice!');
  });

  // Restore
  Order.findById = origOrderFindById;
  Order.findOne = origOrderFindOne;
  Vendor.findById = origVendorFindById;
  Driver.findById = origDriverFindById;

  console.log(`\n=== REVIEW TEST RESULTS: ${passed} passed, ${failed} failed ===\n`);
  if (failed > 0) process.exit(1);
};

runReviewTests().catch(err => {
  console.error(err);
  process.exit(1);
});
