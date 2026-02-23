import React, { useRef, useState } from 'react';
import { Search, X } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit?: () => void;
  placeholder?: string;
  variant?: 'default' | 'hero';
}

const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  onSubmit,
  placeholder = 'Search...',
  variant = 'default',
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClear = () => {
    onChange('');
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && onSubmit) {
      onSubmit();
    }
  };

  const isHero = variant === 'hero';

  return (
    <div
      className={`
        relative flex items-center gap-2 rounded-full transition-all duration-300 ease-out
        ${isHero
          ? 'bg-white/15 backdrop-blur-md border border-white/20 shadow-lg'
          : 'bg-[var(--pahala-white)] border-2 border-[var(--pahala-beige)] shadow-[var(--shadow-soft)]'
        }
        ${isFocused && !isHero ? 'border-[var(--pahala-brown-light)] shadow-[var(--shadow-card)] scale-[1.01]' : ''}
        ${isFocused && isHero ? 'bg-white/25 border-white/40 shadow-xl scale-[1.01]' : ''}
      `}
      onClick={() => inputRef.current?.focus()}
    >
      {/* Search Icon */}
      <div className={`
        flex items-center justify-center w-10 h-10 ml-1 rounded-full shrink-0 transition-colors duration-200
        ${isHero
          ? 'text-white/70'
          : isFocused ? 'text-[var(--pahala-brown)]' : 'text-[var(--pahala-gray)]'
        }
      `}>
        <Search className="w-[18px] h-[18px]" strokeWidth={2.5} />
      </div>

      {/* Input */}
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={`
          flex-1 bg-transparent border-none outline-none py-3 pr-2 text-sm font-medium
          ${isHero
            ? 'text-white placeholder:text-white/50'
            : 'text-[var(--pahala-brown-dark)] placeholder:text-[var(--pahala-gray)]'
          }
        `}
      />

      {/* Clear Button */}
      {value && (
        <button
          onClick={handleClear}
          className={`
            flex items-center justify-center w-8 h-8 mr-1.5 rounded-full shrink-0 transition-all duration-200
            hover:scale-110 active:scale-95
            ${isHero
              ? 'bg-white/20 text-white hover:bg-white/30'
              : 'bg-[var(--pahala-beige)] text-[var(--pahala-brown)] hover:bg-[var(--pahala-brown-light)] hover:text-white'
            }
          `}
          type="button"
          aria-label="Clear search"
        >
          <X className="w-3.5 h-3.5" strokeWidth={2.5} />
        </button>
      )}

      {/* Submit Button (hero only) */}
      {isHero && onSubmit && (
        <button
          onClick={onSubmit}
          className="flex items-center justify-center w-10 h-10 mr-1 rounded-full shrink-0 bg-white text-[var(--pahala-brown)] hover:bg-[var(--pahala-cream)] active:scale-95 transition-all duration-200 shadow-md"
          type="button"
          aria-label="Search"
        >
          <Search className="w-4 h-4" strokeWidth={2.5} />
        </button>
      )}
    </div>
  );
};

export default SearchBar;
