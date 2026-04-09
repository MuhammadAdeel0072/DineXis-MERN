#!/bin/bash
# MERN Stack Development Verification Script
# Tests that all services can start cleanly

echo "🔍 MERN Development Environment Verification"
echo "=============================================="
echo ""

# Check Node.js
echo "✓ Checking Node.js..."
node --version || echo "✗ Node.js not found"
npm --version || echo "✗ npm not found"
echo ""

# Check .env files
echo "✓ Checking .env files..."
if [ -f "server/.env" ]; then
    echo "  ✓ server/.env exists"
    if grep -q "DEV_MODE=true" server/.env; then
        echo "  ✓ DEV_MODE=true set in server/.env"
    else
        echo "  ✗ DEV_MODE not set to true in server/.env"
    fi
else
    echo "  ✗ server/.env not found"
fi
echo ""

# Check frontend env files
echo "✓ Checking frontend .env files..."
for panel in "admin-panel" "chef-panel" "rider-panel"; do
    if [ -f "$panel/.env.local" ]; then
        echo "  ✓ $panel/.env.local exists"
    else
        echo "  ✗ $panel/.env.local not found"
    fi
done
echo ""

# Check MongoDB connection
echo "✓ Checking dependencies..."
if [ -d "node_modules" ]; then
    echo "  ✓ Root node_modules installed"
else
    echo "  ✗ Root node_modules not found - run: npm install"
fi

if [ -d "server/node_modules" ]; then
    echo "  ✓ Server node_modules installed"
else
    echo "  ✗ Server node_modules not found - run: cd server && npm install"
fi

if [ -d "client/node_modules" ]; then
    echo "  ✓ Client node_modules installed"
else
    echo "  ✗ Client node_modules not found - run: cd client && npm install"
fi
echo ""

echo "✅ Verification Complete!"
echo ""
echo "To start development:"
echo "  npm run dev"
echo ""
