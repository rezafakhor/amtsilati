# 🚀 Quick Setup Guide - Supabase Database

## Informasi Project
- **Project Name**: amtsilati
- **Database Password**: 6t9j9HPLjoXAfslC
- **Host**: db.aldfnmhqvpyozfiwser1.supabase.co
- **Pooler**: aws-0-ap-southeast-1.pooler.supabase.com

---

## ✅ LANGKAH 1: Buka Supabase SQL Editor

1. Login ke https://supabase.com
2. Pilih project **"amtsilati"**
3. Klik **"SQL Editor"** di sidebar kiri
4. Klik **"New query"**

---

## ✅ LANGKAH 2: Jalankan Schema SQL

1. Buka file `schema.sql` di root project ini
2. **Copy SEMUA isinya** (Ctrl+A, Ctrl+C)
3. **Paste** ke SQL Editor di Supabase
4. Klik **"Run"** atau tekan **Ctrl+Enter**
5. Tunggu sampai selesai (akan muncul "Success")

---

## ✅ LANGKAH 3: Insert Admin & User

Buat query baru di SQL Editor, copy dan jalankan:

```sql
-- Insert Admin User
INSERT INTO "User" (id, email, password, name, role, "createdAt", "updatedAt")
VALUES (
  'admin_1770966710607',
  'admin@pawedaran.com',
  '$2a$10$i44xdB3Y76XklP7z/Vr/IetqyCVjQF7Gut/zrgLlQ5dtxcrv5s7p6',
  'Super Admin',
  'SUPERADMIN',
  NOW(),
  NOW()
);

-- Insert Sample User
INSERT INTO "User" (id, email, password, name, role, "pesantrenName", "createdAt", "updatedAt")
VALUES (
  'user_1770966710607',
  'pesantren@example.com',
  '$2a$10$fOeUVvtkqwfygEFlI5ri1uT9QfKSEN4XchIxAM4WSHoZ7Fcszdu0u',
  'Pesantren Al-Hikmah',
  'USER',
  'Pesantren Al-Hikmah',
  NOW(),
  NOW()
);
```

---

## ✅ LANGKAH 4: Verifikasi Database

1. Klik **"Table Editor"** di sidebar Supabase
2. Pastikan semua tabel sudah ada:
   - User ✓
   - Address ✓
   - order ✓
   - orderitem ✓
   - product ✓
   - package ✓
   - packageitem ✓
   - promo ✓
   - debt ✓
   - debtpayment ✓
   - stocklog ✓
   - diklat ✓
   - diklatdate ✓
   - diklatformfield ✓
   - diklatregistration ✓
   - agenda ✓
   - partner ✓

3. Klik tabel **"User"** dan pastikan ada 2 user:
   - admin@pawedaran.com (SUPERADMIN)
   - pesantren@example.com (USER)

---

## ✅ LANGKAH 5: Setup Vercel Environment Variables

1. Buka https://vercel.com
2. Pilih project **"amtsilati"**
3. Klik **Settings** > **Environment Variables**
4. Tambahkan 4 variables berikut:

### Variable 1: DATABASE_URL
```
postgresql://postgres.aldfnmhqvpyozfiwser1:6t9j9HPLjoXAfslC@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

### Variable 2: DIRECT_URL
```
postgresql://postgres:6t9j9HPLjoXAfslC@db.aldfnmhqvpyozfiwser1.supabase.co:5432/postgres
```

### Variable 3: NEXTAUTH_SECRET
```
0060e084280b8bc2cbd8e34eb10444b91103b887de4445d54c659065bacecc86
```

### Variable 4: NEXTAUTH_URL
```
https://amtsilati.vercel.app
```

5. Klik **"Save"** untuk setiap variable

---

## ✅ LANGKAH 6: Redeploy Vercel

### Opsi A: Auto Deploy (Recommended)
1. Commit dan push ke GitHub:
   ```bash
   git add .
   git commit -m "Setup database for production"
   git push origin main
   ```
2. Vercel akan auto-deploy

### Opsi B: Manual Redeploy
1. Di Vercel dashboard, klik tab **"Deployments"**
2. Klik tombol **"Redeploy"** pada deployment terakhir
3. Pilih **"Use existing Build Cache"** (optional)
4. Klik **"Redeploy"**

---

## ✅ LANGKAH 7: Test Website

1. Tunggu deployment selesai (2-3 menit)
2. Buka https://amtsilati.vercel.app
3. Klik **"Login"**
4. Test login dengan:

**Admin:**
- Email: `admin@pawedaran.com`
- Password: `admin123`

**User:**
- Email: `pesantren@example.com`
- Password: `user123`

---

## 🎉 SELESAI!

Website Anda sudah online dan siap digunakan!

### Akses:
- **Website**: https://amtsilati.vercel.app
- **Admin Dashboard**: https://amtsilati.vercel.app/admin
- **GitHub Repo**: https://github.com/rezafakhor/amtsilati

### Login Credentials:
- **Admin**: admin@pawedaran.com / admin123
- **User**: pesantren@example.com / user123

---

## 🔧 Troubleshooting

### Database Connection Error
- Pastikan semua environment variables sudah benar di Vercel
- Pastikan Supabase project status "Active" (tidak "Paused")
- Redeploy ulang di Vercel

### Login Gagal
- Pastikan SQL INSERT user sudah dijalankan di Supabase
- Cek di Table Editor > User, pastikan ada 2 user
- Pastikan NEXTAUTH_SECRET dan NEXTAUTH_URL sudah benar

### Build Error di Vercel
- Cek Vercel deployment logs
- Pastikan semua dependencies terinstall
- Pastikan tidak ada TypeScript errors

---

## 📞 Need Help?

Jika ada masalah, cek file-file berikut untuk detail lebih lanjut:
- `SETUP_MANUAL_SQL.md` - Panduan lengkap setup database
- `DEPLOYMENT.md` - Panduan deployment
- `DEVELOPMENT.md` - Panduan development
