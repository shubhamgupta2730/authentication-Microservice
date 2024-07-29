import { Router } from 'express';
import { authMiddleware } from '../../../middlewares/authMiddleware';
import { signup } from '../controllers/signupController';
import { verifyOTPController } from '../controllers/OTPVerifyController';
import { signIn } from '../controllers/signinController';
import { updateAuthenticationMethod } from '../controllers/authMethodController';
import { updatePhoneNumber } from '../controllers/updatePhoneController';
import { updateEmail } from '../controllers/updateEmailController';
import { forgotPassword } from '../controllers/forgotPasswordController';
import { resetPassword } from '../controllers/resetPasswordController';
import { changePassword } from '../controllers/changePasswordController';
import { viewProfile } from '../controllers/viewProfileController';
import { updateProfile } from '../controllers/updateProfileController';
const router = Router();

router.post('/signup', signup);
router.post('/verify-otp', verifyOTPController);
router.post('/sign-in', signIn);
router.post('/update-auth-method', authMiddleware, updateAuthenticationMethod);
router.put('/update-phone-number', authMiddleware, updatePhoneNumber);
router.put('/update-email', authMiddleware, updateEmail);
router.post('/forgot-password', forgotPassword);
router.put('/reset-password', resetPassword);
router.put('/change-password', authMiddleware, changePassword);
router.get('/view-profile', authMiddleware, viewProfile);
router.put('/update-profile', authMiddleware, updateProfile);

export default router;
