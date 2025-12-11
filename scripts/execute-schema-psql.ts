/**
 * Execute Supabase Schema using direct PostgreSQL connection
 * Requires database password from Supabase dashboard
 */

import { config } from 'dotenv';
import { readFileSync } from 'fs';
import { join } from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const dbPassword = process.env.SUPABASE_DB_PASSWORD || '';
const projectRef = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];

if (!projectRef) {
  console.error('❌ Could not extract project ref');
  process.exit(1);
}

// Supabase PostgreSQL connection string format:
// postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres
const dbHost = `db.${projectRef}.supabase.co`;
const dbUser = 'postgres';
const dbName = 'postgres';
const dbPort = 5432;

async function executeSchema() {
  console.log('🚀 Executing Schema via PostgreSQL connection...\n');
  console.log(`📋 Project: ${projectRef}`);
  console.log(`📋 Host: ${dbHost}\n`);

  if (!dbPassword) {
    console.error('❌ SUPABASE_DB_PASSWORD not found in .env');
    console.log('\n📋 To get your database password:');
    console.log('   1. Go to: https://supabase.com/dashboard/project/' + projectRef);
    console.log('   2. Go to: Settings → Database');
    console.log('   3. Copy the database password');
    console.log('   4. Add to .env: SUPABASE_DB_PASSWORD=your-password\n');
    process.exit(1);
  }

  // Read schema file
  const schemaPath = join(process.cwd(), 'docs', 'SUPABASE_SCHEMA.sql');
  const schemaSQL = readFileSync(schemaPath, 'utf-8');

  // Check if psql is available
  try {
    await execAsync('which psql');
  } catch (error) {
    console.error('❌ psql (PostgreSQL client) not found');
    console.log('\n📋 Install PostgreSQL client:');
    console.log('   macOS: brew install postgresql');
    console.log('   Linux: sudo apt-get install postgresql-client');
    console.log('   Or use Docker: docker run -i postgres psql ...\n');
    process.exit(1);
  }

  // Execute SQL using psql
  const connectionString = `postgresql://${dbUser}:${encodeURIComponent(dbPassword)}@${dbHost}:${dbPort}/${dbName}`;
  
  console.log('📋 Executing schema SQL...\n');
  
  try {
    const { stdout, stderr } = await execAsync(
      `psql "${connectionString}" -c "${schemaSQL.replace(/"/g, '\\"').replace(/\n/g, ' ')}"`,
      { maxBuffer: 10 * 1024 * 1024 } // 10MB buffer
    );

    if (stderr && !stderr.includes('NOTICE')) {
      console.error('⚠️  Warnings:', stderr);
    }

    if (stdout) {
      console.log(stdout);
    }

    console.log('✅ Schema executed successfully!\n');
    
    // Verify tables
    console.log('🔍 Verifying tables...\n');
    const verifyQuery = `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('scores', 'best_scores', 'pending_commits', 'commit_logs') ORDER BY table_name;`;
    
    const { stdout: verifyOutput } = await execAsync(
      `psql "${connectionString}" -c "${verifyQuery}"`
    );

    console.log(verifyOutput);
    
  } catch (error: any) {
    console.error('❌ Error executing schema:', error.message);
    if (error.stderr) {
      console.error('Error details:', error.stderr);
    }
    process.exit(1);
  }
}

// Alternative: Execute SQL file directly
async function executeSchemaFile() {
  if (!dbPassword) {
    console.error('❌ SUPABASE_DB_PASSWORD required');
    return;
  }

  const schemaPath = join(process.cwd(), 'docs', 'SUPABASE_SCHEMA.sql');
  const connectionString = `postgresql://${dbUser}:${encodeURIComponent(dbPassword)}@${dbHost}:${dbPort}/${dbName}`;

  console.log('📋 Executing schema from file...\n');

  try {
    const { stdout, stderr } = await execAsync(
      `psql "${connectionString}" -f "${schemaPath}"`,
      { maxBuffer: 10 * 1024 * 1024 }
    );

    if (stderr && !stderr.includes('NOTICE')) {
      console.error('⚠️  Warnings:', stderr);
    }

    console.log(stdout);
    console.log('✅ Schema executed successfully!\n');
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    if (error.stderr) {
      console.error('Error details:', error.stderr);
    }
  }
}

// Try file execution first (cleaner)
executeSchemaFile().catch(() => {
  console.log('\n⚠️  File execution failed, trying direct SQL...\n');
  executeSchema();
});

