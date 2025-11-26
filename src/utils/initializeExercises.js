import { generateComprehensiveExercises } from '../data/comprehensiveExercises';

// Initialize exercise library in localStorage
export const initializeExerciseLibrary = () => {
  const existingExercises = localStorage.getItem('weightloss_exercises');
  
  if (!existingExercises) {
    // Use comprehensive exercise library with 185+ exercises
    const initialExercises = generateComprehensiveExercises();

    localStorage.setItem('weightloss_exercises', JSON.stringify(initialExercises));
    console.log('✅ Exercise library initialized with', initialExercises.length, 'exercises');
  }

  // Initialize empty exercise groups if not exists
  if (!localStorage.getItem('weightloss_exercise_groups')) {
    localStorage.setItem('weightloss_exercise_groups', JSON.stringify([]));
  }

  // Initialize empty weekly assignments if not exists
  if (!localStorage.getItem('weightloss_weekly_assignments')) {
    localStorage.setItem('weightloss_weekly_assignments', JSON.stringify([]));
  }
};
