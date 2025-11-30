import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import {
  Dumbbell,
  Apple,
  Beef,
  Leaf,
  Calendar,
  CheckCircle,
  Star,
  TrendingUp,
  Users,
  Award,
  Clock,
  Phone,
  Mail,
  MapPin,
  ArrowRight,
  Zap,
  Heart,
  Target,
  Shield,
  ChevronRight,
  Instagram,
  Facebook,
  Twitter,
  Utensils,
  Droplets,
  Slice,
  Soup
} from 'lucide-react';

const HomePage = () => {
  const navigate = useNavigate();
  const [selectedMeals, setSelectedMeals] = useState(2);
  const [selectedPlan, setSelectedPlan] = useState('non-veg');
  const [selectedProtein, setSelectedProtein] = useState(30);

  const mealOptions = [
    { meals: 1, label: '1 Meal/Day' },
    { meals: 2, label: '2 Meals/Day' },
    { meals: 3, label: '3 Meals/Day' }
  ];

  const proteinOptions = [
    { grams: 30, label: '30g' },
    { grams: 40, label: '40g' },
    { grams: 50, label: '50g' },
    { grams: 60, label: '60g' }
  ];

  const subscriptionPlans = {
    'non-veg': {
      name: 'Non-Vegetarian',
      description: 'High-protein meals with premium chicken',
      icon: Beef,
      color: 'from-red-500 to-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      textColor: 'text-red-600',
      popular: true,
      features: [
        'Chicken per meal as per protein selected',
        'Eggs and Egg based dishes',
        'Fresh seasonal vegetables',
        'Extra virgin olive oil',
        'Balanced macros for muscle gain',
        'Detox drink included with every meal',
        'Cooked fresh daily',
        'Parcel charges extra',
        'More dishes will be added as the season progresses'
      ],
      mealDetails: {
        chicken: '100g',
        veggies: 'Seasonal',
        oil: 'Olive Oil',
        calories: '~365 cal'
      },
      dishes: [
        { name: 'Grilled Chicken Breast', description: 'Grilled chicken breast with vegetables' },
        { name: 'Chicken OATS meal', description: 'OATs with chicken cubes' },
        { name: 'Chicken Tikka', description: 'Marinated pieces of meat cooked on skewers over a grill' },
        { name: 'High Protein Sandwich', description: 'Chicken, Greek Yogurt as main ingredients' },
        { name: 'Rice & Maxican Salad', description: 'Chicken salad with Vegetables' },
        { name: 'Grilled Chicken Bowl', description: 'Grilled chicken breast with quinoa and roasted vegetables' },
        { name: 'Chicken Tikka Masala', description: 'Tender chicken in creamy tomato sauce with brown rice' },
        { name: 'Lemon Herb Chicken', description: 'Herb-marinated chicken with sweet potato and greens' },
        { name: 'Chicken Stir Fry', description: 'Wok-tossed chicken with mixed vegetables and noodles' },
        { name: 'BBQ Chicken Plate', description: 'BBQ glazed chicken with roasted veggies and rice' }
      ]
    },
    'veg-eggs': {
      name: 'Veg + Eggs',
      description: 'Vegetarian meals with protein-rich eggs',
      icon: Slice,
      color: 'from-amber-500 to-orange-600',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200',
      textColor: 'text-amber-600',
      popular: false,
      features: [
        'Eggs as per protein selected',
        'Fresh seasonal vegetables',
        'Extra virgin olive oil',
        'High protein egg-based options',
        'Detox drink included with every meal',
        'Cooked fresh daily',
        'Parcel charges extra',
        'More dishes will be added as the season progresses'
      ],
      mealDetails: {
        protein: 'Eggs',
        veggies: 'Seasonal',
        oil: 'Olive Oil',
        calories: '~280 cal'
      },
      dishes: [
        { name: 'Egg Bhurji Bowl', description: 'Scrambled eggs with quinoa and roasted vegetables' },
        { name: 'High Protein Sandwich', description: 'Egg and Avocado, Greek Yogurt as main ingredients' },
        { name: 'Masala Omelette', description: 'Spiced omelette with brown rice and veggies' },
        { name: 'Egg Curry', description: 'Boiled eggs in rich tomato gravy with whole wheat roti' },
        { name: 'Veggie Egg Wrap', description: 'Whole wheat wrap with eggs and fresh vegetables' },
        { name: 'Egg Fried Rice', description: 'Protein-packed fried rice with eggs and vegetables' },
        { name: 'High-Protein Egg Rice Bowl', description: 'Protein-packed fried rice with eggs and vegetables' },
        { name: 'Egg Salad Bowl (High Protein)', description: 'Protein-packed fried rice with eggs and vegetables' },
      ]
    },
    'veg': {
      name: 'Vegetarian',
      description: 'Nutritious plant-based meals',
      icon: Apple,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      textColor: 'text-green-600',
      popular: false,
      features: [
        'Paneer or tofu as per protein selected',
        'Fresh seasonal vegetables',
        'Extra virgin olive oil',
        'High protein vegetarian options',
        'Detox drink included with every meal',
        'Cooked fresh daily',
        'Parcel charges extra',
        'More dishes will be added as the season progresses'
      ],
      mealDetails: {
        protein: '150g Paneer',
        veggies: 'Seasonal',
        oil: 'Olive Oil',
        calories: '~320 cal'
      },
      dishes: [
        { name: 'Paneer Tikka Bowl', description: 'Grilled paneer with quinoa and roasted vegetables' },
        { name: 'High Protein Sandwich', description: 'Paneer and Avocado as main ingredients (Greek yogurt optional)' },
        { name: 'HP Paneer Steak + Veggies', description: 'Grilled paneer and roasted vegetables' },
        { name: 'Palak Paneer', description: 'Cottage cheese in spinach gravy with brown rice' },
        { name: 'Tofu Stir Fry', description: 'Crispy tofu with mixed vegetables and noodles' },
        { name: 'Paneer Butter Masala', description: 'Paneer in rich tomato gravy with whole wheat roti' },
        { name: 'Chickpea Buddha Bowl', description: 'Roasted chickpeas with quinoa, avocado and greens' },
        { name: 'Tofu Stir Fry Bowl', description: 'Crispy tofu with mixed vegetables' },
        { name: 'Soya Chunks + Paneer', description: 'Soya chunks with paneer and brown rice' },
        { name: 'Buddha Bowl', description: 'Roasted chickpeas with quinoa, avocado and greens' },
      ]
    }
  };

  // Pricing logic based on meals per day and protein content
  // Base prices for 30g protein, +₹30 per 10g extra protein
  const getPricePerMeal = (planKey, mealsPerDay, proteinGrams) => {
    // Base prices for 30g protein
    let basePrice;
    if (planKey === 'non-veg') {
      if (mealsPerDay === 1) basePrice = 279;
      else if (mealsPerDay === 2) basePrice = 269;
      else basePrice = 259; // 3 meals/day
    } else if (planKey === 'veg-eggs') {
      // Veg + Eggs: ₹20 less than pure veg
      if (mealsPerDay === 1) basePrice = 219;
      else if (mealsPerDay === 2) basePrice = 209;
      else basePrice = 199; // 3 meals/day
    } else { // veg
      if (mealsPerDay === 1) basePrice = 239;
      else if (mealsPerDay === 2) basePrice = 229;
      else basePrice = 219; // 3 meals/day
    }

    // Add ₹30 per 10g of extra protein
    const proteinMultiplier = (proteinGrams - 30) / 10;
    const additionalCost = proteinMultiplier * 30; // ₹30 per 10g extra protein
    
    return Math.round(basePrice + additionalCost);
  };

  const MEALS_PER_MONTH = 25; // 30 days - 5 Sundays (approximately)

  const features = [
    {
      icon: Apple,
      title: 'Healthy Meals',
      description: 'Nutritionally balanced meals prepared fresh daily'
    },
    {
      icon: Droplets,
      title: 'Detox Drink Included',
      description: 'Complimentary detox drink with every meal'
    },
    {
      icon: Target,
      title: 'Goal Tracking',
      description: 'Track your fitness journey with our advanced tools'
    },
    {
      icon: Soup,
      title: 'Different Meals',
      description: 'You will get different meals everyday'
    }
  ];

  const testimonials = [
    {
      name: 'Rahul ',
      role: 'Software Engineer',
      image: '👨‍💼',
      rating: 5,
      text: 'Lost 7kg in 6 months! The meal plans are amazing and the trainers are super supportive.'
    },
    {
      name: 'Priya Patel',
      role: 'Marketing Manager',
      image: '👩‍💼',
      rating: 4,
      text: 'Best decision ever! The vegetarian meal options are delicious and perfectly portioned.'
    },
    {
      name: 'Amit Kumar',
      role: 'Entrepreneur',
      image: '👨‍💻',
      rating: 4,
      text: 'Gained muscle mass while eating clean. The non-veg plan is perfect for my goals!'
    }
  ];

  const stats = [
    { number: '100+', label: 'Happy Members' },
    { number: '5+', label: 'Expert Trainers' },
    { number: '1000+', label: 'Meals Served' },
    { number: '97%', label: 'Success Rate' }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <Navbar />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-20 overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-0 w-96 h-96 bg-primary rounded-full filter blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-secondary rounded-full filter blur-3xl animate-pulse delay-1000"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-5xl mx-auto text-center">
            <div>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-black mb-6 leading-tight">
                <span className="bg-gradient-to-r from-white via-yellow-400 to-orange-500 bg-clip-text text-transparent"> 
                  Transform Your Body & Mind
                </span>
              </h1>
              

              {/* Meal Selector */}
              <div className="mb-6">
                <div className="inline-flex flex-wrap justify-center bg-white/10 backdrop-blur-lg rounded-xl p-1.5 border border-white/20 gap-1">
                  {mealOptions.map((option) => (
                    <button
                      key={option.meals}
                      onClick={() => setSelectedMeals(option.meals)}
                      className={`px-4 sm:px-6 py-2 rounded-lg font-bold transition-all text-xs sm:text-sm ${
                        selectedMeals === option.meals
                          ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 shadow-lg'
                          : 'text-white hover:bg-white/20'
                      }`}
                    >
                      {option.meals} Meal{option.meals > 1 ? 's' : ''}/Day
                    </button>
                  ))}
                </div>
              </div>

              {/* Protein Selector */}
              <div className="mb-8">
                <div className="text-xs sm:text-sm text-gray-400 mb-3">Protein per meal:</div>
                <div className="inline-flex flex-wrap justify-center bg-white/10 backdrop-blur-lg rounded-xl p-1.5 border border-white/20 gap-1">
                  {proteinOptions.map((option) => (
                    <button
                      key={option.grams}
                      onClick={() => setSelectedProtein(option.grams)}
                      className={`px-3 sm:px-6 py-2 rounded-lg font-bold transition-all text-xs sm:text-sm ${
                        selectedProtein === option.grams
                          ? 'bg-gradient-to-r from-green-400 to-emerald-500 text-gray-900 shadow-lg'
                          : 'text-white hover:bg-white/20'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Pricing Cards - All Plans */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 max-w-6xl mx-auto">
                {Object.entries(subscriptionPlans).map(([key, plan]) => {
                  const Icon = plan.icon;
                  const pricePerMeal = getPricePerMeal(key, selectedMeals, selectedProtein);
                  const monthlyPrice = pricePerMeal * selectedMeals * MEALS_PER_MONTH;
                  
                  return (
                    <div key={key} className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 sm:p-6 border border-white/20 hover:bg-white/15 transition-all">
                      <div className="flex items-center gap-2 mb-4">
                        <Icon className={`w-6 h-6 ${
                          key === 'non-veg' ? 'text-red-400' : 
                          key === 'veg-eggs' ? 'text-amber-400' : 
                          'text-green-400'
                        }`} />
                        <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                        {plan.popular && (
                          <span className="px-2 py-1 bg-yellow-400 text-yellow-900 rounded-full text-xs font-bold ml-auto">
                            Popular
                          </span>
                        )}
                      </div>
                      <div className="mb-3">
                        <br></br>
                        <div className="text-3xl sm:text-4xl font-black text-white">
                          ₹{monthlyPrice.toLocaleString()}
                          <span className="text-lg text-gray-400">/month</span>
                        </div>
                        <div className="text-sm text-gray-400 mt-1">
                          {selectedMeals} meal{selectedMeals > 1 ? 's' : ''} × 25 days
                        </div>
                        <br></br>
                      </div>
                      <div className="flex items-center justify-between pt-3 border-t border-white/20">
                        <div>
                          <div className="text-gray-400 text-xs">Per meal</div>
                          <div className="text-2xl font-bold text-yellow-400">₹{pricePerMeal}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-gray-400 text-xs">Total meals</div>
                          <div className="text-2xl font-bold text-green-400">{selectedMeals * MEALS_PER_MONTH}</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center max-w-md mx-auto">
                <a
                  href="tel:8899175788"
                  className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 rounded-xl font-bold hover:shadow-2xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2 group overflow-hidden relative"
                >
                  <Phone className="w-5 h-5 transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110" />
                  <span className="transition-all duration-300 group-hover:opacity-0 group-hover:-translate-x-2">Call Now</span>
                  <span className="absolute transition-all duration-300 opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0">8899175788</span>
                  <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
                </a>
                <button
                  onClick={() => {
                    navigate('/calculator');
                    window.scrollTo(0, 0);
                  }}
                  className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-white/10 backdrop-blur-lg text-white border-2 border-white/30 rounded-xl font-bold hover:bg-white/20 active:bg-white/30 transition-all cursor-pointer touch-manipulation"
                >
                  Nutrients Calculator
                </button>
              </div>
              <p className="text-sm sm:text-base md:text-xl text-gray-300 mb-8 leading-relaxed px-4"><br></br>
                Fresh and Healthy meals with <span className="text-yellow-400 font-bold">30g protein/100g chicken</span> or <span className="text-green-400 font-bold">30g protein/150g paneer</span>, 
                cooked in <span className="text-orange-400 font-bold">olive oil</span>. 
          
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, idx) => (
              <div key={idx} className="text-center">
                <div className="text-4xl font-bold text-primary mb-2">{stat.number}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Choose AFTERBURN?</h2>
            <p className="text-xl text-gray-600">Everything you need for your fitness journey</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <div key={idx} className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition border border-gray-100">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Subscription Plans */}
      <section id="plans" className="py-20 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-yellow-400 rounded-full filter blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-green-500 rounded-full filter blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-3 sm:mb-4">Detailed Meal Plans</h2>
            <p className="text-sm sm:text-base md:text-xl text-gray-300 px-4">Fresh and Healthy meals daily • 25 meals per month (Sundays off)</p>
          </div>

          {/* All Plans Side by Side */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
            {Object.entries(subscriptionPlans).map(([key, plan]) => {
              const Icon = plan.icon;
              const pricePerMeal = getPricePerMeal(key, selectedMeals, selectedProtein);
              const monthlyPrice = pricePerMeal * selectedMeals * MEALS_PER_MONTH;
              const perDayPrice = Math.round(monthlyPrice / 30);
              const totalMeals = selectedMeals * MEALS_PER_MONTH;

              return (
                <div key={key} className="bg-white/5 backdrop-blur-lg rounded-2xl sm:rounded-3xl p-4 sm:p-6 border-2 border-white/10 shadow-2xl hover:bg-white/10 transition-all transform hover:scale-[1.02] flex flex-col">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-4 sm:mb-6">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className={`p-2 sm:p-3 bg-gradient-to-br ${plan.color} rounded-lg sm:rounded-xl`}>
                        <Icon className="w-6 sm:w-8 h-6 sm:h-8 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white">{plan.name}</h3>
                        <p className="text-xs sm:text-sm text-gray-300">{plan.description}</p>
                      </div>
                    </div>
                    {plan.popular && (
                      <span className="px-2 sm:px-3 py-1 bg-yellow-400 text-yellow-900 rounded-full text-xs font-bold">
                        Popular
                      </span>
                    )}
                  </div>

                  {/* Content - grows to fill space */}
                  <div className="flex-grow">
                    {/* Features */}
                    <div className="mb-4 sm:mb-6">
                      <h4 className="font-bold text-white mb-2 sm:mb-3 flex items-center gap-2 text-sm sm:text-base">
                        <CheckCircle className="w-4 sm:w-5 h-4 sm:h-5 text-green-400" />
                        What's Included:
                      </h4>
                      <ul className="space-y-1.5 sm:space-y-2">
                        {plan.features.map((feature, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-gray-300 text-xs sm:text-sm">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-400 mt-2"></div>
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Sample Dishes */}
                    <div className="mb-4 sm:mb-6">
                      <h4 className="font-bold text-white mb-2 sm:mb-3 flex items-center gap-2 text-sm sm:text-base">
                        <Utensils className="w-4 sm:w-5 h-4 sm:h-5 text-yellow-400" />
                        Dishes:
                      </h4>
                      <div className="space-y-2 sm:space-y-3">
                        {plan.dishes.map((dish, idx) => (
                          <div key={idx} className="bg-white/5 rounded-lg sm:rounded-xl p-2 sm:p-3 border border-white/10">
                            <div className="flex items-start justify-between mb-1">
                              <h5 className="font-bold text-white text-xs sm:text-sm">{dish.name}</h5>
                            </div>
                            <p className="text-xs text-gray-400">{dish.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Price and Button - stays at bottom */}
                  <div className="mt-auto">
                    {/* Monthly Price */}
                    <div className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl sm:rounded-2xl p-4 sm:p-6 mb-4 sm:mb-6 text-gray-900">
                      <div className="text-center mb-3 sm:mb-4">
                        <div className="text-xs sm:text-sm font-medium mb-1 sm:mb-2">Monthly Subscription</div>
                        <div className="text-3xl sm:text-4xl md:text-5xl font-black mb-1 sm:mb-2">₹{monthlyPrice.toLocaleString()}</div>
                        <div className="font-medium text-xs sm:text-sm">{totalMeals} meals • {MEALS_PER_MONTH} days</div>
                      </div>
                      <div className="grid grid-cols-3 gap-1.5 sm:gap-2 text-center text-xs sm:text-sm">
                        <div className="bg-white/20 rounded-lg p-1.5 sm:p-2">
                          <div className="font-medium mb-0.5 sm:mb-1">Per Meal</div>
                          <div className="font-black text-sm sm:text-base md:text-lg">₹{pricePerMeal}</div>
                        </div>
                        <div className="bg-white/20 rounded-lg p-1.5 sm:p-2">
                          <div className="font-medium mb-0.5 sm:mb-1">Per Day</div>
                          <div className="font-black text-sm sm:text-base md:text-lg">₹{perDayPrice}</div>
                        </div>
                        <div className="bg-white/20 rounded-lg p-1.5 sm:p-2">
                          <div className="font-medium mb-0.5 sm:mb-1">Sundays</div>
                          <div className="font-black text-sm sm:text-base md:text-lg">Off</div>
                        </div>
                      </div>
                    </div>

                    <a 
                      href="tel:8899175788"
                      className={`w-full py-3 sm:py-4 bg-gradient-to-r ${plan.color} text-white rounded-lg sm:rounded-xl font-bold text-base sm:text-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] flex items-center justify-center gap-2 group relative overflow-hidden`}
                    >
                      <Phone className="w-4 sm:w-5 h-4 sm:h-5 transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110" />
                      <span className="transition-all duration-300 group-hover:opacity-0 group-hover:-translate-x-2">Call to Subscribe</span>
                      <span className="absolute transition-all duration-300 opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0">8899175788</span>
                      <ChevronRight className="w-4 sm:w-5 h-4 sm:h-5 transition-transform duration-300 group-hover:translate-x-1" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Success Stories</h2>
            <p className="text-xl text-gray-600">Hear from our amazing members</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, idx) => (
              <div key={idx} className="bg-white rounded-xl p-6 shadow-lg">
                <div className="flex items-center gap-4 mb-4">
                  <div className="text-4xl">{testimonial.image}</div>
                  <div>
                    <div className="font-bold text-gray-900">{testimonial.name}</div>
                    <div className="text-sm text-gray-600">{testimonial.role}</div>
                  </div>
                </div>
                <div className="flex gap-1 mb-3">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-700">{testimonial.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary to-secondary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">Ready to Start Your Journey?</h2>
          <p className="text-xl text-white/90 mb-8">Join hundreds of members transforming their lives</p>
          <div className="flex flex-wrap justify-center gap-4">
            <button
              onClick={() => document.getElementById('plans').scrollIntoView({ behavior: 'smooth' })}
              className="px-8 py-4 bg-white text-primary rounded-lg font-semibold hover:bg-gray-100 transition shadow-lg"
            >
              Choose Your Plan
            </button>
            <button
              onClick={() => navigate('/calculator')}
              className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-lg font-semibold hover:bg-white/10 transition"
            >
              Try Free Calculator
            </button>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Get In Touch</h2>
            <p className="text-xl text-gray-600">We'd love to hear from you</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Phone className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Phone</h3>
              <a href="tel:8899175788" className="text-primary hover:text-primary/80 font-bold text-lg">
                8899175788
              </a>
            </div>
            <div className="text-center p-6">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Email</h3>
              <p className="text-gray-600">pavankumar.nagaraj@gmail.com</p>
            </div>
            <div className="text-center p-6">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Location</h3>
              <p className="text-gray-600">3rd Floor Sutra Fitness, Above SBI, Sarjapura</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-primary rounded-lg">
                  <Dumbbell className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold">AFTERBURN</span>
              </div>
              <p className="text-gray-400">Transform your body, fuel your goals.</p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#features" className="hover:text-white transition">Features</a></li>
                <li><a href="#plans" className="hover:text-white transition">Plans</a></li>
                <li><a href="#testimonials" className="hover:text-white transition">Testimonials</a></li>
                <li><a href="#contact" className="hover:text-white transition">Contact</a></li>
              </ul>
            </div>
            <div>
            </div>
            <div>
              <h4 className="font-bold mb-4">Follow Us</h4>
              <div className="flex gap-4">
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-primary transition">
                  <Instagram className="w-5 h-5" />
                </a>
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-primary transition">
                  <Facebook className="w-5 h-5" />
                </a>
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-primary transition">
                  <Twitter className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
            <p>&copy; 2025 AFTERBURN. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
