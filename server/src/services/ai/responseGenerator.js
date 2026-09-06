import { retrieveRelevantKnowledge } from '../knowledge/retrievalService.js';
import { buildCustomerSupportSystemPrompt, buildChatUserPrompt } from './promptBuilder.js';
import { generateAIResponse } from './aiProvider.js';
import { Organization } from '../../models/Organization.js';
import { logger } from '../../utils/logger.js';

export const detectEscalationNeed = (query, retrievedChunks, conversationHistory = []) => {
  const q = query.toLowerCase();

  // Explicit human requests
  const humanTriggers = [
    'human', 'agent', 'representative', 'person', 'talk to someone', 'customer care executive',
    'speak with someone', 'manager', 'escalate', 'support staff'
  ];
  if (humanTriggers.some((trigger) => q.includes(trigger))) {
    return { shouldEscalate: true, reason: 'Customer explicitly requested a human agent.' };
  }

  // Account/Payment investigation triggers
  const accountTriggers = [
    'i was charged twice', 'double charged', 'unauthorized charge', 'money deducted but no access',
    'payment deducted but not enrolled', 'account hacked', 'cannot login even after reset'
  ];
  if (accountTriggers.some((trigger) => q.includes(trigger))) {
    return { shouldEscalate: true, reason: 'Issue requires manual account or payment investigation.' };
  }

  // Frustration triggers
  const frustratedTriggers = ['this is useless', 'horrible support', 'terrible', 'waste of time', 'scam', 'unacceptable'];
  if (frustratedTriggers.some((trigger) => q.includes(trigger))) {
    return { shouldEscalate: true, reason: 'Customer expressed frustration with automated support.' };
  }

  // Low context match if multiple questions have gone unresolved
  if (retrievedChunks.length === 0 && conversationHistory.length >= 4) {
    return { shouldEscalate: true, reason: 'Knowledge base does not contain sufficient answers for repeated queries.' };
  }

  return { shouldEscalate: false, reason: '' };
};

export const generateCustomerSupportResponse = async ({
  organizationId,
  userMessage,
  conversationHistory = [],
}) => {
  try {
    // 1. Fetch Organization settings
    const org = await Organization.findById(organizationId);
    const orgName = org?.name || 'SkillUp Academy';
    const orgDesc = org?.description || 'Online technology courses and certifications';

    // 2. Retrieve relevant RAG chunks
    const retrievedChunks = await retrieveRelevantKnowledge(organizationId, userMessage, 4);

    // 3. Build prompts
    const systemPrompt = buildCustomerSupportSystemPrompt(orgName, orgDesc, org?.settings);
    const userPrompt = buildChatUserPrompt({
      query: userMessage,
      retrievedChunks,
      conversationHistory,
    });

    // 4. Generate AI Completion
    const aiAnswer = await generateAIResponse({
      systemPrompt,
      userPrompt,
      temperature: org?.settings?.aiTemperature || 0.2,
      maxTokens: 800,
    });

    // 5. Detect escalation
    const escalation = detectEscalationNeed(userMessage, retrievedChunks, conversationHistory);

    // 6. Extract source citations
    const sourcesUsed = retrievedChunks
      .map((c) => c.metadata?.title || 'Knowledge Base')
      .filter((v, i, a) => a.indexOf(v) === i);

    return {
      content: aiAnswer,
      retrievedChunkIds: retrievedChunks.map((c) => c._id),
      sourcesUsed,
      confidenceScore: retrievedChunks.length > 0 ? 0.9 : 0.6,
      shouldEscalate: escalation.shouldEscalate,
      escalationReason: escalation.reason,
    };
  } catch (error) {
    logger.error(`Error generating support response: ${error.message}`);
    return {
      content: "I apologize, but I'm having a brief issue accessing the knowledge base right now. Would you like me to connect you directly with a human support agent?",
      retrievedChunkIds: [],
      sourcesUsed: [],
      confidenceScore: 0.3,
      shouldEscalate: true,
      escalationReason: 'AI service temporarily unavailable.',
    };
  }
};
