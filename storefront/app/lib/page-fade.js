export const FADE_OUT_MS = 220;

export function internalFadeUrl(anchor, event) {
  if (!anchor || anchor.target === '_blank' || anchor.hasAttribute('download')) {
    return false;
  }
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) {
    return false;
  }
  const href = anchor.getAttribute('href');
  if (!href || href.startsWith('#') || href.startsWith('mailto:')) {
    return false;
  }
  let url;
  try {
    url = new URL(href, window.location.origin);
  } catch {
    return false;
  }
  if (url.origin !== window.location.origin) return false;
  if (
    url.pathname === window.location.pathname &&
    url.search === window.location.search
  ) {
    return false;
  }
  return url;
}
