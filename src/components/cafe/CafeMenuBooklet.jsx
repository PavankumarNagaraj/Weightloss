import React, { useState, useEffect } from 'react';
import { Printer, Download, Grid3x3, Grid2x2 } from 'lucide-react';
import { getMenuItems, getInventory } from '../../services/cafeService';

const CafeMenuBooklet = ({ showToast }) => {
  const [menuItems, setMenuItems] = useState([]);
  const [inventoryItems, setInventoryItems] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showVeg, setShowVeg] = useState(true);
  const [showNonVeg, setShowNonVeg] = useState(true);
  const [priceType, setPriceType] = useState('customer'); // 'customer' or 'trainer'

  useEffect(() => {
    loadMenuItems();
    loadInventory();
  }, []);

  const loadMenuItems = async () => {
    try {
      const items = await getMenuItems();
      setMenuItems(items);
    } catch (error) {
      console.error('Error loading menu items:', error);
      showToast('Failed to load menu items');
    }
  };

  const loadInventory = async () => {
    try {
      const items = await getInventory();
      setInventoryItems(items.map(item => ({
        ...item,
        inventoryState: item.inventory_state || 'raw'
      })));
    } catch (error) {
      console.error('Error loading inventory:', error);
    }
  };

  // Calculate macros for a menu item
  const calculateMacros = (materials) => {
    let totals = { protein: 0, carbs: 0, fat: 0, fiber: 0, calories: 0 };

    if (!materials || materials.length === 0) return totals;

    materials.forEach(material => {
      const inventoryItem = inventoryItems.find(item => 
        item.name.toLowerCase() === material.name.toLowerCase()
      );
      
      if (inventoryItem) {
        const quantity = parseFloat(material.quantity) || 0;
        let quantityInGrams = quantity;
        
        if (material.unit === 'ml') {
          quantityInGrams = quantity;
        } else if (material.unit === 'pcs') {
          const isEgg = material.name.toLowerCase().includes('egg');
          quantityInGrams = quantity * (isEgg ? 45 : 100);
        }
        
        let protein = inventoryItem.protein_per_100g ? (inventoryItem.protein_per_100g * quantityInGrams) / 100 : 0;
        let carbs = inventoryItem.carbs_per_100g ? (inventoryItem.carbs_per_100g * quantityInGrams) / 100 : 0;
        let fat = inventoryItem.fat_per_100g ? (inventoryItem.fat_per_100g * quantityInGrams) / 100 : 0;
        let fiber = inventoryItem.fiber_per_100g ? (inventoryItem.fiber_per_100g * quantityInGrams) / 100 : 0;
        let calories = inventoryItem.calories_per_100g ? (inventoryItem.calories_per_100g * quantityInGrams) / 100 : 0;
        
        totals.protein += protein;
        totals.carbs += carbs;
        totals.fat += fat;
        totals.fiber += fiber;
        totals.calories += calories;
      }
    });

    return {
      protein: totals.protein.toFixed(1),
      carbs: totals.carbs.toFixed(1),
      fat: totals.fat.toFixed(1),
      fiber: totals.fiber.toFixed(1),
      calories: totals.calories.toFixed(0)
    };
  };

  const categories = ['all', 'main-course', 'beverages', 'snacks', 'desserts', 'breakfast'];

  const filteredItems = menuItems.filter(item => {
    if (selectedCategory !== 'all' && item.category !== selectedCategory) return false;
    if (!showVeg && item.is_veg) return false;
    if (!showNonVeg && !item.is_veg) return false;
    return true;
  });

  const handlePrint = () => {
    window.print();
  };

  const getCategoryIcon = (category) => {
    const icons = {
      'main-course': '🍽️',
      'beverages': '☕',
      'snacks': '🍿',
      'desserts': '🍰',
      'breakfast': '🍳'
    };
    return icons[category] || '🍴';
  };

  return (
    <div className="p-6">
      {/* Controls - Hidden when printing */}
      <div className="no-print mb-6 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white">📖 Menu Booklet Generator</h2>
            <p className="text-orange-100 text-sm mt-1">2 columns × 4 rows • 8 dishes per page</p>
          </div>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-6 py-3 bg-white text-orange-600 rounded-lg hover:bg-orange-50 transition font-bold shadow-md"
          >
            <Printer className="w-5 h-5" />
            Print Menu
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 border-2 border-orange-300 rounded-lg focus:ring-2 focus:ring-white bg-white"
            >
              <option value="all">All Categories</option>
              <option value="main-course">Main Course</option>
              <option value="beverages">Beverages</option>
              <option value="snacks">Snacks</option>
              <option value="desserts">Desserts</option>
              <option value="breakfast">Breakfast</option>
            </select>
          </div>

          {/* Price Type */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">Price Type</label>
            <select
              value={priceType}
              onChange={(e) => setPriceType(e.target.value)}
              className="w-full px-3 py-2 border-2 border-orange-300 rounded-lg focus:ring-2 focus:ring-white bg-white"
            >
              <option value="customer">Customer Price</option>
              <option value="trainer">Trainer Price</option>
            </select>
          </div>

          {/* Veg/Non-Veg Filter */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">Food Type</label>
            <div className="flex gap-2">
              <button
                onClick={() => setShowVeg(!showVeg)}
                className={`flex-1 px-3 py-2 rounded-lg border-2 transition font-semibold ${
                  showVeg ? 'border-white bg-white text-green-600' : 'border-orange-300 bg-orange-400 text-white'
                }`}
              >
                🟢 Veg
              </button>
              <button
                onClick={() => setShowNonVeg(!showNonVeg)}
                className={`flex-1 px-3 py-2 rounded-lg border-2 transition font-semibold ${
                  showNonVeg ? 'border-white bg-white text-red-600' : 'border-orange-300 bg-orange-400 text-white'
                }`}
              >
                🔴 Non-Veg
              </button>
            </div>
          </div>
        </div>

        <div className="mt-4 p-4 bg-white/20 backdrop-blur-sm border-2 border-white/30 rounded-lg">
          <p className="text-sm text-white font-semibold">
            <strong>📄 {filteredItems.length} dishes</strong> ready to print • 
            <strong> {Math.ceil(filteredItems.length / 8)} pages</strong> • 
            <strong>8 dishes per A4 page (2×4 grid)</strong>
          </p>
        </div>
      </div>

      {/* Printable Menu */}
      <div className="print-content">
        {Array.from({ length: Math.ceil(filteredItems.length / 8) }).map((_, pageIndex) => (
          <div key={pageIndex} className="page">
            {/* Page Header */}
            <div className="page-header">
              <h1 className="cafe-name">AFTERBURN GYM CAFE</h1>
              <p className="cafe-location">Sutra Fitness, Sarjapura</p>
            </div>

            {/* Menu Grid */}
            <div className="menu-grid">
              {filteredItems.slice(pageIndex * 8, (pageIndex + 1) * 8).map((item) => {
                const macros = calculateMacros(item.raw_materials || []);
                const totalMacroGrams = parseFloat(macros.protein) + parseFloat(macros.carbs) + parseFloat(macros.fat);
                
                // Calculate percentages and ensure they add up to 100%
                let proteinPercent = totalMacroGrams > 0 ? (parseFloat(macros.protein) / totalMacroGrams) * 100 : 0;
                let carbsPercent = totalMacroGrams > 0 ? (parseFloat(macros.carbs) / totalMacroGrams) * 100 : 0;
                let fatPercent = totalMacroGrams > 0 ? (parseFloat(macros.fat) / totalMacroGrams) * 100 : 0;
                
                // Round and adjust to ensure total is 100%
                proteinPercent = Math.round(proteinPercent);
                carbsPercent = Math.round(carbsPercent);
                fatPercent = Math.round(fatPercent);
                
                const total = proteinPercent + carbsPercent + fatPercent;
                if (total !== 100 && total > 0) {
                  const diff = 100 - total;
                  // Add difference to the largest component
                  if (proteinPercent >= carbsPercent && proteinPercent >= fatPercent) {
                    proteinPercent += diff;
                  } else if (carbsPercent >= fatPercent) {
                    carbsPercent += diff;
                  } else {
                    fatPercent += diff;
                  }
                }

                return (
                  <div key={item.id} className="menu-card">
                    <div className="card-header">
                      <span className={`veg-indicator ${item.is_veg ? 'veg' : 'non-veg'}`}></span>
                      <h3 className="dish-name">{item.name}</h3>
                      <div className="price">₹{priceType === 'customer' ? item.customer_price : item.trainer_price}</div>
                    </div>

                    {macros.calories > 0 && (
                      <div className="nutrition-content">
                        {/* Large Calorie Display */}
                        <div className="calorie-hero">
                          <div className="calorie-number">{macros.calories}</div>
                          <div className="calorie-label">CALORIES</div>
                        </div>

                        {/* Nutrition Table */}
                        <table className="nutrition-table">
                          <thead>
                            <tr>
                              <th>Nutrient</th>
                              <th>g</th>
                              <th>%</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td>🥩 Protein</td>
                              <td>{macros.protein}</td>
                              <td>{proteinPercent}</td>
                            </tr>
                            <tr>
                              <td>🍚 Carbs</td>
                              <td>{macros.carbs}</td>
                              <td>{carbsPercent}</td>
                            </tr>
                            <tr>
                              <td>🥑 Fat</td>
                              <td>{macros.fat}</td>
                              <td>{fatPercent}</td>
                            </tr>
                            <tr>
                              <td>🌾 Fiber</td>
                              <td>{macros.fiber}</td>
                              <td>-</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Print Styles */}
      <style jsx>{`
        @media print {
          .no-print {
            display: none !important;
          }
          
          body {
            margin: 0;
            padding: 0;
          }
          
          @page {
            size: A4;
            margin: 5mm;
          }
          
          .print-content {
            width: 100%;
          }
          
          .page {
            page-break-after: always;
            width: 100%;
          }
          
          .page:last-child {
            page-break-after: auto;
          }
          
          /* Page Header */
          .page-header {
            text-align: center;
            padding: 4mm 0 3mm 0;
            background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
            margin-bottom: 3mm;
          }
          
          .cafe-name {
            font-size: 18px;
            font-weight: 900;
            color: #fef3c7;
            margin: 0;
            letter-spacing: 1px;
            text-transform: uppercase;
            white-space: nowrap;
          }
          
          .cafe-location {
            font-size: 10px;
            color: #fed7aa;
            margin: 2px 0 0 0;
            font-weight: 600;
          }
          
          /* 2x4 Grid */
          .menu-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            column-gap: 6mm;
            row-gap: 6mm;
            padding: 0 3mm 3mm 3mm;
          }
          
          .menu-card {
            break-inside: avoid;
            page-break-inside: avoid;
            border: 1.5px solid #f97316;
            border-radius: 6px;
            overflow: hidden;
            background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
            padding: 3mm;
            display: flex;
            flex-direction: column;
          }
          
          /* Card Header */
          .card-header {
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            margin-bottom: 3mm;
            gap: 2mm;
          }
          
          .veg-indicator {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            flex-shrink: 0;
            margin-top: 2px;
          }
          
          .veg-indicator.veg {
            background: #10b981;
          }
          
          .veg-indicator.non-veg {
            background: #ef4444;
          }
          
          .dish-name {
            font-size: 13px;
            font-weight: 700;
            color: #92400e;
            line-height: 1.2;
            margin: 0;
            flex: 1;
          }
          
          .price {
            font-size: 16px;
            font-weight: 900;
            color: #ea580c;
            white-space: nowrap;
          }
          
          /* Nutrition Content */
          .nutrition-content {
            display: grid;
            grid-template-columns: 1fr 1.3fr;
            gap: 4mm;
            align-items: center;
            flex: 1;
          }
          
          /* Large Calorie Display */
          .calorie-hero {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 4mm 2mm;
          }
          
          .calorie-number {
            font-size: 36px;
            font-weight: 900;
            color: #92400e;
            line-height: 1;
          }
          
          .calorie-label {
            font-size: 9px;
            font-weight: 700;
            color: #92400e;
            letter-spacing: 1px;
            margin-top: 2mm;
          }
          
          /* Nutrition Table */
          .nutrition-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 9px;
          }
          
          .nutrition-table th {
            background: #f97316;
            color: #fef3c7;
            padding: 3px 4px;
            text-align: left;
            font-weight: 700;
            font-size: 8px;
            text-transform: uppercase;
          }
          
          .nutrition-table td {
            padding: 3px 4px;
            border-bottom: 0.5px solid #f97316;
            color: #92400e;
            font-weight: 600;
          }
          
          .nutrition-table td:first-child {
            font-size: 10px;
          }
          
          .nutrition-table td:nth-child(2),
          .nutrition-table td:nth-child(3) {
            text-align: center;
            font-weight: 700;
            color: #ea580c;
          }
          
          .nutrition-table tbody tr:last-child td {
            border-bottom: none;
          }
        }
        
        @media screen {
          .print-content {
            background: #f3f4f6;
            padding: 20px;
          }
          
          .page {
            background: #ffffff;
            margin-bottom: 30px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            border-radius: 8px;
            overflow: hidden;
          }
          
          /* Page Header - Screen */
          .page-header {
            text-align: center;
            padding: 20px;
            background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
          }
          
          .cafe-name {
            font-size: 28px;
            font-weight: 900;
            color: #fef3c7;
            margin: 0;
            letter-spacing: 2px;
            text-transform: uppercase;
          }
          
          .cafe-location {
            font-size: 14px;
            color: #fed7aa;
            margin: 4px 0 0 0;
            font-weight: 600;
          }
          
          /* Menu Grid - Screen */
          .menu-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            column-gap: 40px;
            row-gap: 40px;
            padding: 20px;
          }
          
          .menu-card {
            border: 2px solid #f97316;
            border-radius: 8px;
            overflow: hidden;
            background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
            padding: 16px;
            display: flex;
            flex-direction: column;
            transition: transform 0.2s, box-shadow 0.2s;
            box-shadow: 0 2px 4px rgba(249, 115, 22, 0.2);
          }
          
          .menu-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 8px rgba(249, 115, 22, 0.3);
          }
          
          /* Card Header - Screen */
          .card-header {
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            margin-bottom: 10px;
            gap: 8px;
          }
          
          .veg-indicator {
            width: 10px;
            height: 10px;
            border-radius: 50%;
            flex-shrink: 0;
            margin-top: 2px;
          }
          
          .veg-indicator.veg {
            background: #10b981;
          }
          
          .veg-indicator.non-veg {
            background: #ef4444;
          }
          
          .dish-name {
            font-size: 16px;
            font-weight: 700;
            color: #92400e;
            line-height: 1.3;
            margin: 0;
            flex: 1;
          }
          
          .price {
            font-size: 20px;
            font-weight: 900;
            color: #ea580c;
            white-space: nowrap;
          }
          
          /* Nutrition Content - Screen */
          .nutrition-content {
            display: grid;
            grid-template-columns: 1fr 1.3fr;
            gap: 16px;
            align-items: center;
            flex: 1;
          }
          
          /* Large Calorie Display - Screen */
          .calorie-hero {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 16px 8px;
          }
          
          .calorie-number {
            font-size: 48px;
            font-weight: 900;
            color: #92400e;
            line-height: 1;
          }
          
          .calorie-label {
            font-size: 12px;
            font-weight: 700;
            color: #92400e;
            letter-spacing: 1.5px;
            margin-top: 8px;
          }
          
          /* Nutrition Table - Screen */
          .nutrition-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 13px;
          }
          
          .nutrition-table th {
            background: #f97316;
            color: #fef3c7;
            padding: 6px 8px;
            text-align: left;
            font-weight: 700;
            font-size: 11px;
            text-transform: uppercase;
          }
          
          .nutrition-table td {
            padding: 6px 8px;
            border-bottom: 0.5px solid #f97316;
            color: #92400e;
            font-weight: 600;
          }
          
          .nutrition-table td:first-child {
            font-size: 13px;
          }
          
          .nutrition-table td:nth-child(2),
          .nutrition-table td:nth-child(3) {
            text-align: center;
            font-weight: 700;
            color: #ea580c;
          }
          
          .nutrition-table tbody tr:last-child td {
            border-bottom: none;
          }
          
          .nutrition-table tbody tr:hover {
            background: rgba(249, 115, 22, 0.1);
          }
        }
      `}</style>
    </div>
  );
};

export default CafeMenuBooklet;
