// Subscription utility functions and helpers

// Format subscription status for display
export const formatSubscriptionStatus = (status) => {
  const statusMap = {
    active: { label: 'Active', color: 'green' },
    paused: { label: 'Paused', color: 'yellow' },
    canceled: { label: 'Canceled', color: 'red' },
    expired: { label: 'Expired', color: 'gray' },
    pending: { label: 'Pending', color: 'blue' },
  };
  
  return statusMap[status] || { label: status, color: 'gray' };
};

// Format billing cycle for display
export const formatBillingCycle = (cycle) => {
  const cycleMap = {
    monthly: 'Monthly',
    '60-day': '60 Days',
    '90-day': '90 Days',
  };
  
  return cycleMap[cycle] || cycle;
};

// Format plan type for display
export const formatPlanType = (planType) => {
  const planMap = {
    'non-veg': 'Non-Vegetarian',
    'veg-eggs': 'Vegetarian + Eggs',
    'pure-veg': 'Pure Vegetarian',
  };
  
  return planMap[planType] || planType;
};

// Get status badge color class
export const getStatusBadgeClass = (status) => {
  const colorMap = {
    active: 'bg-green-100 text-green-800 border-green-200',
    paused: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    canceled: 'bg-red-100 text-red-800 border-red-200',
    expired: 'bg-gray-100 text-gray-800 border-gray-200',
    pending: 'bg-blue-100 text-blue-800 border-blue-200',
  };
  
  return colorMap[status] || 'bg-gray-100 text-gray-800 border-gray-200';
};

// Format date for display
export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

// Format date with time
export const formatDateTime = (dateString) => {
  if (!dateString) return 'N/A';
  
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Calculate days between dates
export const daysBetween = (date1, date2) => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const diffTime = Math.abs(d2 - d1);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

// Get subscription progress percentage
export const getSubscriptionProgress = (subscription) => {
  if (!subscription) return 0;
  
  const start = new Date(subscription.startDate);
  const end = new Date(subscription.endDate);
  const now = new Date();
  
  const total = end - start;
  const elapsed = now - start;
  
  const progress = Math.min(100, Math.max(0, (elapsed / total) * 100));
  return Math.round(progress);
};

// Get days remaining text
export const getDaysRemainingText = (days) => {
  if (days === 0) return 'Expires today';
  if (days === 1) return '1 day remaining';
  if (days < 0) return 'Expired';
  return `${days} days remaining`;
};

// Get urgency level based on days remaining
export const getUrgencyLevel = (days) => {
  if (days < 0) return 'expired';
  if (days <= 3) return 'critical';
  if (days <= 7) return 'warning';
  return 'normal';
};

// Format currency (Indian Rupees)
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

// Calculate monthly recurring revenue
export const calculateMRR = (subscriptions) => {
  return subscriptions
    .filter(sub => sub.status === 'active' && sub.billingCycle === 'monthly')
    .reduce((sum, sub) => sum + (sub.monthlyAmount || 0), 0);
};

// Calculate churn rate
export const calculateChurnRate = (activeCount, canceledCount) => {
  const total = activeCount + canceledCount;
  if (total === 0) return 0;
  return Math.round((canceledCount / total) * 100);
};

// Get subscription health score (0-100)
export const getSubscriptionHealthScore = (subscription) => {
  if (!subscription) return 0;
  
  let score = 100;
  
  // Deduct points for issues
  if (subscription.status === 'paused') score -= 30;
  if (subscription.status === 'canceled') score -= 100;
  if (subscription.status === 'expired') score -= 100;
  if (subscription.paymentStatus === 'pending') score -= 20;
  if (subscription.paymentStatus === 'failed') score -= 40;
  
  // Deduct points based on days remaining
  const now = new Date();
  const endDate = new Date(subscription.endDate);
  const daysRemaining = Math.ceil((endDate - now) / (1000 * 60 * 60 * 24));
  
  if (daysRemaining < 0) score = 0;
  else if (daysRemaining <= 3) score -= 20;
  else if (daysRemaining <= 7) score -= 10;
  
  return Math.max(0, score);
};

// Group subscriptions by status
export const groupSubscriptionsByStatus = (subscriptions) => {
  return subscriptions.reduce((groups, sub) => {
    const status = sub.subscription?.status || 'unknown';
    if (!groups[status]) {
      groups[status] = [];
    }
    groups[status].push(sub);
    return groups;
  }, {});
};

// Sort subscriptions by expiry date
export const sortByExpiryDate = (subscriptions, ascending = true) => {
  return [...subscriptions].sort((a, b) => {
    const dateA = new Date(a.subscription?.endDate || 0);
    const dateB = new Date(b.subscription?.endDate || 0);
    return ascending ? dateA - dateB : dateB - dateA;
  });
};

// Filter subscriptions expiring within days
export const filterExpiringWithin = (subscriptions, days) => {
  const now = new Date();
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + days);
  
  return subscriptions.filter(sub => {
    if (!sub.subscription) return false;
    const endDate = new Date(sub.subscription.endDate);
    return endDate >= now && endDate <= futureDate;
  });
};

// Validate subscription data
export const validateSubscriptionData = (data) => {
  const errors = [];
  
  if (!data.planType) {
    errors.push('Plan type is required');
  }
  
  if (!data.mealsPerDay || data.mealsPerDay < 1 || data.mealsPerDay > 3) {
    errors.push('Meals per day must be between 1 and 3');
  }
  
  if (!data.proteinPerMeal || ![30, 40, 50, 60].includes(data.proteinPerMeal)) {
    errors.push('Invalid protein per meal value');
  }
  
  if (!data.billingCycle) {
    errors.push('Billing cycle is required');
  }
  
  if (!data.monthlyAmount || data.monthlyAmount <= 0) {
    errors.push('Monthly amount must be greater than 0');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Generate subscription summary text
export const generateSubscriptionSummary = (subscription) => {
  if (!subscription) return 'No subscription';
  
  const plan = formatPlanType(subscription.planType);
  const meals = subscription.mealsPerDay;
  const protein = subscription.proteinPerMeal;
  const cycle = formatBillingCycle(subscription.billingCycle);
  
  return `${plan} - ${meals} meal${meals > 1 ? 's' : ''}/day (${protein}g protein) - ${cycle}`;
};

// Check if subscription needs renewal
export const needsRenewal = (subscription, daysThreshold = 7) => {
  if (!subscription) return false;
  if (subscription.status !== 'active') return false;
  
  const now = new Date();
  const endDate = new Date(subscription.endDate);
  const daysRemaining = Math.ceil((endDate - now) / (1000 * 60 * 60 * 24));
  
  return daysRemaining <= daysThreshold && daysRemaining > 0;
};

// Get renewal reminder message
export const getRenewalReminderMessage = (subscription) => {
  if (!subscription) return '';
  
  const daysRemaining = Math.ceil((new Date(subscription.endDate) - new Date()) / (1000 * 60 * 60 * 24));
  
  if (daysRemaining <= 0) {
    return 'Your subscription has expired. Please renew to continue.';
  } else if (daysRemaining <= 3) {
    return `Your subscription expires in ${daysRemaining} day${daysRemaining > 1 ? 's' : ''}. Renew now!`;
  } else if (daysRemaining <= 7) {
    return `Your subscription expires in ${daysRemaining} days. Consider renewing soon.`;
  }
  
  return '';
};
