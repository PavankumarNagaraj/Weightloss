// Storage Sync Service
// Syncs localStorage data to Supabase Storage for cron job access

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

let supabase = null;

// Initialize Supabase client
const getSupabaseClient = () => {
  if (!supabase && supabaseUrl && supabaseAnonKey) {
    supabase = createClient(supabaseUrl, supabaseAnonKey);
  }
  return supabase;
};

// Sync all cafe data to Supabase Storage
export const syncCafeDataToStorage = async () => {
  const client = getSupabaseClient();
  
  if (!client) {
    console.warn('Supabase not configured, skipping storage sync');
    return { success: false, error: 'Supabase not configured' };
  }

  try {
    // Get data from localStorage
    const orders = JSON.parse(localStorage.getItem('cafe_orders') || '[]');
    const inventory = JSON.parse(localStorage.getItem('cafe_inventory') || '[]');
    const expenses = JSON.parse(localStorage.getItem('cafe_expenses') || '[]');
    const purchases = JSON.parse(localStorage.getItem('cafe_purchases') || '[]');

    console.log('Syncing data to Supabase Storage...', {
      orders: orders.length,
      inventory: inventory.length,
      expenses: expenses.length,
      purchases: purchases.length,
    });

    // Upload to Supabase Storage (upsert = true to overwrite)
    const results = await Promise.allSettled([
      client.storage
        .from('cafe-data')
        .upload('orders.json', JSON.stringify(orders), { 
          contentType: 'application/json',
          upsert: true 
        }),
      client.storage
        .from('cafe-data')
        .upload('inventory.json', JSON.stringify(inventory), { 
          contentType: 'application/json',
          upsert: true 
        }),
      client.storage
        .from('cafe-data')
        .upload('expenses.json', JSON.stringify(expenses), { 
          contentType: 'application/json',
          upsert: true 
        }),
      client.storage
        .from('cafe-data')
        .upload('purchases.json', JSON.stringify(purchases), { 
          contentType: 'application/json',
          upsert: true 
        }),
    ]);

    // Check for errors
    const errors = results.filter(r => r.status === 'rejected');
    if (errors.length > 0) {
      console.error('Some files failed to sync:', errors);
    }

    const successful = results.filter(r => r.status === 'fulfilled').length;
    console.log(`Successfully synced ${successful}/4 files to Supabase Storage`);

    return { 
      success: successful === 4, 
      synced: successful,
      total: 4,
      errors: errors.length > 0 ? errors : null
    };
  } catch (error) {
    console.error('Error syncing to Supabase Storage:', error);
    return { success: false, error: error.message };
  }
};

// Auto-sync on data changes (debounced)
let syncTimeout = null;
export const scheduleSyncToStorage = () => {
  // Clear existing timeout
  if (syncTimeout) {
    clearTimeout(syncTimeout);
  }

  // Schedule sync after 5 seconds of inactivity
  syncTimeout = setTimeout(() => {
    syncCafeDataToStorage();
  }, 5000);
};

// Immediate sync (for important operations)
export const syncNow = async () => {
  if (syncTimeout) {
    clearTimeout(syncTimeout);
  }
  return await syncCafeDataToStorage();
};
