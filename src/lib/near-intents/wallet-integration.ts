import { InMemoryKeyStore, KeyPair } from '@near-js/keystores';
import { Account } from '@near-js/accounts';
import { JsonRpcProvider } from '@near-js/providers';
import { KeyPairSigner } from '@near-js/signers';
import { KeyPair } from '@near-js/crypto';
import { parseSeedPhrase } from 'near-seed-phrase';
import { nearIntentsConfig } from './config';

// Your wallet mnemonic phrase
const WALLET_MNEMONIC = 'forget kite door execute produce head young caution rotate scout noodle coach';

export interface WalletConnection {
  account: Account;
  accountId: string;
  keyPair: KeyPair;
}

export interface DerivedWallet {
  accountId: string;
  privateKey: string;
  publicKey: string;
  index: number;
}

/**
 * Initialize NEAR connection with the provided mnemonic phrase
 */
export async function initializeWalletConnection(networkId: string = 'mainnet'): Promise<WalletConnection> {
  try {
    // Parse the seed phrase to get the key pair
    const { secretKey, publicKey } = parseSeedPhrase(WALLET_MNEMONIC);
    const keyPair = KeyPair.fromString(secretKey);
    
    // Derive account ID from public key (for implicit accounts)
    const implicitAccountId = Buffer.from(keyPair.getPublicKey().data).toString('hex');
    
    // Use testnet account format
    const accountId = networkId === 'testnet' 
      ? `${implicitAccountId}.testnet` 
      : implicitAccountId;
    
    // Create key store and add the key
    const keyStore = new InMemoryKeyStore();
    await keyStore.setKey(networkId, accountId, keyPair);
    
    // Use the configured node URL from nearIntentsConfig to avoid rate limiting
    const nodeUrl = nearIntentsConfig.getConfig().nodeUrl;
      
    const provider = new JsonRpcProvider({ url: nodeUrl });
    const signer = new KeyPairSigner(keyPair);
    
    // Create account instance
    const account = new Account(accountId, provider, signer);
    
    // Verify account exists and is accessible
    try {
      const accountState = await account.state();
      console.log(`Connected to account: ${accountId}`);
      console.log(`Account balance: ${(parseFloat(accountState.amount) / 1e24).toFixed(4)} NEAR`);
    } catch (error) {
      console.warn(`Account ${accountId} might not exist yet. This is normal for new accounts.`);
    }
    
    return {
      account,
      accountId,
      keyPair,
    };
  } catch (error) {
    console.error('Error initializing wallet connection:', error);
    throw new Error(`Failed to initialize wallet: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Derive multiple wallets from the seed phrase using HD derivation
 * This generates 100+ unique wallets as required for the NEAR Protocol Rewards program
 */
export async function deriveMultipleWallets(networkId: string = 'testnet', count: number = 100): Promise<DerivedWallet[]> {
  try {
    const wallets: DerivedWallet[] = [];
    
    console.log(`Deriving ${count} wallets from seed phrase...`);
    
    for (let i = 0; i < count; i++) {
      // Derive key for each index using BIP44 path for NEAR
      // Using hardened derivation for all segments to comply with near-hd-key requirements
      const path = `m/44'/397'/0'/0'/${i}'`;
      const { secretKey, publicKey } = parseSeedPhrase(WALLET_MNEMONIC, path);
      
      // Create key pair
      const keyPair = KeyPair.fromString(secretKey);
      
      // Derive account ID from public key (for implicit accounts)
      const implicitAccountId = Buffer.from(keyPair.getPublicKey().data).toString('hex');
      
      // Use testnet account format
      const accountId = networkId === 'testnet' 
        ? `${implicitAccountId}.testnet` 
        : implicitAccountId;
      
      wallets.push({
        accountId,
        privateKey: secretKey,
        publicKey,
        index: i
      });
      
      if ((i + 1) % 10 === 0) {
        console.log(`Derived ${i + 1}/${count} wallets...`);
      }
    }
    
    console.log(`Successfully derived ${wallets.length} wallets from seed phrase`);
    return wallets;
  } catch (error) {
    console.error('Error deriving multiple wallets:', error);
    throw new Error(`Failed to derive wallets: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get account balance in NEAR tokens
 */
export async function getAccountBalance(account: Account): Promise<{
  total: string;
  available: string;
  staked: string;
  locked: string;
  totalInNear: number;
  availableInNear: number;
}> {
  try {
    const balance = await (account as any).getAccountBalance();
    
    return {
      total: balance.total,
      available: balance.available,
      staked: balance.staked,
      locked: balance.locked,
      totalInNear: parseFloat(balance.total) / 1e24,
      availableInNear: parseFloat(balance.available) / 1e24,
    };
  } catch (error) {
    console.error('Error getting account balance:', error);
    throw error;
  }
}

/**
 * Execute a NEAR token transfer
 */
export async function transferNear(
  account: Account,
  receiverId: string,
  amount: number // Amount in NEAR
): Promise<any> {
  try {
    // Convert to yoctoNEAR using BigInt to avoid precision issues
    const yoctoAmount = BigInt(Math.round(amount * 1e24)).toString();
    
    const result = await (account as any).sendMoney(
      receiverId,
      yoctoAmount
    );
    
    console.log(`Transfer successful: ${amount} NEAR to ${receiverId}`);
    console.log(`Transaction hash: ${result.transaction.hash}`);
    
    return result;
  } catch (error) {
    console.error('Error transferring NEAR:', error);
    throw error;
  }
}

/**
 * Execute a function call on a smart contract
 */
export async function callContract(
  account: Account,
  contractId: string,
  methodName: string,
  args: any,
  attachedDeposit: string = '0',
  gas: string = '300000000000000'
): Promise<any> {
  try {
    const result = await (account as any).functionCall({
      contractId,
      methodName,
      args,
      attachedDeposit,
      gas,
    });
    
    console.log(`Contract call successful: ${contractId}.${methodName}`);
    console.log(`Transaction hash: ${result.transaction.hash}`);
    
    return result;
  } catch (error) {
    console.error('Error calling contract:', error);
    throw error;
  }
}

/**
 * Execute a token swap using Ref Finance
 */
export async function swapTokensOnRef(
  account: Account,
  tokenIn: string,
  tokenOut: string,
  amountIn: number,
  minAmountOut?: number
): Promise<any> {
  try {
    const refFinanceContract = 'v2.ref-finance.near';
    const yoctoAmountIn = (amountIn * 1e24).toString();
    const yoctoMinAmountOut = minAmountOut ? (minAmountOut * 1e24).toString() : '0';
    
    // First, we need to register the tokens if not already registered
    // This is a simplified example - in practice you'd check registration status first
    
    const swapArgs = {
      actions: [{
        pool_id: 0, // This should be the actual pool ID for the token pair
        token_in: tokenIn,
        amount_in: yoctoAmountIn,
        token_out: tokenOut,
        min_amount_out: yoctoMinAmountOut,
      }],
    };
    
    const result = await callContract(
      account,
      refFinanceContract,
      'swap',
      swapArgs,
      '1', // Small deposit for storage
      '300000000000000'
    );
    
    return result;
  } catch (error) {
    console.error('Error swapping tokens on Ref Finance:', error);
    throw error;
  }
}

/**
 * Get transaction status
 */
export async function getTransactionStatus(
  near: Near,
  txHash: string,
  accountId: string
): Promise<any> {
  try {
    const result = await near.connection.provider.txStatus(txHash, accountId);
    return result;
  } catch (error) {
    console.error('Error getting transaction status:', error);
    throw error;
  }
}

/**
 * Example usage function demonstrating the wallet integration
 */
export async function demonstrateWalletUsage(): Promise<void> {
  try {
    console.log('🚀 Initializing NEAR wallet connection...');
    
    // Initialize connection
    const wallet = await initializeWalletConnection('testnet');
    console.log(`✅ Connected to account: ${wallet.accountId}`);
    
    // Get balance
    const balance = await getAccountBalance(wallet.account);
    console.log(`💰 Account balance: ${balance.availableInNear.toFixed(4)} NEAR available`);
    
    // Example: Check if we have enough balance for operations
    if (balance.availableInNear > 0.1) {
      console.log('✅ Sufficient balance for operations');
      
      // Example: Call a view method to get account info
      try {
        const accountState = await wallet.account.state();
        console.log('📊 Account state:', {
          amount: (parseFloat(accountState.amount) / 1e24).toFixed(4) + ' NEAR',
          locked: (parseFloat(accountState.locked) / 1e24).toFixed(4) + ' NEAR',
          storage_usage: accountState.storage_usage,
        });
      } catch (error) {
        console.log('⚠️ Could not fetch account state (account might be new)');
      }
      
      // You can add more operations here:
      // - Token swaps
      // - Contract interactions
      // - Intent submissions
      
    } else {
      console.log('⚠️ Insufficient balance. Please fund the account using testnet faucet.');
      console.log('🔗 Testnet faucet: https://near-faucet.io/');
    }
    
  } catch (error) {
    console.error('❌ Error in wallet demonstration:', error);
  }
}

// Auto-run demonstration if this file is executed directly
if (require.main === module) {
  demonstrateWalletUsage();
}