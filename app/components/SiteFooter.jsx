import {NavLink} from 'react-router';
import {NAV_LINKS} from '~/lib/nav';

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-content">
        <div className="footer-brand">
          <img src="/img/FizzyLeafLogo.webp" alt="Fizzy Leaf" />
          <span>Fizzy Leaf</span>
        </div>
        <ul className="footer-links">
          {NAV_LINKS.map((link) => (
            <li key={link.to}>
              <NavLink to={link.to} end={link.end} prefetch="intent">
                {link.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </div>
      <div className="footer-bottom">
        <p>
          &copy; 2026 Fizzy Leaf Sparkling Tea · Handcrafted in Middle Tennessee
          · Unsweetened &amp; Unfiltered
        </p>
      </div>
    </footer>
  );
}
