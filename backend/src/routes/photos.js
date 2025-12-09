import express from 'express';
import multer from 'multer';
import * as cloudinaryService from '../services/cloudinaryService.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, '/tmp'); // Temporary storage
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept images only
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed'), false);
    }
    cb(null, true);
  }
});

/**
 * @route   POST /api/photos/upload
 * @desc    Upload single photo
 * @access  Private
 */
router.post('/upload',
  authenticate,
  upload.single('photo'),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: 'No photo file provided'
        });
      }

      const { photoType, userId } = req.body;
      const targetUserId = userId || req.user.id;

      // Check authorization
      if (targetUserId !== req.user.id && !['admin', 'trainer'].includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          error: 'Not authorized to upload photos for this user'
        });
      }

      const result = await cloudinaryService.uploadPhoto(
        req.file,
        targetUserId,
        photoType || 'front'
      );

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
 * @route   POST /api/photos/upload-multiple
 * @desc    Upload multiple photos
 * @access  Private
 */
router.post('/upload-multiple',
  authenticate,
  upload.array('photos', 5), // Max 5 photos
  async (req, res) => {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'No photo files provided'
        });
      }

      const { userId } = req.body;
      const targetUserId = userId || req.user.id;

      // Check authorization
      if (targetUserId !== req.user.id && !['admin', 'trainer'].includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          error: 'Not authorized to upload photos for this user'
        });
      }

      const result = await cloudinaryService.uploadMultiplePhotos(
        req.files,
        targetUserId
      );

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
 * @route   GET /api/photos/:userId
 * @desc    Get all photos for a user
 * @access  Private
 */
router.get('/:userId', authenticate, async (req, res) => {
  try {
    const { userId } = req.params;

    // Check authorization
    if (userId !== req.user.id && !['admin', 'trainer'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to view photos for this user'
      });
    }

    const result = await cloudinaryService.getUserPhotos(userId);
    res.json(result);
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route   DELETE /api/photos/:photoId
 * @desc    Delete a photo
 * @access  Private
 */
router.delete('/:photoId', authenticate, async (req, res) => {
  try {
    const { photoId } = req.params;
    const result = await cloudinaryService.deletePhoto(photoId, req.user.id);
    res.json(result);
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
