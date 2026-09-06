import express from 'express';
import {
  getKnowledgeList,
  createKnowledge,
  uploadKnowledgeDocument,
  updateKnowledge,
  deleteKnowledge,
  testKnowledgeSearch,
} from '../controllers/knowledge.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { requireAdmin, requireAgentOrAdmin } from '../middleware/role.middleware.js';
import { upload } from '../middleware/upload.middleware.js';
import { validateCreateKnowledge } from '../validators/knowledge.validator.js';

const router = express.Router();

router.use(protect);

router.get('/', getKnowledgeList);
router.post('/', requireAdmin, validateCreateKnowledge, createKnowledge);
router.post('/upload', requireAdmin, upload.single('file'), uploadKnowledgeDocument);
router.post('/search', requireAgentOrAdmin, testKnowledgeSearch);
router.put('/:id', requireAdmin, updateKnowledge);
router.delete('/:id', requireAdmin, deleteKnowledge);

export default router;
