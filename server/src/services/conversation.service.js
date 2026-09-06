import { Conversation } from '../models/Conversation.js';
import { Message } from '../models/Message.js';
import { Ticket } from '../models/Ticket.js';
import { generateCustomerSupportResponse } from './ai/responseGenerator.js';
import { summarizeConversation } from './ai/summarizer.js';
import { ApiError } from '../utils/ApiError.js';

/**
 * Accurately detects whether customer explicitly confirmed their issue is solved.
 * Rejects ambiguous phrases like 'ok', 'fine', 'whatever', 'hmm', 'i will try'.
 */
export const detectResolutionConfirmation = (text, history = []) => {
  if (!text || typeof text !== 'string') return false;
  const clean = text.toLowerCase().trim();

  // Words to explicitly reject (ambiguous / conversational)
  const weakWords = ['ok', 'okay', 'fine', 'whatever', "i'll try", 'ill try', 'hmm', 'sure', 'got it', 'i see', 'will check', 'maybe', 'k', 'cool'];
  if (weakWords.includes(clean)) {
    return false;
  }

  // Explicit confirmation phrases
  const explicitPhrases = [
    'solved my problem',
    'solved the problem',
    'problem is solved',
    'problem solved',
    'issue is solved',
    'issue solved',
    'it works now',
    'it is working now',
    'working now',
    'works now',
    'works fine now',
    'that solved my problem',
    'that solved it',
    'thanks that solved it',
    'thanks, that solved it',
    'that fixed it',
    'fixed my problem',
    'fixed the issue',
    'fixed now',
    'you can close this',
    'close the ticket',
    'close this ticket',
    'close this chat',
    'thanks, that\'s all',
    'thanks thats all',
    'thank you, that\'s all',
    'thank you thats all',
    'that answered my question',
    'all set now',
    'everything is clear now',
    'got my answer, thanks',
    'no more questions',
  ];

  const hasExplicit = explicitPhrases.some((phrase) => clean.includes(phrase));
  if (hasExplicit) return true;

  // Combination: positive appreciation + explicit resolution keywords
  if (
    (clean.includes('thanks') || clean.includes('thank you') || clean.includes('perfect') || clean.includes('awesome') || clean.includes('great')) &&
    (clean.includes('solved') || clean.includes('fixed') || clean.includes('working') || clean.includes('works now') || clean.includes('all good') || clean.includes('all set'))
  ) {
    return true;
  }

  return false;
};

/**
 * ALWAYS creates:
 * 1. New Conversation
 * 2. New Ticket
 * 3. Connects Conversation <-> Ticket
 * 4. Creates initial AI welcome message
 * 5. Returns { conversation, ticket, message }
 * Every click on New Session generates distinct MongoDB _id values.
 */
export const createNewSession = async (organizationId, customerId) => {
  // 1. Create Conversation
  const conversation = await Conversation.create({
    organizationId,
    customerId,
    title: 'New Conversation',
    status: 'OPEN',
    mode: 'ai',
  });

  // 2. Create Ticket linked 1-to-1
  const ticket = await Ticket.create({
    organizationId,
    customerId,
    conversationId: conversation._id,
    title: 'Support Session Ticket',
    description: 'AI Customer Support Chat Session',
    category: 'General',
    priority: 'Medium',
    status: 'OPEN',
  });

  // 3. Connect ticket to conversation
  conversation.ticketId = ticket._id;
  await conversation.save();

  // 4. Initial AI welcome message
  const welcomeMessage = await Message.create({
    organizationId,
    conversationId: conversation._id,
    senderType: 'ai',
    content: 'Hello! I am your AI Support Assistant. How can I help you today?',
    metadata: {
      confidenceScore: 1.0,
    },
  });

  return {
    conversation,
    ticket,
    message: welcomeMessage,
  };
};

// Backward-compatibility alias
export const createNewConversation = async (organizationId, customerId) => {
  const result = await createNewSession(organizationId, customerId);
  return result.conversation;
};

/**
 * Handles incoming customer messages:
 * - If in human mode: saves customer message, forwards to agent.
 * - If in AI mode:
 *     1. Checks for explicit issue resolution confirmation -> sets status to RESOLVED.
 *     2. Retrieves relevant knowledge chunks & generates AI answer.
 *     3. If AI cannot solve or escalation requested -> sets status to HUMAN_REQUIRED, mode to human.
 */
