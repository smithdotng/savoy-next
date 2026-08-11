import { categories } from '@/lib/categories';
import { getMenuData } from '@/lib/getMenuData';
import MenuBrowser from '@/components/MenuBrowser';
import MenuSearch from '@/components/MenuSearch';
import ReservationPanel from '@/components/ReservationPanel';
import InstallPrompt from '@/components/InstallPrompt';

export const dynamic = 'force-dynamic'; // menu prices/items change often - always fetch fresh

export default async function HomePage() {
  const menuData = await getMenuData();

  return (
    <div className="public-page">
      <header className="site-header">
        <div className="site-topbar">
          <div className="container site-topbar-inner">
            <span>
              <i className="fa fa-map-marker" /> 43 Isaac John St, Ikeja GRA
            </span>
            <span>
              <i className="fa fa-phone" /> +234 (0) 201-295-4999
            </span>
            <span>
              <i className="fa fa-envelope" /> reservations@savoysummerset.com
            </span>
          </div>
        </div>

        <div className="site-header-hero">
          <div className="container">
            <img src="/images/logo-header.png" alt="Savoy Summerset Logo" className="site-logo" />
            <h1>Savoy Summerset</h1>
            <div className="site-divider" />
            <p>Experience the finest culinary delights from around the world in an elegant atmosphere</p>
          </div>
        </div>
      </header>

      <ReservationPanel />

      <div className="container">
        <MenuSearch categories={categories} />
        <MenuBrowser categories={categories} menuData={menuData} />
      </div>

      <footer className="site-footer">
        <div className="footer-content">
          <div className="footer-logo">Savoy Summerset</div>
          <div className="footer-info">
            43 Isaac John St, Ikeja GRA
            <br />
            +234 (0) 201-295-4999 +234 (0) 813 882 1379
            <br />
            Open Daily: 9:00 AM - 11:00 PM
          </div>
          <div className="social-links">
            <a href="#" aria-label="Facebook">
              <i className="fa fa-facebook" />
            </a>
            <a href="#" aria-label="Instagram">
              <i className="fa fa-instagram" />
            </a>
            <a href="#" aria-label="Twitter">
              <i className="fa fa-twitter" />
            </a>
          </div>
          <div className="copyright">&copy; {new Date().getFullYear()} Savoy Summerset Hotel. All rights reserved.</div>
        </div>
      </footer>

      <InstallPrompt />
    </div>
  );
}
