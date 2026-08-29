import {Money} from '@shopify/hydrogen';
import {useId} from 'react';
import {CartDiscountCode} from '~/components/CartDiscountCode';
import {cartDiscountLines} from '~/lib/cartDiscounts';

export function CartSummary({cart, layout}) {
  const className =
    layout === 'page' ? 'cart-summary-page' : 'cart-summary-aside';
  const summaryId = useId();
  const discounts = cartDiscountLines(cart);
  const total = cart?.cost?.totalAmount;

  return (
    <div aria-labelledby={summaryId} className={`${className} cart-foot`}>
      <h4 id={summaryId} className="sr-only">
        Totals
      </h4>
      <CartDiscountCode cart={cart} />
      {discounts.map((row) => (
        <p
          key={`${row.label}-${row.amount.amount}-${row.amount.currencyCode}`}
          className="cart-discount"
        >
          <span>{row.label}</span>
          <span>
            −<Money data={row.amount} />
          </span>
        </p>
      ))}
      <div className="cart-subtotal">
        <span>Subtotal</span>
        <span>
          {cart?.cost?.subtotalAmount?.amount ? (
            <Money data={cart.cost.subtotalAmount} />
          ) : (
            '$0.00'
          )}
        </span>
      </div>
      {total?.amount && discounts.length > 0 ? (
        <div className="cart-total">
          <span>Total</span>
          <span>
            <Money data={total} />
          </span>
        </div>
      ) : null}
      <CartCheckoutActions checkoutUrl={cart?.checkoutUrl} />
    </div>
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
