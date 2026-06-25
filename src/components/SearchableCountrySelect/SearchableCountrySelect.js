import { useEffect, useId, useRef, useState } from 'react';
import COUNTRIES from '../../data/countries';
import './SearchableCountrySelect.css';

function SearchableCountrySelect({
  id,
  value,
  onChange,
  placeholder = 'Select country',
  required = false,
  variant = 'country',
  compact = false,
  ariaLabel,
}) {
  const listboxId = useId();
  const containerRef = useRef(null);
  const searchRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');

  const selectedCountry = COUNTRIES.find((country) => country.code === value);

  const filteredCountries = COUNTRIES.filter((country) => {
    const query = search.trim().toLowerCase();
    if (!query) return true;

    return (
      country.name.toLowerCase().includes(query) ||
      country.dialCode.includes(query) ||
      country.code.toLowerCase().includes(query)
    );
  });

  const displayLabel = selectedCountry
    ? variant === 'dialCode'
      ? selectedCountry.dialCode
      : selectedCountry.name
    : '';

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearch('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && searchRef.current) {
      searchRef.current.focus();
    }
  }, [isOpen]);

  const handleOpen = () => {
    setIsOpen(true);
    setSearch('');
  };

  const handleSelect = (countryCode) => {
    onChange(countryCode);
    setIsOpen(false);
    setSearch('');
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Escape') {
      setIsOpen(false);
      setSearch('');
    }
  };

  return (
    <div
      ref={containerRef}
      className={[
        'searchable-country',
        compact && 'searchable-country--compact',
        isOpen && 'searchable-country--open',
      ]
        .filter(Boolean)
        .join(' ')}
      onKeyDown={handleKeyDown}
    >
      <input
        tabIndex={-1}
        className="searchable-country__validator"
        value={value}
        onChange={() => {}}
        required={required}
        aria-hidden="true"
      />

      <button
        type="button"
        id={id}
        className="searchable-country__trigger"
        onClick={handleOpen}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={listboxId}
        aria-label={ariaLabel || placeholder}
      >
        <span
          className={[
            'searchable-country__value',
            !displayLabel && 'searchable-country__value--placeholder',
          ]
            .filter(Boolean)
            .join(' ')}
        >
          {displayLabel || placeholder}
        </span>
        <span className="searchable-country__chevron" aria-hidden="true" />
      </button>

      {isOpen && (
        <div className="searchable-country__dropdown">
          <input
            ref={searchRef}
            type="text"
            className="searchable-country__search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search country..."
            aria-label="Search country by name"
          />
          <ul
            id={listboxId}
            className="searchable-country__list"
            role="listbox"
            aria-label={ariaLabel || 'Countries'}
          >
            {filteredCountries.length === 0 ? (
              <li className="searchable-country__empty">No countries found</li>
            ) : (
              filteredCountries.map((country) => (
                <li key={country.code} role="option" aria-selected={country.code === value}>
                  <button
                    type="button"
                    className={[
                      'searchable-country__option',
                      country.code === value && 'searchable-country__option--selected',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                    onClick={() => handleSelect(country.code)}
                  >
                    <span className="searchable-country__option-name">{country.name}</span>
                    {variant === 'dialCode' && (
                      <span className="searchable-country__option-code">{country.dialCode}</span>
                    )}
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

export default SearchableCountrySelect;
