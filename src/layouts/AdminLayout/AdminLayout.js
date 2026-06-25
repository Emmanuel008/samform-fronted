import { useEffect, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  IconClose,
  IconDashboard,
  IconLogOut,
  IconMenu,
  IconRegistrations,
} from '../../components/AdminIcons/AdminIcons';
import { clearAdminSession, getAdminKey, getAdminSession } from '../../api/adminLogin';
import './AdminLayout.css';

const LOGO_URL = `${process.env.PUBLIC_URL}/marambo.jpeg`;

const NAV_ITEMS = [
  {
    to: '/admin/dashboard',
    label: 'Dashboard',
    icon: IconDashboard,
    end: true,
  },
  {
    to: '/admin/registrations',
    label: 'Registrations',
    icon: IconRegistrations,
  },
];

function AdminLayout() {
  const navigate = useNavigate();
  const adminKey = getAdminKey();
  const session = getAdminSession();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    if (!adminKey) {
      navigate('/admin', { replace: true });
    }
  }, [adminKey, navigate]);

  const handleLogout = () => {
    clearAdminSession();
    navigate('/admin', { replace: true });
  };

  const closeSidebar = () => setIsSidebarOpen(false);

  if (!adminKey) {
    return null;
  }

  return (
    <div className="admin-shell">
      <button
        type="button"
        className="admin-shell__mobile-toggle"
        aria-label={isSidebarOpen ? 'Close menu' : 'Open menu'}
        onClick={() => setIsSidebarOpen((open) => !open)}
      >
        {isSidebarOpen ? <IconClose className="admin-shell__icon" /> : <IconMenu className="admin-shell__icon" />}
      </button>

      {isSidebarOpen && (
        <button
          type="button"
          className="admin-shell__backdrop"
          aria-label="Close menu"
          onClick={closeSidebar}
        />
      )}

      <aside className={['admin-sidebar', isSidebarOpen && 'admin-sidebar--open'].filter(Boolean).join(' ')}>
        <div className="admin-sidebar__brand">
          <img src={LOGO_URL} alt="Marambo Residence" className="admin-sidebar__logo" />
          <div>
            <p className="admin-sidebar__title">Marambo Residence</p>
            <p className="admin-sidebar__subtitle">Admin Panel</p>
          </div>
        </div>

        <nav className="admin-sidebar__nav" aria-label="Admin navigation">
          {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                ['admin-sidebar__link', isActive && 'admin-sidebar__link--active']
                  .filter(Boolean)
                  .join(' ')
              }
              onClick={closeSidebar}
            >
              <Icon className="admin-sidebar__icon" />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="admin-sidebar__footer">
          {session?.admin?.email && (
            <p className="admin-sidebar__user">{session.admin.email}</p>
          )}
          <button type="button" className="admin-sidebar__logout" onClick={handleLogout}>
            <IconLogOut className="admin-sidebar__icon" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
}

export default AdminLayout;
