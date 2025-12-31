import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  TrendingUp,
  LogOut,
  UserPlus,
  Filter,
  Calendar,
  Shield,
  Layers,
  Settings as SettingsIcon,
  Apple,
  Dumbbell,
  Calculator,
  CreditCard,
  Target,
  Zap,
  Image as ImageIcon,
} from 'lucide-react';
import Overview from './dashboard/Overview';
import TodaysPriorities from './dashboard/TodaysPriorities';
import PipelineView from './dashboard/PipelineView';
import UsersList from './dashboard/UsersList';
import UserEditPage from './dashboard/UserEditPage';
import Reports from './dashboard/Reports';
import AdvancedAnalytics from './dashboard/AdvancedAnalytics';
import Billing from './dashboard/Billing';
import FoodExerciseAnalytics from './dashboard/FoodExerciseAnalytics';
import PhotoProgress from './dashboard/PhotoProgress';
import CheckinScheduler from './dashboard/CheckinScheduler';
import Attendance from './dashboard/AttendanceNew';
import TrainerManagement from './dashboard/TrainerManagement';
import BatchManagement from './dashboard/BatchManagement';
import Settings from './dashboard/Settings';
import FoodsWorkouts from './dashboard/FoodsWorkouts';
import AdvancedExercises from './dashboard/AdvancedExercises';
import AddUserModal from './dashboard/AddUserModal';
import Toast from './Toast';
import ConfirmModal from './ConfirmModal';
import { useToast } from '../hooks/useToast';
import { addCustomer, addSubscription } from '../services/cafeService';
import { useConfirm } from '../hooks/useConfirm';
import * as dataService from '../services/dataService';
import { initializeExerciseLibrary } from '../utils/initializeExercises';
import { useTenant } from '../contexts/TenantContext';

