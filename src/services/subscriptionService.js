// Subscription Management Service
import { getUsers, getUserById, updateUser, addUser } from './dataService';
import { generateSubscriptionId as generateId } from '../utils/idGenerator';

// Use centralized ID generator
const generateSubscriptionId = generateId;

// Calculate end date based on billing cycle
const calculateEndDate = (startDate, billingCycle) => {
  const start = new Date(startDate);
  let endDate = new Date(start);
  
  switch (billingCycle) {
    case 'monthly':
      endDate.setMonth(endDate.getMonth() + 1);
      break;
    case '60-day':
      endDate.setDate(endDate.getDate() + 60);
      break;
    case '90-day':
      endDate.setDate(endDate.getDate() + 90);
      break;
    default:
      endDate.setMonth(endDate.getMonth() + 1);
  }
  
  return endDate.toISOString();
};

// Calculate next billing date (for monthly auto-renew)
const calculateNextBillingDate = (currentDate, billingCycle) => {
  const current = new Date(currentDate);
  let nextDate = new Date(current);
  
  if (billingCycle === 'monthly') {
    nextDate.setMonth(nextDate.getMonth() + 1);
  } else {
    // For fixed-term, next billing is same as end date
    return calculateEndDate(currentDate, billingCycle);
  }
  
  return nextDate.toISOString();
};

// Create a new subscription
export const createSubscription = (subscriptionData) => {
  const now = new Date().toISOString();
  
  const subscription = {
    id: generateSubscriptionId(),
    status: 'active',
    startDate: now,
    endDate: calculateEndDate(now, subscriptionData.billingCycle),
    renewalDate: subscriptionData.billingCycle === 'monthly' ? calculateNextBillingDate(now, subscriptionData.billingCycle) : null,
    nextBillingDate: calculateNextBillingDate(now, subscriptionData.billingCycle),
    lastPaymentDate: now,
    paymentStatus: 'paid', // Default to paid for now
    createdAt: now,
    ...subscriptionData,
  };
  
  return subscription;
};

