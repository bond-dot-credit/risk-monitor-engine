import { setupWalletSelector } from '@near-wallet-selector/core';
import { setupModal } from '@near-wallet-selector/modal-ui';
import { setupLedger } from '@near-wallet-selector/ledger';
import { setupMyNearWallet } from '@near-wallet-selector/my-near-wallet';
import { setupSender } from '@near-wallet-selector/sender';

// Import modal CSS
import '@near-wallet-selector/modal-ui/styles.css';

export interface WalletSelectorConfig {
  networkId: 'testnet' | 'mainnet';
  nodeUrl: string;
  walletUrl: string;
  helperUrl: string;
  explorerUrl: string;
}

export const defaultConfig: WalletSelectorConfig = {
  networkId: (process.env.NEXT_PUBLIC_NEAR_NETWORK_ID as 'testnet' | 'mainnet') || 'testnet',
  nodeUrl: process.env.NEXT_PUBLIC_NEAR_NODE_URL || 'https://rpc.testnet.near.org',
  walletUrl: process.env.NEXT_PUBLIC_NEAR_WALLET_URL || 'https://testnet.mynearwallet.com',
  helperUrl: 'https://helper.testnet.near.org',
  explorerUrl: 'https://testnet.nearblocks.io',
};

export async function createWalletSelector(config: WalletSelectorConfig = defaultConfig) {
  try {
    console.log('Creating wallet selector with config:', config);
    
    const selector = await setupWalletSelector({
      network: config.networkId,
      debug: process.env.NODE_ENV === 'development',
      modules: [
        setupMyNearWallet({
          walletUrl: config.walletUrl,
        }),
        // Temporarily disable Sender and Ledger to avoid compatibility issues
        // setupSender(),
        // setupLedger(),
      ],
    });

    console.log('Wallet selector created successfully');
    return selector;
  } catch (error) {
    console.error('Error creating wallet selector:', error);
    throw error;
  }
}

export async function createWalletSelectorModal(selector: any) {
  const modal = setupModal(selector, {
    contractId: process.env.NEXT_PUBLIC_NEAR_CONTRACT_ID || 'test.near',
    methodNames: ['nft_mint', 'nft_transfer'],
  });

  return modal;
}
