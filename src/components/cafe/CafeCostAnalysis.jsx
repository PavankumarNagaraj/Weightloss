import React, { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, TrendingDown, AlertCircle, Calculator, Package } from 'lucide-react';
import { getAllMenuItemsCostAnalysis } from '../../services/cafeService';

const CafeCostAnalysis = ({ showToast }) => {
  const [analysis, setAnalysis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('profitMargin'); // profitMargin, profit, cost
  const [sortOrder, setSortOrder] = useState('desc');

  useEffect(() => {
    loadAnalysis();
  }, []);

  const loadAnalysis = async () => {
    setLoading(true);
    const data = await getAllMenuItemsCostAnalysis();
    setAnalysis(data);
    setLoading(false);
  };

  const sortedAnalysis = [...analysis].sort((a, b) => {
    if (!a.hasRecipe) return 1;
    if (!b.hasRecipe) return -1;
    
    const multiplier = sortOrder === 'asc' ? 1 : -1;
    return (a[sortBy] - b[sortBy]) * multiplier;
  });

  const itemsWithRecipes = analysis.filter(item => item.hasRecipe);
  const itemsWithoutRecipes = analysis.filter(item => !item.hasRecipe);
  
  const avgProfitMargin = itemsWithRecipes.length > 0
    ? itemsWithRecipes.reduce((sum, item) => sum + item.profitMargin, 0) / itemsWithRecipes.length
    : 0;

  const totalRevenuePotential = itemsWithRecipes.reduce((sum, item) => sum + item.price, 0);
  const totalCost = itemsWithRecipes.reduce((sum, item) => sum + item.cost, 0);
  const totalProfit = totalRevenuePotential - totalCost;

  const getProfitColor = (margin) => {
    if (margin >= 40) return 'text-green-600 bg-green-50';
    if (margin >= 25) return 'text-blue-600 bg-blue-50';
    if (margin >= 15) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getProfitIcon = (margin) => {
    if (margin >= 25) return <TrendingUp className="w-4 h-4" />;
    if (margin >= 15) return <DollarSign className="w-4 h-4" />;
    return <TrendingDown className="w-4 h-4" />;
  };

  return (
    <div className="space-y-4 sm:space-y-6 p-2 sm:p-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
            Cost Analysis
          </h2>
          <p className="text-sm sm:text-base text-gray-600 font-semibold mt-1">
            Profit margins and cost breakdown by menu item
          </p>
        </div>
        <div className="p-2 sm:p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl">
          <Calculator className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white rounded-xl shadow-lg border-2 border-gray-100 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Package className="w-5 h-5 text-blue-600" />
            <p className="text-xs sm:text-sm font-semibold text-gray-600">Items Analyzed</p>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-gray-900">{itemsWithRecipes.length}</p>
          <p className="text-xs text-gray-500 mt-1">{itemsWithoutRecipes.length} without recipes</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg border-2 border-gray-100 p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            <p className="text-xs sm:text-sm font-semibold text-gray-600">Avg Margin</p>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-green-600">{avgProfitMargin.toFixed(1)}%</p>
          <p className="text-xs text-gray-500 mt-1">Across all items</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg border-2 border-gray-100 p-4">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-5 h-5 text-purple-600" />
            <p className="text-xs sm:text-sm font-semibold text-gray-600">Total Cost</p>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-gray-900">₹{totalCost.toFixed(0)}</p>
          <p className="text-xs text-gray-500 mt-1">Recipe costs</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg border-2 border-gray-100 p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-emerald-600" />
            <p className="text-xs sm:text-sm font-semibold text-gray-600">Total Profit</p>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-emerald-600">₹{totalProfit.toFixed(0)}</p>
          <p className="text-xs text-gray-500 mt-1">Potential profit</p>
        </div>
      </div>

      {/* Sort Controls */}
      <div className="bg-white rounded-xl shadow-lg border-2 border-gray-100 p-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <p className="text-sm font-semibold text-gray-700">Sort by:</p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSortBy('profitMargin')}
              className={`px-4 py-2 rounded-lg font-semibold text-sm transition ${
                sortBy === 'profitMargin'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Profit Margin %
            </button>
            <button
              onClick={() => setSortBy('profit')}
              className={`px-4 py-2 rounded-lg font-semibold text-sm transition ${
                sortBy === 'profit'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Profit ₹
            </button>
            <button
              onClick={() => setSortBy('cost')}
              className={`px-4 py-2 rounded-lg font-semibold text-sm transition ${
                sortBy === 'cost'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Cost ₹
            </button>
          </div>
          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-semibold text-sm hover:bg-gray-200 transition"
          >
            {sortOrder === 'asc' ? '↑ Ascending' : '↓ Descending'}
          </button>
        </div>
      </div>

      {/* Analysis Table */}
      <div className="bg-white rounded-xl shadow-lg border-2 border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-green-600 to-emerald-600 text-white">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-bold">Menu Item</th>
                <th className="px-4 py-3 text-right text-sm font-bold">Price</th>
                <th className="px-4 py-3 text-right text-sm font-bold">Cost</th>
                <th className="px-4 py-3 text-right text-sm font-bold">Profit</th>
                <th className="px-4 py-3 text-right text-sm font-bold">Margin %</th>
                <th className="px-4 py-3 text-center text-sm font-bold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-4 py-8 text-center text-gray-500">
                    Loading analysis...
                  </td>
                </tr>
              ) : sortedAnalysis.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-4 py-8 text-center text-gray-500">
                    No menu items found. Add items to your menu first.
                  </td>
                </tr>
              ) : (
                sortedAnalysis.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3">
                      <div className="font-semibold text-gray-900">{item.name}</div>
                      <div className="text-xs text-gray-500">{item.category}</div>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-gray-900">
                      ₹{item.price?.toFixed(2) || '0.00'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {item.hasRecipe ? (
                        <span className="font-semibold text-gray-900">
                          ₹{item.cost.toFixed(2)}
                        </span>
                      ) : (
                        <span className="text-gray-400 text-sm">No recipe</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {item.hasRecipe ? (
                        <span className={`font-semibold ${item.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          ₹{item.profit.toFixed(2)}
                        </span>
                      ) : (
                        <span className="text-gray-400 text-sm">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {item.hasRecipe ? (
                        <div className="flex items-center justify-end gap-1">
                          {getProfitIcon(item.profitMargin)}
                          <span className="font-bold text-gray-900">
                            {item.profitMargin.toFixed(1)}%
                          </span>
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {item.hasRecipe ? (
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${getProfitColor(item.profitMargin)}`}>
                          {item.profitMargin >= 40 ? 'Excellent' :
                           item.profitMargin >= 25 ? 'Good' :
                           item.profitMargin >= 15 ? 'Fair' : 'Low'}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold text-orange-600 bg-orange-50">
                          <AlertCircle className="w-3 h-3" />
                          No Recipe
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recommendations */}
      {itemsWithoutRecipes.length > 0 && (
        <div className="bg-orange-50 border-2 border-orange-200 rounded-xl p-4 sm:p-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-orange-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-bold text-orange-900 mb-2">Action Required</h3>
              <p className="text-sm text-orange-800 mb-3">
                {itemsWithoutRecipes.length} menu item(s) don't have recipes. Add recipes to calculate accurate costs and profit margins.
              </p>
              <div className="flex flex-wrap gap-2">
                {itemsWithoutRecipes.slice(0, 5).map(item => (
                  <span key={item.id} className="px-3 py-1 bg-white rounded-lg text-sm font-semibold text-orange-900">
                    {item.name}
                  </span>
                ))}
                {itemsWithoutRecipes.length > 5 && (
                  <span className="px-3 py-1 bg-white rounded-lg text-sm font-semibold text-orange-900">
                    +{itemsWithoutRecipes.length - 5} more
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CafeCostAnalysis;
