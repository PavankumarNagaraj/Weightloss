// Meal Schedule and Delivery Tracking Service
import { getUserById, updateUser } from './dataService';
import foodsData from '../data/foods.json';

// Generate meal schedule for a month
export const generateMonthlySchedule = (userId, subscription, startDate = new Date()) => {
  try {
    const user = getUserById(userId);
    if (!user) throw new Error('User not found');
    
    const { mealsPerDay, planType } = subscription;
    const schedule = [];
    const start = new Date(startDate);
    
    // Get food program (30-day cycle)
    const foodProgram = foodsData.food_program_30_days || [];
    
    // Generate 30 days of meals
    for (let day = 0; day < 30; day++) {
      const currentDate = new Date(start);
      currentDate.setDate(currentDate.getDate() + day);
      
      // Skip Sundays (day 0)
      if (currentDate.getDay() === 0) {
        schedule.push({
          date: currentDate.toISOString().split('T')[0],
          dayOfWeek: 'Sunday',
          isRestDay: true,
          meals: [],
          status: 'skipped',
        });
        continue;
      }
      
      // Get food for this day from the 30-day program
      const dayIndex = day % 30;
      const dayFood = foodProgram[dayIndex] || { food_name: 'Custom Meal', calories: 350 };
      
      // Generate meals based on mealsPerDay
      const meals = [];
      const mealTypes = ['breakfast', 'lunch', 'dinner'];
      
      for (let i = 0; i < mealsPerDay; i++) {
        meals.push({
          type: mealTypes[i],
          dishName: generateDishName(planType, mealTypes[i], dayFood.food_name),
          calories: Math.round(dayFood.calories / mealsPerDay),
          protein: subscription.proteinPerMeal || 30,
          delivered: false,
          deliveredAt: null,
          feedback: null,
          rating: null,
        });
      }
      
      schedule.push({
        date: currentDate.toISOString().split('T')[0],
        dayOfWeek: currentDate.toLocaleDateString('en-US', { weekday: 'long' }),
        isRestDay: false,
        meals,
        status: 'scheduled',
        deliveryAddress: user.address || '',
        deliveryTime: getDeliveryTime(mealTypes[0]),
        notes: '',
      });
    }
    
    return schedule;
  } catch (error) {
    console.error('Error generating monthly schedule:', error);
    throw error;
  }
};

// Generate dish name based on plan type and meal type
const generateDishName = (planType, mealType, baseName) => {
  const dishVariations = {
    'non-veg': {
      breakfast: ['Chicken Salad', 'Egg White Omelette', 'Grilled Chicken Breast'],
      lunch: ['Grilled Chicken with Quinoa', 'Chicken Stir-fry', 'Baked Chicken with Veggies'],
      dinner: ['Grilled Fish', 'Chicken Tikka', 'Chicken Soup'],
    },
    'veg-eggs': {
      breakfast: ['Paneer Burji', 'Egg White Omelette', 'Boiled Eggs with Toast'],
      lunch: ['Paneer Tikka with Salad', 'Egg Curry', 'Tofu Scramble'],
      dinner: ['Paneer Stir-fry', 'Egg Bhurji', 'Greek Yogurt Bowl'],
    },
    'pure-veg': {
      breakfast: ['Sprouts Salad', 'Oats with Banana', 'Quinoa Bowl'],
      lunch: ['Paneer Tikka', 'Tofu Stir-fry', 'Chickpea Salad'],
      dinner: ['Mixed Vegetable Curry', 'Lentil Soup', 'Paneer Salad'],
    },
  };
  
  const variations = dishVariations[planType]?.[mealType] || ['Healthy Meal'];
  const randomIndex = Math.floor(Math.random() * variations.length);
  
  return variations[randomIndex];
};

// Get delivery time based on meal type
const getDeliveryTime = (mealType) => {
  const deliveryTimes = {
    breakfast: '07:00 AM',
    lunch: '12:00 PM',
    dinner: '07:00 PM',
  };
  
  return deliveryTimes[mealType] || '12:00 PM';
};

// Mark meal as delivered
export const markMealDelivered = (userId, date, mealType) => {
  try {
    const user = getUserById(userId);
    if (!user || !user.mealDeliveries) {
      throw new Error('User or meal deliveries not found');
    }
    
    const deliveries = [...user.mealDeliveries];
    const deliveryIndex = deliveries.findIndex(d => d.date === date);
    
    if (deliveryIndex === -1) {
      throw new Error('Delivery not found for this date');
    }
    
    const delivery = deliveries[deliveryIndex];
    const mealIndex = delivery.meals.findIndex(m => m.type === mealType);
    
    if (mealIndex === -1) {
      throw new Error('Meal not found');
    }
    
    delivery.meals[mealIndex].delivered = true;
    delivery.meals[mealIndex].deliveredAt = new Date().toISOString();
    
    // Update delivery status
    const allDelivered = delivery.meals.every(m => m.delivered);
    if (allDelivered) {
      delivery.status = 'delivered';
    }
    
    deliveries[deliveryIndex] = delivery;
    updateUser(userId, { mealDeliveries: deliveries });
    
    return delivery;
  } catch (error) {
    console.error('Error marking meal as delivered:', error);
    throw error;
  }
};

