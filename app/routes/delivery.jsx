import {DeliveryChecker} from '~/components/DeliveryChecker';
import {checkDeliveryAddress} from '~/lib/deliveryGeo';
import {logInfo, logWarn} from '~/lib/log';
import {Link} from 'react-router';

export const meta = () => {
  return [{title: 'Local Delivery · Fizzy Leaf'}];
};

export async function action({request}) {
  const formData = await request.formData();
  if (formData.get('intent') !== 'check-address') {
    logWarn('delivery', 'action ignored — unknown intent', {
      intent: formData.get('intent'),
    });
    return {status: 'failed'};
  }
  const result = await checkDeliveryAddress(String(formData.get('address') || ''));
  logInfo('delivery', 'check result', {
    status: result.status,
    miles: result.miles,
    precision: result.hit?.precision,
    zip: result.hit?.zip,
  });
  return result;
}

export default function DeliveryPage() {
  return (
    <section className="section delivery-section">
      <div className="container">
        <div className="delivery-layout">
          <div className="delivery-info">
            <span className="eyebrow">Middle Tennessee</span>
            <h2>Local Delivery</h2>
            <p className="lead">
              If you live in the Middle TN area you might be close enough for me
              to just deliver Fizzy Leaf to you. Enter your address to see if
              you&apos;re inside the 30-mile area around College Grove (about a
              30-minute drive). If you are, send me an inquiry — this is a
              direct deal with me, not a Shopify checkout.
            </p>
            <ul className="delivery-prices">
              <li>
                <span>Delivery fee</span>
                <strong>$3</strong>
              </li>
              <li>
                <span>12 pack</span>
                <strong>$35/mo</strong>
              </li>
              <li>
                <span>24 pack</span>
                <strong>$65/mo</strong>
              </li>
              <li>
                <span>48 pack</span>
                <strong>$120/mo</strong>
              </li>
            </ul>
            <p className="delivery-note">
              Typical monthly drop-off if we set something up.{' '}
              <strong>Not a one-time shop order</strong> — those ship TN-wide
              from the <Link to="/shop">Shop</Link>.
            </p>
          </div>
          <DeliveryChecker />
        </div>
      </div>
    </section>
  );
}
