/**
 * Setup Cloudinary Upload Preset for Cafe Receipts
 * This script creates the 'cafe_receipts' unsigned upload preset
 */

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from backend
dotenv.config({ path: join(__dirname, '../backend/.env.configured') });

const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY;
const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET;

async function createUploadPreset() {
  try {
    console.log('🔧 Setting up Cloudinary upload preset...\n');
    
    if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
      throw new Error('Missing Cloudinary credentials in .env.configured');
    }

    console.log(`Cloud Name: ${CLOUDINARY_CLOUD_NAME}`);
    console.log(`API Key: ${CLOUDINARY_API_KEY}\n`);

    // Create upload preset via Cloudinary Admin API
    const auth = Buffer.from(`${CLOUDINARY_API_KEY}:${CLOUDINARY_API_SECRET}`).toString('base64');
    
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/upload_presets`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: 'cafe_receipts',
          unsigned: true,
          folder: 'cafe/receipts',
          allowed_formats: 'jpg,png,jpeg,webp',
          max_file_size: 10485760, // 10MB
          transformation: [
            { quality: 'auto:good' },
            { fetch_format: 'auto' }
          ],
          tags: ['receipt', 'cafe', 'purchase'],
        }),
      }
    );

    const data = await response.json();

    if (response.ok) {
      console.log('✅ Upload preset created successfully!\n');
      console.log('Preset Details:');
      console.log(`  Name: ${data.name}`);
      console.log(`  Unsigned: ${data.unsigned}`);
      console.log(`  Folder: ${data.settings?.folder || 'cafe/receipts'}`);
      console.log(`  Max Size: 10MB`);
      console.log(`  Formats: jpg, png, jpeg, webp\n`);
      console.log('🎉 Cloudinary is ready for receipt uploads!');
    } else if (data.error?.message?.includes('already exists')) {
      console.log('ℹ️  Upload preset "cafe_receipts" already exists');
      console.log('✅ Cloudinary is ready for receipt uploads!');
    } else {
      console.error('❌ Failed to create preset:', data.error?.message || data);
      throw new Error(data.error?.message || 'Failed to create preset');
    }

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error('\nTroubleshooting:');
    console.error('1. Check Cloudinary credentials in backend/.env.configured');
    console.error('2. Verify API key and secret are correct');
    console.error('3. Ensure you have admin access to Cloudinary account');
    process.exit(1);
  }
}

createUploadPreset();
