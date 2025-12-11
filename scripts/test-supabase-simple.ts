import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

console.log('🧪 Testing Supabase Connection...\n');
console.log('URL:', supabaseUrl ? '✅ Set' : '❌ Missing');
console.log('Anon Key:', supabaseAnonKey ? '✅ Set' : '❌ Missing');
console.log('Service Key:', supabaseServiceKey ? '✅ Set' : '❌ Missing');
console.log('');

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing required Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);
const supabaseAdmin = supabaseServiceKey ? createClient(supabaseUrl, supabaseServiceKey) : null;

// Test connection
async function test() {
  console.log('📡 Testing connection...');
  try {
    const { error } = await supabase.from('scores').select('count').limit(1);
    
    if (error) {
      if (error.code === '42P01' || error.message.includes('does not exist') || error.message.includes('schema cache')) {
        console.log('⚠️  Table "scores" does not exist yet');
        console.log('');
        console.log('📋 NEXT STEP: Execute the schema SQL');
        console.log('   1. Go to: https://supabase.com/dashboard');
        console.log('   2. Select your project');
        console.log('   3. Go to: SQL Editor (left menu)');
        console.log('   4. Click: New Query');
        console.log('   5. Open file: docs/SUPABASE_SCHEMA.sql');
        console.log('   6. Copy ALL content and paste in SQL Editor');
        console.log('   7. Click: Run (or Ctrl+Enter)');
        console.log('');
        console.log('✅ Connection is working! Just need to create tables.');
      } else {
        console.log('❌ Error:', error.message);
      }
    } else {
      console.log('✅ Connection successful! Tables exist.');
    }
  } catch (err: any) {
    console.error('❌ Connection failed:', err.message);
  }
}

test();
