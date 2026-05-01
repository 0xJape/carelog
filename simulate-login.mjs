import postgres from 'postgres';
import { verify } from '@node-rs/argon2';
import { sha256 } from '@oslojs/crypto/sha2';
import { encodeBase64url, encodeHexLowerCase } from '@oslojs/encoding';

const sql = postgres('postgresql://postgres:gayojalelprince21@db.lyrznprrddndfkxbolyj.supabase.co:5432/postgres', {
  ssl: 'require'
});

async function simulateLogin() {
  try {
    console.log('🔐 Simulating production login flow...\n');
    
    const email = 'admin@school.edu';
    const password = 'Welcome123!';
    
    // Step 1: Find user by email
    console.log('Step 1: Finding user by email...');
    const users = await sql`
      SELECT id, email, first_name, last_name, role, is_active, password_hash
      FROM users 
      WHERE email = ${email}
    `;
    
    if (users.length === 0) {
      console.log('❌ User not found');
      await sql.end();
      return;
    }
    
    const user = users[0];
    console.log('✅ User found:', user.email);
    
    if (!user.is_active) {
      console.log('❌ User is not active');
      await sql.end();
      return;
    }
    console.log('✅ User is active');
    
    // Step 2: Verify password
    console.log('\nStep 2: Verifying password...');
    const isValid = await verify(user.password_hash, password);
    if (!isValid) {
      console.log('❌ Invalid password');
      await sql.end();
      return;
    }
    console.log('✅ Password is valid');
    
    // Step 3: Update last login
    console.log('\nStep 3: Updating last login...');
    await sql`
      UPDATE users 
      SET last_login = ${new Date()}
      WHERE id = ${user.id}
    `;
    console.log('✅ Last login updated');
    
    // Step 4: Generate session token
    console.log('\nStep 4: Generating session token...');
    const bytes = crypto.getRandomValues(new Uint8Array(18));
    const token = encodeBase64url(bytes);
    console.log('✅ Token generated:', token.substring(0, 20) + '...');
    
    // Step 5: Create session
    console.log('\nStep 5: Creating session...');
    const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
    
    console.log('   Session ID:', sessionId.substring(0, 20) + '...');
    console.log('   Expires at:', expiresAt.toISOString());
    
    await sql`
      INSERT INTO user_session (id, user_id, expires_at)
      VALUES (${sessionId}, ${user.id}, ${expiresAt})
    `;
    console.log('✅ Session created in database');
    
    // Step 6: Verify session was created
    console.log('\nStep 6: Verifying session...');
    const sessions = await sql`
      SELECT s.id, s.user_id, s.expires_at, u.email
      FROM user_session s
      JOIN users u ON s.user_id = u.id
      WHERE s.id = ${sessionId}
    `;
    
    if (sessions.length === 0) {
      console.log('❌ Session not found in database!');
      await sql.end();
      return;
    }
    
    console.log('✅ Session verified in database');
    console.log('   User:', sessions[0].email);
    console.log('   Expires:', sessions[0].expires_at);
    
    // Step 7: Simulate session validation (what happens on next request)
    console.log('\nStep 7: Simulating session validation...');
    const validateSessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
    
    const validationResult = await sql`
      SELECT 
        s.id, s.user_id, s.expires_at,
        u.id as user_id, u.email, u.first_name, u.last_name, u.role
      FROM user_session s
      INNER JOIN users u ON s.user_id = u.id
      WHERE s.id = ${validateSessionId}
    `;
    
    if (validationResult.length === 0) {
      console.log('❌ Session validation failed - session not found');
      await sql.end();
      return;
    }
    
    const session = validationResult[0];
    const sessionExpired = Date.now() >= new Date(session.expires_at).getTime();
    
    if (sessionExpired) {
      console.log('❌ Session expired');
      await sql.end();
      return;
    }
    
    console.log('✅ Session validation successful!');
    console.log('   User:', session.email);
    console.log('   Role:', session.role);
    
    console.log('\n✅ Complete login flow simulation successful!');
    console.log('\n📝 Summary:');
    console.log('   - Database connection: ✅ Working');
    console.log('   - User authentication: ✅ Working');
    console.log('   - Session creation: ✅ Working');
    console.log('   - Session validation: ✅ Working');
    console.log('\n💡 The database is NOT the issue. The problem is likely:');
    console.log('   1. Cookie settings not working in production');
    console.log('   2. Vercel hasn\'t redeployed with the cookie fix yet');
    console.log('   3. Browser cache holding old cookies');
    
    await sql.end();
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
    await sql.end();
    process.exit(1);
  }
}

simulateLogin();
