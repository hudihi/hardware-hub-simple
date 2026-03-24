import React, { useState, useEffect } from 'react';
import { Country, COUNTRIES, getDefaultCountry, validateAndNormalizePhoneNumber, validatePhoneInput } from '../utils/phone';
import CountryCodeSelector from './CountryCodeSelector';

interface PhoneInputProps {
  value: string;
  onChange: (normalizedNumber: string, isValid: boolean) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  required?: boolean;
  defaultCountryCode?: string;
  showValidation?: boolean;
}

const PhoneInput: React.FC<PhoneInputProps> = ({
  value,
  onChange,
  placeholder = 'Enter phone number',
  className = '',
  disabled = false,
  required = false,
  defaultCountryCode,
  showValidation = true
}) => {
  const [selectedCountry, setSelectedCountry] = useState<Country>(
    COUNTRIES.find(c => c.code === defaultCountryCode) || 
    COUNTRIES.find(c => c.code === getDefaultCountry()) || 
    COUNTRIES[0]
  );
  const [inputValue, setInputValue] = useState('');
  const [validationMessage, setValidationMessage] = useState<string>('');
  const [isValid, setIsValid] = useState(false);

  // Initialize with existing value if provided
  useEffect(() => {
    if (value) {
      // Try to detect country from existing normalized number
      const country = COUNTRIES.find(c => value.startsWith(c.dialCode));
      if (country) {
        setSelectedCountry(country);
        // Extract local number for display
        const localNumber = value.substring(country.dialCode.length);
        setInputValue(localNumber.startsWith('0') ? localNumber : '0' + localNumber);
      } else {
        setInputValue(value);
      }
    }
  }, [value]);

  const handlePhoneInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newInputValue = e.target.value;
    setInputValue(newInputValue);

    if (!newInputValue) {
      setValidationMessage('');
      setIsValid(false);
      onChange('', false);
      return;
    }

    // Real-time validation
    const validation = validatePhoneInput(newInputValue, selectedCountry.code);
    setValidationMessage(validation.message || '');
    setIsValid(validation.isValid);

    if (validation.isValid) {
      // Normalize the phone number
      const normalization = validateAndNormalizePhoneNumber(newInputValue, selectedCountry.code);
      if (normalization.isValid && normalization.normalizedNumber) {
        onChange(normalization.normalizedNumber, true);
      } else {
        onChange(newInputValue, false);
      }
    } else {
      onChange(newInputValue, false);
    }
  };

  const handleCountryChange = (country: Country) => {
    setSelectedCountry(country);
    
    // Re-validate with new country
    if (inputValue) {
      const validation = validatePhoneInput(inputValue, country.code);
      setValidationMessage(validation.message || '');
      setIsValid(validation.isValid);

      if (validation.isValid) {
        const normalization = validateAndNormalizePhoneNumber(inputValue, country.code);
        if (normalization.isValid && normalization.normalizedNumber) {
          onChange(normalization.normalizedNumber, true);
        } else {
          onChange(inputValue, false);
        }
      } else {
        onChange(inputValue, false);
      }
    }
  };

  const getPlaceholder = () => {
    if (placeholder !== 'Enter phone number') return placeholder;
    
    // Generate country-specific placeholder
    const exampleNumber = '0' + '7'.repeat(selectedCountry.minLength);
    return `${selectedCountry.name} (${exampleNumber})`;
  };

  return (
    <div className={className}>
      <div className="d-flex gap-2">
        {/* Country Code Selector */}
        <CountryCodeSelector
          selectedCountry={selectedCountry}
          onCountryChange={handleCountryChange}
          disabled={disabled}
        />

        {/* Phone Number Input */}
        <div className="flex-grow-1">
          <input
            type="tel"
            className={`form-control ${!isValid && inputValue ? 'is-invalid' : ''} ${isValid && inputValue ? 'is-valid' : ''}`}
            value={inputValue}
            onChange={handlePhoneInputChange}
            placeholder={getPlaceholder()}
            disabled={disabled}
            required={required}
          />
          
          {/* Validation Message */}
          {showValidation && validationMessage && inputValue && (
            <div className={`form-text ${isValid ? 'text-success' : 'text-danger'}`}>
              <small>
                <i className={`bi bi-${isValid ? 'check-circle' : 'exclamation-circle'} me-1`}></i>
                {validationMessage}
              </small>
            </div>
          )}
        </div>
      </div>

      {/* Format Hint */}
      {showValidation && !inputValue && (
        <div className="form-text text-muted">
          <small>
            <i className="bi bi-info-circle me-1"></i>
            Format: 0{selectedCountry.dialCode === '255' ? '712345678' : 'XXXXXXXXXX'} or +{selectedCountry.dialCode}XXXXXXXXXX
          </small>
        </div>
      )}
    </div>
  );
};

export default PhoneInput;
