import { Router } from 'express';
import { authMiddleware } from '../../../middlewares/authMiddleware';
import { registerUser } from '../controllers/registerController';
import { verifyOTPController } from '../controllers/OTPVerifyController';
import { loginController } from '../controllers/loginController';
import { updateAuthenticationMethod } from '../controllers/authMethodController';
import { updatePhoneNumber } from '../controllers/updatePhoneController';
import { updateEmail } from '../controllers/updateEmailController';
import { forgotPasswordLink } from '../controllers/forgotPasswordLink';
import { resetPassword } from '../controllers/forgotPasswordController';
import { changePassword } from '../controllers/changePasswordController';

const router = Router();

router.post('/register', registerUser);
router.post('/verify-otp', verifyOTPController);
router.post('/login', loginController);
router.post('/update-auth-method', updateAuthenticationMethod);
router.put('/update-phone-number', authMiddleware, updatePhoneNumber);
router.put('/update-email', authMiddleware, updateEmail);
router.post('/forgot-password-link', forgotPasswordLink);
router.put('/reset-password', resetPassword);
router.put('/change-password', authMiddleware, changePassword);

export default router;
