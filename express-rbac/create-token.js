// create-token.js
require('dotenv').config();
const { createClerkClient } = require('@clerk/backend');

const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

async function generateToken() {
  const userId = 'YOUR_USER_ID'; // replace with actual Clerk user ID
  const session = await clerk.sessions.create({ userId });
  console.log('Test token:', session.id);
}

generateToken();
