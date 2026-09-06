import express from 'express';
import {
  registerCompany,
  registerAgent,
  requestAdminJoin,
  registerCustomerWithSlug,
  register,
  login,
  logout,
  getMe,
} from '../controllers/auth.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import {
  validateRegisterCompany,
  validateRegisterAgent,
  validateAdminJoinRequest,
  validateCustomerRegister,
  validateRegister,
  validateLogin,
} from '../validators/auth.validator.js';

const router = express.Router();

router.post('/register-company', validateRegisterCompany, registerCompany);
router.post('/register-agent', validateRegisterAgent, registerAgent);
router.post('/request-admin', validateAdminJoinRequest, requestAdminJoin);
router.post('/register-customer', validateCustomerRegister, registerCustomerWithSlug);
router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);
router.post('/logout', logout);
router.get('/me', protect, getMe);

export default router;
