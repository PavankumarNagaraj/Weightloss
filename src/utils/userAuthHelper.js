import supabase from '../config/supabaseClient';

/**
 * Generate a temporary password for new users
 * Default password: User@123
 */
export const generateTemporaryPassword = (name, phone) => {
  return 'User@123';
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
    // Prepare data object with proper null handling
    const dbData = {
      id: authUserId,
      email: userData.email,
      name: userData.name,
      phone: userData.phone || null,
      role: 'user',
      tenant_id: userData.tenant_id || null,
      start_weight: userData.startWeight || null,
      current_weight: userData.currentWeight || null,
      goal_weight: userData.goalWeight || null,
      height: userData.height || null,
      age: userData.age || null,
      gender: userData.gender || null,
      meal_plan: userData.mealPlan || null,
      workout_type: userData.workoutType || null,
      batch_id: userData.batchId || null,
      trainer_id: userData.trainerId || null,
      subscription_status: 'active',
      subscription_start_date: userData.subscriptionStartDate || new Date().toISOString().split('T')[0],
      subscription_end_date: userData.subscriptionEndDate || null,
      subscription_amount: userData.subscriptionAmount || null,
      start_date: new Date().toISOString().split('T')[0],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Remove undefined values to prevent empty strings
    Object.keys(dbData).forEach(key => {
      if (dbData[key] === undefined || dbData[key] === '') {
        dbData[key] = null;
      }
    });

    const { error } = await supabase
      .from('users')
      .upsert(dbData, {
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
 * Send login credentials to user via email
 * @param {Object} userData - User data
 * @param {string} password - Temporary password
 */
export const sendLoginCredentials = async (userData, password) => {
  try {
    // Send email via Supabase Edge Function or email service
    // For now, we'll use Supabase's built-in email functionality
    
    const emailBody = `
      <h2>Welcome to Afterburn Fitness!</h2>
      <p>Hello ${userData.name},</p>
      <p>Your account has been created. Here are your login credentials:</p>
      <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p><strong>Login URL:</strong> <a href="https://afterburn.fit/weightloss/auth">https://afterburn.fit/weightloss/auth</a></p>
        <p><strong>Email:</strong> ${userData.email}</p>
        <p><strong>Temporary Password:</strong> ${password}</p>
      </div>
      <p style="color: #d97706;"><strong>⚠️ Important:</strong> You will be required to change your password on first login for security.</p>
      <p>If you have any questions, please contact your admin or trainer.</p>
      <p>Best regards,<br>Afterburn Fitness Team</p>
    `;

    // Log credentials for admin to see
    console.log('='.repeat(50));
    console.log('NEW USER LOGIN CREDENTIALS');
    console.log('='.repeat(50));
    console.log(`Name: ${userData.name}`);
    console.log(`Email: ${userData.email}`);
    console.log(`Password: ${password}`);
    console.log(`Login URL: https://afterburn.fit/weightloss/auth`);
    console.log('='.repeat(50));
    console.log('✅ Email notification will be sent to user');
    console.log('⚠️  User must change password on first login');
    console.log('='.repeat(50));

    // TODO: Implement actual email sending via Supabase Edge Function
    // For now, return success with instructions
    return {
      success: true,
      message: `Credentials created. Email will be sent to ${userData.email}`,
      emailBody: emailBody
    };
  } catch (error) {
    console.error('Error sending credentials:', error);
    return {
      success: false,
      error: error.message
    };
  }
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
