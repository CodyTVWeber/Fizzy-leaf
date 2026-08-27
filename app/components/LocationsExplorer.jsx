import {useRef, useState} from 'react';
import {
  LOCATION_CITIES,
  LOCATIONS,
  cityFilterLabel,
  mapSrcForCity,
  mapSrcForShop,
} from '~/lib/locations-data';

const FADE_MS = 180;

export function LocationsExplorer() {
  const [city, setCity] = useState('all');
  const [activeIndex, setActiveIndex] = useState(null);
  const [mapSrc, setMapSrc] = useState(mapSrcForCity('all'));
  const [gridFading, setGridFading] = useState(false);
  const mapRef = useRef(null);
  const mapBoxRef = useRef(null);

  const visible = LOCATIONS.map((shop, index) => ({shop, index})).filter(
    ({shop}) => city === 'all' || shop.city === city,
  );

  function selectCity(nextCity) {
    setCity(nextCity);
    setActiveIndex(null);
    setGridFading(true);
    window.setTimeout(() => setGridFading(false), FADE_MS);
    fadeSwapFrame(mapRef.current, mapSrcForCity(nextCity), setMapSrc);
  }

  function selectShop(shop, index) {
    setActiveIndex(index);
    fadeSwapFrame(mapRef.current, mapSrcForShop(shop), setMapSrc);
    if (
      mapBoxRef.current &&
      window.matchMedia('(max-width: 768px)').matches
    ) {
      mapBoxRef.current.scrollIntoView({behavior: 'smooth', block: 'center'});
    }
  }

  return (
    <>
      <div className="location-filters">
        {LOCATION_CITIES.map((c) => (
          <button
            key={c}
            type="button"
            className={`filter-btn${city === c ? ' active' : ''}`}
            onClick={() => selectCity(c)}
          >
            {cityFilterLabel(c)}
          </button>
        ))}
      </div>

      <div className="locations-layout">
        <div
          className="locations-grid"
          style={{
            opacity: gridFading ? 0 : 1,
            transform: gridFading ? 'translateY(8px)' : 'none',
            transition: 'opacity 0.18s ease, transform 0.18s ease',
          }}
        >
          {visible.map(({shop, index}) => (
            <div
              key={`${shop.name}-${shop.addr}`}
              className={`location-card${activeIndex === index ? ' active' : ''}`}
              role="button"
              tabIndex={0}
              title={`Show ${shop.name} on the map`}
              onClick={() => selectShop(shop, index)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  selectShop(shop, index);
                }
              }}
            >
              <strong>{shop.name}</strong>
              <span className="addr">{shop.addr}</span>
              <span className="card-hint">View on map →</span>
            </div>
          ))}
        </div>

        <div className="map-container" ref={mapBoxRef}>
          <iframe
            ref={mapRef}
            title="Fizzy Leaf retail locations map"
            src={mapSrc}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            style={{transition: 'opacity 0.18s ease'}}
          />
        </div>
      </div>
    </>
  );
}

function fadeSwapFrame(el, nextSrc, apply) {
  if (!el || !nextSrc) {
    apply(nextSrc);
    return;
  }
  el.style.opacity = '0';
  window.setTimeout(() => {
    apply(nextSrc);
    el.onload = () => {
      el.style.opacity = '1';
    };
    window.setTimeout(() => {
      el.style.opacity = '1';
    }, 1000);
  }, FADE_MS);
}
