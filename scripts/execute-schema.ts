/**
 * Execute Supabase Schema SQL
 * This script executes the schema SQL via Supabase REST API
 */

import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join } from 'path';

config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials');
  console.log('   Check NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function executeSchema() {
  console.log('🚀 Executing Supabase Schema...\n');

  // Read schema file
  const schemaPath = join(process.cwd(), 'docs', 'SUPABASE_SCHEMA.sql');
  let schemaSQL: string;

  try {
    schemaSQL = readFileSync(schemaPath, 'utf-8');
    console.log(`✅ Schema file loaded: ${schemaPath}`);
    console.log(`   Size: ${schemaSQL.length} characters\n`);
  } catch (error) {
    console.error('❌ Error reading schema file:', error);
    process.exit(1);
  }

  // Split SQL into individual statements
  // Remove comments and split by semicolons
  const statements = schemaSQL
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--') && !s.startsWith('/*'));

  console.log(`📋 Found ${statements.length} SQL statements to execute\n`);

  let successCount = 0;
  let errorCount = 0;

  // Execute each statement
  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i];
    
    // Skip empty statements
    if (!statement || statement.length < 10) continue;

    try {
      // Use RPC to execute SQL (if available) or use direct query
      // Note: Supabase doesn't have a direct SQL execution endpoint via JS client
      // We'll need to use the REST API or execute via psql
      
      // For now, let's try using the REST API with a custom function
      // Or we can use the Supabase Management API
      
      console.log(`[${i + 1}/${statements.length}] Executing statement...`);
      
      // Try to execute via REST API
      const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseServiceKey,
          'Authorization': `Bearer ${supabaseServiceKey}`,
        },
        body: JSON.stringify({ sql: statement }),
      });

      if (response.ok) {
        successCount++;
        console.log(`   ✅ Success`);
      } else {
        // Try alternative method - direct SQL execution might not be available
        // We'll need to use a different approach
        console.log(`   ⚠️  Direct execution not available, will provide manual steps`);
        errorCount++;
      }
    } catch (error: any) {
      // Supabase JS client doesn't support raw SQL execution
      // We need to use the dashboard or provide instructions
      console.log(`   ⚠️  Cannot execute via API: ${error.message}`);
      errorCount++;
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log(`✅ Success: ${successCount}`);
  console.log(`⚠️  Skipped: ${errorCount}`);
  console.log('='.repeat(60));

  if (errorCount > 0) {
    console.log('\n⚠️  Note: Supabase JS client cannot execute raw SQL directly.');
    console.log('   You need to execute the schema manually:');
    console.log('\n   1. Go to: https://supabase.com/dashboard');
    console.log('   2. Select your project');
    console.log('   3. Go to: SQL Editor');
    console.log('   4. Click: New Query');
    console.log('   5. Paste the content from: docs/SUPABASE_SCHEMA.sql');
    console.log('   6. Click: Run\n');
  }
}

// Alternative: Create a helper script that formats the SQL for easy copy-paste
async function generateSQLForCopy() {
  const schemaPath = join(process.cwd(), 'docs', 'SUPABASE_SCHEMA.sql');
  const schemaSQL = readFileSync(schemaPath, 'utf-8');
  
  console.log('\n📋 SQL Ready to Copy-Paste:\n');
  console.log('─'.repeat(60));
  console.log(schemaSQL);
  console.log('─'.repeat(60));
  console.log('\n💡 Copy the SQL above and paste it in Supabase SQL Editor\n');
}

// Since Supabase JS client doesn't support raw SQL execution,
// we'll provide the SQL formatted for easy copy-paste
generateSQLForCopy();

// Try to check if tables exist
async function checkTables() {
  console.log('\n🔍 Checking existing tables...\n');
  
  const tables = ['scores', 'best_scores', 'pending_commits', 'commit_logs'];
  
  for (const table of tables) {
    try {
      const { error } = await supabase.from(table).select('*').limit(1);
      
      if (error) {
        if (error.code === '42P01' || error.message.includes('does not exist')) {
          console.log(`   ❌ Table "${table}" does not exist`);
        } else {
          console.log(`   ⚠️  Table "${table}" exists but has issues: ${error.message}`);
        }
      } else {
        console.log(`   ✅ Table "${table}" exists`);
      }
    } catch (error: any) {
      console.log(`   ❌ Error checking "${table}": ${error.message}`);
    }
  }
}

checkTables().then(() => {
  console.log('\n✅ Schema check completed!');
  console.log('\n📝 Next steps:');
  console.log('   1. Copy the SQL above');
  console.log('   2. Go to Supabase SQL Editor');
  console.log('   3. Paste and Run');
  console.log('   4. Run this script again to verify\n');
});

