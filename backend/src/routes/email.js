import express from 'express';
import { sendNutritionChartEmail } from '../services/emailService.js';

const router = express.Router();

/**
 * POST /api/email/nutrition-chart
 * Send nutrition chart email
 */
router.post('/nutrition-chart', async (req, res) => {
  try {
    const { to, dishName, totalCalories, ingredients, macros } = req.body;

    // Validate required fields
    if (!to || !dishName || !totalCalories || !ingredients || !macros) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: to, dishName, totalCalories, ingredients, macros'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(to)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid email address format'
      });
    }

    // Send email
    const result = await sendNutritionChartEmail({
      to,
      dishName,
      totalCalories,
      ingredients,
      macros
    });

    res.json({
      success: true,
      message: 'Nutrition chart email sent successfully',
      data: result
    });
  } catch (error) {
    console.error('Error sending nutrition chart email:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to send email'
    });
  }
});

export default router;
