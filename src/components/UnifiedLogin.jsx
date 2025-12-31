import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Dumbbell, Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import supabase from '../config/supabaseClient';

const UnifiedLogin = () => {
  const navigate = useNavigate();
  const { signIn, signUp } = useAuth();
  
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    role: 'user',
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isSignUp) {
        // Sign up with Supabase Auth
        const { data: authData, error: signUpError } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              name: formData.name,
              role: formData.role,
            },
            emailRedirectTo: 'https://afterburn.fit/weightloss/auth',
          },
        });

        if (signUpError) throw signUpError;

        // Create user record in database
        if (authData.user) {
          const { error: dbError } = await supabase
            .from('users')
            .insert([{
              id: authData.user.id,
              email: formData.email,
              name: formData.name,
              role: formData.role,
              tenant_id: formData.role === 'super_admin' ? null : undefined,
              created_at: new Date().toISOString(),
            }]);

          if (dbError) {
            console.error('Error creating user record:', dbError);
            // Don't throw - auth user is created, they can login after verification
          }
        }

        // Check if email confirmation is required
        if (authData.user && !authData.user.confirmed_at) {
          alert('Account created! Please check your email to verify your account. Check spam folder if you don\'t see it.');
        } else {
          alert('Account created successfully! You can now login.');
        }
        setIsSignUp(false);
      } else {
        // Sign in
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });

        if (signInError) {
          // Check if it's an email not confirmed error
          if (signInError.message.includes('Email not confirmed')) {
            setError('Please verify your email before logging in. Check your inbox and spam folder.');
            return;
          }
          throw signInError;
        }
        
        // Fetch user role and tenant from database
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('id, email, name, role, tenant_id')
          .eq('id', signInData.user.id)
          .single();

        if (userError) {
          // User exists in auth but not in users table - create it
          if (userError.code === 'PGRST116') {
            const { error: createError } = await supabase
              .from('users')
              .insert([{
                id: signInData.user.id,
                email: signInData.user.email,
                name: signInData.user.user_metadata?.name || 'User',
                role: signInData.user.user_metadata?.role || 'user',
                created_at: new Date().toISOString(),
              }]);

            if (createError) throw createError;

            // Fetch again
            const { data: newUserData, error: fetchError } = await supabase
              .from('users')
              .select('id, email, name, role, tenant_id')
              .eq('id', signInData.user.id)
              .single();

            if (fetchError) throw fetchError;
            
            // Route based on role
            routeByRole(newUserData);
          } else {
            throw userError;
          }
        } else {
          // Route based on role
          routeByRole(userData);
        }
      }
    } catch (err) {
      console.error('Auth error:', err);
      setError(err.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const routeByRole = (userData) => {
    switch (userData.role) {
      case 'super_admin':
        navigate('/weightloss/super-admin');
        break;
      case 'admin':
      case 'trainer':
        navigate('/weightloss/dashboard');
        break;
      case 'user':
        navigate(`/weightloss/user/${userData.id}`);
        break;
      default:
        navigate('/weightloss/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-2xl mb-4">
            <Dumbbell className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            {isSignUp ? 'Create Account' : 'Welcome Back'}
          </h1>
          <p className="text-gray-400">
            {isSignUp
              ? 'Sign up to start your fitness journey'
              : 'Sign in to continue your journey'}
          </p>
        </div>

        {/* Form */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
          {error && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-200">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {isSignUp && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required={isSignUp}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="John Doe"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength={6}
                  className="w-full pl-12 pr-12 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {isSignUp && (
                <p className="mt-1 text-xs text-gray-400">
                  Must be at least 6 characters
                </p>
              )}
            </div>

            {isSignUp && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  I am a
                </label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="user" className="bg-gray-800">User</option>
                  <option value="trainer" className="bg-gray-800">Trainer</option>
                  <option value="admin" className="bg-gray-800">Admin</option>
                </select>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-primary to-secondary text-white rounded-lg font-semibold hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  {isSignUp ? 'Creating Account...' : 'Signing In...'}
                </span>
              ) : (
                <span>{isSignUp ? 'Create Account' : 'Sign In'}</span>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError('');
              }}
              className="text-sm text-gray-300 hover:text-white transition"
            >
              {isSignUp ? (
                <>
                  Already have an account?{' '}
                  <span className="text-primary font-semibold">Sign In</span>
                </>
              ) : (
                <>
                  Don't have an account?{' '}
                  <span className="text-primary font-semibold">Sign Up</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Back to Home */}
        <div className="mt-6 text-center">
          <button
            onClick={() => navigate('/')}
            className="text-sm text-gray-400 hover:text-white transition"
          >
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default UnifiedLogin;
