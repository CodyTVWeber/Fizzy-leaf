export const VARIANT_12 =
  'gid://shopify/ProductVariant/42907503034462';
export const VARIANT_24 =
  'gid://shopify/ProductVariant/42907503067230';
export const SELLING_PLAN_ID =
  'gid://shopify/SellingPlan/6531121246';
export const PRODUCT_GID = 'gid://shopify/Product/7681726742622';

export const PRICES = {
  12: {onetime: 43, subscribe: 34.4},
  24: {onetime: 79, subscribe: 63.2},
};

const ONETIME_PRICES_QUERY = `#graphql
  query ProductOnetimePrices($id: ID!) {
    product(id: $id) {
      variants(first: 10) {
        edges {
          node {
            id
            price {
              amount
            }
          }
        }
      }
    }
  }
`;

const SUBSCRIBE_PRICES_QUERY = `#graphql
  query ProductSubscribePrices($id: ID!) {
    product(id: $id) {
      variants(first: 10) {
        edges {
          node {
            id
            sellingPlanAllocations(first: 5) {
              edges {
                node {
                  priceAdjustments {
                    price {
                      amount
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`;

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

export function priceDisplay(pack, purchaseType, prices = PRICES) {
  const packPrices = prices[pack] ?? PRICES[pack];
  if (purchaseType === 'subscribe') {
    return {
      struck: formatMoney(packPrices.onetime),
      live: `${formatMoney(packPrices.subscribe)} /mo`,
    };
  }
  return {struck: null, live: formatMoney(packPrices.onetime)};
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

export async function loadDisplayPrices(storefront, env) {
  const prices = clonePrices();
  await applyOnetimeFromStorefront(storefront, prices);
  await applySubscribeFromApi(env, prices);
  return prices;
}

async function applyOnetimeFromStorefront(storefront, prices) {
  try {
    const {product} = await storefront.query(ONETIME_PRICES_QUERY, {
      variables: {id: PRODUCT_GID},
    });
    if (product) applyOnetimePrices(product, prices);
  } catch {
    return;
  }
}

async function applySubscribeFromApi(env, prices) {
  const product = await fetchSubscribeProduct(env);
  if (product) applySubscribePrices(product, prices);
}

async function fetchSubscribeProduct(env) {
  const domain = env?.PUBLIC_STORE_DOMAIN;
  const token =
    env?.PRIVATE_STOREFRONT_API_TOKEN || env?.PUBLIC_STOREFRONT_API_TOKEN;
  const version = env?.PUBLIC_STOREFRONT_API_VERSION || '2025-01';
  if (!domain || !token) return null;

  let json;
  try {
    const response = await fetch(
      `https://${domain}/api/${version}/graphql.json`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Storefront-Access-Token': token,
        },
        body: JSON.stringify({
          query: SUBSCRIBE_PRICES_QUERY,
          variables: {id: PRODUCT_GID},
        }),
      },
    );
    if (!response.ok) return null;
    json = await response.json();
  } catch {
    return null;
  }
  if (json.errors || !json.data?.product) return null;
  return json.data.product;
}

function clonePrices() {
  return {
    12: {...PRICES[12]},
    24: {...PRICES[24]},
  };
}

function packForVariantGid(gid) {
  if (gid === VARIANT_12) return 12;
  if (gid === VARIANT_24) return 24;
  return null;
}

function applyOnetimePrices(product, prices) {
  const edges = product?.variants?.edges;
  if (!edges) return;
  for (const edge of edges) {
    const pack = packForVariantGid(edge.node.id);
    if (!pack || !prices[pack]) continue;
    prices[pack].onetime = Number(edge.node.price.amount);
  }
}

function applySubscribePrices(product, prices) {
  const edges = product?.variants?.edges;
  if (!edges) return;
  for (const edge of edges) {
    const pack = packForVariantGid(edge.node.id);
    if (!pack || !prices[pack]) continue;
    const allocs = edge.node.sellingPlanAllocations?.edges;
    if (!allocs?.length) continue;
    const adjustments = allocs[0].node.priceAdjustments;
    if (!adjustments?.length || !adjustments[0].price) continue;
    prices[pack].subscribe = Number(adjustments[0].price.amount);
  }
}
