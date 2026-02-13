const bcrypt = require('bcryptjs');

// Generate hash untuk password admin123
const adminPassword = bcrypt.hashSync('admin123', 10);
console.log('\n=== PASSWORD HASHES ===\n');
console.log('Admin password (admin123):');
console.log(adminPassword);
console.log('\n');

// Generate hash untuk password user123
const userPassword = bcrypt.hashSync('user123', 10);
console.log('User password (user123):');
console.log(userPassword);
console.log('\n');

// Generate SQL untuk insert users
console.log('=== SQL INSERT STATEMENTS ===\n');
console.log(`-- Insert Admin User
INSERT INTO "User" (id, email, password, name, role, "createdAt", "updatedAt")
VALUES (
  'admin_${Date.now()}',
  'admin@pawedaran.com',
  '${adminPassword}',
  'Super Admin',
  'SUPERADMIN',
  NOW(),
  NOW()
);

-- Insert Sample User
INSERT INTO "User" (id, email, password, name, role, "pesantrenName", "createdAt", "updatedAt")
VALUES (
  'user_${Date.now()}',
  'pesantren@example.com',
  '${userPassword}',
  'Pesantren Al-Hikmah',
  'USER',
  'Pesantren Al-Hikmah',
  NOW(),
  NOW()
);
`);

console.log('\n✅ Copy SQL di atas dan jalankan di Supabase SQL Editor\n');
