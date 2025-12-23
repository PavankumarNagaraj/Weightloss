// Automated Database Setup Script for Subscription System
// This script will create all necessary tables in your Supabase database

import { supabase } from '../src/config/supabase.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function setupDatabase() {
  console.log('🚀 Starting Subscription System Database Setup...\n');

  try {
    // Read the SQL file
    const sqlPath = path.join(__dirname, '../database/subscription_tables.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');

    console.log('📄 SQL script loaded successfully');
    console.log('📊 Creating tables and indexes...\n');

    // Execute the SQL
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sqlContent });

    if (error) {
      console.error('❌ Error executing SQL:', error);
      
      // Try alternative method: split and execute statements
      console.log('\n🔄 Trying alternative method...\n');
      await executeSqlStatements(sqlContent);
    } else {
      console.log('✅ Database setup completed successfully!\n');
    }

    // Verify tables were created
    await verifyTables();

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    console.log('\n📝 Manual Setup Instructions:');
    console.log('1. Open Supabase Dashboard');
    console.log('2. Go to SQL Editor');
    console.log('3. Copy content from: database/subscription_tables.sql');
    console.log('4. Paste and run the script\n');
    process.exit(1);
  }
}

async function executeSqlStatements(sqlContent) {
  // Remove comments and split by semicolons
  const statements = sqlContent
    .split('\n')
    .filter(line => !line.trim().startsWith('--') && line.trim())
    .join('\n')
    .split(';')
    .filter(stmt => stmt.trim());

  console.log(`📝 Executing ${statements.length} SQL statements...\n`);

  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i].trim();
    if (!stmt) continue;

    try {
      console.log(`[${i + 1}/${statements.length}] Executing...`);
      const { error } = await supabase.rpc('exec_sql', { sql_query: stmt + ';' });
      
      if (error) {
        console.log(`⚠️  Warning: ${error.message}`);
      } else {
        console.log(`✅ Success`);
      }
    } catch (err) {
      console.log(`⚠️  Warning: ${err.message}`);
    }
  }

  console.log('\n✅ SQL execution completed\n');
}

async function verifyTables() {
  console.log('🔍 Verifying tables...\n');

  const tables = [
    'cafe_customers',
    'cafe_subscriptions',
    'cafe_subscription_payments'
  ];

  for (const table of tables) {
    try {
      const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });

      if (error) {
        console.log(`❌ ${table}: NOT FOUND`);
      } else {
        console.log(`✅ ${table}: EXISTS (${count || 0} rows)`);
      }
    } catch (err) {
      console.log(`❌ ${table}: ERROR - ${err.message}`);
    }
  }

  console.log('\n🎉 Setup verification complete!\n');
  console.log('📋 Next Steps:');
  console.log('1. Add Customers to navigation');
  console.log('2. Test customer management');
  console.log('3. Continue with Phase 2 components\n');
}

// Run the setup
setupDatabase();
