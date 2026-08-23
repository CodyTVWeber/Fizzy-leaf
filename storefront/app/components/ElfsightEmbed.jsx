import {useEffect} from 'react';

const SCRIPT_SRC = 'https://elfsightcdn.com/platform.js';
const APP_CLASS = 'elfsight-app-18cc5d9e-ff56-432e-9d94-79147ead9d44';

export function ElfsightEmbed() {
  useEffect(() => {
    if (document.querySelector(`script[src="${SCRIPT_SRC}"]`)) return;
    const script = document.createElement('script');
    script.src = SCRIPT_SRC;
    script.async = true;
    document.body.appendChild(script);
  }, []);

  return <div className={APP_CLASS} data-elfsight-app-lazy />;
}