const TrainerDashboard = ({ onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [users, setUsers] = useState([]);
  const [trainers, setTrainers] = useState([]);
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddUser, setShowAddUser] = useState(false);
  const { confirmState, confirm, closeConfirm } = useConfirm();
  const [editingUser, setEditingUser] = useState(null);
  const { toasts, showToast, removeToast } = useToast();
  const { currentUser, currentTenant, userRole, isAdmin, isSuperAdmin } = useTenant();
  
  // Fallback to localStorage for backward compatibility
  const localUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
  const localRole = localStorage.getItem('userRole') || 'admin';
  const effectiveUser = currentUser || localUser;
  // Map super_admin to admin for dashboard access
  const effectiveRole = (userRole === 'super_admin' || localRole === 'super_admin') ? 'admin' : (userRole || localRole);
  const effectiveIsAdmin = isAdmin || effectiveRole === 'admin' || isSuperAdmin;

  // Filter tabs based on role
  const allTabs = [
    { name: 'Priorities', path: '/weightloss/dashboard', icon: Zap, roles: ['admin', 'trainer'] },
    { name: 'Pipeline', path: '/weightloss/dashboard/pipeline', icon: Target, roles: ['admin', 'trainer'] },
    { name: 'Overview', path: '/weightloss/dashboard/overview', icon: LayoutDashboard, roles: ['admin', 'trainer'] },
    { name: 'Users', path: '/weightloss/dashboard/users', icon: Users, roles: ['admin', 'trainer'] },
    { name: 'Check-ins', path: '/weightloss/dashboard/checkins', icon: Calendar, roles: ['admin', 'trainer'] },
    { name: 'Analytics', path: '/weightloss/dashboard/analytics', icon: TrendingUp, roles: ['admin', 'trainer'] },
    { name: 'Food & Exercise Analytics', path: '/weightloss/dashboard/food-exercise-analytics', icon: Apple, roles: ['admin', 'trainer'] },
    { name: 'Billing', path: '/weightloss/dashboard/billing', icon: CreditCard, roles: ['admin'] },
    { name: 'Trainers', path: '/weightloss/dashboard/trainers', icon: Shield, roles: ['admin'] },
    { name: 'Batches', path: '/weightloss/dashboard/batches', icon: Layers, roles: ['admin'] },
    { name: 'Foods & Workouts', path: '/weightloss/dashboard/foods-workouts', icon: Apple, roles: ['admin', 'trainer'] },
    { name: 'Advanced Exercises', path: '/weightloss/dashboard/advanced-exercises', icon: Dumbbell, roles: ['admin', 'trainer'] },
    { name: 'Attendance', path: '/weightloss/dashboard/attendance', icon: Calendar, roles: ['admin', 'trainer'] },
    { name: 'Reports', path: '/weightloss/dashboard/reports', icon: TrendingUp, roles: ['admin', 'trainer'] },
    { name: 'Settings', path: '/weightloss/dashboard/settings', icon: SettingsIcon, roles: ['admin'] },
  ];
  
  const tabs = allTabs.filter(tab => tab.roles.includes(effectiveRole));
  
  // Debug logging
  console.log('TrainerDashboard Debug:', {
    userRole,
    localRole,
    effectiveRole,
    effectiveIsAdmin,
    tabsCount: tabs.length,
    currentUser,
    localUser
  });

  useEffect(() => {
    // Initialize exercise library on first load
    initializeExerciseLibrary();
    
    fetchUsers();
    fetchTrainers();
    fetchBatches();
  }, []);

  const fetchUsers = () => {
    try {
      let usersList = dataService.getUsers();
      
      // Filter by active batch first
      const activeBatchId = localStorage.getItem('activeBatchId');
      if (activeBatchId) {
        usersList = usersList.filter(user => user.batchId === activeBatchId);
      }
      
      // Filter users for trainers - only show their assigned users
      if (userRole === 'trainer' && currentUser.name) {
        usersList = usersList.filter(user => user.trainer === currentUser.name);
      }
      
      setUsers(usersList);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTrainers = () => {
    try {
      const trainersList = JSON.parse(localStorage.getItem('weightloss_trainers') || '[]');
      setTrainers(trainersList);
    } catch (error) {
      console.error('Error fetching trainers:', error);
    }
  };

  const fetchBatches = () => {
    try {
      const batchesList = JSON.parse(localStorage.getItem('weightloss_batches') || '[]');
      setBatches(batchesList);
    } catch (error) {
      console.error('Error fetching batches:', error);
    }
  };

  const handleLogout = () => {
    onLogout();
    navigate('/weightloss/login');
  };

  const handleAddUser = async (userIdOrData, userData = null) => {
    try {
      // Check if this is an edit (two parameters) or add (one parameter)
      if (userData) {
        // Edit mode: first param is userId, second is userData
        const userId = userIdOrData;
        
        // If enrolling in cafe subscription, create cafe customer and subscription
        if (userData.enrollInCafeSubscription && !userData.cafeCustomerId) {
          try {
            const existingUser = users.find(u => u.id === userId);
            const cafeCustomer = await addCustomer({
              name: userData.name || existingUser.name,
              phone: existingUser.phone || '',
              email: existingUser.email || null,
              notes: `Linked to weight loss program user: ${existingUser.name}`,
              customerType: 'weightloss_subscriber'
            });
            userData.cafeCustomerId = cafeCustomer.id;
            
            // Create default cafe subscription
            const startDate = new Date();
            const endDate = new Date();
            if (userData.programType === 'unlimited') {
              endDate.setFullYear(endDate.getFullYear() + 10); // 10 years for unlimited
            } else {
              endDate.setDate(endDate.getDate() + (userData.programType === '90-day' ? 90 : 60));
            }
            
            const subscription = await addSubscription({
              customerId: cafeCustomer.id,
              planType: 'custom',
              mealTypes: ['lunch', 'dinner'],
              deliveryDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
              startDate: startDate.toISOString().split('T')[0],
              endDate: endDate.toISOString().split('T')[0],
              monthlyAmount: 0,
              totalMealsAllowed: userData.programType === 'unlimited' ? 9999 : (userData.programType === '90-day' ? 180 : 120),
              maxValidityDays: userData.programType === 'unlimited' ? 3650 : (userData.programType === '90-day' ? 90 : 60),
              breakfastTime: '08:00',
              lunchTime: '13:00',
              dinnerTime: '20:00',
              status: 'active',
              specialInstructions: `Weight loss program: ${userData.programType}, Meal plan: ${userData.mealPlan}`
            });
            userData.cafeSubscriptionId = subscription.id;
            showToast('Cafe subscription created successfully!', 'success');
          } catch (cafeError) {
            console.error('Error creating cafe subscription:', cafeError);
            showToast('User updated but cafe subscription creation failed', 'warning');
          }
        }
        
        const updatedUser = dataService.updateUser(userId, userData);
        setUsers(users.map(u => u.id === userId ? updatedUser : u));
        setEditingUser(null);
        setShowAddUser(false);
        showToast('User updated successfully!', 'success');
      } else {
        // Add mode: first param is userData
        const newUserData = userIdOrData;
        
        // If enrolling in cafe subscription, create cafe customer and subscription
        if (newUserData.enrollInCafeSubscription) {
          try {
            const cafeCustomer = await addCustomer({
              name: newUserData.name,
              phone: newUserData.phone || '',
              email: newUserData.email || null,
              notes: `Linked to weight loss program user: ${newUserData.name}`,
              customerType: 'weightloss_subscriber'
            });
            newUserData.cafeCustomerId = cafeCustomer.id;
            
            // Create default cafe subscription
            const startDate = new Date();
            const endDate = new Date();
            if (newUserData.programType === 'unlimited') {
              endDate.setFullYear(endDate.getFullYear() + 10); // 10 years for unlimited
            } else {
              endDate.setDate(endDate.getDate() + (newUserData.programType === '90-day' ? 90 : 60));
            }
            
            const subscription = await addSubscription({
              customerId: cafeCustomer.id,
              planType: 'custom',
              mealTypes: ['lunch', 'dinner'],
              deliveryDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
              startDate: startDate.toISOString().split('T')[0],
              endDate: endDate.toISOString().split('T')[0],
              monthlyAmount: 0,
              totalMealsAllowed: newUserData.programType === 'unlimited' ? 9999 : (newUserData.programType === '90-day' ? 180 : 120),
              maxValidityDays: newUserData.programType === 'unlimited' ? 3650 : (newUserData.programType === '90-day' ? 90 : 60),
              breakfastTime: '08:00',
              lunchTime: '13:00',
              dinnerTime: '20:00',
              status: 'active',
              specialInstructions: `Weight loss program: ${newUserData.programType}, Meal plan: ${newUserData.mealPlan}`
            });
            newUserData.cafeSubscriptionId = subscription.id;
            showToast('Cafe subscription created successfully!', 'success');
          } catch (cafeError) {
            console.error('Error creating cafe subscription:', cafeError);
            showToast('User created but cafe subscription creation failed', 'warning');
          }
        }
        
        const newUser = dataService.addUser({
          ...newUserData,
          startDate: new Date().toISOString(),
          progressStatus: 'onTrack',
          logs: newUserData.logs || [],
          notes: newUserData.notes || [],
        });
        
        setUsers([...users, newUser]);
        setShowAddUser(false);
        showToast('User added successfully!', 'success');
      }
    } catch (error) {
      console.error('Error saving user:', error);
      showToast('Failed to save user. Please try again.', 'error');
    }
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setShowAddUser(true);
  };

  const handleUpdateUser = (userIdOrObject, updates) => {
    try {
      // Handle both cases: (userId, updates) or (userObject)
      let userId, updateData;
      
      if (typeof userIdOrObject === 'object' && userIdOrObject.id) {
        // Called with user object (from Pipeline drag & drop)
        userId = userIdOrObject.id;
        const { id, ...rest } = userIdOrObject;
        updateData = rest;
      } else {
        // Called with userId and updates separately
        userId = userIdOrObject;
        updateData = updates;
      }
      
      const updatedUser = dataService.updateUser(userId, updateData);
      
      // Update state with new user data
      setUsers(prevUsers => prevUsers.map(u => u.id === userId ? updatedUser : u));
      
      showToast('User updated successfully!', 'success');
    } catch (error) {
      console.error('Error updating user:', error);
      showToast('Failed to update user. Please try again.', 'error');
    }
  };

  const handleDeleteUser = (userId) => {
    const user = users.find(u => u.id === userId);
    
    confirm({
      title: 'Delete User?',
      message: `Are you sure you want to delete ${user?.name || 'this user'}? This action cannot be undone and will remove all their data including logs, photos, and payment history.`,
      confirmText: 'Delete User',
      cancelText: 'Cancel',
      type: 'danger',
      onConfirm: () => {
        try {
          dataService.deleteUser(userId);
          setUsers(users.filter(u => u.id !== userId));
          showToast('User deleted successfully!', 'success');
        } catch (error) {
          console.error('Error deleting user:', error);
          showToast('Failed to delete user. Please try again.', 'error');
        }
      }
    });
  };

  // Trainer Management
  const handleAddTrainer = (trainerData) => {
    try {
      const newTrainers = [...trainers, trainerData];
      localStorage.setItem('weightloss_trainers', JSON.stringify(newTrainers));
      setTrainers(newTrainers);
      showToast('Trainer added successfully!', 'success');
    } catch (error) {
      console.error('Error adding trainer:', error);
      showToast('Failed to add trainer. Please try again.', 'error');
    }
  };

  const handleUpdateTrainer = (trainerId, updates) => {
    try {
      const updatedTrainers = trainers.map(t => 
        t.id === trainerId ? { ...t, ...updates } : t
      );
      localStorage.setItem('weightloss_trainers', JSON.stringify(updatedTrainers));
      setTrainers(updatedTrainers);
      showToast('Trainer updated successfully!', 'success');
    } catch (error) {
      console.error('Error updating trainer:', error);
      showToast('Failed to update trainer. Please try again.', 'error');
    }
  };

  const handleDeleteTrainer = (trainerId) => {
    try {
      const updatedTrainers = trainers.filter(t => t.id !== trainerId);
      localStorage.setItem('weightloss_trainers', JSON.stringify(updatedTrainers));
      setTrainers(updatedTrainers);
      showToast('Trainer deleted successfully!', 'success');
    } catch (error) {
      console.error('Error deleting trainer:', error);
      showToast('Failed to delete trainer. Please try again.', 'error');
    }
  };

  // Batch Management
  const handleAddBatch = (batchData) => {
    try {
      const newBatches = [...batches, batchData];
      localStorage.setItem('weightloss_batches', JSON.stringify(newBatches));
      setBatches(newBatches);
      showToast('Batch added successfully!', 'success');
    } catch (error) {
      console.error('Error adding batch:', error);
      showToast('Failed to add batch. Please try again.', 'error');
    }
  };

  const handleUpdateBatch = (batchId, updates) => {
    try {
      const updatedBatches = batches.map(b => 
        b.id === batchId ? { ...b, ...updates } : b
      );
      localStorage.setItem('weightloss_batches', JSON.stringify(updatedBatches));
      setBatches(updatedBatches);
      showToast('Batch updated successfully!', 'success');
    } catch (error) {
      console.error('Error updating batch:', error);
      showToast('Failed to update batch. Please try again.', 'error');
    }
  };

  const handleDeleteBatch = (batchId) => {
    try {
      const updatedBatches = batches.filter(b => b.id !== batchId);
      localStorage.setItem('weightloss_batches', JSON.stringify(updatedBatches));
      setBatches(updatedBatches);
      showToast('Batch deleted successfully!', 'success');
    } catch (error) {
      console.error('Error deleting batch:', error);
      showToast('Failed to delete batch. Please try again.', 'error');
    }
  };

  const currentPath = location.pathname;

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg flex flex-col">
        <div className="p-6 border-b">
          <h1 className="text-2xl font-bold text-primary">Weight Loss</h1>
          <p className="text-sm text-gray-600">{isAdmin ? 'Admin' : 'Trainer'} Dashboard</p>
          {!isAdmin && currentUser.name && (
            <p className="text-xs text-gray-500 mt-1">Welcome, {currentUser.name}</p>
          )}
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentPath === tab.path || 
              (tab.path === '/weightloss/dashboard' && currentPath === '/weightloss/dashboard/');
            
            return (
              <button
                key={tab.path}
                onClick={() => navigate(tab.path)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition ${
                  isActive
                    ? 'bg-primary text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{tab.name}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t space-y-2">
          <button
            onClick={() => window.open('/calculator', '_blank')}
            className="w-full flex items-center space-x-3 px-4 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition"
          >
            <Calculator className="w-5 h-5" />
            <span className="font-medium">Nutrient Calculator</span>
          </button>

          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <Routes>
          <Route 
            path="/" 
            element={
              <TodaysPriorities 
                users={users} 
              />
            } 
          />
          <Route 
            path="/pipeline" 
            element={
              <PipelineView 
                users={users} 
                onUpdateUser={handleUpdateUser}
              />
            } 
          />
          <Route 
            path="/overview" 
            element={
              <Overview 
                users={users} 
                loading={loading}
                onUpdateUser={handleUpdateUser}
              />
            } 
          />
          <Route 
            path="/users" 
            element={
              <UsersList 
                users={users} 
                loading={loading}
                onUpdateUser={handleUpdateUser}
                onDeleteUser={handleDeleteUser}
                onEditUser={handleEditUser}
                onAddUser={() => setShowAddUser(true)}
                showToast={showToast}
              />
            } 
          />
          <Route 
            path="/users/:userId/edit" 
            element={
              <UserEditPage 
                users={users}
                onUpdateUser={handleUpdateUser}
                onDeleteUser={handleDeleteUser}
                showToast={showToast}
              />
            } 
          />
          <Route 
            path="/checkins" 
            element={
              <CheckinScheduler 
                users={users}
                onUpdateUser={handleUpdateUser}
                showToast={showToast}
              />
            } 
          />
          <Route 
            path="/analytics" 
            element={
              <AdvancedAnalytics 
                users={users}
              />
            } 
          />
          <Route 
            path="/food-exercise-analytics" 
            element={
              <FoodExerciseAnalytics 
                users={users}
                showToast={showToast}
              />
            } 
          />
          <Route 
            path="/billing" 
            element={
              <Billing 
                users={users}
                onUpdateUser={handleUpdateUser}
                showToast={showToast}
              />
            } 
          />
          <Route 
            path="/trainers" 
            element={
              <TrainerManagement 
                trainers={trainers}
                users={users}
                onAddTrainer={handleAddTrainer}
                onUpdateTrainer={handleUpdateTrainer}
                onDeleteTrainer={handleDeleteTrainer}
                onUpdateUser={handleUpdateUser}
                showToast={showToast}
              />
            } 
          />
          <Route 
            path="/batches" 
            element={
              <BatchManagement 
                batches={batches}
                users={users}
                onAddBatch={handleAddBatch}
                onUpdateBatch={handleUpdateBatch}
                onDeleteBatch={handleDeleteBatch}
                onUpdateUser={handleUpdateUser}
                showToast={showToast}
              />
            } 
          />
          <Route 
            path="/foods-workouts" 
            element={<FoodsWorkouts />} 
          />
          <Route 
            path="/advanced-exercises" 
            element={<AdvancedExercises currentUser={currentUser} />} 
          />
          <Route 
            path="/attendance" 
            element={
              <Attendance 
                users={users} 
                loading={loading}
              />
            } 
          />
          <Route 
            path="/reports" 
            element={
              <Reports 
                users={users} 
                loading={loading}
              />
            } 
          />
          <Route 
            path="/settings" 
            element={
              <Settings 
                batches={batches}
              />
            } 
          />
        </Routes>
      </div>

      {/* Add/Edit User Modal */}
      {showAddUser && (
        <AddUserModal
          onClose={() => {
            setShowAddUser(false);
            setEditingUser(null);
          }}
          onSubmit={handleAddUser}
          trainers={trainers}
          batches={batches}
          editUser={editingUser}
        />
      )}

      {/* Toast Notifications */}
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => removeToast(toast.id)}
          duration={toast.duration}
        />
      ))}

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmState.isOpen}
        onClose={closeConfirm}
        onConfirm={confirmState.onConfirm}
        title={confirmState.title}
        message={confirmState.message}
        confirmText={confirmState.confirmText}
        cancelText={confirmState.cancelText}
        type={confirmState.type}
      />
    </div>
  );
};

export default TrainerDashboard;
