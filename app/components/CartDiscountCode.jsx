import {CartForm} from '@shopify/hydrogen';
import {appliedDiscountCodes, rejectedDiscountCodes} from '~/lib/cartDiscounts';

export function CartDiscountCode({cart}) {
  const applied = appliedDiscountCodes(cart);
  const rejected = rejectedDiscountCodes(cart);

  return (
    <div className="cart-code-block">
      <CartForm
        route="/cart"
        action={CartForm.ACTIONS.DiscountCodesUpdate}
        inputs={{discountCodes: applied}}
      >
        <div className="cart-code-row">
          <label htmlFor="cart-discount-code" className="sr-only">
            Discount code
          </label>
          <input
            id="cart-discount-code"
            name="discountCode"
            type="text"
            autoComplete="off"
            placeholder="Discount code"
          />
          <button type="submit" className="btn btn-primary cart-code-apply">
            Apply
          </button>
        </div>
      </CartForm>
      {rejected.length > 0 ? (
        <p className="cart-code-error">
          {`Couldn't apply ${rejected.join(', ')}`}
        </p>
      ) : null}
    </div>
  );
}