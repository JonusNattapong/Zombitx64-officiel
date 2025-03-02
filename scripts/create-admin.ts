// This script creates an admin user for testing purposes
// Usage: npx ts-node scripts/create-admin.ts

async function createAdmin() {
  try {
    const response = await fetch('http://localhost:3000/api/setup-admin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@zombitx64.com',
        password: 'admin123456',
      }),
    });

    const data = await response.json();
    console.log('Response:', data);
  } catch (error) {
    console.error('Error:', error);
  }
}

createAdmin();
