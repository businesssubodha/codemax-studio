# Import CodeMax articles into the redesigned website

The live site now uses a Cloudflare Worker to serve the homepage and six service pages from the new Astro site while the old WordPress installation continues serving everything else. The imported-article path extends that same arrangement: each published post is generated on Astro at its existing canonical URL, and the Worker sends only those exact imported article paths to Astro. WordPress remains available for its dashboard, media files, feeds and non-imported routes.

## Source export required

The public WordPress REST API, feed and sitemap endpoints are returning inaccessible responses in this environment. No WordPress export is present in the repository. To import the posts without guessing content or URLs, export them from WordPress:

1. Open **Tools → Export** in the CodeMax WordPress dashboard.
2. Choose **All content** and download the WordPress `.xml` export.
3. Attach that `.xml` file in this chat.

The importer only writes published, public, non-password-protected posts. It does not publish drafts, comments, private metadata, author email addresses or attachment records. Pages and other post types are listed for review rather than silently imported.

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
