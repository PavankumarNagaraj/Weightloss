const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const SUPABASE_URL = 'https://capvowxxembnycdonghv.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNhcHZvd3h4ZW1ibnljZG9uZ2h2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTI3NzUwOSwiZXhwIjoyMDgwODUzNTA5fQ.mYDzucrg1MrN51BGZ5W09nL6ohrHv6j3-2xsA-m6G2E';

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

async function executeSQLFile(filename) {
  console.log(`\n📄 Executing: ${filename}`);
  const sql = fs.readFileSync(`./supabase_migrations/${filename}`, 'utf8');
  
  const { data, error } = await supabase.rpc('exec', { sql_query: sql });
  
  if (error) {
    console.log(`❌ Error: ${error.message}`);
    return false;
  }
  
  console.log(`✅ Success`);
  return true;
}

async function runQuery(sql) {
  const { data, error } = await supabase.rpc('exec', { sql_query: sql });
  
  if (error) {
    console.log(`❌ Error: ${error.message}`);
    return null;
  }
  
  return data;
}

async function main() {
  console.log('🚀 Starting Micronutrient Migration\n');
  console.log('=' .repeat(60));
  
  const files = [
    '00_add_micronutrient_columns.sql',
    'add_micronutrients_batch_1.sql',
    'add_micronutrients_batch_2.sql',
    'add_micronutrients_batch_3.sql',
    'add_micronutrients_batch_4.sql',
    'add_micronutrients_batch_5.sql',
    'add_micronutrients_batch_6_missing.sql',
    '99_add_micronutrients_to_dishes.sql'
  ];
  
  for (const file of files) {
    const success = await executeSQLFile(file);
    if (!success) {
      console.log(`\n❌ Migration stopped at ${file}`);
      process.exit(1);
    }
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('🔍 VERIFICATION RESULTS\n');
  
  // Query 1: nutrition_reference
  console.log('📊 nutrition_reference table:');
  const { data: nr_data, error: nr_error } = await supabase
    .from('nutrition_reference')
    .select('ingredient_name, vitamin_a_mcg', { count: 'exact' });
  
  if (!nr_error) {
    const total = nr_data.length;
    const with_micros = nr_data.filter(r => r.vitamin_a_mcg !== null).length;
    console.log(`   Total items: ${total}`);
    console.log(`   With micronutrients: ${with_micros}`);
    console.log(`   Coverage: ${((with_micros/total)*100).toFixed(1)}%`);
  }
  
  // Query 2: cafe_inventory
  console.log('\n📊 cafe_inventory table:');
  const { data: ci_data, error: ci_error } = await supabase
    .from('cafe_inventory')
    .select('name, vitamin_a_mcg, category', { count: 'exact' });
  
  if (!ci_error) {
    const total = ci_data.length;
    const with_micros = ci_data.filter(r => r.vitamin_a_mcg !== null).length;
    const without_micros = ci_data.filter(r => r.vitamin_a_mcg === null);
    
    console.log(`   Total items: ${total}`);
    console.log(`   With micronutrients: ${with_micros}`);
    console.log(`   Without micronutrients: ${without_micros.length}`);
    console.log(`   Coverage: ${((with_micros/total)*100).toFixed(1)}%`);
    
    if (without_micros.length > 0) {
      console.log('\n   Items without micronutrients (non-food items):');
      const grouped = {};
      without_micros.forEach(item => {
        if (!grouped[item.category]) grouped[item.category] = [];
        grouped[item.category].push(item.name);
      });
      
      Object.keys(grouped).sort().forEach(category => {
        console.log(`   ${category}: ${grouped[category].length} items`);
      });
    }
  }
  
  // Sample data
  console.log('\n📊 Sample micronutrient data:');
  const { data: sample, error: sample_error } = await supabase
    .from('nutrition_reference')
    .select('ingredient_name, vitamin_c_mg, calcium_mg, iron_mg')
    .in('ingredient_name', ['Apple', 'Tomatoes', 'Chicken Breast (cooked)', 'Spinach'])
    .not('vitamin_a_mcg', 'is', null);
  
  if (!sample_error && sample) {
    sample.forEach(item => {
      console.log(`   ${item.ingredient_name}: Vit C=${item.vitamin_c_mg}mg, Ca=${item.calcium_mg}mg, Fe=${item.iron_mg}mg`);
    });
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('✨ Migration Complete!\n');
}

main().catch(console.error);
