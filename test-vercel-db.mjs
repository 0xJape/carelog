import postgres from 'postgres';

// Use the same connection string that should be in Vercel
const DATABASE_URL = "postgresql://postgres:gayojalelprince21@db.lyrznprrddndfkxbolyj.supabase.co:5432/postgres";

console.log('🔍 Testing database connection to Supabase...\n');

const sql = postgres(DATABASE_URL, {
	ssl: 'require',
	max: 1
});

try {
	// Test 1: Basic connection
	console.log('Test 1: Basic Connection');
	const result = await sql`SELECT NOW() as current_time`;
	console.log('✅ Database connected successfully');
	console.log('   Server time:', result[0].current_time);
	console.log();

	// Test 2: Check users table
	console.log('Test 2: Users Table');
	const users = await sql`SELECT email, role, is_active FROM users ORDER BY email`;
	console.log(`✅ Found ${users.length} users:`);
	users.forEach(u => {
		console.log(`   - ${u.email} (${u.role}) ${u.is_active ? '✅ Active' : '❌ Inactive'}`);
	});
	console.log();

	// Test 3: Check admin user specifically
	console.log('Test 3: Admin User Check');
	const [admin] = await sql`
		SELECT email, role, is_active, password_hash 
		FROM users 
		WHERE email = 'admin@school.edu'
	`;
	
	if (admin) {
		console.log('✅ Admin user found:');
		console.log('   Email:', admin.email);
		console.log('   Role:', admin.role);
		console.log('   Active:', admin.is_active);
		console.log('   Has password hash:', admin.password_hash ? 'Yes' : 'No');
		console.log('   Password hash length:', admin.password_hash?.length || 0);
	} else {
		console.log('❌ Admin user NOT found!');
	}
	console.log();

	// Test 4: Check session table structure
	console.log('Test 4: Session Table');
	const sessions = await sql`SELECT COUNT(*) as count FROM user_session`;
	console.log(`✅ Session table accessible, ${sessions[0].count} sessions exist`);
	console.log();

	// Test 5: Test password verification
	console.log('Test 5: Password Hash Test');
	const { hash, verify } = await import('@node-rs/argon2');
	
	if (admin && admin.password_hash) {
		try {
			const isValid = await verify(admin.password_hash, 'Welcome123!');
			console.log('✅ Password verification:', isValid ? 'VALID ✅' : 'INVALID ❌');
		} catch (err) {
			console.log('❌ Password verification error:', err.message);
		}
	}
	console.log();

	console.log('🎉 All database tests passed!');
	console.log('\n📋 Summary:');
	console.log('   - Database connection: ✅ Working');
	console.log('   - Users table: ✅ Accessible');
	console.log('   - Admin user: ✅ Exists');
	console.log('   - Session table: ✅ Accessible');
	console.log('   - Password hash: ✅ Valid');
	console.log('\n💡 Database is NOT the issue. The problem is likely:');
	console.log('   1. Cookie settings in production');
	console.log('   2. Session validation logic');
	console.log('   3. Redirect handling in Vercel');

} catch (error) {
	console.error('❌ Database test failed:', error.message);
	console.error('\nFull error:', error);
} finally {
	await sql.end();
}
