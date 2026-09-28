# CodeMax SEO audit and implementation
Date: 28 September 2026
Scope: public website review and repository improvements. No Search Console, GA4, keyword-volume, backlink or paid rank-tracking access was available. No numerical SEO score or ranking guarantee is claimed.

## Main finding
The Astro site had crawlable HTML, image alt text, responsive CSS and a working enquiry form, but only one landing page. Missing canonical, sitemap, robots.txt, detailed service pages and direct article links limited its structure. Launch update: a Cloudflare Worker now routes the homepage and six service pages to the new Pages deployment, while the existing WordPress blog and its URLs stay on Bluehost. See GROWTH-PLAN.md for the latest audit, evidence and access limits.

## Competitor comparison
These are observed examples, not a ranked list or a complete market sample.
| Competitor | Observed strength | CodeMax response |
| --- | --- | --- |
| Ascend Web Design | Separate service pages, published pricing, scope factors and pricing FAQs | Added service scope and cost-factor answers. Do not publish a price until CodeMax confirms current inclusions, GST and terms. |
| LM Web Design | A dedicated small-business package page explains inclusions, ownership, exclusions and ongoing costs | Added buying questions and clearer service explanations. A confirmed CodeMax package would make the offer easier to compare. |
| Confetti Design | Dedicated service pages, named founder, linked project examples and attributed testimonials | Retained CodeMax founder and portfolio, added service routes. Client outcomes and reviews need real evidence and permission. |
| Site Works | Local small-business positioning | Strengthened Melbourne and Malvern East context without mass-produced suburb pages. |

## Keyword-to-page map
Priorities are editorial judgements based on service fit and competitor/search-result language, not measured search volume or difficulty. Confirm demand and actual impressions with Search Console and Keyword Planner.
| Page | Primary intent | Related terms |
| --- | --- | --- |
| / | web design Melbourne | small business websites Melbourne; web design Malvern East; Melbourne web design studio |
| /services/web-design-melbourne/ | small business web design Melbourne | website redesign Melbourne; responsive website design; affordable web design Melbourne |
| /services/seo-content-melbourne/ | SEO content writing Melbourne | SEO article writing; website content writing; web marketing |
| /services/website-maintenance-melbourne/ | website maintenance Melbourne | website support; website updates; hosting and maintenance |
| /services/graphic-design-melbourne/ | graphic design Melbourne | business graphics; brand visuals; marketing graphics |
| /services/social-media-design-melbourne/ | social media design Melbourne | social media kit; branded content; reels |
| /services/website-analysis-melbourne/ | website analysis Melbourne | competitor website analysis; website review |

The home page targets broad agency discovery; the web-design page explains the specific service. Monitor query overlap rather than repeatedly adding the same city keyword. Do not add “cheapest”, “best”, guaranteed rankings, fake reviews or unconfirmed delivery promises.

## Implemented
- Shared SEO component: unique titles/descriptions, absolute production canonicals, Open Graph/Twitter text metadata and font connection hints.
- ProfessionalService, WebSite and WebPage JSON-LD using existing public business details; service pages also have Service and BreadcrumbList data. No invented ratings or hours.
- Six static service routes with distinct content, scope, FAQs, visible breadcrumbs and related links.
- Visible descriptive label in the homepage H1 while retaining the VISIBLE design.
- Natural local-service content, pricing-factor FAQ, support and migration FAQs.
- Homepage service titles and arrow links point to service pages.
- Three blog cards point to their actual, unchanged WordPress article URLs.
- sitemap.xml contains seven canonical HTML routes; robots.txt references it.
- 404 page has noindex; no catch-all homepage rewrite.
- Vercel-hosted addresses receive X-Robots-Tag: noindex, follow; custom production domain is excluded from that rule. Robots crawling stays allowed so crawlers can read noindex.
- Trailing slashes are consistent across generated routes, links and Vercel redirects.
- Font stylesheet is discovered directly in the HTML instead of through a CSS import; images retain lazy loading and gain async decoding.
- No changes to contact delivery, Turnstile or DNS.

