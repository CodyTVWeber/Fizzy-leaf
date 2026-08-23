import {ContactForm} from '~/components/ContactForm';

export const meta = () => {
  return [{title: 'Contact · Fizzy Leaf'}];
};

export default function ContactPage() {
  return (
    <section className="section">
      <div className="container">
        <div className="contact-layout">
          <div className="contact-info">
            <span className="eyebrow">Get in Touch</span>
            <h2>We&apos;d love to hear from you.</h2>
            <p className="lead">
              For business inquiries, wholesale partnerships, or just to say
              hello — drop us a line.
            </p>
            <ul className="contact-perks">
              <li>📦 Wholesale &amp; retail partnerships</li>
              <li>☕ Want Fizzy Leaf at your shop?</li>
              <li>💬 General questions &amp; feedback</li>
            </ul>
          </div>
          <div className="contact-form-card">
            <ContactForm />
          </div>
        </div>
      </div>
    </section>
  );
}
