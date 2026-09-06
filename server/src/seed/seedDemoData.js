import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

// Load env
dotenv.config({ path: path.resolve('server/.env') });
if (!process.env.MONGODB_URI) {
  dotenv.config();
}

import { Organization } from '../models/Organization.js';
import { User } from '../models/User.js';
import { KnowledgeDocument } from '../models/KnowledgeDocument.js';
import { KnowledgeChunk } from '../models/KnowledgeChunk.js';
import { Conversation } from '../models/Conversation.js';
import { Message } from '../models/Message.js';
import { Ticket } from '../models/Ticket.js';
import { AdminJoinRequest } from '../models/AdminJoinRequest.js';
import { AgentInvitation } from '../models/AgentInvitation.js';
import { Notification } from '../models/Notification.js';
import { generateEmbedding } from '../services/knowledge/embeddingService.js';
import { chunkText } from '../services/knowledge/textChunker.js';
import { hashJoinKey } from '../utils/keyGenerator.js';
import { logger } from '../utils/logger.js';

const seed = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ai_supporthub';
    logger.info(`Connecting to database for seeding: ${mongoUri}`);
    await mongoose.connect(mongoUri);
    logger.success('Connected to database.');

    logger.warn('Resetting database collections...');
    await Promise.all([
      Organization.deleteMany({}),
      User.deleteMany({}),
      KnowledgeDocument.deleteMany({}),
      KnowledgeChunk.deleteMany({}),
      Conversation.deleteMany({}),
      Message.deleteMany({}),
      Ticket.deleteMany({}),
      AdminJoinRequest.deleteMany({}),
      AgentInvitation.deleteMany({}),
      Notification.deleteMany({}),
    ]);

    const defaultPassword = 'Password123!';
    const passwordHash = await User.hashPassword(defaultPassword);

    // =========================================================================
    // 1. COMPANY A: SKILLUP ACADEMY
    // =========================================================================
    logger.info('Creating Company A: SkillUp Academy...');
    const skillupKey = 'SKILL-92FK-XP81';
    const skillupKeyHash = await hashJoinKey(skillupKey);

    const skillupOrg = await Organization.create({
      name: 'SkillUp Academy',
      slug: 'skillup-academy',
      description: 'Premier online programming, full-stack development, and tech career courses.',
      logo: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=150&auto=format&fit=crop&q=80',
      adminJoinKeyHash: skillupKeyHash,
      adminJoinKeyDisplay: skillupKey,
      settings: {
        supportEmail: 'support@skillupacademy.dev',
        businessHours: 'Monday - Friday, 9:00 AM - 6:00 PM IST',
        aiModel: 'gemini-1.5-flash',
        aiTemperature: 0.2,
        aiConfidenceThreshold: 0.65,
        autoEscalateOnNegativeSentiment: true,
        allowCustomerTicketCreation: true,
      },
    });

    // Company A Users
    const skillupOwner = await User.create({
      name: 'Priya Sharma (Owner)',
      email: 'owner@skillupacademy.dev',
      passwordHash,
      role: 'OWNER',
      organizationId: skillupOrg._id,
      status: 'active',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    });

    skillupOrg.ownerId = skillupOwner._id;
    await skillupOrg.save();

    const skillupAdmin = await User.create({
      name: 'Rohit Verma (Admin)',
      email: 'admin@skillupacademy.dev',
      passwordHash,
      role: 'ADMIN',
      organizationId: skillupOrg._id,
      status: 'active',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    });

    const skillupAgent1 = await User.create({
      name: 'Ananya Gupta',
      email: 'agent.priya@skillupacademy.dev',
      passwordHash,
      role: 'AGENT',
      organizationId: skillupOrg._id,
      status: 'ACTIVE',
      bio: 'Senior Technical Support Engineer specializing in MERN stack, Node.js backend debugging, and React architecture.',
      skills: ['MERN Stack', 'Node.js', 'React', 'MongoDB', 'REST APIs'],
      experience: '4 years',
      languages: ['English', 'Hindi'],
      rating: 4.9,
      hourlyRate: 35,
      
    });

    

    const skillupCustomer1 = await User.create({
      name: 'Aarav Patel',
      email: 'customer.aarav@gmail.com',
      passwordHash,
      role: 'CUSTOMER',
      organizationId: skillupOrg._id,
      status: 'active',

    });

   

    // Company A Knowledge Articles
    logger.info('Indexing Knowledge Base for SkillUp Academy...');
    const skillupArticles = [
      {
        title: 'SkillUp Course Catalog & Pricing',
        category: 'Courses',
        tags: ['courses', 'pricing', 'mern', 'java', 'python', 'dsa'],
        content: `SkillUp Academy offers industry-aligned software engineering courses:
1. Full Stack MERN Bootcamp: $499 (MongoDB, Express, React, Node.js, TypeScript, Next.js, Redux, 6 months access).
2. Master Java & Spring Boot: $449 (Core Java, Spring Boot 3, Microservices, Hibernate, AWS deployment).
3. Data Structures & Algorithms (DSA): $299 (250+ LeetCode problems, graph algorithms, dynamic programming).
4. Python for AI & Data Science: $399 (NumPy, Pandas, PyTorch, LangChain, RAG architectures).
All programs include verified completion certificates, lifetime Discord community access, and 1-on-1 weekly mentor code reviews.`,
      },
      {
        title: 'Official Refund & Cancellation Policy',
        category: 'Refund Policy',
        tags: ['refund', 'cancellation', 'money-back', 'policy'],
        content: `SkillUp Academy provides a 100% money-back guarantee within 7 days of purchase if you have completed less than 20% of the video coursework.
To request a refund:
1. Navigate to your Student Dashboard -> Profile -> Billing, or contact support@skillupacademy.dev.
2. Provide your order ID and reason for refund.
3. Refunds are processed to the original payment method within 5-7 business days.
4. Refunds requested after 7 days or after accessing over 20% of the curriculum are non-refundable.`,
      },
      {
        title: 'Certificate Verification & LMS Access',
        category: 'Account',
        tags: ['certificate', 'login', 'lms', 'verification'],
        content: `Upon 100% completion of course lessons, quizzes, and capstone project review, your digital certificate is automatically generated.
- Certificates can be verified online at https://skillupacademy.dev/verify/:certificateId.
- LMS Access is valid for 2 full years from enrollment date.
- Video lectures can be downloaded offline using the mobile app.`,
      },
    ];

    for (const item of skillupArticles) {
      const doc = await KnowledgeDocument.create({
        organizationId: skillupOrg._id,
        title: item.title,
        category: item.category,
        tags: item.tags,
        rawContent: item.content,
        processingStatus: 'completed',
        sourceType: 'manual',
      });

      const chunks = chunkText(item.content, { chunkSize: 350, overlap: 50 });
      const chunkDocs = [];
      for (let i = 0; i < chunks.length; i++) {
        const embedding = await generateEmbedding(chunks[i]);
        chunkDocs.push({
          organizationId: skillupOrg._id,
          documentId: doc._id,
          content: chunks[i],
          embedding,
          metadata: {
            title: doc.title,
            chunkIndex: i,
            totalChunks: chunks.length,
            category: doc.category,
            tags: doc.tags,
          },
        });
      }
      await KnowledgeChunk.insertMany(chunkDocs);
      doc.chunkCount = chunkDocs.length;
      await doc.save();
    }
    process.exit(0);
  } catch (error) {
    logger.error(`Seed error: ${error.message}`);
    console.error(error);
    process.exit(1);
  }
};

seed();
