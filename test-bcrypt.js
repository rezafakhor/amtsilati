const bcrypt = require('bcryptjs');

// Generate hash untuk admin123
const adminPassword = 'admin123';
const adminHash = bcrypt.hashSync(adminPassword, 10);
console.log('Admin Password:', adminPassword);
console.log('Admin Hash:', adminHash);
console.log('Verify Admin:', bcrypt.compareSync(adminPassword, adminHash));
console.log('');

// Generate hash untuk user123
const userPassword = 'user123';
const userHash = bcrypt.hashSync(userPassword, 10);
console.log('User Password:', userPassword);
console.log('User Hash:', userHash);
console.log('Verify User:', bcrypt.compareSync(userPassword, userHash));
console.log('');

// SQL statements
console.log('=== SQL UPDATE STATEMENTS ===');
console.log('');
console.log('-- Update Admin Password');
console.log(`UPDATE "User" SET password = '${adminHash}' WHERE email = 'admin@pawedaran.com';`);
console.log('');
console.log('-- Update User Password');
console.log(`UPDATE "User" SET password = '${userHash}' WHERE email = 'pesantren@example.com';`);
