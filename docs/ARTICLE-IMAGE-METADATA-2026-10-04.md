# Audited article image metadata

Prepared locally against deployed commit `62fe8eb`. No publication or fresh live
performance measurement is included in this patch.

## Scope and evidence

Only `/dont-miss-out-crucial-mobile-seo-services-australian-website-needs/` changes.
The preceding browser audit verified the natural dimensions of both original
JPEGs as **1024 × 1024**. Those supplied measurements are recorded in
`src/data/article-image-metadata.json`, keyed by the exact article path and exact
image URL. This patch does not fetch, recompress, replace or rename either image.

- The featured image now has truthful `width="1024" height="1024"` attributes and
  `fetchpriority="high"`. Its existing CSS `aspect-ratio:16/9;object-fit:cover`
  intentionally retains the displayed crop.
- The inline image gains the same truthful dimensions and retains its original
  alt text, `loading="lazy"` and `decoding="async"`.
- The pure rendering helper leaves unrelated paths and URLs untouched, avoids
  comments/raw text, and does not replace existing inline dimensions. Source
  article records, publication dates, routes and WordPress assets are unchanged.

The audit's mobile score of 82 and LCP of 4.8 seconds are baseline observations,
not measured results of this change. The original large JPEG payloads remain;
metadata and priority hints alone do not establish a faster LCP or higher score.

## Local verification

- `ASTRO_TELEMETRY_DISABLED=1 npm run build`: 434 pages built
- `npm run check:seo`: passed all 433 canonical production URLs
- `ARTICLE_IMAGE_CHECK_DIST=1 LEGACY_LINK_CHECK_DIST=1 node --test cloudflare/production/worker.test.mjs cloudflare/contact/worker.test.mjs scripts/*.test.mjs`: 61 passed, zero skipped
- `npm run test:import`: 13 passed
- `node scripts/check-editorial.mjs` and `node scripts/check-ai-editorial.mjs`: both passed
- `git diff --check`: passed

Before editing, all 489 generated files were SHA-256 fingerprinted. After the
patch, 488 were byte-identical, including all other articles and the sitemap.
The sole changed file was the target article. Its complete HTML was independently
compared against the baseline with only the two expected image-tag changes
applied, and matched exactly. Tests also cover all 392 source article records,
exact URL scoping, idempotence, misleading attributes and unchanged loading/crop
behavior. No browser, network, upload, credential or deployment step was used.
