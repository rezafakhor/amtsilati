# Setup Database Supabase untuk Deployment

## Langkah 1: Buat Project di Supabase

1. Buka https://supabase.com/dashboard
2. Klik "New Project"
3. Isi detail project:
   - Name: `amtsilati` (atau nama lain)
   - Database Password: Buat password yang kuat (SIMPAN password ini!)
   - Region: Pilih yang terdekat (Southeast Asia - Singapore)
4. Klik "Create new project"
5. Tunggu beberapa menit sampai project selesai dibuat

## Langkah 2: Dapatkan Connection String

1. Di dashboard Supabase, klik project Anda
2. Klik icon "Settings" (gear) di sidebar kiri bawah
3. Klik "Database" di menu Settings
4. Scroll ke bawah ke bagian "Connection string"
5. Pilih tab "URI"
6. Copy connection string yang ada
7. **PENTING**: Ganti `[YOUR-PASSWORD]` dengan password database yang Anda buat tadi

Connection string akan terlihat seperti ini:
```
postgresql://postgres:[YOUR-PASSWORD]@db.xxxxxxxxxxxxx.supabase.co:5432/postgres
```

## Langkah 3: Update File .env Lokal

1. Buka file `.env` di root project
2. Update `DATABASE_URL` dengan connection string dari Supabase:

```env
DATABASE_URL="postgresql://postgres:PASSWORD_ANDA@db.xxxxxxxxxxxxx.supabase.co:5432/postgres"
NEXTAUTH_SECRET="0060e084280b8bc2cbd8e34eb10444b91103b887de4445d54c659065bacecc86"
NEXTAUTH_URL="http://localhost:3000"
```

**Ganti**:
- `PASSWORD_ANDA` dengan password database Supabase Anda
- `db.xxxxxxxxxxxxx.supabase.co` dengan host dari connection string Anda

## Langkah 4: Push Schema ke Database

Jalankan command ini di terminal:

```bash
npx prisma db push
```

Anda akan melihat output seperti ini jika berhasil:
```
✔ Generated Prisma Client
🚀  Your database is now in sync with your Prisma schema.
```

## Langkah 5: Seed Data Awal

Jalankan command ini untuk mengisi data awal (admin user, dll):

```bash
npm run db:seed
```

Output yang berhasil:
```
✅ Admin user created
✅ Sample user created
✅ Database seeded successfully!
```

**Data Login Admin:**
- Email: `admin@pawedaran.com`
- Password: `admin123`

**Data Login User:**
- Email: `pesantren@example.com`
- Password: `user123`

## Langkah 6: Setup Environment Variables di Vercel

1. Buka https://vercel.com/dashboard
2. Pilih project `amtsilati`
3. Klik tab "Settings"
4. Klik "Environment Variables" di sidebar
5. Tambahkan 3 environment variables:

### DATABASE_URL
- Name: `DATABASE_URL`
- Value: Connection string Supabase Anda (sama seperti di .env lokal)
- Environment: Production, Preview, Development (centang semua)

### NEXTAUTH_SECRET
- Name: `NEXTAUTH_SECRET`
- Value: `0060e084280b8bc2cbd8e34eb10444b91103b887de4445d54c659065bacecc86`
- Environment: Production, Preview, Development (centang semua)

### NEXTAUTH_URL
- Name: `NEXTAUTH_URL`
- Value: `https://amtsilati.vercel.app`
- Environment: Production (hanya centang Production)

6. Klik "Save" untuk setiap variable

## Langkah 7: Redeploy di Vercel

Setelah environment variables di-set:

1. Kembali ke tab "Deployments"
2. Klik titik tiga (...) di deployment terakhir
3. Klik "Redeploy"
4. Tunggu deployment selesai

## Langkah 8: Test Website

1. Buka https://amtsilati.vercel.app
2. Klik tombol "Login" di homepage
3. Login dengan:
   - Email: `admin@pawedaran.com`
   - Password: `admin123`
4. Anda akan masuk ke dashboard admin

## Troubleshooting

### Error: Can't reach database server

**Penyebab**: Password salah atau connection string tidak valid

**Solusi**:
1. Pastikan password di connection string benar
2. Pastikan tidak ada spasi atau karakter aneh
3. Coba reset password database di Supabase Settings > Database > Database password

### Error: P3009 migrate.lock file is missing

**Solusi**: Gunakan `npx prisma db push` bukan `npx prisma migrate`

### Website deployed tapi error saat login

**Penyebab**: Environment variables di Vercel belum di-set atau salah

**Solusi**:
1. Cek di Vercel Settings > Environment Variables
2. Pastikan semua 3 variables ada dan benar
3. Redeploy setelah update variables

### Database connection timeout

**Penyebab**: Supabase project mungkin paused (free tier)

**Solusi**:
1. Buka Supabase dashboard
2. Klik project Anda
3. Jika ada notifikasi "Project paused", klik "Restore"
4. Tunggu beberapa menit
5. Coba lagi

## Catatan Penting

1. **Jangan commit file .env ke Git!** File ini sudah ada di .gitignore
2. **Simpan password database** di tempat yang aman
3. **Backup database** secara berkala dari Supabase dashboard
4. **Free tier Supabase** akan pause project setelah 1 minggu tidak aktif
5. **Ganti password admin** setelah deployment pertama untuk keamanan

## Selesai! 🎉

Website Anda sekarang sudah online dan siap digunakan di:
**https://amtsilati.vercel.app**
