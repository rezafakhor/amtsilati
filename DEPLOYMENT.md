# Deployment Guide - PAWEDARAN

## Option 1: Vercel (Recommended - Easiest)

### Pros
- Free tier generous
- Auto deploy dari Git
- Zero config
- Global CDN
- HTTPS otomatis

### Cons
- Perlu database eksternal
- Serverless (cold start)

### Steps

1. **Push ke GitHub**
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <your-repo-url>
git push -u origin main
```

2. **Deploy ke Vercel**
- Login ke vercel.com
- Import repository
- Set environment variables:
  - DATABASE_URL
  - NEXTAUTH_SECRET
  - NEXTAUTH_URL
- Deploy

3. **Setup Database Eksternal**

Pilihan database:
- **PlanetScale** (Recommended - Free tier)
- **Railway** (Affordable)
- **Supabase** (Free tier)
- **AWS RDS** (Production grade)

### PlanetScale Setup
```bash
# Install CLI
npm install -g @planetscale/cli

# Login
pscale auth login

# Create database
pscale database create pawedaran --region ap-southeast

# Get connection string
pscale connect pawedaran main
```

---

## Option 2: VPS (Cheapest - Full Control)

### Pros
- Full control
- Cheapest long-term
- Include database
- No cold start

### Cons
- Manual setup
- Maintenance required

### Recommended VPS Providers
- **Contabo** (€4/month - 4GB RAM)
- **Vultr** ($6/month - 2GB RAM)
- **DigitalOcean** ($12/month - 2GB RAM)
- **Hetzner** (€4/month - 4GB RAM)

### VPS Setup Steps

#### 1. Initial Server Setup

```bash
# SSH ke server
ssh root@your-server-ip

# Update system
apt update && apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

# Install MySQL
apt install -y mysql-server

# Secure MySQL
mysql_secure_installation

# Install PM2
npm install -g pm2

# Install Nginx
apt install -y nginx

# Install Git
apt install -y git
```

#### 2. Setup MySQL

```bash
mysql -u root -p

# Create database
CREATE DATABASE pawedaran CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# Create user
CREATE USER 'pawedaran'@'localhost' IDENTIFIED BY 'strong-password';
GRANT ALL PRIVILEGES ON pawedaran.* TO 'pawedaran'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

#### 3. Deploy Application

```bash
# Create app directory
mkdir -p /var/www/pawedaran
cd /var/www/pawedaran

# Clone repository
git clone <your-repo-url> .

# Install dependencies
npm install

# Create .env
nano .env
```

Isi .env:
```env
DATABASE_URL="mysql://pawedaran:strong-password@localhost:3306/pawedaran"
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="https://yourdomain.com"
```

```bash
# Setup database
npx prisma generate
npx prisma db push
npm run db:seed

# Build
npm run build

# Start with PM2
pm2 start npm --name "pawedaran" -- start
pm2 save
pm2 startup
```

#### 4. Setup Nginx

```bash
nano /etc/nginx/sites-available/pawedaran
```

Isi config:
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Enable site
ln -s /etc/nginx/sites-available/pawedaran /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

#### 5. Setup SSL (HTTPS)

```bash
# Install Certbot
apt install -y certbot python3-certbot-nginx

# Get certificate
certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto renewal
certbot renew --dry-run
```

#### 6. Maintenance Commands

```bash
# View logs
pm2 logs pawedaran

# Restart app
pm2 restart pawedaran

# Update app
cd /var/www/pawedaran
git pull
npm install
npm run build
pm2 restart pawedaran

# Backup database
mysqldump -u pawedaran -p pawedaran > backup_$(date +%Y%m%d).sql

# Monitor
pm2 monit
```

---

## Option 3: Railway (Balanced)

### Pros
- Easy deployment
- Include database
- Affordable ($5-20/month)
- Auto scaling

### Steps

1. Login ke railway.app
2. New Project → Deploy from GitHub
3. Add MySQL database
4. Set environment variables
5. Deploy

---

## Option 4: Docker (Advanced)

### Dockerfile

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npx prisma generate
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

### docker-compose.yml

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=mysql://root:password@db:3306/pawedaran
      - NEXTAUTH_SECRET=your-secret
      - NEXTAUTH_URL=http://localhost:3000
    depends_on:
      - db

  db:
    image: mysql:8
    environment:
      - MYSQL_ROOT_PASSWORD=password
      - MYSQL_DATABASE=pawedaran
    volumes:
      - mysql_data:/var/lib/mysql

volumes:
  mysql_data:
```

Deploy:
```bash
docker-compose up -d
```

---

## Cost Comparison

| Provider | Monthly Cost | Database | Traffic | Notes |
|----------|-------------|----------|---------|-------|
| Vercel + PlanetScale | $0-20 | 5GB free | Unlimited | Best for start |
| VPS (Contabo) | €4 | Included | Unlimited | Cheapest |
| Railway | $5-20 | Included | Fair use | Easy setup |
| DigitalOcean | $12+ | Included | 1TB | Reliable |

## Recommendation

- **Starting/Testing**: Vercel + PlanetScale (Free)
- **Small Business**: VPS Contabo (€4/month)
- **Medium Business**: DigitalOcean ($12/month)
- **Enterprise**: AWS/GCP (Custom)

## Post-Deployment Checklist

- [ ] Database backup setup
- [ ] SSL certificate installed
- [ ] Environment variables set
- [ ] Monitoring setup (PM2/Vercel)
- [ ] Domain configured
- [ ] Email notifications (optional)
- [ ] Error tracking (Sentry)
- [ ] Analytics (Google Analytics)
- [ ] Performance monitoring
- [ ] Security headers
- [ ] Rate limiting
- [ ] CORS configuration
