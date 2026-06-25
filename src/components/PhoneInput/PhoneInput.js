import COUNTRIES from '../../data/countries';
import SearchableCountrySelect from '../SearchableCountrySelect/SearchableCountrySelect';
import './PhoneInput.css';

function PhoneInput({
  id,
  label,
  countryCode,
  phoneNumber,
  onCountryChange,
  onPhoneChange,
  required = false,
  className = '',
  showHint = true,
}) {
  const selectedCountry = COUNTRIES.find((country) => country.code === countryCode);

  return (
    <div className={`form-field ${className}`.trim()}>
      <label htmlFor={id}>{label}</label>
      <div className="phone-input">
        <div className="phone-input__code-wrap">
          <SearchableCountrySelect
            id={`${id}-country`}
            value={countryCode}
            onChange={onCountryChange}
            placeholder="Code"
            required={required}
            variant="dialCode"
            compact
            ariaLabel={`${label} country code`}
          />
        </div>
        <input
          id={id}
          type="tel"
          className="phone-input__number"
          value={phoneNumber}
          onChange={(e) => onPhoneChange(e.target.value)}
          placeholder="Phone number"
          required={required}
        />
      </div>
      {showHint && (
        <p className="form-field__hint">
          Search by country name to choose a code
          {selectedCountry ? ` (${selectedCountry.dialCode})` : ''}, then enter your number
        </p>
      )}
    </div>
  );
}

export default PhoneInput;
