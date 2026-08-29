import {Suspense} from 'react';
import {Await, useRouteLoaderData} from 'react-router';
import {useOptimisticCart} from '@shopify/hydrogen';
import {priceDisplay} from '~/lib/product';
import {shopPriceDisplay} from '~/lib/discountedPrice';

export function ShopPrice({pack, purchaseType, prices}) {
  const root = useRouteLoaderData('root');
  const fallback = priceDisplay(pack, purchaseType, prices);
  if (!root?.cart) return <PriceText price={fallback} />;

  return (
    <Suspense fallback={<PriceText price={fallback} />}>
      <Await resolve={root.cart}>
        {(cart) => (
          <CartShopPrice
            cart={cart}
            offer={{pack, purchaseType, prices}}
          />
        )}
      </Await>
    </Suspense>
  );
}

function CartShopPrice({cart, offer}) {
  const optimistic = useOptimisticCart(cart);
  return (
    <PriceText price={shopPriceDisplay({...offer, cart: optimistic})} />
  );
}

function PriceText({price}) {
  return (
    <div className="shop-price">
      <span>
        {price.struck ? (
          <>
            <s>{price.struck}</s> {price.live}
          </>
        ) : (
          price.live
        )}
      </span>
    </div>
  );
}
