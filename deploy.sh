#!/bin/bash

echo "🚀 Weight Loss Tracker - Deployment Helper"
echo "=========================================="
echo ""

# Check if dist folder exists
if [ ! -d "dist" ]; then
    echo "📦 Building the application..."
    npm run build
    echo "✅ Build complete!"
else
    echo "✅ Build folder found!"
fi

echo ""
echo "🎉 Your app is ready to deploy!"
echo ""
echo "📋 Choose your deployment method:"
echo ""
echo "1️⃣  EASIEST: Netlify Drop (No account needed)"
echo "   → Go to: https://app.netlify.com/drop"
echo "   → Drag the 'dist' folder"
echo "   → Get instant URL!"
echo ""
echo "2️⃣  Vercel (Quick & Easy)"
echo "   → Install: npm install -g vercel"
echo "   → Run: vercel"
echo "   → Follow prompts"
echo ""
echo "3️⃣  GitHub Pages"
echo "   → Push to GitHub"
echo "   → Enable Pages in Settings"
echo ""
echo "📂 Your build folder: $(pwd)/dist"
echo ""
echo "📖 Full guide: DEPLOYMENT_GUIDE.md"
echo ""
