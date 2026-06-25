import SearchableCountrySelect from '../SearchableCountrySelect/SearchableCountrySelect';
import './CountrySelect.css';

function CountrySelect({
  id,
  label,
  value,
  onChange,
  placeholder = 'Select country',
  required = false,
  className = '',
}) {
  return (
    <div className={`form-field ${className}`.trim()}>
      <label htmlFor={id}>{label}</label>
      <SearchableCountrySelect
        id={id}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        variant="country"
        ariaLabel={label}
      />
    </div>
  );
}

export default CountrySelect;
