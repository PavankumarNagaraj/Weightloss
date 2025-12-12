// Bulk Inventory Import Utility
// This file contains pre-categorized ingredients for bulk import

export const bulkInventoryData = [
  // 🏪 Dry Store - All in grams
  { name: 'brown rice', category: 'Dry Store', unit: 'g', minStock: 5000 },
  { name: 'rice', category: 'Dry Store', unit: 'g', minStock: 5000 },
  { name: 'quinoa', category: 'Dry Store', unit: 'g', minStock: 2000 },
  { name: 'oats', category: 'Dry Store', unit: 'g', minStock: 2000 },
  { name: 'wheat flour', category: 'Dry Store', unit: 'g', minStock: 5000 },
  { name: 'beans', category: 'Dry Store', unit: 'g', minStock: 2000 },
  { name: 'green gram', category: 'Dry Store', unit: 'g', minStock: 2000 },
  { name: 'horse gram', category: 'Dry Store', unit: 'g', minStock: 2000 },
  { name: 'lobia', category: 'Dry Store', unit: 'g', minStock: 2000 },
  { name: 'soya chunks', category: 'Dry Store', unit: 'g', minStock: 2000 },
  { name: 'olive oil', category: 'Dry Store', unit: 'g', minStock: 2000 },
  { name: 'coconut oil', category: 'Dry Store', unit: 'g', minStock: 1000 },
  { name: 'salt', category: 'Dry Store', unit: 'g', minStock: 1000 },
  { name: 'pepper', category: 'Dry Store', unit: 'g', minStock: 200 },
  { name: 'turmeric', category: 'Dry Store', unit: 'g', minStock: 200 },
  { name: 'chilli flakes', category: 'Dry Store', unit: 'g', minStock: 200 },
  { name: 'mixed herbs', category: 'Dry Store', unit: 'g', minStock: 200 },
  { name: 'pumpkin seeds', category: 'Dry Store', unit: 'g', minStock: 500 },
  { name: 'melon seeds', category: 'Dry Store', unit: 'g', minStock: 500 },
  { name: 'walnut', category: 'Dry Store', unit: 'g', minStock: 500 },
  { name: 'tahini', category: 'Dry Store', unit: 'g', minStock: 500 },
  { name: 'vanilla essence', category: 'Dry Store', unit: 'g', minStock: 100 },
  { name: 'vinegar', category: 'Dry Store', unit: 'g', minStock: 500 },
  { name: 'soya sauce', category: 'Dry Store', unit: 'g', minStock: 500 },
  { name: 'sriracha sauce', category: 'Dry Store', unit: 'g', minStock: 500 },
  { name: 'bread croutons', category: 'Dry Store', unit: 'g', minStock: 500 },
  { name: 'rice wrap', category: 'Dry Store', unit: 'g', minStock: 500 },
  { name: 'tortilla', category: 'Dry Store', unit: 'g', minStock: 500 },

  // 🥬 Fresh Produce - All in grams
  { name: 'basil', category: 'Fresh Produce', unit: 'g', minStock: 100 },
  { name: 'coriander', category: 'Fresh Produce', unit: 'g', minStock: 200 },
  { name: 'mint', category: 'Fresh Produce', unit: 'g', minStock: 100 },
  { name: 'mixed greens', category: 'Fresh Produce', unit: 'g', minStock: 500 },
  { name: 'spinach', category: 'Fresh Produce', unit: 'g', minStock: 1000 },
  { name: 'beetroot', category: 'Fresh Produce', unit: 'g', minStock: 1000 },
  { name: 'bell pepper', category: 'Fresh Produce', unit: 'g', minStock: 1000 },
  { name: 'brinjal', category: 'Fresh Produce', unit: 'g', minStock: 1000 },
  { name: 'capsicum', category: 'Fresh Produce', unit: 'g', minStock: 1000 },
  { name: 'carrot', category: 'Fresh Produce', unit: 'g', minStock: 2000 },
  { name: 'cauliflower', category: 'Fresh Produce', unit: 'g', minStock: 1000 },
  { name: 'cucumber', category: 'Fresh Produce', unit: 'g', minStock: 1000 },
  { name: 'garlic', category: 'Fresh Produce', unit: 'g', minStock: 500 },
  { name: 'ginger', category: 'Fresh Produce', unit: 'g', minStock: 500 },
  { name: 'lettuce', category: 'Fresh Produce', unit: 'g', minStock: 500 },
  { name: 'mushroom', category: 'Fresh Produce', unit: 'g', minStock: 500 },
  { name: 'onion', category: 'Fresh Produce', unit: 'g', minStock: 2000 },
  { name: 'potato', category: 'Fresh Produce', unit: 'g', minStock: 3000 },
  { name: 'radish', category: 'Fresh Produce', unit: 'g', minStock: 500 },
  { name: 'sweet corn', category: 'Fresh Produce', unit: 'g', minStock: 500 },
  { name: 'sweet potato', category: 'Fresh Produce', unit: 'g', minStock: 1000 },
  { name: 'tomato', category: 'Fresh Produce', unit: 'g', minStock: 2000 },
  { name: 'zucchini', category: 'Fresh Produce', unit: 'g', minStock: 1000 },

  // ❄️ Refrigerated - All in grams except eggs
  { name: 'butter', category: 'Refrigerated', unit: 'g', minStock: 500 },
  { name: 'paneer', category: 'Refrigerated', unit: 'g', minStock: 2000 },
  { name: 'parmesan cheese', category: 'Refrigerated', unit: 'g', minStock: 500 },
  { name: 'yogurt', category: 'Refrigerated', unit: 'g', minStock: 1000 },
  { name: 'egg', category: 'Refrigerated', unit: 'pcs', minStock: 50 },
  { name: 'egg yolk', category: 'Refrigerated', unit: 'pcs', minStock: 20 },

  // 🍎 Fruits - All in grams
  { name: 'apple', category: 'Fruits', unit: 'g', minStock: 1000 },
  { name: 'avocado', category: 'Fruits', unit: 'g', minStock: 1000 },
  { name: 'banana', category: 'Fruits', unit: 'g', minStock: 2000 },
  { name: 'blueberry', category: 'Fruits', unit: 'g', minStock: 500 },
  { name: 'lemon', category: 'Fruits', unit: 'g', minStock: 500 },
  { name: 'orange', category: 'Fruits', unit: 'g', minStock: 1000 },
  { name: 'papaya', category: 'Fruits', unit: 'g', minStock: 1000 },
  { name: 'pineapple', category: 'Fruits', unit: 'g', minStock: 1000 },
  { name: 'pomegranate', category: 'Fruits', unit: 'g', minStock: 1000 },
  { name: 'strawberry', category: 'Fruits', unit: 'g', minStock: 500 },
  { name: 'watermelon', category: 'Fruits', unit: 'g', minStock: 2000 },
];

export const importBulkInventory = () => {
  try {
    const existingInventory = JSON.parse(localStorage.getItem('cafe_inventory') || '[]');
    
    // Create a map of existing items by name (lowercase)
    const existingMap = {};
    existingInventory.forEach(item => {
      existingMap[item.name.toLowerCase()] = item;
    });
    
    let addedCount = 0;
    let skippedCount = 0;
    
    bulkInventoryData.forEach(newItem => {
      const itemKey = newItem.name.toLowerCase();
      
      if (!existingMap[itemKey]) {
        // Add new item
        const inventoryItem = {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          name: newItem.name,
          currentStock: 0,
          minStock: newItem.minStock,
          unit: newItem.unit,
          category: newItem.category,
          lastUpdated: new Date().toISOString(),
        };
        existingInventory.push(inventoryItem);
        addedCount++;
      } else {
        // Item already exists, skip
        skippedCount++;
      }
    });
    
    // Save updated inventory
    localStorage.setItem('cafe_inventory', JSON.stringify(existingInventory));
    
    return {
      success: true,
      addedCount,
      skippedCount,
      totalItems: bulkInventoryData.length,
    };
  } catch (error) {
    console.error('Error importing bulk inventory:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};
