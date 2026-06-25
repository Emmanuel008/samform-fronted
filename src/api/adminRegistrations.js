import axios from 'axios';
import { apiUrl, formatNetworkError } from './config';
import { getAdminKey } from './adminLogin';

const REGISTRATIONS_URL = apiUrl('/admin_registrations.php');
const UPDATE_URL = apiUrl('/admin_update.php');
const DELETE_URL = apiUrl('/admin_delete.php');

const SNAKE_TO_CAMEL = {
  booking_room_no: 'bookingRoomNo',
  full_name: 'fullName',
  date_of_birth: 'dateOfBirth',
  phone_country_code: 'phoneCountryCode',
  phone_number: 'phoneNumber',
  email_address: 'emailAddress',
  residential_address: 'residentialAddress',
  id_type: 'idType',
  id_number: 'idNumber',
  country_of_issue: 'countryOfIssue',
  check_in_date_time: 'checkInDateTime',
  check_in_datetime: 'checkInDateTime',
  check_out_date_time: 'checkOutDateTime',
  check_out_datetime: 'checkOutDateTime',
  number_of_guests: 'numberOfGuests',
  purpose_of_stay: 'purposeOfStay',
  vehicle_make_model: 'vehicleMakeModel',
  registration_number: 'registrationNumber',
  emergency_contact_name: 'emergencyContactName',
  emergency_contact_relationship: 'emergencyContactRelationship',
  emergency_contact_country_code: 'emergencyContactCountryCode',
  emergency_contact_phone: 'emergencyContactPhone',
  signature_date: 'signatureDate',
  declaration_confirmed: 'declarationConfirmed',
  registration_id: 'id',
  guest_signature: 'guestSignature',
  id_document: 'idDocument',
  id_document_url: 'idDocumentUrl',
  id_document_path: 'idDocumentPath',
  created_at: 'createdAt',
  updated_at: 'updatedAt',
};

function parseApiError(error, fallback) {
  return formatNetworkError(error, fallback);
}

export function getRecordId(record) {
  if (!record || typeof record !== 'object') {
    return '';
  }

  const candidates = [
    record.registration_id,
    record.registrationId,
    record.id,
  ];

  for (const value of candidates) {
    if (value !== undefined && value !== null && value !== '') {
      return value;
    }
  }

  return '';
}

function buildRegistrationActionPayload(id) {
  const normalizedId = String(id).trim();

  if (!normalizedId) {
    throw new Error('Registration id is required.');
  }

  const payload = new FormData();
  payload.append('id', normalizedId);
  payload.append('registration_id', normalizedId);
  return payload;
}

export function getRecordField(record, ...keys) {
  for (const key of keys) {
    const value = record?.[key];
    if (value !== undefined && value !== null && value !== '') {
      return value;
    }
  }

  return '';
}

export function normalizeRegistrationRecord(record) {
  if (!record || typeof record !== 'object' || Array.isArray(record)) {
    return {};
  }

  const normalized = { ...record };

  Object.entries(SNAKE_TO_CAMEL).forEach(([snake, camel]) => {
    if (normalized[snake] !== undefined && normalized[snake] !== null && normalized[snake] !== '') {
      normalized[camel] = normalized[snake];
    }
  });

  const id = getRecordId(normalized);
  if (id !== '') {
    normalized.id = id;
  }

  return normalized;
}

function extractRegistrationsArray(payload) {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (!payload || typeof payload !== 'object') {
    return [];
  }

  const listKeys = ['registrations', 'items', 'results', 'records', 'data'];

  for (const key of listKeys) {
    const value = payload[key];

    if (Array.isArray(value)) {
      return value;
    }

    if (value && typeof value === 'object') {
      const nestedList = value.registrations || value.items || value.records;
      if (Array.isArray(nestedList)) {
        return nestedList;
      }

      const objectValues = Object.values(value).filter(
        (entry) => entry && typeof entry === 'object' && !Array.isArray(entry),
      );

      if (objectValues.length > 0) {
        return objectValues;
      }
    }
  }

  return [];
}

