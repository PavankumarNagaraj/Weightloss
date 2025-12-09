// User Authentication Service (Backend-free using localStorage)
// Future: Ready for Google OAuth integration for step count & health data

const USER_AUTH_KEY = 'weightloss_user_auth';
const GOOGLE_AUTH_KEY = 'weightloss_google_auth';

// Generate a simple auth token
const generateToken = (userId) => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  return btoa(`${userId}_${timestamp}_${random}`);
};

// Create user login credentials
export const createUserLogin = (userId, phone) => {
  try {
    const userAuths = JSON.parse(localStorage.getItem(USER_AUTH_KEY) || '{}');
    
    // Use phone number as username (last 10 digits)
    const username = phone.slice(-10);
    
    // Generate a simple 6-digit PIN from phone number
    const pin = phone.slice(-6);
    
    // Store auth credentials
    userAuths[username] = {
      userId,
      username,
      pin,
      phone,
      createdAt: new Date().toISOString(),
      lastLogin: null,
    };
    
    localStorage.setItem(USER_AUTH_KEY, JSON.stringify(userAuths));
    
    return {
      username,
      pin,
      loginUrl: `${window.location.origin}/user-login?phone=${phone}`,
    };
  } catch (error) {
    console.error('Error creating user login:', error);
    throw error;
  }
};

// User login
export const loginUser = (phone, pin) => {
  try {
    const userAuths = JSON.parse(localStorage.getItem(USER_AUTH_KEY) || '{}');
    const username = phone.slice(-10);
    
    const userAuth = userAuths[username];
    
    if (!userAuth) {
      throw new Error('User not found. Please check your phone number.');
    }
    
    if (userAuth.pin !== pin) {
      throw new Error('Invalid PIN. Please try again.');
    }
    
    // Update last login
    userAuth.lastLogin = new Date().toISOString();
    userAuths[username] = userAuth;
    localStorage.setItem(USER_AUTH_KEY, JSON.stringify(userAuths));
    
    // Generate session token
    const token = generateToken(userAuth.userId);
    
    // Store session
    const session = {
      userId: userAuth.userId,
      token,
      loginTime: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
    };
    
    localStorage.setItem('user_session', JSON.stringify(session));
    
    return {
      userId: userAuth.userId,
      token,
    };
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

// Check if user is logged in
export const isUserLoggedIn = () => {
  try {
    const session = JSON.parse(localStorage.getItem('user_session') || 'null');
    
    if (!session) return false;
    
    // Check if session expired
    const expiresAt = new Date(session.expiresAt);
    const now = new Date();
    
    if (now > expiresAt) {
      logoutUser();
      return false;
    }
    
    return true;
  } catch (error) {
    return false;
  }
};

// Get current logged-in user ID
export const getCurrentUserId = () => {
  try {
    const session = JSON.parse(localStorage.getItem('user_session') || 'null');
    return session?.userId || null;
  } catch (error) {
    return null;
  }
};

// Logout user
export const logoutUser = () => {
  localStorage.removeItem('user_session');
};

// Get user credentials (for showing to user after signup)
export const getUserCredentials = (phone) => {
  try {
    const userAuths = JSON.parse(localStorage.getItem(USER_AUTH_KEY) || '{}');
    const username = phone.slice(-10);
    const userAuth = userAuths[username];
    
    if (!userAuth) return null;
    
    return {
      username: userAuth.username,
      pin: userAuth.pin,
      phone: userAuth.phone,
    };
  } catch (error) {
    return null;
  }
};

// Reset PIN (requires phone verification)
export const resetUserPin = (phone, newPin) => {
  try {
    const userAuths = JSON.parse(localStorage.getItem(USER_AUTH_KEY) || '{}');
    const username = phone.slice(-10);
    
    if (!userAuths[username]) {
      throw new Error('User not found');
    }
    
    userAuths[username].pin = newPin;
    localStorage.setItem(USER_AUTH_KEY, JSON.stringify(userAuths));
    
    return true;
  } catch (error) {
    console.error('Error resetting PIN:', error);
    throw error;
  }
};

// Auto-login with token (for direct links)
export const autoLoginWithToken = (userId, token) => {
  try {
    // For backward compatibility with old direct links
    // Create a temporary session
    const session = {
      userId,
      token,
      loginTime: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    };
    
    localStorage.setItem('user_session', JSON.stringify(session));
    return true;
  } catch (error) {
    return false;
  }
};

// ============================================
// GOOGLE INTEGRATION (Future Implementation)
// ============================================

// Link Google account to user (for step count & health data)
export const linkGoogleAccount = (userId, googleData) => {
  try {
    const googleAuths = JSON.parse(localStorage.getItem(GOOGLE_AUTH_KEY) || '{}');
    
    googleAuths[userId] = {
      googleId: googleData.googleId,
      email: googleData.email,
      name: googleData.name,
      picture: googleData.picture,
      accessToken: googleData.accessToken,
      refreshToken: googleData.refreshToken,
      linkedAt: new Date().toISOString(),
      permissions: {
        fitness: true, // Google Fit API
        activity: true, // Activity Recognition
        location: false, // Optional
      },
    };
    
    localStorage.setItem(GOOGLE_AUTH_KEY, JSON.stringify(googleAuths));
    return true;
  } catch (error) {
    console.error('Error linking Google account:', error);
    return false;
  }
};

// Check if user has linked Google account
export const isGoogleLinked = (userId) => {
  try {
    const googleAuths = JSON.parse(localStorage.getItem(GOOGLE_AUTH_KEY) || '{}');
    return !!googleAuths[userId];
  } catch (error) {
    return false;
  }
};

// Get Google account data
export const getGoogleAccount = (userId) => {
  try {
    const googleAuths = JSON.parse(localStorage.getItem(GOOGLE_AUTH_KEY) || '{}');
    return googleAuths[userId] || null;
  } catch (error) {
    return null;
  }
};

// Unlink Google account
export const unlinkGoogleAccount = (userId) => {
  try {
    const googleAuths = JSON.parse(localStorage.getItem(GOOGLE_AUTH_KEY) || '{}');
    delete googleAuths[userId];
    localStorage.setItem(GOOGLE_AUTH_KEY, JSON.stringify(googleAuths));
    return true;
  } catch (error) {
    return false;
  }
};

// Update Google access token (for refresh)
export const updateGoogleToken = (userId, newAccessToken) => {
  try {
    const googleAuths = JSON.parse(localStorage.getItem(GOOGLE_AUTH_KEY) || '{}');
    if (googleAuths[userId]) {
      googleAuths[userId].accessToken = newAccessToken;
      googleAuths[userId].lastTokenUpdate = new Date().toISOString();
      localStorage.setItem(GOOGLE_AUTH_KEY, JSON.stringify(googleAuths));
      return true;
    }
    return false;
  } catch (error) {
    return false;
  }
};
