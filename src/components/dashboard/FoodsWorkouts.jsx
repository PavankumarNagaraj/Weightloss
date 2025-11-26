import React, { useState, useEffect } from 'react';
import { Apple, Dumbbell, Flame, Clock, Calendar, ChevronRight, ChevronLeft, Info } from 'lucide-react';
import foodsData from '../../data/foods.json';
import workoutsData from '../../data/workouts.json';

const FoodsWorkouts = () => {
  const [selectedDay, setSelectedDay] = useState(1);
  const [weekStart, setWeekStart] = useState(1);
  const [batchStartDate, setBatchStartDate] = useState(null);

  const foods = foodsData.food_program_30_days;
  const workouts = workoutsData.days;
  const programInfo = {
    name: workoutsData.program_name,
    structure: workoutsData.session_structure_minutes,
    phases: workoutsData.phases
  };

  const extendedFoods = [
    ...foods,
    ...foods.map(f => ({ ...f, day: f.day + 30 }))
  ];
  
  const extendedWorkouts = [
    ...workouts,
    ...workouts.map(w => ({ ...w, day: w.day + 30 }))
  ];

  useEffect(() => {
    // Get active batch start date
    const activeBatchId = localStorage.getItem('activeBatchId');
    if (activeBatchId) {
      const batches = JSON.parse(localStorage.getItem('weightloss_batches') || '[]');
      const activeBatch = batches.find(b => b.id === activeBatchId);
      if (activeBatch && activeBatch.startDate) {
        setBatchStartDate(new Date(activeBatch.startDate));
      } else {
        // Fallback to today
        setBatchStartDate(new Date());
      }
    } else {
      // No active batch, use today
      setBatchStartDate(new Date());
    }
  }, []);

  const getCurrentDay = () => {
    if (!batchStartDate) return 1;
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset to start of day
    const start = new Date(batchStartDate);
    start.setHours(0, 0, 0, 0); // Reset to start of day
    
    const diffTime = today - start; // Can be negative if start is in future
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    // If today is before start date, return 0 (no current day yet)
    if (diffDays < 0) return 0;
    
    // Day 1 = start date, so current day = diffDays + 1
    return Math.min(diffDays + 1, 60);
  };

  const currentDay = getCurrentDay();

  const getDateForDay = (day) => {
    if (!batchStartDate) return null;
    const date = new Date(batchStartDate);
    date.setDate(date.getDate() + (day - 1));
    return date;
  };

  const formatDate = (date) => {
    if (!date) return '';
    const dd = String(date.getDate()).padStart(2, '0');
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const yyyy = date.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  };

  const getDayName = (date) => {
    if (!date) return '';
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[date.getDay()];
  };

  const isSunday = (day) => {
    const date = getDateForDay(day);
    return date && date.getDay() === 0;
  };

  const getDayOfWeek = (day) => {
    const date = getDateForDay(day);
    if (!date) return 0;
    // JavaScript: 0=Sunday, 1=Monday, 2=Tuesday, etc.
    // We want: 1=Monday, 2=Tuesday, ..., 7=Sunday
    const jsDay = date.getDay();
    return jsDay === 0 ? 7 : jsDay;
  };

  const selectedFood = extendedFoods.find(f => f.day === selectedDay);
  const selectedWorkout = extendedWorkouts.find(w => w.day === selectedDay);
  const selectedDate = getDateForDay(selectedDay);
  const isSelectedDaySunday = isSunday(selectedDay);

  const getIntensityColor = (intensity) => {
    if (!intensity) return 'bg-gray-100 text-gray-800';
    const lower = intensity.toLowerCase();
    if (lower.includes('low')) return 'bg-green-100 text-green-800 border-green-200';
    if (lower.includes('mixed')) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    if (lower.includes('moderate')) return 'bg-orange-100 text-orange-800 border-orange-200';
    if (lower.includes('outdoor')) return 'bg-blue-100 text-blue-800 border-blue-200';
    return 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getPhase = (day) => {
    const cycleDay = ((day - 1) % 30) + 1;
    if (cycleDay >= 1 && cycleDay <= 6) return 'Low Impact';
    if (cycleDay >= 8 && cycleDay <= 12) return 'Mixed';
    if (cycleDay >= 13 && cycleDay <= 30) return 'Moderate';
    return 'Rest Day';
  };

  const goToPreviousWeek = () => {
    if (weekStart > 1) {
      setWeekStart(weekStart - 7);
    }
  };

  const goToNextWeek = () => {
    if (weekStart + 7 <= 60) {
      setWeekStart(weekStart + 7);
    }
  };

  const visibleDays = Array.from({ length: 7 }, (_, i) => weekStart + i).filter(d => d <= 60);

  return (
    <div className="p-8">
      <div className="mb-4">
        <h1 className="text-3xl font-bold text-gray-800">{programInfo.name}</h1>
        <p className="text-gray-600 mt-2">60-day progressive weight loss program</p>
      </div>

      <div className="mb-4 bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-indigo-600 mt-0.5" />
          <div>
            <h4 className="font-bold text-indigo-900 mb-1">Day {selectedDay} - Phase: {getPhase(selectedDay)}</h4>
            <p className="text-sm text-indigo-700">
              {isSelectedDaySunday && "Rest and recovery day - Sunday."}
              {!isSelectedDaySunday && (selectedDay - 1) % 30 + 1 >= 1 && (selectedDay - 1) % 30 + 1 <= 6 && "Building foundation with low-impact exercises."}
              {!isSelectedDaySunday && (selectedDay - 1) % 30 + 1 >= 8 && (selectedDay - 1) % 30 + 1 <= 12 && "Increasing intensity with mixed impact workouts."}
              {!isSelectedDaySunday && (selectedDay - 1) % 30 + 1 >= 14 && (selectedDay - 1) % 30 + 1 <= 30 && "Moderate intensity for maximum results."}
            </p>
          </div>
        </div>
      </div>

      {/* Week Navigation */}
      <div className="mb-6 bg-white rounded-xl border border-gray-300 p-4">
        <div className="flex items-center justify-between gap-4">
          <button
            onClick={goToPreviousWeek}
            disabled={weekStart === 1}
            className={`p-3 rounded-lg transition ${weekStart === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-blue-500 text-white hover:bg-blue-600'}`}
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <div className="flex-1 flex gap-3 justify-center">
            {visibleDays.map(day => {
              const dayIsSunday = isSunday(day);
              const isSelected = selectedDay === day;
              const isPast = day < currentDay;
              const isCurrent = day === currentDay;
              const dayDate = getDateForDay(day);
              
              return (
                <button
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  className={`flex-1 p-4 rounded-xl font-bold transition-all ${isCurrent ? 'bg-white border-4 border-green-500 text-green-700 shadow-lg' : isSelected ? 'bg-blue-500 text-white shadow-md' : isPast ? 'bg-gray-100 text-gray-400' : dayIsSunday ? 'bg-red-50 text-red-500 hover:bg-red-100' : 'bg-gray-50 text-gray-700 hover:bg-gray-200'}`}
                >
                  <div className={`text-3xl mb-1 ${isPast ? 'line-through' : ''}`}>{day}</div>
                  <div className="text-xs">{dayDate ? getDayName(dayDate) : ''}</div>
                  <div className="text-xs mt-1">{dayDate ? formatDate(dayDate) : ''}</div>
                </button>
              );
            })}
          </div>

          <button
            onClick={goToNextWeek}
            disabled={weekStart + 7 > 60}
            className={`p-3 rounded-lg transition ${weekStart + 7 > 60 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-blue-500 text-white hover:bg-blue-600'}`}
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* 2 Column Layout with Flexbox */}
      <div className="flex gap-0 border border-gray-300">
        {/* Column 1: Workouts */}
        <div className="flex-1 border-r border-gray-300">
          <div className="bg-white p-4 border-b border-gray-300">
            <h3 className="font-bold text-gray-800 text-center text-lg">Workouts</h3>
          </div>
          <div className="bg-white p-6">
            {isSelectedDaySunday ? (
              <div className="text-center py-12">
                <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h4 className="text-xl font-bold text-gray-800 mb-2">Rest Day - Sunday</h4>
                <p className="text-gray-600">Recovery day</p>
              </div>
            ) : (
              <div className="max-h-[600px] overflow-y-auto">
                <div className="mb-6 text-center">
                  <div className="flex items-center justify-center gap-2 mb-3">
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${getIntensityColor(selectedWorkout?.intensity)}`}>
                      {selectedWorkout?.intensity}
                    </span>
                    <span className="px-3 py-1 rounded-full text-sm font-semibold bg-gray-100 text-gray-800">
                      {selectedWorkout?.type}
                    </span>
                  </div>
                  <div className="flex items-center justify-center gap-2 text-gray-700 text-base">
                    <Clock className="w-5 h-5" />
                    <span className="font-semibold">{programInfo.structure.total} minutes total</span>
                  </div>
                </div>

                {/* Warmup */}
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="w-8 h-8 bg-yellow-100 text-yellow-700 rounded-full flex items-center justify-center text-sm font-bold">W</span>
                    <h5 className="font-semibold text-gray-800 text-base">Warmup ({programInfo.structure.warmup} min)</h5>
                  </div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 ml-10">
                    {selectedWorkout?.warmup?.map((exercise, idx) => (
                      <div key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        <span>{exercise}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Circuit Block 1 */}
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="w-8 h-8 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-sm font-bold">1</span>
                    <h5 className="font-semibold text-gray-800 text-base">Circuit Block 1 ({programInfo.structure.circuit_block_1} min)</h5>
                  </div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 ml-10">
                    {selectedWorkout?.circuit_block_1?.map((exercise, idx) => (
                      <div key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        <span>{exercise}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Circuit Block 2 */}
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="w-8 h-8 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center text-sm font-bold">2</span>
                    <h5 className="font-semibold text-gray-800 text-base">Circuit Block 2 ({programInfo.structure.circuit_block_2} min)</h5>
                  </div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 ml-10">
                    {selectedWorkout?.circuit_block_2?.map((exercise, idx) => (
                      <div key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        <span>{exercise}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Stretch */}
                {selectedWorkout?.stretch && selectedWorkout.stretch.length > 0 && (
                  <div className="bg-green-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="w-7 h-7 bg-green-100 text-green-700 rounded-full flex items-center justify-center text-sm font-bold">S</span>
                      <h5 className="font-semibold text-green-800 text-base">Stretch ({programInfo.structure.stretch} min)</h5>
                    </div>
                    <div className="grid grid-cols-2 gap-x-3 gap-y-2 ml-9">
                      {selectedWorkout?.stretch?.map((exercise, idx) => (
                        <div key={idx} className="text-sm text-green-700 flex items-start gap-2">
                          <span className="mt-1">•</span>
                          <span>{exercise}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Column 2: Food */}
        <div className="w-1/3">
          <div className="bg-white p-4 border-b border-gray-300">
            <h3 className="font-bold text-gray-800 text-center text-lg">Food</h3>
          </div>
          <div className="bg-white p-6">
            {isSelectedDaySunday ? (
              <div className="text-center py-12">
                <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h4 className="text-xl font-bold text-gray-800 mb-2">Rest Day</h4>
                <p className="text-gray-600">Normal eating</p>
              </div>
            ) : (
              <div className="max-h-[600px] overflow-y-auto">
                <div className="mb-6 text-center">
                  <Apple className="w-16 h-16 text-green-600 mx-auto mb-3" />
                  <h4 className="text-2xl font-bold text-gray-800 mb-3">{selectedFood?.food_name}</h4>
                  <div className="bg-orange-50 px-6 py-3 rounded-lg inline-flex flex-col">
                    <Flame className="w-8 h-8 text-orange-600 mx-auto mb-1" />
                    <p className="text-3xl font-bold text-orange-900">{selectedFood?.calories}</p>
                    <p className="text-xs text-orange-600">calories</p>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h5 className="font-semibold text-gray-700 mb-3 text-sm">Nutritional Benefits</h5>
                  <ul className="space-y-2 text-xs text-gray-600">
                    {selectedFood?.food_name.includes('Oats') && (
                      <>
                        <li className="flex items-start gap-2"><ChevronRight className="w-3 h-3 text-green-600 mt-0.5" /><span>High in fiber for sustained energy</span></li>
                        <li className="flex items-start gap-2"><ChevronRight className="w-3 h-3 text-green-600 mt-0.5" /><span>Quick energy from banana</span></li>
                        <li className="flex items-start gap-2"><ChevronRight className="w-3 h-3 text-green-600 mt-0.5" /><span>Complex carbs</span></li>
                      </>
                    )}
                    {selectedFood?.food_name.includes('Paneer') && (
                      <>
                        <li className="flex items-start gap-2"><ChevronRight className="w-3 h-3 text-green-600 mt-0.5" /><span>High protein for recovery</span></li>
                        <li className="flex items-start gap-2"><ChevronRight className="w-3 h-3 text-green-600 mt-0.5" /><span>Rich in calcium</span></li>
                        <li className="flex items-start gap-2"><ChevronRight className="w-3 h-3 text-green-600 mt-0.5" /><span>Healthy fats</span></li>
                      </>
                    )}
                    {selectedFood?.food_name.includes('Sprouts') && (
                      <>
                        <li className="flex items-start gap-2"><ChevronRight className="w-3 h-3 text-green-600 mt-0.5" /><span>Packed with vitamins</span></li>
                        <li className="flex items-start gap-2"><ChevronRight className="w-3 h-3 text-green-600 mt-0.5" /><span>Low calorie, high fiber</span></li>
                        <li className="flex items-start gap-2"><ChevronRight className="w-3 h-3 text-green-600 mt-0.5" /><span>Aids digestion</span></li>
                      </>
                    )}
                    {selectedFood?.food_name.includes('Sandwich') && (
                      <>
                        <li className="flex items-start gap-2"><ChevronRight className="w-3 h-3 text-green-600 mt-0.5" /><span>Balanced protein and carbs</span></li>
                        <li className="flex items-start gap-2"><ChevronRight className="w-3 h-3 text-green-600 mt-0.5" /><span>Sustained energy release</span></li>
                        <li className="flex items-start gap-2"><ChevronRight className="w-3 h-3 text-green-600 mt-0.5" /><span>Perfect for moderate days</span></li>
                      </>
                    )}
                    {selectedFood?.food_name.includes('Chicken') && (
                      <>
                        <li className="flex items-start gap-2"><ChevronRight className="w-3 h-3 text-green-600 mt-0.5" /><span>Lean protein source</span></li>
                        <li className="flex items-start gap-2"><ChevronRight className="w-3 h-3 text-green-600 mt-0.5" /><span>Low fat, nutrient-dense</span></li>
                        <li className="flex items-start gap-2"><ChevronRight className="w-3 h-3 text-green-600 mt-0.5" /><span>Rich in B vitamins</span></li>
                      </>
                    )}
                    {selectedFood?.food_name.includes('Egg') && (
                      <>
                        <li className="flex items-start gap-2"><ChevronRight className="w-3 h-3 text-green-600 mt-0.5" /><span>Complete protein source</span></li>
                        <li className="flex items-start gap-2"><ChevronRight className="w-3 h-3 text-green-600 mt-0.5" /><span>Rich in vitamins</span></li>
                        <li className="flex items-start gap-2"><ChevronRight className="w-3 h-3 text-green-600 mt-0.5" /><span>Muscle recovery</span></li>
                      </>
                    )}
                  </ul>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2">
                  <div className="bg-blue-50 rounded-lg p-2 text-center">
                    <p className="text-xs text-blue-600 font-medium">Best Time</p>
                    <p className="text-sm font-bold text-blue-900">Breakfast</p>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-2 text-center">
                    <p className="text-xs text-purple-600 font-medium">Type</p>
                    <p className="text-sm font-bold text-purple-900">Pre-Workout</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FoodsWorkouts;
