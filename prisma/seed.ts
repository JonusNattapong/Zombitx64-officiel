import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Create test user if not exists
  const testUserEmail = 'test@example.com';
  const existingUser = await prisma.user.findUnique({
    where: { email: testUserEmail }
  });

  let user;
  if (!existingUser) {
    user = await prisma.user.create({
      data: {
        email: testUserEmail,
        name: 'Test User',
        password: await hash('password123', 12),
      },
    });
  } else {
    user = existingUser;
  }

 // Add learning progress
 for (const progress of [
  {
    courseId: 'nextjs-101',
    userId: user.id,
    completed: false,
    timeSpent: 120,
    progress: 75.0
  },
  {
    courseId: 'solidity-basics',
    userId: user.id,
    completed: false,
    timeSpent: 45,
    progress: 30.0
  },
  {
    courseId: 'web3-intro',
    userId: user.id,
    completed: true,
    timeSpent: 180,
    progress: 100.0
  }
]) {
  await prisma.learningProgress.create({
    data: progress
  });
}

// Add activity logs
for (const log of [
  {
 userId: user.id,
    type: 'course_progress',
    description: 'Completed Next.js Module 3',
    createdAt: new Date(),
  },
  {
    userId: user.id,
    type: 'course_started',
    description: 'Started Solidity Basics course',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
  },
  {
    userId: user.id,
    type: 'achievement',
    description: 'Earned Web3 Fundamentals Certificate',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
  },
]) {
await prisma.activityLog.create({
  data: log
});
}

  // Add sample marketplace products
  const products = [
    {
      title: "AI Image Generation Model",
      description: "Advanced AI model for generating high-quality images from text descriptions",
      price: 99.99,
      category: "ai models",
      fileHash: "hash123",
      version: "1.0.0",
      metrics: JSON.stringify({ downloads: 150, rating: 4.8 }),
      extendedMetrics: null,
      tags: "ai,image,generation",
      ownerId: user.id,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      title: "Blockchain Analytics Dataset",
      description: "Comprehensive dataset of blockchain transactions and metrics",
      price: 149.99,
      category: "datasets",
      fileHash: "hash456",
      version: "2.1.0",
      metrics: JSON.stringify({ downloads: 75, rating: 4.5 }),
      extendedMetrics: null,
      tags: "blockchain,analytics,data",
      ownerId: user.id,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      title: "Smart Contract Security Scanner",
      description: "Automated tool for detecting vulnerabilities in smart contracts",
      price: 199.99,
      category: "tools",
      fileHash: "hash789",
      version: "1.2.0",
      metrics: JSON.stringify({ downloads: 200, rating: 4.9 }),
      extendedMetrics: null,
      tags: "security,smart-contracts,scanner",
      ownerId: user.id,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      title: "Crypto Price API",
      description: "Real-time cryptocurrency price and market data API",
      price: 49.99,
      category: "apis",
      fileHash: "hash012",
      version: "3.0.0",
      metrics: JSON.stringify({ downloads: 300, rating: 4.7 }),
      extendedMetrics: null,
      tags: "api,crypto,price",
      ownerId: user.id,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      title: "Web3 Integration Plugin",
      description: "Easy-to-use plugin for integrating Web3 functionality into existing apps",
      price: 79.99,
      category: "plugins",
      fileHash: "hash345",
      version: "1.1.0",
      metrics: JSON.stringify({ downloads: 250, rating: 4.6 }),
      extendedMetrics: null,
      tags: "web3,plugin,integration",
      ownerId: user.id,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      title: "DeFi Protocol Documentation",
      description: "Comprehensive documentation for implementing DeFi protocols",
      price: 29.99,
      category: "documentation",
      fileHash: "hash678",
      version: "1.0.0",
      metrics: JSON.stringify({ downloads: 180, rating: 4.4 }),
      extendedMetrics: null,
      tags: "defi,docs,protocol",
      ownerId: user.id,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

 // Create products using createMany
 try {
  for (const productData of products) {
      const existingProduct = await prisma.product.findFirst({
        where: {
          title: productData.title,
          ownerId: productData.ownerId
        }
      });
      if (!existingProduct) {
        await prisma.product.create({ data: productData });
      }
  }
  console.log('Products created successfully');
 } catch (error) {
  console.error('Error creating products:', error);
 }

  console.log('Seed data created successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
