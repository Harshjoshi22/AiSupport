import { generateAIResponse } from './aiProvider.js';
import { logger } from '../../utils/logger.js';

export const classifyTicket = async ({ title, description, conversationContext = '' }) => {
  const systemPrompt = `You are an AI Support Ticket Classifier.
Your job is to analyze support requests and classify them accurately.

Valid Categories:
- "Billing" (Payment errors, duplicate charges, invoices, receipts)
- "Technical" (Video playback issues, IDE bugs, website crashes, server errors)
- "Account" (Login problems, password resets, profile email updates)
- "Course/Product" (Course curriculum, syllabus questions, instructor info, prerequisites)
- "Refund" (Refund requests, cancellation, money-back policy claims)
- "General" (General inquiries, partnerships, feedback)

Valid Priorities:
- "Urgent" (Account compromised, duplicate high-value transaction, widespread system outage)
- "High" (Course access completely blocked after payment, refund request within 7 days, critical video bug)
- "Medium" (General course inquiry, minor bug, payment question before buying)
- "Low" (Feedback, feature request, general suggestions)

Respond STRICTLY with a valid JSON object matching this schema:
{
  "category": "Billing" | "Technical" | "Account" | "Course/Product" | "Refund" | "General",
  "priority": "Low" | "Medium" | "High" | "Urgent",
  "reasoning": "Short 1-sentence rationale"
}`;

  const userPrompt = `CLASSIFY THIS SUPPORT REQUEST:
Title: ${title}
Description: ${description}
Recent Context: ${conversationContext || 'None'}`;

  try {
    const rawResponse = await generateAIResponse({
      systemPrompt,
      userPrompt,
      temperature: 0.1,
      maxTokens: 200,
    });

    const jsonMatch = rawResponse.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        category: ['Billing', 'Technical', 'Account', 'Course/Product', 'Refund', 'General'].includes(parsed.category)
          ? parsed.category
          : 'General',
        priority: ['Low', 'Medium', 'High', 'Urgent'].includes(parsed.priority) ? parsed.priority : 'Medium',
        reasoning: parsed.reasoning || '',
      };
    }
  } catch (error) {
    logger.warn(`AI classification error (${error.message}). Using rule-based fallback.`);
  }

  // Robust Rule-based fallback
  const text = `${title} ${description}`.toLowerCase();
  let category = 'General';
  let priority = 'Medium';

  if (text.includes('refund') || text.includes('money back') || text.includes('cancel purchase')) {
    category = 'Refund';
    priority = 'High';
  } else if (text.includes('payment') || text.includes('charged') || text.includes('billing') || text.includes('invoice')) {
    category = 'Billing';
    priority = text.includes('double') || text.includes('twice') ? 'Urgent' : 'High';
  } else if (text.includes('password') || text.includes('login') || text.includes('account') || text.includes('auth')) {
    category = 'Account';
    priority = 'High';
  } else if (text.includes('error') || text.includes('crash') || text.includes('bug') || text.includes('cannot access') || text.includes('video not playing')) {
    category = 'Technical';
    priority = 'High';
  } else if (text.includes('course') || text.includes('mern') || text.includes('java') || text.includes('python') || text.includes('dsa') || text.includes('syllabus')) {
    category = 'Course/Product';
    priority = 'Low';
  }

  return { category, priority, reasoning: 'Classified using intelligent support heuristics' };
};
