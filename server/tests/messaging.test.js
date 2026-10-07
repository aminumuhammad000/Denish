const assert = require('assert');
const mongoose = require('mongoose');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const Customer = require('../models/Customer');
const Driver = require('../models/Driver');
const Vendor = require('../models/Vendor');
const Notification = require('../models/Notification');
const {
  resolveAuthUser,
  resolveRecipient,
  findOrCreateConversation,
  getThreadsForUser,
  getMessagesForUser,
  sendMessageForUser
} = require('../services/messagingService');

const runMessagingTests = async () => {
  console.log('\n=== RUNNING ASASU IN-APP MESSAGING TEST SUITE ===\n');
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

  // Mock Database Store for Unit / Offline Integration Test
  const mockDb = {
    customers: [],
    drivers: [],
    vendors: [],
    conversations: [],
    messages: [],
    notifications: []
  };

  // Backup original model methods
  const origCustomerFindById = Customer.findById;
  const origCustomerFindOne = Customer.findOne;
  const origDriverFindById = Driver.findById;
  const origDriverFindOne = Driver.findOne;
  const origVendorFindById = Vendor.findById;
  const origVendorFindOne = Vendor.findOne;
  const origConvFind = Conversation.find;
  const origConvFindOne = Conversation.findOne;
  const origConvCreate = Conversation.create;
  const origMsgFind = Message.find;
  const origMsgCreate = Message.create;
  const origMsgUpdateMany = Message.updateMany;
  const origNotifCreate = Notification.create;
  const origNotifFindOne = Notification.findOne;

  // Setup Mock In-Memory Mongoose Adapters
  Customer.findById = async (id) => mockDb.customers.find(c => c._id.toString() === id.toString()) || null;
  Customer.findOne = async (q) => {
    if (q?.email) {
      return mockDb.customers.find(c => (q.email.test ? q.email.test(c.email) : c.email === q.email)) || null;
    }
    if (q?.name) {
      return mockDb.customers.find(c => (q.name.test ? q.name.test(c.name) : c.name === q.name)) || null;
    }
    return mockDb.customers[0] || null;
  };

  Driver.findById = async (id) => mockDb.drivers.find(d => d._id.toString() === id.toString()) || null;
  Driver.findOne = async (q) => {
    if (q?.email) {
      return mockDb.drivers.find(d => (q.email.test ? q.email.test(d.email) : d.email === q.email)) || null;
    }
    if (q?.name) {
      return mockDb.drivers.find(d => (q.name.test ? q.name.test(d.name) : d.name === q.name)) || null;
    }
    return mockDb.drivers[0] || null;
  };

  Vendor.findById = async (id) => mockDb.vendors.find(v => v._id.toString() === id.toString()) || null;
  Vendor.findOne = async (q) => {
    if (q?.email) {
      return mockDb.vendors.find(v => (q.email.test ? q.email.test(v.email) : v.email === q.email)) || null;
    }
    if (q?.name || q?.$or) {
      return mockDb.vendors.find(v => {
        if (q.name && (q.name.test ? q.name.test(v.name) : v.name === q.name)) return true;
        if (q.$or) {
          return q.$or.some(cond => {
            if (cond.businessName && (cond.businessName.test ? cond.businessName.test(v.businessName) : v.businessName === cond.businessName)) return true;
            if (cond.name && (cond.name.test ? cond.name.test(v.name) : v.name === cond.name)) return true;
            return false;
          });
        }
        return false;
      }) || null;
    }
    return mockDb.vendors[0] || null;
  };

  Conversation.create = async (doc) => {
    const record = {
      ...doc,
      _id: new mongoose.Types.ObjectId(),
      createdAt: new Date(),
      updatedAt: new Date(),
      save: async function() { this.updatedAt = new Date(); return this; }
    };
    mockDb.conversations.push(record);
    return record;
  };

  Conversation.findOne = async (q) => {
    if (q?.participantIds?.$all) {
      const ids = q.participantIds.$all;
      return mockDb.conversations.find(c => ids.every(id => c.participantIds.includes(id))) || null;
    }
    if (q?._id) {
      return mockDb.conversations.find(c => c._id.toString() === q._id.toString()) || null;
    }
    return mockDb.conversations[0] || null;
  };

  Conversation.findById = async (id) => {
    return mockDb.conversations.find(c => c._id.toString() === id.toString()) || null;
  };

  Conversation.find = (q) => ({
    sort: (s) => {
      let results = [...mockDb.conversations];
      if (q?.$or) {
        results = results.filter(c => {
          return q.$or.some(cond => {
            if (cond.participantIds && c.participantIds.includes(cond.participantIds)) return true;
            if (cond['participants.userId'] && c.participants.some(p => p.userId === cond['participants.userId'])) return true;
            if (cond['participants.name'] && c.participants.some(p => p.name === cond['participants.name'])) return true;
            return false;
          });
        });
      }
      return results;
    }
  });

  Message.create = async (doc) => {
    const record = {
      ...doc,
      _id: new mongoose.Types.ObjectId(),
      createdAt: new Date(),
      updatedAt: new Date(),
      save: async function() { return this; }
    };
    mockDb.messages.push(record);
    return record;
  };

  Message.find = (q) => ({
    sort: (s) => {
      let results = [...mockDb.messages];
      if (q?.conversationId) {
        results = results.filter(m => m.conversationId?.toString() === q.conversationId.toString());
      } else if (q?.$or) {
        results = results.filter(m => {
          return q.$or.some(cond => {
            if (cond.senderId && cond.recipientId) {
              return m.senderId === cond.senderId && m.recipientId === cond.recipientId;
            }
            if (cond.senderName && cond.recipientName) {
              return m.senderName === cond.senderName && m.recipientName === cond.recipientName;
            }
            if (cond.senderId && m.senderId === cond.senderId) return true;
            if (cond.recipientId && m.recipientId === cond.recipientId) return true;
            if (cond.senderName && m.senderName === cond.senderName) return true;
            if (cond.recipientName && m.recipientName === cond.recipientName) return true;
            return false;
          });
        });
      }
      return results;
    }
  });

  Message.updateMany = async (filter, update) => {
    let count = 0;
    if (filter?._id?.$in) {
      const ids = filter._id.$in.map(i => i.toString());
      mockDb.messages.forEach(m => {
        if (ids.includes(m._id.toString())) {
          if (update.$set?.read !== undefined) m.read = update.$set.read;
          if (update.$set?.readAt !== undefined) m.readAt = update.$set.readAt;
          count++;
        }
      });
    }
    return { modifiedCount: count };
  };

  Notification.create = async (doc) => {
    const record = { ...doc, _id: new mongoose.Types.ObjectId(), createdAt: new Date() };
    mockDb.notifications.push(record);
    return record;
  };

  Notification.findOne = async (q) => {
    return mockDb.notifications.find(n => {
      if (q.userId && n.userId !== q.userId) return false;
      if (q.type && n.type !== q.type) return false;
      return true;
    }) || null;
  };

  // Seed Mock Users
  const testCustomer = {
    _id: new mongoose.Types.ObjectId(),
    name: 'Amina Bello',
    email: 'amina@denish.ng',
    phone: '08011223344',
    profilePic: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'
  };
  mockDb.customers.push(testCustomer);

  const testDriver = {
    _id: new mongoose.Types.ObjectId(),
    name: 'Bayo Adeyemi',
    email: 'bayo@denish.ng',
    phone: '08099887766',
    vehicleType: 'Motorcycle',
    profilePic: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100'
  };
  mockDb.drivers.push(testDriver);

  const testVendor = {
    _id: new mongoose.Types.ObjectId(),
    name: 'Mama Aisha',
    businessName: "Mama's Kitchen",
    email: 'vendor@denish.ng',
    phone: '08055443322',
    logoUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=100'
  };
  mockDb.vendors.push(testVendor);

  const attacker = {
    _id: new mongoose.Types.ObjectId(),
    name: 'Attacker Bob',
    email: 'attacker@evil.com',
    phone: '08000000000'
  };
  mockDb.customers.push(attacker);

  try {
    // 1. Authentication Tests
    await test('1. Rejects unauthenticated request without headers', async () => {
      const res = await resolveAuthUser({ headers: {} });
      assert.strictEqual(res, null, 'Should return null when no token or headers provided');
    });

    await test('2. Authenticates customer via cust-token header', async () => {
      const res = await resolveAuthUser({ headers: { authorization: `Bearer cust-token-${testCustomer._id}` } });
      assert(res, 'Should resolve customer');
      assert.strictEqual(res.userId, testCustomer._id.toString());
      assert.strictEqual(res.userName, 'Amina Bello');
      assert.strictEqual(res.role, 'Customer');
    });

    await test('3. Authenticates driver via driver-token header', async () => {
      const res = await resolveAuthUser({ headers: { authorization: `Bearer driver-token-${testDriver._id}` } });
      assert(res, 'Should resolve driver');
      assert.strictEqual(res.userId, testDriver._id.toString());
      assert.strictEqual(res.userName, 'Bayo Adeyemi');
      assert.strictEqual(res.role, 'Driver');
    });

    await test('4. Authenticates vendor via fake-jwt-token-for header', async () => {
      const res = await resolveAuthUser({ headers: { authorization: `Bearer fake-jwt-token-for-${testVendor._id}` } });
      assert(res, 'Should resolve vendor');
      assert.strictEqual(res.userId, testVendor._id.toString());
      assert.strictEqual(res.userName, "Mama's Kitchen");
      assert.strictEqual(res.role, 'Vendor');
    });

    // 2. Input Validation Tests
    const authCust = { userId: testCustomer._id.toString(), userName: testCustomer.name, role: 'Customer', userAvatar: testCustomer.profilePic };

    await test('5. Rejects empty message text', async () => {
      const res = await sendMessageForUser(authCust, {
        recipientId: testDriver._id.toString(),
        text: '',
        type: 'text'
      });
      assert(res.error, 'Empty text should be rejected');
      assert.strictEqual(res.status, 400);
      assert.strictEqual(res.error, 'Message content cannot be empty');
    });

    await test('6. Rejects whitespace-only message text', async () => {
      const res = await sendMessageForUser(authCust, {
        recipientId: testDriver._id.toString(),
        text: '     \n  \t   ',
        type: 'text'
      });
      assert(res.error, 'Whitespace-only message should be rejected');
      assert.strictEqual(res.status, 400);
    });

    await test('7. Rejects oversized message (>2000 chars)', async () => {
      const res = await sendMessageForUser(authCust, {
        recipientId: testDriver._id.toString(),
        text: 'M'.repeat(2005),
        type: 'text'
      });
      assert(res.error, 'Overlength message should be rejected');
      assert.strictEqual(res.status, 400);
      assert(res.error.includes('2000 characters'));
    });

    // 3. Message Sending & Unicode / Multilingual Tests
    let conversationId = null;
    await test('8. Successfully sends Unicode / Hausa / Arabic / Emoji message', async () => {
      const text = 'Sannu Driver! مرحباً بك 🚚 Please deliver quickly! ₦3,500 <alert>';
      const res = await sendMessageForUser(authCust, {
        recipientId: testDriver._id.toString(),
        text,
        type: 'text'
      });
      assert.strictEqual(res.success, true);
      assert.strictEqual(res.data.text, text);
      assert.strictEqual(res.data.sender, 'me');
      assert.strictEqual(res.data.senderName, 'Amina Bello');
      assert(res.data.conversationId, 'Must link to a conversation');
      conversationId = res.data.conversationId;
    });

    await test('9. Successfully sends photo message', async () => {
      const imageUrl = 'https://res.cloudinary.com/denish/image/upload/sample.jpg';
      const res = await sendMessageForUser(authCust, {
        conversationId,
        imageUrl,
        type: 'image'
      });
      assert.strictEqual(res.success, true);
      assert.strictEqual(res.data.image, imageUrl);
      assert.strictEqual(res.data.type, 'image');
    });

    // 4. Thread Listing & Unread Counters
    const authDrv = { userId: testDriver._id.toString(), userName: testDriver.name, role: 'Driver', userAvatar: testDriver.profilePic };

    await test('10. Recipient sees thread with accurate unread count (unread = 2)', async () => {
      const threads = await getThreadsForUser(authDrv);
      assert(threads.length >= 1, 'Should find threads for driver');
      const thread = threads.find(t => t.conversationId === conversationId);
      assert(thread, 'Driver should find conversation with customer');
      assert.strictEqual(thread.name, 'Amina Bello');
      assert.strictEqual(thread.unread, 2, 'Unread count should reflect both incoming messages');
      assert.strictEqual(thread.lastMsg, '📷 Image');
    });

    // 5. Reading Messages & Auto Mark-as-Read
    await test('11. Fetching conversation marks messages as read and clears unread counter', async () => {
      const msgRes = await getMessagesForUser(authDrv, { conversationId });
      assert.strictEqual(msgRes.success, true);
      assert.strictEqual(msgRes.messages.length, 2);
      assert.strictEqual(msgRes.messages[0].sender, 'them');

      // Verify unread count is reset in thread list
      const threads = await getThreadsForUser(authDrv);
      const thread = threads.find(t => t.conversationId === conversationId);
      assert.strictEqual(thread.unread, 0, 'Unread count should be 0 after reading');
    });

    // 6. Security & Isolation Check
    const authAttacker = { userId: attacker._id.toString(), userName: attacker.name, role: 'Customer', userAvatar: '' };

    await test('12. Unauthorized 3rd-party user cannot view other users conversation (403 Forbidden)', async () => {
      const res = await getMessagesForUser(authAttacker, { conversationId });
      assert(res.error, 'Should be rejected');
      assert.strictEqual(res.status, 403);
      assert(res.error.includes('not authorized'));
    });

    // 7. Notification Dispatch Check
    await test('13. In-app notification dispatched to recipient on new message', async () => {
      const notif = mockDb.notifications.find(n => n.userId === testDriver._id.toString());
      assert(notif, 'Notification should be created for driver');
      assert(notif.title.includes('Amina Bello'));
      assert.strictEqual(notif.recipient, 'driver');
    });

  } finally {
    // Restore original Mongoose methods
    Customer.findById = origCustomerFindById;
    Customer.findOne = origCustomerFindOne;
    Driver.findById = origDriverFindById;
    Driver.findOne = origDriverFindOne;
    Vendor.findById = origVendorFindById;
    Vendor.findOne = origVendorFindOne;
    Conversation.find = origConvFind;
    Conversation.findOne = origConvFindOne;
    Conversation.create = origConvCreate;
    Message.find = origMsgFind;
    Message.create = origMsgCreate;
    Message.updateMany = origMsgUpdateMany;
    Notification.create = origNotifCreate;
    Notification.findOne = origNotifFindOne;
  }

  console.log(`\n=== TEST RESULTS: ${passed} passed, ${failed} failed ===\n`);
  if (failed > 0) {
    process.exit(1);
  }
};

runMessagingTests().catch((e) => {
  console.error('Fatal messaging test failure:', e);
  process.exit(1);
});
