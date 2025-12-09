import cloudinary from '../config/cloudinary.js';
import { supabaseAdmin } from '../config/supabase.js';

/**
 * Upload photo to Cloudinary
 */
export const uploadPhoto = async (file, userId, photoType = 'front') => {
  try {
    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(file.path, {
      folder: `weightloss/users/${userId}`,
      transformation: [
        { width: 1200, height: 1600, crop: 'limit' },
        { quality: 'auto:good' },
        { fetch_format: 'auto' }
      ],
      resource_type: 'image'
    });

    // Generate thumbnail
    const thumbnailUrl = cloudinary.url(result.public_id, {
      transformation: [
        { width: 300, height: 400, crop: 'fill' },
        { quality: 'auto:low' }
      ]
    });

    // Save to database
    const { data, error } = await supabaseAdmin
      .from('photos')
      .insert({
        user_id: userId,
        cloudinary_url: result.secure_url,
        cloudinary_public_id: result.public_id,
        cloudinary_thumbnail_url: thumbnailUrl,
        photo_type: photoType,
        date: new Date().toISOString().split('T')[0]
      })
      .select()
      .single();

    if (error) throw error;

    return {
      success: true,
      data: {
        id: data.id,
        url: result.secure_url,
        thumbnailUrl: thumbnailUrl,
        publicId: result.public_id,
        photoType: photoType
      }
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw new Error('Failed to upload photo');
  }
};

/**
 * Delete photo from Cloudinary and database
 */
export const deletePhoto = async (photoId, userId) => {
  try {
    // Get photo details from database
    const { data: photo, error: fetchError } = await supabaseAdmin
      .from('photos')
      .select('cloudinary_public_id, user_id')
      .eq('id', photoId)
      .single();

    if (fetchError) throw fetchError;

    // Verify ownership
    if (photo.user_id !== userId) {
      throw new Error('Unauthorized to delete this photo');
    }

    // Delete from Cloudinary
    await cloudinary.uploader.destroy(photo.cloudinary_public_id);

    // Delete from database
    const { error: deleteError } = await supabaseAdmin
      .from('photos')
      .delete()
      .eq('id', photoId);

    if (deleteError) throw deleteError;

    return { success: true, message: 'Photo deleted successfully' };
  } catch (error) {
    console.error('Delete photo error:', error);
    throw new Error('Failed to delete photo');
  }
};

/**
 * Get all photos for a user
 */
export const getUserPhotos = async (userId) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('photos')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });

    if (error) throw error;

    return { success: true, data };
  } catch (error) {
    console.error('Get photos error:', error);
    throw new Error('Failed to fetch photos');
  }
};

/**
 * Upload multiple photos
 */
export const uploadMultiplePhotos = async (files, userId) => {
  try {
    const uploadPromises = files.map((file, index) => {
      const photoType = file.fieldname || ['front', 'side', 'back'][index] || 'other';
      return uploadPhoto(file, userId, photoType);
    });

    const results = await Promise.all(uploadPromises);
    return { success: true, data: results };
  } catch (error) {
    console.error('Multiple upload error:', error);
    throw new Error('Failed to upload photos');
  }
};

export default {
  uploadPhoto,
  deletePhoto,
  getUserPhotos,
  uploadMultiplePhotos
};
