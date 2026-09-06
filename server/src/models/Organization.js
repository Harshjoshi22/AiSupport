import mongoose from 'mongoose';

const organizationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Organization name is required'],
      trim: true,
      unique: true,
      maxlength: [100, 'Organization name cannot exceed 100 characters'],
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    adminJoinKeyHash: {
      type: String,
      default: '',
      select: false,
    },
    // Raw key display for the organization owner's dashboard convenience
    adminJoinKeyDisplay: {
      type: String,
      default: '',
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    logo: {
      type: String,
      default: '',
    },
    settings: {
      supportEmail: {
        type: String,
        default: 'support@skillupacademy.dev',
      },
      businessHours: {
        type: String,
        default: 'Monday - Friday, 9:00 AM - 6:00 PM IST',
      },
      aiModel: {
        type: String,
        default: 'gemini-1.5-flash',
      },
      aiTemperature: {
        type: Number,
        default: 0.2,
      },
      aiConfidenceThreshold: {
        type: Number,
        default: 0.65,
      },
      autoEscalateOnNegativeSentiment: {
        type: Boolean,
        default: true,
      },
      allowCustomerTicketCreation: {
        type: Boolean,
        default: true,
      },
    },
  },
  {
    timestamps: true,
  }
);

export const Organization = mongoose.model('Organization', organizationSchema);
