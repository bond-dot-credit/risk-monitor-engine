export enum NearIntentsErrorType {
  CONFIGURATION_ERROR = 'CONFIGURATION_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  INSUFFICIENT_BALANCE = 'INSUFFICIENT_BALANCE',
  TRANSACTION_FAILED = 'TRANSACTION_FAILED',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  RATE_LIMIT_ERROR = 'RATE_LIMIT_ERROR',
  SOLVER_BUS_ERROR = 'SOLVER_BUS_ERROR',
  CONTRACT_ERROR = 'CONTRACT_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
}

export interface NearIntentsError {
  type: NearIntentsErrorType;
  message: string;
  code?: string;
  details?: Record<string, unknown>;
  retryable?: boolean;
  retryAfter?: number; // seconds
}

export class NearIntentsErrorHandler {
  /**
   * Parse and categorize errors from NEAR blockchain operations
   */
  static parseError(error: unknown): NearIntentsError {
    if (typeof error === 'string') {
      return this.parseStringError(error);
    }

    if (error instanceof Error) {
      return this.parseErrorObject(error);
    }

    // Handle NEAR-specific error objects
    if ((error as Record<string, unknown>)?.type || (error as Record<string, unknown>)?.kind) {
      return this.parseNearError(error as Record<string, unknown>);
    }

    // Default error
    return {
      type: NearIntentsErrorType.NETWORK_ERROR,
      message: 'Unknown error occurred',
      retryable: false,
    };
  }

  private static parseStringError(error: string): NearIntentsError {
    const lowerError = error.toLowerCase();

    if (lowerError.includes('insufficient')) {
      return {
        type: NearIntentsErrorType.INSUFFICIENT_BALANCE,
        message: error,
        retryable: false,
      };
    }

    if (lowerError.includes('rate limit') || lowerError.includes('too many requests')) {
      return {
        type: NearIntentsErrorType.RATE_LIMIT_ERROR,
        message: error,
        retryable: true,
        retryAfter: 60, // 1 minute
      };
    }

    if (lowerError.includes('timeout') || lowerError.includes('timed out')) {
      return {
        type: NearIntentsErrorType.TIMEOUT_ERROR,
        message: error,
        retryable: true,
        retryAfter: 5, // 5 seconds
      };
    }

    if (lowerError.includes('unauthorized') || lowerError.includes('authentication')) {
      return {
        type: NearIntentsErrorType.AUTHENTICATION_ERROR,
        message: error,
        retryable: false,
      };
    }

    if (lowerError.includes('network') || lowerError.includes('connection')) {
      return {
        type: NearIntentsErrorType.NETWORK_ERROR,
        message: error,
        retryable: true,
        retryAfter: 10, // 10 seconds
      };
    }

    return {
      type: NearIntentsErrorType.VALIDATION_ERROR,
      message: error,
      retryable: false,
    };
  }

  private static parseErrorObject(error: Error): NearIntentsError {
    return this.parseStringError(error.message);
  }

  private static parseNearError(error: Record<string, unknown>): NearIntentsError {
    // Handle specific NEAR error types
    if (error.type === 'ActionError') {
      return {
        type: NearIntentsErrorType.CONTRACT_ERROR,
        message: (error.kind as Record<string, unknown>)?.kind as string || 'Contract execution failed',
        code: (error.kind as Record<string, unknown>)?.kind as string,
        details: error,
        retryable: false,
      };
    }

    if (error.type === 'TxExecutionError') {
      return {
        type: NearIntentsErrorType.TRANSACTION_FAILED,
        message: 'Transaction execution failed',
        details: error,
        retryable: false,
      };
    }

    if (error.kind === 'NotEnoughBalance') {
      return {
        type: NearIntentsErrorType.INSUFFICIENT_BALANCE,
        message: 'Insufficient balance for transaction',
        details: error,
        retryable: false,
      };
    }

    return {
      type: NearIntentsErrorType.NETWORK_ERROR,
      message: (error.message as string) || 'NEAR blockchain error',
      details: error,
      retryable: true,
      retryAfter: 5,
    };
  }

  /**
   * Determine if an error is retryable
   */
  static isRetryable(error: NearIntentsError): boolean {
    return error.retryable === true;
  }

  /**
   * Get retry delay for retryable errors
   */
  static getRetryDelay(error: NearIntentsError): number {
    return error.retryAfter || 5; // Default 5 seconds
  }

