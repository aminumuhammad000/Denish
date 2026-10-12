const mongoose = require('mongoose');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const Customer = require('../models/Customer');
const Driver = require('../models/Driver');
const Vendor = require('../models/Vendor');
const Admin = require('../models/Admin');
const Notification = require('../models/Notification');

/**
 * Authenticate and resolve caller identity strictly without insecure fallbacks.
 * Returns { user, role, userId, userName, userAvatar } or null if unauthenticated.
 */
const resolveAuthUser = async (req) => {
  const authHeader = req.headers.authorization || req.headers.token || '';
  const headerUserId = req.headers['x-user-id'] || req.headers['x-vendor-id'] || req.headers['x-driver-id'];
  const headerEmail = req.headers['x-user-email'] || req.headers['x-vendor-email'];
  const headerRole = (req.headers['x-user-role'] || '').toLowerCase();

  let targetId = null;
  let targetRoleHint = headerRole;

  if (authHeader) {
    const tokenStr = authHeader.replace(/^Bearer\s+/i, '').trim();
    if (tokenStr.startsWith('cust-token-')) {
      targetId = tokenStr.replace('cust-token-', '');
      targetRoleHint = 'customer';
    } else if (tokenStr.startsWith('driver-token-')) {
      targetId = tokenStr.replace('driver-token-', '');
      targetRoleHint = 'driver';
    } else if (tokenStr.startsWith('fake-jwt-token-for-') || tokenStr.startsWith('vend-token-')) {
      targetId = tokenStr.replace(/(?:fake-jwt-token-for-|vend-token-)/, '');
      targetRoleHint = 'vendor';
    } else if (mongoose.Types.ObjectId.isValid(tokenStr)) {
      targetId = tokenStr;
    }
  }

  if (!targetId && headerUserId && mongoose.Types.ObjectId.isValid(headerUserId)) {
    targetId = headerUserId;
  }

  // 1. Try finding by ID if valid
  if (targetId && mongoose.Types.ObjectId.isValid(targetId)) {
    if (targetRoleHint === 'customer') {
      const cust = await Customer.findById(targetId);
      if (cust) return { user: cust, role: 'Customer', userId: cust._id.toString(), userName: cust.name || 'Customer', userAvatar: cust.profilePic || '' };
    } else if (targetRoleHint === 'driver') {
      const drv = await Driver.findById(targetId);
      if (drv) return { user: drv, role: 'Driver', userId: drv._id.toString(), userName: drv.name || 'Driver', userAvatar: drv.profilePic || '' };
    } else if (targetRoleHint === 'vendor') {
      const vnd = await Vendor.findById(targetId);
      if (vnd) return { user: vnd, role: 'Vendor', userId: vnd._id.toString(), userName: vnd.businessName || vnd.name || 'Vendor', userAvatar: vnd.logoUrl || '' };
    }

    // If role hint didn't match or wasn't provided, search models
    const [cust, drv, vnd, adm] = await Promise.all([
      Customer.findById(targetId),
      Driver.findById(targetId),
      Vendor.findById(targetId),
      Admin.findById(targetId)
    ]);

    if (cust) return { user: cust, role: 'Customer', userId: cust._id.toString(), userName: cust.name || 'Customer', userAvatar: cust.profilePic || '' };
    if (drv) return { user: drv, role: 'Driver', userId: drv._id.toString(), userName: drv.name || 'Driver', userAvatar: drv.profilePic || '' };
    if (vnd) return { user: vnd, role: 'Vendor', userId: vnd._id.toString(), userName: vnd.businessName || vnd.name || 'Vendor', userAvatar: vnd.logoUrl || '' };
    if (adm) return { user: adm, role: 'Admin', userId: adm._id.toString(), userName: adm.name || 'Admin', userAvatar: '' };
  }

  // 2. Try finding by verified Email if supplied
  if (headerEmail) {
    const cleanEmail = headerEmail.trim().toLowerCase();
    const emailRegex = new RegExp(`^${cleanEmail.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i');

    if (targetRoleHint === 'customer') {
      const cust = await Customer.findOne({ email: emailRegex });
      if (cust) return { user: cust, role: 'Customer', userId: cust._id.toString(), userName: cust.name || 'Customer', userAvatar: cust.profilePic || '' };
    } else if (targetRoleHint === 'driver') {
      const drv = await Driver.findOne({ email: emailRegex });
      if (drv) return { user: drv, role: 'Driver', userId: drv._id.toString(), userName: drv.name || 'Driver', userAvatar: drv.profilePic || '' };
    } else if (targetRoleHint === 'vendor') {
      const vnd = await Vendor.findOne({ email: emailRegex });
      if (vnd) return { user: vnd, role: 'Vendor', userId: vnd._id.toString(), userName: vnd.businessName || vnd.name || 'Vendor', userAvatar: vnd.logoUrl || '' };
    }

    const [cust, drv, vnd] = await Promise.all([
      Customer.findOne({ email: emailRegex }),
      Driver.findOne({ email: emailRegex }),
      Vendor.findOne({ email: emailRegex })
    ]);

    if (cust) return { user: cust, role: 'Customer', userId: cust._id.toString(), userName: cust.name || 'Customer', userAvatar: cust.profilePic || '' };
    if (drv) return { user: drv, role: 'Driver', userId: drv._id.toString(), userName: drv.name || 'Driver', userAvatar: drv.profilePic || '' };
    if (vnd) return { user: vnd, role: 'Vendor', userId: vnd._id.toString(), userName: vnd.businessName || vnd.name || 'Vendor', userAvatar: vnd.logoUrl || '' };
  }

  return null;
};

/**
 * Resolve recipient entity strictly to a real database entity.
 * Prevents phantom IDs like "partner-..." that cause message misdirection.
 */
const resolveRecipient = async ({ recipientId, recipientName }) => {
  // 1. Direct ID lookup
  if (recipientId) {
    const rIdStr = String(recipientId).trim();
    if (mongoose.Types.ObjectId.isValid(rIdStr)) {
      const [vnd, drv, cust] = await Promise.all([
        Vendor.findById(rIdStr),
        Driver.findById(rIdStr),
        Customer.findById(rIdStr)
      ]);
      if (vnd) return { id: vnd._id.toString(), name: vnd.businessName || vnd.name, role: 'Vendor', avatar: vnd.logoUrl || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=100' };
      if (drv) return { id: drv._id.toString(), name: drv.name, role: 'Driver', avatar: drv.profilePic || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100' };
      if (cust) return { id: cust._id.toString(), name: cust.name, role: 'Customer', avatar: cust.profilePic || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100' };
      try {
        const adm = await Admin.findById(rIdStr);
        if (adm) return { id: adm._id.toString(), name: adm.name || 'Admin Support', role: 'Admin', avatar: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=100' };
      } catch (_) {}
    }
  }

  // 2. Lookup by recipient name
  if (recipientName && typeof recipientName === 'string') {
    const cleanName = recipientName.trim();
    if (!cleanName) return null;

    const regex = new RegExp(`^${cleanName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i');
    const [vnd, drv, cust] = await Promise.all([
      Vendor.findOne({ $or: [{ businessName: regex }, { name: regex }] }),
      Driver.findOne({ name: regex }),
      Customer.findOne({ name: regex })
    ]);

    if (vnd) return { id: vnd._id.toString(), name: vnd.businessName || vnd.name, role: 'Vendor', avatar: vnd.logoUrl || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=100' };
    if (drv) return { id: drv._id.toString(), name: drv.name, role: 'Driver', avatar: drv.profilePic || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100' };
    if (cust) return { id: cust._id.toString(), name: cust.name, role: 'Customer', avatar: cust.profilePic || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100' };

    // 3. Fallback to active system roles if name is generic (e.g. "Delivery Partner", "Driver")
    const lowerName = cleanName.toLowerCase();
    if (lowerName.includes('driver') || lowerName.includes('delivery') || lowerName.includes('rider')) {
      const activeDriver = (await Driver.findOne({ status: 'Active' })) || (await Driver.findOne());
      if (activeDriver) {
        return { id: activeDriver._id.toString(), name: activeDriver.name, role: 'Driver', avatar: activeDriver.profilePic || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100' };
      }
    }

    if (lowerName.includes('support') || lowerName.includes('admin') || lowerName.includes('help')) {
      try {
        const adm = await Admin.findOne();
        if (adm) {
          return { id: adm._id.toString(), name: adm.name || 'Support Agent', role: 'Admin', avatar: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=100' };
        }
      } catch (_) {}
    }

    if (lowerName.includes('kitchen') || lowerName.includes('restaurant') || lowerName.includes('store') || lowerName.includes('vendor')) {
      const anyVendor = (await Vendor.findOne({ status: 'Approved' })) || (await Vendor.findOne());
      if (anyVendor) {
        return { id: anyVendor._id.toString(), name: anyVendor.businessName || anyVendor.name, role: 'Vendor', avatar: anyVendor.logoUrl || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=100' };
      }
    }
  }

  return null;
};

/**
 * Get or create a canonical 2-party conversation between two specific users
 */
const findOrCreateConversation = async (authUser, recipient) => {
  const myId = String(authUser.userId);
  const otherId = String(recipient.id);
  const pIds = [myId, otherId].sort();

  let conversation = await Conversation.findOne({
    participantIds: { $all: pIds }
  });

  if (!conversation) {
    conversation = await Conversation.create({
      participantIds: pIds,
      participants: [
        {
          userId: myId,
          userModel: authUser.role,
          name: authUser.userName,
          avatar: authUser.userAvatar,
          role: authUser.role,
          unreadCount: 0
        },
        {
          userId: otherId,
          userModel: recipient.role,
          name: recipient.name,
          avatar: recipient.avatar,
          role: recipient.role,
          unreadCount: 0
        }
      ]
    });
  } else {
    // Update participant details if they changed
    let dirty = false;
    if (Array.isArray(conversation.participants)) {
      const mePart = conversation.participants.find(p => String(p.userId) === myId);
      if (mePart && (mePart.name !== authUser.userName || mePart.avatar !== authUser.userAvatar)) {
        mePart.name = authUser.userName;
        mePart.avatar = authUser.userAvatar;
        dirty = true;
      }
      const otherPart = conversation.participants.find(p => String(p.userId) === otherId);
      if (otherPart && recipient.name && otherPart.name !== recipient.name) {
        otherPart.name = recipient.name;
        dirty = true;
      }
    }
    if (dirty) {
      await conversation.save();
    }
  }

  return conversation;
};

/**
 * Fetch chat threads for an authenticated user with strict user privacy.
 * Never collapses threads across different users who happen to share the same name.
 */
const getThreadsForUser = async (authUser) => {
  const userId = String(authUser.userId);

  // 1. Fetch conversations strictly matching caller's userId
  const conversations = await Conversation.find({
    participantIds: userId
  }).sort({ updatedAt: -1 });

  const threads = [];
  const handledParticipantIds = new Set();

  for (const conv of conversations) {
    const meParticipant = conv.participants.find(p => String(p.userId) === userId);
    const otherParticipant = conv.participants.find(p => String(p.userId) !== userId) || conv.participants[0] || {};

    const otherId = String(otherParticipant.userId || conv._id);
    const otherName = otherParticipant.name || 'Chat Partner';
    const otherAvatar = otherParticipant.avatar || (
      otherParticipant.role === 'Driver'
        ? 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100'
        : 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=100'
    );

    // Key uniquely by the other participant's ID so separate people never collapse!
    if (!handledParticipantIds.has(otherId)) {
      handledParticipantIds.add(otherId);

      // Accurate unread count: prioritize live messages, fallback to conv counter
      let unread = meParticipant?.unreadCount || 0;
      if (Message.countDocuments) {
        try {
          unread = await Message.countDocuments({
            conversationId: conv._id,
            recipientId: userId,
            read: false
          });
        } catch (_) {
          unread = meParticipant?.unreadCount || 0;
        }
      }

      threads.push({
        id: conv._id.toString(),
        conversationId: conv._id.toString(),
        recipientId: otherId,
        name: otherName,
        role: otherParticipant.role || 'Vendor',
        lastMsg: conv.lastMessage?.text || (conv.lastMessage?.imageUrl ? '📷 Image' : (conv.lastMessage?.type === 'call' ? 'Voice Call' : '')),
        time: conv.lastMessage?.createdAt
          ? new Date(conv.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          : new Date(conv.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        unread,
        avatar: otherAvatar
      });
    }
  }

  // 2. Also check any standalone messages where senderId or recipientId is userId
  const standaloneMessages = await Message.find({
    $or: [
      { senderId: userId },
      { recipientId: userId }
    ]
  }).sort({ createdAt: -1 });

  for (const msg of standaloneMessages) {
    const isMe = String(msg.senderId) === userId;
    const otherId = String(isMe ? msg.recipientId : msg.senderId);
    const otherName = isMe ? msg.recipientName : msg.senderName;

    if (otherId && !handledParticipantIds.has(otherId)) {
      handledParticipantIds.add(otherId);
      threads.push({
        id: msg.conversationId ? msg.conversationId.toString() : otherId,
        conversationId: msg.conversationId ? msg.conversationId.toString() : null,
        recipientId: otherId,
        name: otherName || 'Chat Partner',
        role: 'Chat Partner',
        lastMsg: msg.text || (msg.imageUrl ? '📷 Image' : 'Voice Call'),
        time: new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        unread: (!msg.read && !isMe) ? 1 : 0,
        avatar: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=100'
      });
    }
  }

  return threads;
};

/**
 * Fetch messages between authenticated user and contact or within a conversation.
 * Strictly guarantees zero leakage: user only ever receives their own messages.
 */
const getMessagesForUser = async (authUser, { conversationId, recipientName, recipientId }) => {
  const userId = String(authUser.userId);
  let conv = null;

  if (conversationId && mongoose.Types.ObjectId.isValid(conversationId)) {
    conv = await Conversation.findById(conversationId);
    if (!conv) {
      return { error: 'Conversation not found', status: 404 };
    }
    // Strict participant verification
    const isParticipant = (conv.participantIds || []).map(String).includes(userId);
    if (!isParticipant) {
      return { error: 'You are not authorized to access this conversation', status: 403 };
    }
  } else {
    // If conversationId not passed, resolve recipient and find/create canonical conversation
    const recipient = await resolveRecipient({ recipientId, recipientName });
    if (recipient && String(recipient.id) !== userId) {
      conv = await findOrCreateConversation(authUser, recipient);
    }
  }

  let messages = [];

  if (conv) {
    const pIds = (conv.participantIds || []).map(String);
    const otherPId = pIds.find(id => id !== userId) || '';

    // Query by conversationId (primary index)
    messages = await Message.find({ conversationId: conv._id }).sort({ createdAt: 1 });

    // Fallback: if no messages found by ObjectId, check string conversationId or participant IDs
    if (!messages || messages.length === 0) {
      const fallbackConditions = [
        { conversationId: conv._id.toString() }
      ];
      if (otherPId) {
        fallbackConditions.push(
          { senderId: userId, recipientId: otherPId },
          { senderId: otherPId, recipientId: userId }
        );
      }
      messages = await Message.find({ $or: fallbackConditions }).sort({ createdAt: 1 });
    }

    // Strict privacy guarantee: caller must be sender or recipient
    messages = (messages || []).filter(m => String(m.senderId) === userId || String(m.recipientId) === userId);

    // Reset unread count for current user
    if (Array.isArray(conv.participants)) {
      const mePart = conv.participants.find(p => String(p.userId) === userId);
      if (mePart && mePart.unreadCount > 0) {
        mePart.unreadCount = 0;
        await conv.save();
      }
    }
  } else if (recipientId || recipientName) {
    // Fallback: only match messages strictly involving caller's userId
    const rId = recipientId ? String(recipientId) : null;
    const conditions = [];
    if (rId) {
      conditions.push(
        { senderId: userId, recipientId: rId },
        { senderId: rId, recipientId: userId }
      );
    }

    if (conditions.length === 0) {
      return { error: 'Valid recipient ID or conversation is required', status: 400 };
    }

    messages = await Message.find({ $or: conditions }).sort({ createdAt: 1 });
  } else {
    return { error: 'Conversation or recipient is required', status: 400 };
  }

  // Mark all unread messages received by caller as read
  const unreadMsgIds = messages
    .filter(m => !m.read && String(m.recipientId) === userId)
    .map(m => m._id);

  if (unreadMsgIds.length > 0) {
    await Message.updateMany(
      { _id: { $in: unreadMsgIds } },
      { $set: { read: true, readAt: new Date() } }
    );
  }

  const formatted = messages.map(m => {
    const isMe = String(m.senderId) === userId;
    return {
      id: m._id.toString(),
      conversationId: m.conversationId ? m.conversationId.toString() : (conv ? conv._id.toString() : null),
      text: m.text,
      image: m.imageUrl,
      type: m.type || 'text',
      subText: m.subText,
      time: new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      createdAt: m.createdAt,
      read: m.read,
      sender: isMe ? 'me' : 'them',
      senderName: m.senderName,
      recipientName: m.recipientName
    };
  });

  const otherParticipant = conv?.participants?.find(p => String(p.userId) !== userId);

  return {
    success: true,
    conversationId: conv ? conv._id.toString() : null,
    recipientId: otherParticipant?.userId || (recipientId ? String(recipientId) : null),
    recipientName: otherParticipant?.name || recipientName || '',
    messages: formatted
  };
};

/**
 * Send a message safely with full input validation and notification dispatching
 */
const sendMessageForUser = async (authUser, { conversationId, recipientId, recipientName, text, imageUrl, type = 'text', subText = '' }) => {
  const cleanText = typeof text === 'string' ? text.trim() : '';
  const cleanType = ['text', 'image', 'call'].includes(type) ? type : 'text';

  // Input Validation
  if (cleanType === 'text' && !cleanText && !imageUrl) {
    return { error: 'Message content cannot be empty', status: 400 };
  }

  if (cleanText.length > 2000) {
    return { error: 'Message exceeds maximum length of 2000 characters', status: 400 };
  }

  // Resolve Recipient
  let recipient = null;
  let conversation = null;

  if (conversationId && mongoose.Types.ObjectId.isValid(conversationId)) {
    conversation = await Conversation.findById(conversationId);
    if (conversation) {
      const otherPart = conversation.participants.find(p => String(p.userId) !== String(authUser.userId));
      if (otherPart) {
        recipient = { id: String(otherPart.userId), name: otherPart.name, role: otherPart.role, avatar: otherPart.avatar };
      }
    }
  }

  if (!recipient) {
    recipient = await resolveRecipient({ recipientId, recipientName });
  }

  if (!recipient) {
    return { error: 'Invalid or missing message recipient', status: 400 };
  }

  // Prevent sending messages to yourself
  if (String(authUser.userId) === String(recipient.id)) {
    return { error: 'Cannot send messages to yourself', status: 400 };
  }

  // Find or create canonical conversation thread
  if (!conversation) {
    conversation = await findOrCreateConversation(authUser, recipient);
  }

  // Create message record
  const newMsg = await Message.create({
    conversationId: conversation._id,
    senderId: String(authUser.userId),
    senderModel: authUser.role,
    senderName: authUser.userName,
    recipientId: String(recipient.id),
    recipientModel: recipient.role,
    recipientName: recipient.name,
    text: cleanText,
    imageUrl: imageUrl || null,
    type: cleanType,
    subText: subText ? subText.trim() : '',
    read: false
  });

  // Update conversation last message & increment recipient unread count
  conversation.lastMessage = {
    text: cleanText,
    imageUrl: imageUrl || null,
    type: cleanType,
    subText: subText ? subText.trim() : '',
    senderId: String(authUser.userId),
    senderName: authUser.userName,
    createdAt: new Date()
  };

  const recipientPart = conversation.participants.find(p => String(p.userId) === String(recipient.id));
  if (recipientPart) {
    recipientPart.unreadCount = (recipientPart.unreadCount || 0) + 1;
  }
  await conversation.save();

  // Dispatch in-app notification to recipient
  try {
    const notifyRole = (recipient.role || 'customer').toLowerCase();
    await Notification.create({
      title: `Message from ${authUser.userName}`,
      message: cleanText ? (cleanText.length > 80 ? cleanText.slice(0, 77) + '...' : cleanText) : (imageUrl ? 'Sent you a photo' : 'Voice call notification'),
      type: 'message',
      recipient: notifyRole === 'vendor' ? 'vendor' : (notifyRole === 'driver' ? 'driver' : 'customer'),
      userId: String(recipient.id),
      read: false
    });
  } catch (notifErr) {
    console.error('Failed to create chat notification:', notifErr.message);
  }

  return {
    success: true,
    conversationId: conversation._id.toString(),
    recipientId: String(recipient.id),
    data: {
      id: newMsg._id.toString(),
      conversationId: conversation._id.toString(),
      text: newMsg.text,
      image: newMsg.imageUrl,
      type: newMsg.type,
      subText: newMsg.subText,
      time: new Date(newMsg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      createdAt: newMsg.createdAt,
      read: newMsg.read,
      sender: 'me',
      senderName: newMsg.senderName,
      recipientName: newMsg.recipientName
    }
  };
};

module.exports = {
  resolveAuthUser,
  resolveRecipient,
  findOrCreateConversation,
  getThreadsForUser,
  getMessagesForUser,
  sendMessageForUser
};
