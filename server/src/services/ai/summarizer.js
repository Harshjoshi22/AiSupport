import { generateAIResponse } from './aiProvider.js';
import { logger } from '../../utils/logger.js';

export const summarizeConversation = async (messages = []) => {
  if (!messages || messages.length === 0) {
    return {
      shortSummary: 'Customer opened a support request.',
      keyDetails: ['No messages recorded yet.'],
      customerProblem: 'Pending initial message.',
      suggestedAction: 'Greet the customer and ask how we can assist them.',
    };
  }

  const conversationText = messages
    .map((m) => `${m.senderType.toUpperCase()}: ${m.content}`)
    .join('\n');

  const systemPrompt = `You are a Customer Support Conversation Summarizer.
Analyze the conversation between a customer and the AI / support agent.
Produce a structured summary to help human agents take over quickly.

Respond STRICTLY with a valid JSON object matching this schema:
{
  "shortSummary": "1-2 sentence executive summary of what occurred",
  "keyDetails": ["Key point 1", "Key point 2", "Key point 3"],
  "customerProblem": "Direct statement of the core issue",
  "suggestedAction": "Concrete next step the human support agent should take"
}`;

  const userPrompt = `SUMMARIZE THIS SUPPORT CONVERSATION:
${conversationText}`;

  try {
    const raw = await generateAIResponse({
      systemPrompt,
      userPrompt,
      temperature: 0.2,
      maxTokens: 400,
    });

    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        shortSummary: parsed.shortSummary || 'Customer requested assistance with SkillUp Academy platform.',
        keyDetails: Array.isArray(parsed.keyDetails) ? parsed.keyDetails : ['Assistance requested'],
        customerProblem: parsed.customerProblem || 'Customer needs assistance.',
        suggestedAction: parsed.suggestedAction || 'Review conversation history and respond to customer.',
      };
    }
  } catch (error) {
    logger.warn(`AI Summarization error (${error.message}). Falling back to heuristic summary.`);
  }

  // Fallback summary
  const lastCustomerMessage = [...messages].reverse().find((m) => m.senderType === 'customer')?.content || 'Customer inquiry';

  return {
    shortSummary: `Customer initiated support regarding: "${lastCustomerMessage.substring(0, 80)}..."`,
    keyDetails: [
      `Total messages exchanged: ${messages.length}`,
      `Last customer message: "${lastCustomerMessage.substring(0, 100)}"`,
      'Escalated to human support queue',
    ],
    customerProblem: lastCustomerMessage,
    suggestedAction: 'Review user profile, verify purchase status, and respond via live chat.',
  };
};
