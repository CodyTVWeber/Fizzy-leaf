# Fizzy Leaf Sparkling Tea Website

A beautiful, static website for Fizzy Leaf Sparkling Tea using Formspark for contact form submissions.

## Setup Instructions

### 1. Formspark Integration

The contact form uses Formspark for handling form submissions without needing a server.

**Formspark is already configured!** ✅

The contact form is set up with Formspark and includes:
- Name field
- Email field
- Message field
- **Asynchronous submission** - no page refresh required!
- **Loading states** and **success/error feedback**

Form submissions are handled with JavaScript for a smooth user experience.

### 2. Logo Image

The website references `IMG_7455.png` for the logo. You'll need to:

1. Add your logo image file as `IMG_7455.png` in the same directory as `index.html`
2. Or update the `src` attribute in the hero section to point to your logo file

### 3. Google Maps API

The site uses Google Maps to show location information. The API key is already included in the code.

### 4. Hosting

Since this is a static site, you can host it on:
- GitHub Pages
- Netlify
- Vercel
- Any static hosting service

## Features

- Spindrift-inspired clean, premium product-focused design
- Hero with professional product photography (new cans + handheld shots from tmp/)
- **Shop section** with pack sizes (4/8/12), one-time purchase and **Subscribe & Save (15% off)** options
- Client-side cart + "Buy with Shopify" buttons + demo checkout flow (notes real Shopify integration + TN shipping restriction)
- **Tennessee-only** badges, disclaimers, and demo zip gate for online orders
- **Full updated retailer list** (18 locations) from email + cleaned names + search filter on Find Us
- "Made the right way" values section modeled on Spindrift philosophy
- Contact via Formspark + demo newsletter signup
- Instagram embed + Google Maps retained
- Responsive, modern typography and generous whitespace

## Online Sales Notes
- "Add shopify button" and subscriptions implemented via attractive UI + JS cart.
- When a real Shopify store + Buy Button + Selling Plans exist, replace the add-to-cart behavior and `shopifyCheckout()` with the official Shopify Buy Button embed (product + subscription plan).
- Shipping profiles in Shopify should restrict to TN zip codes only.

## Customization

- Colors: The site uses a warm, earthy color palette (#d2a863, #7a633b, etc.)
- Fonts: Montserrat for body text, Playfair Display for headings
- Map location: Currently set to 1819 Coffee in Thompsons Station, TN
