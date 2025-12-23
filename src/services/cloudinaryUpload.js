/**
 * Cloudinary Upload Service for Frontend
 * Handles receipt image uploads to Cloudinary
 */

const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'cafe_receipts';
const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'pavankumar';

/**
 * Upload receipt image to Cloudinary
 * @param {File} file - The image file to upload
 * @param {string} purchaseOrderNumber - Purchase order number for folder organization
 * @returns {Promise<{url: string, publicId: string}>}
 */
export const uploadReceiptToCloudinary = async (file, purchaseOrderNumber) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    // Use public_id to organize files instead of folder (which is set in preset)
    formData.append('public_id', `${purchaseOrderNumber}_${Date.now()}`);
    // Add compression and optimization
    formData.append('quality', 'auto:good');
    formData.append('fetch_format', 'auto');
    formData.append('flags', 'lossy');

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Cloudinary error:', errorData);
      throw new Error(errorData.error?.message || 'Failed to upload to Cloudinary');
    }

    const data = await response.json();

    return {
      url: data.secure_url,
      publicId: data.public_id,
      thumbnailUrl: data.secure_url.replace('/upload/', '/upload/w_400,h_400,c_fit/'),
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw new Error('Failed to upload receipt image');
  }
};

/**
 * Delete receipt image from Cloudinary
 * @param {string} publicId - Cloudinary public ID
 * @returns {Promise<boolean>}
 */
export const deleteReceiptFromCloudinary = async (publicId) => {
  try {
    // Note: Deletion requires backend API call with API secret
    // For now, we'll just return true and handle deletion via backend if needed
    console.log('Delete receipt:', publicId);
    return true;
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    return false;
  }
};

export default {
  uploadReceiptToCloudinary,
  deleteReceiptFromCloudinary,
};
