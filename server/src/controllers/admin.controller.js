import mongoose from 'mongoose';
import { User } from '../models/User.js';
import { Ticket } from '../models/Ticket.js';
import { Conversation } from '../models/Conversation.js';
import { KnowledgeDocument } from '../models/KnowledgeDocument.js';

export const getDashboardAnalytics = async (req, res, next) => {
  try {
    const orgId = req.organizationId;
    const orgObjectId = mongoose.Types.ObjectId.isValid(orgId) ? new mongoose.Types.ObjectId(orgId) : orgId;

    // Counts
    const [
      totalCustomers,
      totalAgents,
      aiOpenTickets,
      resolvedTickets,
      humanRequiredTickets,
      aiResolvedConversations,
      escalatedConversations,
      totalDocuments,
    ] = await Promise.all([
      User.countDocuments({ organizationId: orgId, role: 'CUSTOMER' }),
      User.countDocuments({ organizationId: orgId, role: 'AGENT' }),
      Ticket.countDocuments({ organizationId: orgId, status: { $in: ['OPEN', 'open'] } }),
      Ticket.countDocuments({ organizationId: orgId, status: { $in: ['RESOLVED', 'resolved', 'closed', 'CLOSED'] } }),
      Ticket.countDocuments({ organizationId: orgId, status: { $in: ['HUMAN_REQUIRED', 'human_required', 'in_progress', 'IN_PROGRESS', 'waiting_customer', 'WAITING_CUSTOMER'] } }),
      Conversation.countDocuments({ organizationId: orgId, mode: 'ai', status: { $in: ['RESOLVED', 'resolved', 'closed', 'CLOSED'] } }),
      Conversation.countDocuments({ organizationId: orgId, mode: 'human' }),
      KnowledgeDocument.countDocuments({ organizationId: orgId }),
    ]);

    // Total active open tickets (AI open + Human Required)
    const openTickets = aiOpenTickets + humanRequiredTickets;

    // Categories breakdown
    const categoryStats = await Ticket.aggregate([
      { $match: { organizationId: orgObjectId } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
    ]);

    // Priority breakdown
    const priorityStats = await Ticket.aggregate([
      { $match: { organizationId: orgObjectId } },
      { $group: { _id: '$priority', count: { $sum: 1 } } },
    ]);

    // Recent Tickets
    const recentTickets = await Ticket.find({ organizationId: orgId })
      .populate('customerId', 'name email avatar')
      .populate('assignedAgentId', 'name email avatar')
      .sort({ createdAt: -1 })
      .limit(5);

    // Recent Conversations
    const recentConversations = await Conversation.find({ organizationId: orgId })
      .populate('customerId', 'name email avatar')
      .populate('assignedAgentId', 'name email avatar')
      .sort({ updatedAt: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      analytics: {
        metrics: {
          totalCustomers,
          totalAgents,
          openTickets,
          aiOpenTickets,
          resolvedTickets,
          humanRequiredTickets,
          inProgressTickets: humanRequiredTickets,
          aiResolvedConversations,
          escalatedConversations,
          totalDocuments,
        },
        categoryDistribution: categoryStats.map((c) => ({ name: c._id, value: c.count })),
        priorityDistribution: priorityStats.map((p) => ({ name: p._id, value: p.count })),
        recentTickets,
        recentConversations,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getCustomersWithStats = async (req, res, next) => {
  try {
    const orgId = req.organizationId;
    const { search } = req.query;

    const query = { organizationId: orgId, role: 'CUSTOMER' };
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const customers = await User.find(query).select('-passwordHash').sort({ createdAt: -1 }).lean();

    // Attach ticket counts & conversation counts for each customer
    const enhancedCustomers = await Promise.all(
      customers.map(async (cust) => {
        const [ticketCount, conversationCount] = await Promise.all([
          Ticket.countDocuments({ organizationId: orgId, customerId: cust._id }),
          Conversation.countDocuments({ organizationId: orgId, customerId: cust._id }),
        ]);

        return {
          ...cust,
          ticketCount,
          conversationCount,
        };
      })
    );

    res.status(200).json({
      success: true,
      count: enhancedCustomers.length,
      customers: enhancedCustomers,
    });
  } catch (error) {
    next(error);
  }
};
