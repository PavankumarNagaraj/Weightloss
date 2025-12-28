import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, X, ChevronDown, ChevronUp, Mail, Maximize2 } from 'lucide-react';
import { getMenuItems, addMenuItem, updateMenuItem, deleteMenuItem, getInventory, addInventoryItem, getSettings } from '../../services/cafeService';
import { sendNutritionChartEmail } from '../../services/emailService';

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
  });
  const [currentMaterial, setCurrentMaterial] = useState({ name: '', quantity: '', unit: 'gm', extraPrice: 0, cookingMethod: 'sauteed' });
  const [inventoryItems, setInventoryItems] = useState([]);
  const [materialSearchTerm, setMaterialSearchTerm] = useState('');
  const [showMaterialDropdown, setShowMaterialDropdown] = useState(false);
  const [calculatedCalories, setCalculatedCalories] = useState(0);
  const [calorieBreakdown, setCalorieBreakdown] = useState([]);
  const [expandedCalories, setExpandedCalories] = useState({});
  const [calculatedMacros, setCalculatedMacros] = useState({ protein: 0, carbs: 0, fat: 0, fiber: 0 });
  const [macroBreakdown, setMacroBreakdown] = useState([]);
  const [showCalorieChart, setShowCalorieChart] = useState(false);
  const [selectedItemForChart, setSelectedItemForChart] = useState(null);
  const [recipientEmail, setRecipientEmail] = useState('');
  const [showKitchenView, setShowKitchenView] = useState(false);
  const [selectedItemForKitchen, setSelectedItemForKitchen] = useState(null);

  // Cooking method adjustment factors
  const COOKING_ADJUSTMENTS = {
    none: { weightLoss: 0, calorieAdd: 0, name: '✅ None (Already Cooked)', description: 'No adjustments - use as-is' },
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

  // Helper function to calculate raw equivalent weight for inventory deduction
  // This solves the problem: If inventory is raw but recipe uses cooked weight
  const calculateRawEquivalent = (cookedWeight, cookingMethod, inventoryState) => {
    // If inventory is already cooked, no conversion needed
    if (inventoryState === 'cooked') {
      return cookedWeight;
    }
    
    // If inventory is raw and recipe uses raw, no conversion needed
    if (cookingMethod === 'raw' || cookingMethod === 'none') {
      return cookedWeight;
    }
    
    // Calculate raw weight needed to get the cooked weight
    const adjustment = COOKING_ADJUSTMENTS[cookingMethod] || COOKING_ADJUSTMENTS.raw;
    const rawWeight = cookedWeight / (1 - adjustment.weightLoss);
    
    return rawWeight;
  };

  useEffect(() => {
    loadMenu();
    loadInventory();
    loadRecipientEmail();
  }, []);

  const loadRecipientEmail = async () => {
    const settings = await getSettings();
    setRecipientEmail(settings.recipient_email || '');
  };

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
      inventoryState: item.inventory_state ?? item.inventoryState ?? 'raw',
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
    setFormData({ name: '', category: 'main-course', customerPrice: '', trainerPrice: '', description: '', isVeg: true, rawMaterials: [], calories: '' });
    setCurrentMaterial({ name: '', quantity: '', unit: 'gm', extraPrice: 0, cookingMethod: 'sauteed' });
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
  // IMPORTANT: Nutritional values in inventory should match the inventory state
  // - If inventory is 'raw', caloriesPer100g should be for raw ingredient
  // - If inventory is 'cooked', caloriesPer100g should be for cooked ingredient
  const calculateCalories = (materials) => {
    let totalCalories = 0;
    const breakdown = [];

    materials.forEach(material => {
      const inventoryItem = inventoryItems.find(item => 
        item.name.toLowerCase() === material.name.toLowerCase()
      );
      
      if (inventoryItem && inventoryItem.caloriesPer100g) {
        const quantity = parseFloat(material.quantity) || 0;
        const inventoryState = inventoryItem.inventoryState || 'raw';
        const cookingMethod = material.cookingMethod || 'raw';
        
        // Convert quantity to grams if needed
        let quantityInGrams = quantity;
        if (material.unit === 'ml') {
          quantityInGrams = quantity; // Assume 1ml = 1g for simplicity
        } else if (material.unit === 'pcs') {
          // Special handling for eggs: 1 egg = 45g
          const isEgg = material.name.toLowerCase().includes('egg');
          quantityInGrams = quantity * (isEgg ? 45 : 100);
        }
        
        // Calculate base calories from inventory nutritional data
        // The inventory nutritional values match the inventory state (raw or cooked)
        let calories = (inventoryItem.caloriesPer100g * quantityInGrams) / 100;
        
        // If inventory is raw but we're using it cooked, the weight changes
        // The calories stay roughly the same (just water loss), but concentrated per gram
        // This is already handled by the inventory deduction using raw equivalent
        // For display purposes, we show calories based on the actual weight used in recipe
        
        totalCalories += calories;
        
        breakdown.push({
          name: material.name,
          quantity: material.quantity,
          unit: material.unit,
          caloriesPer100g: inventoryItem.caloriesPer100g,
          calories: calories.toFixed(1),
          inventoryState: inventoryState,
          cookingMethod: cookingMethod
        });
      }
    });

    return { total: totalCalories.toFixed(1), breakdown };
  };

  // Calculate all macronutrients from ingredients with per-ingredient cooking adjustments
  // IMPORTANT: This uses the inventory nutritional data which should match inventory state
  const calculateMacros = (materials) => {
    let totals = { protein: 0, carbs: 0, fat: 0, fiber: 0, calories: 0 };
    const breakdown = [];

    materials.forEach(material => {
      const inventoryItem = inventoryItems.find(item => 
        item.name.toLowerCase() === material.name.toLowerCase()
      );
      
      if (inventoryItem) {
        const quantity = parseFloat(material.quantity) || 0;
        const inventoryState = inventoryItem.inventoryState || 'raw';
        const cookingMethod = material.cookingMethod || 'raw';
        
        let quantityInGrams = quantity;
        if (material.unit === 'ml') {
          quantityInGrams = quantity;
        } else if (material.unit === 'pcs') {
          // Special handling for eggs: 1 egg = 45g
          const isEgg = material.name.toLowerCase().includes('egg');
          quantityInGrams = quantity * (isEgg ? 45 : 100);
        }
        
        let protein = inventoryItem.proteinPer100g ? (inventoryItem.proteinPer100g * quantityInGrams) / 100 : 0;
        let carbs = inventoryItem.carbsPer100g ? (inventoryItem.carbsPer100g * quantityInGrams) / 100 : 0;
        let fat = inventoryItem.fatPer100g ? (inventoryItem.fatPer100g * quantityInGrams) / 100 : 0;
        let fiber = inventoryItem.fiberPer100g ? (inventoryItem.fiberPer100g * quantityInGrams) / 100 : 0;
        let calories = inventoryItem.caloriesPer100g ? (inventoryItem.caloriesPer100g * quantityInGrams) / 100 : 0;
        
        // Apply per-ingredient cooking adjustments
        const adjustment = COOKING_ADJUSTMENTS[cookingMethod] || COOKING_ADJUSTMENTS.raw;
        
        // For fried/sauteed items, add oil calories and fat
        if (adjustment.calorieAdd > 0) {
          calories *= (1 + adjustment.calorieAdd);
          fat *= (1 + adjustment.calorieAdd);
        }
        
        totals.protein += protein;
        totals.carbs += carbs;
        totals.fat += fat;
        totals.fiber += fiber;
        totals.calories += calories;
        
        breakdown.push({
          name: material.name,
          quantity: material.quantity,
          unit: material.unit,
          cookingMethod: cookingMethod,
          protein: protein.toFixed(1),
          carbs: carbs.toFixed(1),
          fat: fat.toFixed(1),
          fiber: fiber.toFixed(1),
          calories: calories.toFixed(1)
        });
      }
    });

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

  // Recalculate calories and macros whenever raw materials change
  useEffect(() => {
    if (formData.rawMaterials.length > 0) {
      const { total, breakdown } = calculateCalories(formData.rawMaterials);
      
      const macros = calculateMacros(formData.rawMaterials);
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
  }, [formData.rawMaterials, inventoryItems]);

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
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase w-24">Calories</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase w-24">Customer Price</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase w-24">Trainer Price</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase w-24">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredItems.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
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
                    <button
                      onClick={() => {
                        setSelectedItemForKitchen(item);
                        setShowKitchenView(true);
                      }}
                      className="font-semibold text-gray-900 hover:text-orange-600 hover:underline transition text-left"
                    >
                      {item.name}
                    </button>
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
                    {item.calories ? (
                      <button
                        onClick={() => {
                          setSelectedItemForChart(item);
                          setShowCalorieChart(true);
                        }}
                        className="text-sm text-orange-600 font-semibold hover:text-orange-700 underline decoration-dotted hover:decoration-solid transition"
                      >
                        🔥 {item.calories}
                      </button>
                    ) : (
                      <span className="text-xs text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-semibold text-gray-900">₹{item.customerPrice || 0}</div>
                  </td>
                  <td className="px-6 py-4">
                    {item.trainerPrice !== undefined && item.trainerPrice !== null ? (
                      <div className="text-sm font-semibold text-gray-900">₹{item.trainerPrice}</div>
                    ) : (
                      <span className="text-xs text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setSelectedItemForKitchen(item);
                          setShowKitchenView(true);
                        }}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
                        title="Kitchen View - Full Screen Ingredients"
                      >
                        <Maximize2 className="w-4 h-4" />
                      </button>
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

                <div className="grid grid-cols-3 gap-4">
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
                        ✅ Auto-calculated from ingredients (each with its own cooking method)
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
                      <div className="col-span-3">Ingredient Name</div>
                      <div className="col-span-1">Quantity</div>
                      <div className="col-span-1">Unit</div>
                      <div className="col-span-3">Cooking Method</div>
                      <div className="col-span-2">Extra Price (₹/unit)</div>
                      <div className="col-span-1">Action</div>
                    </div>
                    <div className="grid grid-cols-12 gap-2">
                      {/* Searchable Material Dropdown */}
                      <div className="col-span-3 relative">
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
                        className="col-span-1 px-2 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                      />
                      <select
                        value={currentMaterial.unit}
                        onChange={(e) => setCurrentMaterial({...currentMaterial, unit: e.target.value})}
                        className="col-span-1 px-2 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                        disabled={currentMaterial.name && inventoryItems.find(item => item.name === currentMaterial.name)}
                      >
                        <option value="gm">gm</option>
                        <option value="ml">ml</option>
                        <option value="pcs">pcs</option>
                      </select>
                      <select
                        value={currentMaterial.cookingMethod}
                        onChange={(e) => setCurrentMaterial({...currentMaterial, cookingMethod: e.target.value})}
                        className="col-span-3 px-2 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-xs font-semibold"
                      >
                        {Object.entries(COOKING_ADJUSTMENTS).map(([key, value]) => (
                          <option key={key} value={key}>{value.name}</option>
                        ))}
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
                        className="col-span-2 px-2 py-2 border border-orange-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                        title="Price per unit when customer adds extra"
                      />
                      <button
                        type="button"
                        onClick={addRawMaterial}
                        className="col-span-1 px-2 py-2 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700 transition text-sm"
                      >
                        Add
                      </button>
                    </div>
                  </div>

                  {/* Raw Materials List */}
                  {formData.rawMaterials.length > 0 && (
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {formData.rawMaterials.map((material, index) => (
                        <div key={index} className="bg-white border border-gray-200 rounded-lg p-3">
                          <div className="flex items-center justify-between">
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
                          <div className="mt-2">
                            <select
                              value={material.cookingMethod || 'raw'}
                              onChange={(e) => {
                                const updatedMaterials = [...formData.rawMaterials];
                                updatedMaterials[index].cookingMethod = e.target.value;
                                setFormData({...formData, rawMaterials: updatedMaterials});
                              }}
                              className="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 text-xs font-semibold bg-gradient-to-r from-green-50 to-orange-50"
                            >
                              {Object.entries(COOKING_ADJUSTMENTS).map(([key, value]) => (
                                <option key={key} value={key}>{value.name}</option>
                              ))}
                            </select>
                          </div>
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

      {/* Calorie Chart Modal */}
      {showCalorieChart && selectedItemForChart && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-gray-900">{selectedItemForChart.name}</h3>
                <p className="text-sm text-gray-600">Nutrition Analysis by <span className="font-bold text-orange-700">AfterBurn, Gym Cafe</span> by Sutra Fitness</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={async () => {
                    if (!recipientEmail) {
                      showToast('⚠️ Please configure recipient email in Settings first');
                      return;
                    }
                    
                    try {
                      showToast('📧 Sending email...');
                      
                      const breakdown = calculateCalories(selectedItemForChart.rawMaterials);
                      const macros = calculateMacros(selectedItemForChart.rawMaterials);
                      
                      // Sort ingredients by calories (high to low) for email
                      const sortedIngredients = breakdown.breakdown
                        .sort((a, b) => parseFloat(b.calories) - parseFloat(a.calories))
                        .map(ing => ({
                          name: ing.name,
                          quantity: ing.quantity,
                          unit: ing.unit,
                          calories: ing.calories
                        }));
                      
                      // Send email using the email service
                      const result = await sendNutritionChartEmail(
                        recipientEmail,
                        selectedItemForChart.name,
                        breakdown.total,
                        sortedIngredients,
                        {
                          protein: macros.totals.protein,
                          carbs: macros.totals.carbs,
                          fat: macros.totals.fat,
                          fiber: macros.totals.fiber
                        }
                      );
                      
                      if (result.success) {
                        showToast('✅ Email sent successfully!');
                      } else {
                        showToast(`❌ Failed to send email: ${result.error || 'Please try again'}`);
                      }
                    } catch (error) {
                      console.error('Error sending email:', error);
                      showToast('❌ Failed to send email. Please try again.');
                    }
                  }}
                  className="p-2 hover:bg-orange-50 rounded-lg transition text-orange-600"
                  title="Email this nutrition chart"
                >
                  <Mail className="w-5 h-5" />
                </button>
                <button
                  onClick={() => {
                    setShowCalorieChart(false);
                    setSelectedItemForChart(null);
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div className="p-6">
              {(() => {
                const breakdown = calculateCalories(selectedItemForChart.rawMaterials);
                const totalCalories = parseFloat(breakdown.total) || 0;
                const maxCalories = Math.max(...breakdown.breakdown.map(b => parseFloat(b.calories) || 0));
                
                // Calculate macros
                const macros = calculateMacros(selectedItemForChart.rawMaterials);
                const protein = parseFloat(macros.totals.protein) || 0;
                const carbs = parseFloat(macros.totals.carbs) || 0;
                const fat = parseFloat(macros.totals.fat) || 0;
                const fiber = parseFloat(macros.totals.fiber) || 0;
                const totalMacros = protein + carbs + fat + fiber;
                
                // Generate colors for each ingredient
                const colors = [
                  'bg-orange-500',
                  'bg-blue-500',
                  'bg-green-500',
                  'bg-purple-500',
                  'bg-pink-500',
                  'bg-yellow-500',
                  'bg-indigo-500',
                  'bg-red-500',
                  'bg-teal-500',
                  'bg-cyan-500'
                ];
                
                // Macro colors
                const macroColors = {
                  protein: { bg: '#3B82F6', light: '#DBEAFE' }, // blue
                  carbs: { bg: '#F59E0B', light: '#FEF3C7' }, // yellow/amber
                  fat: { bg: '#EF4444', light: '#FEE2E2' }, // red
                  fiber: { bg: '#10B981', light: '#D1FAE5' } // green
                };
                
                // Calculate donut chart segments
                const createDonutSegments = () => {
                  if (totalMacros === 0) return [];
                  
                  const segments = [];
                  let currentAngle = 0;
                  
                  const macroData = [
                    { name: 'Protein', value: protein, color: macroColors.protein.bg, emoji: '💪' },
                    { name: 'Carbs', value: carbs, color: macroColors.carbs.bg, emoji: '🍚' },
                    { name: 'Fat', value: fat, color: macroColors.fat.bg, emoji: '🥑' },
                    { name: 'Fiber', value: fiber, color: macroColors.fiber.bg, emoji: '🌾' }
                  ];
                  
                  macroData.forEach(macro => {
                    if (macro.value > 0) {
                      const percentage = (macro.value / totalMacros) * 100;
                      const angle = (percentage / 100) * 360;
                      segments.push({
                        ...macro,
                        percentage: percentage.toFixed(1),
                        startAngle: currentAngle,
                        endAngle: currentAngle + angle
                      });
                      currentAngle += angle;
                    }
                  });
                  
                  return segments;
                };
                
                const donutSegments = createDonutSegments();
                
                // Create SVG path for donut segment
                const createArc = (startAngle, endAngle, innerRadius, outerRadius) => {
                  const start = polarToCartesian(100, 100, outerRadius, endAngle);
                  const end = polarToCartesian(100, 100, outerRadius, startAngle);
                  const innerStart = polarToCartesian(100, 100, innerRadius, endAngle);
                  const innerEnd = polarToCartesian(100, 100, innerRadius, startAngle);
                  
                  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
                  
                  return [
                    "M", start.x, start.y,
                    "A", outerRadius, outerRadius, 0, largeArcFlag, 0, end.x, end.y,
                    "L", innerEnd.x, innerEnd.y,
                    "A", innerRadius, innerRadius, 0, largeArcFlag, 1, innerStart.x, innerStart.y,
                    "Z"
                  ].join(" ");
                };
                
                const polarToCartesian = (centerX, centerY, radius, angleInDegrees) => {
                  const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
                  return {
                    x: centerX + (radius * Math.cos(angleInRadians)),
                    y: centerY + (radius * Math.sin(angleInRadians))
                  };
                };
                
                return (
                  <div className="space-y-4">
                    {/* Top Row: Total Calories (30%) + Ingredient Breakdown (70%) */}
                    <div className="flex gap-3">
                      {/* Left: Total Calories - 30% */}
                      <div className="w-[30%] bg-gradient-to-r from-orange-50 to-red-50 border-2 border-orange-300 rounded-lg p-4 text-center flex flex-col justify-center">
                        <div className="text-xs text-gray-600 font-semibold">Total Calories</div>
                        <div className="text-4xl font-bold text-orange-600 mt-1">🔥 {totalCalories}</div>
                        <div className="text-xs text-gray-500 mt-1">kcal per serving</div>
                      </div>
                      
                      {/* Right: Ingredient Breakdown Bar Chart - 70% */}
                      <div className="w-[70%] bg-white border-2 border-gray-200 rounded-lg p-3">
                        <h4 className="font-semibold text-gray-700 text-xs mb-2">Ingredient Breakdown</h4>
                        <div className="space-y-1.5 max-h-64 overflow-y-auto pr-2">
                      {breakdown.breakdown.sort((a, b) => parseFloat(b.calories) - parseFloat(a.calories)).map((ingredient, index) => {
                        const calories = parseFloat(ingredient.calories) || 0;
                        const percentage = totalCalories > 0 ? (calories / totalCalories * 100).toFixed(1) : 0;
                        const barWidth = maxCalories > 0 ? (calories / maxCalories * 100).toFixed(1) : 0;
                        const colorClass = colors[index % colors.length];
                        
                        return (
                          <div key={index} className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <div className="flex items-center gap-1.5">
                                <div className={`w-2 h-2 rounded ${colorClass}`}></div>
                                <span className="font-semibold text-gray-700">
                                  {ingredient.name}
                                </span>
                                <span className="text-gray-500">
                                  ({ingredient.quantity}{ingredient.unit})
                                </span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-gray-900">{calories} cal</span>
                                <span className="text-gray-500">({percentage}%)</span>
                              </div>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-1 overflow-hidden">
                              <div 
                                className={`${colorClass} h-full rounded-full transition-all duration-500`}
                                style={{ width: `${barWidth}%` }}
                              >
                              </div>
                            </div>
                          </div>
                        );
                      })}
                        </div>
                      </div>
                    </div>
                    
                    {/* Bottom Row: Macro Nutrients Donut Chart (30%) + Table (70%) */}
                    <div className="border-t pt-4">
                      <div className="flex gap-3 items-start">
                        {/* Donut Chart - 30% */}
                        <div className="w-[30%] flex-shrink-0">
                                                <h4 className="font-semibold text-gray-700 text-xs mb-3">Macro Nutrients Distribution</h4>

                          <svg width="160" height="160" viewBox="0 0 200 200" className="transform -rotate-90 mx-auto">
                            {donutSegments.map((segment, index) => (
                              <path
                                key={index}
                                d={createArc(segment.startAngle, segment.endAngle, 60, 90)}
                                fill={segment.color}
                                className="hover:opacity-80 transition-opacity cursor-pointer"
                              />
                            ))}
                            {/* Center circle for donut hole */}
                            <circle cx="100" cy="100" r="60" fill="white" />
                          </svg>
                          <div className="text-center -mt-28">
                            <div className="text-xl font-bold text-gray-900">{totalMacros.toFixed(1)}g</div>
                            <div className="text-[10px] text-gray-500">Total Macros</div>
                          </div>
                        </div>
                        
                        {/* Macro Table - 70% */}
                        <div className="w-[70%]">
                          <table className="w-full">
                            <thead>
                              <tr className="border-b-2 border-gray-300">
                                <th className="text-left px-2 text-xs font-semibold text-gray-600 uppercase">Nutrient</th>
                                <th className="text-right px-2 text-xs font-semibold text-gray-600 uppercase">Amount</th>
                                <th className="text-right px-2 text-xs font-semibold text-gray-600 uppercase">% of Total</th>
                              </tr>
                            </thead>
                            <tbody>
                              {donutSegments.map((segment, index) => (
                                <tr key={index} className="border-b border-gray-200 hover:bg-gray-50">
                                  <td className="px-3 py-2">
                                    <div className="flex items-center gap-1.5">
                                      <div 
                                        className="w-3 h-3 rounded"
                                        style={{ backgroundColor: segment.color }}
                                      ></div>
                                      <span className="font-semibold text-gray-700 text-sm">
                                        {segment.emoji} {segment.name}
                                      </span>
                                    </div>
                                  </td>
                                  <td className="px-2 text-right">
                                    <span className="font-bold text-gray-900 text-sm">{segment.value}g</span>
                                  </td>
                                  <td className="px-2 text-right">
                                    <span className="text-gray-600 text-sm">{segment.percentage}%</span>
                                  </td>
                                </tr>
                              ))}
                              <tr className="bg-gray-100 font-bold">
                                <td className="px-2 text-sm text-gray-900">Total</td>
                                <td className="px-2 text-right text-sm text-gray-900">{totalMacros.toFixed(1)}g</td>
                                <td className="px-2 text-right text-sm text-gray-900">100%</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* Kitchen Full-Screen View */}
      {showKitchenView && selectedItemForKitchen && (
        <div className="fixed inset-0 bg-gray-900 z-50 overflow-auto">
          <div className="min-h-screen p-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-8 pb-6 border-b-4 border-orange-500">
              <div>
                <h1 className="text-6xl font-black text-white mb-2">
                  {selectedItemForKitchen.is_veg ? '🟢' : '🔴'} {selectedItemForKitchen.name}
                </h1>
                <p className="text-2xl text-gray-400">Kitchen Recipe View</p>
              </div>
              <button
                onClick={() => setShowKitchenView(false)}
                className="p-4 bg-red-600 hover:bg-red-700 text-white rounded-xl transition shadow-lg"
              >
                <X className="w-8 h-8" />
              </button>
            </div>

            {/* Ingredients List */}
            <div className="bg-gray-800 rounded-2xl p-8 shadow-2xl">
              <h2 className="text-4xl font-bold text-orange-500 mb-8 pb-4 border-b-2 border-orange-500">
                📋 INGREDIENTS
              </h2>
              
              {selectedItemForKitchen.raw_materials && selectedItemForKitchen.raw_materials.length > 0 ? (
                <div className="space-y-4">
                  {selectedItemForKitchen.raw_materials.map((material, index) => (
                    <div 
                      key={index}
                      className="bg-gray-700 rounded-xl p-6 border-l-8 border-orange-500 hover:bg-gray-650 transition"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <span className="text-4xl font-bold text-white">
                            {index + 1}. {material.name}
                          </span>
                        </div>
                        <div className="text-right">
                          <div className="text-5xl font-black text-orange-400">
                            {material.quantity} {material.unit}
                          </div>
                          {material.cooking_method && material.cooking_method !== 'none' && (
                            <div className="text-xl text-gray-400 mt-2">
                              {COOKING_ADJUSTMENTS[material.cooking_method]?.name || material.cooking_method}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-3xl text-gray-400 text-center py-12">
                  No ingredients listed
                </p>
              )}

              {/* Summary */}
              <div className="mt-8 pt-8 border-t-2 border-gray-700">
                <div className="grid grid-cols-2 gap-6">
                  <div className="bg-gradient-to-r from-orange-600 to-red-600 rounded-xl p-6 text-center">
                    <div className="text-2xl text-orange-100 mb-2">Total Items</div>
                    <div className="text-6xl font-black text-white">
                      {selectedItemForKitchen.raw_materials?.length || 0}
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl p-6 text-center">
                    <div className="text-2xl text-green-100 mb-2">Calories</div>
                    <div className="text-6xl font-black text-white">
                      {selectedItemForKitchen.calories || '-'}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Close Button at Bottom */}
            <div className="mt-8 text-center">
              <button
                onClick={() => setShowKitchenView(false)}
                className="px-12 py-6 bg-red-600 hover:bg-red-700 text-white text-3xl font-bold rounded-xl transition shadow-lg"
              >
                ✕ Close Kitchen View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CafeMenu;
