# Setup Guide - PAWEDARAN

## Prerequisites

- Node.js 18+ 
- MySQL/MariaDB 8+
- npm atau yarn

## Step-by-Step Installation

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup Database

Buat database MySQL:

```sql
CREATE DATABASE pawedaran CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 3. Configure Environment

Copy file `.env.example` ke `.env`:

```bash
copy .env.example .env
```

Edit `.env` dan sesuaikan:

```env
DATABASE_URL="mysql://root:password@localhost:3306/pawedaran"
NEXTAUTH_SECRET="generate-random-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"
```

Untuk generate NEXTAUTH_SECRET, gunakan:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 4. Setup Prisma

Generate Prisma Client:
```bash
npx prisma generate
```

Push schema ke database:
```bash
npm run db:push
```

### 5. Seed Database

Isi database dengan data awal:
```bash
npm run db:seed
```

Data yang dibuat:
- Admin: admin@pawedaran.com / admin123
- User: pesantren@example.com / user123
- 5 produk kitab
- 1 paket kitab
- 1 kode promo

### 6. Run Development Server

```bash
npm run dev
```

Buka browser: http://localhost:3000

## Struktur Folder

```
pawedaran/
├── prisma/
│   ├── schema.prisma      # Database schema
│   └── seed.ts            # Seed data
├── public/
│   └── uploads/           # Upload folder (create manually)
├── src/
│   ├── app/
│   │   ├── admin/         # Admin dashboard pages
│   │   ├── api/           # API routes
│   │   ├── katalog/       # Catalog page
│   │   └── login/         # Login page
│   ├── components/        # React components
│   ├── lib/               # Utilities
│   └── types/             # TypeScript types
├── .env                   # Environment variables
└── package.json
```

## Testing

### Login sebagai Admin
- URL: http://localhost:3000/login
- Email: admin@pawedaran.com
- Password: admin123

### Login sebagai User
- URL: http://localhost:3000/login
- Email: pesantren@example.com
- Password: user123

## Troubleshooting

### Error: Cannot connect to database
- Pastikan MySQL running
- Cek DATABASE_URL di .env
- Cek username/password MySQL

### Error: Prisma Client not generated
```bash
npx prisma generate
```

### Error: Table doesn't exist
```bash
npm run db:push
```

### Reset Database
```bash
npx prisma db push --force-reset
npm run db:seed
```

## Production Deployment

### Build untuk Production

```bash
npm run build
npm start
```

### Environment Variables Production

Pastikan set di hosting:
- DATABASE_URL (MySQL production)
- NEXTAUTH_SECRET (random string)
- NEXTAUTH_URL (production URL)

### Recommended Hosting

1. **Vercel** (Recommended)
   - Free tier bagus
   - Auto deploy dari Git
   - Perlu database eksternal (PlanetScale, Railway, dll)

2. **VPS** (Cheapest)
   - DigitalOcean, Vultr, Contabo
   - Install Node.js + MySQL
   - Setup PM2 untuk process manager
   - Setup Nginx sebagai reverse proxy

3. **Railway/Render**
   - Easy deployment
   - Include database
   - Affordable pricing

## Database Backup

Backup database secara berkala:

```bash
mysqldump -u root -p pawedaran > backup_$(date +%Y%m%d).sql
```

Restore:
```bash
mysql -u root -p pawedaran < backup_20240101.sql
```

## Support

Untuk bantuan lebih lanjut, hubungi tim AMSTILATI JABAR I.
