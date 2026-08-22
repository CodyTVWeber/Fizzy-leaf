import {Link} from 'react-router';
import {ElfsightEmbed} from '~/components/ElfsightEmbed';
import homeStyles from '~/styles/home.css?url';

export const meta = () => {
  return [
    {title: 'Fizzy Leaf · Tennessee Sparkling Hibiscus Tea'},
  ];
};

export const links = () => {
  return [{rel: 'stylesheet', href: homeStyles}];
};

export default function Homepage() {
  return (
    <>
      <section id="home" className="hero">
        <div className="hero-copy">
          <img
            src="/img/FizzyLeafLogo.webp"
            className="hero-logo"
            alt="Fizzy Leaf"
          />
          <span className="eyebrow">Made &amp; Sold in Middle Tennessee</span>
          <h1>Tennessee&apos;s Own Sparkling Hibiscus Tea</h1>
          <p className="lead">
            A bold, naturally tart Roselle Hibiscus sparkling tea — carbonated
            the hard way, with no artificial sweeteners. Crafted in small
            batches and loved by local coffee shops across Middle Tennessee.
          </p>
          <div className="hero-actions">
            <Link to="/shop" className="btn btn-primary" prefetch="intent">
              Shop Now
            </Link>
            <Link to="/locations" className="btn btn-outline" prefetch="intent">
              Find Near You
            </Link>
          </div>
          <div className="badge-row">
            <span>0 Calories</span>
            <span>Caffeine-Free</span>
            <span>&lt;1g Sugar</span>
            <span>No Artificial Sweetener</span>
          </div>
        </div>
        <div className="hero-image-wrap">
          <img
            src="/img/fizzy-cans-trio.webp"
            alt="Three cans of Fizzy Leaf Roselle Hibiscus Sparkling Tea"
          />
        </div>
      </section>

      <section id="story">
        <div className="section-inner split">
          <img src="/img/fizzy-can-shelf.webp" alt="Fizzy Leaf can on display" />
          <div>
            <h2>Our Story</h2>
            <p className="lead">
              Hello! My name is Christian Milford, and I&apos;m the owner of
              Fizzy Leaf. I started this company because I was tired of water! I
              wanted a drink that wasn&apos;t super sugary and didn&apos;t have
              an aftertaste. I tried carbonating milk, Gatorade, and coffee, but
              they were NOT good. Then I remembered my mom always making hibiscus
              tea when I was younger, so I tried carbonating that, and it was
              AMAZING. I brought it in mason jars to some parties, and everyone
              said how great it was and that I needed to start selling it. So
              whether they meant it or not, I started a company out of it!
            </p>
          </div>
        </div>
      </section>

      <section id="instagram">
        <div className="section-inner" style={{textAlign: 'center'}}>
          <span className="eyebrow">Follow Along</span>
          <h2>Follow Fizzy Leaf on Instagram</h2>
          <ElfsightEmbed />
        </div>
      </section>
    </>
  );
}
