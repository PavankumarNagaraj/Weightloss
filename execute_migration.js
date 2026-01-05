const fs = require('fs');
const https = require('https');

const SUPABASE_URL = 'https://capvowxxembnycdonghv.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNhcHZvd3h4ZW1ibnljZG9uZ2h2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTI3NzUwOSwiZXhwIjoyMDgwODUzNTA5fQ.mYDzucrg1MrN51BGZ5W09nL6ohrHv6j3-2xsA-m6G2E';

async function executeSQL(sql) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({ query: sql });
    
    const options = {
      hostname: 'capvowxxembnycdonghv.supabase.co',
      port: 443,
      path: '/rest/v1/rpc/query',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'Content-Length': data.length
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve({ success: true, data: body });
        } else {
          resolve({ success: false, error: body, statusCode: res.statusCode });
        }
      });
    });

    req.on('error', (e) => reject(e));
    req.write(data);
    req.end();
  });
}

async function runMigration() {
  console.log('🚀 Starting micronutrient migration...\n');
  
  const migrationFile = './supabase_migrations/RUN_THIS_ONCE.sql';
  
  if (!fs.existsSync(migrationFile)) {
    console.error('❌ Migration file not found:', migrationFile);
    process.exit(1);
  }
  
  const sql = fs.readFileSync(migrationFile, 'utf8');
  console.log('📄 Loaded migration file:', migrationFile);
  console.log('📊 SQL size:', sql.length, 'characters\n');
  
  console.log('⏳ Executing migration...');
  const result = await executeSQL(sql);
  
  if (result.success) {
    console.log('✅ Migration executed successfully!\n');
  } else {
    console.log('❌ Migration failed:');
    console.log('Status:', result.statusCode);
    console.log('Error:', result.error);
    process.exit(1);
  }
  
  // Run verification queries
  console.log('🔍 Running verification queries...\n');
  
  const verifyQueries = [
    {
      name: 'nutrition_reference coverage',
      sql: `SELECT COUNT(*) as total, COUNT(CASE WHEN vitamin_a_mcg IS NOT NULL THEN 1 END) as with_micros FROM nutrition_reference`
    },
    {
      name: 'cafe_inventory coverage',
      sql: `SELECT COUNT(*) as total, COUNT(CASE WHEN vitamin_a_mcg IS NOT NULL THEN 1 END) as with_micros FROM cafe_inventory`
    }
  ];
  
  for (const query of verifyQueries) {
    console.log(`📊 ${query.name}:`);
    const result = await executeSQL(query.sql);
    if (result.success) {
      console.log(result.data);
    } else {
      console.log('Error:', result.error);
    }
    console.log('');
  }
  
  console.log('✨ Migration complete!');
}

runMigration().catch(console.error);
