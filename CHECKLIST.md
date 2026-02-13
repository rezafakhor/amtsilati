# ✅ Deployment Checklist

## Database Setup (Supabase)

- [ ] Login ke Supabase (https://supabase.com)
- [ ] Buka project "amtsilati"
- [ ] Buka SQL Editor
- [ ] Copy isi file `schema.sql`
- [ ] Paste dan Run di SQL Editor
- [ ] Tunggu sampai "Success"
- [ ] Buat query baru untuk insert users
- [ ] Copy SQL INSERT dari `QUICK_SETUP.md` langkah 3
- [ ] Run SQL INSERT
- [ ] Verifikasi di Table Editor > User (harus ada 2 users)

## Vercel Environment Variables

- [ ] Login ke Vercel (https://vercel.com)
- [ ] Buka project "amtsilati"
- [ ] Klik Settings > Environment Variables
- [ ] Tambah `DATABASE_URL` (lihat QUICK_SETUP.md)
- [ ] Tambah `DIRECT_URL` (lihat QUICK_SETUP.md)
- [ ] Tambah `NEXTAUTH_SECRET` (lihat QUICK_SETUP.md)
- [ ] Tambah `NEXTAUTH_URL` = `https://amtsilati.vercel.app`
- [ ] Save semua variables

## Deployment

- [ ] Commit changes: `git add .`
- [ ] Commit: `git commit -m "Setup database for production"`
- [ ] Push: `git push origin main`
- [ ] Tunggu Vercel auto-deploy (2-3 menit)
- [ ] Cek deployment status di Vercel dashboard

## Testing

- [ ] Buka https://amtsilati.vercel.app
- [ ] Klik "Login"
- [ ] Test login admin: admin@pawedaran.com / admin123
- [ ] Masuk ke Admin Dashboard
- [ ] Test logout
- [ ] Test login user: pesantren@example.com / user123
- [ ] Test navigasi homepage
- [ ] Test fitur-fitur utama

## Done! 🎉

Website sudah online dan siap digunakan!
