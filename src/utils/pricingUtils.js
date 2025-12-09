// Centralized pricing calculation - SINGLE SOURCE OF TRUTH

const MEALS_PER_MONTH = 25; // 30 days - 5 Sundays

/**
 * Calculate meal plan pricing
 * @param {string} planType - 'non-veg', 'veg-eggs', or 'pure-veg'
 * @param {number} mealsPerDay - 1, 2, or 3
 * @param {number} proteinPerMeal - 30, 40, 50, or 60
 * @returns {object} Complete pricing breakdown
 */
export const calculatePricing = (planType, mealsPerDay, proteinPerMeal) => {
  // Base prices for 30g protein
  let basePrice;
  
  if (planType === 'non-veg') {
    if (mealsPerDay === 1) basePrice = 279;
    else if (mealsPerDay === 2) basePrice = 269;
    else basePrice = 259; // 3 meals/day
  } else if (planType === 'veg-eggs') {
    if (mealsPerDay === 1) basePrice = 219;
    else if (mealsPerDay === 2) basePrice = 209;
    else basePrice = 199; // 3 meals/day
  } else { // pure-veg
    if (mealsPerDay === 1) basePrice = 239;
    else if (mealsPerDay === 2) basePrice = 229;
    else basePrice = 219; // 3 meals/day
  }
  
  // Add ₹30 per 10g of extra protein
  const proteinMultiplier = (proteinPerMeal - 30) / 10;
  const additionalCost = proteinMultiplier * 30;
  
  const pricePerMeal = Math.round(basePrice + additionalCost);
  const totalMeals = mealsPerDay * MEALS_PER_MONTH;
  const monthlyAmount = pricePerMeal * totalMeals;
  const perDayPrice = Math.round(monthlyAmount / 30);
  
  return {
    pricePerMeal,
    mealsPerMonth: MEALS_PER_MONTH,
    mealsPerDay,
    totalMeals,
    monthlyAmount,
    perDayPrice,
    dailyAmount: perDayPrice, // alias for compatibility
  };
};

// Export constant for use elsewhere
export { MEALS_PER_MONTH };
