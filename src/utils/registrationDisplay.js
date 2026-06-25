import COUNTRIES from '../data/countries';
import { resolveAssetUrl } from '../api/config';
import { getRecordField, getRecordId, normalizeRegistrationRecord } from '../api/adminRegistrations';

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

export function getIdDocumentUrl(record) {
  const normalized = normalizeRegistrationRecord(record);
  const path = getRecordField(
    normalized,
    'idDocument',
    'id_document',
    'idDocumentUrl',
    'id_document_url',
    'idDocumentPath',
    'id_document_path',
  );

  return resolveAssetUrl(path);
}

export function isImageAsset(value) {
  return /\.(jpe?g|png|webp|gif)$/i.test(value || '');
}

export function isPdfAsset(value) {
  return /\.pdf$/i.test(value || '');
}

export function registrationToFormState(record) {
  const normalized = normalizeRegistrationRecord(record);

  return {
    id: getRecordId(normalized),
    bookingRoomNo: getRecordField(normalized, 'bookingRoomNo', 'booking_room_no'),
    fullName: getRecordField(normalized, 'fullName', 'full_name'),
    nationality: getRecordField(normalized, 'nationality'),
    dateOfBirth: getRecordField(normalized, 'dateOfBirth', 'date_of_birth'),
    gender: getRecordField(normalized, 'gender'),
    phoneCountryCode: getRecordField(normalized, 'phoneCountryCode', 'phone_country_code'),
    phoneNumber: getRecordField(normalized, 'phoneNumber', 'phone_number'),
    emailAddress: getRecordField(normalized, 'emailAddress', 'email_address'),
    residentialAddress: getRecordField(normalized, 'residentialAddress', 'residential_address'),
    idType: getRecordField(normalized, 'idType', 'id_type'),
    idNumber: getRecordField(normalized, 'idNumber', 'id_number'),
    countryOfIssue: getRecordField(normalized, 'countryOfIssue', 'country_of_issue'),
    idDocument: getRecordField(
      normalized,
      'idDocument',
      'id_document',
      'idDocumentUrl',
      'id_document_url',
      'idDocumentPath',
      'id_document_path',
    ),
    checkInDateTime: getRecordField(normalized, 'checkInDateTime', 'check_in_date_time'),
    checkOutDateTime: getRecordField(normalized, 'checkOutDateTime', 'check_out_date_time'),
    numberOfGuests: getRecordField(normalized, 'numberOfGuests', 'number_of_guests'),
    purposeOfStay: getRecordField(normalized, 'purposeOfStay', 'purpose_of_stay'),
    vehicleMakeModel: getRecordField(normalized, 'vehicleMakeModel', 'vehicle_make_model'),
    registrationNumber: getRecordField(normalized, 'registrationNumber', 'registration_number'),
    emergencyContactName: getRecordField(normalized, 'emergencyContactName', 'emergency_contact_name'),
    emergencyContactRelationship: getRecordField(
      normalized,
      'emergencyContactRelationship',
      'emergency_contact_relationship',
    ),
    emergencyContactCountryCode: getRecordField(
      normalized,
      'emergencyContactCountryCode',
      'emergency_contact_country_code',
    ),
    emergencyContactPhone: getRecordField(normalized, 'emergencyContactPhone', 'emergency_contact_phone'),
    signatureDate: getRecordField(normalized, 'signatureDate', 'signature_date'),
    declarationConfirmed: getRecordField(normalized, 'declarationConfirmed', 'declaration_confirmed'),
  };
}
