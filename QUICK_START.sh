#!/bin/bash

# Weight Loss App - Quick Start Script
# This script helps you set up the development environment

echo "╔═══════════════════════════════════════════════════════════╗"
echo "║     Weight Loss App - Phase 1 Quick Start Setup          ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    echo "   Download from: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js version: $(node --version)"
echo ""

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed."
    exit 1
fi

echo "✅ npm version: $(npm --version)"
echo ""

# Step 1: Install frontend dependencies
echo "📦 Step 1: Installing frontend dependencies..."
npm install
if [ $? -eq 0 ]; then
    echo "✅ Frontend dependencies installed"
else
    echo "❌ Failed to install frontend dependencies"
    exit 1
fi
echo ""

# Step 2: Install backend dependencies
echo "📦 Step 2: Installing backend dependencies..."
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

# Step 3: Check for environment files
echo "🔧 Step 3: Checking environment configuration..."

if [ ! -f ".env" ]; then
    echo "⚠️  Frontend .env file not found"
    echo "   Creating from template..."
    cp .env.frontend.example .env
    echo "✅ Created .env file - PLEASE EDIT WITH YOUR CREDENTIALS"
else
    echo "✅ Frontend .env file exists"
fi

if [ ! -f "backend/.env" ]; then
    echo "⚠️  Backend .env file not found"
    echo "   Creating from template..."
    cp backend/.env.example backend/.env
    echo "✅ Created backend/.env file - PLEASE EDIT WITH YOUR CREDENTIALS"
else
    echo "✅ Backend .env file exists"
fi
echo ""

# Step 4: Instructions
echo "╔═══════════════════════════════════════════════════════════╗"
echo "║                    Setup Complete! 🎉                     ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""
echo "📋 Next Steps:"
echo ""
echo "1️⃣  Set up your services (follow PHASE1_SETUP_GUIDE.md):"
echo "   • Create Supabase project"
echo "   • Set up Cloudinary account"
echo "   • Configure SendGrid"
echo "   • Set up Twilio"
echo "   • Create Google OAuth credentials"
echo ""
echo "2️⃣  Edit environment files with your credentials:"
echo "   • Edit .env (frontend)"
echo "   • Edit backend/.env (backend)"
echo ""
echo "3️⃣  Run the database schema:"
echo "   • Open Supabase SQL Editor"
echo "   • Run database/schema.sql"
echo ""
echo "4️⃣  Start the development servers:"
echo ""
echo "   Terminal 1 (Backend):"
echo "   $ cd backend"
echo "   $ npm run dev"
echo ""
echo "   Terminal 2 (Frontend):"
echo "   $ npm run dev"
echo ""
echo "5️⃣  Open your browser:"
echo "   http://localhost:5173"
echo ""
echo "📚 Documentation:"
echo "   • PHASE1_SETUP_GUIDE.md - Complete setup instructions"
echo "   • PHASE1_IMPLEMENTATION_SUMMARY.md - What was built"
echo "   • backend/README.md - Backend API documentation"
echo ""
echo "🆘 Need help? Check the troubleshooting section in PHASE1_SETUP_GUIDE.md"
echo ""
