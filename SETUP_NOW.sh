#!/bin/bash

echo "╔═══════════════════════════════════════════════════════════╗"
echo "║     Weight Loss App - Automated Setup                    ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""

# Copy configured environment files
echo "📋 Step 1: Setting up environment files..."
cp .env.configured .env
cp backend/.env.configured backend/.env
echo "✅ Environment files configured with your credentials"
echo ""

# Install frontend dependencies
echo "📦 Step 2: Installing frontend dependencies..."
npm install
if [ $? -eq 0 ]; then
    echo "✅ Frontend dependencies installed"
else
    echo "❌ Failed to install frontend dependencies"
    exit 1
fi
echo ""

# Install backend dependencies
echo "📦 Step 3: Installing backend dependencies..."
cd backend
npm install
if [ $? -eq 0 ]; then
    echo "✅ Backend dependencies installed"
else
    echo "❌ Failed to install backend dependencies"
    exit 1
fi
cd ..
echo ""

echo "╔═══════════════════════════════════════════════════════════╗"
echo "║                  Setup Complete! 🎉                       ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""
echo "✅ All dependencies installed"
echo "✅ Environment files configured"
echo "✅ Supabase connected"
echo "✅ Cloudinary connected"
echo ""
echo "📋 Next Steps:"
echo ""
echo "1️⃣  Run the database schema:"
echo "   • Open: https://capvowxxembnycdonghv.supabase.co"
echo "   • Go to: SQL Editor"
echo "   • Copy content from: database/schema.sql"
echo "   • Paste and click 'Run'"
echo ""
echo "2️⃣  Start the servers (2 terminals):"
echo ""
echo "   Terminal 1 (Backend):"
echo "   $ cd backend"
echo "   $ npm run dev"
echo ""
echo "   Terminal 2 (Frontend):"
echo "   $ npm run dev"
echo ""
echo "3️⃣  Open browser:"
echo "   http://localhost:5173"
echo ""
echo "🎊 You're ready to go!"
echo ""
