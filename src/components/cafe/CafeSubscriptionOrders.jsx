import React, { useState, useEffect } from 'react';
import { Calendar, Edit2, Save, X, Plus, Copy, Trash2, Printer } from 'lucide-react';
import { getMenuItems } from '../../services/cafeService';

const CafeSubscriptionOrders = ({ showToast }) => {
  const [menuItems, setMenuItems] = useState([]);
  const [weeklyPlan, setWeeklyPlan] = useState({});
  const [editingCell, setEditingCell] = useState(null);
  const [selectedMeal, setSelectedMeal] = useState('');
  const [showMealSelector, setShowMealSelector] = useState(false);
  const [currentWeekStart, setCurrentWeekStart] = useState(getWeekStart(new Date()));

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const mealTypes = ['Breakfast', 'Lunch', 'Dinner'];

  useEffect(() => {
    loadMenuItems();
    loadWeeklyPlan();
  }, [currentWeekStart]);

  function getWeekStart(date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust to Monday
    return new Date(d.setDate(diff));
  }

  const loadMenuItems = () => {
    setMenuItems(getMenuItems());
  };

  const loadWeeklyPlan = () => {
    const weekKey = formatDate(currentWeekStart);
    const savedPlans = JSON.parse(localStorage.getItem('cafe_weekly_plans') || '{}');
    
    if (savedPlans[weekKey]) {
      setWeeklyPlan(savedPlans[weekKey]);
    } else {
      // Initialize empty plan
      const emptyPlan = {};
      daysOfWeek.forEach(day => {
        emptyPlan[day] = {
          Breakfast: null,
          Lunch: null,
          Dinner: null,
        };
      });
      setWeeklyPlan(emptyPlan);
    }
  };

  const saveWeeklyPlan = (plan) => {
    const weekKey = formatDate(currentWeekStart);
    const savedPlans = JSON.parse(localStorage.getItem('cafe_weekly_plans') || '{}');
    savedPlans[weekKey] = plan;
    localStorage.setItem('cafe_weekly_plans', JSON.stringify(savedPlans));
    setWeeklyPlan(plan); // Update state to prevent blank page
    showToast('Weekly plan saved successfully');
  };

  const formatDate = (date) => {
    return date.toISOString().split('T')[0];
  };

  const getDateForDay = (dayIndex) => {
    const date = new Date(currentWeekStart);
    date.setDate(date.getDate() + dayIndex);
    return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
  };

  const handleEditCell = (day, mealType) => {
    setEditingCell({ day, mealType });
    setSelectedMeal(weeklyPlan[day]?.[mealType]?.id || '');
    setShowMealSelector(true);
  };

  const handleSaveCell = () => {
    if (!editingCell) return;

    const { day, mealType } = editingCell;
    const meal = menuItems.find(m => m.id === selectedMeal);
    
    const updatedPlan = {
      ...weeklyPlan,
      [day]: {
        ...weeklyPlan[day],
        [mealType]: meal || null,
      },
    };

    setWeeklyPlan(updatedPlan);
    saveWeeklyPlan(updatedPlan);
    setEditingCell(null);
    setShowMealSelector(false);
    setSelectedMeal('');
  };

  const handleCancelEdit = () => {
    setEditingCell(null);
    setShowMealSelector(false);
    setSelectedMeal('');
  };

  const handleClearCell = (day, mealType) => {
    const updatedPlan = {
      ...weeklyPlan,
      [day]: {
        ...weeklyPlan[day],
        [mealType]: null,
      },
    };

    setWeeklyPlan(updatedPlan);
    saveWeeklyPlan(updatedPlan);
  };

  const handleCopyDay = (sourceDay) => {
    const sourceMeals = weeklyPlan[sourceDay];
    const updatedPlan = { ...weeklyPlan };
    
    daysOfWeek.forEach(day => {
      if (day !== sourceDay) {
        updatedPlan[day] = { ...sourceMeals };
      }
    });

    setWeeklyPlan(updatedPlan);
    saveWeeklyPlan(updatedPlan);
    showToast(`Copied ${sourceDay}'s meals to all days`);
  };

  const handlePreviousWeek = () => {
    const newWeekStart = new Date(currentWeekStart);
    newWeekStart.setDate(newWeekStart.getDate() - 7);
    setCurrentWeekStart(newWeekStart);
  };

  const handleNextWeek = () => {
    const newWeekStart = new Date(currentWeekStart);
    newWeekStart.setDate(newWeekStart.getDate() + 7);
    setCurrentWeekStart(newWeekStart);
  };

  const handleCurrentWeek = () => {
    setCurrentWeekStart(getWeekStart(new Date()));
  };

  const handleCopyToNextWeek = () => {
    const currentWeekKey = formatDate(currentWeekStart);
    const nextWeekStart = new Date(currentWeekStart);
    nextWeekStart.setDate(nextWeekStart.getDate() + 7);
    const nextWeekKey = formatDate(nextWeekStart);
    
    const savedPlans = JSON.parse(localStorage.getItem('cafe_weekly_plans') || '{}');
    
    // Copy current week's plan to next week
    if (savedPlans[currentWeekKey]) {
      // Deep copy the current week's plan
      const copiedPlan = JSON.parse(JSON.stringify(savedPlans[currentWeekKey]));
      savedPlans[nextWeekKey] = copiedPlan;
      localStorage.setItem('cafe_weekly_plans', JSON.stringify(savedPlans));
      
      // Navigate to next week and update state
      setCurrentWeekStart(nextWeekStart);
      setWeeklyPlan(copiedPlan);
      
      showToast('Current week copied to next week successfully!');
    } else {
      showToast('No meals planned for current week');
    }
  };

  const handleClearThisWeek = () => {
    // Check if this week is in the past
    const today = getWeekStart(new Date());
    if (currentWeekStart < today) {
      showToast('Cannot clear past weeks');
      return;
    }

    if (window.confirm('Are you sure you want to clear all meals for this week?')) {
      const weekKey = formatDate(currentWeekStart);
      const savedPlans = JSON.parse(localStorage.getItem('cafe_weekly_plans') || '{}');
      
      // Delete this week's plan
      delete savedPlans[weekKey];
      localStorage.setItem('cafe_weekly_plans', JSON.stringify(savedPlans));
      
      // Reset to empty plan
      const emptyPlan = {};
      daysOfWeek.forEach(day => {
        emptyPlan[day] = {
          Breakfast: null,
          Lunch: null,
          Dinner: null,
        };
      });
      
      setWeeklyPlan(emptyPlan);
      showToast('Week cleared successfully!');
    }
  };

  const isCurrentOrFutureWeek = () => {
    const today = getWeekStart(new Date());
    return currentWeekStart >= today;
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print-area, .print-area * {
            visibility: visible;
          }
          .print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .print-hide {
            display: none !important;
          }
          table {
            page-break-inside: auto;
          }
          tr {
            page-break-inside: avoid;
            page-break-after: auto;
          }
          @page {
            margin: 1cm;
          }
        }
      `}</style>
      {/* Header */}
      <div className="flex items-center justify-between print:hidden">
        <div>
          <h2 className="text-xl sm:text-3xl font-black bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
            Subscription Orders
          </h2>
        </div>
      </div>

      {/* Week Navigation & Actions */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl p-3 sm:p-4 text-white shadow-lg">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 sm:gap-3">
            <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
            <div>
              <p className="text-xs font-semibold opacity-90">Week Starting</p>
              <p className="text-sm sm:text-lg font-black">
                {currentWeekStart.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
              </p>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-1 sm:gap-2 w-full sm:w-auto">
            <button
              onClick={handlePrint}
              className="px-2 sm:px-3 py-1.5 sm:py-2 bg-white/20 backdrop-blur-sm text-white rounded-lg text-xs sm:text-sm font-semibold hover:bg-white/30 transition flex items-center gap-1 sm:gap-2 print:hidden"
            >
              <Printer className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Print Menu</span>
              <span className="sm:hidden">Print</span>
            </button>
            <button
              onClick={handleCopyToNextWeek}
              className="px-2 sm:px-3 py-1.5 sm:py-2 bg-white/20 backdrop-blur-sm text-white rounded-lg text-xs sm:text-sm font-semibold hover:bg-white/30 transition flex items-center gap-1 sm:gap-2 print:hidden"
            >
              <Copy className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Copy to Next</span>
              <span className="sm:hidden">Copy</span>
            </button>
            {isCurrentOrFutureWeek() && (
              <button
                onClick={handleClearThisWeek}
                className="px-2 sm:px-3 py-1.5 sm:py-2 bg-red-500/80 backdrop-blur-sm text-white rounded-lg text-xs sm:text-sm font-semibold hover:bg-red-600 transition flex items-center gap-1 sm:gap-2 print:hidden"
              >
                <X className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Clear</span>
                <span className="sm:hidden">Clear</span>
              </button>
            )}
            <div className="hidden sm:block w-px h-8 bg-white/30 print:hidden"></div>
            <button
              onClick={handlePreviousWeek}
              className="px-2 sm:px-3 py-1.5 sm:py-2 bg-white/20 backdrop-blur-sm text-white rounded-lg text-xs sm:text-sm font-semibold hover:bg-white/30 transition print:hidden"
            >
              ← <span className="hidden sm:inline">Prev</span>
            </button>
            <button
              onClick={handleCurrentWeek}
              className="px-2 sm:px-3 py-1.5 sm:py-2 bg-white/20 backdrop-blur-sm text-white rounded-lg text-xs sm:text-sm font-semibold hover:bg-white/30 transition print:hidden"
            >
              Today
            </button>
            <button
              onClick={handleNextWeek}
              className="px-2 sm:px-3 py-1.5 sm:py-2 bg-white/20 backdrop-blur-sm text-white rounded-lg text-xs sm:text-sm font-semibold hover:bg-white/30 transition print:hidden"
            >
              <span className="hidden sm:inline">Next</span> →
            </button>
          </div>
        </div>
      </div>

      {/* Weekly Plan Table */}
      <div className="print-area bg-white rounded-xl shadow-lg border-2 border-gray-200 overflow-x-auto print:shadow-none print:border-black">
        <div className="hidden print:block text-center py-4 border-b-2 border-black">
          <h1 className="text-2xl font-black text-gray-900">AFTERBURN CAFE - Weekly Menu</h1>
          <p className="text-lg font-bold text-gray-700 mt-2">
            Week: {currentWeekStart.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
          </p>
        </div>
        <table className="w-full min-w-[640px] table-fixed print:border-collapse">
          <thead className="bg-gradient-to-r from-purple-50 to-indigo-50 border-b-2 border-purple-200 print:bg-gray-200 print:border-black">
            <tr>
              <th className="px-3 py-3 text-left text-xs font-black text-gray-700 uppercase print:text-base print:py-4 print:border print:border-black" style={{width: '15%'}}>Day</th>
              {mealTypes.map((mealType) => (
                <th key={mealType} className="px-3 py-3 text-center text-xs font-black text-gray-700 uppercase print:text-base print:py-4 print:border print:border-black" style={{width: '28.33%'}}>
                  <div className="flex items-center justify-center gap-2">
                    <div className={`w-2 h-2 rounded-full print:hidden ${
                      mealType === 'Breakfast' ? 'bg-orange-500' :
                      mealType === 'Lunch' ? 'bg-green-500' :
                      'bg-blue-500'
                    }`}></div>
                    {mealType}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 print:divide-black">
            {daysOfWeek.map((day, dayIndex) => (
              <tr key={day} className="hover:bg-gray-50 print:hover:bg-white">
                <td className="px-3 py-3 font-bold text-gray-900 bg-gray-50 print:bg-white print:text-base print:py-6 print:border print:border-black">
                  <div>
                    <div className="text-xs print:text-base">{day}</div>
                    <div className="text-xs text-purple-600 font-semibold print:text-sm print:text-gray-600">{getDateForDay(dayIndex)}</div>
                  </div>
                </td>
                {mealTypes.map((mealType) => {
                  const meal = weeklyPlan[day]?.[mealType];
                  const isEditing = editingCell?.day === day && editingCell?.mealType === mealType;

                  return (
                    <td key={`${day}-${mealType}`} className="px-3 py-3 text-center align-top print:py-6 print:border print:border-black">
                    {isEditing ? (
                      <div className="space-y-1 print-hide">
                        <select
                          value={selectedMeal}
                          onChange={(e) => setSelectedMeal(e.target.value)}
                          className="w-full px-2 py-1 border-2 border-purple-300 rounded text-xs focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        >
                          <option value="">Select</option>
                          {menuItems.map((item) => (
                            <option key={item.id} value={item.id}>
                              {item.name}
                            </option>
                          ))}
                        </select>
                        <div className="flex gap-1 justify-center">
                          <button
                            onClick={handleSaveCell}
                            className="px-2 py-1 bg-green-600 text-white rounded text-xs font-bold hover:bg-green-700"
                          >
                            <Save className="w-3 h-3" />
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="px-2 py-1 bg-gray-300 text-gray-700 rounded text-xs font-bold hover:bg-gray-400"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ) : meal ? (
                      <div className="group relative">
                        <div className="bg-gradient-to-br from-purple-50 to-indigo-50 border-2 border-purple-200 rounded p-2 hover:shadow-md transition print:bg-white print:border-0 print:p-0">
                          <p className="font-bold text-gray-900 text-xs truncate print:text-base print:text-left">{meal.name}</p>
                          <p className="text-xs text-purple-600 font-semibold print:hidden">₹{meal.price}</p>
                        </div>
                        <div className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition flex gap-1 print:hidden">
                          <button
                            onClick={() => handleEditCell(day, mealType)}
                            className="p-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                            title="Edit"
                          >
                            <Edit2 className="w-2 h-2" />
                          </button>
                          <button
                            onClick={() => handleClearCell(day, mealType)}
                            className="p-1 bg-red-600 text-white rounded hover:bg-red-700"
                            title="Clear"
                          >
                            <X className="w-2 h-2" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleEditCell(day, mealType)}
                        className="w-full py-4 border-2 border-dashed border-gray-300 rounded text-gray-400 hover:border-purple-400 hover:text-purple-600 hover:bg-purple-50 transition print:hidden"
                      >
                        <Plus className="w-4 h-4 mx-auto" />
                      </button>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 sm:p-4 print:hidden">
        <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3">Quick Actions</h3>
        <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2">
          {daysOfWeek.map((day) => (
            <button
              key={day}
              onClick={() => handleCopyDay(day)}
              className="px-3 sm:px-4 py-2 bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-700 rounded-lg text-xs sm:text-sm font-semibold hover:from-purple-200 hover:to-indigo-200 transition flex items-center justify-center gap-1 sm:gap-2"
            >
              <Copy className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Copy {day} to All</span>
              <span className="sm:hidden">{day.substring(0, 3)}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CafeSubscriptionOrders;
