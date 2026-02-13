# 🎯 START HERE - Deploy Amtsilati Website

## 📊 Current Status

```
✅ Code Ready
✅ Build Successful  
✅ Database Schema Ready
✅ SQL Files Generated
✅ Documentation Complete

⏳ Waiting: Database Setup + Vercel Config
```

---

## 🚀 3 SIMPLE STEPS TO GO LIVE

### STEP 1: Setup Database (5 min) 🗄️

1. Open https://supabase.com
2. Select project **"amtsilati"**
3. Click **"SQL Editor"** → **"New query"**
4. Open file `schema.sql` in this project
5. Copy ALL content (Ctrl+A, Ctrl+C)
6. Paste in Supabase SQL Editor
7. Click **"Run"** (Ctrl+Enter)
8. Wait for "Success" ✅

**Create Users:**
1. Click **"New query"** again
2. Copy this SQL:

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

3. Click **"Run"**
4. Verify: Click **"Table Editor"** → **"User"** → Should see 2 users ✅

---

### STEP 2: Configure Vercel (3 min) ⚙️

1. Open https://vercel.com
2. Select project **"amtsilati"**
3. Click **Settings** → **Environment Variables**
4. Add these 4 variables:

#### Variable 1: DATABASE_URL
```
postgresql://postgres.aldfnmhqvpyozfiwser1:6t9j9HPLjoXAfslC@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

#### Variable 2: DIRECT_URL
```
postgresql://postgres:6t9j9HPLjoXAfslC@db.aldfnmhqvpyozfiwser1.supabase.co:5432/postgres
```

#### Variable 3: NEXTAUTH_SECRET
```
0060e084280b8bc2cbd8e34eb10444b91103b887de4445d54c659065bacecc86
```

#### Variable 4: NEXTAUTH_URL
```
https://amtsilati.vercel.app
```

5. Click **"Save"** for each ✅

---

### STEP 3: Deploy (2 min) 🚀

Open terminal in this project folder:

```bash
git add .
git commit -m "Setup database for production"
git push origin main
```

Vercel will auto-deploy! ✅

Wait 2-3 minutes, then open: **https://amtsilati.vercel.app**

---

## 🎉 TEST YOUR WEBSITE

### Test Admin Login
1. Go to https://amtsilati.vercel.app
2. Click **"Login"**
3. Enter:
   - Email: `admin@pawedaran.com`
   - Password: `admin123`
4. Should see Admin Dashboard ✅

### Test User Login
1. Logout
2. Login with:
   - Email: `pesantren@example.com`
   - Password: `user123`
3. Should see User Profile ✅

---

## 📁 HELPFUL FILES

If you need more details:

- **QUICK_SETUP.md** - Detailed step-by-step guide
- **CHECKLIST.md** - Track your progress
- **READY_TO_DEPLOY.md** - Complete overview
- **SETUP_MANUAL_SQL.md** - Troubleshooting guide

---

## ❓ TROUBLESHOOTING

### Database Connection Error
- Check all 4 environment variables in Vercel
- Make sure Supabase project is "Active" (not "Paused")
- Redeploy in Vercel

### Login Failed
- Check Supabase Table Editor → User table
- Should have 2 users (admin + user)
- Re-run the SQL INSERT if missing

### Build Error
- Check Vercel deployment logs
- Make sure all environment variables are set
- Try redeploying

---

## ⏱️ TOTAL TIME: ~10 MINUTES

```
Step 1: Database Setup     → 5 min
Step 2: Vercel Config      → 3 min  
Step 3: Deploy & Test      → 2 min
────────────────────────────────────
TOTAL                      → 10 min
```

---

## 🎊 AFTER SUCCESSFUL DEPLOYMENT

Your website is LIVE at: **https://amtsilati.vercel.app**

### Available Features:
✅ User Registration & Login
✅ Product Catalog with Search
✅ Shopping Cart & Checkout
✅ Order Management
✅ Payment with Proof Upload
✅ Debt Management
✅ Admin Dashboard with Analytics
✅ Product & Package Management
✅ Order Processing with Tracking
✅ Promo Code System
✅ Stock Management
✅ User Management
✅ Diklat & Agenda Management
✅ Partner Management

---

## 🔐 IMPORTANT CREDENTIALS

### Supabase
- Project: amtsilati
- Password: 6t9j9HPLjoXAfslC

### Website Login
- Admin: admin@pawedaran.com / admin123
- User: pesantren@example.com / user123

### GitHub
- Repo: https://github.com/rezafakhor/amtsilati

### Vercel
- URL: https://amtsilati.vercel.app

---

<div align="center">

## 🚀 READY? LET'S GO!

**Follow the 3 steps above and your website will be live in 10 minutes!**

Need help? Check **QUICK_SETUP.md** for detailed instructions.

</div>
