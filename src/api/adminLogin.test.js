import { buildAdminLoginPayload } from './adminLogin';

describe('adminLogin', () => {
  test('buildAdminLoginPayload sends username and password', () => {
    const payload = buildAdminLoginPayload('admin@admin.com', 'admin');

    expect(payload.get('username')).toBe('admin@admin.com');
    expect(payload.get('password')).toBe('admin');
  });
});
