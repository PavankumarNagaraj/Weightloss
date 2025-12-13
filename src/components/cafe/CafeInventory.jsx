import React, { useState, useEffect } from 'react';
import { Plus, AlertTriangle, Edit, Trash2, X, Upload, Trash, Download, Search, Check } from 'lucide-react';
import { getInventory, addInventoryItem, updateInventoryStock, updateInventoryItem, getLowStockItems } from '../../services/cafeService';
import { importBulkInventory } from '../../utils/bulkInventoryImport';
import { inventoryTemplate } from '../../utils/inventoryTemplate';

const CafeInventory = ({ showToast }) => {
  const [inventory, setInventory] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    currentStock: 0,
    minStock: '',
    unit: 'g',
    category: 'Dry Store',
  });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [existingMaterials, setExistingMaterials] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedItems, setSelectedItems] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [templateSearch, setTemplateSearch] = useState('');
  const [selectedTemplateItems, setSelectedTemplateItems] = useState([]);
  const [templateCategory, setTemplateCategory] = useState('All');

  const categories = ['Dry Store', 'Fresh Produce', 'Refrigerated', 'Frozen', 'Fruits'];

  // Helper function to convert any unit to grams for comparison
  const convertToGrams = (quantity, unit) => {
    const qty = parseFloat(quantity);
    switch(unit) {
      case 'kg': return qty * 1000;
      case 'l': return qty * 1000;
      case 'ml': return qty;
      case 'g': return qty;
      case 'pcs': return qty;
      default: return qty;
    }
  };

  useEffect(() => {
    loadInventory();
    loadExistingMaterials();
    
    // Reload inventory when window gains focus (switching tabs)
    const handleFocus = () => {
      console.log('🔄 Reloading inventory on focus');
      loadInventory();
    };
    
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  const loadInventory = async () => {
    const items = await getInventory();
    setInventory(items);
    const lowStockItems = await getLowStockItems();
    setLowStock(lowStockItems);
  };

  const loadExistingMaterials = async () => {
    // Get unique material names from inventory
    const items = await getInventory();
    const materials = items.map(item => item.name);
    setExistingMaterials([...new Set(materials)]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (editingItem) {
      // Update existing item - update all fields
      await updateInventoryItem(editingItem.id, {
        name: formData.name,
        currentStock: editingItem.currentStock, // Keep current stock as is
        minStock: parseFloat(formData.minStock),
        unit: formData.unit,
        category: formData.category,
        pricePerUnit: editingItem.pricePerUnit || 0, // Keep existing price
      });
      showToast(`✅ Updated ${formData.name}`);
    } else {
      // Check if item already exists
      const existingItem = inventory.find(item => item.name.toLowerCase() === formData.name.toLowerCase());
      
      if (existingItem) {
        showToast(`⚠️ Item "${formData.name}" already exists. Use Edit to update it.`);
        return;
      }
      
      // Add new item with 0 stock
      const newItem = {
        name: formData.name,
        currentStock: 0,
        minStock: parseFloat(formData.minStock),
        unit: formData.unit,
        category: formData.category || 'Dry Store',
        pricePerUnit: 0,
      };
      await addInventoryItem(newItem);
      
      // Add to existing materials list
      if (!existingMaterials.includes(formData.name)) {
        setExistingMaterials([...existingMaterials, formData.name]);
      }
      
      showToast(`✅ New item added: ${formData.name}. Add stock via Purchases tab.`);
    }
    
    resetForm();
    loadInventory();
  };

  const resetForm = () => {
    setFormData({ name: '', currentStock: 0, minStock: '', unit: 'g', category: 'Dry Store' });
    setSearchTerm('');
    setEditingItem(null);
    setShowModal(false);
    setShowDropdown(false);
  };

  const handleMaterialSelect = (materialName) => {
    const existingItem = inventory.find(item => item.name === materialName);
    if (existingItem) {
      setFormData({
        name: materialName,
        currentStock: existingItem.currentStock,
        minStock: existingItem.minStock,
        unit: existingItem.unit,
        category: existingItem.category || 'Dry Store',
      });
    } else {
      setFormData({
        ...formData,
        name: materialName,
      });
    }
    setSearchTerm(materialName);
    setShowDropdown(false);
  };

  const handleSearchChange = (value) => {
    setSearchTerm(value);
    setFormData({ ...formData, name: value });
    setShowDropdown(true);
    
    // Check if material exists
    const existingItem = inventory.find(item => item.name.toLowerCase() === value.toLowerCase());
    if (existingItem) {
      setFormData({
        name: value,
        currentStock: existingItem.currentStock,
        minStock: existingItem.minStock,
        unit: existingItem.unit,
        category: existingItem.category || 'Dry Store',
      });
    }
  };

  const filteredMaterials = existingMaterials.filter(material =>
    material.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = (id) => {
    setItemToDelete(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (itemToDelete) {
      const items = getInventory();
      const updatedItems = items.filter(item => item.id !== itemToDelete);
      localStorage.setItem('cafe_inventory', JSON.stringify(updatedItems));
      loadInventory();
      showToast('Inventory item deleted');
      setShowDeleteModal(false);
      setItemToDelete(null);
    }
  };

  const handleBulkImport = () => {
    setShowImportModal(true);
  };

  const confirmBulkImport = async () => {
    if (selectedTemplateItems.length === 0) {
      showToast('⚠️ Please select at least one item to import');
      return;
    }

    let addedCount = 0;
    let skippedCount = 0;

    for (const templateItem of selectedTemplateItems) {
      const existingItem = inventory.find(
        item => item.name.toLowerCase() === templateItem.name.toLowerCase()
      );

      if (!existingItem) {
        await addInventoryItem({
          name: templateItem.name,
          currentStock: 0,
          minStock: templateItem.minStock,
          unit: templateItem.unit,
          category: templateItem.category,
          pricePerUnit: 0,
        });
        addedCount++;
      } else {
        skippedCount++;
      }
    }

    loadInventory();
    showToast(`✅ Import complete! Added: ${addedCount}, Skipped: ${skippedCount}`);
    setShowImportModal(false);
    setSelectedTemplateItems([]);
    setTemplateSearch('');
    setTemplateCategory('All');
  };

  const toggleTemplateItem = (item) => {
    const isSelected = selectedTemplateItems.some(i => i.name === item.name);
    if (isSelected) {
      setSelectedTemplateItems(selectedTemplateItems.filter(i => i.name !== item.name));
    } else {
      setSelectedTemplateItems([...selectedTemplateItems, item]);
    }
  };

  const selectAllTemplateItems = () => {
    const filtered = getFilteredTemplateItems();
    if (selectedTemplateItems.length === filtered.length) {
      setSelectedTemplateItems([]);
    } else {
      setSelectedTemplateItems(filtered);
    }
  };

  const getFilteredTemplateItems = () => {
    return inventoryTemplate.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(templateSearch.toLowerCase());
      const matchesCategory = templateCategory === 'All' || item.category === templateCategory;
      const notInInventory = !inventory.some(inv => inv.name.toLowerCase() === item.name.toLowerCase());
      return matchesSearch && matchesCategory && notInInventory;
    });
  };

  const handleSelectAll = () => {
    const filteredInventory = selectedCategory === 'All' 
      ? inventory 
      : inventory.filter(item => item.category === selectedCategory);
    
    if (!selectAll) {
      setSelectedItems(filteredInventory.map(item => item.id));
    } else {
      setSelectedItems([]);
    }
    setSelectAll(!selectAll);
  };

  const handleSelectItem = (id) => {
    if (selectedItems.includes(id)) {
      setSelectedItems(selectedItems.filter(itemId => itemId !== id));
    } else {
      setSelectedItems([...selectedItems, id]);
    }
  };

  const handleDeleteSelected = () => {
    if (selectedItems.length === 0) {
      showToast('⚠️ No items selected');
      return;
    }
    setShowBulkDeleteModal(true);
  };

  const confirmBulkDelete = () => {
    const items = getInventory();
    const updatedItems = items.filter(item => !selectedItems.includes(item.id));
    localStorage.setItem('cafe_inventory', JSON.stringify(updatedItems));
    const deletedCount = selectedItems.length;
    setSelectedItems([]);
    setSelectAll(false);
    loadInventory();
    showToast(`🗑️ Deleted ${deletedCount} item(s)`);
    setShowBulkDeleteModal(false);
  };

  const handleDownloadShoppingList = () => {
    if (selectedItems.length === 0) {
      showToast('⚠️ No items selected');
      return;
    }

    const items = getInventory();
    const selectedItemsData = items.filter(item => selectedItems.includes(item.id));
    
    // Create shopping list content
    let content = '🛒 SHOPPING LIST\n';
    content += '=' .repeat(50) + '\n';
    content += `Generated: ${new Date().toLocaleString()}\n`;
    content += `Total Items: ${selectedItemsData.length}\n`;
    content += '=' .repeat(50) + '\n\n';

    // Group by category
    const categories = ['Dry Store', 'Fresh Produce', 'Refrigerated', 'Frozen', 'Fruits'];
    categories.forEach(category => {
      const categoryItems = selectedItemsData.filter(item => item.category === category);
      if (categoryItems.length > 0) {
        const emoji = category === 'Dry Store' ? '🏪' :
                     category === 'Fresh Produce' ? '🥬' :
                     category === 'Refrigerated' ? '❄️' :
                     category === 'Frozen' ? '🧊' :
                     category === 'Fruits' ? '🍎' : '📦';
        content += `\n${emoji} ${category.toUpperCase()}\n`;
        content += '-'.repeat(50) + '\n';
        
        categoryItems.forEach((item, index) => {
          const neededQty = Math.max(0, item.minStock - item.currentStock);
          content += `${index + 1}. ${item.name}\n`;
          content += `   Current Stock: ${item.currentStock} ${item.unit}\n`;
          content += `   Min Stock: ${item.minStock} ${item.unit}\n`;
          content += `   Need to Buy: ${neededQty} ${item.unit}\n`;
          content += `   [ ] Purchased\n\n`;
        });
      }
    });

    content += '\n' + '='.repeat(50) + '\n';
    content += 'NOTES:\n';
    content += '_'.repeat(50) + '\n\n\n';

    // Create and download file
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `shopping-list-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showToast(`📥 Shopping list downloaded (${selectedItemsData.length} items)`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">Inventory Management</h2>
          <p className="text-gray-600 font-semibold mt-1">Track your raw materials and stock levels</p>
        </div>
        <div className="flex items-center gap-3">
          {selectedItems.length > 0 && (
            <>
              <button
                onClick={handleDownloadShoppingList}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-bold hover:from-blue-700 hover:to-cyan-700 transition shadow-lg hover:shadow-xl hover:-translate-y-0.5"
              >
                <Download className="w-5 h-5" />
                Download List ({selectedItems.length})
              </button>
              <button
                onClick={handleDeleteSelected}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-xl font-bold hover:from-red-700 hover:to-rose-700 transition shadow-lg hover:shadow-xl hover:-translate-y-0.5"
              >
                <Trash className="w-5 h-5" />
                Delete Selected ({selectedItems.length})
              </button>
            </>
          )}
          <button
            onClick={handleBulkImport}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-bold hover:from-green-700 hover:to-emerald-700 transition shadow-lg hover:shadow-xl hover:-translate-y-0.5"
          >
            <Upload className="w-5 h-5" />
            Bulk Import
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-bold hover:from-purple-700 hover:to-indigo-700 transition shadow-lg hover:shadow-xl hover:-translate-y-0.5"
          >
            <Plus className="w-5 h-5" />
            Add Inventory
          </button>
        </div>
      </div>

      {lowStock.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-center gap-2 text-red-700 font-semibold mb-2">
            <AlertTriangle className="w-5 h-5" />
            Low Stock Alert
          </div>
          <p className="text-sm text-red-600">{lowStock.length} items are running low on stock</p>
        </div>
      )}

      {/* Category Filter */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-semibold text-gray-700">Filter by Category:</span>
          {['All', ...categories].map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-lg font-semibold text-sm transition ${
                selectedCategory === cat
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {cat === 'All' ? '📋 All' :
               cat === 'Dry Store' ? '🏪 Dry Store' :
               cat === 'Fresh Produce' ? '🥬 Fresh Produce' :
               cat === 'Refrigerated' ? '❄️ Refrigerated' :
               cat === 'Frozen' ? '🧊 Frozen' :
               cat === 'Fruits' ? '🍎 Fruits' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left w-12">
                <input
                  type="checkbox"
                  checked={selectAll}
                  onChange={handleSelectAll}
                  className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                />
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Material Name</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase w-40">Category</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase w-32">Current Stock</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase w-32">Min Stock</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase w-24">Unit</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase w-24">Status</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase w-32">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {inventory.length === 0 ? (
              <tr>
                <td colSpan="8" className="px-6 py-12 text-center text-gray-500">
                  No inventory items yet. Add items to track stock levels.
                </td>
              </tr>
            ) : (
              inventory
                .filter(item => selectedCategory === 'All' || item.category === selectedCategory)
                .map((item) => {
                // Convert current stock to grams for comparison
                const currentStockInGrams = convertToGrams(item.currentStock, item.unit);
                const isLowStock = currentStockInGrams <= item.minStock;
                
                return (
                  <tr key={item.id} className={`hover:bg-gray-50 ${isLowStock ? 'bg-red-50' : ''} ${selectedItems.includes(item.id) ? 'bg-purple-50' : ''}`}>
                    <td className="px-4 py-2">
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(item.id)}
                        onChange={() => handleSelectItem(item.id)}
                        className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                      />
                    </td>
                    <td className="px-4 py-2">
                      <span className="font-semibold text-gray-900">{item.name}</span>
                    </td>
                    <td className="px-4 py-2">
                      <span className="px-3 py-1 rounded-full text-xs font-bold ${
                        item.category === 'Dry Store' ? 'bg-amber-100 text-amber-700' :
                        item.category === 'Fresh Produce' ? 'bg-green-100 text-green-700' :
                        item.category === 'Refrigerated' ? 'bg-blue-100 text-blue-700' :
                        item.category === 'Frozen' ? 'bg-cyan-100 text-cyan-700' :
                        item.category === 'Fruits' ? 'bg-pink-100 text-pink-700' :
                        'bg-gray-100 text-gray-700'
                      }">
                        {item.category === 'Dry Store' ? '🏪' :
                         item.category === 'Fresh Produce' ? '🥬' :
                         item.category === 'Refrigerated' ? '❄️' :
                         item.category === 'Frozen' ? '🧊' :
                         item.category === 'Fruits' ? '🍎' : '📦'} {item.category || 'Uncategorized'}
                      </span>
                    </td>
                    <td className="px-4 py-2">
                      <span className={`font-bold ${isLowStock ? 'text-red-600' : 'text-gray-900'}`}>
                        {item.currentStock}
                      </span>
                    </td>
                    <td className="px-4 py-2">
                      <span className="text-gray-600">{item.minStock} g</span>
                    </td>
                    <td className="px-4 py-2">
                      <span className="text-gray-600">{item.unit}</span>
                    </td>
                    <td className="px-4 py-2">
                      {isLowStock ? (
                        <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold">
                          Low
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                          OK
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setEditingItem(item);
                            setFormData({
                              name: item.name,
                              purchaseQuantity: '',
                              currentStock: item.currentStock,
                              minStock: item.minStock,
                              unit: item.unit,
                              category: item.category || 'Dry Store',
                            });
                            setSearchTerm(item.name);
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
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold">{editingItem ? 'Update' : 'Add'} Inventory Item</h3>
                <button onClick={resetForm}>
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Current Stock Display (Read-only) */}
                {formData.currentStock > 0 && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm font-semibold text-blue-900">
                      Current Stock: {formData.currentStock} {formData.unit}
                    </p>
                    <p className="text-xs text-blue-600 mt-1">
                      Minimum Stock: {formData.minStock} {formData.unit}
                    </p>
                  </div>
                )}

                {/* Name | Min Level | Unit - Horizontal Layout */}
                <div className="grid grid-cols-12 gap-3">
                  {/* Name - Takes more space */}
                  <div className="col-span-5 relative">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Name <span className="text-orange-600">*</span></label>
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => handleSearchChange(e.target.value)}
                      onFocus={() => setShowDropdown(true)}
                      onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="Material name..."
                      required
                    />
                    
                    {/* Dropdown */}
                    {showDropdown && searchTerm && (
                      <div className="absolute z-50 w-full mt-1 bg-white border-2 border-orange-300 rounded-lg shadow-xl max-h-48 overflow-y-auto">
                        {filteredMaterials.length > 0 ? (
                          filteredMaterials.map((material, index) => (
                            <button
                              key={index}
                              type="button"
                              onClick={() => handleMaterialSelect(material)}
                              className="w-full px-4 py-2 text-left hover:bg-orange-50 transition border-b border-gray-100 last:border-0"
                            >
                              <span className="font-semibold text-gray-900">{material}</span>
                              {inventory.find(item => item.name === material) && (
                                <span className="text-xs text-gray-500 ml-2">
                                  (Stock: {inventory.find(item => item.name === material).currentStock}
                                  {inventory.find(item => item.name === material).unit})
                                </span>
                              )}
                            </button>
                          ))
                        ) : (
                          <button
                            type="button"
                            onClick={() => setShowDropdown(false)}
                            className="w-full px-4 py-3 text-left bg-orange-50 hover:bg-orange-100 transition"
                          >
                            <p className="font-semibold text-orange-600">✓ Add new: "{searchTerm}"</p>
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Min Level */}
                  <div className="col-span-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Min Level <span className="text-orange-600">*</span></label>
                    <input
                      type="number"
                      value={formData.minStock}
                      onChange={(e) => setFormData({...formData, minStock: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="Min stock"
                      required
                    />
                  </div>

                  {/* Unit - Only for new items */}
                  {formData.currentStock === 0 && (
                    <div className="col-span-3">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Unit</label>
                      <select
                        value={formData.unit}
                        onChange={(e) => setFormData({...formData, unit: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      >
                        <option value="g">g</option>
                        <option value="kg">kg</option>
                        <option value="ml">ml</option>
                        <option value="l">l</option>
                        <option value="pcs">pcs</option>
                      </select>
                    </div>
                  )}
                  
                  {/* Unit display for existing items */}
                  {formData.currentStock > 0 && (
                    <div className="col-span-3">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Unit</label>
                      <div className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-700 font-semibold">
                        {formData.unit}
                      </div>
                    </div>
                  )}
                </div>

                {/* Type (Storage Category) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type <span className="text-orange-600">*</span>
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent font-semibold"
                    required
                  >
                    <option value="Dry Store">🏪 Dry Store</option>
                    <option value="Fresh Produce">🥬 Fresh Produce</option>
                    <option value="Refrigerated">❄️ Refrigerated</option>
                    <option value="Frozen">🧊 Frozen</option>
                    <option value="Fruits">🍎 Fruits</option>
                  </select>
                </div>

                {/* Info message for new items */}
                {formData.currentStock === 0 && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-900">
                      💡 <strong>Note:</strong> This will create the inventory item with 0 stock. Add stock via the <strong>Purchases</strong> tab.
                    </p>
                  </div>
                )}

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

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center justify-center mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-center mb-2">Delete Inventory Item?</h3>
              <p className="text-gray-600 text-center mb-6">
                This action cannot be undone. The item will be permanently removed from your inventory.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setItemToDelete(null);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Delete Confirmation Modal */}
      {showBulkDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center justify-center mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <Trash className="w-6 h-6 text-red-600" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-center mb-2">Delete {selectedItems.length} Items?</h3>
              <p className="text-gray-600 text-center mb-6">
                This action cannot be undone. All selected items will be permanently removed from your inventory.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowBulkDeleteModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmBulkDelete}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition"
                >
                  Delete All
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Template Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-6xl max-h-[95vh] flex flex-col">
            <div className="p-4 border-b">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-xl font-bold">Import Inventory Items</h3>
                  <p className="text-gray-600 text-xs mt-0.5">Select items from our comprehensive cafe & restaurant template</p>
                </div>
                <button
                  onClick={() => {
                    setShowImportModal(false);
                    setSelectedTemplateItems([]);
                    setTemplateSearch('');
                    setTemplateCategory('All');
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Search and Filter */}
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search items..."
                    value={templateSearch}
                    onChange={(e) => setTemplateSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
                <select
                  value={templateCategory}
                  onChange={(e) => setTemplateCategory(e.target.value)}
                  className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="All">All Categories</option>
                  <option value="Dry Store">🏪 Dry Store</option>
                  <option value="Fresh Produce">🥬 Fresh Produce</option>
                  <option value="Refrigerated">❄️ Refrigerated</option>
                  <option value="Frozen">🧊 Frozen</option>
                  <option value="Fruits">🍎 Fruits</option>
                </select>
              </div>

              {/* Selection Info */}
              <div className="flex items-center justify-between mt-2 p-2 bg-blue-50 rounded-lg">
                <p className="text-xs text-blue-900">
                  <strong>{selectedTemplateItems.length}</strong> items selected • <strong>{getFilteredTemplateItems().length}</strong> available
                </p>
                <button
                  onClick={selectAllTemplateItems}
                  className="text-xs font-semibold text-orange-600 hover:text-orange-700"
                >
                  {selectedTemplateItems.length === getFilteredTemplateItems().length ? 'Deselect All' : 'Select All'}
                </button>
              </div>
            </div>

            {/* Items List */}
            <div className="flex-1 overflow-y-auto p-3">
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
                {getFilteredTemplateItems().map((item, index) => {
                  const isSelected = selectedTemplateItems.some(i => i.name === item.name);
                  return (
                    <div
                      key={index}
                      onClick={() => toggleTemplateItem(item)}
                      className={`p-2 border-2 rounded-md cursor-pointer transition-all ${
                        isSelected
                          ? 'border-orange-500 bg-orange-50'
                          : 'border-gray-200 hover:border-orange-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-start gap-1.5">
                        <div className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                          isSelected ? 'bg-orange-500 border-orange-500' : 'border-gray-300'
                        }`}>
                          {isSelected && <Check className="w-2.5 h-2.5 text-white" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-xs text-gray-900 truncate">{item.name}</p>
                          <div className="mt-1 flex flex-col gap-0.5">
                            <span className="text-[10px] text-gray-500">{item.category}</span>
                            <span className="text-[10px] text-gray-600">Min: {item.minStock} {item.unit}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {getFilteredTemplateItems().length === 0 && (
                <div className="text-center py-8">
                  <p className="text-sm text-gray-500">No items found matching your search</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-3 border-t bg-gray-50">
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setShowImportModal(false);
                    setSelectedTemplateItems([]);
                    setTemplateSearch('');
                    setTemplateCategory('All');
                  }}
                  className="flex-1 px-4 py-2 text-sm border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmBulkImport}
                  disabled={selectedTemplateItems.length === 0}
                  className="flex-1 px-4 py-2 text-sm bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700 transition disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Import {selectedTemplateItems.length} Item{selectedTemplateItems.length !== 1 ? 's' : ''}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CafeInventory;
