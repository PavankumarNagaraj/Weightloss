#!/bin/bash

# Script to add email button to all cafe tabs
# This adds the CafeTabHeader import to each component

echo "Adding email button to all cafe tabs..."

# List of components to update (excluding CafeDashboard and CafeTabHeader itself)
components=(
  "CafeOrders"
  "CafeMenu"
  "CafeInventory"
  "CafePurchases"
  "CafeExpenses"
  "CafeReports"
  "CafeSalesAnalytics"
  "CafeProfitLoss"
  "CafeSubscriptionOrders"
  "CafeInvestments"
)

for component in "${components[@]}"; do
  file="src/components/cafe/${component}.jsx"
  if [ -f "$file" ]; then
    echo "Processing $file..."
    # Check if CafeTabHeader is already imported
    if ! grep -q "import CafeTabHeader" "$file"; then
      # Add import after the first import statement
      sed -i '' "1a\\
import CafeTabHeader from './CafeTabHeader';\\
" "$file" 2>/dev/null || sed -i "1a import CafeTabHeader from './CafeTabHeader';" "$file"
      echo "  ✓ Added CafeTabHeader import to $component"
    else
      echo "  - CafeTabHeader already imported in $component"
    fi
  else
    echo "  ✗ File not found: $file"
  fi
done

echo "Done! Please manually update the header sections in each component to use <CafeTabHeader>"
