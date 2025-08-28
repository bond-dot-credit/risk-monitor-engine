/**
 * Simple script to check if environment variables are properly loaded
 */

console.log("🔍 Checking Environment Variables");
console.log("================================");

// Check if dotenv is needed and load .env.local specifically
try {
  require('dotenv').config({ path: '.env.local' });
  console.log("✅ dotenv loaded from .env.local");
} catch (error) {
  console.log("ℹ️  dotenv not available, using system env");
}

console.log("\n📝 Environment Variables Check:");
console.log("------------------------");

const requiredVars = [
  'NEAR_ACCOUNT_ID', 
  'NEAR_PRIVATE_KEY',
  'NEAR_NODE_URL',
  'NEAR_INTENTS_CONTRACT_ID',
  'VERIFIER_CONTRACT_ID',
  'SOLVER_BUS_URL'
];

let allPresent = true;

for (const envVar of requiredVars) {
  const value = process.env[envVar];
  if (value) {
    // For sensitive variables, only show part of the value
    if (envVar === 'NEAR_PRIVATE_KEY') {
      console.log(`✅ ${envVar}: ${value.substring(0, 20)}...${value.substring(value.length-10)}`);
    } else {
      console.log(`✅ ${envVar}: ${value}`);
    }
  } else {
    console.log(`❌ ${envVar}: NOT FOUND`);
    allPresent = false;
  }
}

console.log("\n📊 Additional Environment Info:");
console.log("------------------------");
console.log(`NEAR_NETWORK_ID: ${process.env.NEAR_NETWORK_ID || 'NOT SET'}`);
console.log(`NODE_ENV: ${process.env.NODE_ENV || 'NOT SET'}`);

console.log("\n🏁 Check Complete");
console.log("==================");
if (allPresent) {
  console.log("✅ All required environment variables are present!");
  console.log("🚀 You're ready to execute NEAR Protocol Rewards transactions");
} else {
  console.log("❌ Missing required environment variables");
  console.log("🔧 Please check your .env.local file");
}

console.log("\n💡 Tip: Try running 'node -r dotenv/config check-env.js' if variables aren't loading");