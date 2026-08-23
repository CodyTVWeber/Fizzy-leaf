import {Await, useLocation, useNavigate} from 'react-router';
import {Suspense, useEffect, useRef} from 'react';
import {Aside} from '~/components/Aside';
import {CartFab} from '~/components/CartFab';
import {CartMain} from '~/components/CartMain';
import {SiteFooter} from '~/components/SiteFooter';
import {SiteHeader} from '~/components/SiteHeader';
import {FADE_OUT_MS, internalFadeUrl} from '~/lib/page-fade';

/**
 * @param {PageLayoutProps}
 */
export function PageLayout({cart, children = null}) {
  useInternalPageFade();

  return (
    <Aside.Provider>
      <SiteHeader />
      <CartAside cart={cart} />
      <div className="page-shell is-entering">
        <main className="page-main">{children}</main>
        <SiteFooter />
      </div>
      <CartFab cart={cart} />
    </Aside.Provider>
  );
}

function useInternalPageFade() {
  const navigate = useNavigate();
  const location = useLocation();
  const firstPath = useRef(true);

  useEffect(() => {
    document.body.classList.remove('is-leaving');
    if (firstPath.current) {
      firstPath.current = false;
      return undefined;
    }
    const shell = document.querySelector('.page-shell');
    if (!shell) return undefined;
    shell.classList.remove('is-entering');
    void shell.offsetWidth;
    shell.classList.add('is-entering');
    return undefined;
  }, [location.pathname]);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return undefined;
    }

    function onClick(event) {
      const anchor = event.target.closest?.('a[href]');
      const next = internalFadeUrl(anchor, event);
      if (!next) return;
      event.preventDefault();
      document.body.classList.add('is-leaving');
      window.setTimeout(() => {
        navigate(next.pathname + next.search + next.hash);
      }, FADE_OUT_MS);
    }

    document.addEventListener('click', onClick, true);
    return () => document.removeEventListener('click', onClick, true);
  }, [navigate]);
}

/**
 * @param {{cart: PageLayoutProps['cart']}}
 */
function CartAside({cart}) {
  return (
    <Aside type="cart" heading="Your Cart">
      <Suspense fallback={<p>Loading cart …</p>}>
        <Await resolve={cart}>
          {(resolvedCart) => (
            <CartMain cart={resolvedCart} layout="aside" />
          )}
        </Await>
      </Suspense>
    </Aside>
  );
}

/**
 * @typedef {Object} PageLayoutProps
 * @property {Promise<CartApiQueryFragment|null>} cart
 * @property {React.ReactNode} [children]
 */

/** @typedef {import('storefrontapi.generated').CartApiQueryFragment} CartApiQueryFragment */
