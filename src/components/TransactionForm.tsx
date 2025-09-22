import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { ValidationService, CommonRules, ValidationResult } from '@/lib/validation';

interface TransactionFormProps {
  type: 'deposit' | 'withdraw' | 'allocate' | 'deallocate';
  onSubmit: (data: TransactionFormData) => Promise<void>;
  isLoading?: boolean;
  disabled?: boolean;
  className?: string;
}

interface TransactionFormData {
  tokenType: string;
  amount: string;
  opportunityId?: string;
  contractAddress?: string;
}

export const TransactionForm: React.FC<TransactionFormProps> = ({
  type,
  onSubmit,
  isLoading = false,
  disabled = false,
  className = ''
}) => {
  const [formData, setFormData] = useState<TransactionFormData>({
    tokenType: 'NEAR',
    amount: '',
    opportunityId: '',
    contractAddress: ''
  });

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [isValidating, setIsValidating] = useState(false);

  const getFormTitle = () => {
    switch (type) {
      case 'deposit': return '💰 Deposit Funds';
      case 'withdraw': return '📤 Withdraw Funds';
      case 'allocate': return '🔄 Allocate to Opportunity';
      case 'deallocate': return '↩️ Deallocate from Opportunity';
      default: return '📊 Transaction';
    }
  };

  const getFormDescription = () => {
    switch (type) {
      case 'deposit': return 'Deposit tokens into your vault to start earning yield';
      case 'withdraw': return 'Withdraw tokens from your vault';
      case 'allocate': return 'Allocate funds to a specific investment opportunity';
      case 'deallocate': return 'Remove funds from an investment opportunity';
      default: return 'Execute a blockchain transaction';
    }
  };

  const validateField = (field: string, value: any): ValidationResult => {
    let result: ValidationResult = { isValid: true };

    switch (field) {
      case 'amount':
        result = ValidationService.validateNEARAmount(value);
        break;
      case 'tokenType':
        result = ValidationService.validateTokenType(value);
        break;
      case 'opportunityId':
        if (type === 'allocate' || type === 'deallocate') {
          result = ValidationService.validateOpportunityId(value);
        }
        break;
      case 'contractAddress':
        if (type === 'allocate' || type === 'deallocate') {
          result = ValidationService.validateContractAddress(value);
        }
        break;
    }

    return result;
  };

  const validateForm = (): boolean => {
    setIsValidating(true);
    const errors: Record<string, string> = {};

    // Validate amount
    const amountValidation = validateField('amount', formData.amount);
    if (!amountValidation.isValid) {
      errors.amount = amountValidation.error!;
    }

    // Validate token type
    const tokenValidation = validateField('tokenType', formData.tokenType);
    if (!tokenValidation.isValid) {
      errors.tokenType = tokenValidation.error!;
    }

    // Validate opportunity ID for allocate/deallocate
    if ((type === 'allocate' || type === 'deallocate') && formData.opportunityId) {
      const opportunityValidation = validateField('opportunityId', formData.opportunityId);
      if (!opportunityValidation.isValid) {
        errors.opportunityId = opportunityValidation.error!;
      }
    }

    // Validate contract address for allocate/deallocate
    if ((type === 'allocate' || type === 'deallocate') && formData.contractAddress) {
      const contractValidation = validateField('contractAddress', formData.contractAddress);
      if (!contractValidation.isValid) {
        errors.contractAddress = contractValidation.error!;
      }
    }

    setValidationErrors(errors);
    setIsValidating(false);

    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (field: keyof TransactionFormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, [field]: value }));

    // Clear error for this field
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      await onSubmit(formData);
      // Reset form on success
      setFormData({
        tokenType: 'NEAR',
        amount: '',
        opportunityId: '',
        contractAddress: ''
      });
      setValidationErrors({});
    } catch (error) {
      console.error('Transaction failed:', error);
    }
  };

  const isFormValid = () => {
    const hasRequiredFields = formData.amount && formData.tokenType;
    const hasAllocationFields = type === 'allocate' || type === 'deallocate' 
      ? formData.opportunityId && formData.contractAddress 
      : true;
    
    return hasRequiredFields && hasAllocationFields && Object.keys(validationErrors).length === 0;
  };

  const getButtonText = () => {
    if (isLoading) {
      return 'Processing...';
    }
    
    switch (type) {
      case 'deposit': return 'Deposit';
      case 'withdraw': return 'Withdraw';
      case 'allocate': return 'Allocate';
      case 'deallocate': return 'Deallocate';
      default: return 'Submit';
    }
  };

  return (
    <Card className={`w-full max-w-md ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {getFormTitle()}
          {isValidating && <StatusBadge status="pending" text="Validating" />}
        </CardTitle>
        <CardDescription>
          {getFormDescription()}
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Token Type */}
          <Input
            label="Token Type"
            value={formData.tokenType}
            onChange={handleInputChange('tokenType')}
            required
            error={validationErrors.tokenType}
            helperText="Select the token you want to transact with"
          >
            <select
              value={formData.tokenType}
              onChange={handleInputChange('tokenType')}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
            >
              <option value="NEAR">NEAR</option>
              <option value="WNEAR">WNEAR</option>
              <option value="USDC">USDC</option>
              <option value="USDT">USDT</option>
            </select>
          </Input>

          {/* Amount */}
          <Input
            label="Amount"
            type="number"
            step="0.001"
            min="0.001"
            max="1000000"
            value={formData.amount}
            onChange={handleInputChange('amount')}
            required
            error={validationErrors.amount}
            helperText="Enter the amount to transact (minimum 0.001)"
            leftIcon="💰"
          />

          {/* Opportunity ID (for allocate/deallocate) */}
          {(type === 'allocate' || type === 'deallocate') && (
            <Input
              label="Opportunity ID"
              type="number"
              value={formData.opportunityId || ''}
              onChange={handleInputChange('opportunityId')}
              required
              error={validationErrors.opportunityId}
              helperText="Enter the ID of the opportunity"
              leftIcon="🎯"
            />
          )}

          {/* Contract Address (for allocate/deallocate) */}
          {(type === 'allocate' || type === 'deallocate') && (
            <Input
              label="Contract Address"
              value={formData.contractAddress || ''}
              onChange={handleInputChange('contractAddress')}
              required
              error={validationErrors.contractAddress}
              helperText="Enter the opportunity contract address"
              leftIcon="📄"
            />
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={disabled || isLoading || !isFormValid() || isValidating}
            className="w-full"
          >
            {getButtonText()}
          </Button>

          {/* Form Status */}
          {Object.keys(validationErrors).length > 0 && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-red-700 dark:text-red-300 text-sm">
                Please fix the errors above before submitting.
              </p>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
};
