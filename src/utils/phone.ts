export interface Country {
  code: string;
  name: string;
  dialCode: string;
  flag: string;
  minLength: number;
  maxLength: number;
}

export const COUNTRIES: Country[] = [
  { code: 'TZ', name: 'Tanzania', dialCode: '255', flag: '🇹🇿', minLength: 9, maxLength: 9 },
  { code: 'KE', name: 'Kenya', dialCode: '254', flag: '🇰🇪', minLength: 9, maxLength: 9 },
  { code: 'UG', name: 'Uganda', dialCode: '256', flag: '🇺🇬', minLength: 9, maxLength: 9 },
  { code: 'RW', name: 'Rwanda', dialCode: '250', flag: '🇷🇼', minLength: 9, maxLength: 9 },
  { code: 'BI', name: 'Burundi', dialCode: '257', flag: '🇧🇮', minLength: 8, maxLength: 8 },
  { code: 'US', name: 'United States', dialCode: '1', flag: '🇺🇸', minLength: 10, maxLength: 10 },
  { code: 'GB', name: 'United Kingdom', dialCode: '44', flag: '🇬🇧', minLength: 10, maxLength: 10 },
  { code: 'IN', name: 'India', dialCode: '91', flag: '🇮🇳', minLength: 10, maxLength: 10 },
  { code: 'ZA', name: 'South Africa', dialCode: '27', flag: '🇿🇦', minLength: 9, maxLength: 9 },
  { code: 'NG', name: 'Nigeria', dialCode: '234', flag: '🇳🇬', minLength: 10, maxLength: 10 },
  { code: 'GH', name: 'Ghana', dialCode: '233', flag: '🇬🇭', minLength: 9, maxLength: 9 },
  { code: 'EG', name: 'Egypt', dialCode: '20', flag: '🇪🇬', minLength: 10, maxLength: 10 },
  { code: 'CN', name: 'China', dialCode: '86', flag: '🇨🇳', minLength: 11, maxLength: 11 },
  { code: 'JP', name: 'Japan', dialCode: '81', flag: '🇯🇵', minLength: 10, maxLength: 11 },
  { code: 'DE', name: 'Germany', dialCode: '49', flag: '🇩🇪', minLength: 10, maxLength: 11 },
  { code: 'FR', name: 'France', dialCode: '33', flag: '🇫🇷', minLength: 9, maxLength: 9 },
  { code: 'IT', name: 'Italy', dialCode: '39', flag: '🇮🇹', minLength: 9, maxLength: 10 },
  { code: 'ES', name: 'Spain', dialCode: '34', flag: '🇪🇸', minLength: 9, maxLength: 9 },
  { code: 'CA', name: 'Canada', dialCode: '1', flag: '🇨🇦', minLength: 10, maxLength: 10 },
  { code: 'AU', name: 'Australia', dialCode: '61', flag: '🇦🇺', minLength: 9, maxLength: 9 },
];

export interface PhoneNumberValidationResult {
  isValid: boolean;
  normalizedNumber?: string;
  error?: string;
  country?: Country;
}

/**
 * Validates and normalizes a phone number with country code
 * @param phoneNumber - The phone number to validate
 * @param countryCode - The country code (e.g., 'TZ', 'KE')
 * @returns Validation result with normalized number
 */
export const validateAndNormalizePhoneNumber = (
  phoneNumber: string,
  countryCode: string
): PhoneNumberValidationResult => {
  // Find country configuration
  const country = COUNTRIES.find(c => c.code === countryCode);
  if (!country) {
    return {
      isValid: false,
      error: 'Invalid country selected'
    };
  }

  // Remove all non-digit characters
  const cleanNumber = phoneNumber.replace(/\D/g, '');

  // Handle different input formats
  let normalizedNumber: string;

  // Case 1: Number starts with country code (e.g., 255712345678)
  if (cleanNumber.startsWith(country.dialCode)) {
    normalizedNumber = cleanNumber;
  }
  // Case 2: Number starts with 0 (local format, e.g., 0712345678)
  else if (cleanNumber.startsWith('0')) {
    normalizedNumber = country.dialCode + cleanNumber.substring(1);
  }
  // Case 3: Number starts with + (e.g., +255712345678)
  else if (phoneNumber.startsWith('+')) {
    const withoutPlus = phoneNumber.substring(1).replace(/\D/g, '');
    if (withoutPlus.startsWith(country.dialCode)) {
      normalizedNumber = withoutPlus;
    } else {
      return {
        isValid: false,
        error: `Phone number must start with ${country.dialCode} or 0 for ${country.name}`
      };
    }
  }
  // Case 4: Direct number without prefix (e.g., 712345678)
  else {
    normalizedNumber = country.dialCode + cleanNumber;
  }

  // Validate length
  const localNumberLength = normalizedNumber.length - country.dialCode.length;
  if (localNumberLength < country.minLength || localNumberLength > country.maxLength) {
    return {
      isValid: false,
      error: `Invalid phone number length for ${country.name}. Expected ${country.minLength}-${country.maxLength} digits after country code.`
    };
  }

  return {
    isValid: true,
    normalizedNumber,
    country
  };
};

