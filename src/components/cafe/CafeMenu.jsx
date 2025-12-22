import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, X } from 'lucide-react';
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
  });
  const [currentMaterial, setCurrentMaterial] = useState({ name: '', quantity: '', unit: 'gm', extraPrice: 0 });
  const [inventoryItems, setInventoryItems] = useState([]);
  const [materialSearchTerm, setMaterialSearchTerm] = useState('');
  const [showMaterialDropdown, setShowMaterialDropdown] = useState(false);

  useEffect(() => {
    loadMenu();
    loadInventory();
  }, []);

  const loadInventory = async () => {
    const items = await getInventory();
    setInventoryItems(items);
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
    setFormData({ name: '', category: 'main-course', customerPrice: '', trainerPrice: '', description: '', isVeg: true, rawMaterials: [] });
    setCurrentMaterial({ name: '', quantity: '', unit: 'gm' });
    setMaterialSearchTerm('');
    setShowMaterialDropdown(false);
    setEditingItem(null);
    setShowModal(false);
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">Menu Items</h2>
          <p className="text-gray-600 font-semibold mt-1">Manage your cafe menu</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-bold hover:from-purple-700 hover:to-indigo-700 transition shadow-lg hover:shadow-xl hover:-translate-y-0.5"
        >
          <Plus className="w-5 h-5" />
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

      {/* Menu Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase w-16">Type</th>
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

                <div className="grid grid-cols-2 gap-4">
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
                      <span className="text-sm font-medium text-gray-700">🟢 Vegetarian</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        checked={formData.isVeg === false}
                        onChange={() => setFormData({...formData, isVeg: false})}
                        className="w-4 h-4 text-red-600"
                      />
                      <span className="text-sm font-medium text-gray-700">🔴 Non-Vegetarian</span>
                    </label>
                  </div>
                </div>

                {/* Raw Materials Section */}
                <div className="border-t pt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-3">Raw Materials</label>
                  
                  {/* Add Raw Material */}
                  <div className="bg-gray-50 rounded-lg p-4 mb-3">
                    {/* Headers */}
                    <div className="grid grid-cols-12 gap-2 mb-2 text-xs font-semibold text-gray-600">
                      <div className="col-span-5">Ingredient Name</div>
                      <div className="col-span-2">Quantity</div>
                      <div className="col-span-2">Unit</div>
                      <div className="col-span-3">Extra Price (₹/unit)</div>
                    </div>
                    <div className="grid grid-cols-12 gap-2">
                      {/* Searchable Material Dropdown */}
                      <div className="col-span-5 relative">
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
                        value={currentMaterial.extraPrice}
                        onChange={(e) => setCurrentMaterial({...currentMaterial, extraPrice: parseFloat(e.target.value) || 0})}
                        className="col-span-3 px-3 py-2 border border-orange-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
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
