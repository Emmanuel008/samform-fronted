import {
  getRecordField,
  getRecordId,
  parseRegistrationItem,
  parseRegistrationsList,
} from './adminRegistrations';

describe('adminRegistrations helpers', () => {
  test('parseRegistrationsList supports registrations and data keys', () => {
    expect(parseRegistrationsList({ registrations: [{ id: 1 }] })).toHaveLength(1);
    expect(parseRegistrationsList({ data: [{ id: 2 }] })).toHaveLength(1);
    expect(parseRegistrationsList({ success: true })).toEqual([]);
  });

  test('parseRegistrationItem supports registration and data keys', () => {
    expect(parseRegistrationItem({ registration: { id: 1 } }).id).toBe(1);
    expect(parseRegistrationItem({ data: { id: 2 } }).id).toBe(2);
  });

  test('getRecordField reads camelCase and snake_case', () => {
    expect(getRecordField({ full_name: 'Jane' }, 'fullName', 'full_name')).toBe('Jane');
    expect(getRecordId({ registration_id: 9 })).toBe(9);
  });
});
