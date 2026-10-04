# Confirmed follow-on SEO repairs

Prepared 4 October 2026 on main `72a8bfb057497c705505015cdb5ef4dc0b725bd2` and approved for publication after a hold at 23:18 UTC. Reconciled against `240cc4506df2f8a45865a71e2b50d6a909b4b6cd`, preserving both newer article commits and their queue edits. The temporary workspace was replaced during the hold, so the same scoped changes were restored from the reviewed file patches and fully retested.

## Approved changes

1. Repair 38 hyperlinks to 31 confirmed dead destinations across 17 imported articles. Eleven links point to relevant existing articles; 27 are unlinked while keeping readable text. Seven misleading link labels are made accurate for their replacement destinations. The explicit map records each source, replacement, reason and expected occurrence count. Contextual replacements do not imply that two URLs historically represented the same article, and no new redirects are introduced.
2. Omit contradictory public modified dates for 51 imported articles whose source modification timestamp precedes publication. Keep raw source records and original publication dates unchanged. Apply the same rule to article schema, Open Graph metadata, the Astro sitemap, the Worker routing manifest and future WordPress imports. Do not invent recent update timestamps.
3. Improve three hard-to-read homepage paragraphs within the ProjectOptions component. The text changes from `#55564f` to `#c4c8bc` on `#111210`, giving approximately 11.03:1 contrast. The rule remains component-scoped; light service panels and reduced-motion behavior are unaffected.
4. Add link, date, sitemap parity and contrast regression checks. Unknown internal page destinations now require explicit review; the existing WordPress digital-marketing category and upload media are preserved.

No article deletion, mass noindex, image optimization, WordPress settings, address, phone, DNS, credentials, contact delivery or editorial scheduling changes are included. Some unlinked surrounding prose can still contain dated service claims and needs separate editorial review.

## Audit coverage and limitations

The original follow-on audit inventoried all 431 generated sitemap pages: 10,874 internal href occurrences, including 8,719 anchor hrefs; 489 distinct internal destinations; and 442 distinct fragment targets. No bad local fragments were found.

Live checks stopped when the execution review was cancelled, after 236 destinations: 205 returned 200 and 31 returned genuine WordPress 404 pages. This included 198 of the 431 sitemap pages, all returning 200 with matching metadata; 233 sitemap pages and 253 distinct internal destinations remained unverified live. There were no bad fragments among 209 live fragment checks. The 388 inventoried external destinations were not checked. This is partial live coverage, not a complete crawl or proof of Googlebot access.

The current build has 433 canonical sitemap pages after two newer articles. Metadata checks cover every generated page, including title/description uniqueness, one H1, canonical URL, indexability directives, parseable structured data, known internal routes, fragment targets and sitemap parity. These checks do not establish search rankings or guarantee first position.

## Remaining work outside this deployment

- Article image performance: the reviewed mobile-SEO article scored 82 in PageSpeed mobile with 4.8-second LCP and about 1,546 KiB potential image savings. Compression, responsive variants, truthful intrinsic dimensions and featured-image priority need separate implementation. The image originals were not available in the retained workspace; no image downloads or changes are included.
- Retained WordPress call button: cached HTML for `/category/digital-marketing/` and legacy 404 pages still used `tel:0435 193 756`, from the Call Now Button 1.5.5 plugin. The confirmed current business number is `0494 597 993`. Correcting that separate plugin setting needs authenticated WordPress administration access with permission to edit it. The studio-generated phone links and schema already use the correct number.
- Imported media quality: the original local audit found 90 inline images without intrinsic dimensions, 84 prompt-like alt texts and 1,474 distinct image sources on the old Bluehost hostname across 228 articles. The hostname dependency is not a confirmed broken-image count. Image inspection and selective content review remain necessary.
- Mobile hands-on interactions and a complete live crawl remain unverified. Search Console performance and current indexing details are needed to explain actual search visibility; analytics configuration does not itself explain ranking.

## Release validation

Run against the reconciled current source before publication:

- `ASTRO_TELEMETRY_DISABLED=1 npm run build`
- `npm run check:seo` for all 433 canonical pages, including identical Astro/Worker sitemap URL/date pairs
- `npm run test:import`
- `LEGACY_LINK_CHECK_DIST=1 node --test cloudflare/production/worker.test.mjs cloudflare/contact/worker.test.mjs scripts/*.test.mjs`
- `node scripts/check-editorial.mjs` and `node scripts/check-ai-editorial.mjs`
- `git diff --check` and byte-preservation checks for current raw articles, editorial records, queues and workflows

Publish only this reviewed patch with a fast-forward update to current main. Verify the exact remote commit and existing Cloudflare Pages and production routing Worker checks. Both components must deploy because the Worker sitemap consumes the compact manifest. After deployment, inspect the affected article links, representative corrected date metadata, both sitemaps and homepage contrast. Rollback is a revert followed by redeploying both existing components; no infrastructure changes are needed.