// Update subscription status
export const updateSubscriptionStatus = (userId, status, updates = {}) => {
  try {
    const user = getUserById(userId);
    if (!user || !user.subscription) {
      throw new Error('User or subscription not found');
    }
    
    const updatedSubscription = {
      ...user.subscription,
      status,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    
    updateUser(userId, { subscription: updatedSubscription });
    return updatedSubscription;
  } catch (error) {
    console.error('Error updating subscription status:', error);
    throw error;
  }
};

// Check if subscription is expired
export const isSubscriptionExpired = (subscription) => {
  if (!subscription) return true;
  
  const now = new Date();
  const endDate = new Date(subscription.endDate);
  
  return now > endDate;
};

// Check if subscription is expiring soon (within days)
export const isSubscriptionExpiringSoon = (subscription, days = 7) => {
  if (!subscription) return false;
  
  const now = new Date();
  const endDate = new Date(subscription.endDate);
  const daysUntilExpiry = Math.ceil((endDate - now) / (1000 * 60 * 60 * 24));
  
  return daysUntilExpiry > 0 && daysUntilExpiry <= days;
};

// Get days remaining in subscription
export const getDaysRemaining = (subscription) => {
  if (!subscription) return 0;
  
  const now = new Date();
  const endDate = new Date(subscription.endDate);
  const daysRemaining = Math.ceil((endDate - now) / (1000 * 60 * 60 * 24));
  
  return Math.max(0, daysRemaining);
};

// Get all active subscriptions
export const getActiveSubscriptions = () => {
  const users = getUsers();
  return users.filter(user => 
    user.subscription && 
    user.subscription.status === 'active' &&
    !isSubscriptionExpired(user.subscription)
  );
};

// Get expiring subscriptions
export const getExpiringSubscriptions = (days = 7) => {
  const users = getUsers();
  return users.filter(user => 
    user.subscription && 
    user.subscription.status === 'active' &&
    isSubscriptionExpiringSoon(user.subscription, days)
  );
};

// Get expired subscriptions
export const getExpiredSubscriptions = () => {
  const users = getUsers();
  return users.filter(user => 
    user.subscription && 
    (user.subscription.status === 'active' || user.subscription.status === 'expired') &&
    isSubscriptionExpired(user.subscription)
  );
};

// Renew subscription (for monthly auto-renew)
export const renewSubscription = (userId) => {
  try {
    const user = getUserById(userId);
    if (!user || !user.subscription) {
      throw new Error('User or subscription not found');
    }
    
    const now = new Date().toISOString();
    const updatedSubscription = {
      ...user.subscription,
      status: 'active',
      startDate: now,
      endDate: calculateEndDate(now, user.subscription.billingCycle),
      renewalDate: user.subscription.billingCycle === 'monthly' ? calculateNextBillingDate(now, user.subscription.billingCycle) : null,
      nextBillingDate: calculateNextBillingDate(now, user.subscription.billingCycle),
      lastPaymentDate: now,
      paymentStatus: 'paid',
      renewedAt: now,
    };
    
    updateUser(userId, { subscription: updatedSubscription });
    return updatedSubscription;
  } catch (error) {
    console.error('Error renewing subscription:', error);
    throw error;
  }
};

// Pause subscription
export const pauseSubscription = (userId, reason = '') => {
  return updateSubscriptionStatus(userId, 'paused', { 
    pausedAt: new Date().toISOString(),
    pauseReason: reason 
  });
};

// Cancel subscription
export const cancelSubscription = (userId, reason = '') => {
  return updateSubscriptionStatus(userId, 'canceled', { 
    canceledAt: new Date().toISOString(),
    cancelReason: reason 
  });
};

// Extend subscription (add days)
export const extendSubscription = (userId, days) => {
  try {
    const user = getUserById(userId);
    if (!user || !user.subscription) {
      throw new Error('User or subscription not found');
    }
    
    const currentEndDate = new Date(user.subscription.endDate);
    const newEndDate = new Date(currentEndDate);
    newEndDate.setDate(newEndDate.getDate() + days);
    
    const updatedSubscription = {
      ...user.subscription,
      endDate: newEndDate.toISOString(),
      extendedBy: (user.subscription.extendedBy || 0) + days,
      extendedAt: new Date().toISOString(),
    };
    
    updateUser(userId, { subscription: updatedSubscription });
    return updatedSubscription;
  } catch (error) {
    console.error('Error extending subscription:', error);
    throw error;
  }
};

// Update payment status
export const updatePaymentStatus = (userId, status, paymentDetails = {}) => {
  try {
    const user = getUserById(userId);
    if (!user || !user.subscription) {
      throw new Error('User or subscription not found');
    }
    
    const updatedSubscription = {
      ...user.subscription,
      paymentStatus: status,
      lastPaymentDate: status === 'paid' ? new Date().toISOString() : user.subscription.lastPaymentDate,
      paymentDetails: {
        ...(user.subscription.paymentDetails || {}),
        ...paymentDetails,
      },
    };
    
    updateUser(userId, { subscription: updatedSubscription });
    return updatedSubscription;
  } catch (error) {
    console.error('Error updating payment status:', error);
    throw error;
  }
};

// Auto-update expired subscriptions (run daily)
export const updateExpiredSubscriptions = () => {
  const expiredSubs = getExpiredSubscriptions();
  
  expiredSubs.forEach(user => {
    if (user.subscription.status !== 'expired') {
      updateSubscriptionStatus(user.id, 'expired', {
        expiredAt: new Date().toISOString(),
      });
    }
  });
  
  return expiredSubs.length;
};

// Get subscription statistics
export const getSubscriptionStats = () => {
  const users = getUsers();
  const usersWithSubs = users.filter(u => u.subscription);
  
  const active = usersWithSubs.filter(u => 
    u.subscription.status === 'active' && !isSubscriptionExpired(u.subscription)
  ).length;
  
  const expiringSoon = usersWithSubs.filter(u => 
    u.subscription.status === 'active' && isSubscriptionExpiringSoon(u.subscription, 7)
  ).length;
  
  const expired = usersWithSubs.filter(u => 
    isSubscriptionExpired(u.subscription)
  ).length;
  
  const paused = usersWithSubs.filter(u => u.subscription.status === 'paused').length;
  const canceled = usersWithSubs.filter(u => u.subscription.status === 'canceled').length;
  
  // Calculate MRR (Monthly Recurring Revenue)
  const mrr = usersWithSubs
    .filter(u => u.subscription.status === 'active' && u.subscription.billingCycle === 'monthly')
    .reduce((sum, u) => sum + (u.subscription.monthlyAmount || 0), 0);
  
  return {
    total: usersWithSubs.length,
    active,
    expiringSoon,
    expired,
    paused,
    canceled,
    mrr,
  };
};

// Get subscription by ID
export const getSubscriptionById = (subscriptionId) => {
  const users = getUsers();
  const user = users.find(u => u.subscription && u.subscription.id === subscriptionId);
  return user ? user.subscription : null;
};
