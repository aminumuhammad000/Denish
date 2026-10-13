const mongoose = require('mongoose');
const CallSession = require('../models/CallSession');
const Customer = require('../models/Customer');
const Driver = require('../models/Driver');
const Vendor = require('../models/Vendor');
const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const { resolveAuthUser, resolveRecipient, findOrCreateConversation } = require('./messagingService');

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

  const callerId = authUser ? authUser.userId : (customCallerId || `guest-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`);
  const callerName = authUser ? authUser.userName : (customCallerName || 'Caller');
  const callerRole = authUser ? authUser.role : 'Customer';
  const callerPhone = (authUser && authUser.user && authUser.user.phone) || customPhone || '';

  // Clean up any existing active calls from this specific caller
  if (callerId && !callerId.startsWith('guest-')) {
    await CallSession.updateMany(
      { callerId, status: { $in: ['ringing', 'accepted'] } },
      { $set: { status: 'ended', endedAt: new Date() } }
    );
  }

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
      await recordCallLogMessage(call);
    }
  }

  return { success: true, status: call.status, call };
};

/**
 * Record a call log entry into chat conversation for both caller and receiver
 */
const recordCallLogMessage = async (call) => {
  try {
    if (!call || !call.callerId || !call.receiverId) return;

    let subText = 'Missed Call';
    if (call.status === 'declined') {
      subText = 'Call Declined';
    } else if (call.status === 'accepted' || call.status === 'ended') {
      if (call.durationSeconds && call.durationSeconds > 0) {
        const mins = Math.floor(call.durationSeconds / 60);
        const secs = call.durationSeconds % 60;
        subText = mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
      } else {
        subText = call.startedAt ? 'Completed' : 'Missed Call';
      }
    }

    const callerObj = {
      userId: String(call.callerId),
      userName: call.callerName || 'Caller',
      userAvatar: '',
      role: call.callerRole || 'Customer'
    };
    const receiverObj = {
      id: String(call.receiverId),
      name: call.receiverName || 'Recipient',
      avatar: '',
      role: call.receiverRole || 'Driver'
    };

    let conv = null;
    try {
      conv = await findOrCreateConversation(callerObj, receiverObj);
    } catch (_) {}

    if (conv) {
      const windowStart = new Date(new Date(call.createdAt).getTime() - 15000);
      const windowEnd = new Date(Date.now() + 15000);

      const existingMsg = await Message.findOne({
        conversationId: conv._id,
        type: 'call',
        createdAt: { $gte: windowStart, $lte: windowEnd }
      });

      if (existingMsg) {
        existingMsg.subText = subText;
        await existingMsg.save();
        conv.lastMessage = {
          text: 'Voice Call',
          type: 'call',
          subText,
          senderId: String(call.callerId),
          senderName: call.callerName || 'Caller',
          createdAt: new Date()
        };
        await conv.save();
        return;
      }

      await Message.create({
        conversationId: conv._id,
        senderId: String(call.callerId),
        senderModel: call.callerRole || 'Customer',
        senderName: call.callerName || 'Caller',
        recipientId: String(call.receiverId),
        recipientModel: call.receiverRole || 'Driver',
        recipientName: call.receiverName || 'Recipient',
        text: 'Voice Call',
        type: 'call',
        subText
      });

      conv.lastMessage = {
        text: 'Voice Call',
        type: 'call',
        subText,
        senderId: String(call.callerId),
        senderName: call.callerName || 'Caller',
        createdAt: new Date()
      };
      await conv.save();
    }
  } catch (err) {
    console.warn('Could not record call log message:', err?.message);
  }
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

  if (action === 'end' || action === 'decline') {
    await recordCallLogMessage(call);
  }

  return { success: true, call };
};

/**
 * Exchange WebRTC signals (offer, answer, ice-candidate)
 */
