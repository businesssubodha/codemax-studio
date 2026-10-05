# Remaining media and legacy call-button work, 5 October 2026

## Verified public access
Fresh unauthenticated canonical-site GETs retrieved `/category/digital-marketing/`, an existing legacy 404 route, and both mobile-SEO article images. No WordPress administration was needed to download the original media. Source files and response headers are retained beside this report.

The category and legacy 404 still render the Call Now Button 1.5.5 anchor with `href="tel:0435 193 756"`. The main studio's number is already correct. Editing WordPress's stored plugin option would need administration access, but the existing production Worker can repair this exact public markup without it.

## Local router patch
`router-patch/cloudflare/production/legacy-call-button.mjs` contains an exact-match, token-aware replacement scoped to the plugin anchor ID, class and obsolete href. It changes the href to `tel:0494597993`. The tiny worker integration is in `router-worker.patch`; the standalone module and new tests must be copied alongside it. Existing copied `routes.mjs`, `worker.test.mjs`, and data files are test inputs only, not changes to apply.

Only anonymous, query-free GET requests to the canonical hosts and retained origin paths are eligible. Application/admin endpoints, auth cookies/headers, Set-Cookie responses, non-HTML, non-200/404 responses, HEAD/POST, studio pages and disabled routing remain untouched. Modified responses retain status and unrelated headers while removing stale byte-length/encoding/integrity validators. Existing source plugin settings remain unchanged.

32 tests passed: 27 existing routing checks and 5 new regression groups. Anonymous legacy 404 responses carry private/no-store cache policy; the correction preserves that policy exactly and does not cache the page. Fresh category and legacy 404 HTML were separately verified to change only the single href, preserving every other character. These are local checks; nothing is deployed.

## Image pilot
Both `.jpeg` endpoints actually serve 1024 × 1024 lossless WebP. The featured original is 625,556 bytes; the inline original is 1,097,832 bytes. Local lossless re-encoding saves just 18,378 bytes on featured and increases inline by 3,110 bytes; decoded pixels were confirmed identical. Lossless-only conversion is not a worthwhile solution here.

Six quality-85 WebP variants in `optimized-images/` use 480, 768 and 1024 widths, preserving the source composition and aspect ratio. `image-pilot-results.json` records source hashes, natural dimensions, byte counts and savings. At 1024 pixels the two images total 249,376 bytes instead of 1,723,388 bytes: 85.53% smaller. The 480-pixel pair totals 84,794 bytes: 95.08% smaller. Visual inspection of originals and 1024-pixel outputs found preserved content and readable lettering, with some fine-detail loss expected for lossy compression. Originals remain untouched.

## Exact bounded image integration proposal
1. Copy only the six optimized files into `public/article-media/` and enumerate their exact paths in the production routing asset allowlist. Do not use a broad unrestricted asset proxy.
2. Extend the existing exact article-path and source-URL metadata entry for these two mobile-SEO images with optimized `src`, `srcset` and `sizes`; leave all other source records and images unchanged.
3. Featured rendering should use those metadata URLs, truthful 1024 × 1024 dimensions, and existing high fetch priority; retain the existing 16:9 CSS crop. Inline transformation should replace only this exact source URL, add its responsive attributes, retain lazy loading, alt text and natural dimensions, and avoid duplicate attributes.
4. Test that only the target article HTML and six new assets change; all other generated pages must remain byte-identical. Test exact asset routing and WordPress fallback behavior. Build and run full repository checks.
5. Deploy only after upload/publication authorization is restored; verify all six assets return image/webp at canonical URLs, confirm srcset in live HTML, and then measure mobile LCP/PageSpeed again. Byte reductions are not a measured LCP claim.

This does not fix every article's imported media; a full image inventory/download/dimension/visual-check pass is still required for remaining image sources. No public upload or state change occurred during this investigation.

## Completed local integration (01:25 UTC)
The proposal above is now implemented in the separate `integrated/` source copy, based on the staged 70-article repair tree. The original checkout was not changed. `ready-local-fixes.patch` contains all nine text-file changes/new files; `optimized-images/` contains the six binary assets, whose destination is `public/article-media/`. `ready-changes.json` is the complete file list. The integrated source files are also available directly under `integrated/`.

The responsive sizes were derived from existing CSS: 90vw at 700px and below, 92vw until the article reaches its 940px maximum, then 940px. Source article content, original media URLs in records/schema, dates, alternative text, lazy loading and featured crop remain unchanged. The exact-source transform is idempotent, ignores raw text/comments, duplicate source attributes and existing srcset/sizes.

Validation:
- Astro build: 434 pages successful.
- SEO validation: all 433 canonical production URLs passed.
- JavaScript regression tests: 94 passed, zero skipped, including all built-output flags.
- Python import tests: all 13 passed.
- Both editorial validators passed (20 website drafts and 29 AI drafts).
- Generated-output comparison: 489 pre-existing files, 488 byte-identical; only target article changed; six new WebP assets; no removals.
- Target article compared byte-for-byte against baseline after exactly the two expected image-tag substitutions; exact match.
- Baseline raw article records, editorial content, queues and workflows are unchanged; the complete changed-file list contains only the intended rendering, routing, tests, manifest and assets.

This is ready locally only. Upload/publication is still paused. Fresh production validation and LCP measurement remain to be done after an authorized deployment. This bounded repair optimizes two images in one article, not the remaining sitewide media inventory.
