import {useEffect, useState} from 'react';
import {NavLink} from 'react-router';
import {NAV_LINKS} from '~/lib/nav';

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener('scroll', onScroll, {passive: true});
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  useEffect(() => {
    if (!menuOpen) return undefined;
    const onKey = (event) => {
      if (event.key === 'Escape') setMenuOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [menuOpen]);

  return (
    <>
      <header
        className={`site-header${scrolled ? ' scrolled' : ''}`}
        id="header"
      >
        <div className="header-inner">
          <nav className="nav-desktop">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                prefetch="intent"
                className={({isActive}) => (isActive ? 'active' : undefined)}
              >
                {link.label}
              </NavLink>
            ))}
            <NavLink
              to="/shop"
              prefetch="intent"
              className={({isActive}) =>
                isActive ? 'nav-cta active' : 'nav-cta'
              }
            >
              Shop Now
            </NavLink>
          </nav>
        </div>
      </header>
      <button
        className={`menu-toggle${menuOpen ? ' open' : ''}`}
        type="button"
        aria-label="Toggle menu"
        aria-expanded={menuOpen}
        onClick={() => setMenuOpen((open) => !open)}
      >
        <span />
        <span />
        <span />
      </button>
      <nav
        className={`nav-overlay${menuOpen ? ' open' : ''}`}
        aria-hidden={!menuOpen}
      >
        {NAV_LINKS.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            prefetch="intent"
            className={({isActive}) => (isActive ? 'active' : undefined)}
            onClick={() => setMenuOpen(false)}
          >
            {link.label}
          </NavLink>
        ))}
        <NavLink
          to="/shop"
          className="btn btn-primary"
          style={{marginTop: '1rem'}}
          prefetch="intent"
          onClick={() => setMenuOpen(false)}
        >
          Shop Now
        </NavLink>
      </nav>
    </>
  );
}
