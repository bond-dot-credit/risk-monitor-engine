import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { deriveMultipleWallets } from './src/lib/near-intents/wallet-integration';

async function testWalletDerivation() {
  try {
    console.log('Testing wallet derivation...');
    const wallets = await deriveMultipleWallets('mainnet', 5);
    console.log(`Successfully derived ${wallets.length} wallets:`);
    wallets.forEach((wallet, index) => {
      console.log(`${index + 1}. Account: ${wallet.accountId}`);
    });
  } catch (error) {
    console.error('Error:', error);
  }
}

testWalletDerivation();