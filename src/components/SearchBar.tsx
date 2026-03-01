import React, { useRef, useState, useEffect } from 'react';
import { Search, X, Loader2, TrendingUp, Clock } from 'lucide-react';


const SearchBar = ({
  value,
  onChange,
  onSubmit,
  placeholder = 'Search products...',
  variant = 'default',
  suggestions = [],
  recentSearches = [],
  isLoading = false,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputRef = useRef(null);
  const containerRef = useRef(null);

  const isHero = variant === 'hero';

  const displayItems = value.length === 0
    ? recentSearches.slice(0, 5).map(s => ({ label: s, type: 'recent' }))
    : suggestions.filter(s => s.toLowerCase().includes(value.toLowerCase())).slice(0, 8).map(s => ({ label: s, type: 'suggestion' }));

  const showDropdown = isFocused && displayItems.length > 0;

  useEffect(() => {
    const onOutsideClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsFocused(false);
      }
    };
    document.addEventListener('mousedown', onOutsideClick);
    return () => document.removeEventListener('mousedown', onOutsideClick);
  }, []);

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIndex(i => Math.min(i + 1, displayItems.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActiveIndex(i => Math.max(i - 1, -1)); }
    else if (e.key === 'Escape') { setIsFocused(false); setActiveIndex(-1); }
    else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeIndex >= 0) onChange(displayItems[activeIndex].label);
      setIsFocused(false);
      onSubmit?.();
    }
  };

  const selectItem = (label) => {
    onChange(label);
    setIsFocused(false);
    setActiveIndex(-1);
    onSubmit?.();
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500&display=swap');

        .sb-root { font-family: 'DM Sans', sans-serif; }

        .sb-wrap {
          position: relative;
          display: flex;
          align-items: center;
          gap: 0;
          border-radius: 16px;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .sb-wrap.default {
          background: #fafafa;
          border: 1.5px solid #e5e7eb;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
        }
        .sb-wrap.default.focused {
          background: #fff;
          border-color: #111;
          box-shadow: 0 0 0 3px rgba(17,17,17,0.06), 0 4px 16px rgba(0,0,0,0.08);
        }

        .sb-wrap.hero {
          background: rgba(255,255,255,0.08);
          border: 1.5px solid rgba(255,255,255,0.18);
          backdrop-filter: blur(20px);
          box-shadow: 0 8px 32px rgba(0,0,0,0.24);
        }
        .sb-wrap.hero.focused {
          background: rgba(255,255,255,0.14);
          border-color: rgba(255,255,255,0.35);
          box-shadow: 0 0 0 3px rgba(255,255,255,0.08), 0 12px 40px rgba(0,0,0,0.3);
        }

        .sb-icon {
          display: flex; align-items: center; justify-content: center;
          width: 44px; height: 48px; flex-shrink: 0;
          transition: color 0.2s;
        }
        .default .sb-icon { color: #9ca3af; }
        .default.focused .sb-icon { color: #111; }
        .hero .sb-icon { color: rgba(255,255,255,0.55); }
        .hero.focused .sb-icon { color: rgba(255,255,255,0.9); }

        .sb-input {
          flex: 1;
          border: none; outline: none; background: transparent;
          padding: 14px 8px 14px 0;
          font-size: 15px; font-weight: 400;
          letter-spacing: -0.01em;
          font-family: 'DM Sans', sans-serif;
        }
        .default .sb-input { color: #111; }
        .default .sb-input::placeholder { color: #aab; }
        .hero .sb-input { color: #fff; }
        .hero .sb-input::placeholder { color: rgba(255,255,255,0.45); }

        .sb-clear {
          display: flex; align-items: center; justify-content: center;
          width: 28px; height: 28px; border-radius: 50%; border: none; cursor: pointer;
          flex-shrink: 0; margin-right: 8px;
          transition: all 0.15s;
        }
        .default .sb-clear { background: #e5e7eb; color: #6b7280; }
        .default .sb-clear:hover { background: #d1d5db; color: #111; }
        .hero .sb-clear { background: rgba(255,255,255,0.15); color: rgba(255,255,255,0.8); }
        .hero .sb-clear:hover { background: rgba(255,255,255,0.25); }

        .sb-submit {
          display: flex; align-items: center; justify-content: center;
          height: 36px; padding: 0 18px; border-radius: 10px; border: none;
          background: #fff; color: #111; font-size: 14px; font-weight: 500;
          cursor: pointer; flex-shrink: 0; margin-right: 6px;
          font-family: 'DM Sans', sans-serif;
          transition: all 0.15s;
          box-shadow: 0 1px 4px rgba(0,0,0,0.12);
        }
        .sb-submit:hover { background: #f3f4f6; transform: scale(1.02); }
        .sb-submit:active { transform: scale(0.97); }

        .sb-dropdown {
          position: absolute; top: calc(100% + 8px); left: 0; right: 0; z-index: 999;
          background: #fff;
          border: 1.5px solid #e5e7eb;
          border-radius: 14px;
          box-shadow: 0 8px 30px rgba(0,0,0,0.1), 0 2px 8px rgba(0,0,0,0.06);
          overflow: hidden;
          animation: sbDropIn 0.18s cubic-bezier(0.4, 0, 0.2, 1);
        }
        @keyframes sbDropIn {
          from { opacity: 0; transform: translateY(-6px) scale(0.99); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }

        .sb-section-label {
          display: flex; align-items: center; gap: 6px;
          padding: 10px 14px 6px;
          font-size: 10px; font-weight: 500; letter-spacing: 0.08em;
          text-transform: uppercase; color: #9ca3af;
        }

        .sb-item {
          display: flex; align-items: center; gap: 10px;
          padding: 10px 14px; width: 100%; border: none; background: none;
          cursor: pointer; text-align: left;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px; color: #374151;
          transition: background 0.1s;
        }
        .sb-item:hover, .sb-item.active { background: #f9fafb; color: #111; }
        .sb-item.active { background: #f3f4f6; }
        .sb-item-icon { color: #d1d5db; flex-shrink: 0; }
        .sb-item.active .sb-item-icon { color: #9ca3af; }

        .sb-divider { height: 1px; background: #f3f4f6; margin: 0 14px; }
      `}</style>

      <div ref={containerRef} className="sb-root" style={{ position: 'relative', width: '100%', maxWidth: 600, margin: '0 auto' }}>
        <div className={`sb-wrap ${isHero ? 'hero' : 'default'} ${isFocused ? 'focused' : ''}`}>
          
          <div className="sb-icon">
            {isLoading
              ? <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
              : <Search size={18} />
            }
          </div>

          <input
            ref={inputRef}
            className="sb-input"
            type="text"
            value={value}
            onChange={e => onChange(e.target.value)}
            onFocus={() => { setIsFocused(true); setActiveIndex(-1); }}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            autoComplete="off"
            aria-label="Search"
          />

          {value && (
            <button className="sb-clear" onClick={() => { onChange(''); inputRef.current?.focus(); }} type="button" aria-label="Clear">
              <X size={13} strokeWidth={2.5} />
            </button>
          )}

          {isHero && onSubmit && (
            <button className="sb-submit" onClick={onSubmit} type="button">
              Search
            </button>
          )}
        </div>

        {showDropdown && (
          <div className="sb-dropdown">
            <div className="sb-section-label">
              {value.length === 0 ? <><Clock size={10} /> Recent</> : <><TrendingUp size={10} /> Suggestions</>}
            </div>
            <div className="sb-divider" />
            {displayItems.map(({ label }, i) => (
              <button
                key={label}
                className={`sb-item ${i === activeIndex ? 'active' : ''}`}
                onMouseDown={() => selectItem(label)}
                onMouseEnter={() => setActiveIndex(i)}
              >
                {value.length === 0
                  ? <Clock size={14} className="sb-item-icon" />
                  : <Search size={14} className="sb-item-icon" />
                }
                {label}
              </button>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default SearchBar