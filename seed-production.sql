-- ============================================
-- SEED DATA PRODUCTION - AMTSILATI PAWEDARAN
-- ============================================
-- Run this in Supabase SQL Editor
-- This will create complete dummy data for testing

-- Clean up existing data (optional - comment out if you want to keep existing data)
TRUNCATE TABLE "diklatregistration" CASCADE;
TRUNCATE TABLE "diklatformfield" CASCADE;
TRUNCATE TABLE "diklatdate" CASCADE;
TRUNCATE TABLE "diklat" CASCADE;
TRUNCATE TABLE "agenda" CASCADE;
TRUNCATE TABLE "partner" CASCADE;
TRUNCATE TABLE "debtpayment" CASCADE;
TRUNCATE TABLE "debt" CASCADE;
TRUNCATE TABLE "orderitem" CASCADE;
TRUNCATE TABLE "order" CASCADE;
TRUNCATE TABLE "promo" CASCADE;
TRUNCATE TABLE "stocklog" CASCADE;
TRUNCATE TABLE "packageitem" CASCADE;
TRUNCATE TABLE "package" CASCADE;
TRUNCATE TABLE "product" CASCADE;
TRUNCATE TABLE "Address" CASCADE;
TRUNCATE TABLE "User" CASCADE;

-- ============================================
-- 1. USERS
-- ============================================

-- Admin User (password: admin123)
INSERT INTO "User" (id, email, password, name, role, "createdAt", "updatedAt")
VALUES (
  'admin_883534399',
  'admin@pawedaran.com',
  '$2a$10$oKEZDdhEHC3yKGHe0U9Xru.sV8c0Ob2vSGxSDxJpcgqAAmD6LMu.C',
  'Super Admin',
  'SUPERADMIN',
  NOW(),
  NOW()
);

-- Regular User (password: user123)
INSERT INTO "User" (id, email, password, name, role, "pesantrenName", "createdAt", "updatedAt")
VALUES (
  'user_801455168',
  'pesantren@example.com',
  '$2a$10$NxgMdZJmxfHqbzWx/lFEDOdGp149GzOXfKZgh5AJGp2GvmSig3JpS',
  'Pesantren Al-Hikmah',
  'USER',
  'Pesantren Al-Hikmah',
  NOW(),
  NOW()
);

-- Additional User
INSERT INTO "User" (id, email, password, name, role, "pesantrenName", "phone", "city", "province", "createdAt", "updatedAt")
VALUES (
  'user_' || floor(random() * 1000000000)::text,
  'pesantren2@example.com',
  '$2a$10$NxgMdZJmxfHqbzWx/lFEDOdGp149GzOXfKZgh5AJGp2GvmSig3JpS',
  'Pesantren Daarut Tauhid',
  'USER',
  'Pesantren Daarut Tauhid',
  '081234567890',
  'Bandung',
  'Jawa Barat',
  NOW(),
  NOW()
);

-- ============================================
-- 2. PRODUCTS
-- ============================================

