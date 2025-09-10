import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

console.log('Environment Variables:');
console.log('====================');
console.log('NEAR_ACCOUNT_ID:', process.env.NEAR_ACCOUNT_ID);
console.log('NEAR_PRIVATE_KEY:', process.env.NEAR_PRIVATE_KEY ? `${process.env.NEAR_PRIVATE_KEY.substring(0, 20)}...` : 'NOT SET');
console.log('NEAR_NETWORK_ID:', process.env.NEAR_NETWORK_ID);
console.log('NEAR_NODE_URL:', process.env.NEAR_NODE_URL);
console.log('NEAR_WALLET_URL:', process.env.NEAR_WALLET_URL);
console.log('NEAR_HELPER_URL:', process.env.NEAR_HELPER_URL);