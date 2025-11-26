import React, { useState, useEffect } from 'react';
import {
  Dumbbell,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Copy,
  Calendar,
  Users,
  BarChart3,
  BookOpen,
  Layers,
  Target,
  Clock,
  Flame,
  CheckCircle,
  AlertCircle,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

const AdvancedExercises = ({ currentUser }) => {
  const [activeTab, setActiveTab] = useState('library'); // library, groups, planner, assignments
  const [exercises, setExercises] = useState([]);
  const [exerciseGroups, setExerciseGroups] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [editingExercise, setEditingExercise] = useState(null);
  const [editingGroup, setEditingGroup] = useState(null);
  const [selectedExercises, setSelectedExercises] = useState([]);
  const [weeklyAssignments, setWeeklyAssignments] = useState([]);
  const [batches, setBatches] = useState([]);
  const [groupFormData, setGroupFormData] = useState({
    name: '',
    difficulty: 'beginner',
    weekNumber: '',
    description: ''
  });
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });
  const [totalWeeks, setTotalWeeks] = useState(13);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [weekToRemove, setWeekToRemove] = useState(null);
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [expandedBatches, setExpandedBatches] = useState({});
  const [batchAssignmentChanges, setBatchAssignmentChanges] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    category: 'Warmup',
    difficulty: 'beginner',
    equipment: 'none',
    duration: '30s',
    reps: '',
    instructions: '',
    targetMuscles: '',
    caloriesBurn: 3,
    tags: ''
  });

  // Check if user is admin or trainer
  const isAdmin = currentUser?.role === 'admin' || currentUser?.role === 'trainer';
  const isTrainer = currentUser?.role === 'trainer';
  const canManage = isAdmin || isTrainer;

  // Show notification helper
  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: '', type: 'success' });
    }, 4000);
  };

  // Load data from localStorage
  useEffect(() => {
    const loadedExercises = JSON.parse(localStorage.getItem('weightloss_exercises') || '[]');
    const loadedGroups = JSON.parse(localStorage.getItem('weightloss_exercise_groups') || '[]');
    const loadedAssignments = JSON.parse(localStorage.getItem('weightloss_weekly_assignments') || '[]');
    const loadedBatches = JSON.parse(localStorage.getItem('weightloss_batches') || '[]');
    
    setExercises(loadedExercises);
    setExerciseGroups(loadedGroups);
    setWeeklyAssignments(loadedAssignments);
    setBatches(loadedBatches);
  }, []);

  // Filter exercises
  const filteredExercises = exercises.filter(ex => {
    const matchesSearch = ex.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDifficulty = filterDifficulty === 'all' || ex.difficulty === filterDifficulty;
    const matchesCategory = filterCategory === 'all' || ex.category === filterCategory;
    return matchesSearch && matchesDifficulty && matchesCategory;
  });

  // Get unique categories
  const categories = ['all', ...new Set(exercises.map(ex => ex.category))];
  const difficulties = ['all', 'beginner', 'intermediate', 'advanced'];
  const allCategories = ['Warmup', 'Cardio', 'Upper Body', 'Lower Body', 'Core', 'Full Body', 'Stretch', 'Outdoor'];

  // Save exercise
  const handleSaveExercise = () => {
    const newExercise = {
      id: editingExercise?.id || `ex_${Date.now()}`,
      ...formData,
      targetMuscles: formData.targetMuscles.split(',').map(m => m.trim()).filter(Boolean),
      tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
      caloriesBurn: parseInt(formData.caloriesBurn),
      createdAt: editingExercise?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    let updatedExercises;
    if (editingExercise) {
      updatedExercises = exercises.map(ex => ex.id === editingExercise.id ? newExercise : ex);
    } else {
      updatedExercises = [...exercises, newExercise];
    }

    localStorage.setItem('weightloss_exercises', JSON.stringify(updatedExercises));
    setExercises(updatedExercises);
    setShowAddModal(false);
    setEditingExercise(null);
    resetForm();
    showNotification(editingExercise ? 'Exercise updated successfully!' : 'Exercise created successfully!');
  };

  // Delete exercise
  const handleDeleteExercise = (id) => {
    if (confirm('Are you sure you want to delete this exercise?')) {
      const updatedExercises = exercises.filter(ex => ex.id !== id);
      localStorage.setItem('weightloss_exercises', JSON.stringify(updatedExercises));
      setExercises(updatedExercises);
    }
  };

  // Edit exercise
  const handleEditExercise = (exercise) => {
    setEditingExercise(exercise);
    setFormData({
      name: exercise.name,
      category: exercise.category,
      difficulty: exercise.difficulty,
      equipment: exercise.equipment || 'none',
      duration: exercise.duration,
      reps: exercise.reps || '',
      instructions: exercise.instructions,
      targetMuscles: exercise.targetMuscles?.join(', ') || '',
      caloriesBurn: exercise.caloriesBurn,
      tags: exercise.tags?.join(', ') || ''
    });
    setShowAddModal(true);
  };

  // Duplicate exercise
  const handleDuplicateExercise = (exercise) => {
    const duplicated = {
      ...exercise,
      id: `ex_${Date.now()}`,
      name: `${exercise.name} (Copy)`,
      createdAt: new Date().toISOString()
    };
    const updatedExercises = [...exercises, duplicated];
    localStorage.setItem('weightloss_exercises', JSON.stringify(updatedExercises));
    setExercises(updatedExercises);
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      category: 'Warmup',
      difficulty: 'beginner',
      equipment: 'none',
      duration: '30s',
      reps: '',
      instructions: '',
      targetMuscles: '',
      caloriesBurn: 3,
      tags: ''
    });
  };

  // Group Management Functions
  const handleSaveGroup = () => {
    if (!groupFormData.name || selectedExercises.length === 0) {
      alert('Please provide a group name and select at least one exercise');
      return;
    }

    const newGroup = {
      id: editingGroup?.id || `group_${Date.now()}`,
      ...groupFormData,
      exercises: selectedExercises,
      createdAt: editingGroup?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    let updatedGroups;
    if (editingGroup) {
      updatedGroups = exerciseGroups.map(g => g.id === editingGroup.id ? newGroup : g);
    } else {
      updatedGroups = [...exerciseGroups, newGroup];
    }

    localStorage.setItem('weightloss_exercise_groups', JSON.stringify(updatedGroups));
    setExerciseGroups(updatedGroups);
    setShowGroupModal(false);
    setEditingGroup(null);
    setSelectedExercises([]);
    resetGroupForm();
    showNotification(editingGroup ? 'Group updated successfully!' : 'Group created successfully!');
  };

  const handleDeleteGroup = (id) => {
    if (confirm('Are you sure you want to delete this group?')) {
      const updatedGroups = exerciseGroups.filter(g => g.id !== id);
      localStorage.setItem('weightloss_exercise_groups', JSON.stringify(updatedGroups));
      setExerciseGroups(updatedGroups);
    }
  };

  const handleEditGroup = (group) => {
    setEditingGroup(group);
    setGroupFormData({
      name: group.name,
      difficulty: group.difficulty,
      weekNumber: group.weekNumber,
      description: group.description || ''
    });
    setSelectedExercises(group.exercises || []);
    setShowGroupModal(true);
  };

  const resetGroupForm = () => {
    setGroupFormData({
      name: '',
      difficulty: 'beginner',
      weekNumber: '',
      description: ''
    });
  };

  const toggleExerciseSelection = (exerciseId) => {
    setSelectedExercises(prev => 
      prev.includes(exerciseId) 
        ? prev.filter(id => id !== exerciseId)
        : [...prev, exerciseId]
    );
  };

  // Weekly Assignment Functions
  const handleAssignGroupToWeek = (weekNum, groupId) => {
    setHasUnsavedChanges(true);
    
    // Remove existing assignment for this week
    const updatedAssignments = weeklyAssignments.filter(a => a.weekNumber !== weekNum);
    
    // Only add new assignment if groupId is not empty
    if (groupId) {
      const newAssignment = {
        id: `assign_${Date.now()}`,
        weekNumber: weekNum,
        groupId: groupId,
        createdAt: new Date().toISOString()
      };
      updatedAssignments.push(newAssignment);
    }

    localStorage.setItem('weightloss_weekly_assignments', JSON.stringify(updatedAssignments));
    setWeeklyAssignments(updatedAssignments);
  };

  const getGroupForWeek = (weekNum) => {
    return weeklyAssignments.find(a => a.weekNumber === weekNum);
  };

  // Render Exercise Library Tab
  const renderLibraryTab = () => {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Exercise Library</h2>
            <p className="text-gray-600 mt-1">Manage your complete exercise database</p>
          </div>
          {isAdmin && (
            <div className="flex gap-3">
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition font-medium"
              >
                <Plus className="w-5 h-5" />
                Add Exercise
              </button>
              <button
                onClick={() => setShowGroupModal(true)}
                disabled={selectedExercises.length === 0}
                className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Layers className="w-5 h-5" />
                Create Group {selectedExercises.length > 0 && `(${selectedExercises.length})`}
              </button>
            </div>
          )}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search exercises..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              />
            </div>
            <select
              value={filterDifficulty}
              onChange={(e) => setFilterDifficulty(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
            >
              {difficulties.map(diff => (
                <option key={diff} value={diff}>
                  {diff === 'all' ? 'All Difficulties' : diff.charAt(0).toUpperCase() + diff.slice(1)}
                </option>
              ))}
            </select>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {cat === 'all' ? 'All Categories' : cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Exercise Grid */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="mb-4">
            <p className="text-sm text-gray-600">
              Showing <span className="font-semibold text-gray-800">{filteredExercises.length}</span> exercises
              {selectedExercises.length > 0 && (
                <span className="ml-2 text-primary font-semibold">
                  ({selectedExercises.length} selected)
                </span>
              )}
            </p>
          </div>

          {filteredExercises.length === 0 ? (
            <div className="text-center py-12">
              <Dumbbell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No exercises found</p>
              <p className="text-gray-400 text-sm mt-2">Try adjusting your filters or add a new exercise</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3">
              {filteredExercises.map(exercise => (
                <label
                  key={exercise.id}
                  className={`flex items-start gap-3 p-4 rounded-lg cursor-pointer transition border-2 ${
                    selectedExercises.includes(exercise.id)
                      ? 'bg-primary/10 border-primary shadow-md'
                      : 'bg-gray-50 border-gray-200 hover:bg-gray-100 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedExercises.includes(exercise.id)}
                    onChange={() => toggleExerciseSelection(exercise.id)}
                    className="w-5 h-5 text-primary rounded focus:ring-2 focus:ring-primary mt-0.5 flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-2 mb-1">
                      <span className="font-semibold text-gray-800 text-sm leading-tight">{exercise.name}</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5 mb-2">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                        exercise.difficulty === 'beginner' ? 'bg-green-100 text-green-700' :
                        exercise.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {exercise.difficulty}
                      </span>
                      <span className="text-xs text-gray-600">{exercise.category}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-500 mb-2">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {exercise.duration}
                      </span>
                      <span className="flex items-center gap-1">
                        <Flame className="w-3 h-3" />
                        {exercise.caloriesBurn} cal
                      </span>
                    </div>
                    {isAdmin && (
                      <div className="flex gap-1 pt-2 border-t border-gray-200">
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            handleEditExercise(exercise);
                          }}
                          className="p-1.5 hover:bg-gray-200 rounded transition"
                          title="Edit"
                        >
                          <Edit className="w-3.5 h-3.5 text-blue-600" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            handleDuplicateExercise(exercise);
                          }}
                          className="p-1.5 hover:bg-gray-200 rounded transition"
                          title="Duplicate"
                        >
                          <Copy className="w-3.5 h-3.5 text-green-600" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            handleDeleteExercise(exercise.id);
                          }}
                          className="p-1.5 hover:bg-gray-200 rounded transition"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-red-600" />
                        </button>
                      </div>
                    )}
                  </div>
                </label>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  // Render Exercise Groups Tab
  const renderGroupsTab = () => {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Exercise Groups</h2>
            <p className="text-gray-600 mt-1">Manage workout groups</p>
          </div>
        </div>

        {/* Existing Groups List */}
        {exerciseGroups.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="text-center py-12">
              <Layers className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No exercise groups yet</p>
              <p className="text-gray-400 text-sm mt-2">Go to Exercise Library and select exercises to create a group</p>
            </div>
          </div>
        ) : (
          <div className="grid gap-4">
            {exerciseGroups.map(group => {
              const groupExercises = exercises.filter(ex => group.exercises?.includes(ex.id));
              return (
                <div key={group.id} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-gray-800">{group.name}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          group.difficulty === 'beginner' ? 'bg-green-100 text-green-700' :
                          group.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {group.difficulty}
                        </span>
                        {group.weekNumber && (
                          <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                            Week {group.weekNumber}
                          </span>
                        )}
                      </div>
                      {group.description && (
                        <p className="text-gray-600 text-sm mb-3">{group.description}</p>
                      )}
                      <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                        <span className="flex items-center gap-1">
                          <Dumbbell className="w-4 h-4" />
                          {groupExercises.length} exercises
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {groupExercises.reduce((sum, ex) => sum + parseInt(ex.duration), 0)} total
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {groupExercises.map(ex => (
                          <span key={ex.id} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                            {ex.name}
                          </span>
                        ))}
                      </div>
                    </div>
                    {isAdmin && (
                      <div className="flex gap-2 ml-4">
                        <button
                          onClick={() => handleEditGroup(group)}
                          className="p-2 hover:bg-gray-100 rounded-lg transition"
                          title="Edit group"
                        >
                          <Edit className="w-4 h-4 text-blue-600" />
                        </button>
                        <button
                          onClick={() => handleDeleteGroup(group.id)}
                          className="p-2 hover:bg-gray-100 rounded-lg transition"
                          title="Delete group"
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  // Render Weekly Planner Tab
  const renderPlannerTab = () => {
    const weeks = Array.from({ length: totalWeeks }, (_, i) => i + 1);

    const addOneWeek = () => {
      setTotalWeeks(prev => prev + 1);
      setHasUnsavedChanges(true);
      showNotification(`Added week ${totalWeeks + 1}`);
    };

    const openRemoveModal = (weekNum) => {
      if (totalWeeks <= 1) {
        showNotification('Cannot remove the last week. At least one week is required.', 'error');
        return;
      }
      setWeekToRemove(weekNum);
      setShowRemoveModal(true);
    };

    const confirmRemoveWeek = () => {
      if (!weekToRemove) return;

      const weekNum = weekToRemove;

      // Remove the assignment for this week
      const updatedAssignments = weeklyAssignments.filter(a => a.weekNumber !== weekNum);
      
      // Shift down all weeks after the removed week
      const shiftedAssignments = updatedAssignments.map(a => {
        if (a.weekNumber > weekNum) {
          return { ...a, weekNumber: a.weekNumber - 1 };
        }
        return a;
      });
      
      localStorage.setItem('weightloss_weekly_assignments', JSON.stringify(shiftedAssignments));
      setWeeklyAssignments(shiftedAssignments);
      setTotalWeeks(prev => prev - 1);
      setHasUnsavedChanges(true);
      setShowRemoveModal(false);
      setWeekToRemove(null);
      showNotification(`Week ${weekNum} removed successfully`);
    };

    const cancelRemoveWeek = () => {
      setShowRemoveModal(false);
      setWeekToRemove(null);
    };

    const savePlanner = () => {
      // Data is already saved via handleAssignGroupToWeek, just confirm
      setHasUnsavedChanges(false);
      showNotification('Weekly planner saved successfully!');
    };

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Weekly Planner</h2>
            <p className="text-gray-600 mt-1">{totalWeeks} weeks planned</p>
          </div>
          {isAdmin && (
            <div className="flex gap-2">
              <button
                onClick={addOneWeek}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium"
              >
                <Plus className="w-4 h-4" />
                Add Week
              </button>
              <button
                onClick={savePlanner}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm font-medium"
              >
                <CheckCircle className="w-4 h-4" />
                Save
              </button>
            </div>
          )}
        </div>

        {exerciseGroups.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No exercise groups available</p>
              <p className="text-gray-400 text-sm mt-2">Create exercise groups first to start planning</p>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider w-24">
                      Week
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Assigned Group
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider w-32">
                      Difficulty
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider w-32">
                      Exercises
                    </th>
                    {isAdmin && (
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider w-20">
                        Action
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {weeks.map(weekNum => {
                    const assignedGroup = getGroupForWeek(weekNum);
                    const groupData = assignedGroup ? exerciseGroups.find(g => g.id === assignedGroup.groupId) : null;
                    const groupExercises = groupData ? exercises.filter(ex => groupData.exercises?.includes(ex.id)) : [];

                    return (
                      <tr key={weekNum} className="hover:bg-gray-50 transition">
                        <td className="px-4 py-3">
                          <div className="flex items-center">
                            <div className="bg-primary/10 px-3 py-1 rounded text-primary font-semibold text-sm">
                              {weekNum}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          {isAdmin ? (
                            <select
                              value={assignedGroup?.groupId || ''}
                              onChange={(e) => handleAssignGroupToWeek(weekNum, e.target.value)}
                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-white"
                            >
                              <option value="">Select group...</option>
                              {exerciseGroups.map(group => (
                                <option key={group.id} value={group.id}>
                                  {group.name}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <span className="text-sm text-gray-700">
                              {groupData ? groupData.name : 'Not assigned'}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {groupData && (
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              groupData.difficulty === 'beginner' ? 'bg-green-100 text-green-700' :
                              groupData.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-red-100 text-red-700'
                            }`}>
                              {groupData.difficulty}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {groupData ? (
                            <span className="text-sm text-gray-600">
                              {groupExercises.length} exercises
                            </span>
                          ) : (
                            <span className="text-sm text-gray-400">-</span>
                          )}
                        </td>
                        {isAdmin && (
                          <td className="px-4 py-3 text-center">
                            <button
                              onClick={() => openRemoveModal(weekNum)}
                              disabled={totalWeeks <= 1}
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-30 disabled:cursor-not-allowed"
                              title="Remove this week"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Remove Week Confirmation Modal */}
        {showRemoveModal && weekToRemove && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-red-100 rounded-full">
                  <AlertCircle className="w-6 h-6 text-red-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-800">Remove Week {weekToRemove}?</h3>
              </div>
              
              <div className="mb-6">
                <p className="text-gray-600 mb-3">
                  Are you sure you want to remove Week {weekToRemove}?
                </p>
                {(() => {
                  const assignment = getGroupForWeek(weekToRemove);
                  const group = assignment ? exerciseGroups.find(g => g.id === assignment.groupId) : null;
                  return group ? (
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                      <p className="text-sm text-amber-800 font-medium mb-1">
                        ⚠️ This week has an assignment:
                      </p>
                      <p className="text-sm text-amber-700">
                        <strong>{group.name}</strong> ({group.difficulty})
                      </p>
                    </div>
                  ) : null;
                })()}
                <p className="text-sm text-gray-500 mt-3">
                  All weeks after Week {weekToRemove} will be shifted down by one.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={cancelRemoveWeek}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
                >
                  Close
                </button>
                <button
                  onClick={confirmRemoveWeek}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Render Batch Assignments Tab
  const renderAssignmentsTab = () => {
    const activeBatches = batches.filter(b => b.status === 'active');

    const toggleBatchExpand = (batchId) => {
      setExpandedBatches(prev => ({
        ...prev,
        [batchId]: !prev[batchId]
      }));
    };

    const assignGroupToBatch = (batchId, weekNum, groupId) => {
      // Create a batch-specific assignment
      const batchAssignment = {
        batchId,
        weekNum,
        groupId,
        assignedAt: new Date().toISOString()
      };
      
      // Get existing batch assignments
      const existingAssignments = JSON.parse(localStorage.getItem('weightloss_batch_assignments') || '[]');
      
      // Remove any existing assignment for this batch/week combo
      const filteredAssignments = existingAssignments.filter(
        a => !(a.batchId === batchId && a.weekNum === weekNum)
      );
      
      // Add new assignment if groupId is not empty
      const updatedAssignments = groupId 
        ? [...filteredAssignments, batchAssignment]
        : filteredAssignments;
      
      localStorage.setItem('weightloss_batch_assignments', JSON.stringify(updatedAssignments));
      setBatchAssignmentChanges(true);
      showNotification(`Week ${weekNum} assignment updated`);
    };

    const getBatchAssignment = (batchId, weekNum) => {
      const assignments = JSON.parse(localStorage.getItem('weightloss_batch_assignments') || '[]');
      return assignments.find(a => a.batchId === batchId && a.weekNum === weekNum);
    };

    const saveBatchAssignments = () => {
      setBatchAssignmentChanges(false);
      showNotification('Batch assignments saved successfully!');
    };

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Batch Assignments</h2>
            <p className="text-gray-600 mt-1">Assign exercise groups to specific batches and weeks</p>
          </div>
          {isAdmin && batchAssignmentChanges && (
            <button
              onClick={saveBatchAssignments}
              className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
            >
              <CheckCircle className="w-5 h-5" />
              Save All Changes
            </button>
          )}
        </div>

        {activeBatches.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No active batches</p>
              <p className="text-gray-400 text-sm mt-2">Create batches in the Batches tab</p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {activeBatches.map(batch => {
              const startDate = new Date(batch.startDate);
              const today = new Date();
              const daysDiff = Math.floor((today - startDate) / (1000 * 60 * 60 * 24));
              const currentWeek = Math.max(1, Math.floor(daysDiff / 7) + 1);
              const weeksToShow = Math.min(12, totalWeeks);
              const isExpanded = expandedBatches[batch.id] !== false; // Default to expanded

              // Count assigned weeks
              const assignedWeeksCount = Array.from({ length: weeksToShow }, (_, i) => i + 1)
                .filter(weekNum => getBatchAssignment(batch.id, weekNum))
                .length;

              return (
                <div key={batch.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  {/* Batch Header - Clickable */}
                  <div 
                    className="bg-gradient-to-r from-primary/10 to-primary/5 px-6 py-4 border-b border-gray-200 cursor-pointer hover:from-primary/15 hover:to-primary/10 transition"
                    onClick={() => toggleBatchExpand(batch.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div>
                          <h3 className="text-xl font-bold text-gray-800">{batch.name}</h3>
                          <p className="text-sm text-gray-600 mt-1">
                            {batch.customers?.length || 0} customers • Started {new Date(batch.startDate).toLocaleDateString()} • {assignedWeeksCount}/{weeksToShow} weeks assigned
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="bg-primary text-white px-4 py-2 rounded-lg font-bold">
                          Week {currentWeek}
                        </div>
                        {isExpanded ? (
                          <ChevronUp className="w-5 h-5 text-gray-600" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-600" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Assignment Table - Collapsible */}
                  {isExpanded && (
                    <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 uppercase w-24">
                            Week
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 uppercase">
                            Assigned Group
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 uppercase w-32">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {Array.from({ length: weeksToShow }, (_, i) => i + 1).map(weekNum => {
                          const batchAssignment = getBatchAssignment(batch.id, weekNum);
                          const groupData = batchAssignment 
                            ? exerciseGroups.find(g => g.id === batchAssignment.groupId)
                            : null;
                          const isCurrent = weekNum === currentWeek;
                          const isPast = weekNum < currentWeek;

                          return (
                            <tr key={weekNum} className={`${isCurrent ? 'bg-blue-50' : ''} hover:bg-gray-50 transition`}>
                              <td className="px-4 py-2">
                                <div className={`px-3 py-1 rounded text-sm font-semibold inline-block ${
                                  isCurrent ? 'bg-primary text-white' :
                                  isPast ? 'bg-gray-300 text-gray-600' :
                                  'bg-gray-100 text-gray-700'
                                }`}>
                                  {weekNum}
                                </div>
                              </td>
                              <td className="px-4 py-2">
                                {isAdmin ? (
                                  <select
                                    value={batchAssignment?.groupId || ''}
                                    onChange={(e) => assignGroupToBatch(batch.id, weekNum, e.target.value)}
                                    className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-white"
                                  >
                                    <option value="">Select group...</option>
                                    {exerciseGroups.map(group => (
                                      <option key={group.id} value={group.id}>
                                        {group.name} ({group.difficulty})
                                      </option>
                                    ))}
                                  </select>
                                ) : (
                                  <span className="text-sm text-gray-700">
                                    {groupData ? groupData.name : 'Not assigned'}
                                  </span>
                                )}
                              </td>
                              <td className="px-4 py-2">
                                {groupData ? (
                                  <div className="flex items-center gap-2">
                                    <CheckCircle className="w-4 h-4 text-green-600" />
                                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                                      groupData.difficulty === 'beginner' ? 'bg-green-100 text-green-700' :
                                      groupData.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-700' :
                                      'bg-red-100 text-red-700'
                                    }`}>
                                      {groupData.difficulty}
                                    </span>
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-2 text-gray-400">
                                    <AlertCircle className="w-4 h-4" />
                                    <span className="text-xs">Not assigned</span>
                                  </div>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-200">
        {['library', 'groups', 'planner', 'assignments'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-3 font-medium transition border-b-2 ${
              activeTab === tab
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-600 hover:text-gray-800'
            }`}
          >
            {tab === 'library' && <><BookOpen className="w-5 h-5 inline mr-2" />Exercise Library</>}
            {tab === 'groups' && <><Layers className="w-5 h-5 inline mr-2" />Exercise Groups</>}
            {tab === 'planner' && <><Calendar className="w-5 h-5 inline mr-2" />Weekly Planner</>}
            {tab === 'assignments' && <><Users className="w-5 h-5 inline mr-2" />Batch Assignments</>}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'library' && renderLibraryTab()}
      {activeTab === 'groups' && renderGroupsTab()}
      {activeTab === 'planner' && renderPlannerTab()}
      {activeTab === 'assignments' && renderAssignmentsTab()}

      {/* Add/Edit Exercise Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-800">
                {editingExercise ? 'Edit Exercise' : 'Add New Exercise'}
              </h2>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Exercise Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                    placeholder="e.g., Push-ups"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                  >
                    {categories.filter(c => c !== 'all').map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty *</label>
                  <select
                    value={formData.difficulty}
                    onChange={(e) => setFormData({...formData, difficulty: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                  >
                    {difficulties.filter(d => d !== 'all').map(diff => (
                      <option key={diff} value={diff}>{diff.charAt(0).toUpperCase() + diff.slice(1)}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Equipment</label>
                  <input
                    type="text"
                    value={formData.equipment}
                    onChange={(e) => setFormData({...formData, equipment: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                    placeholder="e.g., dumbbells, none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Duration *</label>
                  <input
                    type="text"
                    value={formData.duration}
                    onChange={(e) => setFormData({...formData, duration: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                    placeholder="e.g., 30s, 1min"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Reps (optional)</label>
                  <input
                    type="text"
                    value={formData.reps}
                    onChange={(e) => setFormData({...formData, reps: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                    placeholder="e.g., 10, 15"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Calories Burn *</label>
                  <input
                    type="number"
                    value={formData.caloriesBurn}
                    onChange={(e) => setFormData({...formData, caloriesBurn: parseInt(e.target.value)})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                    placeholder="e.g., 5"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Instructions *
                  </label>
                  <textarea
                    value={formData.instructions}
                    onChange={(e) => setFormData({...formData, instructions: e.target.value})}
                    rows="3"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                    placeholder="Describe how to perform this exercise"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Target Muscles (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={formData.targetMuscles}
                    onChange={(e) => setFormData({...formData, targetMuscles: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                    placeholder="e.g., Chest, Triceps, Shoulders"
                  />
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingExercise(null);
                  resetForm();
                }}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveExercise}
                disabled={!formData.name || !formData.instructions}
                className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {editingExercise ? 'Update Exercise' : 'Add Exercise'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit Group Modal */}
      {showGroupModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-800">
                {editingGroup ? 'Edit Exercise Group' : 'Create Exercise Group'}
              </h2>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Group Details */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Group Name *
                  </label>
                  <input
                    type="text"
                    value={groupFormData.name}
                    onChange={(e) => setGroupFormData({...groupFormData, name: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                    placeholder="e.g., Beginner Week 1"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Difficulty *
                  </label>
                  <select
                    value={groupFormData.difficulty}
                    onChange={(e) => setGroupFormData({...groupFormData, difficulty: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Suggested Week Number (optional)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="13"
                    value={groupFormData.weekNumber}
                    onChange={(e) => setGroupFormData({...groupFormData, weekNumber: e.target.value ? parseInt(e.target.value) : ''})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                    placeholder="Leave empty if not sure"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description (optional)
                  </label>
                  <input
                    type="text"
                    value={groupFormData.description}
                    onChange={(e) => setGroupFormData({...groupFormData, description: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                    placeholder="Brief description"
                  />
                </div>
              </div>

              {/* Selected Exercises Summary */}
              <div className="bg-gray-50 rounded-lg p-4">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Selected Exercises ({selectedExercises.length})
                </label>
                {selectedExercises.length === 0 ? (
                  <p className="text-gray-400 text-sm">No exercises selected</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {exercises.filter(ex => selectedExercises.includes(ex.id)).map(exercise => (
                      <span key={exercise.id} className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm flex items-center gap-2">
                        {exercise.name}
                        <button
                          onClick={() => toggleExerciseSelection(exercise.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowGroupModal(false);
                  setEditingGroup(null);
                  setSelectedExercises([]);
                  resetGroupForm();
                }}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveGroup}
                disabled={!groupFormData.name || selectedExercises.length === 0}
                className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {editingGroup ? 'Update Group' : 'Create Group'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notification Toast */}
      {notification.show && (
        <div className="fixed top-4 right-4 z-50 animate-slide-in">
          <div className={`px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 ${
            notification.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
          }`}>
            {notification.type === 'success' ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            <span className="font-medium">{notification.message}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedExercises;
