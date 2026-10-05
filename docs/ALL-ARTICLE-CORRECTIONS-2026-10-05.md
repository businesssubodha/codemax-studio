# All-article correction batch — 5 October 2026

## Review scope and publication boundary

All 392 published articles (382 imported, 10 editorial) were reviewed locally for metadata, links and document structure. This proposed batch directly repairs 70 article URLs, with overlapping groups described below. The site has 433 canonical sitemap pages. This does not mean every factual claim or remote image has been verified, nor does it guarantee indexing or a search position.

Base production commit: `62fe8eb37fd548521c147aed263e0a1ae6ee5219`. This batch was approved for publication on 5 October 2026. Current main was verified as this base before release. The audited image-metadata correction was still local and is included in this batch. Publishing this batch must use current main and preserve later publications.

## Exact changes

- Correct heading outlines in 45 audited articles: 267 H3 elements become H2 and 82 H4 elements become H3. Relative nesting, text, IDs and original desktop/mobile typography are preserved. A regression guard covers all article heading outlines.
- Remove 104 bare BR elements placed directly inside lists across three exact articles: 14 leading, 76 between items and 14 trailing. Preserve item order, text, attributes and meaningful intra-item breaks.
- Apply reviewed source corrections to 27 articles: 23 substantive edits and four additional formatting-only edits. Changes include removing a duplicated article copy; correcting unsupported ranking/agency/course promises; replacing a US-specific company guide with a high-level Australian planning checklist linked to ASIC/ABR; repairing corrupted keywords, misleading link labels and authoring placeholders; and correcting precise statistical, contrast and password-security errors.
- Restore real headings, emphasis and lists in four raw-Markdown articles, preserving prose, punctuation, 19 link destinations and all four image attributes. Recover eight section headings and a five-item list in the fashion article. Convert two escaped iframe dumps into ordinary links to their existing video destinations; no iframe or automatic third-party player is introduced. Availability of those two videos is unverified.
- For the single previously audited mobile-SEO article, set truthful 1024×1024 image dimensions and high fetch priority for its featured image. Preserve its 16:9 display crop and inline lazy loading. JPEG bytes are unchanged; this is not an image-compression fix and no new performance score is claimed.
- Preserve every article URL, original publication/display date, author, category and featured-image record. Use actual edit timestamps only for the 23 substantively edited articles. Formatting-only work does not receive a new update date.

Eight inline image occurrences disappear with the reviewed content changes: one duplicate illustration in the repeated article, one illustration from the unsupported course offer, and six illustrations from the replaced US-specific company guide. No media files are deleted. No other image URL, alt description or pixel data is changed.

The 10 newer editorial records, queues, publishing workflow, infrastructure, business phone/address, WordPress settings, DNS and credentials are unchanged. The separate hourly editorial-recovery enhancement is excluded.

## Source-backed corrections

