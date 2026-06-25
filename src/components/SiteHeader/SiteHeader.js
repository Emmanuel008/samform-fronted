import './SiteHeader.css';

const LOGO_URL = `${process.env.PUBLIC_URL}/marambo.jpeg`;

function SiteHeader() {
  return (
    <header className="site-header">
      <div className="site-header__inner">
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
    </header>
  );
}

export default SiteHeader;
