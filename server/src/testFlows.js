import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve('server/.env') });
if (!process.env.MONGODB_URI) {
  dotenv.config();
}

import { User } from './models/User.js';
import { Organization } from './models/Organization.js';
import { Conversation } from './models/Conversation.js';
import { Ticket } from './models/Ticket.js';

import {
  createNewSession,
  handleCustomerMessage,
  
  resolveConversationManually,
  detectResolutionConfirmation,
} from './services/conversation.service.js';

const runTests = async () => {
  console.log('\n======================================================');
  console.log(' STARTING AI SUPPORTHUB AUTOMATED ARCHITECTURE TESTS ');
  console.log('======================================================\n');

  const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ai_supporthub';
  await mongoose.connect(mongoUri);
  console.log('✓ Connected to MongoDB');

  // Find demo organization
  const org = await Organization.findOne({ slug: 'skillup-academy' });
  if (!org) {
    throw new Error('SkillUp Academy organization not found. Please run seed first.');
  }
  console.log(`✓ Using Organization: ${org.name} (${org._id})`);

  // Find demo customer and agent
  const customer = await User.findOne({ email: 'customer.aarav@gmail.com' });
  const agent = await User.findOne({ email: 'agent.priya@skillupacademy.dev' });
  if (!customer || !agent) {
    throw new Error('Test users not found. Please run seed first.');
  }
  console.log(`✓ Customer: ${customer.name} (${customer._id})`);
  console.log(`✓ Agent: ${agent.name} (${agent._id})`);

  // -------------------------------------------------------------------------
  // TEST 1: Customer clicks New Session -> creates Conversation + Ticket 1-to-1
  // -------------------------------------------------------------------------
  console.log('\n--- TEST 1: New Session Binding (1 Conversation = 1 Ticket) ---');
  const session1 = await createNewSession(org._id, customer._id);
  console.log(`Session 1 Created:`);
  console.log(`  Conversation ID: ${session1.conversation._id}`);
  console.log(`  Ticket ID:       ${session1.ticket._id}`);
  console.log(`  Ticket Number:   ${session1.ticket.ticketNumber}`);
  console.log(`  Conversation Status: ${session1.conversation.status}`);
  console.log(`  Ticket Status:       ${session1.ticket.status}`);

  if (
    session1.conversation.ticketId.toString() !== session1.ticket._id.toString() ||
    session1.ticket.conversationId.toString() !== session1.conversation._id.toString()
  ) {
    throw new Error('TEST 1 FAILED: Conversation and Ticket are not linked 1-to-1!');
  }
  if (session1.conversation.status !== 'OPEN' || session1.ticket.status !== 'OPEN') {
    throw new Error('TEST 1 FAILED: Initial status is not OPEN!');
  }
  console.log('✓ TEST 1 PASSED: 1 Conversation = 1 Ticket linked with OPEN status.');

  // -------------------------------------------------------------------------
  // TEST 2: Customer sends message -> AI answers from Knowledge Base
  // -------------------------------------------------------------------------
  console.log('\n--- TEST 2: Customer Chat with AI ---');
  const msgResult = await handleCustomerMessage({
    organizationId: org._id,
    customerId: customer._id,
    conversationId: session1.conversation._id,
    content: 'What is the refund policy of SkillUp Academy?',
  });
  console.log(`Customer Message: "${msgResult.customerMessage.content}"`);
  console.log(`AI Response:      "${msgResult.aiMessage.content.substring(0, 100)}..."`);
  console.log(`Escalated: ${msgResult.escalated}, Resolved: ${msgResult.resolved}`);

  if (!msgResult.aiMessage || !msgResult.aiMessage.content) {
    throw new Error('TEST 2 FAILED: AI response was not generated!');
  }
  console.log('✓ TEST 2 PASSED: Customer message saved, AI response generated.');

  // -------------------------------------------------------------------------
  // TEST 3: Customer clicks New Session again -> generates distinct IDs
  // -------------------------------------------------------------------------
  console.log('\n--- TEST 3: New Session Generates Fresh Distinct IDs ---');
  const session2 = await createNewSession(org._id, customer._id);
  console.log(`Session 2 Created:`);
  console.log(`  Conversation ID: ${session2.conversation._id}`);
  console.log(`  Ticket ID:       ${session2.ticket._id}`);

  if (session2.conversation._id.toString() === session1.conversation._id.toString()) {
    throw new Error('TEST 3 FAILED: Reused existing conversation ID!');
  }
  if (session2.ticket._id.toString() === session1.ticket._id.toString()) {
    throw new Error('TEST 3 FAILED: Reused existing ticket ID!');
  }
  console.log('✓ TEST 3 PASSED: New Session always creates distinct conversation & ticket IDs.');

  // -------------------------------------------------------------------------
  // TEST 4: Resolution Detection (Accurate phrase vs weak phrase)
  // -------------------------------------------------------------------------
  console.log('\n--- TEST 4: AI Resolution Detection ---');
  // 4a. Weak word should NOT resolve
  const weakCheck = detectResolutionConfirmation('okay');
  console.log(`Word "okay" is resolved? ${weakCheck}`);
  if (weakCheck !== false) throw new Error('TEST 4a FAILED: "okay" should NOT resolve a ticket!');

  const weakCheck2 = detectResolutionConfirmation("I'll try");
  console.log(`Word "I'll try" is resolved? ${weakCheck2}`);
  if (weakCheck2 !== false) throw new Error('TEST 4a FAILED: "I\'ll try" should NOT resolve a ticket!');

  // 4b. Explicit confirmation SHOULD resolve
  const explicitMsg = await handleCustomerMessage({
    organizationId: org._id,
    customerId: customer._id,
    conversationId: session1.conversation._id,
    content: 'Yes, that solved my problem. Thanks!',
  });
  console.log(`Explicit phrase result: resolved = ${explicitMsg.resolved}`);
  const updatedConv1 = await Conversation.findById(session1.conversation._id);
  const updatedTicket1 = await Ticket.findById(session1.ticket._id);
  console.log(`Conversation Status: ${updatedConv1.status}`);
  console.log(`Ticket Status:       ${updatedTicket1.status}`);

  if (updatedConv1.status !== 'RESOLVED' || updatedTicket1.status !== 'RESOLVED') {
    throw new Error('TEST 4b FAILED: Explicit confirmation did not mark ticket & conversation as RESOLVED!');
  }
  console.log('✓ TEST 4 PASSED: AI Resolution Detection works accurately.');

  // -------------------------------------------------------------------------
  // TEST 5: Human Escalation
  // -------------------------------------------------------------------------
  console.log('\n--- TEST 5: Human Escalation Trigger ---');
  const escalateMsg = await handleCustomerMessage({
    organizationId: org._id,
    customerId: customer._id,
    conversationId: session2.conversation._id,
    content: 'I want to talk to a human support agent.',
  });
  console.log(`Escalation triggered: ${escalateMsg.escalated}`);
  const updatedConv2 = await Conversation.findById(session2.conversation._id);
  const updatedTicket2 = await Ticket.findById(session2.ticket._id);
  console.log(`Conversation Status: ${updatedConv2.status}, Mode: ${updatedConv2.mode}`);
  console.log(`Ticket Status:       ${updatedTicket2.status}`);

  if (updatedConv2.status !== 'HUMAN_REQUIRED' || updatedConv2.mode !== 'human' || updatedTicket2.status !== 'HUMAN_REQUIRED') {
    throw new Error('TEST 5 FAILED: Conversation / Ticket status is not HUMAN_REQUIRED!');
  }
  console.log('✓ TEST 5 PASSED: Human escalation sets status to HUMAN_REQUIRED and mode to human.');

  // -------------------------------------------------------------------------
  // TEST 6: Agent Takeover & Resolution
  // -------------------------------------------------------------------------
  console.log('\n--- TEST 6: Agent Manual Resolution ---');
  const resolveResult = await resolveConversationManually({
    organizationId: org._id,
    conversationId: session2.conversation._id,
    resolvedBy: agent,
  });
  console.log(`Resolve Result: Conversation Status = ${resolveResult.conversation.status}, Ticket Status = ${resolveResult.ticket.status}`);
  if (resolveResult.conversation.status !== 'RESOLVED' || resolveResult.ticket.status !== 'RESOLVED') {
    throw new Error('TEST 6 FAILED: Agent resolution did not mark ticket & conversation as RESOLVED!');
  }
  console.log('✓ TEST 6 PASSED: Agent successfully resolves human-required ticket.');

  // -------------------------------------------------------------------------
  // TEST 7: Customer Conversation History
  // -------------------------------------------------------------------------
  console.log('\n--- TEST 7: Customer Conversation History ---');
  const historyList = await Conversation.find({ organizationId: org._id, customerId: customer._id })
    .populate('ticketId')
    .sort({ updatedAt: -1 });
  console.log(`Total conversations for customer: ${historyList.length}`);
  historyList.forEach((c, idx) => {
    console.log(`  [${idx + 1}] Title: "${c.title}" | Status: ${c.status} | Mode: ${c.mode} | Ticket: ${c.ticketId?.ticketNumber || 'N/A'}`);
  });
  if (historyList.length < 2) {
    throw new Error('TEST 7 FAILED: Customer history missing conversations!');
  }
  console.log('✓ TEST 7 PASSED: Customer conversation history displays all sessions with linked tickets.');

  console.log('\n======================================================');
  console.log(' ALL 7 ARCHITECTURAL & WORKFLOW TESTS PASSED 100%! ');
  console.log('======================================================\n');

  process.exit(0);
};

runTests().catch((err) => {
  console.error('\n❌ TEST FAILED:', err);
  process.exit(1);
});