- Statistical interpretation: [American Statistical Association statement](https://www.amstat.org/asa/files/pdfs/p-valuestatement.pdf)
- Contrast thresholds and large-text exceptions: [W3C minimum contrast](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html) and [enhanced contrast](https://www.w3.org/WAI/WCAG22/Understanding/contrast-enhanced.html)
- Password storage and unique credentials: [OWASP Password Storage](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html) and [NIST authentication guidance](https://pages.nist.gov/800-63-4/sp800-63b.html)
- Australian planning references: [ASIC registration](https://www.asic.gov.au/for-business-and-companies/companies/register-a-company), [ASIC naming rules](https://www.asic.gov.au/for-business-and-companies/companies/register-a-company/rules-for-acceptable-company-names), and [ABR application information](https://www.abr.gov.au/business-super-funds-charities/applying-abn/what-you-need-your-abn-application)

The company article does not prescribe liability outcomes, fees, eligibility or a personal legal/tax decision. The security changes alter article advice, not any security setting or credential.

## Validation

- Static build: 434 files reported as pages, including the 404 page; 433 canonical sitemap URLs
- `npm run check:seo`: all 433 URLs pass, including sitemap parity, unique metadata, one H1, known internal links, article update chronology and heading hierarchy
- All Node tests with content, image, heading, list and link post-build checks enabled: 84 passed, zero skipped
- WordPress importer tests: 13 passed
- Editorial validators: 20 website drafts and 29 AI drafts passed
- `git diff --check`: passed
- Independent four-article formatting review: exact prose/punctuation/order and all link/image attributes preserved after removing only syntax markers and duplicated opening titles
- Final checks must be rerun after any later edit or reconciliation with newer main

## Remaining limits

The earlier broad live crawl stopped after 236 destinations. The second production batch separately passed 62 targeted live HTML checks, then execution review cancelled the session before the two XML checks. These overlapping counts must not be added. The stopped network route has not been retried or bypassed for this batch; no live verification of these new local changes is claimed.

Article-image compression, the remaining unknown image dimensions and prompt-like alt descriptions need legitimate source-image access and actual inspection. Old Bluehost image dependencies are not counted as confirmed broken images. The retained WordPress Call Now Button still requires separate authenticated administration access to replace its previously observed old phone number with the confirmed `0494 597 993`.

Some product/pricing/business claims still need source or owner confirmation. Uneven legacy tables, blank headers and residual parser-recovery candidates remain contextual review items, not guessed automatic edits. Search Console performance data and business evidence remain necessary to assess actual search visibility.

## Source records changed

The regression fixture records original protected fields, prior modification timestamps, exact changed fields and reviewed body hashes. A later intentional edit or re-import must reconcile those checks rather than silently restore corrected faults.

- `/outrank-rivals-smart-aussie-guide-local-search-engine-optimisation/` — modified, html; actual edit 2026-10-05T00:03:52Z
- `/the-aussie-secret-how-to-create-seo-content-that-ranks-1-on-google/` — title, seoTitle, description, modified, html; actual edit 2026-10-05T00:09:45Z
- `/secret-to-style-success-australian-bloggers-uploadblog-for-fashion-shine-online/` — title, seoTitle, description, modified, html; actual edit 2026-10-05T00:16:12Z
- `/australian-generate-leads-service-marketing-success/` — modified, html; actual edit 2026-10-05T00:09:45Z
- `/dominate-local-search-rank-higher-google-maps-maphighe-now/` — title, seoTitle, description, modified, html; actual edit 2026-10-05T00:09:45Z
- `/more-patients-less-pain-australian-dental-seo-dental-expert/` — modified, html; actual edit 2026-10-05T00:09:45Z
- `/budgeting-for-success-how-to-get-top-tier-seo-at-a-price-for-seo-20-per-article-in-australia/` — html; original update date retained
- `/aussie-businesses-level-up-impact-professional-web-page-development-services/` — html; original update date retained
- `/grow-your-brand-affordable-websites-small-businesses-australian-success/` — modified, html; actual edit 2026-10-05T00:09:45Z
- `/dont-get-stranded-down-under-pro-wordpress-web-maintenance-for-peak-performance/` — modified, html; actual edit 2026-10-05T00:09:45Z
- `/master-your-market-comprehensive-small-business-course-guide/` — title, seoTitle, description, modified, html; actual edit 2026-10-05T00:03:52Z
- `/maximise-roi-australia-wordpress-website-maintenance-services/` — html; original update date retained
- `/unlock-growth-why-affordable-websites-for-small-businesses-are-essential/` — html; original update date retained
- `/website-cost-calculator-how-much-does-this-website-cost-for-your-project/` — title, seoTitle, description, modified, html; actual edit 2026-10-05T00:09:45Z
- `/australias-premier-social-media-marketing-agency/` — title, seoTitle, description, modified, html; actual edit 2026-10-05T00:17:40Z
- `/top-10-creative-website-designers-in-australia-2025-codemax-leads-the-way/` — title, seoTitle, description, modified, html; actual edit 2026-10-05T00:09:45Z
- `/set-up-a-company/` — title, seoTitle, description, modified, html; actual edit 2026-10-05T00:17:40Z
- `/simple-guide-analyzing-ab-test-results-for-website-optimization/` — modified, html; actual edit 2026-10-05T00:15:14Z
- `/why-analyze-ab-testing-results-for-website-optimization/` — modified, html; actual edit 2026-10-05T00:15:14Z
- `/8-essential-tips-for-ab-testing-website-conversion-rates/` — modified, html; actual edit 2026-10-05T00:15:14Z
- `/10-best-tips-for-ab-testing-website-conversion-rates/` — modified, html; actual edit 2026-10-05T00:15:14Z
- `/creating-accessible-websites-a-step-by-step-guide/` — modified, html; actual edit 2026-10-05T00:15:14Z
- `/9-tips-for-enhancing-website-accessibility-for-visually-impaired-users/` — modified, html; actual edit 2026-10-05T00:15:14Z
- `/what-are-effective-ways-to-make-websites-accessible-for-visually-impaired-users/` — modified, html; actual edit 2026-10-05T00:15:14Z
- `/avoid-these-website-maintenance-mistakes/` — modified, html; actual edit 2026-10-05T00:15:14Z
- `/essential-website-security-checklist-for-small-businesses/` — modified, html; actual edit 2026-10-05T00:15:14Z
- `/top-3-foolproof-website-security-tips/` — title, seoTitle, description, modified, html; actual edit 2026-10-05T00:20:57Z

## All direct article targets

- `/10-best-tips-for-ab-testing-website-conversion-rates/`
- `/5-essential-seo-search-engine-strategies-australian-business-growth/`
- `/5-google-maps-seo-hacks-dominate-local-search-attract-aussie-customers/`
- `/7-smart-strategies-propel-australian-enterprise-expert-global-seo-services/`
- `/8-essential-tips-for-ab-testing-website-conversion-rates/`
- `/9-tips-for-enhancing-website-accessibility-for-visually-impaired-users/`
- `/are-you-overpaying-decoding-the-best-seo-packages-for-small-business-in-australia/`
- `/aussie-businesses-level-up-impact-professional-web-page-development-services/`
- `/aussie-models-ultimate-guide-stunning-modelling-portfolio-website/`
- `/australian-generate-leads-service-marketing-success/`
- `/australias-premier-social-media-marketing-agency/`
- `/avoid-3-pitfalls-choosing-right-seo-consulting-firm-for-business/`
- `/avoid-these-website-maintenance-mistakes/`
- `/best-search-engine-optimization-company-australian-business/`
- `/beyond-googles-first-page-australian-marketers-dominating-search-engine-optimisation-seo/`
- `/beyond-keywords-unveiling-power-advanced-magento-seo-services-australian-brands/`
- `/beyond-looks-strategic-seo-website-design-growth-hack-down-under/`
- `/beyond-the-big-smoke-local-search-rankings-regional-businesses/`
- `/beyond-the-pipes-unlocking-googles-secrets-expert-seo-for-plumbers-australia/`
- `/beyond-word-of-mouth-dental-seo-impact/`
- `/boost-your-bottom-line-australian-accounting-firm-seo-strategy/`
- `/budgeting-for-success-how-to-get-top-tier-seo-at-a-price-for-seo-20-per-article-in-australia/`
- `/choosing-right-seo-tools-australian-startups-guide/`
- `/copyscape-explained-your-ultimate-guide-to-website-plagiarism-detection/`
- `/creating-accessible-websites-a-step-by-step-guide/`
- `/dominate-local-search-rank-higher-google-maps-maphighe-now/`
- `/dominate-search-results-google-ads-melbourne-customers/`
- `/dont-get-it-wrong-definitive-guide-australian-business-card-size/`
- `/dont-get-left-behind-search-engine-marketing-australian-smes/`
- `/dont-get-stranded-down-under-pro-wordpress-web-maintenance-for-peak-performance/`
- `/dont-miss-out-crucial-mobile-seo-services-australian-website-needs/`
- `/ecommerce-web-design-services-australian-businesses-success/`
- `/essential-website-security-checklist-for-small-businesses/`
- `/future-proof-income-good-business-to-start-in-australia/`
- `/get-found-locally-google-maps-seo-australia-checklist/`
- `/google-seo-ranking-lagging-australian-business-guide/`
- `/grow-your-brand-affordable-websites-small-businesses-australian-success/`
- `/hiring-search-engine-optimization-company-australian-businesses-guide/`
- `/how-to-achieve-best-results-seo-content-marketing-perth-australia/`
- `/is-your-aussie-business-invisible-online-unlock-seo-secrets-today/`
- `/is-your-aussie-store-missing-out-ecommerce-seo-agency/`
- `/is-your-on-page-seo-holding-back-your-aussie-traffic/`
- `/lost-in-outback-search-results-smart-seo-marketing-guide/`
- `/master-your-market-comprehensive-small-business-course-guide/`
- `/maximise-roi-australia-wordpress-website-maintenance-services/`
- `/more-patients-less-pain-australian-dental-seo-dental-expert/`
- `/outrank-rivals-smart-aussie-guide-local-search-engine-optimisation/`
- `/ready-to-launch-high-potential-ideas-for-small-business-in-australia/`
- `/secret-to-style-success-australian-bloggers-uploadblog-for-fashion-shine-online/`
- `/set-up-a-company/`
- `/simple-guide-analyzing-ab-test-results-for-website-optimization/`
- `/stop-guessing-5-minute-guide-smarter-site-keyword-analysis-aussie-smbs/`
- `/stop-wasting-time-quality-over-quantity-good-backlinks-for-seo/`
- `/the-1-mistake-aussie-businesses-make-with-seo-and-how-to-fix-it-organically/`
- `/the-aussie-secret-how-to-create-seo-content-that-ranks-1-on-google/`
- `/the-great-seo-debate-in-house-vs-outsourcing-best-for-your-brand-seo/`
- `/the-secret-sauce-uncovering-best-seo-partner-digital-dominance-seo/`
- `/top-10-creative-website-designers-in-australia-2025-codemax-leads-the-way/`
- `/top-3-foolproof-website-security-tips/`
- `/top-5-reasons-australian-ecommerce-needs-professional-ecommerce-seo-services-today/`
- `/ultimate-aussie-playbook-5-ways-to-boost-google-seo-optimization/`
- `/unlock-growth-why-affordable-websites-for-small-businesses-are-essential/`
- `/unlock-local-supremacy-effective-seo-digital-marketing-australian-brands/`
- `/unmasking-true-seo-price-australian-businesses-pay/`
- `/website-cost-calculator-how-much-does-this-website-cost-for-your-project/`
- `/what-are-effective-ways-to-make-websites-accessible-for-visually-impaired-users/`
- `/what-is-freelance-seo-mate-aussie-guide-to-unlocking-digital-success/`
- `/why-analyze-ab-testing-results-for-website-optimization/`
- `/why-sage-green-websites-trending-down-under-australian-guide/`
- `/why-your-digital-agency-needs-white-label-seo-game-changer-local-growth/`

## Publication and rollback

After scope approval, reconcile current main, rerun all checks, publish a fast-forward commit and verify the exact remote SHA. Both existing Cloudflare Pages and the routing Worker must deploy because the Worker sitemap consumes the date manifest. Verify CI plus permitted targeted live checks, reporting any remaining access limitations. Rollback is a revert of this batch and redeployment of those existing components. Do not change DNS or remove WordPress.
