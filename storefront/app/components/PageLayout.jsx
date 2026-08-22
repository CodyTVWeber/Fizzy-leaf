import {Await} from 'react-router';
import {Suspense} from 'react';
import {Aside} from '~/components/Aside';
import {CartFab} from '~/components/CartFab';
import {CartMain} from '~/components/CartMain';
import {SiteFooter} from '~/components/SiteFooter';
import {SiteHeader} from '~/components/SiteHeader';

/**
 * @param {PageLayoutProps}
 */
export function PageLayout({cart, children = null}) {
  return (
    <Aside.Provider>
      <SiteHeader />
      <CartAside cart={cart} />
      <main className="page-main">{children}</main>
      <SiteFooter />
      <CartFab cart={cart} />
    </Aside.Provider>
  );
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
