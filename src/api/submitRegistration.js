import axios from 'axios';
import COUNTRIES from '../data/countries';
import { API_BASE } from './config';

export const SUBMIT_URL = `${API_BASE}/submit.php`;

export function getDialCode(countryCode) {
  return COUNTRIES.find((country) => country.code === countryCode)?.dialCode || '';
}

export function formatFullPhone(countryCode, phoneNumber) {
  const dialCode = getDialCode(countryCode);
  const localDigits = String(phoneNumber).replace(/\D/g, '');

  if (!dialCode || !localDigits) {
    return '';
  }

  const dialDigits = dialCode.replace(/\D/g, '');
  return `+${dialDigits}${localDigits}`;
}

export function buildRegistrationFormData(formData, idAttachment) {
  const payload = new FormData();

  payload.append('bookingRoomNo', formData.bookingRoomNo);
  payload.append('fullName', formData.fullName);
  payload.append('nationality', formData.nationality);
  payload.append('dateOfBirth', formData.dateOfBirth);
  payload.append('gender', formData.gender);
  payload.append('phoneCountryCode', getDialCode(formData.phoneCountryCode));
  payload.append('phoneNumber', formatFullPhone(formData.phoneCountryCode, formData.phoneNumber));
  payload.append('emailAddress', formData.emailAddress);
  payload.append('residentialAddress', formData.residentialAddress);
  payload.append('idType', formData.idType);
  payload.append('idNumber', formData.idNumber);
  payload.append('countryOfIssue', formData.countryOfIssue);
  payload.append('checkInDateTime', formData.checkInDateTime);
  payload.append('checkOutDateTime', formData.checkOutDateTime);
  payload.append('numberOfGuests', formData.numberOfGuests);
  payload.append('purposeOfStay', formData.purposeOfStay);
  payload.append('emergencyContactName', formData.emergencyContactName);
  payload.append('emergencyContactRelationship', formData.emergencyContactRelationship);
  payload.append(
    'emergencyContactCountryCode',
    getDialCode(formData.emergencyContactCountryCode),
  );
  payload.append(
    'emergencyContactPhone',
    formatFullPhone(formData.emergencyContactCountryCode, formData.emergencyContactPhone),
  );
  payload.append('declarationConfirmed', formData.agreedToTerms ? '1' : '0');
  payload.append('signatureDate', formData.signatureDate);
  payload.append('guestSignature', formData.signature);

  if (formData.vehicleMakeModel) {
    payload.append('vehicleMakeModel', formData.vehicleMakeModel);
  }

  if (formData.registrationNumber) {
    payload.append('registrationNumber', formData.registrationNumber);
  }

  if (idAttachment) {
    payload.append('idDocument', idAttachment, idAttachment.name);
  }

  return payload;
}

export async function submitRegistration(formData, idAttachment) {
  try {
    const payload = buildRegistrationFormData(formData, idAttachment);
    const response = await axios.post(SUBMIT_URL, payload);

    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Submission failed.');
    }

    return response.data;
  } catch (error) {
    const message =
      error.response?.data?.message ||
      error.message ||
      'Failed to submit registration. Please try again.';

    throw new Error(message);
  }
}
