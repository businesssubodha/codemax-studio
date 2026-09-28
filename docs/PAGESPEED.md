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

- Host Latin-subset Inter variable and DM Mono fonts locally, with font-display optional and a preload for the main font. Preserve the font licences.
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

## First verification and follow-up

Report: https://pagespeed.web.dev/analysis/https-codemax-studio-vercel-app/s2ubuw0dck
Mobile improved to 99 performance, 100 accessibility, 100 best practices, 69 SEO. Mobile LCP improved to 2.0 s; FCP 1.2 s; TBT 0 ms; CLS 0. Desktop exposed a 0.167 font-swap layout shift and scored 93 performance, so font-display was changed to optional before final verification. If a font arrives too late, the browser keeps a readable system fallback for that page view instead of moving already displayed content. The preloaded brand font is used when ready.

Second verification: https://pagespeed.web.dev/analysis/https-codemax-studio-vercel-app/jc58u6rpfo
Desktop reached 100 performance, 100 accessibility, 100 best practices, 69 SEO, with CLS 0. Mobile scored 94/100/100/69 with CLS 0. A further change loads Turnstile when the form comes within 500 px of the viewport or receives focus/pointer interaction. Server-side verification is unchanged and a missing token still blocks submission.

## Final verified result

Google PageSpeed Insights report: https://pagespeed.web.dev/analysis/https-codemax-studio-vercel-app/8yg34l4ba8
Verified deployed code commit: 7b55ae0c38f0bc5713ae998bdf1979c910b87943.

| Category | Mobile | Desktop |
| --- | ---: | ---: |
| Performance | 100 | 100 |
| Accessibility | 100 | 100 |
| Best practices | 100 | 100 |
| SEO | 69 | 69 |

Mobile: FCP 0.9 s, LCP 0.9 s, TBT 0 ms, CLS 0, Speed Index 0.9 s.
Desktop: FCP 0.3 s, LCP 0.3 s, TBT 0 ms, CLS 0, Speed Index 0.4 s.
The sole failing scored SEO audit is intentional preview noindex; nine SEO audits passed. These are homepage lab scores for this run, not field data or a guarantee of future scores or rankings. The shared improvements apply to other templates, but those URLs have not each received an independent PageSpeed run.

Live browser check: no Turnstile script at the top of the page; one script after focusing the name field; submit button enabled. No real enquiry was submitted. The nine-page production build passed and hosted fonts/images returned HTTP 200. Original WordPress blog posts and DNS remain unchanged.
