import {logError, logInfo, logWarn, maskSecret} from '~/lib/log';

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

export function cartLinePurchaseLabel(line) {
  if (line?.sellingPlanAllocation?.sellingPlan?.id) {
    return 'Subscribe & Save · monthly';
  }
  return 'One-time purchase';
}

export async function loadDisplayPrices(storefront, env) {
  const prices = clonePrices();
  const source = {
    12: {onetime: 'fallback', subscribe: 'fallback'},
    24: {onetime: 'fallback', subscribe: 'fallback'},
  };
  logInfo('prices', 'load start', {
    domain: env?.PUBLIC_STORE_DOMAIN || '(missing)',
    apiVersion: env?.PUBLIC_STOREFRONT_API_VERSION || '2025-01',
    publicToken: maskSecret(env?.PUBLIC_STOREFRONT_API_TOKEN),
    privateToken: maskSecret(env?.PRIVATE_STOREFRONT_API_TOKEN),
    fallbacks: PRICES,
  });
  await applyOnetimeFromStorefront(storefront, prices, source);
  await applySubscribeFromApi(env, prices, source);
  logInfo('prices', 'load done', {prices, source});
  return {prices, source};
}

async function applyOnetimeFromStorefront(storefront, prices, source) {
  if (!storefront?.query) {
    logWarn('prices', 'onetime skipped — no storefront.query');
    return;
  }
  try {
    const result = await storefront.query(ONETIME_PRICES_QUERY, {
      variables: {id: PRODUCT_GID},
    });
    const product = result?.product;
    logInfo('prices', 'onetime GraphQL ok', summarizeProduct(product, result));
    if (!product) {
      logWarn('prices', 'onetime fallback — product missing', {
        resultKeys: result ? Object.keys(result) : [],
      });
      return;
    }
    const applied = applyOnetimePrices(product, prices);
    markLive(source, 'onetime', applied);
    if (!applied.length) {
      logWarn('prices', 'onetime fallback — no variant ids matched', {
        expected: {12: VARIANT_12, 24: VARIANT_24},
      });
    }
  } catch (error) {
    logError('prices', 'onetime GraphQL failed — using fallbacks', errorMessage(error));
  }
}

async function applySubscribeFromApi(env, prices, source) {
  const product = await fetchSubscribeProduct(env);
  if (!product) return;
  const applied = applySubscribePrices(product, prices);
  markLive(source, 'subscribe', applied);
  if (!applied.length) {
    logWarn('prices', 'subscribe fallback — allocations missing or ids unmatched');
  }
}

async function fetchSubscribeProduct(env) {
  const domain = env?.PUBLIC_STORE_DOMAIN;
  const token =
    env?.PRIVATE_STOREFRONT_API_TOKEN || env?.PUBLIC_STOREFRONT_API_TOKEN;
  const version = env?.PUBLIC_STOREFRONT_API_VERSION || '2025-01';
  if (!domain || !token) {
    logWarn('prices', 'subscribe skipped — missing domain or token');
    return null;
  }

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
    if (!response.ok) {
      logWarn('prices', 'subscribe HTTP not ok — using fallback', {
        status: response.status,
      });
      return null;
    }
    json = await response.json();
  } catch (error) {
    logError('prices', 'subscribe fetch failed — using fallback', errorMessage(error));
    return null;
  }
  if (json.errors) {
    logWarn('prices', 'subscribe GraphQL errors — using fallback', json.errors);
  }
  const product = json.data?.product;
  logInfo('prices', 'subscribe GraphQL ok', summarizeProduct(product, json));
  if (!product) {
    logWarn('prices', 'subscribe fallback — product missing');
    return null;
  }
  return product;
}

function clonePrices() {
  return {
    12: {...PRICES[12]},
    24: {...PRICES[24]},
  };
}

function packForVariantGid(gid) {
  const id = String(gid || '');
  if (id === VARIANT_12 || id.endsWith('42907503034462')) return 12;
  if (id === VARIANT_24 || id.endsWith('42907503067230')) return 24;
  return null;
}

function applyOnetimePrices(product, prices) {
  const applied = [];
  const edges = product?.variants?.edges;
  if (!edges) {
    logWarn('prices', 'onetime product has no variants.edges', {
      keys: product ? Object.keys(product) : [],
    });
    return applied;
  }
  for (const edge of edges) {
    const gid = edge?.node?.id;
    const pack = packForVariantGid(gid);
    const amount = edge?.node?.price?.amount;
    logInfo('prices', 'onetime variant', {gid, pack, amount});
    if (!pack || !prices[pack] || amount == null) continue;
    prices[pack].onetime = Number(amount);
    applied.push(pack);
  }
  return applied;
}

function applySubscribePrices(product, prices) {
  const applied = [];
  const edges = product?.variants?.edges;
  if (!edges) {
    logWarn('prices', 'subscribe product has no variants.edges');
    return applied;
  }
  for (const edge of edges) {
    const gid = edge?.node?.id;
    const pack = packForVariantGid(gid);
    const allocs = edge?.node?.sellingPlanAllocations?.edges;
    const amount = allocs?.[0]?.node?.priceAdjustments?.[0]?.price?.amount;
    logInfo('prices', 'subscribe variant', {
      gid,
      pack,
      allocationCount: allocs?.length ?? 0,
      amount,
    });
    if (!pack || !prices[pack] || amount == null) continue;
    prices[pack].subscribe = Number(amount);
    applied.push(pack);
  }
  return applied;
}

function markLive(source, field, packs) {
  for (const pack of packs) {
    source[pack][field] = 'live';
  }
}

function summarizeProduct(product, raw) {
  const edges = product?.variants?.edges;
  return {
    hasProduct: Boolean(product),
    variantCount: edges?.length ?? 0,
    variantIds: (edges || []).map((edge) => edge?.node?.id),
    graphqlErrorCount: Array.isArray(raw?.errors) ? raw.errors.length : 0,
  };
}

function errorMessage(error) {
  if (error instanceof Error) return {name: error.name, message: error.message};
  return {message: String(error)};
}