export function parseRegistrationsList(data) {
  return extractRegistrationsArray(data).map(normalizeRegistrationRecord);
}

export function parseRegistrationItem(data) {
  if (!data || typeof data !== 'object') {
    return null;
  }

  if (data.registration && typeof data.registration === 'object') {
    return normalizeRegistrationRecord(data.registration);
  }

  if (data.data && typeof data.data === 'object' && !Array.isArray(data.data)) {
    return normalizeRegistrationRecord(data.data);
  }

  if (getRecordId(data)) {
    return normalizeRegistrationRecord(data);
  }

  return null;
}

export function getRegistrationLabel(record, index = 0) {
  const normalized = normalizeRegistrationRecord(record);
  const id = getRecordId(normalized);

  return (
    normalized.fullName ||
    normalized.emailAddress ||
    normalized.bookingRoomNo ||
    (id ? `Guest #${id}` : `Guest ${index + 1}`)
  );
}

export async function fetchRegistrations(search = '') {
  try {
    const response = await axios.get(REGISTRATIONS_URL, {
      headers: getAuthHeaders(),
      params: search ? { search } : undefined,
    });

    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Failed to load registrations.');
    }

    return parseRegistrationsList(response.data);
  } catch (error) {
    throw new Error(parseApiError(error, 'Failed to load registrations.'));
  }
}

export async function fetchRegistration(id) {
  try {
    const response = await axios.get(REGISTRATIONS_URL, {
      headers: getAuthHeaders(),
      params: { id },
    });

    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Failed to load registration.');
    }

    const registration = parseRegistrationItem(response.data);

    if (!registration || !getRecordId(registration)) {
      throw new Error('Registration not found.');
    }

    return registration;
  } catch (error) {
    throw new Error(parseApiError(error, 'Failed to load registration.'));
  }
}

export function buildUpdatePayload(registration) {
  const normalized = normalizeRegistrationRecord(registration);
  const id = getRecordId(normalized);

  if (!id) {
    throw new Error('Registration id is required.');
  }

  const payload = buildRegistrationActionPayload(id);

  const fields = [
    'bookingRoomNo',
    'fullName',
    'nationality',
    'dateOfBirth',
    'gender',
    'phoneCountryCode',
    'phoneNumber',
    'emailAddress',
    'residentialAddress',
    'idType',
    'idNumber',
    'countryOfIssue',
    'checkInDateTime',
    'checkOutDateTime',
    'numberOfGuests',
    'purposeOfStay',
    'vehicleMakeModel',
    'registrationNumber',
    'emergencyContactName',
    'emergencyContactRelationship',
    'emergencyContactCountryCode',
    'emergencyContactPhone',
    'signatureDate',
    'declarationConfirmed',
  ];

  fields.forEach((field) => {
    const value = getRecordField(normalized, field, toSnakeCase(field));
    if (value !== '') {
      payload.append(field, value);
    }
  });

  return payload;
}

function toSnakeCase(value) {
  return value.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
}

function getAuthHeaders() {
  const adminKey = getAdminKey();

  if (!adminKey) {
    throw new Error('You are not signed in. Please log in again.');
  }

  return {
    'X-Admin-Key': adminKey,
  };
}

export async function updateRegistration(registration) {
  try {
    const payload = buildUpdatePayload(registration);
    const response = await axios.post(UPDATE_URL, payload, {
      headers: getAuthHeaders(),
    });

    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Failed to update registration.');
    }

    return response.data;
  } catch (error) {
    throw new Error(parseApiError(error, 'Failed to update registration.'));
  }
}

export async function deleteRegistration(id) {
  try {
    const payload = buildRegistrationActionPayload(id);

    const response = await axios.post(DELETE_URL, payload, {
      headers: getAuthHeaders(),
    });

    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Failed to delete registration.');
    }

    return response.data;
  } catch (error) {
    throw new Error(parseApiError(error, 'Failed to delete registration.'));
  }
}
