/**
 * Execute Supabase Schema using pg (node-postgres)
 * Direct PostgreSQL connection
 */

import { config } from 'dotenv';
import { readFileSync } from 'fs';
import { join } from 'path';
import { Client } from 'pg';

config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const dbPassword = process.env.SUPABASE_DB_PASSWORD || '';
const projectRef = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];

if (!projectRef) {
  console.error('❌ Could not extract project ref');
  process.exit(1);
}

if (!dbPassword) {
  console.error('❌ SUPABASE_DB_PASSWORD not found in .env');
  process.exit(1);
}

// Supabase PostgreSQL connection details
const dbHost = `db.${projectRef}.supabase.co`;
const dbUser = 'postgres';
const dbName = 'postgres';
const dbPort = 5432;

async function executeSchema() {
  console.log('🚀 Executing Supabase Schema via PostgreSQL...\n');
  console.log(`📋 Project: ${projectRef}`);
  console.log(`📋 Host: ${dbHost}\n`);

  // Read schema file
  const schemaPath = join(process.cwd(), 'docs', 'SUPABASE_SCHEMA.sql');
  const schemaSQL = readFileSync(schemaPath, 'utf-8');

  // Create PostgreSQL client
  const client = new Client({
    host: dbHost,
    port: dbPort,
    user: dbUser,
    password: dbPassword,
    database: dbName,
    ssl: {
      rejectUnauthorized: false, // Supabase uses SSL
    },
  });

  try {
    // Connect to database
    console.log('📡 Connecting to database...');
    await client.connect();
    console.log('✅ Connected!\n');

    // Execute the entire SQL script at once
    // PostgreSQL can handle multiple statements separated by semicolons
    console.log('📋 Executing schema SQL...\n');

    try {
      // Remove comments but keep the structure
      const cleanSQL = schemaSQL
        .split('\n')
        .filter(line => {
          const trimmed = line.trim();
          return !trimmed.startsWith('--') && trimmed !== '';
        })
        .join('\n');

      // Execute the entire SQL script
      await client.query(cleanSQL);
      console.log('✅ Schema executed successfully!\n');
    } catch (error: any) {
      // Some errors are expected (e.g., IF NOT EXISTS)
      if (error.message.includes('already exists') || 
          error.message.includes('duplicate')) {
        console.log('⚠️  Some objects already exist (this is OK)\n');
      } else {
        console.error('❌ Error executing schema:', error.message);
        console.error('   Code:', error.code);
        throw error;
      }
    }

    console.log('='.repeat(60));

    // Verify tables were created
    console.log('\n🔍 Verifying tables...\n');
    const tablesQuery = `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
        AND table_name IN ('scores', 'best_scores', 'pending_commits', 'commit_logs')
      ORDER BY table_name;
    `;

    const result = await client.query(tablesQuery);
    
    if (result.rows.length > 0) {
      console.log('✅ Tables created:');
      result.rows.forEach(row => {
        console.log(`   - ${row.table_name}`);
      });
    } else {
      console.log('⚠️  No tables found. Check errors above.');
    }

    // Verify triggers
    console.log('\n🔍 Verifying triggers...\n');
    const triggersQuery = `
      SELECT trigger_name, event_object_table
      FROM information_schema.triggers
      WHERE trigger_name = 'trigger_update_best_score';
    `;

    const triggerResult = await client.query(triggersQuery);
    if (triggerResult.rows.length > 0) {
      console.log('✅ Trigger created: trigger_update_best_score');
    } else {
      console.log('⚠️  Trigger not found');
    }

    // Verify functions
    console.log('\n🔍 Verifying functions...\n');
    const functionsQuery = `
      SELECT routine_name
      FROM information_schema.routines
      WHERE routine_schema = 'public'
        AND routine_name = 'update_best_score';
    `;

    const functionResult = await client.query(functionsQuery);
    if (functionResult.rows.length > 0) {
      console.log('✅ Function created: update_best_score');
    } else {
      console.log('⚠️  Function not found');
    }

    console.log('\n✅ Schema execution completed!\n');

  } catch (error: any) {
    console.error('❌ Fatal error:', error.message);
    if (error.code) {
      console.error(`   Error code: ${error.code}`);
    }
    process.exit(1);
  } finally {
    await client.end();
    console.log('📡 Disconnected from database');
  }
}

executeSchema();

