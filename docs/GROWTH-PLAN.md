# CodeMax: organic search and client acquisition

Audit date: 28 September 2026. All actions below use existing/free services unless separately approved. This is a working plan, not a promise of rankings or leads.

## Evidence and limits

The redesigned homepage and six service pages have unique metadata, one H1, canonical production URLs, business/service structured data and a separate studio sitemap. The original WordPress blogs and sitemaps remain on their existing origin. The owner reports that the site, contact email and sitemap submission work.

Search Console was inspected for `sc-domain:codemax.com.au` on 28 September 2026. For the selected 3-month period it showed 26 clicks, 15.5K impressions, 0.2% CTR and average position 46.2. These are property-wide figures, not rankings for one target keyword. The homepage is indexed. The live test for `/services/web-design-melbourne/` said it is available and can be indexed and found valid breadcrumb data; an indexing request was submitted, but its completion is not verified. The submitted `/studio-sitemap.xml` report said “Sitemap could not be read” and 0 discovered pages, although the URL inspection live test said the URL was available. A direct browser fetch of the sitemap did not complete, so the precise fetch/parsing cause is unconfirmed.

Page indexing showed 658 not indexed and 52 indexed: 132 excluded by noindex, 10 not found (404), 3 redirects, 1 other 4xx, 292 discovered but not indexed, and 220 crawled but not indexed. Some exclusions may be expected WordPress archives, old pages or utility URLs; examples have not yet been reviewed, so do not bulk remove them or request indexing for all. Core Web Vitals showed no data. A performance sample showed the query “secret websites to make money australia” generated 17 of 26 clicks (421 impressions), while “wordpress developer melbourne” had 859 impressions and zero clicks. This suggests CodeMax receives substantial irrelevant traffic and should sharpen relevant intent. Security/manual-action detail was not available to inspect. Search-result samples are not a rank-tracking report.

## Completed in this pass

- Expanded web-design buying guidance: cost factors, scope, brief, local relevance, retaining domain/email and SEO expectations.
- Added a factual example of CodeMax's own redesign and retained WordPress articles; no invented client results.
- Expanded maintenance and website-review briefs.
- Connected each service enquiry to its matching form selection, with a working ordinary link as fallback.
- Made primary homepage contact links point directly to the form in the delivered HTML.
- Linked service pages to existing mobile/local SEO articles.
- Added a logo for social sharing metadata.
- Added a repeatable generated-page SEO check, alongside the existing contact/router tests.
- Changed the production router to return `/studio-sitemap.xml` directly as XML rather than fetching a second host. This addresses the reported sitemap read failure; production deployment and the next Google read remain to be verified.

## Competitors observed

These are examples of positioning, not verified rank order or independently validated business claims.

| Site | What it presents | CodeMax opportunity |
| --- | --- | --- |
| https://www.chromatix.com.au/ | Case studies, quantified results, reviews, specialist positioning | Publish permission-backed project stories with actual before/after evidence |
| https://www.havealook.com.au/melbourne-website-design | Starting price and inclusion questions | Publish one confirmed package with inclusions, exclusions and ongoing costs |
| https://confettidesign.com.au/ | Small-business specialism and platform/service focus | Make the target customer and project fit explicit |
| https://shopfrontstudio.com.au/melbourne/ | Website audit enquiry offer and scope/pricing | Consider a tightly limited initial website review offer once capacity is confirmed |

## Keyword focus

No search-volume or difficulty figures were available. Priorities below are hypotheses based on service fit, not measured demand. Avoid producing near-identical suburb pages.

| Page | Search intent | Priority |
| --- | --- | --- |
| Homepage | CodeMax; web design Malvern East; Melbourne web design studio | Brand and local relevance |
| /services/web-design-melbourne/ | small business web design Melbourne; website redesign Melbourne; affordable web design Melbourne | Main sales page |
| /services/website-maintenance-melbourne/ | website maintenance Melbourne; website support Melbourne | Recurring service enquiries |
| /services/website-analysis-melbourne/ | website audit Melbourne; website review Melbourne | Review enquiries |
| /services/seo-content-melbourne/ | SEO content writing Melbourne; website copywriting Melbourne | Secondary sales page |
| Existing WordPress articles | Their actual Search Console queries | Preserve URLs; improve pages already earning impressions |

## Next 30 days

1. Establish the baseline in Search Console: last 3 months, Australia, device split, queries/pages, branded vs non-branded; record clicks, impressions, CTR and average position. Inspect the homepage and main web-design service with the live URL test. Check manual actions, security issues and both sitemap results.
2. Check Google Business Profile ownership, category, accurate contact information, service area, website link, photos and services. Do not create a duplicate profile or represent an unstaffed location as a public office. Collect the current profile link and inspect its actual state before edits.
3. Publish one clear, confirmed offer. Draft structure: who it suits, page allowance, design/revisions, content responsibilities, contact form, basic SEO, initial price, recurring costs, GST treatment, ownership and exclusions. Historical pricing is not assumed current.
4. Create two genuine case studies with permission: business problem, delivered scope, live site, screenshots, and measured outcomes only where available. Label internal projects as internal projects. A portfolio mockup is not evidence of a delivered client website.
5. Improve existing WordPress articles with relevant links to new services. First prioritise pages with impressions and positions close to page one; preserve URLs, useful content and existing links. Requires WordPress access.
6. Ask actual completed-project customers for honest reviews through the genuine Google review link. No incentives or review gating. Draft requests first; sending needs explicit recipient/campaign authorization.
7. Prepare a small prospect list of local businesses with observable website problems. For each record: public business URL, factual issue, relevant CodeMax service, a tailored suggestion and next action. No automated bulk messaging. Outreach requires explicit authorization and applicable channel/consent review.
8. Develop referral partnerships with photographers, printers and bookkeepers who already serve small businesses. Prepare materials; do not send messages without authorization.
9. Review qualified enquiries and booked work alongside search data. Search position alone is not the business outcome. Compare equivalent time windows and log each content change.

## Offers to consider, not yet published

- A short initial website review focused on three actionable issues, with a defined capacity and no invented turnaround guarantee.
- A new-website package for small service businesses, with optional maintenance.
- A redesign package that plans for existing blog URLs and email continuity.
- Website plus photography as a differentiated offer, if scope, availability and pricing are confirmed.

## Operating boundaries

No new paid subscriptions, ad spend, fabricated reviews, backlink purchases or mass-generated location pages. No client messages sent in this pass. No recurring monitoring has been scheduled. I can implement repository work and prepare content here; account-specific work requires the relevant authenticated access. This plan does not mean ongoing actions happen after the conversation ends.

## Verification

Production build: passed. Contact/router tests: 28 passed, including the direct production sitemap response (provider delivery remains mocked). Generated-page SEO check: passed for all 7 studio URLs. Search Console live-tested the main web-design service page and confirmed it can be indexed; the sitemap fetch status remains unresolved until deployment and a new Google read. Deployment completion, mobile Core Web Vitals and visual page quality still need independent live checks.

## Sources

- Google SEO Starter Guide: https://developers.google.com/search/docs/fundamentals/seo-starter-guide
- Google local ranking guidance: https://support.google.com/business/answer/7091?hl=en
- Google ranking-guarantee guidance: https://developers.google.com/search/docs/fundamentals/do-i-need-seo

Google explicitly says first-place ranking cannot be guaranteed. Local visibility depends on relevance, distance and prominence; a sitemap submission alone does not establish indexing or rank.
