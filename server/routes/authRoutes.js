const express = require('express');
const asyncHandler = require('../middlewares/asyncHandler');
const validate = require('../middlewares/validationHandler');
const { authHandler } = require('../middlewares/authHandler');
const { authLimiter, loginLimiter } = require('../middlewares/rateLimiter');
const ctrl = require('../controllers/identity/authController');
const mfa = require('../controllers/identity/mfaController');
const {
  registerSchema, loginSchema, emailOnlySchema, verifySchema, resetSchema,
  mfaCodeSchema, mfaDisableSchema, mfaVerifySchema,
} = require('../validators/authValidator');

const router = express.Router();

// Throttle the whole auth surface; add a stricter per-account lockout on login.
router.use(authLimiter);

router.post('/register', validate(registerSchema), asyncHandler(ctrl.register));
router.post('/verify-email', validate(verifySchema), asyncHandler(ctrl.verifyEmail));
router.post('/resend-verification', validate(emailOnlySchema), asyncHandler(ctrl.resendVerification));
router.post('/login', loginLimiter, validate(loginSchema), asyncHandler(ctrl.login));
router.post('/logout', asyncHandler(ctrl.logout));
router.post('/forgot-password', validate(emailOnlySchema), asyncHandler(ctrl.forgotPassword));
router.post('/reset-password', validate(resetSchema), asyncHandler(ctrl.resetPassword));
router.post('/dev/verification-token', validate(emailOnlySchema), asyncHandler(ctrl.devVerificationToken));
router.get('/me', authHandler, asyncHandler(ctrl.me));

// Multi-factor auth. Setup/enable/disable are for a signed-in user managing their
// own account; verify completes a login using the challenge token (login-limited).
router.post('/mfa/setup', authHandler, asyncHandler(mfa.setup));
router.post('/mfa/enable', authHandler, validate(mfaCodeSchema), asyncHandler(mfa.enable));
router.post('/mfa/disable', authHandler, validate(mfaDisableSchema), asyncHandler(mfa.disable));
router.post('/mfa/verify', loginLimiter, validate(mfaVerifySchema), asyncHandler(mfa.verify));

module.exports = router;
