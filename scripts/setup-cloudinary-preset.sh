#!/bin/bash

# Setup Cloudinary Upload Preset for Cafe Receipts
# This script creates the 'cafe_receipts' unsigned upload preset

echo "🔧 Setting up Cloudinary upload preset..."
echo ""

# Cloudinary credentials
CLOUD_NAME="dvgngavs8"
API_KEY="457168446943358"
API_SECRET="B_ptx960d-IpDlAbAVY5MtDd8SE"

echo "Cloud Name: $CLOUD_NAME"
echo "API Key: $API_KEY"
echo ""

# Create upload preset using Cloudinary Admin API
curl -X POST \
  "https://api.cloudinary.com/v1_1/$CLOUD_NAME/upload_presets" \
  -u "$API_KEY:$API_SECRET" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "cafe_receipts",
    "unsigned": true,
    "folder": "cafe/receipts",
    "allowed_formats": ["jpg", "png", "jpeg", "webp"],
    "max_file_size": 10485760,
    "transformation": [
      {"quality": "auto:good"},
      {"fetch_format": "auto"}
    ],
    "tags": ["receipt", "cafe", "purchase"]
  }' \
  -w "\n\nHTTP Status: %{http_code}\n" \
  -s -o /tmp/cloudinary_response.json

# Check response
if [ $? -eq 0 ]; then
  echo ""
  echo "Response:"
  cat /tmp/cloudinary_response.json | python3 -m json.tool 2>/dev/null || cat /tmp/cloudinary_response.json
  echo ""
  echo "✅ Upload preset setup complete!"
  echo ""
  echo "Preset Details:"
  echo "  Name: cafe_receipts"
  echo "  Unsigned: true"
  echo "  Folder: cafe/receipts"
  echo "  Max Size: 10MB"
  echo "  Formats: jpg, png, jpeg, webp"
  echo ""
  echo "🎉 Cloudinary is ready for receipt uploads!"
else
  echo "❌ Failed to create preset"
  echo "Check your Cloudinary credentials and try again"
  exit 1
fi

rm -f /tmp/cloudinary_response.json
