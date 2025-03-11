// This script creates an admin user for testing purposes
// Usage: npx ts-node scripts/create-admin.ts

// This script creates an admin user for testing purposes
// Usage: npx ts-node scripts/create-admin.ts

async function createAdmin() {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    console.error(
      "Error: ADMIN_EMAIL and ADMIN_PASSWORD environment variables must be set."
    );
    return;
  }

  // Add a delay to ensure the server is fully ready
  await new Promise((resolve) => setTimeout(resolve, 5000)); // 5-second delay

  try {
    const response = await fetch("http://127.0.0.1:3001/api/setup-admin", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: adminEmail,
        password: adminPassword,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      console.log("Admin user created successfully:", data);
    } else {
      console.error("Failed to create admin user:", data);
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

createAdmin();
