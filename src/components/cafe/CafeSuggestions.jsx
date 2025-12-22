import React, { useState, useEffect } from 'react';
import { TrendingUp, AlertTriangle, DollarSign, Package, ArrowUp, ArrowDown, CheckCircle, XCircle, Lightbulb } from 'lucide-react';
import { getPurchases, getMenuItems, getRecipes, getRecipeIngredients, getInventory } from '../../services/cafeService';

const CafeSuggestions = ({ showToast }) => {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, high, medium, low

  useEffect(() => {
    loadSuggestions();
  }, []);

  const loadSuggestions = async () => {
    setLoading(true);
    try {
      const priceChangeSuggestions = await analyzePriceChanges();
      setSuggestions(priceChangeSuggestions);
    } catch (error) {
      console.error('Error loading suggestions:', error);
      showToast('❌ Failed to load suggestions');
    } finally {
      setLoading(false);
    }
  };

  const analyzePriceChanges = async () => {
    // Get all data
    const purchases = await getPurchases();
    const menuItems = await getMenuItems();
    const recipes = await getRecipes();
    const inventory = await getInventory();

    // Calculate average price per material over time
    const materialPrices = {};
    
    purchases.forEach(purchase => {
      if (!purchase.items) return;
      
      purchase.items.forEach(item => {
        const materialName = item.materialName || item.material_name;
        const quantity = parseFloat(item.quantity) || 0;
        const pricePerUnit = parseFloat(item.pricePerUnit || item.price_per_unit) || 0;
        const date = purchase.date || purchase.created_at;

        if (!materialName || quantity === 0) return;

        if (!materialPrices[materialName]) {
          materialPrices[materialName] = [];
        }

        materialPrices[materialName].push({
          date: new Date(date),
          pricePerUnit,
          quantity,
        });
      });
    });

    // Calculate price trends
    const priceTrends = {};
    Object.keys(materialPrices).forEach(material => {
      const prices = materialPrices[material].sort((a, b) => a.date - b.date);
      
      if (prices.length < 2) return;

      // Get recent prices (last 3 purchases)
      const recentPrices = prices.slice(-3);
      const olderPrices = prices.slice(0, -3);

      if (olderPrices.length === 0) return;

      const recentAvg = recentPrices.reduce((sum, p) => sum + p.pricePerUnit, 0) / recentPrices.length;
      const olderAvg = olderPrices.reduce((sum, p) => sum + p.pricePerUnit, 0) / olderPrices.length;

      const percentageChange = ((recentAvg - olderAvg) / olderAvg) * 100;

      if (Math.abs(percentageChange) > 5) { // Only show if change > 5%
        priceTrends[material] = {
          oldPrice: olderAvg,
          newPrice: recentAvg,
          percentageChange,
          lastPurchaseDate: prices[prices.length - 1].date,
        };
      }
    });

    // Find affected menu items
    const suggestions = [];

    for (const recipe of recipes) {
      if (!recipe.menu_item_id) continue;

      const menuItem = menuItems.find(m => m.id === recipe.menu_item_id);
      if (!menuItem) continue;

      const ingredients = await getRecipeIngredients(recipe.id);
      
      let totalCostIncrease = 0;
      let affectedIngredients = [];

      for (const ingredient of ingredients) {
        const materialName = ingredient.inventory_item_name || ingredient.inventoryItemName;
        const trend = priceTrends[materialName];

        if (trend && trend.percentageChange > 0) {
          const quantityUsed = parseFloat(ingredient.quantity) || 0;
          const costIncrease = (trend.newPrice - trend.oldPrice) * quantityUsed;
          
          totalCostIncrease += costIncrease;
          affectedIngredients.push({
            name: materialName,
            oldPrice: trend.oldPrice,
            newPrice: trend.newPrice,
            percentageChange: trend.percentageChange,
            costIncrease,
          });
        }
      }

      if (totalCostIncrease > 0) {
        const currentPrice = parseFloat(menuItem.price) || 0;
        const oldCost = ingredients.reduce((sum, ing) => {
          const materialName = ing.inventory_item_name || ing.inventoryItemName;
          const trend = priceTrends[materialName];
          const quantity = parseFloat(ing.quantity) || 0;
          const price = trend ? trend.oldPrice : 0;
          return sum + (price * quantity);
        }, 0);

        const newCost = oldCost + totalCostIncrease;
        const oldMargin = currentPrice > 0 ? ((currentPrice - oldCost) / currentPrice) * 100 : 0;
        const newMargin = currentPrice > 0 ? ((currentPrice - newCost) / currentPrice) * 100 : 0;
        const marginDrop = oldMargin - newMargin;

        // Calculate suggested new price to maintain margin
        const suggestedPrice = newCost / (1 - (oldMargin / 100));
        const priceIncrease = suggestedPrice - currentPrice;
        const priceIncreasePercent = (priceIncrease / currentPrice) * 100;

        // Determine priority
        let priority = 'low';
        if (marginDrop > 10 || priceIncreasePercent > 15) {
          priority = 'high';
        } else if (marginDrop > 5 || priceIncreasePercent > 8) {
          priority = 'medium';
        }

        suggestions.push({
          id: menuItem.id,
          menuItem: menuItem.name,
          currentPrice,
          suggestedPrice: Math.ceil(suggestedPrice), // Round up
          priceIncrease,
          priceIncreasePercent,
          oldCost,
          newCost,
          costIncrease: totalCostIncrease,
          oldMargin,
          newMargin,
          marginDrop,
          affectedIngredients,
          priority,
        });
      }
    }

    return suggestions.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  };

  const filteredSuggestions = suggestions.filter(s => {
    if (filter === 'all') return true;
    return s.priority === filter;
  });

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'low': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'high': return <AlertTriangle className="w-5 h-5" />;
      case 'medium': return <TrendingUp className="w-5 h-5" />;
      case 'low': return <Lightbulb className="w-5 h-5" />;
      default: return <Lightbulb className="w-5 h-5" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Analyzing price trends...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
            Price Suggestions
          </h2>
          <p className="text-gray-600 font-semibold mt-1">
            Smart recommendations based on raw material cost changes
          </p>
        </div>
        <div className="p-3 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl">
          <Lightbulb className="w-8 h-8 text-white" />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-6 border-2 border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-semibold text-gray-600">Total Suggestions</p>
            <Lightbulb className="w-5 h-5 text-purple-600" />
          </div>
          <p className="text-3xl font-black text-gray-900">{suggestions.length}</p>
        </div>

        <div className="bg-white rounded-xl p-6 border-2 border-red-100 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-semibold text-red-600">High Priority</p>
            <AlertTriangle className="w-5 h-5 text-red-600" />
          </div>
          <p className="text-3xl font-black text-red-600">
            {suggestions.filter(s => s.priority === 'high').length}
          </p>
        </div>

        <div className="bg-white rounded-xl p-6 border-2 border-orange-100 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-semibold text-orange-600">Medium Priority</p>
            <TrendingUp className="w-5 h-5 text-orange-600" />
          </div>
          <p className="text-3xl font-black text-orange-600">
            {suggestions.filter(s => s.priority === 'medium').length}
          </p>
        </div>

        <div className="bg-white rounded-xl p-6 border-2 border-yellow-100 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-semibold text-yellow-600">Low Priority</p>
            <Lightbulb className="w-5 h-5 text-yellow-600" />
          </div>
          <p className="text-3xl font-black text-yellow-600">
            {suggestions.filter(s => s.priority === 'low').length}
          </p>
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        {['all', 'high', 'medium', 'low'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg font-semibold transition ${
              filter === f
                ? 'bg-purple-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Suggestions List */}
      {filteredSuggestions.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center border-2 border-gray-100">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">All Good!</h3>
          <p className="text-gray-600">
            {filter === 'all' 
              ? 'No price adjustments needed based on current raw material costs.'
              : `No ${filter} priority suggestions at this time.`}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredSuggestions.map((suggestion) => (
            <div
              key={suggestion.id}
              className={`bg-white rounded-xl p-6 border-2 shadow-sm ${getPriorityColor(suggestion.priority)}`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${getPriorityColor(suggestion.priority)}`}>
                    {getPriorityIcon(suggestion.priority)}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{suggestion.menuItem}</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {suggestion.priority.charAt(0).toUpperCase() + suggestion.priority.slice(1)} Priority
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                {/* Current vs Suggested Price */}
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-gray-600">Price Adjustment</p>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-gray-900">₹{suggestion.currentPrice}</span>
                    <ArrowUp className="w-5 h-5 text-red-500" />
                    <span className="text-2xl font-bold text-green-600">₹{suggestion.suggestedPrice}</span>
                  </div>
                  <p className="text-sm text-red-600 font-semibold">
                    +₹{suggestion.priceIncrease.toFixed(2)} ({suggestion.priceIncreasePercent.toFixed(1)}%)
                  </p>
                </div>

                {/* Cost Change */}
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-gray-600">Cost Change</p>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-gray-900">₹{suggestion.oldCost.toFixed(2)}</span>
                    <ArrowUp className="w-5 h-5 text-red-500" />
                    <span className="text-2xl font-bold text-red-600">₹{suggestion.newCost.toFixed(2)}</span>
                  </div>
                  <p className="text-sm text-red-600 font-semibold">
                    +₹{suggestion.costIncrease.toFixed(2)}
                  </p>
                </div>

                {/* Margin Impact */}
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-gray-600">Profit Margin</p>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-gray-900">{suggestion.oldMargin.toFixed(1)}%</span>
                    <ArrowDown className="w-5 h-5 text-red-500" />
                    <span className="text-2xl font-bold text-red-600">{suggestion.newMargin.toFixed(1)}%</span>
                  </div>
                  <p className="text-sm text-red-600 font-semibold">
                    -{suggestion.marginDrop.toFixed(1)}% drop
                  </p>
                </div>
              </div>

              {/* Affected Ingredients */}
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-3">
                  Affected Ingredients ({suggestion.affectedIngredients.length})
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {suggestion.affectedIngredients.map((ing, idx) => (
                    <div key={idx} className="bg-white bg-opacity-50 rounded-lg p-3 border border-gray-200">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-gray-900">{ing.name}</span>
                        <span className="text-xs font-bold text-red-600">
                          +{ing.percentageChange.toFixed(1)}%
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-gray-600">₹{ing.oldPrice.toFixed(2)}</span>
                        <ArrowUp className="w-3 h-3 text-red-500" />
                        <span className="text-red-600 font-semibold">₹{ing.newPrice.toFixed(2)}</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Cost increase: ₹{ing.costIncrease.toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommendation */}
              <div className="mt-4 p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <Lightbulb className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-blue-900 mb-1">Recommendation</p>
                    <p className="text-sm text-blue-800">
                      Increase price from <strong>₹{suggestion.currentPrice}</strong> to{' '}
                      <strong>₹{suggestion.suggestedPrice}</strong> to maintain your{' '}
                      <strong>{suggestion.oldMargin.toFixed(1)}%</strong> profit margin despite the{' '}
                      <strong>₹{suggestion.costIncrease.toFixed(2)}</strong> increase in raw material costs.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CafeSuggestions;
