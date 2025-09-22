import { useState, useCallback } from 'react';
import { ValidationService, ValidationRule, ValidationResult } from '@/lib/validation';

export interface UseValidationReturn {
  errors: Record<string, string>;
  warnings: Record<string, string>;
  isValid: boolean;
  validateField: (field: string, value: any, rules: ValidationRule) => ValidationResult;
  validateForm: (data: Record<string, any>, rules: Record<string, ValidationRule>) => boolean;
  setFieldError: (field: string, error: string) => void;
  clearFieldError: (field: string) => void;
  clearAllErrors: () => void;
}

export function useValidation(): UseValidationReturn {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [warnings, setWarnings] = useState<Record<string, string>>({});

  const validateField = useCallback((field: string, value: any, rules: ValidationRule): ValidationResult => {
    const result = ValidationService.validate(value, rules);
    
    // Update errors and warnings
    setErrors(prev => {
      const newErrors = { ...prev };
      if (result.error) {
        newErrors[field] = result.error;
      } else {
        delete newErrors[field];
      }
      return newErrors;
    });

    setWarnings(prev => {
      const newWarnings = { ...prev };
      if (result.warning) {
        newWarnings[field] = result.warning;
      } else {
        delete newWarnings[field];
      }
      return newWarnings;
    });

    return result;
  }, []);

  const validateForm = useCallback((data: Record<string, any>, rules: Record<string, ValidationRule>): boolean => {
    const { isValid, errors: formErrors, warnings: formWarnings } = ValidationService.validateFields(data, rules);
    
    setErrors(formErrors);
    setWarnings(formWarnings);
    
    return isValid;
  }, []);

  const setFieldError = useCallback((field: string, error: string) => {
    setErrors(prev => ({ ...prev, [field]: error }));
  }, []);

  const clearFieldError = useCallback((field: string) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  }, []);

  const clearAllErrors = useCallback(() => {
    setErrors({});
    setWarnings({});
  }, []);

  const isValid = Object.keys(errors).length === 0;

  return {
    errors,
    warnings,
    isValid,
    validateField,
    validateForm,
    setFieldError,
    clearFieldError,
    clearAllErrors
  };
}
