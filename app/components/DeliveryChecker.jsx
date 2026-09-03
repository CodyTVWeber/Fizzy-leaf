import {useEffect, useRef, useState} from 'react';
import {useFetcher} from 'react-router';
import {CHECK_STATUS, GEOCODE_PRECISION} from '~/lib/deliveryGeo';
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
  const fetcher = useFetcher();
  const mapRef = useRef(null);
  const mapStateRef = useRef(null);
  const [checkStatus, setCheckStatus] = useState({type: '', message: ''});
  const checking = fetcher.state !== 'idle';
  const [inquiryOpen, setInquiryOpen] = useState(false);
  const [inviteInquiry, setInviteInquiry] = useState(false);
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

  useEffect(() => {
    if (fetcher.state !== 'idle') {
      setInquiryOpen(false);
      setInviteInquiry(false);
      setCheckStatus({type: '', message: ''});
      return;
    }
    if (!fetcher.data) return;
    const ui = checkFeedback(fetcher.data);
    setCheckStatus({type: ui.type, message: ui.message});
    setInviteInquiry(ui.inviteInquiry);
    if (ui.inquiry) {
      setInquiryFields(ui.inquiry);
      setInquiryStatus(STATUS.idle);
    }
    setInquiryOpen(ui.openInquiry);
    if (ui.plot && mapStateRef.current) {
      mapStateRef.current = placeVisitorMarker(
        mapStateRef.current.L,
        mapStateRef.current,
        ui.plot.lat,
        ui.plot.lng,
        ui.plot.inRange,
      );
    }
  }, [fetcher.state, fetcher.data]);

  function handleAddressCheck(event) {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.address.value.trim()) {
      setCheckStatus({
        type: 'error',
        message: 'Enter a street address to check.',
      });
      return;
    }
    fetcher.submit(form);
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
        <form
          id="deliveryCheckForm"
          method="post"
          action="/delivery"
          onSubmit={handleAddressCheck}
        >
          <input type="hidden" name="intent" value="check-address" />
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
              placeholder="1000 Highway 96, Franklin, TN 37064"
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
          {inviteInquiry && !inquiryOpen ? (
            <button
              type="button"
              className="delivery-anyway"
              onClick={() => {
                setInquiryOpen(true);
                setInquiryStatus(STATUS.idle);
                setInviteInquiry(false);
              }}
            >
              Still want to message me anyway?
            </button>
          ) : null}
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
                placeholder="What you'd like delivered, and your address."
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

function checkFeedback(result) {
  const hit = result.hit;
  const miles = result.miles;
  const typed = result.query || '';
  if (result.status === CHECK_STATUS.empty) {
    return errorUi('Enter a street address to check.');
  }
  if (result.status === CHECK_STATUS.notFound) {
    return {
      ...errorUi(
        "We couldn't find that address. Include a city and ZIP — highway names are fine.",
      ),
      inviteInquiry: true,
      inquiry: blankInquiry(typed),
    };
  }
  if (result.status === CHECK_STATUS.failed) {
    return {
      ...errorUi(
        'Address check failed. Please try again or email us via Contact.',
      ),
      inviteInquiry: true,
      inquiry: blankInquiry(typed),
    };
  }
  if (!hit) {
    return errorUi(
      'Address check failed. Please try again or email us via Contact.',
    );
  }
  const plot = {lat: hit.lat, lng: hit.lng, inRange: false};
  const zipNote =
    hit.precision === GEOCODE_PRECISION.zip && hit.zip
      ? ` Using ZIP ${hit.zip} (couldn't pin the street).`
      : '';
  const inquiry = {
    address: hit.displayName || typed,
    miles: miles != null ? miles.toFixed(1) : '',
    lat: String(hit.lat),
    lng: String(hit.lng),
  };
  if (result.status === CHECK_STATUS.outOfRange) {
    return {
      type: 'error',
      message: `That address is about ${miles.toFixed(1)} miles away — outside the 30-mile delivery area for now.${zipNote}`,
      openInquiry: false,
      inviteInquiry: true,
      inquiry,
      plot,
    };
  }
  return {
    type: 'success',
    message: `You're about ${miles.toFixed(1)} miles from College Grove — within the 30-mile delivery area.${zipNote}`,
    openInquiry: true,
    inviteInquiry: false,
    inquiry,
    plot: {...plot, inRange: true},
  };
}

function blankInquiry(address) {
  return {address, miles: '', lat: '', lng: ''};
}

function errorUi(message) {
  return {
    type: 'error',
    message,
    openInquiry: false,
    inviteInquiry: false,
    inquiry: null,
    plot: null,
  };
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
