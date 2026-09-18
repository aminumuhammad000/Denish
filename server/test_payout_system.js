const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: '/home/amee/Desktop/Denish/server/.env' });

const Vendor = require('/home/amee/Desktop/Denish/server/models/Vendor');
const Driver = require('/home/amee/Desktop/Denish/server/models/Driver');
const Payout = require('/home/amee/Desktop/Denish/server/models/Payout');
const Transaction = require('/home/amee/Desktop/Denish/server/models/Transaction');
const Settings = require('/home/amee/Desktop/Denish/server/models/Settings');

const {
  resolveBankCode,
  verifyPayoutAccount,
} = require('/home/amee/Desktop/Denish/server/utils/payoutService');

const {
  releaseMaturedDriverEarnings,
  processNightlyVendorPayouts,
  processWeeklyRiderPayouts,
  reconcilePendingPayouts,
  handleFlutterwaveTransferWebhook,
  getPayoutScheduleStatus,
} = require('/home/amee/Desktop/Denish/server/utils/payoutScheduler');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/denish';

async function runTests() {
  console.log('Connecting to MongoDB at:', MONGO_URI);
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB.\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✓ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ✗ FAIL: ${message}`);
      failed++;
    }
  }

  try {
    // ----------------------------------------------------
    // TEST 1: Bank Code Resolution
    // ----------------------------------------------------
    console.log('--- TEST 1: Nigerian Bank Code Resolution ---');
    assert(resolveBankCode('GTBank') === '058', 'GTBank resolves to 058');
    assert(resolveBankCode('Access Bank') === '044', 'Access Bank resolves to 044');
    assert(resolveBankCode('Kuda Bank') === '50211', 'Kuda Bank resolves to 50211');
    assert(resolveBankCode('OPay') === '999992', 'OPay resolves to 999992');
    assert(resolveBankCode('PalmPay') === '999991', 'PalmPay resolves to 999991');
    assert(resolveBankCode('Moniepoint') === '50515', 'Moniepoint resolves to 50515');

    // ----------------------------------------------------
    // TEST 2: Bank Account Verification (Validation logic)
    // ----------------------------------------------------
    console.log('\n--- TEST 2: Bank Account Verification ---');
    const invalidRes = await verifyPayoutAccount({ accountNumber: '123', bankCode: '058' });
    assert(!invalidRes.valid, 'Rejects short/invalid account number (< 10 digits)');

    const validFormatRes = await verifyPayoutAccount({ accountNumber: '0123456789', bankCode: '058' });
    assert(validFormatRes.valid, 'Valid 10-digit account returns valid');

    // ----------------------------------------------------
    // TEST 3: Driver 7-Day Maturity Earnings Rule
    // ----------------------------------------------------
    console.log('\n--- TEST 3: Driver 7-Day Maturity Earnings Holding Rule ---');
    // Create test driver
    const testDriver = await Driver.create({
      name: 'Test Rider Payout',
      email: `test_rider_${Date.now()}@denish.ng`,
      phone: '08099887766',
      password: 'demo',
      bank: { name: 'GTBank', accountNumber: '0123456789', accountName: 'Test Rider Payout' },
      status: 'Active',
      earnings: {
        availableBalance: 0,
        pendingBalance: 3000,
        unpaidEarnings: [
          {
            orderId: new mongoose.Types.ObjectId(),
            amount: 2000,
            earnedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000), // 8 days ago
            eligibleAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago (MATURED)
            status: 'pending',
          },
          {
            orderId: new mongoose.Types.ObjectId(),
            amount: 1000,
            earnedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
            eligibleAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // in 5 days (HELD)
            status: 'pending',
          },
        ],
      },
    });

    // Run maturity release
    await releaseMaturedDriverEarnings();

    const refreshedDriver = await Driver.findById(testDriver._id);
    assert(refreshedDriver.earnings.availableBalance === 2000, 'Matured ₦2,000 released into availableBalance');
    assert(refreshedDriver.earnings.pendingBalance === 1000, 'Unmatured ₦1,000 kept in pendingBalance');
    const maturedEntry = refreshedDriver.earnings.unpaidEarnings.find(e => e.amount === 2000);
    const heldEntry = refreshedDriver.earnings.unpaidEarnings.find(e => e.amount === 1000);
    assert(maturedEntry.status === 'eligible', 'Matured entry marked as eligible');
    assert(heldEntry.status === 'pending', 'Immature entry still pending');

    // ----------------------------------------------------
    // TEST 4: Payout Record Model & Idempotency
    // ----------------------------------------------------
    console.log('\n--- TEST 4: Payout Model & Idempotency Constraints ---');
    const testRef = `TEST_PAYOUT_${Date.now()}`;
    const p1 = await Payout.create({
      providerType: 'Driver',
      providerId: testDriver._id,
      providerName: testDriver.name,
      amount: 2000,
      bank: { name: 'GTBank', code: '058', accountNumber: '0123456789' },
      reference: testRef,
      status: 'PROCESSING',
      cycle: 'weekly_driver',
    });
    assert(p1.reference === testRef, 'Payout record created in PROCESSING state');

    let duplicateThrew = false;
    try {
      await Payout.create({
        providerType: 'Driver',
        providerId: testDriver._id,
        providerName: testDriver.name,
        amount: 2000,
        bank: { name: 'GTBank', code: '058', accountNumber: '0123456789' },
        reference: testRef, // duplicate reference
        status: 'PENDING',
        cycle: 'weekly_driver',
      });
    } catch (e) {
      duplicateThrew = true;
    }
    assert(duplicateThrew, 'Duplicate payout reference throws MongoDB unique constraint violation');

    // ----------------------------------------------------
    // TEST 5: Webhook Processing for Success & Failure/Reversal
    // ----------------------------------------------------
    console.log('\n--- TEST 5: Flutterwave Webhook Processing (transfer.completed) ---');
    
    // Test Webhook SUCCESSFUL
    const successWebhookRes = await handleFlutterwaveTransferWebhook({
      event: 'transfer.completed',
      data: {
        id: 998877,
        reference: testRef,
        status: 'SUCCESSFUL',
        complete_message: 'Transfer completed successfully',
      },
    });
    assert(successWebhookRes.success && successWebhookRes.status === 'SUCCESSFUL', 'Webhook marked payout as SUCCESSFUL');
    const updatedP1 = await Payout.findOne({ reference: testRef });
    assert(updatedP1.status === 'SUCCESSFUL' && updatedP1.completedAt != null, 'Payout DB record updated to SUCCESSFUL with completedAt');

    // Test Webhook FAILED with automatic balance refund
    const refundTestRef = `TEST_REFUND_${Date.now()}`;
    // Deduct 2000 from driver balance first
    await Driver.findByIdAndUpdate(testDriver._id, { $inc: { 'earnings.availableBalance': -2000 } });
    const p2 = await Payout.create({
      providerType: 'Driver',
      providerId: testDriver._id,
      providerName: testDriver.name,
      amount: 2000,
      bank: { name: 'GTBank', code: '058', accountNumber: '0123456789' },
      reference: refundTestRef,
      status: 'PROCESSING',
      cycle: 'weekly_driver',
    });

    const failWebhookRes = await handleFlutterwaveTransferWebhook({
      event: 'transfer.completed',
      data: {
        id: 998878,
        reference: refundTestRef,
        status: 'FAILED',
        complete_message: 'Beneficiary account blocked',
      },
    });
    assert(failWebhookRes.success && failWebhookRes.status === 'FAILED', 'Webhook marked payout as FAILED');
    const refundedDriver = await Driver.findById(testDriver._id);
    assert(refundedDriver.earnings.availableBalance === 2000, 'Provider availableBalance was automatically refunded after FAILED webhook');

    // Clean up test records
    await Payout.deleteMany({ reference: { $in: [testRef, refundTestRef] } });
    await Driver.findByIdAndDelete(testDriver._id);

    // ----------------------------------------------------
    // TEST 6: Telemetry & Admin Status
    // ----------------------------------------------------
    console.log('\n--- TEST 6: Telemetry & Status API ---');
    const scheduleStatus = await getPayoutScheduleStatus();
    assert(scheduleStatus.timezone === 'Africa/Lagos', 'Timezone is configured to Africa/Lagos');
    assert(scheduleStatus.vendorPayout.cycle === '24_hours', 'Vendor payout configured as 24_hours (18:00 / 6:00 PM WAT)');
    assert(scheduleStatus.riderPayout.cycle === 'weekly', 'Rider payout configured as weekly (Sunday 23:59 WAT)');
    assert(typeof scheduleStatus.vendorPayout.eligibleCount === 'number', 'Vendor eligible count calculated');
    assert(typeof scheduleStatus.riderPayout.eligibleCount === 'number', 'Rider eligible count calculated');

  } catch (err) {
    console.error('Test error:', err);
    failed++;
  } finally {
    await mongoose.disconnect();
    console.log(`\n========================================`);
    console.log(`TEST SUMMARY: ${passed} passed, ${failed} failed`);
    console.log(`========================================`);
    process.exit(failed > 0 ? 1 : 0);
  }
}

runTests();
