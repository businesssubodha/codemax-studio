# CodeMax daily article series

20 complete posts for Melbourne small business website buyers and owners. Researched on 30 September 2026.

## Publication calendar

Target: one article per day from 1–20 October 2026, eligible for publication after 9 am Australia/Sydney. GitHub checks at 09:07 local time, with a second UTC-offset check for daylight saving. Queue delays and website deployment can make the live time later. No new paid service is required.

| Date | Complete draft | Primary keyword |
| --- | --- | --- |
| 2026-10-01 | [Will AI Search Find Your Business? A Practical Website Checklist](01-ai-search-readiness-checklist-small-business.md) | AI search optimisation for small business |
| 2026-10-02 | [Two Website Quotes, Two Very Different Prices: What to Compare](02-compare-website-quotes-australia-scope.md) | compare website quotes Melbourne |
| 2026-10-03 | [Your Website Gets Visits. Is the Enquiry Form Losing Customers?](03-small-business-website-enquiry-form-checklist.md) | small business website enquiry form |
| 2026-10-04 | [Google Business Profile and Your Website: Fix These 6 Mismatches](04-google-business-profile-website-consistency-check.md) | Google Business Profile website consistency |
| 2026-10-05 | [Do You Need a 100 PageSpeed Score? What to Fix First](05-pagespeed-100-business-website-priorities.md) | PageSpeed score small business website |
| 2026-10-06 | [AI Website Builder or Custom Design? Try This Decision Test](06-ai-website-builder-or-custom-website-decision.md) | AI website builder vs custom website |
| 2026-10-07 | [The Form Says “Sent”, but No Email Arrives: A Troubleshooting Guide](07-contact-form-success-message-no-email.md) | website contact form not sending email |
| 2026-10-08 | [Before the Holiday Rush: A Website and Booking Checklist](08-website-holiday-hours-booking-checklist.md) | holiday website checklist small business |
| 2026-10-09 | [Who Controls Your Website? The Handover Checklist Owners Need](09-website-ownership-handover-checklist.md) | website handover checklist Australia |
| 2026-10-10 | [Skip the Generic Stock Photo: A 12-Shot List for Your Business Website](10-business-website-photo-shot-list.md) | business website photography shot list |
| 2026-10-11 | [Can Everyone Use Your Contact Form? A 10-Minute Accessibility Check](11-website-contact-form-accessibility-check.md) | contact form accessibility checklist |
| 2026-10-12 | [Landing Page or Full Website? Choose Around the Customer’s Decision](12-landing-page-or-full-website-service-business.md) | landing page vs website service business |
| 2026-10-13 | [Paying for Website Maintenance? Ask for These 5 Proof Points](13-website-maintenance-report-what-to-ask.md) | website maintenance report checklist |
| 2026-10-14 | [Your Website Has Traffic. How Many Real Enquiries Does It Generate?](14-measure-website-leads-beyond-pageviews.md) | track website enquiries GA4 |
| 2026-10-15 | [Should You Create a Page for Every Suburb? A Better Local Content Test](15-suburb-pages-local-business-useful-content.md) | suburb pages local SEO |

| 2026-10-16 | [Free Website Hosting: What Does Your Business Still Need to Pay For?](16-free-website-hosting-business-fit.md) | free website hosting |
| 2026-10-17 | [Website Templates: 7 Tests Before You Buy the Pretty Demo](17-website-templates-test-before-buying.md) | website templates |
| 2026-10-18 | [Can Customers Use Your Website? 5 Tasks That Reveal the Gaps](18-small-business-website-user-testing-tasks.md) | user testing |
| 2026-10-19 | [Searching “Website Designer Near Me”? How to Build a Melbourne Shortlist](19-website-designer-near-me-shortlist-melbourne.md) | website designer near me |
| 2026-10-20 | [Planning a WordPress Website? Write This Content Brief First](20-wordpress-website-content-workflow-brief.md) | wordpress website |

## Research and editorial choices

The first 15 keyword targets are based on service relevance, the existing article inventory and current official guidance. The five additional posts use the supplied Keyword Stats 2026-09-30 at 10_22_48.csv export, covering September 2025–August 2026. See [keyword research notes](keyword-export-september-2026.md). These are not claims about organic ranking difficulty or guaranteed traffic. AI search is the current-topic strand; the other articles answer practical buying, maintenance and enquiry questions.

Sources include Google Search Central, business.gov.au, W3C, web.dev, Google Analytics, Cloudflare, Resend and the Australian Cyber Security Centre. Each article links its relevant sources. Four original diagrams explain quote comparison, enquiry handling, email delivery and lead measurement.

Each post has a distinct URL, SEO title, description, a CodeMax service link and an enquiry link. Existing imported article URLs are preserved. The new pages do not claim client results or promise rankings.

## How daily publishing works

`content/queue` contains the approved series. The GitHub workflow runs the release script, publishes at most one due article per Melbourne calendar day, builds the site, checks SEO output and commits only the published content and route manifest. Cloudflare receives that commit through its existing Git integration. The blog archive, article routing and sitemap update with each release.

If a run is missed, the next successful day publishes the oldest due article rather than releasing several at once. Manual workflow runs obey the same date and once-a-day rules. Once all 20 are published, no further content is released. Disable the **Daily CodeMax article** workflow to pause the series.

## Verification

The release tests cover the starting date, before-9am protection, Melbourne daylight saving, duplicate URLs and one-post-per-day behaviour. A complete-series build also checks every article's canonical, metadata, schema, sitemap inclusion and local image routing.
