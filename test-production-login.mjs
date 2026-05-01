import postgres from 'postgres';
import { verify } from '@node-rs/argon2';

const sql = postgres('postgresql://postgres:gayojalelprince21@db.lyrznprrddndfkxbolyj.supabase.co:5432/postgres', {
  ssl: 'require'
});

async function testLogin() {
  try {
    console.log('🔍 Testing production database connection...\n');
    
    // Test 1: Check if users table exists
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'users'
    `;
    console.log('✅ Users table exists:', tables.length > 0);
    
    // Test 2: Check if admin user exists (using snake_case column names)
    const users = await sql`
      SELECT id, email, first_name, last_name, role, is_active, password_hash
      FROM users 
      WHERE email = 'admin@school.edu'
    `;
    
    if (users.length === 0) {
      console.log('❌ Admin user NOT found!');
      await sql.end();
      return;
    }
    
    console.log('✅ Admin user found:');
    console.log('   Email:', users[0].email);
    console.log('   Name:', users[0].first_name, users[0].last_name);
    console.log('   Role:', users[0].role);
    console.log('   Active:', users[0].is_active);
    console.log('   Password hash length:', users[0].password_hash?.length || 0);
    
    // Test 3: Verify password
    const testPassword = 'Welcome123!';
    const isValid = await verify(users[0].password_hash, testPassword);
    console.log('\n🔐 Password verification:', isValid ? '✅ VALID' : '❌ INVALID');
    
    // Test 4: Check what session table name exists
    const sessionTables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name LIKE '%session%'
    `;
    console.log('\n📋 Session tables found:');
    sessionTables.forEach(t => console.log('   -', t.table_name));
    
    // Test 5: Check if user_session table structure is correct
    if (sessionTables.some(t => t.table_name === 'user_session')) {
      const sessionColumns = await sql`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'user_session'
        ORDER BY ordinal_position
      `;
      console.log('\n📊 user_session table structure:');
      sessionColumns.forEach(col => {
        console.log(`   ${col.column_name}: ${col.data_type}`);
      });
      
      const sessions = await sql`
        SELECT COUNT(*) as count FROM user_session
      `;
      console.log('\n📈 Sessions in database:', sessions[0].count);
    }
    
    await sql.end();
    console.log('\n✅ All database checks completed');
    
  } catch (error) {
    console.error('❌ Database error:', error.message);
    console.error('Stack:', error.stack);
    await sql.end();
    process.exit(1);
  }
}

testLogin();
