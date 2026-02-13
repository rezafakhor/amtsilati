# Setup Database Manual via Supabase SQL Editor

Jika `npx prisma db push` tidak bisa connect, gunakan cara manual ini:

## Langkah 1: Buka SQL Editor di Supabase

1. Di Supabase dashboard, klik project "amtsilati"
2. Klik "SQL Editor" di sidebar kiri
3. Klik "New query"

## Langkah 2: Generate SQL Schema

Di terminal lokal, jalankan:

```bash
npx prisma migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma --script > schema.sql
```

File `schema.sql` akan dibuat di root project.

## Langkah 3: Copy SQL ke Supabase

1. Buka file `schema.sql` yang baru dibuat
2. Copy semua isinya
3. Paste ke SQL Editor di Supabase
4. Klik "Run" atau tekan Ctrl+Enter

## Langkah 4: Verifikasi Tables

1. Klik "Table Editor" di sidebar Supabase
2. Anda akan melihat semua tabel sudah dibuat:
   - User
   - Address
   - order
   - orderitem
   - product
   - package
   - packageitem
   - promo
   - debt
   - debtpayment
   - stocklog
   - diklat
   - diklatdate
   - diklatformfield
   - diklatregistration
   - agenda
   - partner

## Langkah 5: Seed Data (Manual via SQL)

Copy dan jalankan SQL ini di SQL Editor untuk membuat admin dan user:

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

**Login Credentials:**
- Admin: `admin@pawedaran.com` / `admin123`
- User: `pesantren@example.com` / `user123`

## Langkah 6: Test Connection dari Lokal

Setelah tables dibuat, test connection:

```bash
npx prisma studio
```

Jika berhasil, Prisma Studio akan terbuka di browser dan Anda bisa lihat semua data.

## Langkah 7: Setup Vercel Environment Variables

Sama seperti panduan sebelumnya, tambahkan di Vercel Settings > Environment Variables:

1. **DATABASE_URL**:
   ```
   postgresql://postgres.aldfnmhqvpyozfiwser1:6t9j9HPLjoXAfslC@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true
   ```

2. **DIRECT_URL**:
   ```
   postgresql://postgres:6t9j9HPLjoXAfslC@db.aldfnmhqvpyozfiwser1.supabase.co:5432/postgres
   ```

3. **NEXTAUTH_SECRET**:
   ```
   0060e084280b8bc2cbd8e34eb10444b91103b887de4445d54c659065bacecc86
   ```

4. **NEXTAUTH_URL**:
   ```
   https://amtsilati.vercel.app
   ```

## Langkah 8: Redeploy

1. Commit perubahan schema.prisma:
   ```bash
   git add prisma/schema.prisma
   git commit -m "Update schema for Supabase with directUrl"
   git push origin main
   ```

2. Vercel akan auto-deploy

## Troubleshooting Connection Issues

### Cek Status Database

1. Di Supabase dashboard, pastikan project status "Active" (hijau)
2. Jika "Paused", klik "Restore"

### Cek Network/Firewall

Jika masih tidak bisa connect dari lokal:
1. Coba gunakan VPN
2. Atau gunakan SQL Editor di Supabase saja (tidak perlu connect dari lokal)

### Alternative: Deploy Dulu, Setup Database Nanti

1. Push code ke GitHub
2. Deploy ke Vercel (akan error karena no database)
3. Setup database via Supabase SQL Editor
4. Redeploy di Vercel
5. Website akan jalan

## Selesai!

Website Anda akan online di: **https://amtsilati.vercel.app**

Login:
- Email: `admin@pawedaran.com`
- Password: `admin123` (atau password yang Anda set)
