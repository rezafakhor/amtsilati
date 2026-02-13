# Development Guide - PAWEDARAN

Panduan untuk developer yang akan melanjutkan development PAWEDARAN.

## 🏗️ Architecture Overview

### Stack
- **Frontend**: Next.js 14 (App Router) + React + TypeScript
- **Backend**: Next.js API Routes (serverless)
- **Database**: MySQL/MariaDB + Prisma ORM
- **Auth**: NextAuth.js (JWT sessions)
- **Styling**: Tailwind CSS + Framer Motion

### Design Patterns
- **Server Components** untuk data fetching
- **Client Components** untuk interactivity
- **API Routes** untuk business logic
- **Prisma** untuk database operations
- **Middleware** untuk authentication

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (routes)/          # Route groups
│   ├── api/               # API endpoints
│   └── layout.tsx         # Root layout
├── components/            # React components
│   ├── admin/            # Admin-specific
│   └── ui/               # Shared UI
├── lib/                  # Utilities
│   ├── auth.ts          # Auth config
│   ├── prisma.ts        # DB client
│   └── utils.ts         # Helpers
└── types/               # TypeScript types
```

## 🔧 Development Workflow

### 1. Setup Development Environment

```bash
# Install dependencies
npm install

# Setup database
npm run db:push
npm run db:seed

# Run dev server
npm run dev
```

### 2. Create New Feature

#### A. Database Changes

```bash
# 1. Edit prisma/schema.prisma
# 2. Push changes
npm run db:push

# 3. Generate client
npx prisma generate
```

#### B. Create API Route

```typescript
// src/app/api/example/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await prisma.model.findMany();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
```

#### C. Create Page

```typescript
// src/app/example/page.tsx
import { prisma } from "@/lib/prisma";

export default async function ExamplePage() {
  // Server-side data fetching
  const data = await prisma.model.findMany();

  return (
    <div>
      {/* Your UI */}
    </div>
  );
}
```

#### D. Create Component

```typescript
// src/components/ExampleComponent.tsx
"use client"; // If needs interactivity

import { useState } from "react";

export default function ExampleComponent() {
  const [state, setState] = useState();

  return (
    <div className="card-3d">
      {/* Your component */}
    </div>
  );
}
```

### 3. Testing

```bash
# Run linter
npm run lint

# Check types
npx tsc --noEmit

# Test build
npm run build
```

## 🎨 Design System Usage

### Colors

```tsx
// Tailwind classes
<div className="bg-primary text-white">
<div className="bg-accent text-white">
<div className="bg-cream text-dark">
```

### Components

```tsx
// Card 3D
<div className="card-3d">
  {/* Content */}
</div>

// Button Primary
<button className="btn-primary">
  Click me
</button>

// Button Accent
<button className="btn-accent">
  Click me
</button>

// Input Field
<input className="input-field" />
```

### Typography

```tsx
// Heading (serif)
<h1 className="font-serif text-4xl font-bold">

// Body (sans-serif)
<p className="font-sans text-base">
```

## 🔐 Authentication

### Protect Page

```typescript
// src/app/protected/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function ProtectedPage() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect("/login");
  }

  return <div>Protected content</div>;
}
```

### Protect API Route

```typescript
// src/app/api/protected/route.ts
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Your logic
}
```

### Check Role

```typescript
if (session.user.role !== "SUPERADMIN") {
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}
```

## 💾 Database Operations

### Query Examples

```typescript
// Find many
const products = await prisma.product.findMany({
  where: { isActive: true },
  include: { category: true },
  orderBy: { createdAt: 'desc' }
});

// Find unique
const product = await prisma.product.findUnique({
  where: { id: productId }
});

// Create
const product = await prisma.product.create({
  data: {
    name: "Kitab",
    price: 50000,
    stock: 100
  }
});

// Update
const product = await prisma.product.update({
  where: { id: productId },
  data: { stock: { increment: 10 } }
});

// Delete
await prisma.product.delete({
  where: { id: productId }
});

