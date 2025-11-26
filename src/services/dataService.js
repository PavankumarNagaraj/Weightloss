// LocalStorage-based data service (replaces Firestore)

const STORAGE_KEY = 'weightloss_users';

// Generate unique ID
const generateId = () => {
  return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
};

// Generate batch-based user ID
const generateBatchUserId = (batchId) => {
  const users = getUsers();
  const batchUsers = users.filter(u => u.batchId === batchId);
  const nextNumber = batchUsers.length + 1;
  const paddedNumber = String(nextNumber).padStart(3, '0');
  
  // Get batch name/code from batches
  const batches = JSON.parse(localStorage.getItem('weightloss_batches') || '[]');
  const batch = batches.find(b => b.id === batchId);
  const batchCode = batch ? batch.name.toLowerCase().replace(/\s+/g, '_') : 'batch';
  
  return `${batchCode}_user_${paddedNumber}`;
};

// Get all users
export const getUsers = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error getting users:', error);
    return [];
  }
};

// Add a new user
export const addUser = (userData) => {
  try {
    const users = getUsers();
    const userId = userData.batchId ? generateBatchUserId(userData.batchId) : generateId();
    const newUser = {
      id: userId,
      ...userData,
      createdAt: new Date().toISOString(),
    };
    users.push(newUser);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
    return newUser;
  } catch (error) {
    console.error('Error adding user:', error);
    throw error;
  }
};

// Update a user
export const updateUser = (userId, updates) => {
  try {
    const users = getUsers();
    const index = users.findIndex(u => u.id === userId);
    if (index !== -1) {
      users[index] = { ...users[index], ...updates };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
      return users[index];
    }
    throw new Error('User not found');
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
};

// Delete a user
export const deleteUser = (userId) => {
  try {
    const users = getUsers();
    const filtered = users.filter(u => u.id !== userId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    return true;
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
};

// Get a single user by ID
export const getUserById = (userId) => {
  try {
    const users = getUsers();
    return users.find(u => u.id === userId) || null;
  } catch (error) {
    console.error('Error getting user:', error);
    return null;
  }
};

// Add multiple users (for sample data)
export const addMultipleUsers = (usersArray) => {
  try {
    const existingUsers = getUsers();
    const newUsers = usersArray.map(userData => ({
      id: generateId(),
      ...userData,
      createdAt: userData.createdAt || new Date().toISOString(),
    }));
    const allUsers = [...existingUsers, ...newUsers];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allUsers));
    return newUsers;
  } catch (error) {
    console.error('Error adding multiple users:', error);
    throw error;
  }
};

// Clear all data (for testing)
export const clearAllData = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem('weightloss_trainers');
    localStorage.removeItem('weightloss_batches');
    localStorage.removeItem('activeBatchId');
    return true;
  } catch (error) {
    console.error('Error clearing data:', error);
    throw error;
  }
};
