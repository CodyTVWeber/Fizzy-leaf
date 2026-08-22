(function () {
  'use strict';

  var ORIGIN = { lat: 35.7869, lng: -86.6750 };
  var RADIUS_MI = 30;
  var METERS_PER_MI = 1609.34;

  var checkForm = document.getElementById('deliveryCheckForm');
  var addressInput = document.getElementById('deliveryAddress');
  var checkBtn = document.getElementById('deliveryCheckBtn');
  var checkStatus = document.getElementById('deliveryCheckStatus');
  var inquiryCard = document.getElementById('deliveryInquiry');
  var inquiryForm = document.getElementById('deliveryInquiryForm');
  var inquiryBtn = document.getElementById('deliveryInquiryBtn');
  var inquiryStatus = document.getElementById('deliveryInquiryStatus');
  var inquiryAddress = document.getElementById('deliveryInquiryAddress');
  var milesInput = document.getElementById('deliveryMiles');
  var latInput = document.getElementById('deliveryLat');
  var lngInput = document.getElementById('deliveryLng');
  var mapEl = document.getElementById('deliveryMap');

  if (!checkForm || !inquiryForm) return;

  var map, circle, originMarker, visitorMarker;

  function setStatus(el, type, message) {
    el.className = type ? 'form-status ' + type : 'form-status';
    el.textContent = message || '';
  }

  function hideInquiry() { inquiryCard.hidden = true; }

  function resetInquiryBtn() {
    inquiryBtn.disabled = false;
    inquiryBtn.classList.remove('is-success');
    inquiryBtn.textContent = 'Message me for an inquiry';
    setStatus(inquiryStatus, '', '');
  }

  function showInquiry(miles, lat, lng, address) {
    milesInput.value = miles.toFixed(1);
    latInput.value = String(lat);
    lngInput.value = String(lng);
    inquiryAddress.value = address;
    resetInquiryBtn();
    inquiryCard.hidden = false;
    setStatus(checkStatus, 'success',
      'You\'re about ' + miles.toFixed(1) + ' miles from College Grove — within the 30-mile delivery area.');
  }

  function toRad(d) { return d * Math.PI / 180; }

  function haversineMiles(a, b) {
    var R = 3958.8;
    var dLat = toRad(b.lat - a.lat);
    var dLng = toRad(b.lng - a.lng);
    var h = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    return 2 * R * Math.asin(Math.sqrt(h));
  }

  function initMap() {
    if (!mapEl || typeof L === 'undefined') return;
    map = L.map(mapEl, { scrollWheelZoom: false }).setView([ORIGIN.lat, ORIGIN.lng], 9);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap'
    }).addTo(map);
    circle = L.circle([ORIGIN.lat, ORIGIN.lng], {
      radius: RADIUS_MI * METERS_PER_MI,
      color: '#9c6f1f',
      weight: 2,
      fillColor: '#c9a86b',
      fillOpacity: 0.18
    }).addTo(map);
    originMarker = L.marker([ORIGIN.lat, ORIGIN.lng]).addTo(map)
      .bindPopup('College Grove — delivery start');
    map.fitBounds(circle.getBounds(), { padding: [16, 16] });
    setTimeout(function () { if (map) map.invalidateSize(); }, 0);
    window.addEventListener('resize', function () {
      if (map) map.invalidateSize();
    });
  }

  function plotVisitor(lat, lng, inRange) {
    if (!map) return;
    if (visitorMarker) map.removeLayer(visitorMarker);
    visitorMarker = L.marker([lat, lng]).addTo(map)
      .bindPopup(inRange ? 'You\'re in range' : 'Outside the delivery area');
    if (inRange) visitorMarker.openPopup();
    var group = L.featureGroup([circle, visitorMarker]);
    map.fitBounds(group.getBounds(), {
      padding: inRange ? [28, 28] : [36, 36],
      maxZoom: inRange ? 11 : 8
    });
    map.invalidateSize();
  }

  function handleCheck(e) {
    e.preventDefault();
    hideInquiry();
    setStatus(checkStatus, '', '');
    var address = (addressInput.value || '').trim();
    if (!address) {
      setStatus(checkStatus, 'error', 'Enter a street address to check.');
      return;
    }
    checkBtn.disabled = true;
    checkBtn.textContent = 'Checking…';
    var url = 'https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=us&q='
      + encodeURIComponent(address);
    fetch(url, { headers: { 'Accept-Language': 'en' } })
      .then(function (r) {
        if (!r.ok) throw new Error('geocode failed');
        return r.json();
      })
      .then(function (data) {
        if (!data || !data.length || data[0].lat == null) {
          setStatus(checkStatus, 'error',
            'We couldn\'t place that address. Try a fuller street address, or email us via Contact.');
          return;
        }
        var lat = Number(data[0].lat);
        var lng = Number(data[0].lon);
        var miles = haversineMiles(ORIGIN, { lat: lat, lng: lng });
        var inRange = miles <= RADIUS_MI;
        plotVisitor(lat, lng, inRange);
        if (!inRange) {
          setStatus(checkStatus, 'error',
            'That address is about ' + miles.toFixed(1) + ' miles away — outside the 30-mile delivery area for now.');
          return;
        }
        showInquiry(miles, lat, lng, data[0].display_name || address);
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

  function handleInquiry(e) {
    e.preventDefault();
    inquiryBtn.disabled = true;
    inquiryBtn.textContent = 'Sending…';
    setStatus(inquiryStatus, '', '');
    fetch(inquiryForm.action, {
      method: 'POST',
      body: new FormData(inquiryForm),
      headers: { Accept: 'application/json' }
    })
      .then(function (r) {
        if (!r.ok) throw new Error('submit failed');
        inquiryForm.reset();
        inquiryBtn.classList.add('is-success');
        inquiryBtn.textContent = '✓ Sent!';
        setStatus(inquiryStatus, 'success', '✓ Got it — Christian will message you back.');
      })
      .catch(function () {
        inquiryBtn.disabled = false;
        inquiryBtn.textContent = 'Message me for an inquiry';
        setStatus(inquiryStatus, 'error',
          'Something went wrong. Please try again or email us via Contact.');
      });
  }

  initMap();
  hideInquiry();
  checkForm.addEventListener('submit', handleCheck);
  inquiryForm.addEventListener('submit', handleInquiry);
})();
