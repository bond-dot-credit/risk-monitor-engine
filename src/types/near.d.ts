// Type definitions for near-api-js
declare module 'near-api-js' {
  export class Account {
    accountId: string;
    state(): Promise<any>;
  }

  export class KeyPair {
    static fromString(privateKey: string): KeyPair;
  }

  export class Near {
    constructor(config: any);
    account(accountId: string): Promise<Account>;
  }

  export const connect: (config: any) => Promise<Near>;
  
  export const keyStores: {
    InMemoryKeyStore: any;
  };
  
  export const utils: {
    format: {
      parseNearAmount: (amount: string) => string;
      formatNearAmount: (amount: string) => string;
    };
  };
}