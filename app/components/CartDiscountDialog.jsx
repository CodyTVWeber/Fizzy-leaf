import {Money} from '@shopify/hydrogen';
import {useId, useRef} from 'react';
import {CartDiscountCode} from '~/components/CartDiscountCode';
import {appliedDiscountCodes, cartDiscountLines} from '~/lib/cartDiscounts';

export function CartDiscountDialog({cart}) {
  const dialogRef = useRef(null);
  const titleId = useId();
  const appliedCount = appliedDiscountCodes(cart).length;
  const discounts = cartDiscountLines(cart);
  const label = appliedCount > 0 ? `Discounts (${appliedCount})` : 'Discounts';

  return (
    <div className="cart-discount-dialog-wrap">
      <button
        type="button"
        className="cart-discounts-open"
        onClick={() => openDiscountDialog(dialogRef.current)}
      >
        {label}
      </button>
      <dialog
        ref={dialogRef}
        className="cart-discount-dialog"
        aria-labelledby={titleId}
        onKeyDown={stopEscapeFromClosingAside}
      >
        <div className="cart-discount-dialog-head">
          <h3 id={titleId}>Discounts</h3>
          <button
            type="button"
            className="cart-discount-dialog-close"
            aria-label="Close"
            onClick={() => dialogRef.current?.close()}
          >
            &times;
          </button>
        </div>
        <DiscountRows discounts={discounts} />
        <CartDiscountCode cart={cart} />
      </dialog>
    </div>
  );
}

function DiscountRows({discounts}) {
  if (discounts.length === 0) {
    return <p className="cart-discount-empty">No discounts applied</p>;
  }

  return discounts.map((row) => (
    <p
      key={`${row.label}-${row.amount.amount}-${row.amount.currencyCode}`}
      className="cart-discount"
    >
      <span>{row.label}</span>
      <span>
        −<Money data={row.amount} />
      </span>
    </p>
  ));
}

function openDiscountDialog(dialog) {
  dialog?.showModal();
}

function stopEscapeFromClosingAside(event) {
  if (event.key !== 'Escape') return;
  event.stopPropagation();
}