// Skip meal
export const skipMeal = (userId, date, reason = '') => {
  try {
    const user = getUserById(userId);
    if (!user || !user.mealDeliveries) {
      throw new Error('User or meal deliveries not found');
    }
    
    const deliveries = [...user.mealDeliveries];
    const deliveryIndex = deliveries.findIndex(d => d.date === date);
    
    if (deliveryIndex === -1) {
      throw new Error('Delivery not found for this date');
    }
    
    deliveries[deliveryIndex].status = 'skipped';
    deliveries[deliveryIndex].notes = reason;
    
    updateUser(userId, { mealDeliveries: deliveries });
    
    return deliveries[deliveryIndex];
  } catch (error) {
    console.error('Error skipping meal:', error);
    throw error;
  }
};

// Rate meal
export const rateMeal = (userId, date, mealType, rating, feedback = '') => {
  try {
    const user = getUserById(userId);
    if (!user || !user.mealDeliveries) {
      throw new Error('User or meal deliveries not found');
    }
    
    const deliveries = [...user.mealDeliveries];
    const deliveryIndex = deliveries.findIndex(d => d.date === date);
    
    if (deliveryIndex === -1) {
      throw new Error('Delivery not found for this date');
    }
    
    const delivery = deliveries[deliveryIndex];
    const mealIndex = delivery.meals.findIndex(m => m.type === mealType);
    
    if (mealIndex === -1) {
      throw new Error('Meal not found');
    }
    
    delivery.meals[mealIndex].rating = rating;
    delivery.meals[mealIndex].feedback = feedback;
    
    deliveries[deliveryIndex] = delivery;
    updateUser(userId, { mealDeliveries: deliveries });
    
    return delivery;
  } catch (error) {
    console.error('Error rating meal:', error);
    throw error;
  }
};

// Get meal schedule for date range
export const getMealSchedule = (userId, startDate, endDate) => {
  try {
    const user = getUserById(userId);
    if (!user || !user.mealDeliveries) {
      return [];
    }
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    return user.mealDeliveries.filter(delivery => {
      const deliveryDate = new Date(delivery.date);
      return deliveryDate >= start && deliveryDate <= end;
    });
  } catch (error) {
    console.error('Error getting meal schedule:', error);
    return [];
  }
};

// Get today's meals
export const getTodaysMeals = (userId) => {
  const today = new Date().toISOString().split('T')[0];
  const schedule = getMealSchedule(userId, today, today);
  return schedule.length > 0 ? schedule[0] : null;
};

// Get delivery statistics
export const getDeliveryStats = (userId) => {
  try {
    const user = getUserById(userId);
    if (!user || !user.mealDeliveries) {
      return {
        total: 0,
        delivered: 0,
        scheduled: 0,
        skipped: 0,
        deliveryRate: 0,
      };
    }
    
    const total = user.mealDeliveries.length;
    const delivered = user.mealDeliveries.filter(d => d.status === 'delivered').length;
    const scheduled = user.mealDeliveries.filter(d => d.status === 'scheduled').length;
    const skipped = user.mealDeliveries.filter(d => d.status === 'skipped').length;
    
    return {
      total,
      delivered,
      scheduled,
      skipped,
      deliveryRate: total > 0 ? Math.round((delivered / total) * 100) : 0,
    };
  } catch (error) {
    console.error('Error getting delivery stats:', error);
    return {
      total: 0,
      delivered: 0,
      scheduled: 0,
      skipped: 0,
      deliveryRate: 0,
    };
  }
};

// Get average meal rating
export const getAverageMealRating = (userId) => {
  try {
    const user = getUserById(userId);
    if (!user || !user.mealDeliveries) {
      return 0;
    }
    
    let totalRatings = 0;
    let ratingCount = 0;
    
    user.mealDeliveries.forEach(delivery => {
      delivery.meals.forEach(meal => {
        if (meal.rating) {
          totalRatings += meal.rating;
          ratingCount++;
        }
      });
    });
    
    return ratingCount > 0 ? (totalRatings / ratingCount).toFixed(1) : 0;
  } catch (error) {
    console.error('Error getting average rating:', error);
    return 0;
  }
};

// Initialize meal deliveries for new subscription
export const initializeMealDeliveries = (userId, subscription) => {
  try {
    const schedule = generateMonthlySchedule(userId, subscription);
    updateUser(userId, { mealDeliveries: schedule });
    return schedule;
  } catch (error) {
    console.error('Error initializing meal deliveries:', error);
    throw error;
  }
};

// Update delivery address
export const updateDeliveryAddress = (userId, address) => {
  try {
    const user = getUserById(userId);
    if (!user) throw new Error('User not found');
    
    updateUser(userId, { address });
    
    // Update address in all future deliveries
    if (user.mealDeliveries) {
      const today = new Date().toISOString().split('T')[0];
      const updatedDeliveries = user.mealDeliveries.map(delivery => {
        if (delivery.date >= today && delivery.status === 'scheduled') {
          return { ...delivery, deliveryAddress: address };
        }
        return delivery;
      });
      
      updateUser(userId, { mealDeliveries: updatedDeliveries });
    }
    
    return true;
  } catch (error) {
    console.error('Error updating delivery address:', error);
    throw error;
  }
};
