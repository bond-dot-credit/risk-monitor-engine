import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { initializeWalletConnection } from './src/lib/near-intents/wallet-integration';

async function testWalletConnection() {
  try {
    console.log('Testing wallet connection...');
    const wallet = await initializeWalletConnection('mainnet');
    console.log(`Successfully connected to account: ${wallet.accountId}`);
    
    // Try to get account balance
    try {
      const balance = await wallet.account.getAccountBalance();
      console.log(`Account balance: ${parseFloat(balance.available) / 1e24} NEAR`);
    } catch (error: any) {
      if (error.type === 'AccountDoesNotExist') {
        console.log('Account does not exist yet. This is normal for new accounts.');
      } else {
        console.log('Error getting account balance:', error.message);
      }
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

testWalletConnection();