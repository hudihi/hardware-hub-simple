import React from 'react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  placeholder = 'Search products...',
}) => {
  return (
    <div className="position-relative">
      <i className="bi bi-search position-absolute top-50 translate-middle-y ms-3 text-muted"></i>
      <input
        type="text"
        className="form-control search-bar ps-5"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
};

export default SearchBar;
