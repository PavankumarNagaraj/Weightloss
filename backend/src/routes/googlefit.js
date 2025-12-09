import express from 'express';
import * as googleFitService from '../services/googleFitService.js';
import { authenticate } from '../middleware/auth.js';
import { supabaseAdmin } from '../config/supabase.js';

const router = express.Router();

/**
 * @route   POST /api/googlefit/sync
 * @desc    Sync Google Fit data for user
 * @access  Private
 */
router.post('/sync', authenticate, async (req, res) => {
  try {
    const { userId, startDate, endDate } = req.body;

    // Verify user can access this data
    if (userId !== req.user.id && !['admin', 'trainer'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to sync data for this user'
      });
    }

    const result = await googleFitService.syncGoogleFitData(
      userId,
      startDate,
      endDate
    );

    res.json(result);
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route   GET /api/googlefit/data/:userId
 * @desc    Get Google Fit data for user
 * @access  Private
 */
router.get('/data/:userId', authenticate, async (req, res) => {
  try {
    const { userId } = req.params;
    const { startDate, endDate } = req.query;

    // Verify user can access this data
    if (userId !== req.user.id && !['admin', 'trainer'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to view data for this user'
      });
    }

    const { data, error } = await supabaseAdmin
      .from('google_fit_data')
      .select('*')
      .eq('user_id', userId)
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: true });

    if (error) throw error;

    res.json({
      success: true,
      data
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route   GET /api/googlefit/status/:userId
 * @desc    Check Google Fit connection status
 * @access  Private
 */
router.get('/status/:userId', authenticate, async (req, res) => {
  try {
    const { userId } = req.params;

    // Verify user can access this data
    if (userId !== req.user.id && !['admin', 'trainer'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized'
      });
    }

    const { data, error } = await supabaseAdmin
      .from('users')
      .select('google_fit_connected, google_fit_last_sync')
      .eq('id', userId)
      .single();

    if (error) throw error;

    res.json({
      success: true,
      connected: data.google_fit_connected || false,
      lastSync: data.google_fit_last_sync
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
