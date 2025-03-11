const { PrismaClient } = require('@prisma/client');
const db = new PrismaClient();

async function main() {
try {
// Test database connection
console.log("Testing database connection...");
const userCount = await db.user.count();
console.log(`Database connected. Current user count: ${userCount}`);

// Test creating a user
console.log("\nTesting user creation...");
const user = await db.user.create({
  data: {
    name: "Test User",
    email: "test@example.com",
    role: "user",
  },
});
console.log("Created user:", user.id);

// Test creating a product with JSON-serialized tags
console.log("\nTesting product creation with tags...");
const product = await db.product.create({
  data: {
    title: "Test Product",
    description: "A test product",
    price: 99.99,
    fileHash: "test-hash",
    category: "test",
    tags: JSON.stringify(["tag1", "tag2", "tag3"]), // Store tags as JSON string
    ownerId: user.id,
  },
});
console.log("Created product:", product.id);
console.log("Product tags:", JSON.parse(product.tags));

// Clean up test data
console.log("\nCleaning up test data...");
await db.product.delete({ where: { id: product.id } });
await db.user.delete({ where: { id: user.id } });
console.log("Test data cleaned up successfully");

console.log("\nAll tests passed! Database is working correctly.");
} catch (error) {
console.error("Test failed:", error.message);
throw error;
} finally {
await db.$disconnect();
}
}

main()
.catch((e) => {
console.error(e);
process.exit(1);
});
