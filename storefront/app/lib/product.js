export const VARIANT_12 =
  'gid://shopify/ProductVariant/42907503034462';
export const VARIANT_24 =
  'gid://shopify/ProductVariant/42907503067230';
export const SELLING_PLAN_ID =
  'gid://shopify/SellingPlan/6531121246';

export const PRICES = {
  12: {onetime: 43, subscribe: 34.4},
  24: {onetime: 79, subscribe: 63.2},
};

export const GALLERY_IMAGES = [
  '/img/fizzy-detail1.webp',
  '/img/fizzy-detail2.webp',
  '/img/fizzy-detail3.webp',
  '/img/fizzy-detail4.webp',
  '/img/fizzy-detail6.webp',
  '/img/Fizzyleaf2.webp',
  '/img/Fizzyleaf3.webp',
  '/img/Fizzyleaf4.webp',
];

export function variantGid(pack) {
  return pack === 24 ? VARIANT_24 : VARIANT_12;
}

export function formatMoney(amount) {
  return `$${Number(amount).toFixed(2)}`;
}

export function priceDisplay(pack, purchaseType) {
  const prices = PRICES[pack];
  if (purchaseType === 'subscribe') {
    return {
      struck: formatMoney(prices.onetime),
      live: `${formatMoney(prices.subscribe)} /mo`,
    };
  }
  return {struck: null, live: formatMoney(prices.onetime)};
}

export function cartLineInput({pack, purchaseType, quantity}) {
  const line = {
    merchandiseId: variantGid(pack),
    quantity,
  };
  if (purchaseType === 'subscribe') {
    line.sellingPlanId = SELLING_PLAN_ID;
  }
  return line;
}
