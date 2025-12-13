#!/bin/bash

# Script to verify all cafeService imports have corresponding exports

echo "🔍 Verifying all cafeService exports..."
echo ""

# Extract all imports from cafeService
IMPORTS=$(grep -r "from.*['\"].*cafeService['\"]" src --include="*.jsx" --include="*.js" | \
  grep -o "import {[^}]*}" | \
  sed 's/import {//g' | \
  sed 's/}//g' | \
  tr ',' '\n' | \
  sed 's/^[[:space:]]*//g' | \
  sed 's/[[:space:]]*$//g' | \
  sort -u)

# Extract all exports from cafeService.js
EXPORTS=$(grep "^export const" src/services/cafeService.js | \
  sed 's/export const //g' | \
  sed 's/ =.*//g' | \
  sort -u)

echo "📦 Found $(echo "$IMPORTS" | wc -l | tr -d ' ') unique imports"
echo "✅ Found $(echo "$EXPORTS" | wc -l | tr -d ' ') exports in cafeService.js"
echo ""

# Check for missing exports
MISSING=0
echo "🔎 Checking for missing exports..."
echo ""

while IFS= read -r import; do
  if [ -n "$import" ]; then
    if ! echo "$EXPORTS" | grep -q "^${import}$"; then
      echo "❌ MISSING: $import"
      MISSING=$((MISSING + 1))
    fi
  fi
done <<< "$IMPORTS"

if [ $MISSING -eq 0 ]; then
  echo "✅ All imports have corresponding exports!"
  echo ""
  echo "📋 Complete list of exported functions:"
  echo "$EXPORTS"
else
  echo ""
  echo "⚠️  Found $MISSING missing export(s)"
  exit 1
fi
