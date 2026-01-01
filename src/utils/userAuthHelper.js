import supabase from '../config/supabaseClient';

/**
 * Generate a temporary password for new users
 * Format: First3Letters + Last4Digits + !
 * Example: John with phone 9876543210 -> Joh3210!
 */
export const generateTemporaryPassword = (name, phone) => {
  const namePrefix = name.substring(0, 3).toLowerCase();
  const phoneSuffix = phone.slice(-4);
  return `${namePrefix}${phoneSuffix}!`;
};

/**
 * Create Supabase auth account for a new user
 * @param {Object} userData - User data including email, name, phone
 * @returns {Object} - { success, authUserId, password, error }
 */
export const createSupabaseAuthUser = async (userData) => {
  try {
    const { email, name, phone } = userData;
    
    // Validate email
    if (!email || !email.includes('@')) {
      throw new Error('Valid email is required for user creation');
    }

    // Generate temporary password
    const tempPassword = generateTemporaryPassword(name, phone || '0000');

    // Create auth user in Supabase
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: email,
      password: tempPassword,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        name: name,
        phone: phone,
        role: 'user'
      }
    });

    if (authError) {
      // If admin API not available, use regular signup
      const { data: signupData, error: signupError } = await supabase.auth.signUp({
        email: email,
        password: tempPassword,
        options: {
          data: {
            name: name,
            phone: phone,
            role: 'user'
          }
        }
      });

      if (signupError) throw signupError;

      return {
        success: true,
        authUserId: signupData.user?.id,
        password: tempPassword,
        message: 'User created successfully. Email verification may be required.'
      };
    }

    return {
      success: true,
      authUserId: authData.user?.id,
      password: tempPassword,
      message: 'User created successfully with auto-confirmed email.'
    };

  } catch (error) {
    console.error('Error creating Supabase auth user:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Create or update user in users table
 * @param {Object} userData - Complete user data
 * @param {string} authUserId - Supabase auth user ID
 */
export const syncUserToDatabase = async (userData, authUserId) => {
  try {
    const { error } = await supabase
      .from('users')
      .upsert({
        id: authUserId,
        email: userData.email,
        name: userData.name,
        phone: userData.phone,
        role: 'user',
        tenant_id: userData.tenant_id || null,
        start_weight: userData.startWeight,
        current_weight: userData.currentWeight,
        goal_weight: userData.goalWeight,
        height: userData.height,
        age: userData.age,
        gender: userData.gender,
        meal_plan: userData.mealPlan,
        workout_type: userData.workoutType,
        batch_id: userData.batchId,
        trainer_id: userData.trainerId,
        subscription_status: 'active',
        subscription_start_date: userData.subscriptionStartDate || new Date().toISOString().split('T')[0],
        subscription_end_date: userData.subscriptionEndDate,
        subscription_amount: userData.subscriptionAmount,
        start_date: new Date().toISOString().split('T')[0],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'id'
      });

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error('Error syncing user to database:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Send login credentials to user via email/SMS
 * @param {Object} userData - User data
 * @param {string} password - Temporary password
 */
export const sendLoginCredentials = async (userData, password) => {
  // TODO: Implement email/SMS sending
  // For now, just log the credentials
  console.log('='.repeat(50));
  console.log('NEW USER LOGIN CREDENTIALS');
  console.log('='.repeat(50));
  console.log(`Name: ${userData.name}`);
  console.log(`Email: ${userData.email}`);
  console.log(`Password: ${password}`);
  console.log(`Login URL: https://afterburn.fit/weightloss/auth`);
  console.log('='.repeat(50));
  console.log('⚠️  Please share these credentials with the user');
  console.log('⚠️  User should change password after first login');
  console.log('='.repeat(50));

  return {
    success: true,
    message: 'Credentials logged to console. Implement email/SMS sending.'
  };
};

/**
 * Complete user creation flow with Supabase Auth
 * @param {Object} userData - User data
 * @returns {Object} - { success, user, password, message }
 */
export const createUserWithAuth = async (userData) => {
  try {
    // Step 1: Create Supabase auth account
    const authResult = await createSupabaseAuthUser(userData);
    
    if (!authResult.success) {
      return {
        success: false,
        error: authResult.error
      };
    }

    // Step 2: Sync to users table
    const dbResult = await syncUserToDatabase(userData, authResult.authUserId);
    
    if (!dbResult.success) {
      return {
        success: false,
        error: `Auth created but database sync failed: ${dbResult.error}`
      };
    }

    // Step 3: Send credentials
    await sendLoginCredentials(userData, authResult.password);

    return {
      success: true,
      userId: authResult.authUserId,
      password: authResult.password,
      message: 'User created successfully with Supabase authentication'
    };

  } catch (error) {
    console.error('Error in complete user creation:', error);
    return {
      success: false,
      error: error.message
    };
  }
};