## Existing blog findings
The public WordPress API and sitemap requests returned HTTP 406 from this environment, so a full URL/content inventory could not be retrieved. Search retrieval exposed the blog and sampled articles.
- The mobile-SEO article contains a long image-generation-style alt description and several unsupported or undated statistical/SEO claims. Review these with primary evidence, replace image alt text with a short factual description, and avoid claims that guarantee traffic or ranking benefits.
- The local-search article repeats numbered sections in its contents/body and uses older Google My Business terminology. Consolidate duplication and update terminology when editing WordPress.
- Several commercial anchor links point readers to other SEO agencies. Review the editorial purpose of each link; replace self-service links with relevant CodeMax service links where appropriate. Do not remove useful sources just because they are external.
- Preserve article URLs, authorship and original publication dates. Only change modification dates after real updates.

## Launch blocker: preserve existing URLs before changing DNS
The redesign is NOT ready to replace WordPress wholesale yet. The six service routes are available on Vercel for review, while canonical production equivalents will be available only after the domain launch.
1. Export all WordPress posts/pages, media URLs, sitemap URLs and Search Console landing pages.
2. Build a complete old URL to destination inventory, including /blog/, archives, service/about/contact pages, images and PDFs.
3. Keep existing blog slugs serving their full content with HTTP 200. Where a URL genuinely changes, use a specific permanent redirect to its closest equivalent. Do not redirect every old URL to the homepage.
4. Migrate or retain the current /wp-content/uploads/ assets; the portfolio still references them.
5. Include migrated blog/service routes in the new sitemap only once they actually exist.
6. Validate article content, canonical URLs, image requests, redirects and contact delivery before switching codemax.com.au.
7. Confirm the custom domain has no noindex header, select one www/apex canonical host and redirect the other.
8. Submit the production sitemap in Search Console after launch. Monitor indexing, 404s, impressions, clicks and enquiries over the following weeks.

## Remaining work requiring real business/account data
- Confirm current prices, GST treatment, deliverables, turnaround and maintenance terms before publishing a package page.
- Add permissioned client case studies with problem, work completed, screenshots and substantiated outcomes. Existing portfolio pictures alone are not evidence of client results.
- Check Google Business Profile eligibility, category and name/address/phone consistency. Do not create extra location profiles without real eligibility.
- Connect Search Console and analytics with the user's accounts. Track successful enquiry submissions rather than button clicks.
- Measure mobile/desktop performance with PageSpeed Insights and real Core Web Vitals data. No Lighthouse score or field performance claim was made in this audit.
- Optimise and migrate original portfolio images after media access is available.
- Social sharing metadata is text-only for now; a brand-approved raster sharing image can be added later.
- Review privacy information for form data handling with the business.

## Sources reviewed
- Google SEO Starter Guide: https://developers.google.com/search/docs/fundamentals/seo-starter-guide
- Google migration guidance: https://developers.google.com/search/docs/crawling-indexing/site-move-with-url-changes
- Google noindex guidance: https://developers.google.com/search/docs/crawling-indexing/block-indexing
- Vercel noindex headers: https://vercel.com/kb/guide/are-vercel-preview-deployment-indexed-by-search-engines
- https://ascendwebdesign.com.au/pricing/
- https://lmwebdesign.com.au/small-business-website-package/
- https://confettidesign.com.au/
- https://www.siteworksdev.au/
- https://codemax.com.au/blog/
- https://codemax.com.au/dont-miss-out-crucial-mobile-seo-services-australian-website-needs/
- https://codemax.com.au/outrank-rivals-smart-aussie-guide-local-search-engine-optimisation/

## Validation
Astro production build passed. Checked all eight generated HTML pages for unique titles, descriptions and canonical URLs, one H1 each, parseable JSON-LD and valid internal page links. Checked image alt/dimension attributes, the seven-entry sitemap and three distinct article destinations. Full device-browser visual QA, Google Rich Results Test and field Core Web Vitals were not performed.
