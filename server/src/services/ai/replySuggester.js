import { generateAIResponse } from './aiProvider.js';
import { retrieveRelevantKnowledge } from '../knowledge/retrievalService.js';
import { logger } from '../../utils/logger.js';

export const suggestAgentReply = async ({
  organizationId,
  ticket,
  conversationHistory = [],
  agentName = 'Support Agent',
}) => {
  try {
    // 1. Fetch relevant knowledge based on ticket title & last message
    const lastCustomerMsg = [...conversationHistory].reverse().find((m) => m.senderType === 'customer')?.content || '';
    const query = `${ticket?.title || ''} ${ticket?.description || ''} ${lastCustomerMsg}`;
    const retrievedChunks = await retrieveRelevantKnowledge(organizationId, query, 3);

    const contextText = retrievedChunks.map((c) => c.content).join('\n\n');
    const historyText = conversationHistory
      .slice(-6)
      .map((m) => `${m.senderType.toUpperCase()}: ${m.content}`)
      .join('\n');

    const systemPrompt = `You are an AI Copilot assisting a human customer support agent named "${agentName}" at SkillUp Academy.
Your task is to draft a polite, professional, concise, and accurate response that the agent can review and send to the customer.

Guidelines:
- Address the customer's specific problem directly.
- Use the provided knowledge base facts (refund rules, course details, troubleshooting steps).
- Do not make false promises.
- Maintain a warm, helpful, and reassuring human tone.
- Do NOT include placeholder tags like "[Your Name]" if you can avoid it. Sign off cleanly.`;

    const userPrompt = `TICKET INFORMATION:
Title: ${ticket?.title || 'Support Ticket'}
Category: ${ticket?.category || 'General'}
Priority: ${ticket?.priority || 'Medium'}
Customer Problem: ${ticket?.aiSummary?.customerProblem || ticket?.description || lastCustomerMsg}

RECENT CONVERSATION HISTORY:
${historyText || 'No prior messages'}

VERIFIED KNOWLEDGE BASE CONTEXT:
${contextText || 'Standard SkillUp Academy customer support guidelines apply.'}

Draft a recommended agent reply now:`;

    const reply = await generateAIResponse({
      systemPrompt,
      userPrompt,
      temperature: 0.3,
      maxTokens: 500,
    });

    return reply.trim();
  } catch (error) {
    logger.error(`Error suggesting reply: ${error.message}`);
    return `Hello! Thank you for reaching out to SkillUp Academy support. I'm looking into your request regarding "${ticket?.title || 'your issue'}" right now and will help get this resolved for you shortly.`;
  }
};
