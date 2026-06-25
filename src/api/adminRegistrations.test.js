import {
  getRecordField,
  getRecordId,
  normalizeRegistrationRecord,
  parseRegistrationItem,
  parseRegistrationsList,
  getRegistrationLabel,
} from './adminRegistrations';

describe('adminRegistrations helpers', () => {
  test('parseRegistrationsList supports multiple response shapes', () => {
    expect(parseRegistrationsList({ registrations: [{ id: 1, full_name: 'Jane' }] })).toHaveLength(1);
    expect(parseRegistrationsList({ data: [{ id: 2 }] })).toHaveLength(1);
    expect(parseRegistrationsList({ data: { registrations: [{ id: 3 }] } })).toHaveLength(1);
    expect(parseRegistrationsList({ items: [{ id: 4 }] })).toHaveLength(1);
    expect(parseRegistrationsList({ success: true })).toEqual([]);
  });

  test('normalizeRegistrationRecord maps snake_case fields', () => {
    const record = normalizeRegistrationRecord({
      registration_id: 9,
      full_name: 'Jane Doe',
      booking_room_no: 'MR-10',
      email_address: 'jane@example.com',
    });

    expect(record.id).toBe(9);
    expect(record.fullName).toBe('Jane Doe');
    expect(record.bookingRoomNo).toBe('MR-10');
    expect(record.emailAddress).toBe('jane@example.com');
  });

  test('parseRegistrationItem supports registration and data keys', () => {
    expect(parseRegistrationItem({ registration: { id: 1 } }).id).toBe(1);
    expect(parseRegistrationItem({ data: { id: 2, full_name: 'Sam' } }).fullName).toBe('Sam');
  });

  test('getRecordField reads camelCase and snake_case', () => {
    expect(getRecordField({ full_name: 'Jane' }, 'fullName', 'full_name')).toBe('Jane');
    expect(getRecordId({ registration_id: 9 })).toBe(9);
    expect(getRecordId({ id: 3, registration_id: 9 })).toBe(9);
    expect(getRecordId({ id: 7 })).toBe(7);
  });

  test('getRegistrationLabel falls back when name is missing', () => {
    expect(getRegistrationLabel({ email_address: 'a@b.com' }, 0)).toBe('a@b.com');
    expect(getRegistrationLabel({ id: 7 }, 1)).toBe('Guest #7');
  });
});
