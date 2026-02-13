# 🕌 PAWEDARAN by AMSTILATI JABAR I

<div align="center">

**Platform E-Commerce Kitab Islami Premium**

[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-5-2D3748?style=flat-square&logo=prisma)](https://www.prisma.io/)
[![MySQL](https://img.shields.io/badge/MySQL-8-4479A1?style=flat-square&logo=mysql&logoColor=white)](https://www.mysql.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)

Platform e-commerce modern untuk penjualan kitab Islami dengan sistem piutang fleksibel, manajemen stok terpusat, dan dashboard admin premium.

[Quick Start](#-quick-start) • [Features](#-fitur-utama) • [Documentation](#-dokumentasi) • [Deployment](#-deployment)

</div>

---

## ✨ Highlights

- 🎨 **Modern UI/UX** - Design Islami elegan dengan 3D soft depth
- 💰 **Sistem Piutang Fleksibel** - Utang, Sebagian, atau Lunas
- 📦 **Manajemen Terpusat** - Stok, pesanan, dan pengiriman
- 🚀 **Performance Optimized** - Next.js SSR/SSG untuk kecepatan maksimal
- 💸 **Biaya Hosting Murah** - Deploy di Vercel (gratis) atau VPS (€4/bulan)
- 🔒 **Secure** - NextAuth.js dengan role-based access control

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Setup database
CREATE DATABASE pawedaran;

# 3. Configure environment
copy .env.example .env
# Edit DATABASE_URL di .env

# 4. Setup schema & seed
npm run db:push
npm run db:seed

# 5. Run development server
npm run dev
```

**Buka:** http://localhost:3000

**Login Admin:**
- Email: `admin@pawedaran.com`
- Password: `admin123`

📖 **Detail:** [QUICKSTART.md](QUICKSTART.md)

## 🎯 Fitur Utama

### 👥 User/Pesantren

✅ **Katalog Modern**
- Browse kitab satuan & paket bundle
- Card 3D dengan hover effect
- Badge terlaris & stok terbatas

✅ **Checkout Fleksibel**
- 3 metode pembayaran:
  - **UTANG** - Bayar nanti (full piutang)
  - **SEBAGIAN** - Bayar sebagian + upload bukti
  - **LUNAS** - Bayar penuh + upload bukti
- Input kode promo
- Validasi data lengkap

✅ **Manajemen Pesanan**
- Tracking status real-time
- Lihat nomor resi
- Foto bukti pengiriman

✅ **Piutang**
- Total piutang aktif
- Riwayat pembayaran
- Bayar piutang (upload bukti)

### 👨‍💼 Superadmin

✅ **Dashboard Analytics**
- Total penjualan
- Total piutang
- Stok kritis
- Pesanan aktif
- Grafik penjualan

✅ **Manajemen Produk**
- CRUD kitab satuan & paket
- Upload gambar
- Set harga & stok
- Alert stok minimum

✅ **Proses Pesanan**
- Update status pesanan
- Upload foto packing
- Input nomor resi
- Upload foto resi
- Pilih metode kirim (Driver/Ekspedisi)

✅ **Manajemen Piutang**
- List piutang aktif
- Verifikasi pembayaran
- Adjustment manual
- Export laporan

✅ **Stok Opname**
- Update stok manual
- Log perubahan (IN/OUT)
- History tracking

✅ **Sistem Promo**
- Buat kode promo
- Diskon persentase/nominal
- Batas penggunaan
- Periode aktif

✅ **Manajemen User**
- Create user (no signup)
- Set role
- Reset password

📖 **Detail:** [FEATURES.md](FEATURES.md)

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 14, React 18, TypeScript |
| **Styling** | Tailwind CSS, Framer Motion |
| **Backend** | Next.js API Routes |
| **Database** | MySQL/MariaDB |
| **ORM** | Prisma |
| **Auth** | NextAuth.js |
| **Icons** | Lucide React |
| **Fonts** | Inter, Playfair Display |

## 🎨 Design System

### Warna
```css
Primary Green:   #0E4F3A
Dark Green:      #0A3D2E
Accent Gold:     #D4AF37
Background Cream: #F9FAF7
Text Dark:       #1F2933
```

### Typography
- **Heading**: Playfair Display (serif, elegan)
- **Body**: Inter (sans-serif, clean)

### UI Style
- Modern 3D soft depth
- Smooth transitions & animations
- Multi-layer shadows
- Islamic elegant aesthetic
- Responsive design

## 📁 Struktur Project

```
pawedaran/
├── prisma/              # Database schema & seed
├── src/
│   ├── app/
│   │   ├── admin/       # Admin dashboard
│   │   ├── api/         # API routes
│   │   ├── katalog/     # Product catalog
│   │   └── ...
│   ├── components/      # React components
│   ├── lib/             # Utilities
│   └── types/           # TypeScript types
├── .env.example         # Environment template
└── package.json
```

📖 **Detail:** [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md)

## 📚 Dokumentasi

| Dokumen | Deskripsi |
|---------|-----------|
| [QUICKSTART.md](QUICKSTART.md) | Setup dalam 5 menit |
| [SETUP.md](SETUP.md) | Panduan instalasi lengkap |
| [FEATURES.md](FEATURES.md) | Daftar fitur detail |
| [DEPLOYMENT.md](DEPLOYMENT.md) | Panduan deployment |
| [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md) | Struktur project |

## 🚀 Deployment

### Vercel (Recommended - Gratis)

```bash
# 1. Push ke GitHub
git push origin main

# 2. Import di vercel.com
# 3. Set environment variables
# 4. Deploy ✅
```

### VPS (Cheapest - €4/bulan)

```bash
# 1. SSH ke server
# 2. Clone & install
# 3. Setup MySQL
# 4. Build & run with PM2
```

### Railway (Balanced - $5-20/bulan)

```bash
# 1. Connect GitHub
# 2. Add MySQL
# 3. Deploy ✅
```

📖 **Detail:** [DEPLOYMENT.md](DEPLOYMENT.md)

## 💰 Biaya Hosting

| Provider | Biaya/Bulan | Database | Rekomendasi |
|----------|-------------|----------|-------------|
| Vercel + PlanetScale | $0-20 | 5GB free | ⭐ Untuk mulai |
| VPS (Contabo) | €4 | Included | ⭐ Termurah |
| Railway | $5-20 | Included | Setup mudah |
| DigitalOcean | $12+ | Included | Reliable |

## 🔐 Security

- ✅ Password hashing (bcrypt)
- ✅ JWT sessions (NextAuth)
- ✅ Role-based access control
- ✅ Protected API routes
- ✅ SQL injection prevention (Prisma)
- ✅ XSS protection (React)

## ⚡ Performance

- ✅ Server-side rendering (SSR)
- ✅ Static generation (SSG)
- ✅ Image optimization
- ✅ Code splitting
- ✅ Lazy loading
- ✅ Database indexing

## 🗄️ Database Schema

```
User ─┬─ Order ─── OrderItem ─┬─ Product
      │                       └─ Package ─── PackageItem ─── Product
      └─ Debt ─── DebtPayment

Order ─── Promo
Product ─── StockLog
```

## 📝 Scripts

```bash
npm run dev          # Development server
npm run build        # Production build
npm start            # Production server
npm run lint         # Lint code
npm run db:push      # Push schema to DB
npm run db:seed      # Seed database
```

## 🔮 Roadmap

### Phase 2
- [ ] WhatsApp notifications
- [ ] Email notifications
- [ ] PDF invoice generation
- [ ] Advanced reporting
- [ ] Export data (Excel/CSV)

### Phase 3
- [ ] Mobile app (React Native)
- [ ] Payment gateway integration
- [ ] Loyalty program
- [ ] Multi-warehouse support

### Phase 4
- [ ] AI recommendation
- [ ] Advanced analytics
- [ ] Multi-language support
- [ ] API for third-party

## 🤝 Contributing

Project ini adalah proprietary untuk AMSTILATI JABAR I.

## 📄 License

Proprietary - AMSTILATI JABAR I

## 📞 Support

Untuk bantuan dan pertanyaan, hubungi tim AMSTILATI JABAR I.

---

<div align="center">

**PAWEDARAN** - Platform E-Commerce Kitab Islami Premium

Made with ❤️ by AMSTILATI JABAR I

</div>
