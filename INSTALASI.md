# 🚀 Panduan Instalasi PAWEDARAN

Panduan instalasi lengkap dalam Bahasa Indonesia.

## 📋 Persyaratan Sistem

Sebelum memulai, pastikan sudah terinstall:

- ✅ **Node.js** versi 18 atau lebih baru
- ✅ **MySQL** atau **MariaDB** versi 8 atau lebih baru
- ✅ **npm** (biasanya sudah include dengan Node.js)
- ✅ **Git** (opsional, untuk clone repository)

### Cek Versi

```bash
node --version    # Harus v18 atau lebih
npm --version     # Harus v9 atau lebih
mysql --version   # Harus v8 atau lebih
```

## 🔧 Langkah Instalasi

### 1. Download Project

Jika menggunakan Git:
```bash
git clone <repository-url>
cd pawedaran
```

Atau download ZIP dan extract.

### 2. Install Dependencies

```bash
npm install
```

Proses ini akan menginstall semua package yang diperlukan. Tunggu hingga selesai (sekitar 2-5 menit tergantung koneksi internet).

### 3. Setup Database MySQL

#### A. Buka MySQL

```bash
mysql -u root -p
```

Masukkan password MySQL Anda.

#### B. Buat Database

```sql
CREATE DATABASE pawedaran CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

#### C. Buat User (Opsional, untuk keamanan)

```sql
CREATE USER 'pawedaran'@'localhost' IDENTIFIED BY 'password_anda';
GRANT ALL PRIVILEGES ON pawedaran.* TO 'pawedaran'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### 4. Konfigurasi Environment

#### A. Copy File Environment

```bash
copy .env.example .env
```

Di Linux/Mac:
```bash
cp .env.example .env
```

#### B. Edit File .env

Buka file `.env` dengan text editor dan sesuaikan:

```env
# Sesuaikan dengan database Anda
DATABASE_URL="mysql://root:password_mysql@localhost:3306/pawedaran"

# Generate secret key (lihat cara di bawah)
NEXTAUTH_SECRET="secret_key_anda"

# URL aplikasi
NEXTAUTH_URL="http://localhost:3000"
```

#### C. Generate Secret Key

Jalankan command ini untuk generate secret key:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy hasilnya dan paste ke `NEXTAUTH_SECRET` di file `.env`.

### 5. Setup Database Schema

#### A. Generate Prisma Client

```bash
npx prisma generate
```

#### B. Push Schema ke Database

```bash
npm run db:push
```

Ketik `y` jika diminta konfirmasi.

### 6. Isi Data Awal (Seeding)

```bash
npm run db:seed
```

Ini akan membuat:
- 1 akun admin
- 1 akun user contoh
- 5 produk kitab
- 1 paket kitab
- 1 kode promo

### 7. Jalankan Development Server

```bash
npm run dev
```

Tunggu hingga muncul pesan:
```
✓ Ready in 2.5s
○ Local:   http://localhost:3000
```

### 8. Buka Browser

Buka browser dan akses: **http://localhost:3000**

## 🎉 Selesai!

Aplikasi sudah berjalan. Sekarang Anda bisa:

### Login sebagai Admin

1. Klik tombol "Admin Dashboard" atau buka http://localhost:3000/login
2. Login dengan:
   - Email: `admin@pawedaran.com`
   - Password: `admin123`

### Login sebagai User

1. Buka http://localhost:3000/login
2. Login dengan:
   - Email: `pesantren@example.com`
   - Password: `user123`

### Explore Katalog

Buka http://localhost:3000/katalog untuk melihat katalog produk.

## 🔍 Verifikasi Instalasi

### Cek Database

Buka Prisma Studio untuk melihat data:

```bash
npx prisma studio
```

Akan terbuka di browser: http://localhost:5555

### Cek Logs

Jika ada error, cek terminal tempat Anda menjalankan `npm run dev`.

## ❌ Troubleshooting

### Error: Cannot connect to database

**Penyebab:** MySQL tidak running atau kredensial salah.

