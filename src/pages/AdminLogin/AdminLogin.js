import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminLogin, saveAdminSession } from '../../api/adminLogin';
import SiteHeader from '../../components/SiteHeader/SiteHeader';
import './AdminLogin.css';

function AdminLogin() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const response = await adminLogin(username.trim(), password);
      saveAdminSession(response);
      navigate('/admin/dashboard', { replace: true });
    } catch (loginError) {
      setError(loginError.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="admin-page">
      <SiteHeader />

      <div className="admin-login">
        <div className="admin-login__card">
          <h1 className="admin-login__title">Admin Sign In</h1>
          <p className="admin-login__subtitle">
            Sign in to manage Marambo Residence guest registrations.
          </p>

          <form className="admin-login__form" onSubmit={handleSubmit}>
            <div className="admin-login__field">
              <label htmlFor="admin-username">Username</label>
              <input
                id="admin-username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin@admin.com"
                autoComplete="username"
                required
              />
            </div>

            <div className="admin-login__field">
              <label htmlFor="admin-password">Password</label>
              <input
                id="admin-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                autoComplete="current-password"
                required
              />
            </div>

            {error && (
              <p className="admin-login__error" role="alert">
                {error}
              </p>
            )}

            <button type="submit" className="admin-login__submit" disabled={isSubmitting}>
              {isSubmitting ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AdminLogin;