const sendCallSignalService = async (req) => {
  const { callId, type, signal, senderRole } = req.body;
  if (!callId || !mongoose.Types.ObjectId.isValid(callId)) {
    return { success: false, error: 'Invalid call ID' };
  }

  const call = await CallSession.findById(callId);
  if (!call) {
    return { success: false, error: 'Call not found' };
  }

  if (type === 'offer') {
    call.offer = signal;
  } else if (type === 'answer') {
    call.answer = signal;
  } else if (type === 'ice-candidate') {
    if (senderRole === 'caller') {
      call.callerCandidates = call.callerCandidates || [];
      call.callerCandidates.push(signal);
    } else {
      call.receiverCandidates = call.receiverCandidates || [];
      call.receiverCandidates.push(signal);
    }
  }

  await call.save();
  return { success: true };
};

/**
 * Fetch WebRTC signals for a call session
 */
const getCallSignalsService = async (req) => {
  const { callId } = req.params;
  if (!callId || !mongoose.Types.ObjectId.isValid(callId)) {
    return { success: false, error: 'Invalid call ID' };
  }

  const call = await CallSession.findById(callId);
  if (!call) {
    return { success: false, error: 'Call not found' };
  }

  return {
    success: true,
    offer: call.offer || null,
    answer: call.answer || null,
    callerCandidates: call.callerCandidates || [],
    receiverCandidates: call.receiverCandidates || []
  };
};

/**
 * Fetch call logs for authenticated user (both outgoing and incoming calls)
 */
const getCallLogsService = async (req) => {
  const authUser = await resolveAuthUser(req);
  const { userId: queryUserId, userName: queryUserName } = req.query;

  const targetId = authUser ? authUser.userId : (queryUserId || '');
  const targetName = authUser ? authUser.userName : (queryUserName ? queryUserName.trim() : '');

  if (!targetId && !targetName) {
    return { success: true, logs: [] };
  }

  const conditions = [];
  if (targetId) {
    conditions.push({ callerId: targetId });
    conditions.push({ receiverId: targetId });
  }
  if (targetName) {
    let escaped = targetName.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    escaped = escaped.replace(/[’']/g, "['’]");
    const regex = new RegExp(`^${escaped}$`, 'i');
    conditions.push({ callerName: { $regex: regex } });
    conditions.push({ receiverName: { $regex: regex } });
  }

  const calls = await CallSession.find({ $or: conditions })
    .sort({ createdAt: -1 })
    .limit(100);

  const logs = calls.map(c => {
    const isCaller = (targetId && String(c.callerId) === String(targetId)) ||
      (targetName && c.callerName && c.callerName.toLowerCase() === targetName.toLowerCase());

    let formattedDuration = '';
    if (c.durationSeconds && c.durationSeconds > 0) {
      const mins = Math.floor(c.durationSeconds / 60);
      const secs = c.durationSeconds % 60;
      formattedDuration = mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
    }

    return {
      id: c._id.toString(),
      callId: c._id.toString(),
      isCaller,
      direction: isCaller ? 'outgoing' : 'incoming',
      otherPartyId: isCaller ? c.receiverId : c.callerId,
      otherPartyName: isCaller ? c.receiverName : c.callerName,
      otherPartyRole: isCaller ? c.receiverRole : c.callerRole,
      otherPartyPhone: isCaller ? c.receiverPhone : c.callerPhone,
      status: c.status, // 'accepted', 'ended', 'missed', 'declined', 'ringing'
      durationSeconds: c.durationSeconds || 0,
      durationFormatted: formattedDuration,
      orderId: c.orderId || 'Voice Call',
      subtitle: c.subtitle || '',
      createdAt: c.createdAt,
      startedAt: c.startedAt,
      endedAt: c.endedAt
    };
  });

  return { success: true, logs };
};

module.exports = {
  initiateCallService,
  getIncomingCallService,
  getCallStatusService,
  respondCallService,
  sendCallSignalService,
  getCallSignalsService,
  getCallLogsService
};
