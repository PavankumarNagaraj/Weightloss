import React, { useState, useEffect } from 'react';
import { Printer, Download, Grid3x3, Grid2x2 } from 'lucide-react';
import { getMenuItems } from '../../services/cafeService';

const CafeMenuBooklet = ({ showToast }) => {
  const [menuItems, setMenuItems] = useState([]);
  const [layout, setLayout] = useState('4'); // '2' or '4' dishes per page
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showVeg, setShowVeg] = useState(true);
  const [showNonVeg, setShowNonVeg] = useState(true);
  const [priceType, setPriceType] = useState('customer'); // 'customer' or 'trainer'

  useEffect(() => {
    loadMenuItems();
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
      <div className="no-print mb-6 bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">📖 Menu Booklet Generator</h2>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition"
          >
            <Printer className="w-5 h-5" />
            Print Menu
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Layout Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Layout</label>
            <div className="flex gap-2">
              <button
                onClick={() => setLayout('2')}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg border-2 transition ${
                  layout === '2' ? 'border-orange-600 bg-orange-50 text-orange-600' : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <Grid2x2 className="w-4 h-4" />
                2 per page
              </button>
              <button
                onClick={() => setLayout('4')}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg border-2 transition ${
                  layout === '4' ? 'border-orange-600 bg-orange-50 text-orange-600' : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <Grid3x3 className="w-4 h-4" />
                4 per page
              </button>
            </div>
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
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
            <label className="block text-sm font-medium text-gray-700 mb-2">Price Type</label>
            <select
              value={priceType}
              onChange={(e) => setPriceType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
            >
              <option value="customer">Customer Price</option>
              <option value="trainer">Trainer Price</option>
            </select>
          </div>

          {/* Veg/Non-Veg Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Food Type</label>
            <div className="flex gap-2">
              <button
                onClick={() => setShowVeg(!showVeg)}
                className={`flex-1 px-3 py-2 rounded-lg border-2 transition ${
                  showVeg ? 'border-green-600 bg-green-50 text-green-600' : 'border-gray-300'
                }`}
              >
                🟢 Veg
              </button>
              <button
                onClick={() => setShowNonVeg(!showNonVeg)}
                className={`flex-1 px-3 py-2 rounded-lg border-2 transition ${
                  showNonVeg ? 'border-red-600 bg-red-50 text-red-600' : 'border-gray-300'
                }`}
              >
                🔴 Non-Veg
              </button>
            </div>
          </div>
        </div>

        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>📄 {filteredItems.length} dishes</strong> will be printed • 
            <strong> {Math.ceil(filteredItems.length / parseInt(layout))} pages</strong> • 
            Layout: <strong>{layout} dishes per A4 page</strong>
          </p>
        </div>
      </div>

      {/* Printable Menu */}
      <div className={`print-content ${layout === '2' ? 'layout-2' : 'layout-4'}`}>
        {filteredItems.map((item, index) => (
          <div key={item.id} className="menu-card">
            <div className="menu-card-inner">
              {/* Header */}
              <div className="menu-card-header">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-2xl">{getCategoryIcon(item.category)}</span>
                      <span className={`w-3 h-3 rounded-full ${item.is_veg ? 'bg-green-500' : 'bg-red-500'}`}></span>
                    </div>
                    <h3 className="menu-card-title">{item.name}</h3>
                  </div>
                  <div className="menu-card-price">
                    ₹{priceType === 'customer' ? item.customer_price : item.trainer_price}
                  </div>
                </div>
              </div>

              {/* Description */}
              {item.description && (
                <p className="menu-card-description">{item.description}</p>
              )}

              {/* Calories */}
              {item.calories && (
                <div className="menu-card-calories">
                  🔥 {item.calories} cal
                </div>
              )}

              {/* Footer */}
              <div className="menu-card-footer">
                <span className="menu-card-category">
                  {item.category.replace('-', ' ').toUpperCase()}
                </span>
              </div>
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
          
          .print-content {
            display: grid;
            gap: 10mm;
            padding: 10mm;
          }
          
          .layout-2 {
            grid-template-columns: 1fr;
            gap: 15mm;
          }
          
          .layout-4 {
            grid-template-columns: repeat(2, 1fr);
            gap: 8mm;
          }
          
          .menu-card {
            break-inside: avoid;
            page-break-inside: avoid;
            border: 2px solid #f97316;
            border-radius: 12px;
            overflow: hidden;
            background: white;
          }
          
          .layout-2 .menu-card {
            min-height: 130mm;
          }
          
          .layout-4 .menu-card {
            min-height: 60mm;
          }
          
          .menu-card-inner {
            padding: 15px;
            height: 100%;
            display: flex;
            flex-direction: column;
          }
          
          .menu-card-header {
            margin-bottom: 10px;
          }
          
          .menu-card-title {
            font-size: 18px;
            font-weight: 700;
            color: #1f2937;
            line-height: 1.3;
          }
          
          .layout-2 .menu-card-title {
            font-size: 24px;
          }
          
          .menu-card-price {
            font-size: 24px;
            font-weight: 800;
            color: #f97316;
            white-space: nowrap;
          }
          
          .layout-2 .menu-card-price {
            font-size: 32px;
          }
          
          .menu-card-description {
            font-size: 12px;
            color: #6b7280;
            line-height: 1.5;
            margin-bottom: 10px;
            flex: 1;
          }
          
          .layout-2 .menu-card-description {
            font-size: 14px;
          }
          
          .menu-card-calories {
            font-size: 13px;
            font-weight: 600;
            color: #ea580c;
            margin-bottom: 10px;
          }
          
          .menu-card-footer {
            margin-top: auto;
            padding-top: 10px;
            border-top: 1px solid #e5e7eb;
          }
          
          .menu-card-category {
            font-size: 10px;
            font-weight: 600;
            color: #9ca3af;
            letter-spacing: 0.5px;
          }
          
          @page {
            size: A4;
            margin: 10mm;
          }
        }
        
        @media screen {
          .print-content {
            display: grid;
            gap: 20px;
          }
          
          .layout-2 {
            grid-template-columns: 1fr;
          }
          
          .layout-4 {
            grid-template-columns: repeat(2, 1fr);
          }
          
          .menu-card {
            border: 2px solid #f97316;
            border-radius: 12px;
            overflow: hidden;
            background: white;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            transition: transform 0.2s;
          }
          
          .menu-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
          }
          
          .menu-card-inner {
            padding: 20px;
            height: 100%;
            display: flex;
            flex-direction: column;
          }
          
          .menu-card-header {
            margin-bottom: 12px;
          }
          
          .menu-card-title {
            font-size: 20px;
            font-weight: 700;
            color: #1f2937;
            line-height: 1.3;
          }
          
          .menu-card-price {
            font-size: 28px;
            font-weight: 800;
            color: #f97316;
            white-space: nowrap;
          }
          
          .menu-card-description {
            font-size: 14px;
            color: #6b7280;
            line-height: 1.6;
            margin-bottom: 12px;
            flex: 1;
          }
          
          .menu-card-calories {
            font-size: 14px;
            font-weight: 600;
            color: #ea580c;
            margin-bottom: 12px;
          }
          
          .menu-card-footer {
            margin-top: auto;
            padding-top: 12px;
            border-top: 1px solid #e5e7eb;
          }
          
          .menu-card-category {
            font-size: 11px;
            font-weight: 600;
            color: #9ca3af;
            letter-spacing: 0.5px;
          }
        }
      `}</style>
    </div>
  );
};

export default CafeMenuBooklet;
