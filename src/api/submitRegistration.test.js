import { buildRegistrationFormData, formatFullPhone, getDialCode } from './submitRegistration';

describe('submitRegistration', () => {
  test('getDialCode returns dial code for country code', () => {
    expect(getDialCode('KE')).toBe('+254');
  });

  test('formatFullPhone combines dial code and local number', () => {
    expect(formatFullPhone('KE', '712345678')).toBe('+254712345678');
  });

  test('buildRegistrationFormData maps fields for multipart submit', () => {
    const formData = {
      bookingRoomNo: 'MR-204',
      fullName: 'Test Guest',
      nationality: 'KE',
      dateOfBirth: '1990-01-15',
      gender: 'Male',
      phoneCountryCode: 'KE',
      phoneNumber: '712345678',
      emailAddress: 'test@example.com',
      residentialAddress: 'Nairobi',
      idType: 'Passport',
      idNumber: 'A123',
      countryOfIssue: 'KE',
      checkInDateTime: '2026-06-25T14:00',
      checkOutDateTime: '2026-06-27T10:00',
      numberOfGuests: '1',
      purposeOfStay: 'Leisure',
      vehicleMakeModel: '',
      registrationNumber: '',
      emergencyContactName: 'Jane',
      emergencyContactRelationship: 'Spouse',
      emergencyContactCountryCode: 'KE',
      emergencyContactPhone: '798765432',
      agreedToTerms: true,
      signature: 'data:image/png;base64,abc',
      signatureDate: '2026-06-25',
    };

    const file = new File(['id'], 'id.png', { type: 'image/png' });
    const payload = buildRegistrationFormData(formData, file);

    expect(payload.get('bookingRoomNo')).toBe('MR-204');
    expect(payload.get('phoneCountryCode')).toBe('+254');
    expect(payload.get('phoneNumber')).toBe('+254712345678');
    expect(payload.get('declarationConfirmed')).toBe('1');
    expect(payload.get('guestSignature')).toBe('data:image/png;base64,abc');
    expect(payload.get('idDocument')).toEqual(expect.any(File));
  });
});
