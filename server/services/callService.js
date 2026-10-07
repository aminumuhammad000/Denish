const mongoose = require('mongoose');
const CallSession = require('../models/CallSession');
const Customer = require('../models/Customer');
const Driver = require('../models/Driver');
const Vendor = require('../models/Vendor');
const { resolveAuthUser, resolveRecipient } = require('./messagingService');

const CALL_RING_TIMEOUT_MS = 45000; // 45 seconds max ringing time

/**
 * Initiate a call session
 */
const initiateCallService = async (req) => {
  const authUser = await resolveAuthUser(req);
  const { 
    receiverName, 
    receiverId, 
    orderId, 
    subtitle, 
    callerName: customCallerName, 
    callerId: customCallerId,
    phone: customPhone
  } = req.body;

  const callerId = authUser ? authUser.userId : (customCallerId || 'guest-caller');
  const callerName = authUser ? authUser.userName : (customCallerName || 'Caller');
  const callerRole = authUser ? authUser.role : 'Customer';
  const callerPhone = (authUser && authUser.user && authUser.user.phone) || customPhone || '';

  // Clean up any existing active calls from this caller
  await CallSession.updateMany(
    { callerId, status: { $in: ['ringing', 'accepted'] } },
    { $set: { status: 'ended', endedAt: new Date() } }
  );

  // Resolve Recipient
  let targetRecipient = null;
  if (receiverId || receiverName) {
    targetRecipient = await resolveRecipient({ recipientId: receiverId, recipientName: receiverName });
  }

  const resolvedReceiverId = targetRecipient ? targetRecipient.id : (receiverId || 'receiver-1');
  const resolvedReceiverName = targetRecipient ? targetRecipient.name : (receiverName || 'Recipient');
  const resolvedReceiverRole = targetRecipient ? targetRecipient.role : 'Driver';

  // Lookup receiver phone if available
  let receiverPhone = customPhone || '';
  if (!receiverPhone && targetRecipient && mongoose.Types.ObjectId.isValid(targetRecipient.id)) {
    const [vnd, drv, cust] = await Promise.all([
      Vendor.findById(targetRecipient.id),
      Driver.findById(targetRecipient.id),
      Customer.findById(targetRecipient.id)
    ]);
    const found = vnd || drv || cust;
    if (found && found.phone) receiverPhone = found.phone;
  }

  const session = await CallSession.create({
    callerId,
    callerName,
    callerRole,
    callerPhone,
    receiverId: resolvedReceiverId,
    receiverName: resolvedReceiverName,
    receiverRole: resolvedReceiverRole,
    receiverPhone,
    status: 'ringing',
    orderId: orderId || 'Voice Call',
    subtitle: subtitle || ''
  });

  return { success: true, call: session };
};

/**
 * Get active incoming call for recipient
 */
const getIncomingCallService = async (req) => {
  const authUser = await resolveAuthUser(req);
  const { receiverName, receiverId } = req.query;

  const targetId = authUser ? authUser.userId : receiverId;
  const targetName = authUser ? authUser.userName : (receiverName ? receiverName.trim() : '');

  const now = Date.now();
  const cutoffTime = new Date(now - CALL_RING_TIMEOUT_MS);

  // Auto-expire stale ringing calls
  await CallSession.updateMany(
    { status: 'ringing', createdAt: { $lt: cutoffTime } },
    { $set: { status: 'missed', endedAt: new Date() } }
  );

  if (!targetId && !targetName) {
    return { success: true, call: null };
  }

  const conditions = [];

  if (targetId) {
    conditions.push({ receiverId: targetId });
  }

  if (targetName) {
    let escaped = targetName.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    escaped = escaped.replace(/[’']/g, "['’]");
    conditions.push({ receiverName: { $regex: new RegExp(`^${escaped}$`, 'i') } });
  }

  const query = {
    status: 'ringing',
    createdAt: { $gte: cutoffTime },
    $or: conditions
  };

  // Ensure caller is not self
  if (targetId) {
    query.callerId = { $ne: targetId };
  }

  const call = await CallSession.findOne(query).sort({ createdAt: -1 });
  return { success: true, call: call || null };
};

/**
 * Get real-time status of a call
 */
const getCallStatusService = async (req) => {
  const { callId } = req.params;
  if (!callId || !mongoose.Types.ObjectId.isValid(callId)) {
    return { success: false, status: 'ended', message: 'Invalid call ID' };
  }

  const call = await CallSession.findById(callId);
  if (!call) {
    return { success: false, status: 'ended', message: 'Call not found' };
  }

  // Check for auto-timeout if still ringing
  if (call.status === 'ringing') {
    const ageMs = Date.now() - new Date(call.createdAt).getTime();
    if (ageMs > CALL_RING_TIMEOUT_MS) {
      call.status = 'missed';
      call.endedAt = new Date();
      await call.save();
    }
  }

  return { success: true, status: call.status, call };
};

/**
 * Respond to call (accept, decline, end)
 */
const respondCallService = async (req) => {
  const { callId, action } = req.body; // 'accept' | 'decline' | 'end'
  if (!callId || !mongoose.Types.ObjectId.isValid(callId)) {
    return { success: false, error: 'Invalid call ID' };
  }

  const call = await CallSession.findById(callId);
  if (!call) {
    return { success: false, error: 'Call not found' };
  }

  const now = new Date();

  if (action === 'accept') {
    call.status = 'accepted';
    call.startedAt = now;
  } else if (action === 'decline') {
    call.status = 'declined';
    call.endedAt = now;
  } else {
    // end
    call.status = 'ended';
    call.endedAt = now;
    if (call.startedAt) {
      call.durationSeconds = Math.round((now.getTime() - new Date(call.startedAt).getTime()) / 1000);
    }
  }

  await call.save();
  return { success: true, call };
};

module.exports = {
  initiateCallService,
  getIncomingCallService,
  getCallStatusService,
  respondCallService
};
