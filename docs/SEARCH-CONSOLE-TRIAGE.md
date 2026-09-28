# Search Console URL triage (29 September 2026)

The provided “Discovered – currently not indexed” export lists 292 unique URLs, all with `N/A` as the last crawl date. Compared with the WordPress export and the new site's route manifest:

| URLs | Classification | Action |
| ---: | --- | --- |
| 260 | Published articles imported at their original paths | Live, self-canonical, linked from the paginated blog, in the studio sitemap. Await Google crawl and reassess. |
| 24 | WordPress category archives | WordPress still serves them. Review individual value and crawl status before deciding whether to keep indexable. |
| 2 | Elementor template query URLs | Internal WordPress URLs; not article targets. |
| 6 | Other WordPress paths | Privacy policy, old 404 page and four plugin/template paths; review individually. |

The separate list of tag and author archive URLs consists of taxonomy/author listings rather than additional posts. The live `/tag/local-seo/` page advertises `follow, noindex`, which explains why it is excluded. Its articles have been imported separately. A sampled `/category/user-experience/` page currently advertises `follow, index`; category handling should be decided separately from article indexing.

Two retired 404 URLs have clear, live replacements and receive permanent redirects in the production router:

- `/modern-website-redesign-boost-business-drive-growth/` → `/website-redesign-drives-growth/`
- `/web-design/` → `/services/web-design-melbourne/`

The other old 404 examples lack verified equivalent content in the supplied WordPress export. Keep them as 404 until an appropriate destination is confirmed. Do not redirect them all to the homepage. `/wp-json/elementskit/v1/` and `/wp-content/plugins/*` are WordPress system paths, not pages to index.

Search Console counts are based on Google's previous crawl and will not update at deployment time. A sitemap helps discovery but does not guarantee indexing. Follow up with URL Inspection samples from the 260 articles and check that Google fetches the production studio sitemap and sees the canonical URL.
