import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, X, ChefHat, Clock, DollarSign } from 'lucide-react';
import { getRecipes, addRecipe, updateRecipe, deleteRecipe, getMenuItems, getInventory } from '../../services/cafeService';

const CafeRecipes = ({ showToast }) => {
  const [recipes, setRecipes] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState(null);
  const [formData, setFormData] = useState({
    menuItemId: '',
    recipeName: '',
    portionSize: '',
    portionUnit: 'serving',
    preparationTime: '',
    cookingTime: '',
    instructions: '',
    notes: '',
    ingredients: [],
  });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [recipeToDelete, setRecipeToDelete] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [recipesData, menuData, inventoryData] = await Promise.all([
      getRecipes(),
      getMenuItems(),
      getInventory(),
    ]);
    setRecipes(recipesData);
    setMenuItems(menuData);
    setInventory(inventoryData);
  };

  const resetForm = () => {
    setFormData({
      menuItemId: '',
      recipeName: '',
      portionSize: '',
      portionUnit: 'serving',
      preparationTime: '',
      cookingTime: '',
      instructions: '',
      notes: '',
      ingredients: [],
    });
    setEditingRecipe(null);
  };

  const handleAddIngredient = () => {
    setFormData({
      ...formData,
      ingredients: [
        ...formData.ingredients,
        { inventoryItemId: '', ingredientName: '', quantity: '', unit: '', costPerUnit: 0 },
      ],
    });
  };

  const handleRemoveIngredient = (index) => {
    setFormData({
      ...formData,
      ingredients: formData.ingredients.filter((_, i) => i !== index),
    });
  };

  const handleIngredientChange = (index, field, value) => {
    const newIngredients = [...formData.ingredients];
    newIngredients[index][field] = value;

    // Auto-fill ingredient details when inventory item is selected
    if (field === 'inventoryItemId') {
      const item = inventory.find(inv => inv.id === value);
      if (item) {
        newIngredients[index].ingredientName = item.name;
        newIngredients[index].unit = item.unit;
        newIngredients[index].costPerUnit = item.pricePerUnit || 0;
      }
    }

    setFormData({ ...formData, ingredients: newIngredients });
  };

  const calculateTotalCost = () => {
    return formData.ingredients.reduce((sum, ing) => {
      const qty = parseFloat(ing.quantity) || 0;
      const cost = parseFloat(ing.costPerUnit) || 0;
      return sum + (qty * cost);
    }, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.menuItemId || !formData.recipeName) {
      showToast('⚠️ Please fill in required fields');
      return;
    }

    if (formData.ingredients.length === 0) {
      showToast('⚠️ Please add at least one ingredient');
      return;
    }

    try {
      if (editingRecipe) {
        await updateRecipe(editingRecipe.id, formData);
        showToast('✅ Recipe updated successfully');
      } else {
        await addRecipe(formData);
        showToast('✅ Recipe added successfully');
      }

      setShowModal(false);
      resetForm();
      loadData();
    } catch (error) {
      showToast('❌ Error saving recipe: ' + error.message);
    }
  };

  const handleEdit = (recipe) => {
    setEditingRecipe(recipe);
    setFormData({
      menuItemId: recipe.menu_item_id,
      recipeName: recipe.recipe_name,
      portionSize: recipe.portion_size || '',
      portionUnit: recipe.portion_unit || 'serving',
      preparationTime: recipe.preparation_time || '',
      cookingTime: recipe.cooking_time || '',
      instructions: recipe.instructions || '',
      notes: recipe.notes || '',
      ingredients: (recipe.ingredients || []).map(ing => ({
        inventoryItemId: ing.inventory_item_id,
        ingredientName: ing.ingredient_name,
        quantity: ing.quantity,
        unit: ing.unit,
        costPerUnit: ing.cost_per_unit,
      })),
    });
    setShowModal(true);
  };

  const handleDelete = async () => {
    try {
      await deleteRecipe(recipeToDelete.id);
      showToast('✅ Recipe deleted successfully');
      setShowDeleteModal(false);
      setRecipeToDelete(null);
      loadData();
    } catch (error) {
      showToast('❌ Error deleting recipe: ' + error.message);
    }
  };

  const getRecipeCost = (recipe) => {
    if (!recipe.ingredients) return 0;
    return recipe.ingredients.reduce((sum, ing) => sum + (parseFloat(ing.total_cost) || 0), 0);
  };

  return (
    <div className="space-y-4 sm:space-y-6 p-2 sm:p-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
            Recipe Management
          </h2>
          <p className="text-sm sm:text-base text-gray-600 font-semibold mt-1">
            Create recipes with ingredient costing
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="p-2 sm:p-3 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl">
            <ChefHat className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
          </div>
          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="flex items-center gap-2 px-4 sm:px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-xl font-bold hover:from-orange-700 hover:to-red-700 transition shadow-lg"
          >
            <Plus className="w-5 h-5" />
            <span className="hidden sm:inline">Add Recipe</span>
            <span className="sm:hidden">Add</span>
          </button>
        </div>
      </div>

      {/* Recipes Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {recipes.length === 0 ? (
          <div className="col-span-full bg-white rounded-xl shadow-lg border-2 border-gray-100 p-8 text-center">
            <ChefHat className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 font-semibold">No recipes yet. Add your first recipe!</p>
          </div>
        ) : (
          recipes.map((recipe) => {
            const cost = getRecipeCost(recipe);
            const menuItem = recipe.menu_item;
            const profit = menuItem ? (parseFloat(menuItem.price) - cost) : 0;
            const margin = menuItem && menuItem.price > 0 ? ((profit / menuItem.price) * 100) : 0;

            return (
              <div key={recipe.id} className="bg-white rounded-xl shadow-lg border-2 border-gray-100 p-4 sm:p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg sm:text-xl font-black text-gray-900">{recipe.recipe_name}</h3>
                    {menuItem && (
                      <p className="text-sm text-gray-600 font-semibold">
                        {menuItem.name} - ₹{menuItem.price}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEdit(recipe)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => {
                        setRecipeToDelete(recipe);
                        setShowDeleteModal(true);
                      }}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Cost Summary */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-orange-50 rounded-lg p-3">
                    <p className="text-xs text-orange-600 font-semibold mb-1">Recipe Cost</p>
                    <p className="text-lg font-black text-orange-900">₹{cost.toFixed(2)}</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-3">
                    <p className="text-xs text-green-600 font-semibold mb-1">Profit Margin</p>
                    <p className="text-lg font-black text-green-900">{margin.toFixed(1)}%</p>
                  </div>
                </div>

                {/* Time Info */}
                <div className="flex items-center gap-4 mb-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>Prep: {recipe.preparation_time || 0}m</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>Cook: {recipe.cooking_time || 0}m</span>
                  </div>
                </div>

                {/* Ingredients */}
                <div className="border-t pt-3">
                  <p className="text-xs font-bold text-gray-700 mb-2">
                    Ingredients ({recipe.ingredients?.length || 0})
                  </p>
                  <div className="space-y-1">
                    {(recipe.ingredients || []).slice(0, 3).map((ing, idx) => (
                      <div key={idx} className="flex justify-between text-xs text-gray-600">
                        <span>{ing.ingredient_name}</span>
                        <span className="font-semibold">
                          {ing.quantity} {ing.unit} - ₹{parseFloat(ing.total_cost || 0).toFixed(2)}
                        </span>
                      </div>
                    ))}
                    {recipe.ingredients?.length > 3 && (
                      <p className="text-xs text-gray-500 italic">
                        +{recipe.ingredients.length - 3} more ingredients
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add/Edit Recipe Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full my-8">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-2xl font-black text-gray-900">
                {editingRecipe ? 'Edit Recipe' : 'Add New Recipe'}
              </h3>
              <button onClick={() => { setShowModal(false); resetForm(); }} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Menu Item *</label>
                  <select
                    value={formData.menuItemId}
                    onChange={(e) => setFormData({ ...formData, menuItemId: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition outline-none"
                    required
                  >
                    <option value="">Select menu item</option>
                    {menuItems.map(item => (
                      <option key={item.id} value={item.id}>{item.name} - ₹{item.price}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Recipe Name *</label>
                  <input
                    type="text"
                    value={formData.recipeName}
                    onChange={(e) => setFormData({ ...formData, recipeName: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Portion Size</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      step="0.01"
                      value={formData.portionSize}
                      onChange={(e) => setFormData({ ...formData, portionSize: e.target.value })}
                      className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition outline-none"
                    />
                    <select
                      value={formData.portionUnit}
                      onChange={(e) => setFormData({ ...formData, portionUnit: e.target.value })}
                      className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition outline-none"
                    >
                      <option value="serving">serving</option>
                      <option value="plate">plate</option>
                      <option value="cup">cup</option>
                      <option value="bowl">bowl</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Prep Time (min)</label>
                    <input
                      type="number"
                      value={formData.preparationTime}
                      onChange={(e) => setFormData({ ...formData, preparationTime: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Cook Time (min)</label>
                    <input
                      type="number"
                      value={formData.cookingTime}
                      onChange={(e) => setFormData({ ...formData, cookingTime: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Ingredients */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <label className="text-sm font-bold text-gray-700">Ingredients *</label>
                  <button
                    type="button"
                    onClick={handleAddIngredient}
                    className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700 transition text-sm"
                  >
                    <Plus className="w-4 h-4" />
                    Add Ingredient
                  </button>
                </div>

                <div className="space-y-3">
                  {formData.ingredients.map((ing, index) => (
                    <div key={index} className="flex gap-2 items-start bg-gray-50 p-3 rounded-lg">
                      <select
                        value={ing.inventoryItemId}
                        onChange={(e) => handleIngredientChange(index, 'inventoryItemId', e.target.value)}
                        className="flex-1 px-3 py-2 border-2 border-gray-200 rounded-lg text-sm"
                        required
                      >
                        <option value="">Select ingredient</option>
                        {inventory.map(item => (
                          <option key={item.id} value={item.id}>
                            {item.name} (₹{item.pricePerUnit}/{item.unit})
                          </option>
                        ))}
                      </select>
                      <input
                        type="number"
                        step="0.001"
                        value={ing.quantity}
                        onChange={(e) => handleIngredientChange(index, 'quantity', e.target.value)}
                        placeholder="Qty"
                        className="w-24 px-3 py-2 border-2 border-gray-200 rounded-lg text-sm"
                        required
                      />
                      <span className="px-3 py-2 bg-white border-2 border-gray-200 rounded-lg text-sm font-semibold">
                        {ing.unit || '-'}
                      </span>
                      <span className="px-3 py-2 bg-green-50 border-2 border-green-200 rounded-lg text-sm font-bold text-green-900">
                        ₹{((parseFloat(ing.quantity) || 0) * (parseFloat(ing.costPerUnit) || 0)).toFixed(2)}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveIngredient(index)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>

                {formData.ingredients.length > 0 && (
                  <div className="mt-4 p-4 bg-green-50 border-2 border-green-200 rounded-xl">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-green-900">Total Recipe Cost:</span>
                      <span className="text-2xl font-black text-green-900">₹{calculateTotalCost().toFixed(2)}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Instructions & Notes */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Instructions</label>
                <textarea
                  value={formData.instructions}
                  onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                  rows="3"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition outline-none"
                  placeholder="Step-by-step cooking instructions..."
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows="2"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition outline-none"
                  placeholder="Additional notes..."
                />
              </div>

              {/* Submit */}
              <div className="flex gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => { setShowModal(false); resetForm(); }}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-xl font-bold hover:from-orange-700 hover:to-red-700 transition shadow-lg"
                >
                  {editingRecipe ? 'Update Recipe' : 'Add Recipe'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-black text-gray-900 mb-4">Delete Recipe?</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete "{recipeToDelete?.recipe_name}"? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => { setShowDeleteModal(false); setRecipeToDelete(null); }}
                className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 px-6 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CafeRecipes;
