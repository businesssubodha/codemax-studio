# Import CodeMax articles into the redesigned website

The live site now uses a Cloudflare Worker to serve the homepage and six service pages from the new Astro site while the old WordPress installation continues serving everything else. The imported-article path extends that same arrangement: each published post is generated on Astro at its existing canonical URL, and the Worker sends only those exact imported article paths to Astro. WordPress remains available for its dashboard, media files, feeds and non-imported routes.

## Import completed locally — 28 September 2026

Imported 382 public published posts from the supplied WordPress WXR export. The 27 scheduled posts and 9 drafts were excluded. Eight original WordPress pages remain served by WordPress unless already replaced by the studio homepage or blog archive. Private form entries, author email addresses, comments and plugin settings are not part of the published data.

The archive has 32 pages of 12 articles (last page has fewer). Original article paths are unchanged. The production router reads a small URL manifest rather than bundling all article HTML. The 421-entry studio sitemap contains articles, archive pages, homepage and six services.

The importer preserves article content and media URLs, maps original H1 headings to H2 under the page H1, converts YouTube embeds to safe outbound video links and resolves Markdown links. Four metadata overrides remove duplicate titles/descriptions. Topic overlap selects related articles. Featured image metadata is retained for 380 posts.

Validation: static build, metadata/canonical/schema checks for all 421 URLs, importer regression tests and Worker routing/contact tests. External media could not be exhaustively verified from the build environment; it returned access errors for public URLs. Keep WordPress/Bluehost hosting active. This is a technical migration, not a factual audit of every claim in the source articles. Search Console indexing remains Google's decision.

For future imports, run `npm run import:wordpress -- /path/to/export.xml`, then `npm run build`, `npm run check:seo`, `npm run test:import` and Worker tests. The source XML stays outside the repository. Metadata edits live in `src/data/blog-seo-overrides.json` and are applied on import.

## What the import preserves and changes

- Keeps each original article path, title, publication date, author name, categories, useful SEO metadata and readable article content.
- Sanitises unsafe HTML and reports removed embeds, missing image alt text and other content that needs review.
- Keeps WordPress media URLs on the existing WordPress origin. Keep the current WordPress hosting active for image and file requests until media has been migrated and checked.
- Adds every imported article to the new site sitemap, includes its modification date where available, and adds that sitemap to the live `robots.txt` while preserving the existing WordPress rules and sitemap reference.
- Routes only known imported article paths to Astro. All other WordPress URLs continue to the existing WordPress origin.

## Before publishing the imported articles

The importer produces an inventory. Review every article warning, duplicate or reserved path, image URL, missing image alt and shortcode. Compare the URL list against Search Console and both WordPress sitemaps. Check that every imported path builds as a static page, returns 200, has a self-referencing canonical and appears in both the production router and sitemap. Then inspect representative desktop/mobile pages and test internal links and images.

The new XML sitemap helps Google discover the pages; it does not force indexing. Google may choose not to index duplicate, low-value or thin pages, and `noindex`, 404 and redirected URLs require their own corrections. Preserve useful article content and existing backlinks; do not mass-redirect articles to the homepage.

No DNS change is part of this migration. The production domain remains on the existing hybrid router, and WordPress remains available for content management and assets.
