/**
 * Validation utilities for form inputs and user data
 */

export interface ValidationResult {
  isValid: boolean;
  error?: string;
  warning?: string;
}

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: RegExp;
  custom?: (value: any) => ValidationResult;
}

export class ValidationService {
  /**
   * Validate a single value against rules
   */
  static validate(value: any, rules: ValidationRule): ValidationResult {
    // Required check
    if (rules.required && (value === undefined || value === null || value === '')) {
      return { isValid: false, error: 'This field is required' };
    }

    // Skip other validations if value is empty and not required
    if (!rules.required && (value === undefined || value === null || value === '')) {
      return { isValid: true };
    }

    // Type-specific validations
    const stringValue = String(value);
    const numValue = Number(value);

    // String length validations
    if (rules.minLength && stringValue.length < rules.minLength) {
      return { 
        isValid: false, 
        error: `Minimum length is ${rules.minLength} characters` 
      };
    }

    if (rules.maxLength && stringValue.length > rules.maxLength) {
      return { 
        isValid: false, 
        error: `Maximum length is ${rules.maxLength} characters` 
      };
    }

    // Numeric validations
    if (!isNaN(numValue)) {
      if (rules.min !== undefined && numValue < rules.min) {
        return { 
          isValid: false, 
          error: `Minimum value is ${rules.min}` 
        };
      }

      if (rules.max !== undefined && numValue > rules.max) {
        return { 
          isValid: false, 
          error: `Maximum value is ${rules.max}` 
        };
      }
    }

    // Pattern validation
    if (rules.pattern && !rules.pattern.test(stringValue)) {
      return { 
        isValid: false, 
        error: 'Invalid format' 
      };
    }

    // Custom validation
    if (rules.custom) {
      const customResult = rules.custom(value);
      if (!customResult.isValid) {
        return customResult;
      }
    }

    return { isValid: true };
  }

  /**
   * Validate multiple fields
   */
  static validateFields(
    data: Record<string, any>, 
    rules: Record<string, ValidationRule>
  ): { isValid: boolean; errors: Record<string, string>; warnings: Record<string, string> } {
    const errors: Record<string, string> = {};
    const warnings: Record<string, string> = {};
    let isValid = true;

    for (const [field, fieldRules] of Object.entries(rules)) {
      const result = this.validate(data[field], fieldRules);
      
      if (!result.isValid) {
        isValid = false;
        if (result.error) {
          errors[field] = result.error;
        }
      }
      
      if (result.warning) {
        warnings[field] = result.warning;
      }
    }

    return { isValid, errors, warnings };
  }

  /**
   * NEAR-specific validations
   */
  static validateNEARAmount(amount: string): ValidationResult {
    const numAmount = parseFloat(amount);
    
    if (isNaN(numAmount)) {
      return { isValid: false, error: 'Invalid number format' };
    }

    if (numAmount <= 0) {
      return { isValid: false, error: 'Amount must be greater than 0' };
    }

    if (numAmount < 0.001) {
      return { 
        isValid: false, 
        error: 'Minimum amount is 0.001 NEAR' 
      };
    }

    if (numAmount > 1000000) {
      return { 
        isValid: false, 
        error: 'Maximum amount is 1,000,000 NEAR' 
      };
    }

    // Check for too many decimal places
    const decimalPlaces = amount.split('.')[1]?.length || 0;
    if (decimalPlaces > 24) {
      return { 
        isValid: false, 
        error: 'Too many decimal places (max 24)' 
      };
    }

    return { isValid: true };
  }

  static validateAccountId(accountId: string): ValidationResult {
    if (!accountId) {
      return { isValid: false, error: 'Account ID is required' };
    }

    // NEAR account ID pattern
    const pattern = /^[a-z0-9._-]+$/;
    if (!pattern.test(accountId)) {
      return { 
        isValid: false, 
        error: 'Account ID contains invalid characters' 
      };
    }

    if (accountId.length < 2) {
      return { 
        isValid: false, 
        error: 'Account ID is too short' 
      };
    }

    if (accountId.length > 64) {
      return { 
        isValid: false, 
        error: 'Account ID is too long' 
      };
    }

    return { isValid: true };
  }

  static validateContractAddress(address: string): ValidationResult {
    if (!address) {
      return { isValid: false, error: 'Contract address is required' };
    }

    // Basic NEAR contract address validation
    const pattern = /^[a-z0-9._-]+\.near$/;
    if (!pattern.test(address)) {
      return { 
        isValid: false, 
        error: 'Invalid contract address format' 
      };
    }

    return { isValid: true };
  }

  static validateTokenType(tokenType: string): ValidationResult {
    const validTokens = ['NEAR', 'WNEAR', 'USDC', 'USDT'];
    
    if (!validTokens.includes(tokenType)) {
      return { 
        isValid: false, 
        error: `Invalid token type. Must be one of: ${validTokens.join(', ')}` 
      };
    }

    return { isValid: true };
  }

  static validateOpportunityId(opportunityId: string): ValidationResult {
    const numId = parseInt(opportunityId);
    
    if (isNaN(numId)) {
      return { isValid: false, error: 'Opportunity ID must be a number' };
    }

    if (numId < 0) {
      return { isValid: false, error: 'Opportunity ID must be positive' };
    }

    return { isValid: true };
  }

  /**
   * Sanitize user input
   */
  static sanitizeInput(input: string): string {
    return input
      .trim()
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+=/gi, ''); // Remove event handlers
  }

  /**
   * Format validation error messages
   */
  static formatErrorMessage(field: string, error: string): string {
    const fieldName = field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
    return `${fieldName}: ${error}`;
  }
}

// Common validation rules
export const CommonRules = {
  required: { required: true },
  email: { 
    required: true, 
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    custom: (value: string) => ({
      isValid: ValidationService.validate(value, { 
        required: true, 
        pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ 
      }).isValid,
      error: 'Invalid email format'
    })
  },
  nearAmount: {
    required: true,
    custom: (value: string) => ValidationService.validateNEARAmount(value)
  },
  accountId: {
    required: true,
    custom: (value: string) => ValidationService.validateAccountId(value)
  },
  contractAddress: {
    required: true,
    custom: (value: string) => ValidationService.validateContractAddress(value)
  },
  tokenType: {
    required: true,
    custom: (value: string) => ValidationService.validateTokenType(value)
  },
  opportunityId: {
    required: true,
    custom: (value: string) => ValidationService.validateOpportunityId(value)
  }
};
