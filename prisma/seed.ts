import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';

const prisma = new PrismaClient();

// Generate cuid-like ID
function generateId() {
  return 'c' + randomBytes(12).toString('base64').replace(/[^a-z0-9]/gi, '').substring(0, 24);
}

async function main() {
  console.log('🌱 Seeding database...');

  // Create Superadmin
  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@pawedaran.com' },
    update: {},
    create: {
      id: generateId(),
      email: 'admin@pawedaran.com',
      password: hashedPassword,
      name: 'Super Admin',
      role: 'SUPERADMIN',
      updatedAt: new Date(),
    },
  });

  console.log('✅ Admin created:', admin.email);

  // Create sample user
  const userPassword = await bcrypt.hash('user123', 10);
  
  const user = await prisma.user.upsert({
    where: { email: 'pesantren@example.com' },
    update: {},
    create: {
      id: generateId(),
      email: 'pesantren@example.com',
      password: userPassword,
      name: 'Pesantren Al-Hikmah',
      role: 'USER',
      pesantrenName: 'Pesantren Al-Hikmah',
      address: 'Jl. Raya Pesantren No. 123',
      phone: '081234567890',
      city: 'Bandung',
      province: 'Jawa Barat',
      postalCode: '40123',
      updatedAt: new Date(),
    },
  });

  console.log('✅ User created:', user.email);

  // Create sample products
  const products = [
    {
      name: 'Kitab Fathul Qorib',
      description: 'Kitab fiqih madzhab Syafi\'i untuk pemula',
      price: 75000,
      stock: 50,
      minStock: 10,
      isBestseller: true,
    },
    {
      name: 'Kitab Safinatun Najah',
      description: 'Kitab fiqih ringkas untuk santri',
      price: 45000,
      stock: 100,
      minStock: 20,
      isBestseller: true,
    },
    {
      name: 'Kitab Jurumiyah',
      description: 'Kitab nahwu dasar',
      price: 35000,
      stock: 80,
      minStock: 15,
    },
    {
      name: 'Kitab Imriti',
      description: 'Kitab mantiq untuk santri menengah',
      price: 55000,
      stock: 40,
      minStock: 10,
    },
    {
      name: 'Kitab Alfiyah Ibnu Malik',
      description: 'Kitab nahwu tingkat lanjut',
      price: 95000,
      stock: 30,
      minStock: 5,
    },
  ];

  for (const product of products) {
    await prisma.product.create({
      data: {
        id: generateId(),
        updatedAt: new Date(),
        ...product,
      },
    });
  }

  console.log('✅ Products created:', products.length);

  // Create sample package
  const createdProducts = await prisma.product.findMany();
  
  const package1 = await prisma.renamedpackage.create({
    data: {
      id: generateId(),
      name: 'Paket Kitab Fiqih Dasar',
      description: 'Paket lengkap kitab fiqih untuk santri pemula',
      price: 150000,
      updatedAt: new Date(),
    },
  });

  // Create package items
  await prisma.packageitem.create({
    data: {
      id: generateId(),
      packageId: package1.id,
      productId: createdProducts[0].id,
      quantity: 1,
    },
  });

  await prisma.packageitem.create({
    data: {
      id: generateId(),
      packageId: package1.id,
      productId: createdProducts[1].id,
      quantity: 1,
    },
  });

  console.log('✅ Package created:', package1.name);

  // Create sample promo
  const promo = await prisma.promo.create({
    data: {
      id: generateId(),
      code: 'RAMADHAN2024',
      discountType: 'PERCENTAGE',
      discountValue: 10,
      maxUsage: 100,
      isActive: true,
      updatedAt: new Date(),
    },
  });

  console.log('✅ Promo created:', promo.code);

  console.log('🎉 Seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
