// Service for Today's Priorities Dashboard
import { getUsers } from './dataService';
import { differenceInDays, parseISO, format } from 'date-fns';

export const getPriorities = () => {
  const users = getUsers();
  const today = new Date();
  
  const priorities = {
    critical: [],
    warnings: [],
    celebrations: [],
    checkIns: [],
    stats: {
      activeToday: 0,
      avgWeightLossWeek: 0,
      pendingPayments: 0,
      totalUsers: users.length
    }
  };

  users.forEach(user => {
    // Skip if no logs
    if (!user.logs || user.logs.length === 0) {
      priorities.critical.push({
        userId: user.id,
        userName: user.name,
        type: 'no_logs',
        message: 'Never logged any data',
        priority: 'critical',
        daysInactive: differenceInDays(today, parseISO(user.startDate || today.toISOString()))
      });
      return;
    }

    // Get last log date
    const sortedLogs = [...user.logs].sort((a, b) => 
      new Date(b.date) - new Date(a.date)
    );
    const lastLog = sortedLogs[0];
    const lastLogDate = parseISO(lastLog.date);
    const daysSinceLastLog = differenceInDays(today, lastLogDate);

    // CRITICAL: No log for 5+ days
    if (daysSinceLastLog >= 5) {
      priorities.critical.push({
        userId: user.id,
        userName: user.name,
        type: 'inactive',
        message: `No log for ${daysSinceLastLog} days`,
        priority: 'critical',
        daysInactive: daysSinceLastLog,
        lastActive: format(lastLogDate, 'MMM dd, yyyy')
      });
    }
    // WARNING: No log for 3-4 days
    else if (daysSinceLastLog >= 3) {
      priorities.warnings.push({
        userId: user.id,
        userName: user.name,
        type: 'inactive',
        message: `No log for ${daysSinceLastLog} days`,
        priority: 'warning',
        daysInactive: daysSinceLastLog,
        lastActive: format(lastLogDate, 'MMM dd, yyyy')
      });
    }
    // Active today
    else if (daysSinceLastLog === 0) {
      priorities.stats.activeToday++;
    }

    // Check for plateau (2 weeks no weight change)
    if (sortedLogs.length >= 5) {
      const recentLogs = sortedLogs.slice(0, 5);
      const weights = recentLogs.map(log => log.weight).filter(w => w);
      
      if (weights.length >= 5) {
        const maxWeight = Math.max(...weights);
        const minWeight = Math.min(...weights);
        const weightDiff = maxWeight - minWeight;
        
        // Plateau if less than 0.5kg change in 2 weeks
        if (weightDiff < 0.5) {
          priorities.warnings.push({
            userId: user.id,
            userName: user.name,
            type: 'plateau',
            message: 'No weight change in 2 weeks',
            priority: 'warning',
            currentWeight: weights[0],
            goalWeight: user.goalWeight
          });
        }
      }
    }

    // Check for milestones
    if (user.currentWeight && user.startWeight) {
      const weightLost = user.startWeight - user.currentWeight;
      
      // 5kg milestone
      if (weightLost >= 5 && weightLost < 5.5) {
        priorities.celebrations.push({
          userId: user.id,
          userName: user.name,
          type: 'milestone',
          message: '5kg weight loss achieved! 🎉',
          priority: 'celebration',
          weightLost: weightLost.toFixed(1)
        });
      }
      
      // 10kg milestone
      if (weightLost >= 10 && weightLost < 10.5) {
        priorities.celebrations.push({
          userId: user.id,
          userName: user.name,
          type: 'milestone',
          message: '10kg weight loss achieved! 🏆',
          priority: 'celebration',
          weightLost: weightLost.toFixed(1)
        });
      }
      
      // Goal reached
      if (user.currentWeight <= user.goalWeight) {
        priorities.celebrations.push({
          userId: user.id,
          userName: user.name,
          type: 'goal_reached',
          message: 'Goal weight achieved! 🎯',
          priority: 'celebration',
          currentWeight: user.currentWeight,
          goalWeight: user.goalWeight
        });
      }
    }

    // Check for 7-day streak
    if (sortedLogs.length >= 7) {
      const last7Days = sortedLogs.slice(0, 7);
      const allConsecutive = last7Days.every((log, index) => {
        if (index === 0) return true;
        const prevDate = parseISO(last7Days[index - 1].date);
        const currDate = parseISO(log.date);
        return differenceInDays(prevDate, currDate) === 1;
      });
      
      if (allConsecutive) {
        priorities.celebrations.push({
          userId: user.id,
          userName: user.name,
          type: 'streak',
          message: '7-day logging streak! 🔥',
          priority: 'celebration',
          streak: 7
        });
      }
    }

    // Payment status
    if (user.paymentStatus === 'pending' || user.paymentStatus === 'partial') {
      priorities.stats.pendingPayments++;
    }
  });

  // Calculate average weight loss this week
  const usersWithWeightLoss = users.filter(user => {
    if (!user.logs || user.logs.length < 2) return false;
    const sortedLogs = [...user.logs].sort((a, b) => new Date(b.date) - new Date(a.date));
    const recentLogs = sortedLogs.filter(log => {
      const logDate = parseISO(log.date);
      return differenceInDays(today, logDate) <= 7;
    });
    return recentLogs.length >= 2;
  });

  if (usersWithWeightLoss.length > 0) {
    const totalWeightLoss = usersWithWeightLoss.reduce((sum, user) => {
      const sortedLogs = [...user.logs].sort((a, b) => new Date(b.date) - new Date(a.date));
      const recentLogs = sortedLogs.filter(log => {
        const logDate = parseISO(log.date);
        return differenceInDays(today, logDate) <= 7;
      });
      const weights = recentLogs.map(log => log.weight).filter(w => w);
      if (weights.length >= 2) {
        return sum + (weights[weights.length - 1] - weights[0]);
      }
      return sum;
    }, 0);
    
    priorities.stats.avgWeightLossWeek = (totalWeightLoss / usersWithWeightLoss.length).toFixed(2);
  }

  // Sort by priority
  priorities.critical.sort((a, b) => (b.daysInactive || 0) - (a.daysInactive || 0));
  priorities.warnings.sort((a, b) => (b.daysInactive || 0) - (a.daysInactive || 0));

  return priorities;
};

