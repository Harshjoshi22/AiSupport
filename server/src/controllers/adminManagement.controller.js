import { User } from '../models/User.js';
import { Organization } from '../models/Organization.js';
import { AdminJoinRequest } from '../models/AdminJoinRequest.js';
import { Notification } from '../models/Notification.js';
import { generateAdminJoinKey, hashJoinKey } from '../utils/keyGenerator.js';
import { ApiError } from '../utils/ApiError.js';
import { getIO } from '../socket/socket.js';

/**
 * 1. Get Pending Admin Join Requests for Organization (Owner only)
 */
export const getAdminRequests = async (req, res, next) => {
  try {
    const orgId = req.organizationId;

    const requests = await AdminJoinRequest.find({ organizationId: orgId })
      .populate('userId', 'name email avatar status createdAt')
      .populate('reviewedBy', 'name email')
      .sort({ requestedAt: -1 });

    res.status(200).json({
      success: true,
      count: requests.length,
      requests,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 2. Approve Admin Join Request (Owner only)
 */
export const approveAdminRequest = async (req, res, next) => {
  try {
    const { id } = req.params;
    const orgId = req.organizationId;

    const joinRequest = await AdminJoinRequest.findOne({
      _id: id,
      organizationId: orgId,
      status: 'PENDING',
    }).populate('userId');

    if (!joinRequest) {
      return next(new ApiError(404, 'Pending admin request not found'));
    }

    const organization = await Organization.findById(orgId);
    if (!organization) {
      return next(new ApiError(404, 'Organization not found'));
    }

    let candidateUser = joinRequest.userId;
    if (!candidateUser || !candidateUser._id) {
      // If population did not return user document, attempt direct fetch
      candidateUser = await User.findById(joinRequest.userId);
    }

    if (!candidateUser) {
      return next(new ApiError(404, 'The candidate user for this admin request no longer exists.'));
    }

    // Grant Admin Role and assign organizationId
    candidateUser.role = 'ADMIN';
    candidateUser.organizationId = orgId;
    candidateUser.status = 'active';
    await candidateUser.save();

    joinRequest.status = 'APPROVED';
    joinRequest.reviewedBy = req.user._id;
    joinRequest.reviewedAt = new Date();
    await joinRequest.save();

    // Notify approved user
    const notification = await Notification.create({
      organizationId: orgId,
      recipientId: candidateUser._id,
      type: 'admin_approved',
      title: 'Admin Access Approved!',
      message: `Your request to join ${organization.name} as an Administrator has been approved by the company owner.`,
      link: '/admin/dashboard',
    });

    const io = getIO();
    if (io) {
      io.to(`user:${candidateUser._id}`).emit('notification', notification);
      io.to(`user:${candidateUser._id}`).emit('admin_status_updated', { status: 'APPROVED' });
    }

    res.status(200).json({
      success: true,
      message: `${candidateUser.name} is now an approved Administrator for ${organization.name}.`,
      request: joinRequest,
      admin: {
        _id: candidateUser._id,
        name: candidateUser.name,
        email: candidateUser.email,
        role: candidateUser.role,
        status: candidateUser.status,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 3. Reject Admin Join Request (Owner only)
 */
export const rejectAdminRequest = async (req, res, next) => {
  try {
    const { id } = req.params;
    const orgId = req.organizationId;

    const joinRequest = await AdminJoinRequest.findOne({
      _id: id,
      organizationId: orgId,
      status: 'PENDING',
    }).populate('userId');

    if (!joinRequest) {
      return next(new ApiError(404, 'Pending admin request not found'));
    }

    const organization = await Organization.findById(orgId);
    let candidateUser = joinRequest.userId;
    if (!candidateUser || !candidateUser._id) {
      candidateUser = await User.findById(joinRequest.userId);
    }

    if (candidateUser) {
      candidateUser.status = 'inactive';
      await candidateUser.save();
    }

    joinRequest.status = 'REJECTED';
    joinRequest.reviewedBy = req.user._id;
    joinRequest.reviewedAt = new Date();
    await joinRequest.save();

    // Notify rejected user
    if (candidateUser) {
      const notification = await Notification.create({
        organizationId: orgId,
        recipientId: candidateUser._id,
        type: 'admin_rejected',
        title: 'Admin Request Declined',
        message: `Your request to join ${organization?.name || 'the company'} as an Administrator was not approved.`,
      });

      const io = getIO();
      if (io) {
        io.to(`user:${candidateUser._id}`).emit('notification', notification);
        io.to(`user:${candidateUser._id}`).emit('admin_status_updated', { status: 'REJECTED' });
      }
    }

    res.status(200).json({
      success: true,
      message: `Admin join request has been rejected.`,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 4. Get All Admins and Owner of Current Organization
 */
export const getCompanyAdmins = async (req, res, next) => {
  try {
    const orgId = req.organizationId;

    const admins = await User.find({
      organizationId: orgId,
      role: { $in: ['OWNER', 'ADMIN'] },
    })
      .select('-passwordHash')
      .sort({ role: 1, createdAt: 1 });

    res.status(200).json({
      success: true,
      count: admins.length,
      admins,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 5. Remove Admin from Organization (Owner only)
 */
export const removeAdmin = async (req, res, next) => {
  try {
    const { id } = req.params;
    const orgId = req.organizationId;

    const admin = await User.findOne({ _id: id, organizationId: orgId });
    if (!admin) {
      return next(new ApiError(404, 'Admin not found in your organization'));
    }

    // Owner cannot be removed
    if (admin.role === 'OWNER') {
      return next(new ApiError(403, 'The Organization Owner cannot be removed.'));
    }

    const organization = await Organization.findById(orgId);

    // Revoke Admin permissions and remove company access immediately
    admin.organizationId = null;
    admin.role = 'CUSTOMER';
    admin.status = 'inactive';
    await admin.save();

    const notification = await Notification.create({
      organizationId: null,
      recipientId: admin._id,
      type: 'admin_removed',
      title: 'Administrator Access Revoked',
      message: `Your administrator access for ${organization.name} has been revoked by the company owner.`,
    });

    const io = getIO();
    if (io) {
      io.to(`user:${admin._id}`).emit('notification', notification);
      io.to(`user:${admin._id}`).emit('role_revoked', {});
    }

    res.status(200).json({
      success: true,
      message: `${admin.name} has been removed as an administrator.`,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 6. View Admin Join Key (Owner only)
 */
export const getAdminJoinKey = async (req, res, next) => {
  try {
    const org = await Organization.findById(req.organizationId);
    if (!org) {
      return next(new ApiError(404, 'Organization not found'));
    }

    res.status(200).json({
      success: true,
      adminJoinKey: org.adminJoinKeyDisplay || 'Contact support to generate join key',
      companyName: org.name,
      slug: org.slug,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 7. Regenerate Admin Join Key (Owner only)
 */
export const regenerateAdminJoinKey = async (req, res, next) => {
  try {
    const org = await Organization.findById(req.organizationId);
    if (!org) {
      return next(new ApiError(404, 'Organization not found'));
    }

    const newKey = generateAdminJoinKey();
    const newHash = await hashJoinKey(newKey);

    org.adminJoinKeyHash = newHash;
    org.adminJoinKeyDisplay = newKey;
    await org.save();

    res.status(200).json({
      success: true,
      message: 'Admin Join Key regenerated successfully. Previous keys will no longer work.',
      adminJoinKey: newKey,
    });
  } catch (error) {
    next(error);
  }
};
