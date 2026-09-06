import { User } from '../models/User.js';
import { Organization } from '../models/Organization.js';
import { AgentInvitation } from '../models/AgentInvitation.js';
import { Notification } from '../models/Notification.js';
import { Ticket } from '../models/Ticket.js';
import { ApiError } from '../utils/ApiError.js';
import { getIO } from '../socket/socket.js';

/**
 * 1. Global Directory of AVAILABLE Support Agents (for Owners/Admins)
 */
export const getAvailableAgents = async (req, res, next) => {
  try {
    const { search, skill } = req.query;

    const query = {
      role: 'AGENT',
      organizationId: null, // Independent agents only
      status: { $in: ['AVAILABLE', 'active', 'ACTIVE'] },
    };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { bio: { $regex: search, $options: 'i' } },
        { skills: { $regex: search, $options: 'i' } },
      ];
    }

    if (skill && skill !== 'all') {
      query.skills = { $regex: skill, $options: 'i' };
    }

    const agents = await User.find(query)
      .select('_id name avatar bio skills experience languages rating hourlyRate status createdAt')
      .sort({ rating: -1, createdAt: -1 });

    res.status(200).json({
      success: true,
      count: agents.length,
      agents,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 2. Get Public Agent Profile Details
 */
export const getAgentProfileById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const agent = await User.findOne({ _id: id, role: 'AGENT' })
      .select('_id name avatar bio skills experience languages rating hourlyRate status organizationId createdAt')
      .populate('organizationId', 'name slug logo');

    if (!agent) {
      return next(new ApiError(404, 'Support Agent profile not found'));
    }

    res.status(200).json({
      success: true,
      agent,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 3. Send Company Invitation to an Available Agent
 */
export const inviteAgent = async (req, res, next) => {
  try {
    const { id } = req.params; // Agent User ID
    const orgId = req.organizationId;

    if (!orgId) {
      return next(new ApiError(400, 'You must represent an organization to invite agents'));
    }

    const targetAgent = await User.findOne({ _id: id, role: 'AGENT' });
    if (!targetAgent) {
      return next(new ApiError(404, 'Support Agent not found'));
    }

    if (targetAgent.organizationId) {
      return next(new ApiError(400, 'This agent is currently active with another company and cannot be invited.'));
    }

    // Check existing pending invitation
    const existingInvite = await AgentInvitation.findOne({
      organizationId: orgId,
      agentId: targetAgent._id,
      status: 'PENDING',
    });

    if (existingInvite) {
      return next(new ApiError(400, 'An active invitation has already been sent to this agent'));
    }

    const organization = await Organization.findById(orgId);

    const invitation = await AgentInvitation.create({
      organizationId: orgId,
      agentId: targetAgent._id,
      invitedBy: req.user._id,
      status: 'PENDING',
    });

    // Notify Agent
    const notification = await Notification.create({
      organizationId: orgId,
      recipientId: targetAgent._id,
      type: 'agent_invited',
      title: 'New Company Invitation',
      message: `${organization.name} invited you to join their support team as a Support Agent!`,
      link: '/agent/invitations',
    });

    const io = getIO();
    if (io) {
      io.to(`user:${targetAgent._id}`).emit('notification', notification);
      io.to(`user:${targetAgent._id}`).emit('new_invitation', {
        invitationId: invitation._id,
        organization: { name: organization.name, logo: organization.logo },
      });
    }

    res.status(201).json({
      success: true,
      message: `Invitation successfully sent to ${targetAgent.name}`,
      invitation,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 4. Get Agent's Received Invitations
 */
export const getMyInvitations = async (req, res, next) => {
  try {
    const invitations = await AgentInvitation.find({ agentId: req.user._id })
      .populate('organizationId', 'name slug logo description settings')
      .populate('invitedBy', 'name email role')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: invitations.length,
      invitations,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 5. Accept Company Invitation (ONE COMPANY HARD RULE)
 */
export const acceptInvitation = async (req, res, next) => {
  try {
    const { id } = req.params; // Invitation ID

    // HARD BUSINESS RULE: Agent can work for ONLY ONE company at a time
    const agent = await User.findById(req.user._id);
    if (agent.organizationId) {
      return next(
        new ApiError(
          400,
          'You are already working with another company. Leave your current company before accepting a new invitation.'
        )
      );
    }

    const invitation = await AgentInvitation.findOne({
      _id: id,
      agentId: req.user._id,
      status: 'PENDING',
    }).populate('organizationId', 'name ownerId');

    if (!invitation) {
      return next(new ApiError(404, 'Pending invitation not found or has expired'));
    }

    // Set organization and active status
    agent.organizationId = invitation.organizationId._id;
    agent.status = 'ACTIVE';
    await agent.save();

    invitation.status = 'ACCEPTED';
    await invitation.save();

    // Decline any other pending invitations
    await AgentInvitation.updateMany(
      { agentId: agent._id, _id: { $ne: invitation._id }, status: 'PENDING' },
      { status: 'CANCELLED' }
    );

    // Notify Inviter and Owner
    if (invitation.invitedBy) {
      await Notification.create({
        organizationId: invitation.organizationId._id,
        recipientId: invitation.invitedBy,
        type: 'invitation_accepted',
        title: 'Agent Accepted Invitation',
        message: `${agent.name} accepted your invitation and joined ${invitation.organizationId.name}!`,
        link: '/admin/agents',
      });
    }

    const io = getIO();
    if (io) {
      io.to(`org:${invitation.organizationId._id}`).emit('agent_joined', {
        agent: { _id: agent._id, name: agent.name, email: agent.email },
      });
    }

    res.status(200).json({
      success: true,
      message: `You have successfully joined ${invitation.organizationId.name}! You now have full access to company Knowledge Base and Tickets.`,
      organization: invitation.organizationId,
      agent: {
        _id: agent._id,
        name: agent.name,
        role: agent.role,
        status: agent.status,
        organizationId: agent.organizationId,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 6. Decline Company Invitation
 */
export const declineInvitation = async (req, res, next) => {
  try {
    const { id } = req.params;

    const invitation = await AgentInvitation.findOne({
      _id: id,
      agentId: req.user._id,
      status: 'PENDING',
    }).populate('organizationId', 'name');

    if (!invitation) {
      return next(new ApiError(404, 'Pending invitation not found'));
    }

    invitation.status = 'DECLINED';
    await invitation.save();

    if (invitation.invitedBy) {
      await Notification.create({
        organizationId: invitation.organizationId._id,
        recipientId: invitation.invitedBy,
        type: 'invitation_declined',
        title: 'Agent Declined Invitation',
        message: `${req.user.name} declined the invitation to join ${invitation.organizationId.name}.`,
        link: '/admin/agents',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Invitation declined',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 7. Agent Leaves Active Company
 */
export const leaveCompany = async (req, res, next) => {
  try {
    const agent = await User.findById(req.user._id);

    if (!agent.organizationId) {
      return next(new ApiError(400, 'You are not currently working with any company'));
    }

    const orgId = agent.organizationId;
    const organization = await Organization.findById(orgId);

    // Revoke company association immediately
    agent.organizationId = null;
    agent.status = 'AVAILABLE';
    await agent.save();

    // Notify Company Owner
    if (organization?.ownerId) {
      await Notification.create({
        organizationId: orgId,
        recipientId: organization.ownerId,
        type: 'agent_left',
        title: 'Support Agent Left Company',
        message: `${agent.name} has left your company support team.`,
        link: '/admin/agents',
      });
    }

    const io = getIO();
    if (io) {
      io.to(`org:${orgId}`).emit('agent_left', { agentId: agent._id, name: agent.name });
    }

    res.status(200).json({
      success: true,
      message: `You have successfully left ${organization?.name || 'the company'}. You are now available for other company invitations in the Global Directory.`,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 8. Company Owner/Admin Removes Agent
 */
export const removeAgentFromCompany = async (req, res, next) => {
  try {
    const { id } = req.params; // Agent ID
    const orgId = req.organizationId;

    const agent = await User.findOne({ _id: id, organizationId: orgId, role: 'AGENT' });
    if (!agent) {
      return next(new ApiError(404, 'Support Agent not found in your company team'));
    }

    const organization = await Organization.findById(orgId);

    // Revoke company membership immediately
    agent.organizationId = null;
    agent.status = 'AVAILABLE';
    await agent.save();

    // Notify Agent
    const notification = await Notification.create({
      organizationId: null,
      recipientId: agent._id,
      type: 'agent_removed',
      title: 'Company Membership Removed',
      message: `You have been removed from ${organization?.name || 'your company'} support team. You are now available for hire in the Global Directory.`,
      link: '/agent/dashboard',
    });

    const io = getIO();
    if (io) {
      io.to(`user:${agent._id}`).emit('notification', notification);
      io.to(`org:${orgId}`).emit('agent_removed', { agentId: agent._id, name: agent.name });
    }

    res.status(200).json({
      success: true,
      message: `${agent.name} has been removed from your company support team and returned to the Global Directory.`,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 9. Get Active Agents of Current Company with Ticket Stats
 */
export const getCompanyAgents = async (req, res, next) => {
  try {
    const orgId = req.organizationId;

    const agents = await User.find({
      organizationId: orgId,
      role: 'AGENT',
    })
      .select('-passwordHash')
      .sort({ createdAt: -1 })
      .lean();

    const enhancedAgents = await Promise.all(
      agents.map(async (agent) => {
        const [assignedTickets, resolvedTickets] = await Promise.all([
          Ticket.countDocuments({ organizationId: orgId, assignedAgentId: agent._id, status: { $in: ['OPEN', 'HUMAN_REQUIRED', 'open', 'human_required', 'in_progress'] } }),
          Ticket.countDocuments({ organizationId: orgId, assignedAgentId: agent._id, status: { $in: ['RESOLVED', 'resolved', 'closed'] } }),
        ]);

        return {
          ...agent,
          ticketCount: assignedTickets + resolvedTickets,
          activeTickets: assignedTickets,
          resolvedTickets,
        };
      })
    );

    res.status(200).json({
      success: true,
      count: enhancedAgents.length,
      agents: enhancedAgents,
    });
  } catch (error) {
    next(error);
  }
};
