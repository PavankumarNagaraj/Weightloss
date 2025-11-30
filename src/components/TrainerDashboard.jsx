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
} from 'lucide-react';
import Overview from './dashboard/Overview';
import Funnel from './dashboard/Funnel';
import UsersList from './dashboard/UsersList';
import Reports from './dashboard/Reports';
import Attendance from './dashboard/AttendanceNew';
import TrainerManagement from './dashboard/TrainerManagement';
import BatchManagement from './dashboard/BatchManagement';
import Settings from './dashboard/Settings';
import FoodsWorkouts from './dashboard/FoodsWorkouts';
import AdvancedExercises from './dashboard/AdvancedExercises';
import AddUserModal from './dashboard/AddUserModal';
import Toast from './Toast';
import { useToast } from '../hooks/useToast';
import * as dataService from '../services/dataService';
import { initializeExerciseLibrary } from '../utils/initializeExercises';

const TrainerDashboard = ({ onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [users, setUsers] = useState([]);
  const [trainers, setTrainers] = useState([]);
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddUser, setShowAddUser] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const { toasts, showToast, removeToast } = useToast();
  
  // Get current user role and info
  const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
  const userRole = localStorage.getItem('userRole') || 'admin';
  const isAdmin = userRole === 'admin';

  // Filter tabs based on role
  const allTabs = [
    { name: 'Overview', path: '/dashboard', icon: LayoutDashboard, roles: ['admin', 'trainer'] },
    { name: 'Funnel', path: '/dashboard/funnel', icon: Filter, roles: ['admin'] },
    { name: 'Users', path: '/dashboard/users', icon: Users, roles: ['admin', 'trainer'] },
    { name: 'Trainers', path: '/dashboard/trainers', icon: Shield, roles: ['admin'] },
    { name: 'Batches', path: '/dashboard/batches', icon: Layers, roles: ['admin'] },
    { name: 'Foods & Workouts', path: '/dashboard/foods-workouts', icon: Apple, roles: ['admin', 'trainer'] },
    { name: 'Advanced Exercises', path: '/dashboard/advanced-exercises', icon: Dumbbell, roles: ['admin', 'trainer'] },
    { name: 'Attendance', path: '/dashboard/attendance', icon: Calendar, roles: ['admin', 'trainer'] },
    { name: 'Reports', path: '/dashboard/reports', icon: TrendingUp, roles: ['admin', 'trainer'] },
    { name: 'Settings', path: '/dashboard/settings', icon: SettingsIcon, roles: ['admin'] },
  ];
  
  const tabs = allTabs.filter(tab => tab.roles.includes(userRole));

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
    navigate('/login');
  };

  const handleAddUser = (userIdOrData, userData = null) => {
    try {
      // Check if this is an edit (two parameters) or add (one parameter)
      if (userData) {
        // Edit mode: first param is userId, second is userData
        const userId = userIdOrData;
        const updatedUser = dataService.updateUser(userId, userData);
        setUsers(users.map(u => u.id === userId ? updatedUser : u));
        setEditingUser(null);
        setShowAddUser(false);
        showToast('User updated successfully!', 'success');
      } else {
        // Add mode: first param is userData
        const newUserData = userIdOrData;
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

  const handleUpdateUser = (userId, updates) => {
    try {
      const updatedUser = dataService.updateUser(userId, updates);
      setUsers(users.map(u => u.id === userId ? updatedUser : u));
      showToast('User updated successfully!', 'success');
    } catch (error) {
      console.error('Error updating user:', error);
      showToast('Failed to update user. Please try again.', 'error');
    }
  };

  const handleDeleteUser = (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    
    try {
      dataService.deleteUser(userId);
      setUsers(users.filter(u => u.id !== userId));
      showToast('User deleted successfully!', 'success');
    } catch (error) {
      console.error('Error deleting user:', error);
      showToast('Failed to delete user. Please try again.', 'error');
    }
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
              (tab.path === '/dashboard' && currentPath === '/dashboard/');
            
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
            onClick={() => setShowAddUser(true)}
            className="w-full flex items-center space-x-3 px-4 py-3 bg-secondary text-white rounded-lg hover:bg-secondary/90 transition"
          >
            <UserPlus className="w-5 h-5" />
            <span className="font-medium">Add User</span>
          </button>

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
              <Overview 
                users={users} 
                loading={loading}
                onUpdateUser={handleUpdateUser}
              />
            } 
          />
          <Route 
            path="/funnel" 
            element={
              <Funnel 
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
    </div>
  );
};

export default TrainerDashboard;
