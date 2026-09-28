# PageSpeed optimisation — 28 September 2026

Scope: the new CodeMax Astro site at https://codemax-studio.vercel.app/.
The separate original WordPress website and blog have not been changed.

## Baseline measured by Google PageSpeed Insights

Report: https://pagespeed.web.dev/analysis/https-codemax-studio-vercel-app/txt1laz2n5
Lighthouse 13.5.0; mobile simulated slow 4G.

| Category | Mobile | Desktop |
| --- | ---: | ---: |
| Performance | 70 | 99 |
| Accessibility | 95 | 95 |
| Best practices | 77 | 77 |
| SEO | 69 | 69 |

Mobile FCP 2.8 s, LCP 6.2 s, TBT 0 ms, CLS 0, Speed Index 4.7 s.
There is no Chrome UX Report field data available for this preview.

## Changes

- Host Latin-subset Inter variable and DM Mono fonts locally, with font-display swap and a preload for the main font. Preserve the font licences.
- Inline the small shared stylesheet to remove its extra render-blocking request.
- Render hero copy immediately while preserving the VISIBLE glitch and other requested accents.
- Use locally hosted WebP portfolio thumbnails at 420 and 840 pixels, responsive srcset/sizes and lazy loading. Full-design links still open the originals on WordPress.
- Darken orange heading accents on light backgrounds for contrast.
- Give the value-panel heading a real h2 so its h3 cards follow a logical heading order.
- Remove the mailto form action flagged as insecure by Lighthouse. JavaScript continues to send JSON to the existing HTTPS Worker; without JavaScript the explicit email link is available. The submit button is enabled only after the form handler loads.
- Add cache headers for fonts, portfolio thumbnails and branding, plus nosniff, frame protection, referrer policy and opener isolation headers.

## Intentional limitations

The Vercel preview retains its X-Robots-Tag: noindex, follow protection. Do not remove this to inflate the SEO score while the original production site remains live. Review indexability only as part of the agreed production-domain launch and blog routing plan.

A perfect Lighthouse score is not a guarantee of accessibility, search rankings or real-user performance. Scores fluctuate with test conditions and third-party services. Contact delivery requires a separate real submission; audits do not send messages.
