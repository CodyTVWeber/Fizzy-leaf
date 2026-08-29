import {Money} from '@shopify/hydrogen';
import {useEffect, useId, useRef} from 'react';
import {CartDiscountCode} from '~/components/CartDiscountCode';
import {
  appliedDiscountCodes,
  cartDiscountLines,
  summedDiscountMoney,
} from '~/lib/cartDiscounts';

export function CartDiscountDialog({cart}) {
  const dialogRef = useRef(null);
  const titleId = useId();
  const appliedCount = appliedDiscountCodes(cart).length;
  const discounts = cartDiscountLines(cart);
  const label = appliedCount > 0 ? `Discounts (${appliedCount})` : 'Discounts';

  useEffect(() => stopEscapeBubblingFromDialog(dialogRef.current), []);

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
        <DiscountCompare cart={cart} discounts={discounts} />
        <DiscountRows discounts={discounts} />
        <CartDiscountCode cart={cart} />
      </dialog>
    </div>
  );
}

function DiscountCompare({cart, discounts}) {
  const saved = summedDiscountMoney(discounts);
  const subtotal = cart?.cost?.subtotalAmount;
  const total = cart?.cost?.totalAmount;
  if (!saved || !subtotal?.amount || !total?.amount) return null;

  return (
    <div className="cart-discount-compare">
      <p className="cart-discount-compare-row">
        <span className="cart-amount-was">
          <Money data={subtotal} />
        </span>
        <span aria-hidden="true">→</span>
        <span className="cart-discount-compare-now">
          <Money data={total} />
        </span>
      </p>
      <p className="cart-discount-compare-save">
        Saving <Money data={saved} />
      </p>
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

function stopEscapeBubblingFromDialog(dialog) {
  if (!dialog) return undefined;

  const onKeyDown = (event) => {
    if (event.key !== 'Escape') return;
    event.stopPropagation();
  };

  dialog.addEventListener('keydown', onKeyDown);
  return () => {
    dialog.removeEventListener('keydown', onKeyDown);
  };
}
