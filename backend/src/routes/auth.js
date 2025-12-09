import express from 'express';
import { body, validationResult } from 'express-validator';
import * as authService from '../services/authService.js';
import * as googleFitService from '../services/googleFitService.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

/**
 * @route   POST /api/auth/signup
 * @desc    Register new user
 * @access  Public
 */
router.post('/signup',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('name').notEmpty().withMessage('Name is required')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const { email, password, ...userData } = req.body;
      const result = await authService.signUp(email, password, userData);

      res.status(201).json(result);
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }
);

/**
 * @route   POST /api/auth/signin
 * @desc    Login user
 * @access  Public
 */
router.post('/signin',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const { email, password } = req.body;
      const result = await authService.signIn(email, password);

      res.json(result);
    } catch (error) {
      res.status(401).json({
        success: false,
        error: error.message
      });
    }
  }
);

/**
 * @route   POST /api/auth/signout
 * @desc    Logout user
 * @access  Private
 */
router.post('/signout', authenticate, async (req, res) => {
  try {
    const result = await authService.signOut(req.token);
    res.json(result);
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route   GET /api/auth/me
 * @desc    Get current user
 * @access  Private
 */
router.get('/me', authenticate, async (req, res) => {
  try {
    res.json({
      success: true,
      user: req.user
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route   POST /api/auth/refresh
 * @desc    Refresh access token
 * @access  Public
 */
router.post('/refresh',
  [body('refreshToken').notEmpty().withMessage('Refresh token is required')],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const { refreshToken } = req.body;
      const result = await authService.refreshToken(refreshToken);

      res.json(result);
    } catch (error) {
      res.status(401).json({
        success: false,
        error: error.message
      });
    }
  }
);

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Request password reset
 * @access  Public
 */
router.post('/forgot-password',
  [body('email').isEmail().withMessage('Valid email is required')],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const { email } = req.body;
      const result = await authService.requestPasswordReset(email);

      res.json(result);
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }
);

/**
 * @route   POST /api/auth/reset-password
 * @desc    Reset password
 * @access  Private
 */
router.post('/reset-password',
  authenticate,
  [body('newPassword').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const { newPassword } = req.body;
      const result = await authService.updatePassword(req.token, newPassword);

      res.json(result);
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }
);

/**
 * @route   GET /api/auth/google-fit/connect
 * @desc    Get Google Fit OAuth URL
 * @access  Private
 */
router.get('/google-fit/connect', authenticate, async (req, res) => {
  try {
    const authUrl = googleFitService.getAuthUrl();
    res.json({
      success: true,
      authUrl,
      state: req.user.id // Pass user ID as state
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route   GET /api/auth/google-fit/callback
 * @desc    Google Fit OAuth callback
 * @access  Public
 */
router.get('/google-fit/callback', async (req, res) => {
  try {
    const { code, state } = req.query; // state contains userId
    
    if (!code) {
      throw new Error('Authorization code not provided');
    }

    // Exchange code for tokens
    const tokens = await googleFitService.getTokensFromCode(code);
    
    // Save tokens for user
    await googleFitService.saveUserTokens(state, tokens);

    // Redirect to frontend success page
    res.redirect(`${process.env.FRONTEND_URL}/settings?googlefit=connected`);
  } catch (error) {
    console.error('Google Fit callback error:', error);
    res.redirect(`${process.env.FRONTEND_URL}/settings?googlefit=error`);
  }
});

/**
 * @route   POST /api/auth/google-fit/disconnect
 * @desc    Disconnect Google Fit
 * @access  Private
 */
router.post('/google-fit/disconnect', authenticate, async (req, res) => {
  try {
    const result = await googleFitService.disconnectGoogleFit(req.user.id);
    res.json(result);
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
