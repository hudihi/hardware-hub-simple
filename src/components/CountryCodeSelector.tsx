import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { COUNTRIES, Country } from '../utils/phone';

interface CountryCodeSelectorProps {
  selectedCountry: Country;
  onCountryChange: (country: Country) => void;
  className?: string;
  disabled?: boolean;
}

const CountryCodeSelector: React.FC<CountryCodeSelectorProps> = ({
  selectedCountry,
  onCountryChange,
  className = '',
  disabled = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (buttonRef.current && !buttonRef.current.contains(event.target as Node) &&
          dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Calculate dropdown position when opening
  const updateDropdownPosition = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + window.scrollY + 4,
        left: rect.left + window.scrollX,
        width: Math.max(250, rect.width)
      });
    }
  };

  const handleButtonClick = () => {
    if (!disabled) {
      if (!isOpen) {
        updateDropdownPosition();
      }
      setIsOpen(!isOpen);
    }
  };

  // Filter countries based on search term
  const filteredCountries = COUNTRIES.filter(country =>
    country.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    country.dialCode.includes(searchTerm) ||
    country.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCountrySelect = (country: Country) => {
    onCountryChange(country);
    setIsOpen(false);
    setSearchTerm('');
  };

  return (
    <div className={className}>
      {/* Selected Country Button */}
      <button
        ref={buttonRef}
        type="button"
        className={`btn btn-outline-secondary d-flex align-items-center gap-2 ${disabled ? 'disabled' : ''}`}
        onClick={handleButtonClick}
        disabled={disabled}
        style={{ minWidth: '120px' }}
      >
        <span className="fs-5">{selectedCountry.flag}</span>
        <span className="small fw-medium">+{selectedCountry.dialCode}</span>
        <i className={`bi bi-chevron-down small ${isOpen ? 'rotate-180' : ''}`}></i>
      </button>

      {/* Dropdown rendered using portal */}
      {isOpen && createPortal(
        <div 
          ref={dropdownRef}
          className="bg-white border rounded shadow-lg"
          style={{ 
            position: 'fixed',
            top: `${dropdownPosition.top}px`,
            left: `${dropdownPosition.left}px`,
            width: `${dropdownPosition.width}px`,
            zIndex: 9999,
            maxHeight: '300px'
          }}
        >
          {/* Search Input */}
          <div className="p-2 border-bottom">
            <input
              type="text"
              className="form-control form-control-sm"
              placeholder="Search country..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoFocus
            />
          </div>

          {/* Country List */}
          <div style={{ maxHeight: '250px', overflowY: 'auto' }}>
            {filteredCountries.length === 0 ? (
              <div className="p-3 text-muted text-center small">
                No countries found
              </div>
            ) : (
              filteredCountries.map((country) => (
                <button
                  key={country.code}
                  type="button"
                  className={`btn btn-light w-full text-start d-flex align-items-center gap-2 p-2 border-0 border-bottom hover-bg-light ${
                    selectedCountry.code === country.code ? 'bg-primary text-white' : ''
                  }`}
                  onClick={() => handleCountrySelect(country)}
                  style={{ borderRadius: 0 }}
                >
                  <span className="fs-5">{country.flag}</span>
                  <div className="flex-grow-1">
                    <div className="fw-medium small">{country.name}</div>
                    <div className="text-muted small">+{country.dialCode}</div>
                  </div>
                  {selectedCountry.code === country.code && (
                    <i className="bi bi-check-circle text-primary"></i>
                  )}
                </button>
              ))
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default CountryCodeSelector;
