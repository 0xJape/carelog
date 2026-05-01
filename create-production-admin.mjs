import postgres from 'postgres';
import { hash } from '@node-rs/argon2';

// Use your production DATABASE_URL from Vercel
const DATABASE_URL = 'postgresql://postgres:gayojalelprince21@db.lyrznprrddndfkxbolyj.supabase.co:5432/postgres';

const sql = postgres(DATABASE_URL);

async function createAdminUser() {
  try {
    console.log('Connecting to production database...');
    
    // Check if users table exists
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'users'
    `;
    
    if (tables.length === 0) {
      console.log('❌ Users table does not exist. You need to run database migrations first.');
      console.log('Run: pnpm drizzle-kit push');
      await sql.end();
      return;
    }
    
    console.log('✅ Users table exists');
    
    // Check if admin user already exists
    const existingUser = await sql`
      SELECT * FROM users WHERE email = 'admin@school.edu'
    `;
    
    if (existingUser.length > 0) {
      console.log('✅ Admin user already exists');
      console.log('Email:', existingUser[0].email);
      console.log('Role:', existingUser[0].role);
      
      // Update password to Welcome123!
      const passwordHash = await hash('Welcome123!', {
        memoryCost: 19456,
        timeCost: 2,
        outputLen: 32,
        parallelism: 1
      });
      
      await sql`
        UPDATE users 
        SET password_hash = ${passwordHash}
        WHERE email = 'admin@school.edu'
      `;
      
      console.log('✅ Password reset to: Welcome123!');
    } else {
      console.log('Creating admin user...');
      
      const passwordHash = await hash('Welcome123!', {
        memoryCost: 19456,
        timeCost: 2,
        outputLen: 32,
        parallelism: 1
      });
      
      await sql`
        INSERT INTO users (id, email, password_hash, role, first_name, last_name, created_at)
        VALUES (
          gen_random_uuid(),
          'admin@school.edu',
          ${passwordHash},
          'admin',
          'Admin',
          'User',
          NOW()
        )
      `;
      
      console.log('✅ Admin user created successfully!');
      console.log('Email: admin@school.edu');
      console.log('Password: Welcome123!');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await sql.end();
  }
}

createAdminUser();
