import { getAdminDisplayName } from './sweetAlert';

describe('sweetAlert helpers', () => {
  test('getAdminDisplayName prefers admin name and email', () => {
    expect(getAdminDisplayName({ admin: { name: 'Jane Admin' } })).toBe('Jane Admin');
    expect(getAdminDisplayName({ admin: { email: 'admin@admin.com' } })).toBe('admin@admin.com');
    expect(getAdminDisplayName({}, 'fallback@admin.com')).toBe('fallback@admin.com');
  });
});
