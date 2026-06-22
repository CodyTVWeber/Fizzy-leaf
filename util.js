/* Small shared helpers for Fizzy Leaf pages. */
window.FizzyLeaf = window.FizzyLeaf || {};

/* Cross-fade an <img> or <iframe> to a new src: fade out, swap, fade back in.
   The element needs a CSS `transition: opacity` for the fade to be visible. */
window.FizzyLeaf.fadeSwap = function (el, newSrc, options) {
  if (!el || !newSrc) return;
  var opts = options || {};
  var swapDelay = opts.swapDelay || 200;   // wait for fade-out before swapping
  var safetyDelay = opts.safetyDelay || 1000; // restore opacity even if `load` never fires

  el.style.opacity = '0';
  el.onload = function () { el.style.opacity = '1'; };
  window.setTimeout(function () { el.src = newSrc; }, swapDelay);
  window.setTimeout(function () { el.style.opacity = '1'; }, safetyDelay);
};
