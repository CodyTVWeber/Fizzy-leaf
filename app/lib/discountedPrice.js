import {cartDiscountLines, summedDiscountMoney} from '~/lib/cartDiscounts';
import {formatMoney, priceDisplay, variantGid} from '~/lib/product';

export function lineListTotal(line) {
  if (line?.cost?.subtotalAmount?.amount) return line.cost.subtotalAmount;
  const paid = line?.cost?.totalAmount;
  const saved = lineDiscountCents(line);
  if (saved > 0 && paid?.amount) {
    return {
      amount: ((moneyCents(paid) + saved) / 100).toFixed(2),
      currencyCode: paid.currencyCode,
    };
  }
  return paid;
}

export function linePaidTotal(line, cart) {
  const list = lineListTotal(line);
  if (!list?.amount) return line?.cost?.totalAmount;
  const lineSaved = lineDiscountCents(line);
  if (lineSaved > 0) {
    return {
      amount: ((moneyCents(list) - lineSaved) / 100).toFixed(2),
      currencyCode: list.currencyCode,
    };
  }
  const pct = cartPercentageOff(cart);
  if (pct == null) return line?.cost?.totalAmount ?? list;
  return {
    amount: (Math.round(moneyCents(list) * (1 - pct / 100)) / 100).toFixed(2),
    currencyCode: list.currencyCode,
  };
}

export function lineShowsDiscount(line, cart) {
  return moneyCents(linePaidTotal(line, cart)) < moneyCents(lineListTotal(line));
}

export function shopPriceDisplay({pack, purchaseType, prices, cart}) {
  const base = priceDisplay(pack, purchaseType, prices);
  const catalog = prices?.[pack]?.[purchaseType];
  if (catalog == null) return base;

  const liveAmount = discountedCatalogAmount({
    pack,
    purchaseType,
    catalog,
    cart,
  });
  if (
    liveAmount == null ||
    moneyCents({amount: liveAmount}) >= moneyCents({amount: catalog})
  ) {
    return base;
  }

  return {
    struck: formatMoney(catalog),
    live:
      purchaseType === 'subscribe'
        ? `${formatMoney(liveAmount)} /mo`
        : formatMoney(liveAmount),
  };
}

function discountedCatalogAmount({pack, purchaseType, catalog, cart}) {
  const line = matchingCartLine(cart, pack, purchaseType);
  if (line?.quantity && lineShowsDiscount(line, cart)) {
    return moneyCents(linePaidTotal(line, cart)) / 100 / line.quantity;
  }
  const pct = cartPercentageOff(cart);
  if (pct == null) return null;
  return catalog * (1 - pct / 100);
}

function matchingCartLine(cart, pack, purchaseType) {
  const wantSubscribe = purchaseType === 'subscribe';
  const wantId = variantGid(pack);
  return (cart?.lines?.nodes ?? []).find((row) => {
    if (!merchandiseMatches(row?.merchandise?.id, wantId)) return false;
    return lineIsSubscribe(row) === wantSubscribe;
  });
}

function merchandiseMatches(id, wantId) {
  if (!id) return false;
  return id === wantId || String(id).endsWith(String(wantId).split('/').pop());
}

function cartPercentageOff(cart) {
  for (const row of cart?.discountAllocations ?? []) {
    const pct = row?.discountApplication?.value?.percentage;
    if (typeof pct === 'number' && pct > 0) return pct;
  }
  const saved = summedDiscountMoney(cartDiscountLines(cart));
  const sub = moneyCents(cart?.cost?.subtotalAmount);
  if (!saved || sub <= 0) return null;
  return (moneyCents(saved) / sub) * 100;
}

function lineDiscountCents(line) {
  return (line?.discountAllocations ?? []).reduce(
    (sum, row) => sum + moneyCents(row?.discountedAmount),
    0,
  );
}

function lineIsSubscribe(line) {
  return Boolean(line?.sellingPlanAllocation?.sellingPlan?.id);
}

function moneyCents(money) {
  return Math.round(Number(money?.amount) * 100);
}
