# Angelo Joe Delos Santos - Portfolio

A static portfolio for cloud engineering work, certifications, projects, and hiking journals.

## Preview

Open `index.html` directly in a browser. No build step or development server is required.

## Files

- `index.html`: content, links, project summaries, and hiking posts.
- `assets/style.css`: responsive layout and light/dark themes.
- `assets/script.js`: navigation, experience disclosure, filters, photo gallery, and contact actions.
- `assets/icons/`: local skill logos, source URLs, and upstream licenses.
- `assets/vendor/`: local Lucide icon library and its license.

The contact form composes a draft in the visitor's email app; it does not send email from a backend. Instagram controls whether an embedded post is visible. Each hiking journal retains a direct link to the original post.

## Browser Checks

With Node.js, Playwright, and Chrome available, run from the repository root:

```sh
node scripts/verify-portfolio.cjs
```

The script checks themes, experience disclosure, certification and project filters, hiking order and scrolling, the mobile menu, email validation, image loading, and overflow at six viewport widths. Screenshots are written to the system temporary directory under `portfolio-review`. An optional URL argument checks a deployed version.

## Deployment

The GitHub `main` branch is connected to Vercel at https://angelojoe-website.vercel.app/.