// Transaction
await prisma.$transaction([
  prisma.product.update({ where: { id: 1 }, data: { stock: { decrement: 1 } } }),
  prisma.order.create({ data: { /* ... */ } })
]);
```

## 🎯 Common Tasks

### Add New Product Field

1. Edit `prisma/schema.prisma`:
```prisma
model Product {
  // ... existing fields
  newField String?
}
```

2. Push to database:
```bash
npm run db:push
```

3. Update forms & displays

### Add New Page

1. Create file in `src/app/`:
```typescript
// src/app/new-page/page.tsx
export default function NewPage() {
  return <div>New Page</div>;
}
```

2. Add to navigation if needed

### Add New API Endpoint

1. Create route file:
```typescript
// src/app/api/new-endpoint/route.ts
export async function GET() {
  return NextResponse.json({ message: "Hello" });
}
```

2. Call from frontend:
```typescript
const res = await fetch("/api/new-endpoint");
const data = await res.json();
```

## 🐛 Debugging

### View Database

```bash
# Open Prisma Studio
npx prisma studio
```

### Check Logs

```bash
# Development logs
npm run dev

# Production logs (if using PM2)
pm2 logs pawedaran
```

### Common Issues

#### Prisma Client not generated
```bash
npx prisma generate
```

#### Database out of sync
```bash
npm run db:push
```

#### Port already in use
```bash
# Kill process on port 3000
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:3000 | xargs kill -9
```

## 📝 Code Style

### TypeScript

```typescript
// Use interfaces for objects
interface Product {
  id: string;
  name: string;
  price: number;
}

// Use types for unions
type Status = "active" | "inactive";

// Use async/await
async function fetchData() {
  const data = await prisma.product.findMany();
  return data;
}
```

### React

```typescript
// Use functional components
export default function Component() {
  return <div>Content</div>;
}

// Use hooks
const [state, setState] = useState();
const data = useMemo(() => compute(), [deps]);

// Use client directive when needed
"use client";
```

### Naming Conventions

- **Files**: kebab-case (`product-card.tsx`)
- **Components**: PascalCase (`ProductCard`)
- **Functions**: camelCase (`fetchProducts`)
- **Constants**: UPPER_CASE (`MAX_ITEMS`)
- **Types**: PascalCase (`ProductType`)

## 🚀 Deployment

### Build for Production

```bash
npm run build
npm start
```

### Environment Variables

Required for production:
```env
DATABASE_URL="mysql://..."
NEXTAUTH_SECRET="random-secret"
NEXTAUTH_URL="https://yourdomain.com"
```

### Pre-deployment Checklist

- [ ] All features tested
- [ ] No console errors
- [ ] Build succeeds
- [ ] Database migrated
- [ ] Environment variables set
- [ ] SSL certificate ready
- [ ] Backup strategy in place

## 📚 Resources

### Documentation
- [Next.js Docs](https://nextjs.org/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [NextAuth Docs](https://next-auth.js.org)
- [Tailwind Docs](https://tailwindcss.com/docs)

### Tools
- [Prisma Studio](https://www.prisma.io/studio) - Database GUI
- [Postman](https://www.postman.com) - API testing
- [React DevTools](https://react.dev/learn/react-developer-tools)

## 🤝 Contributing

### Git Workflow

```bash
# Create feature branch
git checkout -b feature/new-feature

# Make changes
git add .
git commit -m "feat: add new feature"

# Push
git push origin feature/new-feature

# Create pull request
```

### Commit Messages

```
feat: add new feature
fix: fix bug
docs: update documentation
style: format code
refactor: refactor code
test: add tests
chore: update dependencies
```

## 💡 Tips

1. **Use Server Components** by default, only use Client Components when needed
2. **Fetch data** in Server Components, not in API routes
3. **Use Prisma transactions** for related operations
4. **Add loading states** for better UX
5. **Handle errors** gracefully
6. **Validate inputs** on both client and server
7. **Use TypeScript** for type safety
8. **Follow design system** for consistency

## 🆘 Getting Help

- Check documentation files
- Review existing code
- Search GitHub issues
- Contact AMSTILATI JABAR I team

---

Happy coding! 🚀
