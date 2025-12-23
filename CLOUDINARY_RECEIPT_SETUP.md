# Cloudinary Receipt Upload Setup

This guide explains how to configure Cloudinary for receipt image uploads in the Cafe Purchase system.

## ✅ What's Already Done

- Cloudinary is already configured in your backend (`/backend/src/config/cloudinary.js`)
- Environment variables are set up
- Upload service is ready

## 🔧 Setup Steps

### 1. Create Upload Preset in Cloudinary

1. **Log in to Cloudinary Dashboard**
   - Go to https://cloudinary.com/console

2. **Create Upload Preset**
   - Navigate to: Settings → Upload → Upload presets
   - Click "Add upload preset"
   - **Preset name:** `cafe_receipts`
   - **Signing mode:** Unsigned (for frontend uploads)
   - **Folder:** `cafe/receipts` (optional, can be set per upload)
   - **Allowed formats:** jpg, png, jpeg, webp
   - **Max file size:** 10 MB
   - Click "Save"

### 2. Configure Environment Variables

Add to your `.env` file:

```bash
# Cloudinary Configuration (already exists)
VITE_CLOUDINARY_CLOUD_NAME=your-cloud-name
VITE_CLOUDINARY_UPLOAD_PRESET=cafe_receipts
```

**Find your cloud name:**
- Cloudinary Dashboard → Account Details → Cloud name

### 3. Update Cloudinary Upload Service

Edit `/src/services/cloudinaryUpload.js` and replace:

```javascript
const CLOUDINARY_UPLOAD_PRESET = 'cafe_receipts';
const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'your-cloud-name';
```

With your actual cloud name if not using env variables.

## 📸 How It Works

### Upload Flow:
```
1. User selects receipt image
   ↓
2. Local preview shown immediately
   ↓
3. Image uploaded to Cloudinary in background
   ↓
4. Cloudinary URL stored in database
   ↓
5. Receipt accessible via CDN
```

### Storage Structure:
```
Cloudinary Folder Structure:
cafe/
  └── receipts/
      └── PO123456/
          └── receipt.jpg
```

### Database Storage:
```sql
cafe_purchases table:
- receipt_url: "https://res.cloudinary.com/[cloud]/image/upload/v123/cafe/receipts/PO123456/receipt.jpg"
- receipt_filename: "invoice_123.jpg"
```

## 🎯 Benefits

✅ **No file size limits** (configurable in Cloudinary)  
✅ **CDN delivery** (fast loading worldwide)  
✅ **Automatic optimization** (quality, format)  
✅ **Thumbnail generation** (automatic)  
✅ **Smaller database** (only URLs stored)  
✅ **Backup & recovery** (Cloudinary handles it)  

## 🔄 Fallback Mechanism

If Cloudinary upload fails:
- System automatically falls back to base64 storage
- User sees warning toast: "⚠️ Upload failed, using local storage"
- Receipt still saved, just not in cloud

## 🧪 Testing

1. Go to Cafe → Purchases → Record Purchase
2. Add items and supplier
3. Upload a receipt image
4. Check for toast messages:
   - "📤 Uploading receipt to cloud..."
   - "✅ Receipt uploaded successfully"
5. Save purchase
6. View purchase details to see receipt

## 🔍 Verify Upload

Check Cloudinary Dashboard:
- Media Library → cafe/receipts/
- Should see uploaded receipt images organized by PO number

## ⚠️ Troubleshooting

**Upload fails with CORS error:**
- Check upload preset is set to "Unsigned"
- Verify cloud name is correct

**"Invalid upload preset" error:**
- Create the `cafe_receipts` preset in Cloudinary
- Make sure it's set to unsigned mode

**Images not showing:**
- Check receipt_url in database contains valid Cloudinary URL
- Verify URL is accessible in browser

## 📊 Current vs New Storage

| Feature | Base64 (Old) | Cloudinary (New) |
|---------|--------------|------------------|
| Max Size | 5MB | 10MB+ |
| Storage | Database | Cloud CDN |
| Loading Speed | Slow | Fast |
| Database Size | Large | Small |
| Optimization | None | Automatic |
| Thumbnails | Manual | Automatic |

## 🚀 Migration

Existing base64 receipts will continue to work. New uploads use Cloudinary automatically.

To migrate old receipts (optional):
1. Export existing receipt_url data
2. Upload to Cloudinary via script
3. Update database with new URLs
