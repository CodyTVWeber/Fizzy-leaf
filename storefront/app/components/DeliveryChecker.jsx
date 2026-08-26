import {useEffect, useRef, useState} from 'react';
import {
  DELIVERY_RADIUS_MI,
  ORIGIN,
  geocodeAddress,
  haversineMiles,
} from '~/lib/deliveryGeo';
import {
  buildDeliveryMap,
  loadLeaflet,
  placeVisitorMarker,
} from '~/lib/deliveryMap';
import {FORMSPARK_URL, postFormspark} from '~/lib/formspark';

const STATUS = {
  idle: 'idle',
  sending: 'sending',
  success: 'success',
  error: 'error',
};

export function DeliveryChecker() {
  const mapRef = useRef(null);
  const mapStateRef = useRef(null);
  const [checkStatus, setCheckStatus] = useState({type: '', message: ''});
  const [checking, setChecking] = useState(false);
  const [inquiryOpen, setInquiryOpen] = useState(false);
  const [inquiryFields, setInquiryFields] = useState({
    address: '',
    miles: '',
    lat: '',
    lng: '',
  });
  const [inquiryStatus, setInquiryStatus] = useState(STATUS.idle);

  useEffect(() => {
    let active = true;
    let resizeHandler;

    async function initMap() {
      const L = await loadLeaflet();
      if (!active || !mapRef.current) return;

      const state = buildDeliveryMap(L, mapRef.current);
      mapStateRef.current = {L, ...state};
      window.setTimeout(() => state.map.invalidateSize(), 0);
      resizeHandler = () => state.map.invalidateSize();
      window.addEventListener('resize', resizeHandler);
    }

    initMap();

    return () => {
      active = false;
      if (resizeHandler) window.removeEventListener('resize', resizeHandler);
      const state = mapStateRef.current;
      if (state?.map) state.map.remove();
      mapStateRef.current = null;
    };
  }, []);

  async function handleAddressCheck(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const address = form.address.value.trim();
    setInquiryOpen(false);
    setCheckStatus({type: '', message: ''});

    if (!address) {
      setCheckStatus({
        type: 'error',
        message: 'Enter a street address to check.',
      });
      return;
    }

    setChecking(true);
    try {
      const hit = await geocodeAddress(address);
      if (!hit) {
        setCheckStatus({
          type: 'error',
          message:
            "We couldn't place that address. Try a fuller street address, or email us via Contact.",
        });
        return;
      }

      const miles = haversineMiles(ORIGIN.lat, ORIGIN.lng, hit.lat, hit.lng);
      const inRange = miles <= DELIVERY_RADIUS_MI;
      const mapState = mapStateRef.current;
      if (mapState) {
        mapStateRef.current = placeVisitorMarker(
          mapState.L,
          mapState,
          hit.lat,
          hit.lng,
          inRange,
        );
      }

      if (!inRange) {
        setCheckStatus({
          type: 'error',
          message: `That address is about ${miles.toFixed(1)} miles away — outside the 30-mile delivery area for now.`,
        });
        return;
      }

      setInquiryFields({
        address: hit.displayName || address,
        miles: miles.toFixed(1),
        lat: String(hit.lat),
        lng: String(hit.lng),
      });
      setInquiryStatus(STATUS.idle);
      setInquiryOpen(true);
      setCheckStatus({
        type: 'success',
        message: `You're about ${miles.toFixed(1)} miles from College Grove — within the 30-mile delivery area.`,
      });
    } catch {
      setCheckStatus({
        type: 'error',
        message: 'Address check failed. Please try again or email us via Contact.',
      });
    } finally {
      setChecking(false);
    }
  }

  async function handleInquirySubmit(event) {
    event.preventDefault();
    const form = event.currentTarget;
    setInquiryStatus(STATUS.sending);
    try {
      await postFormspark(form);
      form.reset();
      setInquiryStatus(STATUS.success);
    } catch {
      setInquiryStatus(STATUS.error);
    }
  }

  const inquirySending = inquiryStatus === STATUS.sending;
  const inquirySuccess = inquiryStatus === STATUS.success;

  return (
    <div className="delivery-checker">
      <div
        ref={mapRef}
        id="deliveryMap"
        role="img"
        aria-label="30-mile delivery area around College Grove"
      />
      <div className="contact-form-card">
        <form id="deliveryCheckForm" onSubmit={handleAddressCheck}>
          <div className="form-row">
            <label htmlFor="deliveryAddress">
              Enter your address to see if you are in range
            </label>
            <input
              type="text"
              id="deliveryAddress"
              name="address"
              required
              autoComplete="street-address"
              placeholder="Street, city, state, ZIP"
            />
          </div>
          <button
            type="submit"
            className="btn btn--primary"
            style={{width: '100%'}}
            id="deliveryCheckBtn"
            disabled={checking}
          >
            {checking ? 'Checking…' : 'Check my address'}
          </button>
          <CheckStatus status={checkStatus} />
        </form>
      </div>

      {inquiryOpen ? (
        <div className="contact-form-card delivery-inquiry" id="deliveryInquiry">
          <h3>Message me for an inquiry</h3>
          <form
            id="deliveryInquiryForm"
            action={FORMSPARK_URL}
            method="POST"
            onSubmit={handleInquirySubmit}
          >
            <div className="form-row">
              <label htmlFor="deliveryName">Name</label>
              <input
                type="text"
                id="deliveryName"
                name="name"
                required
                autoComplete="name"
              />
            </div>
            <div className="form-row">
              <label htmlFor="deliveryEmail">Email</label>
              <input
                type="email"
                id="deliveryEmail"
                name="email"
                required
                autoComplete="email"
              />
            </div>
            <div className="form-row">
              <label htmlFor="deliveryMessage">Message</label>
              <textarea
                id="deliveryMessage"
                name="message"
                rows={4}
                required
                placeholder="What you’d like delivered, and when."
              />
            </div>
            <input
              type="hidden"
              name="address"
              id="deliveryInquiryAddress"
              value={inquiryFields.address}
              readOnly
            />
            <input
              type="hidden"
              name="miles"
              id="deliveryMiles"
              value={inquiryFields.miles}
              readOnly
            />
            <input
              type="hidden"
              name="lat"
              id="deliveryLat"
              value={inquiryFields.lat}
              readOnly
            />
            <input
              type="hidden"
              name="lng"
              id="deliveryLng"
              value={inquiryFields.lng}
              readOnly
            />
            <input type="hidden" name="topic" value="local-delivery-inquiry" />
            <button
              type="submit"
              className={`btn btn--primary${inquirySuccess ? ' is-success' : ''}`}
              style={{width: '100%'}}
              id="deliveryInquiryBtn"
              disabled={inquirySending || inquirySuccess}
            >
              {inquirySending
                ? 'Sending…'
                : inquirySuccess
                  ? '✓ Sent!'
                  : 'Message me for an inquiry'}
            </button>
            <InquiryStatus status={inquiryStatus} />
          </form>
        </div>
      ) : null}
    </div>
  );
}

function CheckStatus({status}) {
  if (!status.type) return null;
  return (
    <div
      className={`form-status ${status.type}`}
      id="deliveryCheckStatus"
      role="alert"
    >
      {status.message}
    </div>
  );
}

function InquiryStatus({status}) {
  const message =
    status === STATUS.success
      ? '✓ Got it — Christian will message you back.'
      : status === STATUS.error
        ? 'Something went wrong. Please try again or email us via Contact.'
        : '';

  return (
    <div
      className={`form-status${status === STATUS.success ? ' success' : ''}${status === STATUS.error ? ' error' : ''}`}
      id="deliveryInquiryStatus"
      role="alert"
    >
      {message}
    </div>
  );
}
