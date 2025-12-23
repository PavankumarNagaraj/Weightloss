import React, { useState, useEffect } from 'react';
import { Plus, AlertTriangle, Edit, Trash2, X, Upload, Trash, Download, Search, Check, Mail } from 'lucide-react';
import { getInventory, addInventoryItem, updateInventoryStock, updateInventoryItem, deleteInventoryItem, getLowStockItems, getMenuItems } from '../../services/cafeService';
import { importBulkInventory } from '../../utils/bulkInventoryImport';
import { inventoryTemplate } from '../../utils/inventoryTemplate';
import { sendShoppingListEmail, getEmailSettings } from '../../services/emailService';

const CafeInventory = ({ showToast }) => {
  const [inventory, setInventory] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    currentStock: 0,
    minStock: '',
    unit: 'gm',
    category: 'Dry Store',
    expiryDate: '',
    lastUsedDate: null,
    stockAdjustment: '',
  });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [inventorySearchTerm, setInventorySearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [existingMaterials, setExistingMaterials] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [usageFilter, setUsageFilter] = useState('all'); // 'all', 'used', 'unused'
  const [showArchived, setShowArchived] = useState(false);
  const [showCostDashboard, setShowCostDashboard] = useState(true);
  const [selectedItems, setSelectedItems] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [templateSearch, setTemplateSearch] = useState('');
  const [selectedTemplateItems, setSelectedTemplateItems] = useState([]);
  const [templateCategory, setTemplateCategory] = useState('All');
  const [menuItems, setMenuItems] = useState([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteProgress, setDeleteProgress] = useState({ current: 0, total: 0 });
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState({ current: 0, total: 0 });
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailRecipient, setEmailRecipient] = useState('');
  const [emailName, setEmailName] = useState('');
  const [isSendingEmail, setIsSendingEmail] = useState(false);

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
    loadMenuItems();
    
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
    // Map snake_case to camelCase for compatibility
    const mappedItems = items.map(item => ({
      ...item,
      currentStock: item.current_stock ?? item.currentStock,
      minStock: item.min_stock ?? item.minStock,
      pricePerUnit: item.price_per_unit ?? item.pricePerUnit,
      expiryDate: item.expiry_date ?? item.expiryDate ?? null,
      lastUsedDate: item.last_used_date ?? item.lastUsedDate ?? null,
      isArchived: item.is_archived ?? item.isArchived ?? false,
    }));
    setInventory(mappedItems);
    // Get low stock items and filter by menu usage
    const allLowStockItems = await getLowStockItems();
    const menuItemsList = await getMenuItems();
    
    // Check which ingredients are used in active menu items
    const usedIngredients = new Set();
    menuItemsList.forEach(menuItem => {
      if (menuItem.is_active !== false) {
        const materials = menuItem.raw_materials || [];
        materials.forEach(mat => usedIngredients.add(mat.name.toLowerCase()));
      }
    });
    
    // Filter low stock to only show items used in menu
    const lowStockItems = allLowStockItems.filter(item => 
      usedIngredients.has(item.name.toLowerCase())
    );
    setLowStock(lowStockItems);
  };

  const loadExistingMaterials = async () => {
    // Get unique material names from inventory
    const items = await getInventory();
    const materials = items.map(item => item.name);
    setExistingMaterials([...new Set(materials)]);
  };

  const loadMenuItems = async () => {
    const items = await getMenuItems();
    setMenuItems(items);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (editingItem) {
      // Update existing item - update all fields including stock if adjusted
      const newStock = formData.stockAdjustment !== '' 
        ? parseFloat(formData.stockAdjustment) 
        : editingItem.currentStock;
      
      await updateInventoryItem(editingItem.id, {
        name: formData.name,
        currentStock: newStock,
        minStock: parseFloat(formData.minStock),
        expiryDate: formData.expiryDate || null,
        unit: formData.unit,
        category: formData.category,
      });
      
      if (formData.stockAdjustment !== '') {
        showToast(`✅ Updated ${formData.name} - Stock set to ${newStock}${formData.unit}`);
      } else {
        showToast(`✅ Updated ${formData.name}`);
      }
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
    setFormData({ name: '', currentStock: 0, minStock: '', unit: 'gm', category: 'Dry Store', expiryDate: '', lastUsedDate: null, stockAdjustment: '' });
    setSearchTerm('');
    setEditingItem(null);
    setShowModal(false);
    setShowDropdown(false);
  };

  const handleMaterialSelect = (materialName) => {
    const existingItem = inventory.find(item => item.name === materialName);
    if (existingItem) {
      setFormData({
        name: existingItem.name,
        currentStock: existingItem.currentStock || existingItem.current_stock || 0,
        minStock: existingItem.minStock || existingItem.min_stock || 0,
        unit: existingItem.unit,
        category: existingItem.category,
        expiryDate: existingItem.expiryDate || existingItem.expiry_date || '',
        lastUsedDate: existingItem.lastUsedDate || existingItem.last_used_date || null,
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

  const confirmDelete = async () => {
    if (itemToDelete) {
      await deleteInventoryItem(itemToDelete);
      loadInventory();
      showToast('🗑️ Inventory item deleted');
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

    setIsImporting(true);
    setImportProgress({ current: 0, total: selectedTemplateItems.length });

    // Refresh inventory to get latest data
    await loadInventory();
    const currentInventory = await getInventory();

    let addedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    for (let i = 0; i < selectedTemplateItems.length; i++) {
      const templateItem = selectedTemplateItems[i];
      setImportProgress({ current: i + 1, total: selectedTemplateItems.length });
      
      const existingItem = currentInventory.find(
        item => item.name.toLowerCase() === templateItem.name.toLowerCase()
      );

      if (!existingItem) {
        try {
          await addInventoryItem({
            name: templateItem.name,
            currentStock: 0,
            minStock: templateItem.minStock,
            unit: templateItem.unit,
            category: templateItem.category,
            pricePerUnit: 0,
          });
          addedCount++;
        } catch (error) {
          console.error(`Error adding ${templateItem.name}:`, error);
          errorCount++;
          skippedCount++;
        }
      } else {
        skippedCount++;
      }
    }

    setIsImporting(false);
    loadInventory();
    
    if (errorCount > 0) {
      showToast(`⚠️ Import complete! Added: ${addedCount}, Skipped: ${skippedCount} (${errorCount} errors)`);
    } else {
      showToast(`✅ Import complete! Added: ${addedCount}, Skipped: ${skippedCount}`);
    }
    
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
    // Calculate usage frequency for each template item
    const itemsWithUsage = inventoryTemplate.map(item => {
      // Count how many menu items use this ingredient
      const usageCount = menuItems.filter(menuItem => 
        menuItem.rawMaterials?.some(rm => 
          rm.materialName?.toLowerCase() === item.name.toLowerCase()
        )
      ).length;

      // Check if item exists in inventory and is low stock
      const inventoryItem = inventory.find(inv => inv.name.toLowerCase() === item.name.toLowerCase());
      const isLowStock = inventoryItem && parseFloat(inventoryItem.currentStock) <= parseFloat(inventoryItem.minStock);
      const stockLevel = inventoryItem ? parseFloat(inventoryItem.currentStock) : 0;

      return {
        ...item,
        usageCount,
        isLowStock,
        stockLevel,
        exists: !!inventoryItem,
      };
    });

    // Filter items
    const filtered = itemsWithUsage.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(templateSearch.toLowerCase());
      const matchesCategory = templateCategory === 'All' || item.category === templateCategory;
      const notInInventory = !item.exists;
      return matchesSearch && matchesCategory && notInInventory;
    });

    // Sort by priority:
    // 1. Most used in menu items (high usage count)
    // 2. Low stock items that exist
    // 3. Alphabetically
    return filtered.sort((a, b) => {
      // Prioritize items used in menu
      if (a.usageCount !== b.usageCount) {
        return b.usageCount - a.usageCount; // Higher usage first
      }
      // Then alphabetically
      return a.name.localeCompare(b.name);
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

  const confirmBulkDelete = async () => {
    const deletedCount = selectedItems.length;
    setIsDeleting(true);
    setDeleteProgress({ current: 0, total: deletedCount });
    
    // Delete each selected item with progress
    for (let i = 0; i < selectedItems.length; i++) {
      setDeleteProgress({ current: i + 1, total: deletedCount });
      await deleteInventoryItem(selectedItems[i]);
    }
    
    setIsDeleting(false);
    setSelectedItems([]);
    setSelectAll(false);
    loadInventory();
    showToast(`🗑️ Deleted ${deletedCount} item(s)`);
    setShowBulkDeleteModal(false);
  };

  const handleEmailShoppingList = () => {
    if (selectedItems.length === 0) {
      showToast('⚠️ No items selected');
      return;
    }

    // Load saved email settings
    const settings = getEmailSettings();
    if (settings) {
      setEmailRecipient(settings.email || '');
      setEmailName(settings.name || '');
    }
    
    setShowEmailModal(true);
  };

  const handleSendEmail = async () => {
    if (!emailRecipient) {
      showToast('⚠️ Please enter an email address');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailRecipient)) {
      showToast('⚠️ Please enter a valid email address');
      return;
    }

    setIsSendingEmail(true);

    try {
      const items = await getInventory();
      const selectedItemsData = items.filter(item => selectedItems.includes(item.id));

      const result = await sendShoppingListEmail(
        emailRecipient,
        emailName || 'Cafe Manager',
        selectedItemsData
      );

      if (result.success) {
        showToast(`✅ ${result.message}`);
        setShowEmailModal(false);
        setSelectedItems([]);
        setSelectAll(false);
      } else {
        showToast(`❌ Failed to send email: ${result.error}`);
      }
    } catch (error) {
      showToast(`❌ Error: ${error.message}`);
    } finally {
      setIsSendingEmail(false);
    }
  };

  const handleDownloadShoppingList = async () => {
    if (selectedItems.length === 0) {
      showToast('⚠️ No items selected');
      return;
    }

    const items = await getInventory();
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
    <div className="space-y-4 md:space-y-6 p-2 md:p-0">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl md:text-3xl font-black bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">Inventory Management</h2>
          <p className="text-sm md:text-base text-gray-600 font-semibold mt-1">Track your raw materials and stock levels</p>
        </div>
        <div className="flex items-center gap-3">
          {selectedItems.length > 0 && (
            <>
              <button
                onClick={handleEmailShoppingList}
                className="flex items-center gap-2 px-4 sm:px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold hover:from-indigo-700 hover:to-purple-700 transition shadow-lg hover:shadow-xl hover:-translate-y-0.5"
              >
                <Mail className="w-5 h-5" />
                <span className="hidden sm:inline">Email List ({selectedItems.length})</span>
                <span className="sm:hidden">Email ({selectedItems.length})</span>
              </button>
              <button
                onClick={handleDownloadShoppingList}
                className="flex items-center gap-2 px-4 sm:px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-bold hover:from-blue-700 hover:to-cyan-700 transition shadow-lg hover:shadow-xl hover:-translate-y-0.5"
              >
                <Download className="w-5 h-5" />
                <span className="hidden sm:inline">Download List ({selectedItems.length})</span>
                <span className="sm:hidden">Download ({selectedItems.length})</span>
              </button>
              <button
                onClick={handleDeleteSelected}
                className="flex items-center gap-2 px-4 sm:px-6 py-3 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-xl font-bold hover:from-red-700 hover:to-rose-700 transition shadow-lg hover:shadow-xl hover:-translate-y-0.5"
              >
                <Trash className="w-5 h-5" />
                <span className="hidden sm:inline">Delete Selected ({selectedItems.length})</span>
                <span className="sm:hidden">Delete ({selectedItems.length})</span>
              </button>
            </>
          )}
          <button
            onClick={handleBulkImport}
            className="flex items-center gap-2 px-3 sm:px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-bold hover:from-green-700 hover:to-emerald-700 transition shadow-lg hover:shadow-xl hover:-translate-y-0.5 text-sm sm:text-base"
          >
            <Upload className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="hidden sm:inline">Bulk Import</span>
            <span className="sm:hidden">Import</span>
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-3 sm:px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-bold hover:from-purple-700 hover:to-indigo-700 transition shadow-lg hover:shadow-xl hover:-translate-y-0.5 text-sm sm:text-base"
          >
            <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="hidden sm:inline">Add Inventory</span>
            <span className="sm:hidden">Add</span>
          </button>
        </div>
      </div>

      {/* Cost Impact Dashboard */}
      {showCostDashboard && (() => {
        const usedIngredients = new Set();
        menuItems.forEach(menuItem => {
          if (menuItem.is_active !== false) {
            const materials = menuItem.raw_materials || [];
            materials.forEach(mat => usedIngredients.add(mat.name.toLowerCase()));
          }
        });
        
        const unusedItems = inventory.filter(item => !usedIngredients.has(item.name.toLowerCase()) && !item.isArchived);
        const unusedValue = unusedItems.reduce((sum, item) => {
          const value = (item.currentStock || 0) * (item.pricePerUnit || 0);
          return sum + value;
        }, 0);
        
        const expiringItems = inventory.filter(item => {
          if (!item.expiryDate) return false;
          const daysUntilExpiry = Math.ceil((new Date(item.expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
          return daysUntilExpiry <= 7 && daysUntilExpiry >= 0;
        });
        
        return (
          <div className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-bold text-gray-900">💰 Cost Impact Dashboard</h3>
              <button onClick={() => setShowCostDashboard(false)} className="text-gray-500 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-lg p-3 shadow-sm">
                <div className="text-xs text-gray-600 font-semibold mb-1">Unused Inventory Value</div>
                <div className="text-2xl font-bold text-orange-600">₹{unusedValue.toFixed(0)}</div>
                <div className="text-xs text-gray-500 mt-1">{unusedItems.length} items not in menu</div>
              </div>
              <div className="bg-white rounded-lg p-3 shadow-sm">
                <div className="text-xs text-gray-600 font-semibold mb-1">Active Ingredients</div>
                <div className="text-2xl font-bold text-green-600">{usedIngredients.size}</div>
                <div className="text-xs text-gray-500 mt-1">Used in menu items</div>
              </div>
              <div className="bg-white rounded-lg p-3 shadow-sm">
                <div className="text-xs text-gray-600 font-semibold mb-1">Expiring Soon</div>
                <div className="text-2xl font-bold text-red-600">{expiringItems.length}</div>
                <div className="text-xs text-gray-500 mt-1">Within 7 days</div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Info Banner */}

      {lowStock.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-center gap-2 text-red-700 font-semibold mb-2">
            <AlertTriangle className="w-5 h-5" />
            Low Stock Alert (Active Items Only)
          </div>
          <p className="text-sm text-red-600">{lowStock.length} items used in menu are running low on stock</p>
        </div>
      )}

      {/* Search and Filters - Compact Dropdown Design */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search inventory..."
              value={inventorySearchTerm}
              onChange={(e) => setInventorySearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
            />
          </div>

          {/* Category Filter Dropdown */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm font-medium bg-white"
            >
              <option value="All">📋 All Categories</option>
              <option value="Dry Store">🏪 Dry Store</option>
              <option value="Fresh Produce">🥬 Fresh Produce</option>
              <option value="Refrigerated">❄️ Refrigerated</option>
              <option value="Frozen">🧊 Frozen</option>
              <option value="Fruits">🍎 Fruits</option>
            </select>
          </div>

          {/* Usage Status Dropdown */}
          <div>
            <select
              value={usageFilter}
              onChange={(e) => setUsageFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm font-medium bg-white"
            >
              <option value="all">📋 All Items</option>
              <option value="used">✅ Used in Menu</option>
              <option value="unused">⚪ Unused Items</option>
            </select>
          </div>

          {/* Archived Toggle Dropdown */}
          <div>
            <select
              value={showArchived ? 'archived' : 'active'}
              onChange={(e) => setShowArchived(e.target.value === 'archived')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm font-medium bg-white"
            >
              <option value="active">📦 Active Items</option>
              <option value="archived">📦 Archived Items</option>
            </select>
          </div>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-x-auto">
        <table className="w-full min-w-[900px]">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-3 md:px-6 py-3 text-left w-12">
                <input
                  type="checkbox"
                  checked={selectAll}
                  onChange={handleSelectAll}
                  className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                />
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase w-96">Material Name</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase w-32">Category</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase w-32">Current Stock</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase w-32">Min Stock</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase w-20">Unit</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase w-28">Status</th>
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
                .filter(item => {
                  // Search filter
                  if (inventorySearchTerm && !item.name.toLowerCase().includes(inventorySearchTerm.toLowerCase())) {
                    return false;
                  }
                  
                  // Category filter
                  if (selectedCategory !== 'All' && item.category !== selectedCategory) return false;
                  
                  // Archive filter
                  if (item.isArchived && !showArchived) return false;
                  if (!item.isArchived && showArchived) return false;
                  
                  // Usage filter
                  const isUsedInMenu = menuItems.some(menuItem => {
                    if (menuItem.is_active === false) return false;
                    const materials = menuItem.raw_materials || [];
                    return materials.some(mat => mat.name.toLowerCase() === item.name.toLowerCase());
                  });
                  
                  if (usageFilter === 'used' && !isUsedInMenu) return false;
                  if (usageFilter === 'unused' && isUsedInMenu) return false;
                  
                  return true;
                })
                .sort((a, b) => {
                  // Check if items are used in menu
                  const aUsed = menuItems.some(menuItem => {
                    if (menuItem.is_active === false) return false;
                    const materials = menuItem.raw_materials || [];
                    return materials.some(mat => mat.name.toLowerCase() === a.name.toLowerCase());
                  });
                  const bUsed = menuItems.some(menuItem => {
                    if (menuItem.is_active === false) return false;
                    const materials = menuItem.raw_materials || [];
                    return materials.some(mat => mat.name.toLowerCase() === b.name.toLowerCase());
                  });
                  
                  // Used items come first
                  if (aUsed && !bUsed) return -1;
                  if (!aUsed && bUsed) return 1;
                  
                  // Within same group (both used or both unused), sort A-Z
                  return a.name.localeCompare(b.name);
                })
                .map((item) => {
                // Convert current stock to grams for comparison
                const currentStockInGrams = convertToGrams(item.currentStock, item.unit);
                const isLowStock = currentStockInGrams <= item.minStock;
                
                // Check if item is used in any active menu item
                const isUsedInMenu = menuItems.some(menuItem => {
                  if (menuItem.is_active === false) return false;
                  const materials = menuItem.raw_materials || [];
                  return materials.some(mat => mat.name.toLowerCase() === item.name.toLowerCase());
                });
                
                // Check expiry status
                let expiryStatus = null;
                if (item.expiryDate) {
                  const daysUntilExpiry = Math.ceil((new Date(item.expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
                  if (daysUntilExpiry < 0) expiryStatus = 'expired';
                  else if (daysUntilExpiry <= 3) expiryStatus = 'critical';
                  else if (daysUntilExpiry <= 7) expiryStatus = 'warning';
                }
                
                return (
                  <tr key={item.id} className={`hover:bg-gray-50 ${isLowStock && isUsedInMenu ? 'bg-red-50' : ''} ${!isUsedInMenu ? 'opacity-40' : ''} ${selectedItems.includes(item.id) ? 'bg-purple-50' : ''}`}>
                    <td className="px-4 py-2">
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(item.id)}
                        onChange={() => handleSelectItem(item.id)}
                        className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                      />
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-900">{item.name}</span>
                          {!isUsedInMenu && (
                            <span className="px-2 py-0.5 bg-gray-200 text-gray-600 rounded text-xs font-semibold">
                              Unused
                            </span>
                          )}
                          {item.isArchived && (
                            <span className="px-2 py-0.5 bg-amber-200 text-amber-700 rounded text-xs font-semibold">
                              📦 Archived
                            </span>
                          )}
                          {expiryStatus === 'expired' && (
                            <span className="px-2 py-0.5 bg-red-200 text-red-700 rounded text-xs font-semibold">
                              ⚠️ Expired
                            </span>
                          )}
                          {expiryStatus === 'critical' && (
                            <span className="px-2 py-0.5 bg-red-100 text-red-600 rounded text-xs font-semibold">
                              ⏰ Expires in {Math.ceil((new Date(item.expiryDate) - new Date()) / (1000 * 60 * 60 * 24))}d
                            </span>
                          )}
                          {expiryStatus === 'warning' && (
                            <span className="px-2 py-0.5 bg-orange-100 text-orange-600 rounded text-xs font-semibold">
                              ⏰ Expires in {Math.ceil((new Date(item.expiryDate) - new Date()) / (1000 * 60 * 60 * 24))}d
                            </span>
                          )}
                        </div>
                        {item.lastUsedDate && (
                          <div className="text-xs text-gray-500">
                            Last used: {new Date(item.lastUsedDate).toLocaleDateString()}
                          </div>
                        )}
                        {!isUsedInMenu && !item.isArchived && (
                          <div className="flex gap-1 mt-1">
                            <button
                              onClick={() => {
                                window.location.hash = '#/cafe/menu';
                                showToast(`💡 Add "${item.name}" to a menu item to activate it`);
                              }}
                              className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs font-semibold hover:bg-green-200 transition"
                            >
                              + Add to Menu
                            </button>
                          </div>
                        )}
                      </div>
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
                        {item.currentStock} {item.unit}
                      </span>
                    </td>
                    <td className="px-4 py-2">
                      <span className="text-gray-600">{item.minStock} {item.unit}</span>
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
                              expiryDate: item.expiryDate || '',
                              lastUsedDate: item.lastUsedDate || null,
                              stockAdjustment: '',
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

                  {/* Current Stock Update - Only for editing existing items */}
                  {editingItem && (
                    <div className="col-span-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Update Current Stock
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.stockAdjustment}
                        onChange={(e) => setFormData({...formData, stockAdjustment: e.target.value})}
                        className="w-full px-4 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder={`Current: ${formData.currentStock}${formData.unit}`}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Leave empty to keep current stock ({formData.currentStock}{formData.unit})
                      </p>
                    </div>
                  )}

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
                        <option value="gm">gm</option>
                        <option value="ml">ml</option>
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


                {/* Expiry Date (Optional) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Expiry Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={formData.expiryDate}
                    onChange={(e) => setFormData({...formData, expiryDate: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    min={new Date().toISOString().split('T')[0]}
                  />
                  <p className="text-xs text-gray-500 mt-1">For perishable items - get alerts before expiry</p>
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
              <h3 className="text-xl font-bold text-center mb-2">
                {isDeleting ? `Deleting ${deleteProgress.current} of ${deleteProgress.total}...` : `Delete ${selectedItems.length} Items?`}
              </h3>
              <p className="text-gray-600 text-center mb-6">
                {isDeleting ? 'Please wait while we delete the selected items...' : 'This action cannot be undone. All selected items will be permanently removed from your inventory.'}
              </p>
              {isDeleting && (
                <div className="mb-6">
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div 
                      className="bg-red-600 h-3 rounded-full transition-all duration-300"
                      style={{ width: `${(deleteProgress.current / deleteProgress.total) * 100}%` }}
                    />
                  </div>
                  <p className="text-sm text-gray-600 text-center mt-2">
                    {Math.round((deleteProgress.current / deleteProgress.total) * 100)}% complete
                  </p>
                </div>
              )}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowBulkDeleteModal(false)}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmBulkDelete}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isDeleting ? 'Deleting...' : 'Delete All'}
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
                  <h3 className="text-2xl font-bold">Import Inventory Items</h3>
                  <p className="text-gray-600 text-sm mt-0.5">Select items from our comprehensive cafe & restaurant template</p>
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
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search items..."
                    value={templateSearch}
                    onChange={(e) => setTemplateSearch(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
                <select
                  value={templateCategory}
                  onChange={(e) => setTemplateCategory(e.target.value)}
                  className="px-4 py-2 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
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
              <div className="flex items-center justify-between mt-2 p-2.5 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-900">
                  <strong>{selectedTemplateItems.length}</strong> items selected • <strong>{getFilteredTemplateItems().length}</strong> available
                </p>
                <button
                  onClick={selectAllTemplateItems}
                  className="text-sm font-semibold text-orange-600 hover:text-orange-700"
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
                      <div className="flex items-start gap-2">
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                          isSelected ? 'bg-orange-500 border-orange-500' : 'border-gray-300'
                        }`}>
                          {isSelected && <Check className="w-3 h-3 text-white" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <p className="font-semibold text-sm text-gray-900 truncate flex-1">{item.name}</p>
                            {item.usageCount > 0 && (
                              <span className="text-[11px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded font-semibold" title={`Used in ${item.usageCount} dishes`}>
                                {item.usageCount}
                              </span>
                            )}
                          </div>
                          <div className="mt-1 flex items-center justify-between gap-1 text-xs">
                            <span className="text-gray-500 truncate">{item.category}</span>
                            <span className="text-gray-600 whitespace-nowrap">Min: {item.minStock}{item.unit}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {getFilteredTemplateItems().length === 0 && (
                <div className="text-center py-8">
                  <p className="text-base text-gray-500">No items found matching your search</p>
                </div>
              )}
            </div>

            {/* Progress Bar */}
            {isImporting && (
              <div className="px-6 py-3 border-t">
                <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                  <div 
                    className="bg-orange-600 h-2.5 rounded-full transition-all duration-300"
                    style={{ width: `${(importProgress.current / importProgress.total) * 100}%` }}
                  />
                </div>
                <p className="text-xs text-gray-600 text-center mt-2">
                  Importing {importProgress.current} of {importProgress.total} items ({Math.round((importProgress.current / importProgress.total) * 100)}%)
                </p>
              </div>
            )}

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
                  className="flex-1 px-5 py-2.5 text-base border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmBulkImport}
                  disabled={selectedTemplateItems.length === 0 || isImporting}
                  className="flex-1 px-5 py-2.5 text-base bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700 transition disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  {isImporting ? `Importing ${importProgress.current}/${importProgress.total}...` : `Import ${selectedTemplateItems.length} Item${selectedTemplateItems.length !== 1 ? 's' : ''}`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Email Shopping List Modal */}
      {showEmailModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-indigo-100 rounded-xl">
                <Mail className="w-8 h-8 text-indigo-600" />
              </div>
              <div>
                <h3 className="text-xl sm:text-2xl font-black text-gray-900">Email Shopping List</h3>
                <p className="text-sm text-gray-600">Send list to your email</p>
              </div>
            </div>

            <div className="bg-indigo-50 border-2 border-indigo-200 rounded-xl p-4 mb-6">
              <p className="text-sm text-indigo-800 font-semibold mb-2">📧 Shopping list includes:</p>
              <ul className="text-xs text-indigo-700 space-y-1 ml-4">
                <li>• {selectedItems.length} selected items</li>
                <li>• Item name and quantity needed</li>
                <li>• Current stock and minimum stock levels</li>
                <li>• Category information</li>
              </ul>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Recipient Email *
                </label>
                <input
                  type="email"
                  value={emailRecipient}
                  onChange={(e) => setEmailRecipient(e.target.value)}
                  placeholder="manager@example.com"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition outline-none font-semibold"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Recipient Name (Optional)
                </label>
                <input
                  type="text"
                  value={emailName}
                  onChange={(e) => setEmailName(e.target.value)}
                  placeholder="Cafe Manager"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition outline-none font-semibold"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowEmailModal(false);
                  setEmailRecipient('');
                  setEmailName('');
                }}
                disabled={isSendingEmail}
                className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSendEmail}
                disabled={isSendingEmail}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold hover:from-indigo-700 hover:to-purple-700 transition shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSendingEmail ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Sending...
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <Mail className="w-5 h-5" />
                    Send Email
                  </div>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CafeInventory;
