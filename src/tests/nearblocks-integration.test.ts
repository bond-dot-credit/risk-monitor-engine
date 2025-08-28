import { describe, it, expect, beforeAll } from '@jest/globals';

describe('NearBlocks Integration', () => {
  beforeAll(() => {
    // Set environment variable for testing
    process.env.NEARBLOCKS_API_KEY = process.env.NEARBLOCKS_API_KEY || 'C250644665EF49FA81C555440644CFDA';
  });

  it('should fetch transactions for bctemp.near wallet', async () => {
    const response = await fetch('http://localhost:3000/api/nearblocks-proxy?accountId=bctemp.near');
    const data = await response.json();
    
    expect(response.status).toBe(200);
    expect(data).toHaveProperty('success', true);
    expect(data).toHaveProperty('data');
    expect(data).toHaveProperty('message');
    
    // If we get real data (not mock), verify structure
    if (!data.message.includes('mock')) {
      expect(data.data).toHaveProperty('txns');
      expect(Array.isArray(data.data.txns)).toBe(true);
      
      // If there are transactions, verify their structure
      if (data.data.txns.length > 0) {
        const firstTx = data.data.txns[0];
        expect(firstTx).toHaveProperty('transaction_hash');
        expect(firstTx).toHaveProperty('block_timestamp');
        expect(firstTx).toHaveProperty('signer_account_id');
        expect(firstTx).toHaveProperty('receiver_account_id');
        expect(firstTx).toHaveProperty('actions');
      }
    }
  });

  it('should fetch account information for bctemp.near wallet', async () => {
    const response = await fetch('http://localhost:3000/api/nearblocks-proxy', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ accountId: 'bctemp.near' }),
    });
    
    const data = await response.json();
    
    expect(response.status).toBe(200);
    expect(data).toHaveProperty('success', true);
    expect(data).toHaveProperty('data');
    expect(data).toHaveProperty('message');
    
    // If we get real data (not mock), verify structure
    if (!data.message.includes('mock')) {
      expect(data.data).toHaveProperty('account_id', 'bctemp.near');
      expect(data.data).toHaveProperty('amount');
      expect(data.data).toHaveProperty('locked');
      expect(data.data).toHaveProperty('storage_usage');
    }
  });
});