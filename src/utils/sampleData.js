// Generate 20 sample users with different stages and progress

const names = [
  'Rajesh Kumar', 'Priya Sharma', 'Amit Patel', 'Sneha Reddy', 'Vikram Singh',
  'Anjali Gupta', 'Rahul Verma', 'Pooja Nair', 'Arjun Mehta', 'Divya Iyer',
  'Karan Joshi', 'Neha Kapoor', 'Sanjay Rao', 'Kavita Desai', 'Rohan Pillai',
  'Meera Shah', 'Aditya Kulkarni', 'Ritu Malhotra', 'Varun Chopra', 'Shreya Menon'
];

const mealPlans = ['Veg', 'Non-Veg', 'Detox', 'Veg', 'Non-Veg', 'Veg', 'Detox', 'Non-Veg'];
const genders = ['Male', 'Female', 'Male', 'Female'];
const statuses = ['onTrack', 'atRisk', 'struggling', 'onTrack', 'onTrack'];
const trainers = ['Trainer A', 'Trainer B', 'Trainer C', 'Trainer D'];

// Helper to generate random date in the past
const getRandomDate = (daysAgo) => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString();
};

// Helper to calculate BMI
const calculateBMI = (weight, height) => {
  const heightInMeters = height / 100;
  return parseFloat((weight / (heightInMeters * heightInMeters)).toFixed(1));
};

// Generate logs for a user based on their progress
const generateLogs = (startWeight, goalWeight, daysAgo, progressStatus, height) => {
  const logs = [];
  const totalDays = daysAgo;
  const weightDiff = startWeight - goalWeight;
  
  // Determine how many logs based on status
  let logFrequency = 1; // Log every day
  if (progressStatus === 'atRisk') logFrequency = 2; // Log every 2 days
  if (progressStatus === 'struggling') logFrequency = 4; // Log every 4 days
  
  for (let i = 0; i <= totalDays; i += logFrequency) {
    const progress = i / totalDays;
    let weightLoss;
    
    if (progressStatus === 'onTrack') {
      weightLoss = weightDiff * progress * 0.9; // 90% of expected
    } else if (progressStatus === 'atRisk') {
      weightLoss = weightDiff * progress * 0.6; // 60% of expected
    } else {
      weightLoss = weightDiff * progress * 0.3; // 30% of expected
    }
    
    const currentWeight = parseFloat((startWeight - weightLoss).toFixed(1));
    
    // Generate food intake with calories
    const foodIntake = [
      { item: 'Oats with milk', calories: 250, time: '08:00 AM' },
      { item: 'Banana', calories: 105, time: '10:30 AM' },
      { item: 'Rice and dal', calories: 350, time: '01:00 PM' },
      { item: 'Apple', calories: 95, time: '04:00 PM' },
      { item: 'Roti and vegetables', calories: 300, time: '08:00 PM' }
    ];
    
    // Randomly attended class (90% attendance for onTrack, 70% for atRisk, 50% for struggling)
    let attendanceRate = progressStatus === 'onTrack' ? 0.9 : (progressStatus === 'atRisk' ? 0.7 : 0.5);
    const attended = Math.random() < attendanceRate;
    
    // Size reduction based on weight loss progress (80% for onTrack, 50% for atRisk, 20% for struggling)
    let sizeReductionRate = progressStatus === 'onTrack' ? 0.8 : (progressStatus === 'atRisk' ? 0.5 : 0.2);
    const sizeReduced = Math.random() < sizeReductionRate;
    
    logs.push({
      date: getRandomDate(totalDays - i),
      weight: currentWeight,
      bmi: calculateBMI(currentWeight, height),
      meals: {
        breakfast: i % 3 === 0 ? 'Oats with fruits' : (i % 3 === 1 ? 'Eggs and toast' : 'Smoothie bowl'),
        lunch: i % 3 === 0 ? 'Rice and dal' : (i % 3 === 1 ? 'Chicken salad' : 'Quinoa bowl'),
        dinner: i % 3 === 0 ? 'Roti and vegetables' : (i % 3 === 1 ? 'Grilled fish' : 'Soup and salad')
      },
      foodIntake: foodIntake,
      attended: attended,
      sizeReduced: sizeReduced,
      totalCalories: foodIntake.reduce((sum, food) => sum + food.calories, 0)
    });
  }
  
  return logs;
};

export const generateSampleUsers = () => {
  const users = [];
  
  names.forEach((name, index) => {
    const gender = genders[index % genders.length];
    const age = 25 + Math.floor(Math.random() * 30); // Age between 25-55
    const height = gender === 'Male' ? 165 + Math.random() * 20 : 155 + Math.random() * 20;
    const startWeight = gender === 'Male' ? 75 + Math.random() * 25 : 65 + Math.random() * 20;
    const goalWeight = startWeight - (8 + Math.random() * 12); // Lose 8-20 kg
    const programType = index % 3 === 0 ? '90-day' : '60-day';
    const mealPlan = mealPlans[index % mealPlans.length];
    
    // Vary the days passed to create different stages
    let daysAgo;
    if (index < 4) daysAgo = 3 + Math.floor(Math.random() * 4); // Onboarding: 3-7 days
    else if (index < 8) daysAgo = 8 + Math.floor(Math.random() * 13); // Early Active: 8-21 days
    else if (index < 13) daysAgo = 22 + Math.floor(Math.random() * 23); // Mid Progress: 22-45 days
    else if (index < 17) daysAgo = 46 + Math.floor(Math.random() * 24); // Acceleration: 46-70 days
    else daysAgo = 71 + Math.floor(Math.random() * 19); // Final Phase: 71-90 days
    
    const progressStatus = statuses[index % statuses.length];
    const trainer = trainers[index % trainers.length];
    const logs = generateLogs(startWeight, goalWeight, daysAgo, progressStatus, height);
    const currentBMI = calculateBMI(logs[logs.length - 1].weight, height);
    
    // Calculate skipped classes
    const skippedClasses = logs.filter(log => !log.attended).length;
    
    users.push({
      name,
      gender,
      age,
      height: parseFloat(height.toFixed(1)),
      goalWeight: parseFloat(goalWeight.toFixed(1)),
      programType,
      mealPlan,
      trainer,
      progressStatus,
      startDate: getRandomDate(daysAgo),
      createdAt: getRandomDate(daysAgo),
      bmi: currentBMI,
      logs,
      skippedClasses,
      notes: [
        {
          text: progressStatus === 'onTrack' 
            ? 'Great progress! Keep it up!' 
            : progressStatus === 'atRisk' 
            ? 'Need to increase consistency' 
            : 'Requires immediate attention',
          date: getRandomDate(Math.floor(Math.random() * 7))
        }
      ]
    });
  });
  
  return users;
};