**Solusi:**
1. Pastikan MySQL running:
   ```bash
   # Windows
   net start MySQL80
   
   # Linux
   sudo systemctl start mysql
   ```

2. Cek kredensial di `.env`:
   ```env
   DATABASE_URL="mysql://user:password@localhost:3306/pawedaran"
   ```

### Error: Port 3000 already in use

**Penyebab:** Port 3000 sudah digunakan aplikasi lain.

**Solusi:**
```bash
# Gunakan port lain
PORT=3001 npm run dev
```

Atau matikan aplikasi yang menggunakan port 3000.

### Error: Prisma Client not generated

**Solusi:**
```bash
npx prisma generate
```

### Error: Table doesn't exist

**Solusi:**
```bash
npm run db:push
```

### Error: Module not found

**Solusi:**
```bash
# Hapus node_modules dan install ulang
rm -rf node_modules
npm install
```

### Reset Database

Jika ingin reset database dari awal:

```bash
# Reset schema
npx prisma db push --force-reset

# Seed ulang
npm run db:seed
```

## 📁 Struktur Folder

Setelah instalasi, struktur folder akan seperti ini:

```
pawedaran/
├── node_modules/       # Dependencies (jangan edit)
├── prisma/            # Database schema & seed
├── public/            # Static files
├── src/               # Source code
│   ├── app/          # Pages & API
│   ├── components/   # React components
│   └── lib/          # Utilities
├── .env              # Environment variables (jangan commit)
├── .env.example      # Template environment
├── package.json      # Dependencies list
└── README.md         # Dokumentasi
```

## 🔄 Update Aplikasi

Jika ada update dari repository:

```bash
# Pull update
git pull origin main

# Install dependencies baru (jika ada)
npm install

# Update database schema (jika ada perubahan)
npm run db:push

# Restart server
npm run dev
```

## 🚀 Deploy ke Production

Setelah development selesai, lihat panduan deployment:

- [DEPLOYMENT.md](DEPLOYMENT.md) - Panduan lengkap deployment
- [QUICKSTART.md](QUICKSTART.md) - Quick reference

## 📚 Dokumentasi Lainnya

- [README.md](README.md) - Overview project
- [SETUP.md](SETUP.md) - Setup detail (English)
- [FEATURES.md](FEATURES.md) - Daftar fitur
- [DEVELOPMENT.md](DEVELOPMENT.md) - Panduan development

## 💡 Tips

1. **Selalu jalankan** `npm run dev` di terminal terpisah
2. **Jangan edit** file di folder `node_modules`
3. **Backup database** secara berkala
4. **Gunakan Prisma Studio** untuk melihat data
5. **Cek terminal** jika ada error

## 🆘 Butuh Bantuan?

Jika mengalami kesulitan:

1. Cek bagian Troubleshooting di atas
2. Baca dokumentasi lengkap
3. Cek error message di terminal
4. Hubungi tim AMSTILATI JABAR I

## ✅ Checklist Instalasi

- [ ] Node.js terinstall
- [ ] MySQL terinstall dan running
- [ ] Dependencies terinstall (`npm install`)
- [ ] Database dibuat
- [ ] File `.env` dikonfigurasi
- [ ] Schema di-push (`npm run db:push`)
- [ ] Database di-seed (`npm run db:seed`)
- [ ] Server berjalan (`npm run dev`)
- [ ] Bisa akses http://localhost:3000
- [ ] Bisa login sebagai admin
- [ ] Bisa lihat katalog

## 🎓 Langkah Selanjutnya

Setelah instalasi berhasil:

1. **Explore fitur** yang sudah ada
2. **Baca dokumentasi** untuk memahami struktur
3. **Mulai development** fitur baru
4. **Test** setiap perubahan
5. **Deploy** ke production

---

**Selamat!** Anda berhasil menginstall PAWEDARAN. 🎉

Untuk pertanyaan lebih lanjut, hubungi tim AMSTILATI JABAR I.
