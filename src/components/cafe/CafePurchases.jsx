import React, { useState, useEffect } from 'react';
import { Plus, Calendar, X, Trash2 } from 'lucide-react';
import { getPurchases, getPurchaseStats, addPurchase, getInventory } from '../../services/cafeService';

const CafePurchases = ({ showToast }) => {
  const [purchases, setPurchases] = useState([]);
  const [stats, setStats] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [inventory, setInventory] = useState([]);
  const [formData, setFormData] = useState({
    supplierName: '',
    items: [],
    totalAmount: '',
    notes: '',
  });
  const [currentItem, setCurrentItem] = useState({
    materialName: '',
    quantity: '',
    unit: 'g',
    totalPrice: '',
  });
  const [materialSearchTerm, setMaterialSearchTerm] = useState('');
  const [showMaterialDropdown, setShowMaterialDropdown] = useState(false);

  useEffect(() => {
    loadPurchases();
    loadInventory();
  }, []);

  const loadInventory = () => {
    setInventory(getInventory());
  };

  const loadPurchases = () => {
    const allPurchases = getPurchases();
    setPurchases(allPurchases);
    
    const startDate = new Date();
    startDate.setDate(1);
    const endDate = new Date();
    const monthStats = getPurchaseStats(startDate, endDate);
    setStats(monthStats);
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
      setCurrentItem({ materialName: '', quantity: '', unit: 'g', totalPrice: '' });
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

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const purchaseData = {
      ...formData,
      totalAmount: calculateTotal(),
    };
    
    addPurchase(purchaseData);
    showToast('Purchase recorded successfully');
    resetForm();
    loadPurchases();
    loadInventory();
  };

  const resetForm = () => {
    setFormData({ supplierName: '', items: [], totalAmount: '', notes: '' });
    setCurrentItem({ materialName: '', quantity: '', unit: 'g', totalPrice: '' });
    setMaterialSearchTerm('');
    setShowMaterialDropdown(false);
    setShowModal(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">Purchases</h2>
          <p className="text-gray-600 font-semibold mt-1">Track raw material purchases</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-bold hover:from-purple-700 hover:to-indigo-700 transition shadow-lg hover:shadow-xl hover:-translate-y-0.5"
        >
          <Plus className="w-5 h-5" />
          Record Purchase
        </button>
      </div>

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-50 to-indigo-50 border-2 border-white shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 group">
            <div className="absolute inset-0 opacity-5">
              <div className="absolute inset-0 bg-gradient-to-br from-black/20 to-transparent"></div>
            </div>
            <div className="relative p-6">
              <p className="text-sm font-semibold text-gray-600 mb-2">This Month</p>
              <p className="text-4xl font-black bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">{stats.totalPurchases}</p>
              <p className="text-xs text-gray-500 mt-1">Total Purchases</p>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-indigo-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
          </div>
          
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-white shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 group">
            <div className="absolute inset-0 opacity-5">
              <div className="absolute inset-0 bg-gradient-to-br from-black/20 to-transparent"></div>
            </div>
            <div className="relative p-6">
              <p className="text-sm font-semibold text-gray-600 mb-2">Total Spent</p>
              <p className="text-4xl font-black bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">₹{stats.totalAmount.toLocaleString()}</p>
              <p className="text-xs text-gray-500 mt-1">This Month</p>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-green-500 to-emerald-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
          </div>
          
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-50 to-amber-50 border-2 border-white shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 group">
            <div className="absolute inset-0 opacity-5">
              <div className="absolute inset-0 bg-gradient-to-br from-black/20 to-transparent"></div>
            </div>
            <div className="relative p-6">
              <p className="text-sm font-semibold text-gray-600 mb-2">Items Purchased</p>
              <p className="text-4xl font-black bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">{stats.totalItems}</p>
              <p className="text-xs text-gray-500 mt-1">Unique Items</p>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 to-amber-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
          </div>
        </div>
      )}

      {/* Purchases Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Date</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Items & Supplier</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase w-32">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Notes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {purchases.length === 0 ? (
              <tr>
                <td colSpan="4" className="px-6 py-12 text-center text-gray-500">
                  No purchases recorded yet. Start tracking your raw material purchases.
                </td>
              </tr>
            ) : (
              purchases.map((purchase) => (
                <tr key={purchase.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-900">
                      {new Date(purchase.date).toLocaleDateString()}
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
                    <span className="text-xl font-black bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">₹{purchase.totalAmount}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-600">{purchase.notes || '-'}</span>
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
                <h3 className="text-2xl font-bold">Record Purchase</h3>
                <button onClick={resetForm}>
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Supplier Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Supplier Name (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.supplierName}
                    onChange={(e) => setFormData({...formData, supplierName: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="e.g., ABC Suppliers"
                  />
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
                              <div className="px-3 py-2 text-sm text-gray-500">
                                No materials found
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
                        <option value="g">g</option>
                        <option value="kg">kg</option>
                        <option value="ml">ml</option>
                        <option value="l">l</option>
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
                    <div className="space-y-2 mb-4">
                      {formData.items.map((item, index) => (
                        <div key={index} className="flex items-center justify-between bg-gradient-to-r from-purple-50 to-indigo-50 border-2 border-purple-200 rounded-lg p-3 hover:shadow-md transition">
                          <div className="flex-1">
                            <span className="font-bold text-gray-900">{item.materialName}</span>
                            <div className="text-sm text-gray-600 mt-1">
                              <span className="font-semibold">{item.quantity}{item.unit}</span>
                              <span className="mx-2">•</span>
                              <span className="text-purple-600 font-semibold">₹{item.total}</span>
                              <span className="text-xs text-gray-500 ml-2">(₹{item.pricePerUnit}/{item.unit})</span>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeItemFromPurchase(index)}
                            className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                      
                      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-lg p-4 shadow-md">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-gray-900 text-lg">Total Amount:</span>
                          <span className="text-3xl font-black bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">₹{calculateTotal()}</span>
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
                    Record Purchase
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

export default CafePurchases;
