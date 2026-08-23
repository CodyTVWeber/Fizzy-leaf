import {LocationsExplorer} from '~/components/LocationsExplorer';

export const meta = () => {
  return [{title: 'Locations · Fizzy Leaf'}];
};

export default function LocationsPage() {
  return (
    <section id="locations">
      <div className="section-inner">
        <span className="eyebrow">Where to Find Us</span>
        <h2>Find Fizzy Leaf Near You</h2>
        <p className="lead" style={{margin: '0 auto'}}>
          Fizzy Leaf is proudly carried by these local shops across Middle
          Tennessee.
        </p>
        <LocationsExplorer />
      </div>
    </section>
  );
}