export const getUserJourneyStage = (user) => {
  // Check if user has reached their goal or is marked as completed
  if (user.status === 'completed' || 
      (user.currentWeight && user.goalWeight && user.currentWeight <= user.goalWeight)) {
    return 'maintenance';
  }
  
  if (!user.startDate) return 'onboarding';
  
  const today = new Date();
  const startDate = parseISO(user.startDate);
  const daysElapsed = differenceInDays(today, startDate);
  
  if (daysElapsed <= 7) return 'onboarding';
  if (daysElapsed <= 21) return 'foundation';
  if (daysElapsed <= 45) return 'momentum';
  if (daysElapsed <= (user.programType === '60-day' ? 60 : 90)) return 'transformation';
  return 'maintenance';
};

export const getStageInfo = (stage) => {
  const stages = {
    onboarding: {
      name: 'Onboarding',
      days: 'Day 1-7',
      color: 'blue',
      description: 'Daily check-ins needed',
      icon: '🚀',
      checkInFrequency: 'daily',
      focus: 'Setup goals & plans'
    },
    foundation: {
      name: 'Foundation',
      days: 'Day 8-21',
      color: 'green',
      description: 'Habit building focus',
      icon: '🌱',
      checkInFrequency: 'weekly',
      focus: 'Build consistent habits'
    },
    momentum: {
      name: 'Momentum',
      days: 'Day 22-45',
      color: 'purple',
      description: 'Maintain progress',
      icon: '⚡',
      checkInFrequency: 'bi-weekly',
      focus: 'Keep the momentum going'
    },
    transformation: {
      name: 'Transformation',
      days: 'Day 46-60/90',
      color: 'orange',
      description: 'Final push',
      icon: '🔥',
      checkInFrequency: 'weekly',
      focus: 'Achieve your goal'
    },
    maintenance: {
      name: 'Maintenance',
      days: 'Post-program',
      color: 'gray',
      description: 'Alumni support',
      icon: '⭐',
      checkInFrequency: 'monthly',
      focus: 'Maintain your results'
    }
  };
  
  return stages[stage] || stages.onboarding;
};

export const getEngagementScore = (user) => {
  let score = 0;
  const today = new Date();
  
  if (!user.logs || user.logs.length === 0) return 0;
  
  // Logging frequency (40 points)
  const sortedLogs = [...user.logs].sort((a, b) => new Date(b.date) - new Date(a.date));
  const last7DaysLogs = sortedLogs.filter(log => {
    const logDate = parseISO(log.date);
    return differenceInDays(today, logDate) <= 7;
  });
  score += (last7DaysLogs.length / 7) * 40;
  
  // Recency (30 points)
  const lastLog = sortedLogs[0];
  const daysSinceLastLog = differenceInDays(today, parseISO(lastLog.date));
  if (daysSinceLastLog === 0) score += 30;
  else if (daysSinceLastLog === 1) score += 20;
  else if (daysSinceLastLog === 2) score += 10;
  else if (daysSinceLastLog === 3) score += 5;
  
  // Progress (30 points)
  if (user.currentWeight && user.startWeight && user.goalWeight) {
    const totalToLose = user.startWeight - user.goalWeight;
    const lostSoFar = user.startWeight - user.currentWeight;
    const progressPercent = (lostSoFar / totalToLose) * 100;
    score += Math.min(progressPercent / 100 * 30, 30);
  }
  
  return Math.round(score);
};
