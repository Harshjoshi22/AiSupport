import { Organization } from '../models/Organization.js';
import { ApiError } from '../utils/ApiError.js';

export const getPublicOrganizationBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const org = await Organization.findOne({ slug: slug.toLowerCase().trim() }).select(
      '_id name slug description logo settings.supportEmail settings.businessHours'
    );

    if (!org) {
      return next(new ApiError(404, `Support workspace for "/support/${slug}" not found`));
    }

    res.status(200).json({
      success: true,
      organization: org,
    });
  } catch (error) {
    next(error);
  }
};

export const getMyOrganization = async (req, res, next) => {
  try {
    const org = await Organization.findById(req.organizationId);
    if (!org) {
      return next(new ApiError(404, 'Organization not found'));
    }

    res.status(200).json({
      success: true,
      organization: org,
    });
  } catch (error) {
    next(error);
  }
};

export const updateMyOrganization = async (req, res, next) => {
  try {
    const { name, description, logo, settings } = req.body;
    const org = await Organization.findById(req.organizationId);

    if (!org) {
      return next(new ApiError(404, 'Organization not found'));
    }

    if (name) org.name = name;
    if (description !== undefined) org.description = description;
    if (logo !== undefined) org.logo = logo;
    if (settings) {
      org.settings = {
        ...org.settings.toObject(),
        ...settings,
      };
    }

    await org.save();

    res.status(200).json({
      success: true,
      message: 'Organization settings updated successfully',
      organization: org,
    });
  } catch (error) {
    next(error);
  }
};
