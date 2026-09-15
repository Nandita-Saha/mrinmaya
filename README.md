# Mrinmaya landing page

Updated to follow `images/website-new-mockup.png`: a panoramic collage hero, spacious collection and product grids, a dedicated artisan story section, centered FAQ, contact section, and a multi-column footer.

Open `index.html` in a browser. No installation or build step is needed. Headings use Cormorant Garamond; body text, links, and controls use Libre Baskerville. These fonts load from Google Fonts with local serif fallbacks when offline.

## Structure

- `index.html` — semantic page sections and accessible controls.
- `css/style.css` — desktop layout, responsive breakpoints, and reduced-motion support.
- `js/main.js` — mobile navigation, search, category filtering, session cart, FAQ support, and informational dialogs.
- `images/` — supplied logo and mockup, plus photographs cropped directly from that mockup.

The supplied logo is used unchanged. Photographs and decorative assets are cropped directly from the new mockup, with no substitute or generated photographs. Extracted images retain the resolution available in the reference. The hero uses the reference collage with live HTML text over a darkened, blurred foreground to cover the text embedded in the screenshot. Video cards use HTML captions and play controls over the extracted thumbnails. Original separate, full-resolution photographs would allow a cleaner hero treatment.

General text, navigation, buttons, captions, and form fields use a 16px (`1rem`) baseline at every viewport. Headings scale separately. Layouts reflow at 1200px, 960px, 680px, and 380px; general text never shrinks to fit. Section spacing ranges from 36px to 64px, with larger card padding and accessible control sizes.

The page adapts to phones, tablets, and desktop screens. Product prices and contact details remain placeholders as in the reference. Cart data lasts for the current page visit. No checkout, authentication, video files, social profile URLs, or message delivery service were supplied, so the relevant controls explain their preview status. The contact form validates input but does not transmit it.

No framework, package installation, deployment, or commits are required.
