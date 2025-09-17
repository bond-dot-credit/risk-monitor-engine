// Type definitions for near-api-js
declare module 'near-api-js' {
  export class Account {
    accountId: string;
    state(): Promise<Record<string, unknown>>;
  }

  export class KeyPair {
    static fromString(privateKey: string): KeyPair;
  }

  export class Near {
    constructor(config: Record<string, unknown>);
    account(accountId: string): Promise<Account>;
  }

  export const connect: (config: Record<string, unknown>) => Promise<Near>;
  
  export const keyStores: {
    InMemoryKeyStore: Record<string, unknown>;
  };
  
  export const utils: {
    format: {
      parseNearAmount: (amount: string) => string;
      formatNearAmount: (amount: string) => string;
    };
  };
}