export const handleCustomerMessage = async ({ organizationId, customerId, conversationId, content }) => {
  const conversation = await Conversation.findOne({
    _id: conversationId,
    organizationId,
  });

  if (!conversation) {
    throw new ApiError(404, 'Conversation not found');
  }

  // 1. Save customer message
  const customerMsg = await Message.create({
    organizationId,
    conversationId: conversation._id,
    senderId: customerId,
    senderType: 'customer',
    content,
  });

  // Update conversation timestamp
  conversation.lastMessageAt = new Date();

  // Fetch or create linked ticket
  let ticket = null;
  if (conversation.ticketId) {
    ticket = await Ticket.findById(conversation.ticketId);
  }
  if (!ticket) {
    ticket = await Ticket.create({
      organizationId,
      customerId,
      conversationId: conversation._id,
      title: conversation.title || 'Support Session Ticket',
      description: content,
      category: 'General',
      priority: 'Medium',
      status: conversation.status || 'OPEN',
    });
    conversation.ticketId = ticket._id;
  }

  // If conversation is currently handled by a human agent, return immediately
  if (conversation.mode === 'human') {
    await conversation.save();
    return {
      customerMessage: customerMsg,
      aiMessage: null,
      escalated: false,
      resolved: false,
      ticket,
    };
  }

  // 2. Fetch recent conversation history
  const history = await Message.find({ conversationId: conversation._id })
    .sort({ createdAt: 1 })
    .limit(10)
    .lean();

  // 3. Check for customer resolution confirmation
  const isResolved = detectResolutionConfirmation(content, history);
  if (isResolved) {
    conversation.status = 'RESOLVED';
    ticket.status = 'RESOLVED';
    ticket.resolvedAt = new Date();
    await ticket.save();

    const aiMsg = await Message.create({
      organizationId,
      conversationId: conversation._id,
      senderType: 'ai',
      content: "Glad to hear that solved your problem! I've marked this support session as resolved. If you ever need help again, feel free to start a new session anytime.",
      metadata: {
        confidenceScore: 1.0,
      },
    });

    await conversation.save();

    return {
      customerMessage: customerMsg,
      aiMessage: aiMsg,
      escalated: false,
      resolved: true,
      ticket,
    };
  }

  // 4. Generate AI response using Knowledge Base RAG
  const aiResult = await generateCustomerSupportResponse({
    organizationId,
    userMessage: content,
    conversationHistory: history,
  });

  // 5. Save AI message
  const aiMsg = await Message.create({
    organizationId,
    conversationId: conversation._id,
    senderType: 'ai',
    content: aiResult.content,
    metadata: {
      confidenceScore: aiResult.confidenceScore,
      retrievedChunkIds: aiResult.retrievedChunkIds,
      sourcesUsed: aiResult.sourcesUsed,
    },
  });

  // Update conversation and ticket title from first user query if still generic
  if (conversation.title === 'New Conversation' || conversation.title === 'Support Session' || conversation.title === 'New Support Conversation') {
    const newTitle = content.substring(0, 45) + (content.length > 45 ? '...' : '');
    conversation.title = newTitle;
    if (ticket && (ticket.title === 'Support Session Ticket' || ticket.title === 'New Support Ticket')) {
      ticket.title = newTitle;
    }
  }

  let escalated = false;

  // 6. Handle escalation if detected
  if (aiResult.shouldEscalate) {
    escalated = true;
    conversation.status = 'HUMAN_REQUIRED';
    conversation.mode = 'human';
    conversation.escalationReason = aiResult.escalationReason || 'Customer requested human assistance';

    ticket.status = 'HUMAN_REQUIRED';
    ticket.description = content;
    await ticket.save();

    // System announcement message
    await Message.create({
      organizationId,
      conversationId: conversation._id,
      senderType: 'system',
      content: `Conversation transferred to a human support agent (Ticket #${ticket.ticketNumber}). An agent will join shortly.`,
    });
  }

  await conversation.save();
  await ticket.save();

  return {
    customerMessage: customerMsg,
    aiMessage: aiMsg,
    escalated,
    resolved: false,
    ticket,
  };
};

/**
 * Manually escalates a conversation to the human support queue
 */
export const escalateConversationManually = async ({ organizationId, customerId, conversationId, reason }) => {
  const conversation = await Conversation.findOne({
    _id: conversationId,
    organizationId,
  });

  if (!conversation) {
    throw new ApiError(404, 'Conversation not found');
  }

  conversation.status = 'HUMAN_REQUIRED';
  conversation.mode = 'human';
  conversation.escalationReason = reason || 'Customer requested human support agent';

  let ticket = null;
  if (conversation.ticketId) {
    ticket = await Ticket.findById(conversation.ticketId);
  }

  if (!ticket) {
    ticket = await Ticket.create({
      organizationId,
      customerId,
      conversationId: conversation._id,
      title: conversation.title || 'Escalated Support Request',
      description: reason || 'Customer requested human support agent',
      category: 'General',
      priority: 'High',
      status: 'HUMAN_REQUIRED',
    });
    conversation.ticketId = ticket._id;
  } else {
    ticket.status = 'HUMAN_REQUIRED';
    await ticket.save();
  }

  await conversation.save();

  // Create system message
  const systemMsg = await Message.create({
    organizationId,
    conversationId: conversation._id,
    senderType: 'system',
    content: `Human agent requested. Ticket #${ticket.ticketNumber} is now assigned to the support queue.`,
  });

  return { conversation, ticket, systemMsg };
};

/**
 * Manually resolves a conversation and linked ticket (by Agent or Admin)
 */
export const resolveConversationManually = async ({ organizationId, conversationId, resolvedBy }) => {
  const conversation = await Conversation.findOne({
    _id: conversationId,
    organizationId,
  });

  if (!conversation) {
    throw new ApiError(404, 'Conversation not found');
  }

  conversation.status = 'RESOLVED';
  await conversation.save();

  let ticket = null;
  if (conversation.ticketId) {
    ticket = await Ticket.findById(conversation.ticketId);
    if (ticket) {
      ticket.status = 'RESOLVED';
      ticket.resolvedAt = new Date();
      await ticket.save();
    }
  }

  const systemMsg = await Message.create({
    organizationId,
    conversationId: conversation._id,
    senderType: 'system',
    content: `Ticket #${ticket?.ticketNumber || ''} has been marked as resolved by ${resolvedBy?.name || 'Support Agent'}.`,
  });

  return { conversation, ticket, systemMsg };
};
