import {Suspense, useEffect, useRef, useState} from 'react';
import {Await, useAsyncValue} from 'react-router';
import {useAnalytics, useOptimisticCart} from '@shopify/hydrogen';
import {useAside} from '~/components/Aside';

/**
 * @param {{cart: Promise<CartApiQueryFragment | null>}}
 */
export function CartFab({cart}) {
  return (
    <Suspense fallback={<FabButton count={0} />}>
      <Await resolve={cart}>
        <OptimisticFab />
      </Await>
    </Suspense>
  );
}

function OptimisticFab() {
  const originalCart = useAsyncValue();
  const cart = useOptimisticCart(originalCart);
  return <FabButton count={cart?.totalQuantity ?? 0} />;
}

/**
 * @param {{count: number}}
 */
function FabButton({count}) {
  const {open} = useAside();
  const {publish, shop, cart, prevCart} = useAnalytics();
  const [bump, setBump] = useState(false);
  const prevCount = useRef(null);

  useEffect(() => {
    if (prevCount.current === null) {
      prevCount.current = count;
      return undefined;
    }
    if (count <= prevCount.current) {
      prevCount.current = count;
      return undefined;
    }
    prevCount.current = count;
    setBump(true);
    const timer = window.setTimeout(() => setBump(false), 400);
    return () => window.clearTimeout(timer);
  }, [count]);

  return (
    <button
      type="button"
      className={`cart-fab${bump ? ' bump' : ''}`}
      aria-label="Open cart"
      onClick={() => {
        open('cart');
        publish('cart_viewed', {
          cart,
          prevCart,
          shop,
          url: window.location.href || '',
        });
      }}
    >
      <svg
        viewBox="0 0 24 24"
        width="26"
        height="26"
        fill="none"
        stroke="#fff"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <circle cx="9" cy="21" r="1" fill="#fff" />
        <circle cx="20" cy="21" r="1" fill="#fff" />
        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
      </svg>
      <span className="cart-count" data-count={count}>
        {count || ''}
      </span>
    </button>
  );
}

/** @typedef {import('storefrontapi.generated').CartApiQueryFragment} CartApiQueryFragment */
