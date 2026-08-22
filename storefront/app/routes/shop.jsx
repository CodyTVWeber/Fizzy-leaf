import shopStyles from '~/styles/shop.css?url';
import {ShopConfigurator} from '~/components/ShopConfigurator';

export const meta = () => {
  return [{title: 'Shop · Fizzy Leaf'}];
};

export const links = () => {
  return [{rel: 'stylesheet', href: shopStyles}];
};

export default function ShopPage() {
  return (
    <section id="shop" className="section section--cream">
      <div className="container">
        <div className="section-header">
          <span className="eyebrow">Shop</span>
          <h2>Tasting is believing.</h2>
          <p className="lead">
            Experience the Fizzy Leaf difference. Ships to Tennessee only —
            because it&apos;s made right here.
          </p>
        </div>
        <ShopConfigurator />
      </div>
    </section>
  );
}