  /**
   * Format error for user display
   */
  static formatUserMessage(error: NearIntentsError): string {
    switch (error.type) {
      case NearIntentsErrorType.INSUFFICIENT_BALANCE:
        return 'Insufficient balance to complete the transaction. Please add more funds to your account.';
      case NearIntentsErrorType.RATE_LIMIT_ERROR:
        return 'Rate limit exceeded. Please wait a moment before trying again.';
      case NearIntentsErrorType.NETWORK_ERROR:
        return 'Network connection issue. Please check your internet connection and try again.';
      case NearIntentsErrorType.TIMEOUT_ERROR:
        return 'Transaction timed out. Please try again.';
      case NearIntentsErrorType.AUTHENTICATION_ERROR:
        return 'Authentication failed. Please check your account credentials.';
      case NearIntentsErrorType.CONFIGURATION_ERROR:
        return 'Configuration error. Please check your environment settings.';
      case NearIntentsErrorType.CONTRACT_ERROR:
        return 'Smart contract execution failed. Please check transaction parameters.';
      default:
        return error.message;
    }
  }
}

export class ValidationUtils {
  /**
   * Validate NEAR account ID format
   */
  static isValidAccountId(accountId: string): boolean {
    if (!accountId || typeof accountId !== 'string') {
      return false;
    }

    // Basic NEAR account ID validation
    const accountIdRegex = /^[a-z0-9_-]+(\.[a-z0-9_-]+)*$/;
    return accountIdRegex.test(accountId) && accountId.length >= 2 && accountId.length <= 64;
  }

  /**
   * Validate NEAR private key format
   */
  static isValidPrivateKey(privateKey: string): boolean {
    if (!privateKey || typeof privateKey !== 'string') {
      return false;
    }

    return privateKey.startsWith('ed25519:') && privateKey.length > 8;
  }

  /**
   * Validate transaction amount
   */
  static isValidAmount(amount: number): boolean {
    return typeof amount === 'number' && amount > 0 && isFinite(amount);
  }

  /**
   * Validate token symbol
   */
  static isValidToken(token: string): boolean {
    return typeof token === 'string' && token.length > 0;
  }

  /**
   * Validate network ID
   */
  static isValidNetworkId(networkId: string): boolean {
    const validNetworks = ['mainnet', 'testnet', 'localnet'];
    return validNetworks.includes(networkId);
  }

  /**
   * Validate URL format
   */
  static isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Sanitize and validate transaction parameters
   */
  static validateTransactionParams(params: {
    fromToken: string;
    toToken: string;
    amount: number;
  }): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!this.isValidToken(params.fromToken)) {
      errors.push('Invalid from token');
    }

    if (!this.isValidToken(params.toToken)) {
      errors.push('Invalid to token');
    }

    if (params.fromToken === params.toToken) {
      errors.push('From and to tokens cannot be the same');
    }

    if (!this.isValidAmount(params.amount)) {
      errors.push('Invalid amount');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}

export class RetryUtils {
  /**
   * Execute a function with retry logic
   */
  static async withRetry<T>(
    fn: () => Promise<T>,
    maxRetries: number = 3,
    baseDelay: number = 1000,
    backoffMultiplier: number = 2
  ): Promise<T> {
    let lastError: unknown;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;
        const nearError = NearIntentsErrorHandler.parseError(error);

        // Don't retry if error is not retryable
        if (!NearIntentsErrorHandler.isRetryable(nearError)) {
          throw error;
        }

        // Don't retry on last attempt
        if (attempt === maxRetries) {
          break;
        }

        // Calculate delay with exponential backoff
        const delay = nearError.retryAfter 
          ? nearError.retryAfter * 1000 
          : baseDelay * Math.pow(backoffMultiplier, attempt);

        console.warn(`Attempt ${attempt + 1} failed, retrying in ${delay}ms:`, nearError.message);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw lastError;
  }

  /**
   * Execute multiple functions in parallel with retry logic
   */
  static async withConcurrentRetry<T>(
    functions: (() => Promise<T>)[],
    maxRetries: number = 3,
    baseDelay: number = 1000
  ): Promise<PromiseSettledResult<T>[]> {
    const retryFunctions = functions.map(fn => 
      this.withRetry(fn, maxRetries, baseDelay)
    );

    return Promise.allSettled(retryFunctions);
  }
}

export class TransactionUtils {
  /**
   * Convert NEAR to yoctoNEAR
   */
  static nearToYocto(amount: number): string {
    return (amount * 1e24).toString();
  }

  /**
   * Convert yoctoNEAR to NEAR
   */
  static yoctoToNear(amount: string): number {
    return parseFloat(amount) / 1e24;
  }

  /**
   * Format NEAR amount for display
   */
  static formatNearAmount(amount: number, decimals: number = 4): string {
    return `${amount.toFixed(decimals)} NEAR`;
  }

  /**
   * Calculate gas fee estimate
   */
  static estimateGasFee(operationType: 'swap' | 'deposit' | 'transfer'): string {
    const gasAmounts = {
      swap: '300000000000000', // 300 TGas
      deposit: '100000000000000', // 100 TGas
      transfer: '50000000000000', // 50 TGas
    };

    return gasAmounts[operationType] || gasAmounts.transfer;
  }

  /**
   * Validate transaction hash format
   */
  static isValidTransactionHash(hash: string): boolean {
    return typeof hash === 'string' && hash.length === 44; // Base58 encoded hash length
  }
}