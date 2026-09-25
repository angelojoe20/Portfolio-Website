# Angelo Joe Delos Santos - Portfolio

A static portfolio for cloud engineering work, certifications, projects, and hiking journals.

## Preview

Open `index.html` directly in a browser. No build step or development server is required.

## Files

- `index.html`: content, links, project summaries, and hiking posts.
- `assets/style.css`: responsive layout and light/dark themes.
- `assets/script.js`: navigation, experience disclosure, filters, screenshot previews, hiking journals, and contact actions.
- `assets/icons/`: local skill logos, source URLs, and upstream licenses.
- `assets/vendor/`: local Lucide icon library and its license.

The contact form composes a draft in the visitor's email app; it does not send email from a backend. Instagram is loaded only when a visitor opens a journal preview. Instagram controls whether an embedded post is visible; each journal retains a direct link even if previews are blocked. No external request is made to Instagram during ordinary page browsing.

Project screenshots open in a keyboard-accessible dialog. Diskarte PH has desktop and mobile views. Project notes and company details remain available as progressive enhancements; the full descriptions are readable when JavaScript is disabled.

## Images

Original images and certificate PDFs are preserved. Smaller WebP copies serve the portrait and project thumbnails, while previews link to full-size originals. To regenerate the optimized copies with Node.js and Sharp available:

```sh
node scripts/optimize-assets.cjs
```

Update the corresponding `width` and `height` attributes if a source image's proportions change. App icons use real 192px and 512px files instead of loading the original 1024px image as the favicon.

## Browser Checks

With Node.js, Playwright, and Chrome available, run from the repository root:

```sh
node scripts/verify-portfolio.cjs
node scripts/verify-mobile.cjs
```

The script checks persisted themes, company disclosures, certificate links, project filters and notes, screenshot previews, keyboard focus, hiking order and scrolling, blocked-Instagram fallback, mobile navigation, clipboard feedback, email validation, image loading, and overflow at nine viewport widths. Clipboard access is mocked and no email is sent. Screenshots are written to the system temporary directory under `portfolio-review`. An optional URL argument checks a deployed version.

The mobile suite uses touch-enabled Chrome emulation at seven phone, landscape, and tablet sizes. It checks menu scroll locking and focus, skill disclosures across rotation, touch filters, native hiking swipes, full-screen previews, and form sizing. Light and dark screenshots are saved under `portfolio-mobile` in the system temporary directory. These checks do not replace testing on physical iOS and Android devices.

## Deployment

The GitHub `main` branch is connected to Vercel at https://angelojoe-website.vercel.app/.
