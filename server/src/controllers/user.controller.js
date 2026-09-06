import { User } from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';

export const getUsers = async (req, res, next) => {
  try {
    const { role, search, status } = req.query;
    const query = { organizationId: req.organizationId };

    if (role) query.role = role;
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const users = await User.find(query).select('-passwordHash').sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    next(error);
  }
};

export const getAgents = async (req, res, next) => {
  try {
    const agents = await User.find({
      organizationId: req.organizationId,
      role: 'AGENT',
      status: { $in: ['active', 'ACTIVE'] },
    })
      .select('-passwordHash')
      .sort({ name: 1 });

    res.status(200).json({
      success: true,
      count: agents.length,
      agents,
    });
  } catch (error) {
    next(error);
  }
};

export const createAgent = async (req, res, next) => {
  try {
    const { name, email, password, bio, skills, experience, languages, hourlyRate } = req.body;

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return next(new ApiError(400, 'User with this email already exists'));
    }

    const passwordHash = await User.hashPassword(password || 'SkillUpAgent123!');

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

    const agent = await User.create({
      name,
      email: email.toLowerCase(),
      passwordHash,
      role: 'AGENT',
      organizationId: req.organizationId,
      status: 'ACTIVE',
      bio: bio || '',
      skills: formattedSkills,
      experience: experience || '1 year',
      languages: formattedLanguages,
      hourlyRate: Number(hourlyRate) || 0,
    });

    res.status(201).json({
      success: true,
      message: 'Agent added to company team successfully',
      agent: {
        _id: agent._id,
        name: agent.name,
        email: agent.email,
        role: agent.role,
        status: agent.status,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateAgent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, status, bio, skills, experience, languages, hourlyRate } = req.body;

    const agent = await User.findOne({ _id: id, organizationId: req.organizationId });
    if (!agent) {
      return next(new ApiError(404, 'Agent not found in your organization'));
    }

    if (name) agent.name = name;
    if (status) agent.status = status;
    if (bio !== undefined) agent.bio = bio;
    if (skills) {
      agent.skills = Array.isArray(skills) ? skills : skills.split(',').map((s) => s.trim()).filter(Boolean);
    }
    if (experience) agent.experience = experience;
    if (languages) {
      agent.languages = Array.isArray(languages) ? languages : languages.split(',').map((l) => l.trim()).filter(Boolean);
    }
    if (hourlyRate !== undefined) agent.hourlyRate = Number(hourlyRate);

    await agent.save();

    res.status(200).json({
      success: true,
      message: 'Agent updated successfully',
      agent,
    });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const { name, password, avatar, bio, skills, experience, languages, hourlyRate } = req.body;
    const user = await User.findById(req.user._id).select('+passwordHash');

    if (!user) {
      return next(new ApiError(404, 'User not found'));
    }

    if (name) user.name = name;
    if (avatar !== undefined) user.avatar = avatar;
    if (bio !== undefined) user.bio = bio;
    if (skills) {
      user.skills = Array.isArray(skills) ? skills : skills.split(',').map((s) => s.trim()).filter(Boolean);
    }
    if (experience) user.experience = experience;
    if (languages) {
      user.languages = Array.isArray(languages) ? languages : languages.split(',').map((l) => l.trim()).filter(Boolean);
    }
    if (hourlyRate !== undefined) user.hourlyRate = Number(hourlyRate);

    if (password && password.length >= 6) {
      user.passwordHash = await User.hashPassword(password);
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        bio: user.bio,
        skills: user.skills,
        experience: user.experience,
        languages: user.languages,
        hourlyRate: user.hourlyRate,
        status: user.status,
      },
    });
  } catch (error) {
    next(error);
  }
};