/**
 * Formats phone number for display
 * @param phoneNumber - Normalized phone number (e.g., 255712345678)
 * @returns Formatted phone number (e.g., +255 712 345 678)
 */
export const formatPhoneNumberForDisplay = (phoneNumber: string): string => {
  if (!phoneNumber || phoneNumber.length < 12) return phoneNumber;

  // Find country by dial code
  const country = COUNTRIES.find(c => phoneNumber.startsWith(c.dialCode));
  if (!country) return phoneNumber;

  const localNumber = phoneNumber.substring(country.dialCode.length);
  
  // Format based on country patterns
  switch (country.code) {
    case 'TZ':
    case 'KE':
    case 'UG':
      if (localNumber.length === 9) {
        return `+${country.dialCode} ${localNumber.substring(0, 3)} ${localNumber.substring(3, 6)} ${localNumber.substring(6)}`;
      }
      break;
    case 'US':
    case 'CA':
      if (localNumber.length === 10) {
        return `+${country.dialCode} (${localNumber.substring(0, 3)}) ${localNumber.substring(3, 6)}-${localNumber.substring(6)}`;
      }
      break;
    case 'GB':
      if (localNumber.length === 10) {
        return `+${country.dialCode} ${localNumber.substring(0, 4)} ${localNumber.substring(4, 7)} ${localNumber.substring(7)}`;
      }
      break;
  }

  // Default formatting
  return `+${phoneNumber}`;
};

/**
 * Gets default country based on browser locale or timezone
 * @returns Default country code
 */
export const getDefaultCountry = (): string => {
  // Try to detect from browser locale
  const locale = navigator.language || (navigator as any).userLanguage;
  if (locale) {
    const localeCountry = locale.split('-')[1]?.toUpperCase();
    if (localeCountry && COUNTRIES.find(c => c.code === localeCountry)) {
      return localeCountry;
    }
  }

  // Try to detect from timezone
  try {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (timezone === 'Africa/Dar_es_Salaam' || timezone === 'Africa/Nairobi') {
      return 'TZ'; // Default to Tanzania for East Africa
    }
  } catch (e) {
    // Ignore timezone errors
  }

  // Default to Tanzania
  return 'TZ';
};

/**
 * Validates phone number format for input field
 * @param input - Current input value
 * @param countryCode - Selected country code
 * @returns Validation result for real-time feedback
 */
export const validatePhoneInput = (
  input: string,
  countryCode: string
): { isValid: boolean; message?: string } => {
  if (!input) {
    return { isValid: false, message: 'Phone number is required' };
  }

  const cleanInput = input.replace(/\D/g, '');
  const country = COUNTRIES.find(c => c.code === countryCode);
  
  if (!country) {
    return { isValid: false, message: 'Please select a country' };
  }

  // Allow numbers starting with 0 or country code
  if (cleanInput.startsWith('0')) {
    const expectedLength = 1 + country.minLength;
    if (cleanInput.length < expectedLength) {
      return { isValid: false, message: `Enter at least ${expectedLength} digits` };
    }
    if (cleanInput.length > expectedLength) {
      return { isValid: false, message: `Phone number too long for ${country.name}` };
    }
  } else if (cleanInput.startsWith(country.dialCode)) {
    const expectedLength = country.dialCode.length + country.minLength;
    if (cleanInput.length < expectedLength) {
      return { isValid: false, message: `Enter at least ${expectedLength} digits` };
    }
    if (cleanInput.length > expectedLength + (country.maxLength - country.minLength)) {
      return { isValid: false, message: `Phone number too long for ${country.name}` };
    }
  } else {
    return { isValid: false, message: `Phone number must start with 0 or ${country.dialCode}` };
  }

  return { isValid: true };
};
