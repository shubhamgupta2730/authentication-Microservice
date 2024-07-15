import { Router } from 'express';

import { registerUser } from '../controllers/registerController';
import { verifyOTPController } from '../controllers/OTPVerifyController';
import { loginController } from '../controllers/loginController';

const router = Router();

router.post('/register', registerUser);
router.post('/verify-otp', verifyOTPController);
router.post('/login', loginController);

export default router;
