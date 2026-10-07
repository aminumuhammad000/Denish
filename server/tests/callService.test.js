const assert = require('assert');
const mongoose = require('mongoose');
const CallSession = require('../models/CallSession');
const Customer = require('../models/Customer');
const Driver = require('../models/Driver');
const Vendor = require('../models/Vendor');
const {
  initiateCallService,
  getIncomingCallService,
  getCallStatusService,
  respondCallService
} = require('../services/callService');

const runCallTests = async () => {
  console.log('\n=== RUNNING ASASU IN-APP CALLING SYSTEM TEST SUITE ===\n');
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

  // Mock Database Store
  const mockDb = {
    customers: [],
    drivers: [],
    vendors: [],
    callSessions: []
  };

  // Mock Adapters
  Customer.findById = async (id) => mockDb.customers.find(c => c._id.toString() === id.toString()) || null;
  Customer.findOne = async (q) => mockDb.customers[0] || null;
  Driver.findById = async (id) => mockDb.drivers.find(d => d._id.toString() === id.toString()) || null;
  Driver.findOne = async (q) => mockDb.drivers[0] || null;
  Vendor.findById = async (id) => mockDb.vendors.find(v => v._id.toString() === id.toString()) || null;
  Vendor.findOne = async (q) => mockDb.vendors[0] || null;

  CallSession.create = async (doc) => {
    const record = {
      ...doc,
      _id: new mongoose.Types.ObjectId(),
      createdAt: new Date(),
      updatedAt: new Date(),
      save: async function() { this.updatedAt = new Date(); return this; }
    };
    mockDb.callSessions.push(record);
    return record;
  };

  CallSession.findById = async (id) => {
    return mockDb.callSessions.find(c => c._id.toString() === id.toString()) || null;
  };

  CallSession.findOne = (q) => ({
    sort: (s) => {
      let results = [...mockDb.callSessions];
      if (q?.status) results = results.filter(c => c.status === q.status);
      if (q?.createdAt?.$gte) results = results.filter(c => new Date(c.createdAt) >= q.createdAt.$gte);
      if (q?.callerId?.$ne) results = results.filter(c => c.callerId !== q.callerId.$ne);
      if (q?.$or) {
        results = results.filter(c => {
          return q.$or.some(cond => {
            if (cond.receiverId && c.receiverId === cond.receiverId) return true;
            if (cond.receiverName && (cond.receiverName.test ? cond.receiverName.test(c.receiverName) : c.receiverName === cond.receiverName)) return true;
            return false;
          });
        });
      }
      return results[results.length - 1] || null;
    }
  });

  CallSession.updateMany = async (filter, update) => {
    let count = 0;
    mockDb.callSessions.forEach(c => {
      let match = true;
      if (filter.callerId && c.callerId !== filter.callerId) match = false;
      if (filter.status) {
        if (filter.status.$in && !filter.status.$in.includes(c.status)) match = false;
        else if (typeof filter.status === 'string' && c.status !== filter.status) match = false;
      }
      if (filter.createdAt?.$lt && new Date(c.createdAt) >= filter.createdAt.$lt) match = false;

      if (match) {
        if (update.$set?.status) c.status = update.$set.status;
        if (update.$set?.endedAt) c.endedAt = update.$set.endedAt;
        count++;
      }
    });
    return { modifiedCount: count };
  };

  // Seed Mock Users
  const caller = {
    _id: new mongoose.Types.ObjectId(),
    name: 'Usman Customer',
    email: 'usman@denish.ng',
    phone: '08011112222'
  };
  mockDb.customers.push(caller);

  const receiver = {
    _id: new mongoose.Types.ObjectId(),
    name: 'Bayo Driver',
    email: 'bayo@denish.ng',
    phone: '08033334444'
  };
  mockDb.drivers.push(receiver);

  let activeCallId = null;

  try {
    // 1. Initiate Call
    await test('1. Caller initiates voice call session successfully', async () => {
      const mockReq = {
        headers: { authorization: `Bearer cust-token-${caller._id}` },
        body: {
          receiverId: receiver._id.toString(),
          receiverName: receiver.name,
          orderId: 'Order #ORD-109',
          subtitle: '3.2 km | ₦1,200'
        }
      };

      const res = await initiateCallService(mockReq);
      assert(res.success, 'Call initiation should succeed');
      assert(res.call, 'Should return call session document');
      assert.strictEqual(res.call.status, 'ringing');
      assert.strictEqual(res.call.callerId, caller._id.toString());
      assert.strictEqual(res.call.callerName, 'Usman Customer');
      assert.strictEqual(res.call.receiverName, 'Bayo Driver');
      activeCallId = res.call._id.toString();
    });

    // 2. Incoming Call Retrieval
    await test('2. Receiver detects active ringing call', async () => {
      const mockReq = {
        headers: { authorization: `Bearer driver-token-${receiver._id}` },
        query: { receiverName: 'Bayo Driver' }
      };

      const res = await getIncomingCallService(mockReq);
      assert(res.success);
      assert(res.call, 'Receiver should receive active ringing call');
      assert.strictEqual(res.call._id.toString(), activeCallId);
      assert.strictEqual(res.call.callerName, 'Usman Customer');
    });

    // 3. Caller Cannot Receive Their Own Call
    await test('3. Caller does not receive their own outgoing call as incoming', async () => {
      const mockReq = {
        headers: { authorization: `Bearer cust-token-${caller._id}` },
        query: { receiverName: 'Usman Customer' }
      };

      const res = await getIncomingCallService(mockReq);
      assert(res.success);
      assert.strictEqual(res.call, null, 'Self-initiated call should not be returned');
    });

    // 4. Ghost Call Elimination (Stale Calls Timeout)
    await test('4. Stale/Abandoned calls (>45 seconds old) automatically expire and do not ring', async () => {
      // Create a stale abandoned call from 5 minutes ago
      const staleCall = {
        _id: new mongoose.Types.ObjectId(),
        callerId: 'old-caller-1',
        callerName: 'Old Caller',
        receiverId: receiver._id.toString(),
        receiverName: receiver.name,
        status: 'ringing',
        createdAt: new Date(Date.now() - 300000), // 5 minutes ago
        updatedAt: new Date(Date.now() - 300000),
        save: async function() { return this; }
      };
      mockDb.callSessions.push(staleCall);

      // Now query incoming calls for driver
      const mockReq = {
        headers: { authorization: `Bearer driver-token-${receiver._id}` },
        query: { receiverName: 'Bayo Driver' }
      };

      await getIncomingCallService(mockReq);
      assert.strictEqual(staleCall.status, 'missed', 'Stale ringing call should be marked missed');
    });

    // 5. Accepting Call
    await test('5. Receiver accepts call session -> status transitions to accepted', async () => {
      const mockReq = {
        body: {
          callId: activeCallId,
          action: 'accept'
        }
      };

      const res = await respondCallService(mockReq);
      assert(res.success);
      assert.strictEqual(res.call.status, 'accepted');
      assert(res.call.startedAt, 'startedAt timestamp should be populated');
    });

    // 6. Polling Call Status
    await test('6. Caller status polling detects call accepted', async () => {
      const mockReq = { params: { callId: activeCallId } };
      const res = await getCallStatusService(mockReq);
      assert(res.success);
      assert.strictEqual(res.status, 'accepted');
    });

    // 7. Ending / Hanging Up Call
    await test('7. Caller or receiver ends call -> status transitions to ended with duration', async () => {
      const mockReq = {
        body: {
          callId: activeCallId,
          action: 'end'
        }
      };

      const res = await respondCallService(mockReq);
      assert(res.success);
      assert.strictEqual(res.call.status, 'ended');
      assert(res.call.endedAt, 'endedAt timestamp should be populated');
    });

    // 8. Verified Call Is No Longer Ringing On App Refresh
    await test('8. Ended call is no longer returned when user goes online or checks incoming calls', async () => {
      const mockReq = {
        headers: { authorization: `Bearer driver-token-${receiver._id}` },
        query: { receiverName: 'Bayo Driver' }
      };

      const res = await getIncomingCallService(mockReq);
      assert(res.success);
      assert.strictEqual(res.call, null, 'No phantom/ghost call should be returned');
    });

  } finally {
    // Teardown
  }

  console.log(`\n=== TEST RESULTS: ${passed} passed, ${failed} failed ===\n`);
  if (failed > 0) {
    process.exit(1);
  }
};

runCallTests().catch((e) => {
  console.error('Fatal call test error:', e);
  process.exit(1);
});
