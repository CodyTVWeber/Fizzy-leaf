import {Money} from '@shopify/hydrogen';
import {useId} from 'react';
import {CartDiscountDialog} from '~/components/CartDiscountDialog';
import {cartDiscountLines, summedDiscountMoney} from '~/lib/cartDiscounts';

export function CartSummary({cart, layout}) {
  const className =
    layout === 'page' ? 'cart-summary-page' : 'cart-summary-aside';
  const summaryId = useId();

  return (
    <div aria-labelledby={summaryId} className={`${className} cart-foot`}>
      <h4 id={summaryId} className="sr-only">
        Totals
      </h4>
      <CartDiscountDialog cart={cart} />
      <CartCostLines cart={cart} />
      <CartCheckoutActions checkoutUrl={cart?.checkoutUrl} />
    </div>
  );
}

function CartCostLines({cart}) {
  const saved = summedDiscountMoney(cartDiscountLines(cart));
  const subtotal = cart?.cost?.subtotalAmount;
  const total = cart?.cost?.totalAmount;

  return (
    <>
      <div
        className={saved ? 'cart-subtotal cart-amount-was' : 'cart-subtotal'}
      >
        <span>Subtotal</span>
        <span>
          {subtotal?.amount ? <Money data={subtotal} /> : '$0.00'}
        </span>
      </div>
      {saved ? (
        <div className="cart-discount-saved">
          <span>Discount</span>
          <span className="cart-money-negative">
            −<Money data={saved} as="span" />
          </span>
        </div>
      ) : null}
      {saved && total?.amount ? (
        <div className="cart-total">
          <span>Total</span>
          <span>
            <Money data={total} />
          </span>
        </div>
      ) : null}
    </>
  );
}

function CartCheckoutActions({checkoutUrl}) {
  if (!checkoutUrl) return null;

  return (
    <a
      className="btn btn-primary cart-checkout"
      href={checkoutUrl}
      target="_self"
    >
      Checkout →
    </a>
  );
}
