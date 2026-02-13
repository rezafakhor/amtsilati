-- Update pesantrenName untuk superadmin
UPDATE `User` 
SET `pesantrenName` = 'Al-Barkah'
WHERE `role` = 'SUPERADMIN' AND `email` = 'admin@pawedaran.com';

-- Check the result
SELECT id, email, name, pesantrenName, role 
FROM `User` 
WHERE `role` = 'SUPERADMIN';
