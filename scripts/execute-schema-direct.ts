/**
 * Execute Supabase Schema SQL directly via REST API
 * Uses Supabase REST API to execute SQL statements
 */

import { config } from 'dotenv';
import { readFileSync } from 'fs';
import { join } from 'path';

config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

// Extract project ref
const projectRef = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];

if (!projectRef) {
  console.error('❌ Could not extract project ref');
  process.exit(1);
}

async function executeSQL(sql: string) {
  // Supabase allows executing SQL via REST API using rpc or direct query
  // We'll use the PostgREST API with the service role key
  
  try {
    // Split SQL into individual statements
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--') && !s.match(/^\/\*/));

    console.log(`📋 Executing ${statements.length} SQL statements...\n`);

    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (!statement || statement.length < 10) continue;

      try {
        // Use Supabase REST API to execute SQL
        // Note: Supabase PostgREST doesn't support raw SQL execution directly
        // We need to use the Management API or create a function
        
        // Alternative: Use Supabase's REST API with a custom RPC function
        // But for schema creation, we need to use the Management API
        
        // Try using the Supabase REST API endpoint for SQL execution
        const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': supabaseServiceKey,
            'Authorization': `Bearer ${supabaseServiceKey}`,
            'Prefer': 'return=representation',
          },
          body: JSON.stringify({ query: statement }),
        });

        if (response.ok) {
          successCount++;
          console.log(`[${i + 1}/${statements.length}] ✅ Success`);
        } else {
          const errorText = await response.text();
          // If exec_sql doesn't exist, we'll need another approach
          if (response.status === 404) {
            console.log(`[${i + 1}/${statements.length}] ⚠️  RPC function not available`);
            console.log('   Using alternative method...');
            
            // Try direct SQL execution via Management API
            // This requires the Management API access token
            errorCount++;
          } else {
            console.log(`[${i + 1}/${statements.length}] ❌ Error: ${response.status} ${errorText.substring(0, 100)}`);
            errorCount++;
          }
        }
      } catch (error: any) {
        console.log(`[${i + 1}/${statements.length}] ❌ Error: ${error.message}`);
        errorCount++;
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log(`✅ Success: ${successCount}`);
    console.log(`⚠️  Errors: ${errorCount}`);
    console.log('='.repeat(60));

    return { successCount, errorCount };
  } catch (error: any) {
    console.error('❌ Fatal error:', error.message);
    throw error;
  }
}

async function executeViaManagementAPI() {
  console.log('🚀 Executing Schema via Supabase API...\n');
  console.log(`📋 Project: ${projectRef}\n`);

  // Read schema file
  const schemaPath = join(process.cwd(), 'docs', 'SUPABASE_SCHEMA.sql');
  const schemaSQL = readFileSync(schemaPath, 'utf-8');

  // Try to execute via Supabase REST API
  // Since Supabase doesn't allow raw SQL via REST API, we'll need to use
  // the Management API or create a helper function
  
  // For now, let's try using the Supabase client's ability to execute SQL
  // via a custom RPC function or direct connection
  
  console.log('⚠️  Supabase REST API does not support raw SQL execution.');
  console.log('   Attempting alternative methods...\n');

  // Try using Supabase Management API
  // This requires an access token from Supabase dashboard
  const accessToken = process.env.SUPABASE_ACCESS_TOKEN;
  
  if (!accessToken) {
    console.log('📋 Management API token not found.');
    console.log('   Using Supabase client with service role key...\n');
    
    // Use the Supabase JS client to execute SQL
    // Note: The JS client also doesn't support raw SQL, but we can try
    // using the REST API with a different approach
    
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Supabase JS client doesn't support raw SQL execution
    // We need to use the Management API or execute manually
    console.log('❌ Cannot execute raw SQL via Supabase JS client.');
    console.log('   The Supabase REST API and JS client do not support raw SQL execution.');
    console.log('   This is a security feature.\n');
    
    console.log('📋 Please execute the SQL manually:');
    console.log('   1. Go to: https://supabase.com/dashboard/project/' + projectRef + '/sql/new');
    console.log('   2. Paste the SQL from: docs/SUPABASE_SCHEMA.sql');
    console.log('   3. Click: Run\n');
    
    return;
  }

  // If we have access token, try Management API
  console.log('🔑 Using Management API...\n');
  
  // Management API endpoint for executing SQL
  const managementUrl = `https://api.supabase.com/v1/projects/${projectRef}/database/query`;
  
  try {
    const response = await fetch(managementUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ query: schemaSQL }),
    });

    if (response.ok) {
      const result = await response.json();
      console.log('✅ Schema executed successfully!');
      console.log(result);
    } else {
      const error = await response.text();
      console.error('❌ Error executing schema:', error);
    }
  } catch (error: any) {
    console.error('❌ Error:', error.message);
  }
}

// Main execution
executeViaManagementAPI();

