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

export const PRODUCT_HANDLE = 'roselle-hibiscus';
export const PRODUCT_TITLE = 'Roselle Hibiscus';

export function packLabel(pack) {
  return pack === 24 ? '24-Pack' : '12-Pack';
}

export function cartLineInput({pack, purchaseType, quantity}) {
  const merchandiseId = variantGid(pack);
  const title = packLabel(pack);
  const line = {
    merchandiseId,
    quantity,
    selectedVariant: {
      id: merchandiseId,
      title,
      product: {handle: PRODUCT_HANDLE, title: PRODUCT_TITLE},
      selectedOptions: [{name: 'Pack Size', value: title}],
    },
  };
  if (purchaseType === 'subscribe') {
    line.sellingPlanId = SELLING_PLAN_ID;
  }
  return line;
}

export function packFromVariantTitle(title) {
  return String(title || '').includes('24') ? 24 : 12;
}

export function purchaseTypeFromUnitPrice(unitAmount, pack) {
  const prices = PRICES[pack];
  const unit = Number(unitAmount);
  return Math.abs(unit - prices.subscribe) < Math.abs(unit - prices.onetime)
    ? 'subscribe'
    : 'onetime';
}

export function cartLinePurchaseLabel(line) {
  const pack = packFromVariantTitle(line?.merchandise?.title);
  const unit = line?.cost?.amountPerQuantity?.amount;
  const type = purchaseTypeFromUnitPrice(unit, pack);
  return type === 'subscribe'
    ? 'Subscribe & Save · monthly'
    : 'One-time purchase';
}