INSERT INTO "product" (id, name, description, price, stock, "minStock", image, "isBestseller", "isActive", "createdAt", "updatedAt")
VALUES
  ('prod_' || floor(random() * 1000000000)::text, 'Kitab Amtsilati Jilid 1', 'Kitab dasar pembelajaran nahwu shorof metode Amtsilati', 35000, 100, 10, NULL, true, true, NOW(), NOW()),
  ('prod_' || floor(random() * 1000000000)::text, 'Kitab Amtsilati Jilid 2', 'Lanjutan pembelajaran nahwu shorof', 35000, 80, 10, NULL, true, true, NOW(), NOW()),
  ('prod_' || floor(random() * 1000000000)::text, 'Kitab Amtsilati Jilid 3', 'Tingkat lanjut nahwu shorof', 35000, 75, 10, NULL, true, true, NOW(), NOW()),
  ('prod_' || floor(random() * 1000000000)::text, 'Kitab Amtsilati Jilid 4', 'Tingkat mahir nahwu shorof', 35000, 60, 10, NULL, false, true, NOW(), NOW()),
  ('prod_' || floor(random() * 1000000000)::text, 'Kitab Amtsilati Jilid 5', 'Tingkat expert nahwu shorof', 35000, 50, 10, NULL, false, true, NOW(), NOW()),
  ('prod_' || floor(random() * 1000000000)::text, 'Kitab Amtsilati Jilid 6', 'Tingkat master nahwu shorof', 35000, 45, 10, NULL, false, true, NOW(), NOW()),
  ('prod_' || floor(random() * 1000000000)::text, 'Kamus Arab-Indonesia', 'Kamus lengkap untuk pembelajaran', 75000, 30, 5, NULL, true, true, NOW(), NOW()),
  ('prod_' || floor(random() * 1000000000)::text, 'Buku Panduan Ustadz', 'Panduan mengajar metode Amtsilati', 50000, 25, 5, NULL, false, true, NOW(), NOW()),
  ('prod_' || floor(random() * 1000000000)::text, 'CD Audio Pembelajaran', 'Audio pembelajaran Amtsilati', 25000, 40, 5, NULL, false, true, NOW(), NOW()),
  ('prod_' || floor(random() * 1000000000)::text, 'Poster Tabel Nahwu', 'Poster tabel nahwu untuk kelas', 15000, 50, 10, NULL, false, true, NOW(), NOW());

-- ============================================
-- 3. PACKAGES
-- ============================================

-- Package 1: Paket Pemula
INSERT INTO "package" (id, name, description, price, image, "isActive", "createdAt", "updatedAt")
VALUES (
  'pkg_' || floor(random() * 1000000000)::text,
  'Paket Pemula',
  'Paket lengkap untuk pemula: Jilid 1-3 + Kamus',
  150000,
  NULL,
  true,
  NOW(),
  NOW()
);

-- Package 2: Paket Lengkap
INSERT INTO "package" (id, name, description, price, image, "isActive", "createdAt", "updatedAt")
VALUES (
  'pkg_' || floor(random() * 1000000000)::text,
  'Paket Lengkap',
  'Paket lengkap semua jilid 1-6 + Kamus + Panduan Ustadz',
  280000,
  NULL,
  true,
  NOW(),
  NOW()
);

-- Package 3: Paket Ustadz
INSERT INTO "package" (id, name, description, price, image, "isActive", "createdAt", "updatedAt")
VALUES (
  'pkg_' || floor(random() * 1000000000)::text,
  'Paket Ustadz',
  'Paket khusus ustadz: Semua jilid + Panduan + CD Audio + Poster',
  350000,
  NULL,
  true,
  NOW(),
  NOW()
);

-- ============================================
-- 4. PROMOS
-- ============================================

INSERT INTO "promo" (id, code, "discountType", "discountValue", "maxUsage", "usedCount", "isActive", "validFrom", "validUntil", "createdAt", "updatedAt")
VALUES
  ('promo_' || floor(random() * 1000000000)::text, 'RAMADHAN2026', 'PERCENTAGE', 15, 100, 0, true, NOW(), NOW() + INTERVAL '30 days', NOW(), NOW()),
  ('promo_' || floor(random() * 1000000000)::text, 'NEWUSER', 'PERCENTAGE', 10, NULL, 0, true, NOW(), NOW() + INTERVAL '90 days', NOW(), NOW()),
  ('promo_' || floor(random() * 1000000000)::text, 'DISKON50K', 'FIXED', 50000, 50, 0, true, NOW(), NOW() + INTERVAL '60 days', NOW(), NOW());

-- ============================================
-- 5. DIKLAT
-- ============================================

