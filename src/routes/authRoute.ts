import { Router } from 'express';
import {
  sendOtp,
  verifyOtpForRegistration,
} from '../controllers/authController';

const router = Router();

router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtpForRegistration);

export default router;
