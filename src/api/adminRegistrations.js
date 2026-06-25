import axios from 'axios';
import { apiUrl, formatNetworkError } from './config';
import { getAdminKey } from './adminLogin';

const REGISTRATIONS_URL = apiUrl('/admin_registrations.php');
const UPDATE_URL = apiUrl('/admin_update.php');
const DELETE_URL = apiUrl('/admin_delete.php');

function getAuthHeaders() {
  const adminKey = getAdminKey();

  if (!adminKey) {
    throw new Error('You are not signed in. Please log in again.');
  }

  return {
    'X-Admin-Key': adminKey,
  };
}

function parseApiError(error, fallback) {
  return formatNetworkError(error, fallback);
}

export function parseRegistrationsList(data) {
  if (Array.isArray(data?.registrations)) {
    return data.registrations;
  }

  if (Array.isArray(data?.data)) {
    return data.data;
  }

  return [];
}

export function parseRegistrationItem(data) {
  return data?.registration || data?.data || null;
}

export function getRecordId(record) {
  return record?.id ?? record?.registrationId ?? record?.registration_id ?? '';
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

    if (!registration) {
      throw new Error('Registration not found.');
    }

    return registration;
  } catch (error) {
    throw new Error(parseApiError(error, 'Failed to load registration.'));
  }
}

export function buildUpdatePayload(registration) {
  const payload = new FormData();
  const id = getRecordId(registration);

  if (!id) {
    throw new Error('Registration id is required.');
  }

  payload.append('id', String(id));

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
    const value = getRecordField(registration, field, toSnakeCase(field));
    if (value !== '') {
      payload.append(field, value);
    }
  });

  return payload;
}

function toSnakeCase(value) {
  return value.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
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
    const payload = new FormData();
    payload.append('id', String(id));

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
