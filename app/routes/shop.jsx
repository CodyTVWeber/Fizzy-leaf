import {ShopConfigurator} from '~/components/ShopConfigurator';
import {loadDisplayPrices} from '~/lib/product';
import {logInfo} from '~/lib/log';

export const meta = () => {
  return [{title: 'Shop · Fizzy Leaf'}];
};

export async function loader({context}) {
  const loaded = await loadDisplayPrices(context.storefront, context.env);
  logInfo('shop-loader', 'returning prices to UI', loaded);
  return loaded;
}

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
