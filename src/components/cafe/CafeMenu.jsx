import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, X, ChevronDown, ChevronUp } from 'lucide-react';
import { getMenuItems, addMenuItem, updateMenuItem, deleteMenuItem, getInventory, addInventoryItem } from '../../services/cafeService';

const CafeMenu = ({ showToast }) => {
  const [menuItems, setMenuItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    category: 'main-course',
    customerPrice: '',
    trainerPrice: '',
    description: '',
    isVeg: true,
    rawMaterials: [],
    calories: '',
    cookingMethod: 'grilled',
  });
  const [currentMaterial, setCurrentMaterial] = useState({ name: '', quantity: '', unit: 'gm', extraPrice: 0 });
  const [inventoryItems, setInventoryItems] = useState([]);
  const [materialSearchTerm, setMaterialSearchTerm] = useState('');
  const [showMaterialDropdown, setShowMaterialDropdown] = useState(false);
  const [calculatedCalories, setCalculatedCalories] = useState(0);
  const [calorieBreakdown, setCalorieBreakdown] = useState([]);
  const [expandedCalories, setExpandedCalories] = useState({});
  const [calculatedMacros, setCalculatedMacros] = useState({ protein: 0, carbs: 0, fat: 0, fiber: 0 });
  const [macroBreakdown, setMacroBreakdown] = useState([]);

  // Cooking method adjustment factors
  const COOKING_ADJUSTMENTS = {
    raw: { weightLoss: 0, calorieAdd: 0, name: '🥗 Raw/Fresh', description: 'No cooking' },
    grilled: { weightLoss: 0.20, calorieAdd: 0, name: '🔥 Grilled', description: '-20% water loss' },
    boiled: { weightLoss: 0.15, calorieAdd: 0, name: '💧 Boiled', description: '-15% water loss' },
    steamed: { weightLoss: 0.10, calorieAdd: 0, name: '♨️ Steamed', description: '-10% water loss' },
    baked: { weightLoss: 0.18, calorieAdd: 0, name: '🍞 Baked', description: '-18% water loss' },
    fried: { weightLoss: 0.10, calorieAdd: 0.30, name: '🍳 Fried', description: '-10% water, +30% oil calories' },
    sauteed: { weightLoss: 0.12, calorieAdd: 0.15, name: '🥘 Sautéed', description: '-12% water, +15% oil calories' },
    microwave: { weightLoss: 0.08, calorieAdd: 0, name: '📡 Microwave', description: '-8% water loss' },
    soaked: { weightLoss: -0.50, calorieAdd: 0, name: '💦 Soaked', description: '+50% water absorption' },
    'boiled-sauteed': { weightLoss: 0.25, calorieAdd: 0.15, name: '💧+🥘 Boiled then Sautéed', description: '-25% water, +15% oil' },
    'steamed-sauteed': { weightLoss: 0.20, calorieAdd: 0.15, name: '♨️+🥘 Steamed then Sautéed', description: '-20% water, +15% oil' },
    'boiled-fried': { weightLoss: 0.22, calorieAdd: 0.30, name: '💧+🍳 Boiled then Fried', description: '-22% water, +30% oil' },
    'soaked-boiled': { weightLoss: -0.40, calorieAdd: 0, name: '💦+💧 Soaked then Boiled', description: '+40% water (net)' },
    'soaked-sauteed': { weightLoss: -0.40, calorieAdd: 0.15, name: '💦+🥘 Soaked then Sautéed', description: '+40% water, +15% oil' },
  };

  useEffect(() => {
    loadMenu();
    loadInventory();
  }, []);

  const loadInventory = async () => {
    const items = await getInventory();
    // Map snake_case to camelCase for inventory items
    const mappedItems = items.map(item => ({
      ...item,
      caloriesPer100g: item.calories_per_100g ?? item.caloriesPer100g,
      proteinPer100g: item.protein_per_100g ?? item.proteinPer100g,
      carbsPer100g: item.carbs_per_100g ?? item.carbsPer100g,
      fatPer100g: item.fat_per_100g ?? item.fatPer100g,
      fiberPer100g: item.fiber_per_100g ?? item.fiberPer100g,
    }));
    setInventoryItems(mappedItems);
  };

  const loadMenu = async () => {
    const items = await getMenuItems();
    // Map snake_case to camelCase
    const mappedItems = items.map(item => ({
      ...item,
      customerPrice: item.customer_price ?? item.customerPrice,
      trainerPrice: item.trainer_price ?? item.trainerPrice,
      isVeg: item.is_veg ?? item.isVeg,
      rawMaterials: item.raw_materials ?? item.rawMaterials,
      isActive: item.is_active ?? item.isActive,
      calories: item.calories ?? item.calories,
    }));
    setMenuItems(mappedItems);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Prepare data with proper numeric handling
    const submitData = {
      ...formData,
      customerPrice: formData.customerPrice === '' ? 0 : parseFloat(formData.customerPrice) || 0,
      trainerPrice: formData.trainerPrice === '' ? 0 : parseFloat(formData.trainerPrice) || 0,
    };
    
    if (editingItem) {
      await updateMenuItem(editingItem.id, submitData);
      showToast('Menu item updated successfully');
    } else {
      await addMenuItem(submitData);
      showToast('Menu item added successfully');
    }
    
    resetForm();
    await loadMenu();
  };

  const handleDelete = async (id) => {
    if (confirm('Delete this menu item?')) {
      await deleteMenuItem(id);
      showToast('Menu item deleted');
      await loadMenu();
    }
  };

  const resetForm = () => {
    setFormData({ name: '', category: 'main-course', customerPrice: '', trainerPrice: '', description: '', isVeg: true, rawMaterials: [], calories: '', cookingMethod: 'sauteed' });
    setCurrentMaterial({ name: '', quantity: '', unit: 'gm' });
    setMaterialSearchTerm('');
    setShowMaterialDropdown(false);
    setEditingItem(null);
    setShowModal(false);
    setCalculatedCalories(0);
    setCalorieBreakdown([]);
  };

  const handleMaterialSelect = (material) => {
    setCurrentMaterial({
      name: material.name,
      quantity: '',
      unit: material.unit,
      extraPrice: 0
    });
    setMaterialSearchTerm(material.name);
    setShowMaterialDropdown(false);
  };

  const handleMaterialSearchChange = (value) => {
    setMaterialSearchTerm(value);
    const inventoryItem = inventoryItems.find(item => item.name.toLowerCase() === value.toLowerCase());
    setCurrentMaterial({ 
      ...currentMaterial, 
      name: value,
      unit: inventoryItem?.unit || currentMaterial.unit
    });
    setShowMaterialDropdown(true);
  };

  const filteredInventory = inventoryItems.filter(item =>
    item.name.toLowerCase().includes(materialSearchTerm.toLowerCase())
  );

  // Calculate calories and macros from ingredients
  const calculateCalories = (materials) => {
    let totalCalories = 0;
    const breakdown = [];

    materials.forEach(material => {
      const inventoryItem = inventoryItems.find(item => 
        item.name.toLowerCase() === material.name.toLowerCase()
      );
      
      if (inventoryItem && inventoryItem.caloriesPer100g) {
        const quantity = parseFloat(material.quantity) || 0;
        // Convert quantity to grams if needed
        let quantityInGrams = quantity;
        if (material.unit === 'ml') {
          quantityInGrams = quantity; // Assume 1ml = 1g for simplicity
        } else if (material.unit === 'pcs') {
          quantityInGrams = quantity * 100; // Assume 1 piece = 100g (can be adjusted)
        }
        
        // Calculate calories: (caloriesPer100g * quantity) / 100
        const calories = (inventoryItem.caloriesPer100g * quantityInGrams) / 100;
        totalCalories += calories;
        
        breakdown.push({
          name: material.name,
          quantity: material.quantity,
          unit: material.unit,
          caloriesPer100g: inventoryItem.caloriesPer100g,
          calories: calories.toFixed(1)
        });
      }
    });

    return { total: totalCalories.toFixed(1), breakdown };
  };

  // Calculate all macronutrients from ingredients with cooking adjustments
  const calculateMacros = (materials, cookingMethod = 'grilled') => {
    let totals = { protein: 0, carbs: 0, fat: 0, fiber: 0, calories: 0 };
    const breakdown = [];

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
          quantityInGrams = quantity * 100;
        }
        
        const protein = inventoryItem.proteinPer100g ? (inventoryItem.proteinPer100g * quantityInGrams) / 100 : 0;
        const carbs = inventoryItem.carbsPer100g ? (inventoryItem.carbsPer100g * quantityInGrams) / 100 : 0;
        const fat = inventoryItem.fatPer100g ? (inventoryItem.fatPer100g * quantityInGrams) / 100 : 0;
        const fiber = inventoryItem.fiberPer100g ? (inventoryItem.fiberPer100g * quantityInGrams) / 100 : 0;
        const calories = inventoryItem.caloriesPer100g ? (inventoryItem.caloriesPer100g * quantityInGrams) / 100 : 0;
        
        totals.protein += protein;
        totals.carbs += carbs;
        totals.fat += fat;
        totals.fiber += fiber;
        totals.calories += calories;
        
        breakdown.push({
          name: material.name,
          quantity: material.quantity,
          unit: material.unit,
          protein: protein.toFixed(1),
          carbs: carbs.toFixed(1),
          fat: fat.toFixed(1),
          fiber: fiber.toFixed(1)
        });
      }
    });

    // Apply cooking adjustments
    const adjustment = COOKING_ADJUSTMENTS[cookingMethod] || COOKING_ADJUSTMENTS.grilled;
    
    // For fried items, add oil calories (30% increase)
    if (adjustment.calorieAdd > 0) {
      totals.calories *= (1 + adjustment.calorieAdd);
      totals.fat *= (1 + adjustment.calorieAdd); // Oil adds fat
    }
    
    // Note: Weight loss doesn't change total nutrition, just concentration
    // We keep total macros the same as they represent the full serving

    return { 
      totals: {
        protein: totals.protein.toFixed(1),
        carbs: totals.carbs.toFixed(1),
        fat: totals.fat.toFixed(1),
        fiber: totals.fiber.toFixed(1),
        calories: totals.calories.toFixed(1)
      }, 
      breakdown 
    };
  };

  // Recalculate calories and macros whenever raw materials or cooking method change
  useEffect(() => {
    if (formData.rawMaterials.length > 0) {
      const { total, breakdown } = calculateCalories(formData.rawMaterials);
      
      const macros = calculateMacros(formData.rawMaterials, formData.cookingMethod);
      setCalculatedMacros(macros.totals);
      setMacroBreakdown(macros.breakdown);
      
      // Use adjusted calories from macros calculation
      const adjustedCalories = parseFloat(macros.totals.calories) || parseFloat(total) || 0;
      setCalculatedCalories(adjustedCalories);
      setCalorieBreakdown(breakdown);
      
      // Only auto-update if there's actual calorie data
      if (adjustedCalories > 0) {
        setFormData(prev => ({ ...prev, calories: adjustedCalories.toFixed(1) }));
      }
    } else {
      setCalculatedCalories(0);
      setCalorieBreakdown([]);
      setCalculatedMacros({ protein: 0, carbs: 0, fat: 0, fiber: 0 });
      setMacroBreakdown([]);
    }
  }, [formData.rawMaterials, formData.cookingMethod, inventoryItems]);

  const addRawMaterial = async () => {
    if (currentMaterial.name && currentMaterial.quantity) {
      // Check if material exists in inventory
      const existingItem = inventoryItems.find(item => 
        item.name.toLowerCase() === currentMaterial.name.toLowerCase()
      );
      
      // If not in inventory, add it
      if (!existingItem) {
        try {
          await addInventoryItem({
            name: currentMaterial.name,
            currentStock: 0,
            minStock: 0,
            unit: currentMaterial.unit,
            category: 'Dry Store',
            pricePerUnit: 0,
          });
          await loadInventory();
          showToast(`✅ Added "${currentMaterial.name}" to inventory`);
        } catch (error) {
          showToast(`❌ Error adding to inventory: ${error.message}`);
          return;
        }
      }
      
      setFormData({
        ...formData,
        rawMaterials: [...formData.rawMaterials, { ...currentMaterial }]
      });
      setCurrentMaterial({ name: '', quantity: '', unit: 'gm', extraPrice: 0 });
      setMaterialSearchTerm('');
    }
  };

  const removeRawMaterial = (index) => {
    setFormData({
      ...formData,
      rawMaterials: formData.rawMaterials.filter((_, i) => i !== index)
    });
  };

  const filteredItems = menuItems.filter(item => {
    const matchesSearch = item.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-4 md:space-y-6 p-2 md:p-0">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl md:text-3xl font-black bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">Menu Items</h2>
          <p className="text-sm md:text-base text-gray-600 font-semibold mt-1">Manage your cafe menu</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center justify-center gap-2 px-4 md:px-6 py-2 md:py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-bold hover:from-purple-700 hover:to-indigo-700 transition shadow-lg hover:shadow-xl text-sm md:text-base w-full md:w-auto"
        >
          <Plus className="w-4 h-4 md:w-5 md:h-5" />
          Add Menu Item
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search menu items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            <option value="all">All Categories</option>
            <option value="main-course">Main Course</option>
            <option value="appetizer">Appetizer</option>
            <option value="dessert">Dessert</option>
            <option value="beverage">Beverage</option>
            <option value="snack">Snack</option>
          </select>
        </div>
      </div>

      {/* Menu Items Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-x-auto">
        <table className="w-full min-w-[800px]">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-3 md:px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Dish</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Dish Name</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Raw Materials</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase w-32">Price</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase w-32">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredItems.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                  No menu items found
                </td>
              </tr>
            ) : (
              filteredItems.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                      item.isVeg ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {item.isVeg ? '🟢' : '🔴'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-semibold text-gray-900">{item.name}</span>
                  </td>
                  <td className="px-6 py-4">
                    {item.rawMaterials && item.rawMaterials.length > 0 ? (
                      <div className="text-xs text-gray-600">
                        {item.rawMaterials.map((m, i) => (
                          <span key={i}>
                            {m.name} ({m.quantity}{m.unit})
                            {i < item.rawMaterials.length - 1 ? ', ' : ''}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <div className="text-sm font-semibold text-gray-900">₹{item.customerPrice || 0}</div>
                      {item.trainerPrice !== undefined && item.trainerPrice !== null && (
                        <div className="text-xs text-gray-500">Trainer: ₹{item.trainerPrice}</div>
                      )}
                      {item.calories && (
                        <div>
                          <button
                            onClick={() => setExpandedCalories(prev => ({...prev, [item.id]: !prev[item.id]}))}
                            className="text-xs text-orange-600 font-semibold hover:text-orange-700 flex items-center gap-1"
                          >
                            🔥 {item.calories} cal
                            {item.rawMaterials && item.rawMaterials.length > 0 && (
                              expandedCalories[item.id] ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                            )}
                          </button>
                          {expandedCalories[item.id] && item.rawMaterials && item.rawMaterials.length > 0 && (
                            <div className="mt-2 p-2 bg-orange-50 border border-orange-200 rounded text-xs">
                              <div className="font-semibold text-orange-800 mb-1">Breakdown:</div>
                              {(() => {
                                const breakdown = calculateCalories(item.rawMaterials);
                                return (
                                  <div className="space-y-0.5">
                                    {breakdown.breakdown.map((ing, idx) => (
                                      <div key={idx} className="flex justify-between text-orange-700">
                                        <span>{ing.name} ({ing.quantity}{ing.unit})</span>
                                        <span className="font-semibold">{ing.calories} cal</span>
                                      </div>
                                    ))}
                                  </div>
                                );
                              })()}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditingItem(item);
                          setFormData(item);
                          setShowModal(true);
                        }}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl w-full max-w-4xl my-8">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold">{editingItem ? 'Edit' : 'Add'} Menu Item</h3>
                <button onClick={resetForm}>
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Dish Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="e.g., Paneer Butter Masala"
                    required
                  />
                </div>

                <div className="grid grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Customer Price (₹)</label>
                    <input
                      type="number"
                      value={formData.customerPrice}
                      onChange={(e) => setFormData({...formData, customerPrice: parseFloat(e.target.value)})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="e.g., 250"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Trainer Price (₹)</label>
                    <input
                      type="number"
                      value={formData.trainerPrice}
                      onChange={(e) => setFormData({...formData, trainerPrice: parseFloat(e.target.value) || 0})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="e.g., 0 (free)"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          checked={formData.isVeg === true}
                          onChange={() => setFormData({...formData, isVeg: true})}
                          className="w-4 h-4 text-green-600"
                        />
                        <span className="text-sm font-medium text-gray-700">🟢 Veg</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          checked={formData.isVeg === false}
                          onChange={() => setFormData({...formData, isVeg: false})}
                          className="w-4 h-4 text-red-600"
                        />
                        <span className="text-sm font-medium text-gray-700">🔴 Non-Veg</span>
                      </label>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Cooking Method</label>
                    <select
                      value={formData.cookingMethod}
                      onChange={(e) => setFormData({...formData, cookingMethod: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm font-semibold"
                    >
                      {Object.entries(COOKING_ADJUSTMENTS).map(([key, value]) => (
                        <option key={key} value={key}>{value.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Macro Nutrients Section - Paragraph Format */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Macro Nutrients per Serving {calculatedCalories > 0 ? '(Auto-calculated - editable)' : '(Optional)'}
                  </label>
                  <div className="p-4 bg-gradient-to-r from-green-50 to-orange-50 border border-gray-300 rounded-lg">
                    <div className="flex flex-wrap items-center gap-3 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-700">🔥 Calories:</span>
                        <input
                          type="number"
                          step="0.1"
                          value={formData.calories}
                          onChange={(e) => setFormData({...formData, calories: e.target.value})}
                          className={`w-20 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-orange-500 text-center ${calculatedCalories > 0 ? 'bg-green-100 font-bold text-green-700' : ''}`}
                          placeholder="450"
                        />
                        <span className="text-gray-600">kcal</span>
                      </div>
                      <span className="text-gray-400">|</span>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-700">💪 Protein:</span>
                        <span className={`px-2 py-1 rounded ${calculatedMacros.protein > 0 ? 'bg-blue-100 font-bold text-blue-700' : 'text-gray-500'}`}>
                          {calculatedMacros.protein > 0 ? calculatedMacros.protein : '0'}g
                        </span>
                      </div>
                      <span className="text-gray-400">|</span>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-700">🍚 Carbs:</span>
                        <span className={`px-2 py-1 rounded ${calculatedMacros.carbs > 0 ? 'bg-yellow-100 font-bold text-yellow-700' : 'text-gray-500'}`}>
                          {calculatedMacros.carbs > 0 ? calculatedMacros.carbs : '0'}g
                        </span>
                      </div>
                      <span className="text-gray-400">|</span>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-700">🥑 Fat:</span>
                        <span className={`px-2 py-1 rounded ${calculatedMacros.fat > 0 ? 'bg-orange-100 font-bold text-orange-700' : 'text-gray-500'}`}>
                          {calculatedMacros.fat > 0 ? calculatedMacros.fat : '0'}g
                        </span>
                      </div>
                      <span className="text-gray-400">|</span>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-700">🌾 Fiber:</span>
                        <span className={`px-2 py-1 rounded ${calculatedMacros.fiber > 0 ? 'bg-green-100 font-bold text-green-700' : 'text-gray-500'}`}>
                          {calculatedMacros.fiber > 0 ? calculatedMacros.fiber : '0'}g
                        </span>
                      </div>
                    </div>
                    {calculatedCalories > 0 && (
                      <div className="mt-2 text-xs text-green-700 font-semibold">
                        ✅ Auto-calculated from ingredients ({COOKING_ADJUSTMENTS[formData.cookingMethod]?.name}: {COOKING_ADJUSTMENTS[formData.cookingMethod]?.description})
                      </div>
                    )}
                    {formData.rawMaterials.length > 0 && calculatedCalories === 0 && (
                      <p className="text-xs text-amber-600 mt-2">
                        ⚠️ Add nutrition data to inventory items to enable auto-calculation
                      </p>
                    )}
                  </div>
                </div>

                {/* Raw Materials Section */}
                <div className="border-t pt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-3">Raw Materials</label>
                  
                  {/* Add Raw Material */}
                  <div className="bg-gray-50 rounded-lg p-4 mb-3">
                    {/* Headers */}
                    <div className="grid grid-cols-12 gap-2 mb-2 text-xs font-semibold text-gray-600">
                      <div className="col-span-4">Ingredient Name</div>
                      <div className="col-span-2">Quantity</div>
                      <div className="col-span-2">Unit</div>
                      <div className="col-span-2">Extra Price (₹/unit)</div>
                      <div className="col-span-2">Action</div>
                    </div>
                    <div className="grid grid-cols-12 gap-2">
                      {/* Searchable Material Dropdown */}
                      <div className="col-span-4 relative">
                        <input
                          type="text"
                          placeholder="Search inventory..."
                          value={materialSearchTerm}
                          onChange={(e) => handleMaterialSearchChange(e.target.value)}
                          onFocus={() => setShowMaterialDropdown(true)}
                          onBlur={() => setTimeout(() => setShowMaterialDropdown(false), 200)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                        />
                        
                        {/* Dropdown */}
                        {showMaterialDropdown && materialSearchTerm && (
                          <div className="absolute z-50 w-full mt-1 bg-white border-2 border-orange-300 rounded-lg shadow-xl max-h-48 overflow-y-auto">
                            {filteredInventory.length > 0 ? (
                              filteredInventory.map((item, index) => (
                                <button
                                  key={index}
                                  type="button"
                                  onClick={() => handleMaterialSelect(item)}
                                  className="w-full px-3 py-2 text-left hover:bg-orange-50 transition border-b border-gray-100 last:border-0"
                                >
                                  <span className="font-semibold text-gray-900">{item.name}</span>
                                  <span className="text-xs text-gray-500 ml-2">
                                    (Stock: {item.currentStock}{item.unit})
                                  </span>
                                </button>
                              ))
                            ) : (
                              <div className="px-3 py-3 text-sm">
                                <div className="text-gray-500 mb-2">No inventory items found</div>
                                <div className="text-xs text-orange-600 font-semibold">
                                  💡 Type ingredient name and click "Add" to create it
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      
                      <input
                        type="number"
                        placeholder="Qty"
                        value={currentMaterial.quantity}
                        onChange={(e) => setCurrentMaterial({...currentMaterial, quantity: e.target.value})}
                        className="col-span-2 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                      />
                      <select
                        value={currentMaterial.unit}
                        onChange={(e) => setCurrentMaterial({...currentMaterial, unit: e.target.value})}
                        className="col-span-2 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                        disabled={currentMaterial.name && inventoryItems.find(item => item.name === currentMaterial.name)}
                      >
                        <option value="gm">gm</option>
                        <option value="ml">ml</option>
                        <option value="pcs">pcs</option>
                      </select>
                      <input
                        type="number"
                        step="0.01"
                        placeholder="Extra ₹/unit"
                        value={currentMaterial.extraPrice === 0 ? '' : currentMaterial.extraPrice}
                        onChange={(e) => {
                          const value = e.target.value;
                          setCurrentMaterial({...currentMaterial, extraPrice: value === '' ? 0 : parseFloat(value) || 0});
                        }}
                        className="col-span-2 px-3 py-2 border border-orange-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                        title="Price per unit when customer adds extra"
                      />
                      <button
                        type="button"
                        onClick={addRawMaterial}
                        className="col-span-2 px-3 py-2 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700 transition text-sm"
                      >
                        Add
                      </button>
                    </div>
                  </div>

                  {/* Raw Materials List */}
                  {formData.rawMaterials.length > 0 && (
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {formData.rawMaterials.map((material, index) => (
                        <div key={index} className="flex items-center justify-between bg-white border border-gray-200 rounded-lg p-3">
                          <div className="flex-1">
                            <span className="font-semibold text-gray-900">{material.name}</span>
                            <span className="text-gray-600 ml-2">- {material.quantity} {material.unit}</span>
                            {material.extraPrice > 0 && (
                              <span className="text-orange-600 ml-2 text-xs font-semibold">
                                (Extra: ₹{material.extraPrice}/{material.unit})
                              </span>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => removeRawMaterial(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700 transition"
                  >
                    {editingItem ? 'Update' : 'Add'} Item
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CafeMenu;
