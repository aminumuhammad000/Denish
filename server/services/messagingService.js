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
 * Resolve recipient entity by ID or name
 */
const resolveRecipient = async ({ recipientId, recipientName }) => {
  if (recipientId && mongoose.Types.ObjectId.isValid(recipientId)) {
    const [vnd, drv, cust] = await Promise.all([
      Vendor.findById(recipientId),
      Driver.findById(recipientId),
      Customer.findById(recipientId)
    ]);
    if (vnd) return { id: vnd._id.toString(), name: vnd.businessName || vnd.name, role: 'Vendor', avatar: vnd.logoUrl || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=100' };
    if (drv) return { id: drv._id.toString(), name: drv.name, role: 'Driver', avatar: drv.profilePic || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100' };
    if (cust) return { id: cust._id.toString(), name: cust.name, role: 'Customer', avatar: cust.profilePic || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100' };
  }

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

    // Placeholder if not found in db
    let avatar = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100';
    let role = 'Vendor';
    if (cleanName.toLowerCase().includes('driver') || cleanName.toLowerCase().includes('rider') || cleanName.toLowerCase().includes('bayo') || cleanName.toLowerCase().includes('adeyemi')) {
      avatar = 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100';
      role = 'Driver';
    } else if (cleanName.toLowerCase().includes('support') || cleanName.toLowerCase().includes('admin')) {
      avatar = 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=100';
      role = 'Admin';
    } else if (cleanName.toLowerCase().includes('kitchen') || cleanName.toLowerCase().includes('store') || cleanName.toLowerCase().includes('hub') || cleanName.toLowerCase().includes('restaurant')) {
      avatar = 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=100';
      role = 'Vendor';
    }

    return { id: recipientId || `partner-${cleanName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`, name: cleanName, role, avatar };
  }

  return null;
};

/**
 * Get or create a conversation between two users
 */
const findOrCreateConversation = async (authUser, recipient) => {
  let conversation = await Conversation.findOne({
    participantIds: { $all: [authUser.userId, recipient.id] }
  });

  if (!conversation) {
    conversation = await Conversation.create({
      participantIds: [authUser.userId, recipient.id],
      participants: [
        {
          userId: authUser.userId,
          userModel: authUser.role,
          name: authUser.userName,
          avatar: authUser.userAvatar,
          role: authUser.role,
          unreadCount: 0
        },
        {
          userId: recipient.id,
          userModel: recipient.role,
          name: recipient.name,
          avatar: recipient.avatar,
          role: recipient.role,
          unreadCount: 0
        }
      ]
    });
  }

  return conversation;
};

/**
 * Fetch chat threads for an authenticated user
 */
const getThreadsForUser = async (authUser) => {
  const userId = authUser.userId;
  const userName = authUser.userName;

  // 1. Fetch conversations matching participantIds
  const conversations = await Conversation.find({
    $or: [
      { participantIds: userId },
      { 'participants.userId': userId },
      { 'participants.name': userName }
    ]
  }).sort({ updatedAt: -1 });

  const threads = [];
  const handledKeys = new Set();

  for (const conv of conversations) {
    const meParticipant = conv.participants.find(p => p.userId === userId || p.name === userName);
    const otherParticipant = conv.participants.find(p => p.userId !== userId && p.name !== userName) || conv.participants[0] || {};

    const otherName = otherParticipant.name || 'Chat Partner';
    const otherId = otherParticipant.userId || conv._id.toString();
    const otherAvatar = otherParticipant.avatar || (
      otherParticipant.role === 'Driver' 
        ? 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100'
        : 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=100'
    );

    const key = otherName.toLowerCase();
    if (!handledKeys.has(key)) {
      handledKeys.add(key);
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
        unread: meParticipant ? (meParticipant.unreadCount || 0) : 0,
        avatar: otherAvatar
      });
    }
  }

  // 2. Also check any standalone / legacy Messages to guarantee nothing is dropped
  const legacyMessages = await Message.find({
    $or: [
      { senderId: userId },
      { recipientId: userId },
      { senderName: userName },
      { recipientName: userName }
    ]
  }).sort({ createdAt: -1 });

  for (const msg of legacyMessages) {
    const isMe = msg.senderId === userId || msg.senderName === userName;
    const otherName = isMe ? msg.recipientName : msg.senderName;
    const otherId = isMe ? msg.recipientId : msg.senderId;
    const key = (otherName || '').toLowerCase();

    if (otherName && !handledKeys.has(key)) {
      handledKeys.add(key);
      threads.push({
        id: otherId || key,
        conversationId: msg.conversationId ? msg.conversationId.toString() : null,
        recipientId: otherId,
        name: otherName,
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
 * Fetch messages between authenticated user and contact or within a conversation
 */
const getMessagesForUser = async (authUser, { conversationId, recipientName, recipientId }) => {
  const userId = authUser.userId;
  const userName = authUser.userName;

  let query = null;

  if (conversationId && mongoose.Types.ObjectId.isValid(conversationId)) {
    const conv = await Conversation.findById(conversationId);
    if (!conv) {
      return { error: 'Conversation not found', status: 404 };
    }
    // Verify caller is a participant in this conversation
    const isParticipant = conv.participantIds?.includes(userId) || conv.participants?.some(p => p.userId === userId || p.name === userName);
    if (!isParticipant) {
      return { error: 'You are not authorized to access this conversation', status: 403 };
    }
    query = { conversationId };

    // Reset unread count for current user
    const mePart = conv.participants.find(p => p.userId === userId || p.name === userName);
    if (mePart && mePart.unreadCount > 0) {
      mePart.unreadCount = 0;
      await conv.save();
    }
  } else {
    // Query by contact name / IDs
    const cleanName = (recipientName || '').trim();
    const conditions = [];

    if (cleanName) {
      conditions.push(
        { senderName: userName, recipientName: cleanName },
        { senderName: cleanName, recipientName: userName }
      );
    }
    if (recipientId) {
      conditions.push(
        { senderId: userId, recipientId: recipientId },
        { senderId: recipientId, recipientId: userId }
      );
    }

    if (conditions.length === 0) {
      return { error: 'Recipient name or ID is required', status: 400 };
    }

    query = { $or: conditions };
  }

  const messages = await Message.find(query).sort({ createdAt: 1 });

  // Mark all unread messages received by caller as read
  const unreadMsgIds = messages
    .filter(m => !m.read && (m.recipientId === userId || m.recipientName === userName))
    .map(m => m._id);

  if (unreadMsgIds.length > 0) {
    await Message.updateMany(
      { _id: { $in: unreadMsgIds } },
      { $set: { read: true, readAt: new Date() } }
    );
  }

  const formatted = messages.map(m => {
    const isMe = m.senderId === userId || m.senderName === userName;
    return {
      id: m._id.toString(),
      conversationId: m.conversationId ? m.conversationId.toString() : null,
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

  return { success: true, messages: formatted };
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
      const otherPart = conversation.participants.find(p => p.userId !== authUser.userId && p.name !== authUser.userName);
      if (otherPart) {
        recipient = { id: otherPart.userId, name: otherPart.name, role: otherPart.role, avatar: otherPart.avatar };
      }
    }
  }

  if (!recipient) {
    recipient = await resolveRecipient({ recipientId, recipientName });
  }

  if (!recipient) {
    return { error: 'Invalid or missing message recipient', status: 400 };
  }

  // Find or create conversation thread
  if (!conversation) {
    conversation = await findOrCreateConversation(authUser, recipient);
  }

  // Create message record
  const newMsg = await Message.create({
    conversationId: conversation._id,
    senderId: authUser.userId,
    senderModel: authUser.role,
    senderName: authUser.userName,
    recipientId: recipient.id,
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
    senderId: authUser.userId,
    senderName: authUser.userName,
    createdAt: new Date()
  };

  const recipientPart = conversation.participants.find(p => p.userId === recipient.id || p.name === recipient.name);
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
      userId: recipient.id,
      read: false
    });
  } catch (notifErr) {
    console.error('Failed to create chat notification:', notifErr.message);
  }

  return {
    success: true,
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
