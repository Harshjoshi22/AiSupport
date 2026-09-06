import { User } from '../models/User.js';
import { Organization } from '../models/Organization.js';
import { AdminJoinRequest } from '../models/AdminJoinRequest.js';
import { Notification } from '../models/Notification.js';
import { generateToken } from '../utils/generateToken.js';
import { generateAdminJoinKey, hashJoinKey, verifyJoinKey } from '../utils/keyGenerator.js';
import { ApiError } from '../utils/ApiError.js';
import { getIO } from '../socket/socket.js';

// Helper to create a slug from company name
const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
};

/**
 * 1. Register Company (First company creation by Owner)
 */
export const registerCompany = async (req, res, next) => {
  try {
    const { companyName, name, email, password, description = '', supportEmail } = req.body;

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return next(new ApiError(400, 'User with this email already exists'));
    }

    // Generate unique slug
    let baseSlug = slugify(companyName);
    let slug = baseSlug;
    let counter = 1;
    while (await Organization.findOne({ slug })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    // Generate Admin Join Key
    const plainJoinKey = generateAdminJoinKey();
    const adminJoinKeyHash = await hashJoinKey(plainJoinKey);

    // 1. Create Organization
    const organization = await Organization.create({
      name: companyName.trim(),
      slug,
      description: description || `Official support workspace for ${companyName}`,
      adminJoinKeyHash,
      adminJoinKeyDisplay: plainJoinKey,
      settings: {
        supportEmail: supportEmail || `support@${slug}.com`,
      },
    });

    // 2. Create Owner User
    const passwordHash = await User.hashPassword(password);
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase(),
      passwordHash,
      role: 'OWNER',
      organizationId: organization._id,
      status: 'active',
    });

    // 3. Link Owner to Organization
    organization.ownerId = user._id;
    await organization.save();

    const token = generateToken(user._id, user.role, organization._id);

    res.status(201).json({
      success: true,
      message: 'Company workspace created successfully',
      token,
      adminJoinKey: plainJoinKey,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        organizationId: organization._id,
        organization: {
          _id: organization._id,
          name: organization.name,
          slug: organization.slug,
          logo: organization.logo,
          adminJoinKeyDisplay: organization.adminJoinKeyDisplay,
          settings: organization.settings,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 2. Register Independent Support Agent (Global Directory)
 */
export const registerAgent = async (req, res, next) => {
  try {
    const { name, email, password, bio = '', skills = [], experience = '1 year', languages = ['English'], hourlyRate = 0 } = req.body;

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return next(new ApiError(400, 'User with this email already exists'));
    }

    const passwordHash = await User.hashPassword(password);

    // Format skills if sent as comma-separated string
    const formattedSkills = Array.isArray(skills)
      ? skills
      : typeof skills === 'string'
      ? skills.split(',').map((s) => s.trim()).filter(Boolean)
      : [];

    const formattedLanguages = Array.isArray(languages)
      ? languages
      : typeof languages === 'string'
      ? languages.split(',').map((l) => l.trim()).filter(Boolean)
      : ['English'];

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase(),
      passwordHash,
      role: 'AGENT',
      organizationId: null, // Independent agent initially
      status: 'AVAILABLE',
      bio,
      skills: formattedSkills,
      experience,
      languages: formattedLanguages,
      rating: 5.0,
      hourlyRate: Number(hourlyRate) || 0,
    });

    const token = generateToken(user._id, user.role, null);

    res.status(201).json({
      success: true,
      message: 'Support Agent profile created successfully. You are now available in the Global Directory.',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        bio: user.bio,
        skills: user.skills,
        experience: user.experience,
        languages: user.languages,
        rating: user.rating,
        organizationId: null,
        organization: null,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 3. Request Admin Join using Company Admin Join Key
 */
export const requestAdminJoin = async (req, res, next) => {
  try {
    const { name, email, password, adminJoinKey } = req.body;

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return next(new ApiError(400, 'User with this email already exists'));
    }

    // Find organization matching the admin join key
    const cleanKey = adminJoinKey.trim().toUpperCase();
    const organizations = await Organization.find().select('+adminJoinKeyHash');

    let matchedOrg = null;
    for (const org of organizations) {
      if (org.adminJoinKeyDisplay && org.adminJoinKeyDisplay.toUpperCase() === cleanKey) {
        matchedOrg = org;
        break;
      }
      if (org.adminJoinKeyHash) {
        const isMatch = await verifyJoinKey(cleanKey, org.adminJoinKeyHash);
        if (isMatch) {
          matchedOrg = org;
          break;
        }
      }
    }

    if (!matchedOrg) {
      return next(new ApiError(400, 'Invalid Company Admin Join Key. Please check the key provided by your company owner.'));
    }

    const passwordHash = await User.hashPassword(password);

    // Create user in pending_approval status
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase(),
      passwordHash,
      role: 'ADMIN',
      organizationId: null, // Not yet part of the organization until approved
      status: 'pending_approval',
    });

    // Create AdminJoinRequest
    const joinRequest = await AdminJoinRequest.create({
      organizationId: matchedOrg._id,
      userId: user._id,
      status: 'PENDING',
    });

    // Notify Company Owner
    if (matchedOrg.ownerId) {
      const notification = await Notification.create({
        organizationId: matchedOrg._id,
        recipientId: matchedOrg.ownerId,
        type: 'admin_request',
        title: 'New Admin Join Request',
        message: `${name} (${email}) requested to join ${matchedOrg.name} as an Administrator.`,
        link: '/admin/team',
      });

      const io = getIO();
      if (io) {
        io.to(`user:${matchedOrg.ownerId}`).emit('notification', notification);
        io.to(`org:${matchedOrg._id}`).emit('new_admin_request', {
          requestId: joinRequest._id,
          user: { name: user.name, email: user.email },
        });
      }
    }

    res.status(201).json({
      success: true,
      message: `Admin join request submitted for ${matchedOrg.name}. Awaiting Owner approval.`,
      status: 'PENDING',
      companyName: matchedOrg.name,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 4. Register Customer via Company Support Link (/support/:slug)
 */
export const registerCustomerWithSlug = async (req, res, next) => {
  try {
    const { name, email, password, organizationSlug } = req.body;

    if (!organizationSlug) {
      return next(new ApiError(400, 'Company support slug is required'));
    }

    const organization = await Organization.findOne({ slug: organizationSlug.toLowerCase().trim() });
    if (!organization) {
      return next(new ApiError(404, `No company workspace found for support link "/support/${organizationSlug}"`));
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return next(new ApiError(400, 'User with this email already exists'));
    }

    const passwordHash = await User.hashPassword(password);

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase(),
      passwordHash,
      role: 'CUSTOMER',
      organizationId: organization._id,
      status: 'active',
    });

    const token = generateToken(user._id, user.role, organization._id);

    res.status(201).json({
      success: true,
      message: `Welcome to ${organization.name} AI Support!`,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        organizationId: organization._id,
        organization: {
          _id: organization._id,
          name: organization.name,
          slug: organization.slug,
          logo: organization.logo,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Legacy / Default Register fallback
 */
export const register = async (req, res, next) => {
  try {
    const { name, email, password, role = 'CUSTOMER', organizationSlug = 'skillup-academy' } = req.body;

    // Reject privileged roles through generic registration
    if (role === 'OWNER' || role === 'ADMIN') {
      return next(new ApiError(400, 'Privileged accounts cannot be created through generic registration. Please use the appropriate company creation or admin join flow.'));
    }

    if (role === 'AGENT') {
      return registerAgent(req, res, next);
    }

    // Customer registration
    return registerCustomerWithSlug(req, res, next);
  } catch (error) {
    next(error);
  }
};

/**
 * Universal Login with Multi-Tenant Slug Validation
 */
export const login = async (req, res, next) => {
  try {
    const { email, password, organizationSlug } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() })
      .select('+passwordHash')
      .populate('organizationId', 'name slug logo settings description ownerId adminJoinKeyDisplay');

    if (!user) {
      return next(new ApiError(401, 'Invalid email or password'));
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return next(new ApiError(401, 'Invalid email or password'));
    }

    if (user.status === 'pending_approval') {
      return next(new ApiError(403, 'Your admin access request is pending approval by the company owner.'));
    }

    const allowedStatuses = ['active', 'ACTIVE', 'AVAILABLE'];
    if (!allowedStatuses.includes(user.status)) {
      return next(new ApiError(403, 'Your account is deactivated. Please contact support.'));
    }

    // Multi-tenant check for customers logging in via a company support page
    if (organizationSlug && user.role === 'CUSTOMER') {
      if (!user.organizationId || user.organizationId.slug !== organizationSlug.toLowerCase().trim()) {
        return next(
          new ApiError(
            403,
            `This account belongs to another company's support system (${user.organizationId?.name || 'Different Workspace'}). Please use your company's dedicated support link.`
          )
        );
      }
    }

    const token = generateToken(user._id, user.role, user.organizationId?._id || null);

    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      avatar: user.avatar,
      bio: user.bio,
      skills: user.skills,
      experience: user.experience,
      languages: user.languages,
      rating: user.rating,
      hourlyRate: user.hourlyRate,
      organizationId: user.organizationId?._id || null,
      organization: user.organizationId || null,
    };

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: userResponse,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Logout
 */
export const logout = async (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
};

/**
 * Get Current User Profile
 */
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate(
      'organizationId',
      'name slug logo settings description ownerId adminJoinKeyDisplay'
    );

    if (!user) {
      return next(new ApiError(404, 'User not found'));
    }

    res.status(200).json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        avatar: user.avatar,
        bio: user.bio,
        skills: user.skills,
        experience: user.experience,
        languages: user.languages,
        rating: user.rating,
        hourlyRate: user.hourlyRate,
        organizationId: user.organizationId?._id || null,
        organization: user.organizationId || null,
      },
    });
  } catch (error) {
    next(error);
  }
};
