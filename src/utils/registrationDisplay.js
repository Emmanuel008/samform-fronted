import COUNTRIES from '../data/countries';
import { getRecordField } from '../api/adminRegistrations';

export function getCountryLabel(codeOrName) {
  if (!codeOrName) {
    return '—';
  }

  const match = COUNTRIES.find(
    (country) => country.code === codeOrName || country.name === codeOrName,
  );

  return match?.name || codeOrName;
}

export function formatDateTime(value) {
  if (!value) {
    return '—';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatDate(value) {
  if (!value) {
    return '—';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function registrationToFormState(record) {
  return {
    id: getRecordField(record, 'id', 'registrationId', 'registration_id'),
    bookingRoomNo: getRecordField(record, 'bookingRoomNo', 'booking_room_no'),
    fullName: getRecordField(record, 'fullName', 'full_name'),
    nationality: getRecordField(record, 'nationality'),
    dateOfBirth: getRecordField(record, 'dateOfBirth', 'date_of_birth'),
    gender: getRecordField(record, 'gender'),
    phoneCountryCode: getRecordField(record, 'phoneCountryCode', 'phone_country_code'),
    phoneNumber: getRecordField(record, 'phoneNumber', 'phone_number'),
    emailAddress: getRecordField(record, 'emailAddress', 'email_address'),
    residentialAddress: getRecordField(record, 'residentialAddress', 'residential_address'),
    idType: getRecordField(record, 'idType', 'id_type'),
    idNumber: getRecordField(record, 'idNumber', 'id_number'),
    countryOfIssue: getRecordField(record, 'countryOfIssue', 'country_of_issue'),
    checkInDateTime: getRecordField(record, 'checkInDateTime', 'check_in_date_time'),
    checkOutDateTime: getRecordField(record, 'checkOutDateTime', 'check_out_date_time'),
    numberOfGuests: getRecordField(record, 'numberOfGuests', 'number_of_guests'),
    purposeOfStay: getRecordField(record, 'purposeOfStay', 'purpose_of_stay'),
    vehicleMakeModel: getRecordField(record, 'vehicleMakeModel', 'vehicle_make_model'),
    registrationNumber: getRecordField(record, 'registrationNumber', 'registration_number'),
    emergencyContactName: getRecordField(record, 'emergencyContactName', 'emergency_contact_name'),
    emergencyContactRelationship: getRecordField(
      record,
      'emergencyContactRelationship',
      'emergency_contact_relationship',
    ),
    emergencyContactCountryCode: getRecordField(
      record,
      'emergencyContactCountryCode',
      'emergency_contact_country_code',
    ),
    emergencyContactPhone: getRecordField(record, 'emergencyContactPhone', 'emergency_contact_phone'),
    signatureDate: getRecordField(record, 'signatureDate', 'signature_date'),
    declarationConfirmed: getRecordField(record, 'declarationConfirmed', 'declaration_confirmed'),
  };
}