INSERT INTO "diklat" (id, title, description, location, method, "registrationLink", image, "isActive", "createdAt", "updatedAt")
VALUES
  ('diklat_' || floor(random() * 1000000000)::text, 'Diklat Metode Amtsilati Tingkat Dasar', 'Pelatihan metode pembelajaran Amtsilati untuk ustadz pemula', 'Pondok Pesantren Amtsilati Jabar 1, Bandung', 'OFFLINE', NULL, NULL, true, NOW(), NOW()),
  ('diklat_' || floor(random() * 1000000000)::text, 'Diklat Metode Amtsilati Tingkat Lanjut', 'Pelatihan lanjutan untuk ustadz yang sudah menguasai dasar', 'Pondok Pesantren Amtsilati Jabar 1, Bandung', 'HYBRID', NULL, NULL, true, NOW(), NOW()),
  ('diklat_' || floor(random() * 1000000000)::text, 'Workshop Pembelajaran Nahwu Shorof Modern', 'Workshop metode pembelajaran nahwu shorof yang efektif', 'Online via Zoom', 'ONLINE', 'https://zoom.us/example', NULL, true, NOW(), NOW());

-- ============================================
-- 6. AGENDA
-- ============================================

INSERT INTO "agenda" (id, title, description, "eventType", "pesantrenName", location, "eventDate", image, "isActive", "createdAt", "updatedAt")
VALUES
  ('agenda_' || floor(random() * 1000000000)::text, 'Wisuda Santri Angkatan 15', 'Wisuda santri yang telah menyelesaikan program Amtsilati', 'WISUDA', 'Pondok Pesantren Al-Hikmah', 'Aula Utama PP Al-Hikmah', NOW() + INTERVAL '30 days', NULL, true, NOW(), NOW()),
  ('agenda_' || floor(random() * 1000000000)::text, 'Test Kelulusan Jilid 3', 'Ujian kelulusan untuk santri jilid 3', 'TEST_KELULUSAN', 'Pondok Pesantren Daarut Tauhid', 'Ruang Kelas Utama', NOW() + INTERVAL '15 days', NULL, true, NOW(), NOW()),
  ('agenda_' || floor(random() * 1000000000)::text, 'Seminar Metode Pembelajaran Efektif', 'Seminar untuk ustadz tentang metode pembelajaran', 'SEMINAR', 'Amtsilati Jabar 1', 'Aula Amtsilati', NOW() + INTERVAL '45 days', NULL, true, NOW(), NOW());

-- ============================================
-- 7. PARTNERS
-- ============================================

INSERT INTO "partner" (id, "pesantrenName", city, province, logo, description, "joinedDate", "isActive", "createdAt", "updatedAt")
VALUES
  ('partner_' || floor(random() * 1000000000)::text, 'Pondok Pesantren Al-Hikmah', 'Bandung', 'Jawa Barat', NULL, 'Pesantren dengan 500+ santri menggunakan metode Amtsilati', NOW() - INTERVAL '2 years', true, NOW(), NOW()),
  ('partner_' || floor(random() * 1000000000)::text, 'Pondok Pesantren Daarut Tauhid', 'Bandung', 'Jawa Barat', NULL, 'Pesantren modern dengan metode Amtsilati', NOW() - INTERVAL '1 year', true, NOW(), NOW()),
  ('partner_' || floor(random() * 1000000000)::text, 'Pondok Pesantren An-Nur', 'Jakarta', 'DKI Jakarta', NULL, 'Pesantren di Jakarta yang mengadopsi Amtsilati', NOW() - INTERVAL '6 months', true, NOW(), NOW()),
  ('partner_' || floor(random() * 1000000000)::text, 'Pondok Pesantren Al-Falah', 'Bogor', 'Jawa Barat', NULL, 'Pesantren dengan fokus nahwu shorof', NOW() - INTERVAL '3 years', true, NOW(), NOW());

-- ============================================
-- DONE!
-- ============================================

SELECT 'Seed data berhasil diinsert!' as message;

-- Verify data
SELECT 'Users: ' || COUNT(*)::text FROM "User";
SELECT 'Products: ' || COUNT(*)::text FROM "product";
SELECT 'Packages: ' || COUNT(*)::text FROM "package";
SELECT 'Promos: ' || COUNT(*)::text FROM "promo";
SELECT 'Diklat: ' || COUNT(*)::text FROM "diklat";
SELECT 'Agenda: ' || COUNT(*)::text FROM "agenda";
SELECT 'Partners: ' || COUNT(*)::text FROM "partner";
