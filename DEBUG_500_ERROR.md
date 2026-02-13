# Debug 500 Error - /api/orders

## Error yang Terjadi
```
GET https://amtsilati.vercel.app/api/orders?status=PENDING 500 (Internal Server Error)
```

## Kemungkinan Penyebab

### 1. Database Connection Issue (Paling Mungkin)
Error "prepared statement already exists" muncul lagi karena:
- Environment variable `POSTGRES_URL_NON_POOLING` tidak di-set di Vercel
- Aplikasi menggunakan pooled connection yang menyebabkan conflict

### 2. Query Error
Ada error di query Prisma saat fetch orders

### 3. Timeout
Query terlalu lama dan timeout

---

## Solusi 1: Cek Environment Variables di Vercel

### Langkah-langkah:

1. **Buka Vercel Dashboard**
   - Login ke https://vercel.com
   - Pilih project **amtsilati**

2. **Buka Settings → Environment Variables**
   - Klik tab **Settings**
   - Klik **Environment Variables** di sidebar

3. **Pastikan Variable Ini Ada:**

   ```
   POSTGRES_URL_NON_POOLING
   ```
   Value: `postgresql://postgres.aldfhmhqvpyozfiwserl:[PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres`
   
   **PENTING**: Port harus `5432` (bukan 6543)

4. **Jika Tidak Ada, Tambahkan:**
   - Klik **Add New**
   - Name: `POSTGRES_URL_NON_POOLING`
   - Value: Connection string dari Supabase (direct connection, port 5432)
   - Environment: Production, Preview, Development (centang semua)
   - Klik **Save**

5. **Redeploy Aplikasi:**
   - Setelah menambah/update env variable
   - Klik tab **Deployments**
   - Klik titik tiga (...) di deployment terakhir
   - Klik **Redeploy**

---

## Solusi 2: Cek Connection String di Supabase

### Cara Mendapatkan Connection String yang Benar:

1. **Buka Supabase Dashboard**
   - Login ke https://supabase.com/dashboard
   - Pilih project **aldfhmhqvpyozfiwserl**

2. **Buka Project Settings**
   - Klik icon gear (⚙️) di sidebar kiri bawah
   - Klik **Database**

3. **Copy Connection String**
   - Scroll ke bagian **Connection string**
   - Pilih tab **URI** (bukan Session mode)
   - Mode: **Transaction** atau **Session** (BUKAN Pooler)
   - Copy connection string yang muncul
   - Format: `postgresql://postgres.xxx:[PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres`

4. **Ganti [PASSWORD] dengan Password Database Anda**

5. **Paste ke Vercel Environment Variables**

---

## Solusi 3: Tambahkan Error Logging

Jika masih error setelah langkah di atas, kita perlu lihat error detail di Vercel logs:

### Cara Cek Logs di Vercel:

1. **Buka Vercel Dashboard**
2. **Pilih Project amtsilati**
3. **Klik tab "Logs"** atau **"Runtime Logs"**
4. **Filter by:**
   - Function: `/api/orders`
   - Time: Last 1 hour
5. **Cari error message** yang muncul saat request ke `/api/orders?status=PENDING`
6. **Screenshot atau copy error message** dan kirim ke saya

---

## Solusi 4: Temporary Fix - Gunakan Pooled Connection

Jika urgent dan tidak bisa redeploy, bisa temporary gunakan pooled connection dengan pgBouncer mode:

### Update di Vercel Environment Variables:

```
DATABASE_URL=postgresql://postgres.aldfhmhqvpyozfiwserl:[PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

Tambahkan `?pgbouncer=true` di akhir connection string.

**Note**: Ini temporary fix, lebih baik gunakan direct connection (port 5432).

---

## Cara Test Setelah Fix:

1. Buka aplikasi: https://amtsilati.vercel.app
2. Login sebagai admin
3. Buka halaman **Admin Dashboard**
4. Cek apakah data pesanan muncul
5. Buka Console (F12) → Tab Console
6. Tidak boleh ada error 500

---

## Quick Checklist

- [ ] Cek `POSTGRES_URL_NON_POOLING` ada di Vercel env variables
- [ ] Pastikan port 5432 (bukan 6543)
- [ ] Pastikan password benar (tidak ada [PASSWORD])
- [ ] Redeploy setelah update env variables
- [ ] Test di browser, cek console tidak ada error 500
- [ ] Cek Vercel logs jika masih error

---

## Kontak untuk Debug Lebih Lanjut

Jika masih error setelah semua langkah di atas, kirim ke saya:

1. Screenshot Vercel Environment Variables (blur password)
2. Screenshot error di Console browser
3. Screenshot/copy Vercel Runtime Logs
4. Connection string yang digunakan (blur password)

Saya akan bantu debug lebih detail.
