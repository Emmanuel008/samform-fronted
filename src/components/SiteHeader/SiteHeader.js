import { Link, useLocation } from 'react-router-dom';
import './SiteHeader.css';

const LOGO_URL = `${process.env.PUBLIC_URL}/marambo.jpeg`;

function SiteHeader() {
  const location = useLocation();
  const showLoginButton = !location.pathname.startsWith('/admin');

  return (
    <header className="site-header">
      <div className="site-header__inner">
        <div className="site-header__brand">
          <div className="site-header__logo-wrap">
            <img
              src={LOGO_URL}
              alt="Marambo Residence logo"
              className="site-header__logo"
            />
          </div>
          <div className="site-header__text">
            <h1 className="site-header__title">Guest Registration</h1>
            <p className="site-header__subtitle">MARAMBO RESIDENCE</p>
          </div>
        </div>

        {showLoginButton && (
          <Link to="/admin" className="site-header__login">
            Admin Login
          </Link>
        )}
      </div>
    </header>
  );
}

export default SiteHeader;
