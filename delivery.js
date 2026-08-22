/* Local Delivery: Census geocode + 30mi radius check, then Formspark signup. */
(function () {
  'use strict';

  var ORIGIN = { lat: 35.7869, lng: -86.6750 };
  var RADIUS_MI = 30;

  var checkForm = document.getElementById('deliveryCheckForm');
  var addressInput = document.getElementById('deliveryAddress');
  var checkBtn = document.getElementById('deliveryCheckBtn');
  var checkStatus = document.getElementById('deliveryCheckStatus');
  var signupCard = document.getElementById('deliverySignup');
  var signupForm = document.getElementById('deliverySignupForm');
  var signupBtn = document.getElementById('deliverySignupBtn');
  var signupStatus = document.getElementById('deliverySignupStatus');
  var signupAddress = document.getElementById('deliverySignupAddress');
  var milesInput = document.getElementById('deliveryMiles');
  var latInput = document.getElementById('deliveryLat');
  var lngInput = document.getElementById('deliveryLng');

  if (!checkForm || !signupForm) return;

  function setStatus(el, type, message) {
    el.className = type ? 'form-status ' + type : 'form-status';
    el.textContent = message || '';
  }

  function hideSignup() {
    signupCard.hidden = true;
  }

  function showSignup(miles, lat, lng, address) {
    milesInput.value = miles.toFixed(1);
    latInput.value = String(lat);
    lngInput.value = String(lng);
    signupAddress.value = address;
    signupCard.hidden = false;
    setStatus(checkStatus, 'success',
      'You\'re about ' + miles.toFixed(1) + ' miles from College Grove — within our 30-mile delivery area.');
  }

  function toRad(d) { return d * Math.PI / 180; }

  function haversineMiles(a, b) {
    var R = 3958.8;
    var dLat = toRad(b.lat - a.lat);
    var dLng = toRad(b.lng - a.lng);
    var lat1 = toRad(a.lat);
    var lat2 = toRad(b.lat);
    var h = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
    return 2 * R * Math.asin(Math.sqrt(h));
  }

  function censusUrl(address) {
    return 'https://geocoding.geo.census.gov/geocoder/locations/onelineaddress'
      + '?address=' + encodeURIComponent(address)
      + '&benchmark=4&format=json';
  }

  function parseMatch(data) {
    var matches = data && data.result && data.result.addressMatches;
    if (!matches || !matches.length) return null;
    var m = matches[0];
    if (!m.coordinates) return null;
    return {
      lat: Number(m.coordinates.y),
      lng: Number(m.coordinates.x),
      matched: m.matchedAddress || ''
    };
  }

  function handleCheck(e) {
    e.preventDefault();
    hideSignup();
    setStatus(checkStatus, '', '');
    var address = (addressInput.value || '').trim();
    if (!address) {
      setStatus(checkStatus, 'error', 'Enter a street address to check.');
      return;
    }
    checkBtn.disabled = true;
    checkBtn.textContent = 'Checking…';
    fetch(censusUrl(address))
      .then(function (r) {
        if (!r.ok) throw new Error('geocode failed');
        return r.json();
      })
      .then(function (data) {
        var match = parseMatch(data);
        if (!match) {
          setStatus(checkStatus, 'error',
            'We couldn\'t place that address. Try a fuller street address, or email us via Contact.');
          return;
        }
        var miles = haversineMiles(ORIGIN, { lat: match.lat, lng: match.lng });
        if (miles > RADIUS_MI) {
          setStatus(checkStatus, 'error',
            'That address is about ' + miles.toFixed(1) + ' miles away — outside our 30-mile delivery area for now.');
          return;
        }
        showSignup(miles, match.lat, match.lng, match.matched || address);
      })
      .catch(function () {
        setStatus(checkStatus, 'error',
          'Address check failed. Please try again or email us via Contact.');
      })
      .then(function () {
        checkBtn.disabled = false;
        checkBtn.textContent = 'Check my address';
      });
  }

  function formsparkNotConnected() {
    return String(signupForm.action || '').indexOf('REPLACE_') !== -1;
  }

  function handleSignup(e) {
    e.preventDefault();
    if (formsparkNotConnected()) {
      setStatus(signupStatus, 'error',
        'Signups aren\'t connected yet. Email us via Contact.');
      return;
    }
    signupBtn.disabled = true;
    signupBtn.textContent = 'Sending…';
    setStatus(signupStatus, '', '');
    fetch(signupForm.action, {
      method: 'POST',
      body: new FormData(signupForm),
      headers: { Accept: 'application/json' }
    })
      .then(function (r) {
        if (!r.ok) throw new Error('submit failed');
        signupForm.reset();
        hideSignup();
        signupBtn.classList.add('is-success');
        signupBtn.textContent = '✓ Sent!';
        setStatus(signupStatus, 'success', '✓ You\'re on the list — we\'ll be in touch.');
      })
      .catch(function () {
        signupBtn.disabled = false;
        signupBtn.textContent = 'Sign up for monthly delivery';
        setStatus(signupStatus, 'error',
          'Something went wrong. Please try again or email us via Contact.');
      });
  }

  checkForm.addEventListener('submit', handleCheck);
  signupForm.addEventListener('submit', handleSignup);
  hideSignup();
})();
