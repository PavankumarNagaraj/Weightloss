import React, { useState, useEffect } from 'react';
import { Plus, Calendar, X, Trash2, Edit, Upload, Image as ImageIcon } from 'lucide-react';
import { getPurchases, getPurchaseStats, addPurchase, updatePurchase, deletePurchase, getInventory } from '../../services/cafeService';
import { uploadReceiptToCloudinary } from '../../services/cloudinaryUpload';
import { getAllVendorNames } from '../../services/vendorPriceService';

const CafePurchases = ({ showToast }) => {
  const [purchases, setPurchases] = useState([]);
  const [stats, setStats] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState(null);
  const [editingPurchase, setEditingPurchase] = useState(null);
  const [purchaseToDelete, setPurchaseToDelete] = useState(null);
  const [inventory, setInventory] = useState([]);
  const [receiptImage, setReceiptImage] = useState(null);
  const [receiptPreview, setReceiptPreview] = useState(null);
  const [formData, setFormData] = useState({
    supplierName: '',
    items: [],
    totalAmount: '',
    notes: '',
    receiptUrl: null,
    receiptFilename: null,
  });
  const [currentItem, setCurrentItem] = useState({
    materialName: '',
    quantity: '',
    unit: 'gm',
    totalPrice: '',
  });
  const [materialSearchTerm, setMaterialSearchTerm] = useState('');
  const [showMaterialDropdown, setShowMaterialDropdown] = useState(false);
  const [vendorNames, setVendorNames] = useState([]);
  const [showVendorDropdown, setShowVendorDropdown] = useState(false);
  const [showQuickAddInventory, setShowQuickAddInventory] = useState(false);
  const [quickAddData, setQuickAddData] = useState({
    name: '',
    minStock: '',
    unit: 'gm',
    category: 'Dry Store',
  });

  useEffect(() => {
    loadPurchases();
    loadInventory();
    loadVendorNames();
  }, []);

  const loadVendorNames = async () => {
    const vendors = await getAllVendorNames();
    setVendorNames(vendors);
  };

  const loadInventory = async () => {
    const items = await getInventory();
    setInventory(items);
  };

  const loadPurchases = async () => {
    const allPurchases = await getPurchases();
    // Map snake_case to camelCase for compatibility
    const mappedPurchases = allPurchases.map(purchase => ({
      ...purchase,
      orderNumber: purchase.order_number ?? purchase.orderNumber,
      supplierName: purchase.supplier_name ?? purchase.supplierName,
      totalAmount: purchase.total_amount ?? purchase.totalAmount,
      createdAt: purchase.created_at ?? purchase.createdAt,
      receiptUrl: purchase.receipt_url ?? purchase.receiptUrl,
      receiptFilename: purchase.receipt_filename ?? purchase.receiptFilename,
    }));
    setPurchases(mappedPurchases);
    
    // Calculate stats from all purchases for this month
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthPurchases = mappedPurchases.filter(p => {
      const purchaseDate = new Date(p.date);
      return purchaseDate >= startOfMonth;
    });
    
    const totalAmount = monthPurchases.reduce((sum, p) => sum + (parseFloat(p.totalAmount) || 0), 0);
    const totalPurchases = monthPurchases.length;
    
    // Count unique items across all purchases
    const allItems = new Set();
    monthPurchases.forEach(purchase => {
      if (purchase.items && Array.isArray(purchase.items)) {
        purchase.items.forEach(item => {
          allItems.add(item.materialName);
        });
      }
    });
    
    setStats({
      totalAmount,
      totalPurchases,
      totalItems: allItems.size,
    });
  };

  const handleMaterialSelect = (material) => {
    setCurrentItem({
      materialName: material.name,
      quantity: '',
      unit: material.unit,
      totalPrice: '',
    });
    setMaterialSearchTerm(material.name);
    setShowMaterialDropdown(false);
  };

  const handleMaterialSearchChange = (value) => {
    setMaterialSearchTerm(value);
    setCurrentItem({ ...currentItem, materialName: value });
    setShowMaterialDropdown(true);
  };

  const filteredInventory = inventory.filter(item =>
    item.name.toLowerCase().includes(materialSearchTerm.toLowerCase())
  );

  const handleQuickAddInventory = () => {
    setQuickAddData({
      name: materialSearchTerm,
      minStock: '',
      unit: currentItem.unit || 'gm',
      category: 'Dry Store',
    });
    setShowQuickAddInventory(true);
    setShowMaterialDropdown(false);
  };

  const submitQuickAddInventory = async () => {
    if (!quickAddData.name || !quickAddData.minStock) {
      showToast('❌ Please fill in all required fields');
      return;
    }

    try {
      await addInventoryItem({
        name: quickAddData.name,
        currentStock: 0,
        minStock: parseFloat(quickAddData.minStock),
        unit: quickAddData.unit,
        category: quickAddData.category,
      });
      
      showToast('✅ Item added to inventory');
      await loadInventory();
      
      // Auto-select the newly added item
      setCurrentItem({
        ...currentItem,
        materialName: quickAddData.name,
        unit: quickAddData.unit,
      });
      setMaterialSearchTerm(quickAddData.name);
      setShowQuickAddInventory(false);
      setQuickAddData({ name: '', minStock: '', unit: 'gm', category: 'Dry Store' });
    } catch (error) {
      showToast('❌ Error adding item to inventory');
      console.error('Error adding inventory item:', error);
    }
  };

  const addItemToPurchase = () => {
    if (currentItem.materialName && currentItem.quantity && currentItem.totalPrice) {
      const pricePerUnit = parseFloat(currentItem.totalPrice) / parseFloat(currentItem.quantity);
      setFormData({
        ...formData,
        items: [...formData.items, { 
          ...currentItem, 
          pricePerUnit: pricePerUnit.toFixed(2),
          total: parseFloat(currentItem.totalPrice)
        }]
      });
      setCurrentItem({ materialName: '', quantity: '', unit: 'gm', totalPrice: '' });
      setMaterialSearchTerm('');
    }
  };

  const removeItemFromPurchase = (index) => {
    setFormData({
      ...formData,
      items: formData.items.filter((_, i) => i !== index)
    });
  };

  const calculateTotal = () => {
    return formData.items.reduce((sum, item) => sum + item.total, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const purchaseData = {
      ...formData,
      totalAmount: calculateTotal(),
    };
    
    if (editingPurchase) {
      await updatePurchase(editingPurchase.id, purchaseData);
      showToast('✅ Purchase updated successfully');
    } else {
      await addPurchase(purchaseData);
      showToast('✅ Purchase recorded successfully');
    }
    
    resetForm();
    await loadPurchases();
    await loadInventory();
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (max 10MB for Cloudinary)
      if (file.size > 10 * 1024 * 1024) {
        showToast('❌ Image size should be less than 10MB');
        return;
      }
      
      // Check file type
      if (!file.type.startsWith('image/')) {
        showToast('❌ Please upload an image file');
        return;
      }
      
      setReceiptImage(file);
      
      // Create local preview immediately
      const reader = new FileReader();
      reader.onloadend = () => {
        setReceiptPreview(reader.result);
      };
      reader.readAsDataURL(file);
      
      // Upload to Cloudinary in background
      try {
        showToast('📤 Uploading receipt to cloud...');
        const orderNumber = formData.orderNumber || `PO${Date.now().toString().slice(-6)}`;
        const cloudinaryResult = await uploadReceiptToCloudinary(file, orderNumber);
        
        setFormData({
          ...formData,
          receiptUrl: cloudinaryResult.url,
          receiptFilename: file.name,
        });
        
        showToast('✅ Receipt uploaded successfully');
      } catch (error) {
        console.error('Upload error:', error);
        showToast('⚠️ Upload failed, using local storage');
        // Fallback to base64 if Cloudinary fails
        const reader2 = new FileReader();
        reader2.onloadend = () => {
          setFormData({
            ...formData,
            receiptUrl: reader2.result,
            receiptFilename: file.name,
          });
        };
        reader2.readAsDataURL(file);
      }
    }
  };

  const removeImage = () => {
    setReceiptImage(null);
    setReceiptPreview(null);
    setFormData({
      ...formData,
      receiptUrl: null,
      receiptFilename: null,
    });
  };

  const handleEdit = (purchase) => {
    setEditingPurchase(purchase);
    setFormData({
      supplierName: purchase.supplierName || '',
      items: purchase.items || [],
      totalAmount: purchase.totalAmount || '',
      notes: purchase.notes || '',
      receiptUrl: purchase.receiptUrl || null,
      receiptFilename: purchase.receiptFilename || null,
    });
    setReceiptPreview(purchase.receiptUrl || null);
    setShowModal(true);
  };

  const handleDeleteClick = (purchase) => {
    setPurchaseToDelete(purchase);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (purchaseToDelete) {
      await deletePurchase(purchaseToDelete.id);
      showToast('🗑️ Purchase deleted successfully');
      setShowDeleteModal(false);
      setPurchaseToDelete(null);
      await loadPurchases();
    }
  };

  const resetForm = () => {
    setFormData({ supplierName: '', items: [], totalAmount: '', notes: '', receiptUrl: null, receiptFilename: null });
    setCurrentItem({ materialName: '', quantity: '', unit: 'gm', totalPrice: '' });
    setMaterialSearchTerm('');
    setShowMaterialDropdown(false);
    setReceiptImage(null);
    setReceiptPreview(null);
    setShowModal(false);
    setEditingPurchase(null);
  };

  return (
    <div className="space-y-4 md:space-y-6 p-2 md:p-0">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl md:text-3xl font-black bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">Purchases</h2>
          <p className="text-sm md:text-base text-gray-600 font-semibold mt-1">Track raw material purchases</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="flex items-center justify-center gap-2 px-4 md:px-6 py-2 md:py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-bold hover:from-purple-700 hover:to-indigo-700 transition shadow-lg hover:shadow-xl text-sm md:text-base w-full md:w-auto"
        >
          <Plus className="w-4 h-4 md:w-5 md:h-5" />
          <span className="hidden sm:inline">Record Purchase</span>
          <span className="sm:hidden">Add Purchase</span>
        </button>
      </div>

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-50 to-indigo-50 border-2 border-white shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 group">
            <div className="absolute inset-0 opacity-5">
              <div className="absolute inset-0 bg-gradient-to-br from-black/20 to-transparent"></div>
            </div>
            <div className="relative p-4 md:p-6">
              <p className="text-xs md:text-sm font-semibold text-gray-600 mb-2">This Month</p>
              <p className="text-3xl md:text-4xl font-black bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">{stats.totalPurchases}</p>
              <p className="text-xs text-gray-500 mt-1">Total Purchases</p>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-indigo-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
          </div>
          
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-white shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 group">
            <div className="absolute inset-0 opacity-5">
              <div className="absolute inset-0 bg-gradient-to-br from-black/20 to-transparent"></div>
            </div>
            <div className="relative p-4 md:p-6">
              <p className="text-xs md:text-sm font-semibold text-gray-600 mb-2">Total Spent</p>
              <p className="text-3xl md:text-4xl font-black bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">₹{(stats.totalAmount || 0).toLocaleString()}</p>
              <p className="text-xs text-gray-500 mt-1">This Month</p>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-green-500 to-emerald-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
          </div>
          
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-50 to-amber-50 border-2 border-white shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 group">
            <div className="absolute inset-0 opacity-5">
              <div className="absolute inset-0 bg-gradient-to-br from-black/20 to-transparent"></div>
            </div>
            <div className="relative p-4 md:p-6">
              <p className="text-xs md:text-sm font-semibold text-gray-600 mb-2">Items Purchased</p>
              <p className="text-3xl md:text-4xl font-black bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">{stats.totalItems || 0}</p>
              <p className="text-xs text-gray-500 mt-1">Unique Items</p>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 to-amber-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
          </div>
        </div>
      )}

      {/* Purchases Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-x-auto">
        <table className="w-full min-w-[800px]">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Order #</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Date</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Items & Supplier</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase w-32">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Notes</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase w-24">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {purchases.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                  No purchases recorded yet. Start tracking your raw material purchases.
                </td>
              </tr>
            ) : (
              purchases.map((purchase) => (
                <tr key={purchase.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <button
                      onClick={() => {
                        setSelectedPurchase(purchase);
                        setShowDetailModal(true);
                      }}
                      className="text-sm font-bold text-purple-600 hover:text-purple-800 hover:underline cursor-pointer"
                    >
                      {purchase.orderNumber || 'N/A'}
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-900">
                      {new Date(purchase.date || purchase.createdAt).toLocaleDateString()}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-600">
                      {purchase.items?.map((item, index) => (
                        <div key={index} className="mb-1">
                          {item.materialName} - {item.quantity}{item.unit}
                        </div>
                      ))}
                    </div>
                    {purchase.supplierName && (
                      <div className="mt-2 pt-2 border-t border-gray-200">
                        <span className="text-xs text-gray-500">Supplier: </span>
                        <span className="text-xs font-semibold text-gray-700">{purchase.supplierName}</span>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xl font-black bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">₹{purchase.totalAmount || purchase.total_amount || 0}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-600">{purchase.notes || '-'}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(purchase)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                        title="Edit purchase"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(purchase)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                        title="Delete purchase"
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

      {/* Record Purchase Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold">{editingPurchase ? 'Edit Purchase' : 'Record Purchase'}</h3>
                <button onClick={resetForm}>
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Supplier Name with Autocomplete */}
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Supplier Name (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.supplierName}
                    onChange={(e) => {
                      setFormData({...formData, supplierName: e.target.value});
                      setShowVendorDropdown(e.target.value.length > 0);
                    }}
                    onFocus={() => setShowVendorDropdown(formData.supplierName.length > 0)}
                    onBlur={() => setTimeout(() => setShowVendorDropdown(false), 200)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="e.g., ABC Suppliers (start typing for suggestions)"
                  />
                  
                  {/* Vendor Autocomplete Dropdown */}
                  {showVendorDropdown && vendorNames.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                      {vendorNames
                        .filter(vendor => 
                          vendor.toLowerCase().includes(formData.supplierName.toLowerCase())
                        )
                        .map((vendor, index) => (
                          <div
                            key={index}
                            onClick={() => {
                              setFormData({...formData, supplierName: vendor});
                              setShowVendorDropdown(false);
                            }}
                            className="px-4 py-2 hover:bg-orange-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-gray-900">{vendor}</span>
                              <span className="text-xs text-gray-500">Previous vendor</span>
                            </div>
                          </div>
                        ))
                      }
                      {vendorNames.filter(vendor => 
                        vendor.toLowerCase().includes(formData.supplierName.toLowerCase())
                      ).length === 0 && (
                        <div className="px-4 py-3 text-sm text-gray-500 text-center">
                          No matching vendors. Type to add new vendor.
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Add Items Section */}
                <div className="border-t pt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-3">Purchase Items</label>
                  
                  <div className="bg-gray-50 rounded-lg p-4 mb-3">
                    <div className="grid grid-cols-12 gap-2">
                      {/* Material Dropdown */}
                      <div className="col-span-4 relative">
                        <input
                          type="text"
                          placeholder="Search material..."
                          value={materialSearchTerm}
                          onChange={(e) => handleMaterialSearchChange(e.target.value)}
                          onFocus={() => setShowMaterialDropdown(true)}
                          onBlur={() => setTimeout(() => setShowMaterialDropdown(false), 200)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                        />
                        
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
                                  <span className="text-xs text-gray-500 ml-2">({item.unit})</span>
                                </button>
                              ))
                            ) : (
                              <div className="p-3">
                                <div className="text-sm text-gray-500 mb-2">
                                  "{materialSearchTerm}" not found in inventory
                                </div>
                                <button
                                  type="button"
                                  onClick={handleQuickAddInventory}
                                  className="w-full px-3 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition text-sm"
                                >
                                  + Add to Inventory
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      
                      <input
                        type="number"
                        placeholder="Quantity"
                        value={currentItem.quantity}
                        onChange={(e) => setCurrentItem({...currentItem, quantity: e.target.value})}
                        className="col-span-2 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                      />
                      
                      <select
                        value={currentItem.unit}
                        onChange={(e) => setCurrentItem({...currentItem, unit: e.target.value})}
                        className="col-span-2 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                        disabled={currentItem.materialName && inventory.find(item => item.name === currentItem.materialName)}
                      >
                        <option value="gm">gm</option>
                        <option value="ml">ml</option>
                        <option value="pcs">pcs</option>
                      </select>
                      
                      <input
                        type="number"
                        placeholder="Total Price"
                        value={currentItem.totalPrice}
                        onChange={(e) => setCurrentItem({...currentItem, totalPrice: e.target.value})}
                        className="col-span-2 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                      />
                      
                      <button
                        type="button"
                        onClick={addItemToPurchase}
                        className="col-span-2 px-3 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-indigo-700 transition text-sm shadow-md"
                      >
                        Add
                      </button>
                    </div>
                  </div>

                  {/* Items List */}
                  {formData.items.length > 0 && (
                    <div className="space-y-1.5 mb-4">
                      {formData.items.map((item, index) => (
                        <div key={index} className="flex items-center justify-between bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-lg p-2 hover:shadow-sm transition">
                          <div className="flex-1">
                            <span className="font-semibold text-gray-900 text-sm">{item.materialName}</span>
                            <span className="text-xs text-gray-600 ml-2">
                              {item.quantity}{item.unit}
                              <span className="mx-1.5">•</span>
                              <span className="text-purple-600 font-semibold">₹{item.total}</span>
                              <span className="text-gray-400 ml-1">(₹{item.pricePerUnit}/{item.unit})</span>
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeItemFromPurchase(index)}
                            className="p-1.5 text-red-600 hover:bg-red-100 rounded-lg transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                      
                      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-lg p-3 shadow-md mt-2">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-gray-900">Total Amount:</span>
                          <span className="text-2xl font-black bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">₹{calculateTotal()}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Notes (Optional)</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="Add any additional notes..."
                    rows="3"
                  />
                </div>

                {/* Receipt Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Receipt/Invoice Image (Optional)
                  </label>
                  {!receiptPreview ? (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-purple-400 transition">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        id="receipt-upload"
                      />
                      <label htmlFor="receipt-upload" className="cursor-pointer">
                        <Upload className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600 font-semibold">Click to upload receipt</p>
                        <p className="text-xs text-gray-400 mt-1">PNG, JPG up to 10MB • Stored in Cloudinary</p>
                      </label>
                    </div>
                  ) : (
                    <div className="relative border-2 border-purple-200 rounded-lg p-4">
                      <button
                        type="button"
                        onClick={removeImage}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      <img
                        src={receiptPreview}
                        alt="Receipt preview"
                        className="max-h-48 mx-auto rounded-lg"
                      />
                      <p className="text-xs text-gray-500 text-center mt-2">{formData.receiptFilename}</p>
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
                    disabled={formData.items.length === 0}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg font-bold hover:from-purple-700 hover:to-indigo-700 transition disabled:bg-gray-300 disabled:cursor-not-allowed shadow-lg"
                  >
                    {editingPurchase ? 'Update Purchase' : 'Record Purchase'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && purchaseToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-red-600">Delete Purchase</h3>
                <button onClick={() => setShowDeleteModal(false)}>
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="mb-6">
                <p className="text-gray-700 mb-2">Are you sure you want to delete this purchase?</p>
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 mt-3">
                  <p className="text-sm font-semibold text-gray-900">Order #{purchaseToDelete.orderNumber}</p>
                  <p className="text-sm text-gray-600">Amount: ₹{purchaseToDelete.totalAmount}</p>
                  <p className="text-sm text-gray-600">{purchaseToDelete.items?.length || 0} items</p>
                </div>
                <p className="text-sm text-red-600 mt-3 font-semibold">⚠️ This action cannot be undone.</p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition"
                >
                  Delete Purchase
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Purchase Detail Modal */}
      {showDetailModal && selectedPurchase && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold">Purchase Order Details</h3>
                  <p className="text-sm text-gray-500 mt-1">Order #{selectedPurchase.orderNumber}</p>
                </div>
                <button onClick={() => setShowDetailModal(false)}>
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Order Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Date</p>
                    <p className="text-sm font-semibold">{new Date(selectedPurchase.date || selectedPurchase.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Supplier</p>
                    <p className="text-sm font-semibold">{selectedPurchase.supplierName || 'N/A'}</p>
                  </div>
                </div>

                {/* Items Table */}
                <div>
                  <h4 className="text-lg font-bold mb-3">Items Purchased</h4>
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Material</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Quantity</th>
                          <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600">Price</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {selectedPurchase.items?.map((item, index) => (
                          <tr key={index}>
                            <td className="px-4 py-3 text-sm font-medium">{item.materialName}</td>
                            <td className="px-4 py-3 text-sm">{item.quantity} {item.unit}</td>
                            <td className="px-4 py-3 text-sm text-right font-semibold">₹{item.totalPrice?.toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Total */}
                <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-4 rounded-lg border-2 border-purple-200">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-gray-700">Total Amount</span>
                    <span className="text-2xl font-black bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                      ₹{selectedPurchase.totalAmount?.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Receipt Image */}
                {selectedPurchase.receiptUrl && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Receipt/Invoice</h4>
                    <div className="border-2 border-gray-200 rounded-lg p-4 bg-gray-50">
                      <img
                        src={selectedPurchase.receiptUrl}
                        alt="Receipt"
                        className="max-h-96 mx-auto rounded-lg shadow-lg cursor-pointer hover:shadow-xl transition"
                        onClick={() => window.open(selectedPurchase.receiptUrl, '_blank')}
                      />
                      <p className="text-xs text-gray-500 text-center mt-2">
                        {selectedPurchase.receiptFilename || 'Receipt Image'} • Click to view full size
                      </p>
                    </div>
                  </div>
                )}

                {/* Notes */}
                {selectedPurchase.notes && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Notes</h4>
                    <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">{selectedPurchase.notes}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Add to Inventory Modal */}
      {showQuickAddInventory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md shadow-2xl">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900">Add to Inventory</h3>
                <button 
                  onClick={() => {
                    setShowQuickAddInventory(false);
                    setQuickAddData({ name: '', minStock: '', unit: 'gm', category: 'Dry Store' });
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Item Name
                  </label>
                  <input
                    type="text"
                    value={quickAddData.name}
                    onChange={(e) => setQuickAddData({...quickAddData, name: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="e.g., Tomatoes"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Minimum Stock Level *
                  </label>
                  <input
                    type="number"
                    value={quickAddData.minStock}
                    onChange={(e) => setQuickAddData({...quickAddData, minStock: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="e.g., 10"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Unit
                  </label>
                  <select
                    value={quickAddData.unit}
                    onChange={(e) => setQuickAddData({...quickAddData, unit: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="gm">gm</option>
                    <option value="kg">kg</option>
                    <option value="ml">ml</option>
                    <option value="l">l</option>
                    <option value="pcs">pcs</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    value={quickAddData.category}
                    onChange={(e) => setQuickAddData({...quickAddData, category: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="Dry Store">🏪 Dry Store</option>
                    <option value="Fresh Produce">🥬 Fresh Produce</option>
                    <option value="Refrigerated">❄️ Refrigerated</option>
                    <option value="Frozen">🧊 Frozen</option>
                    <option value="Fruits">🍎 Fruits</option>
                  </select>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowQuickAddInventory(false);
                      setQuickAddData({ name: '', minStock: '', unit: 'gm', category: 'Dry Store' });
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={submitQuickAddInventory}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition"
                  >
                    Add & Continue
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CafePurchases;
